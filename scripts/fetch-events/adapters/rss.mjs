import Parser from 'rss-parser';
import { stableAutoId } from '../lib/id.mjs';
import { buildEvent } from '../lib/normalize.mjs';
import { categorizeEvent } from '../lib/categorize.mjs';
import { extractLabeledFields, splitTimeRange } from '../lib/text-fields.mjs';
import { parseHumanDate, parseHumanTime } from '../lib/text-datetime.mjs';
import { dateRangeInclusive, ymdToUtcMs } from '../lib/daterange.mjs';
import { formatWhen } from '../lib/format.mjs';
import { fetchTextWithTimeout, sanitizeXmlEntities } from '../lib/with-timeout.mjs';
import { htmlToText } from '../lib/html-text.mjs';
import { faviconLogoFor } from '../lib/logo.mjs';

// IMPORTANTE - este adaptador é mais frágil do que o ical.mjs, avisadamente.
//
// RSS não tem campos estruturados de data/hora como o iCal (DTSTART/DTEND) -
// dá-nos título + um bocado de HTML do post. Sites como o do IST escrevem a
// data dentro desse HTML ("Date: October 16, 2025" / "Time: 4:00 p.m. - 5:00
// p.m." / "Location: X"), e é isso que tentamos "ler" depois de converter o
// HTML em texto (ver lib/html-text.mjs - sem isto, tags tipo <br /> colavam-se
// ao valor extraído, como se viu num teste real contra o feed do IST).
// Sempre que não conseguirmos reconhecer uma data, ignoramos o item (com
// aviso) em vez de arriscar.
const ALL_DAY_START = '09:00';
const ALL_DAY_END = '19:00';

const parser = new Parser({
    customFields: {
        item: [
            ['content:encoded', 'contentEncoded'],
            ['media:content', 'mediaContent'],
            ['media:thumbnail', 'mediaThumbnail'],
        ],
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
        feed = await parser.parseString(sanitizeXmlEntities(xmlText));
    } catch (err) {
        console.warn(`[rss:${name}] falhou a obter "${url}": ${err.message}`);
        return events;
    }

    for (const item of feed.items || []) {
        const sourceId = item.guid || item.link || item.title;

        // a data de publicação do post é a melhor pista para adivinhar o
        // ano quando o texto do evento não o diz (ex: "19 September") -
        // muito melhor do que assumir o ano em que o pipeline por acaso
        // está a correr, que pode ser meses depois de o post ter sido escrito
        const referenceDate = parsePubDate(item) || new Date();

        const rawHtml = [item.title, item.contentEncoded, item.content, item.summary]
            .filter(Boolean)
            .join('\n');
        const fullText = htmlToText(rawHtml);

        const fields = extractLabeledFields(fullText);

        if (!fields.date) {
            console.warn(
                `[rss:${name}] sem "Date"/"Data de início" reconhecível em "${item.title}" - a ignorar (${item.link})`
            );
            continue;
        }

        const startDateParts = parseHumanDate(fields.date, referenceDate);
        if (!startDateParts) {
            console.warn(
                `[rss:${name}] não consegui interpretar a data "${fields.date}" em "${item.title}" - a ignorar`
            );
            continue;
        }

        const endDateParts = fields.endDate ? parseHumanDate(fields.endDate, referenceDate) : null;

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
        const description = htmlToText(item.contentEncoded || item.content || item.summary || '');
        const imageUrl = extractImageUrl(item);
        const logoUrl = faviconLogoFor(item.link || url);

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
                    imageUrl,
                    logoUrl,
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

function parsePubDate(item) {
    const raw = item.isoDate || item.pubDate;
    if (!raw) return null;
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
}

// Tenta várias formas conhecidas de um RSS trazer uma imagem, da mais fiável
// para a menos: campos de media dedicados primeiro, e só como último recurso
// a primeira <img> lá encontrada dentro do texto do post (mais frágil, pode
// apanhar um ícone decorativo em vez da imagem principal, mas é melhor do
// que não ter imagem nenhuma). NÃO testei isto contra um feed real do IST
// (só tinha o HTML da página, não o XML do feed, quando construí isto) -
// se vier sempre vazio, digam-me e eu ajusto com base num feed real.
function extractImageUrl(item) {
    const mediaUrl = item.mediaContent?.$?.url || item.mediaThumbnail?.$?.url;
    if (mediaUrl) return mediaUrl;

    if (item.enclosure?.url && /^image\//.test(item.enclosure.type || '')) {
        return item.enclosure.url;
    }

    const html = item.contentEncoded || item.content || item.summary || '';
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return match ? match[1] : null;
}

function addOneHour(hm) {
    const [h, m] = hm.split(':').map(Number);
    return `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
