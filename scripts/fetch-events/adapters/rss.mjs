import Parser from 'rss-parser';
import { stableAutoId } from '../lib/id.mjs';
import { buildEvent } from '../lib/normalize.mjs';
import { categorizeEvent } from '../lib/categorize.mjs';
import { extractLabeledFields, splitTimeRange } from '../lib/text-fields.mjs';
import { parseHumanDate, parseHumanTime } from '../lib/text-datetime.mjs';
import { dateRangeInclusive, ymdToUtcMs } from '../lib/daterange.mjs';
import { formatWhen } from '../lib/format.mjs';
import { fetchTextWithTimeout } from '../lib/with-timeout.mjs';

// IMPORTANTE - este adaptador é mais frágil do que o ical.mjs, avisadamente.
//
// RSS não tem campos estruturados de data/hora como o iCal (DTSTART/DTEND) -
// dá-nos título + um bocado de texto/HTML do post. Sites como o do IST
// escrevem a data dentro desse texto ("Date: October 16, 2025 / Time: 4:00
// p.m. - 5:00 p.m. / Location: X"), e é isso que tentamos "ler". Construí
// isto a partir do HTML que vi numa página de eventos do IST - NUNCA vi um
// feed RSS real, porque o meu sandbox não tem acesso à internet em geral.
// Pode ser que a informação de data/hora nem sequer venha incluída no feed
// (pode ser um bloco só da página, fora do conteúdo do post) - só saberemos
// depois de testar com um feed a sério. Sempre que não conseguirmos
// reconhecer uma data, ignoramos o item (com aviso) em vez de arriscar.
const ALL_DAY_START = '09:00';
const ALL_DAY_END = '19:00';

const parser = new Parser({
    timeout: 15_000,
    customFields: {
        item: [['content:encoded', 'contentEncoded']],
    },
});

export async function fetchRssSource(source) {
    const { name, url, colorOfEvent: hint, placeName } = source;
    const events = [];

    if (!url || !name) {
        console.warn('[rss] entrada em sources.json sem "name"/"url" válidos - a ignorar', source);
        return events;
    }

    let feed;
    try {
        const xmlText = await fetchTextWithTimeout(url, 15_000);
        feed = await parser.parseString(xmlText);
    } catch (err) {
        console.warn(`[rss:${name}] falhou a obter "${url}": ${err.message}`);
        return events;
    }

    for (const item of feed.items || []) {
        const sourceId = item.guid || item.link || item.title;
        const fullText = [item.title, item.contentEncoded, item.content, item.contentSnippet, item.summary]
            .filter(Boolean)
            .join('\n');

        const fields = extractLabeledFields(fullText);

        if (!fields.date) {
            console.warn(
                `[rss:${name}] sem "Date"/"Data de início" reconhecível em "${item.title}" - a ignorar (${item.link})`
            );
            continue;
        }

        const startDateParts = parseHumanDate(fields.date);
        if (!startDateParts) {
            console.warn(
                `[rss:${name}] não consegui interpretar a data "${fields.date}" em "${item.title}" - a ignorar`
            );
            continue;
        }

        const endDateParts = fields.endDate ? parseHumanDate(fields.endDate) : null;

        const [startTimeRaw, endTimeFromRange] = splitTimeRange(fields.time);
        const parsedStartTime = parseHumanTime(startTimeRaw);
        const startTime = parsedStartTime || ALL_DAY_START;
        const endTime =
            parseHumanTime(fields.endTimeLabeled) ||
            parseHumanTime(endTimeFromRange) ||
            (parsedStartTime ? addOneHour(parsedStartTime) : ALL_DAY_END);

        const first = ymdToUtcMs(startDateParts.year, startDateParts.month, startDateParts.day);
        const last = endDateParts
            ? ymdToUtcMs(endDateParts.year, endDateParts.month, endDateParts.day)
            : first;
        const days = dateRangeInclusive(first, last);

        if (days.length > 1) {
            console.log(`[rss:${name}] "${item.title}" ocupa ${days.length} dias - a repetir em cada um`);
        }

        const id = stableAutoId(name, sourceId);
        const description = stripHtml(item.contentEncoded || item.content || item.summary || '');

        for (const dayInfo of days) {
            events.push(
                buildEvent({
                    id,
                    day: dayInfo.day,
                    month: dayInfo.month,
                    year: dayInfo.year,
                    startTime,
                    endTime,
                    title: item.title,
                    subtitle: formatWhen(dayInfo, startTime, endTime),
                    description,
                    place: placeName || name,
                    placeSubtitle: fields.location || '',
                    moreInfoLink: item.link,
                    colorOfEvent: categorizeEvent({
                        title: item.title,
                        description,
                        sourceCategoryHint: hint,
                    }),
                    source: name,
                    sourceId,
                    sourceUrl: url,
                })
            );
        }
    }

    return events;
}

function addOneHour(hm) {
    const [h, m] = hm.split(':').map(Number);
    return `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function stripHtml(html) {
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
