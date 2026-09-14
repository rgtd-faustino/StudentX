import ical from 'node-ical';
import { stableAutoId } from '../lib/id.mjs';
import { buildEvent } from '../lib/normalize.mjs';
import { categorizeEvent } from '../lib/categorize.mjs';
import { toLisbonDayMonthYear, toLisbonHM } from '../lib/timezone.mjs';
import { dateRangeInclusive, ymdToUtcMs } from '../lib/daterange.mjs';
import { formatWhen } from '../lib/format.mjs';
import { fetchTextWithTimeout } from '../lib/with-timeout.mjs';
import { faviconLogoFor } from '../lib/logo.mjs';

// Eventos de dia inteiro (VALUE=DATE, ex: um congresso "24-26 de setembro")
// não têm hora real - o node-ical devolve-os como meia-noite UTC, o que sem
// tratamento especial gerava horários sem sentido tipo "00:00 - 00:00" ou,
// dependendo da hora de verão, "01:00 - 01:00". Usamos este intervalo como
// aproximação razoável de "o dia todo", já que o site não tem um conceito
// separado de "evento sem hora marcada".
const ALL_DAY_START = '09:00';
const ALL_DAY_END = '19:00';

// Muitas páginas de eventos de faculdades/associações em Portugal usam o
// plugin WordPress "The Events Calendar", que expõe sempre um feed em
// <url-da-pagina-de-eventos>?ical=1 - é reconhecível pelo rodapé com os
// links "Subscrever o calendário / iCalendar / Exportar ficheiro .ics".
// Isso é o que torna esta fonte tão reutilizável: uma vez identificada uma
// página assim, basta acrescentar `?ical=1` e configurá-la aqui.

export async function fetchIcalSource(source) {
    const { name, url, colorOfEvent: hint, placeName } = source;
    const events = [];

    if (!url || !name) {
        console.warn('[ical] entrada em sources.json sem "name"/"url" válidos - a ignorar', source);
        return events;
    }

    let data;
    try {
        const icsText = await fetchTextWithTimeout(url, 15_000);
        data = ical.parseICS(icsText);
    } catch (err) {
        console.warn(`[ical:${name}] falhou a obter "${url}": ${err.message}`);
        return events;
    }

    for (const key of Object.keys(data)) {
        const comp = data[key];
        if (comp.type !== 'VEVENT' || !comp.start) continue;

        // eventos recorrentes (RRULE) - node-ical expande-os para nós em
        // comp.rrule; para já ignoramos ocorrências recorrentes complexas e
        // ficamos só com a primeira data, para não sobrecarregar o calendário
        // com repetições infinitas. Fica como possível melhoria futura.
        const start = comp.start;
        const end = comp.end || comp.start;
        const sourceId = comp.uid || key;
        const isAllDay = Boolean(start.dateOnly);

        const startTime = isAllDay ? ALL_DAY_START : toLisbonHM(start);
        const endTime = isAllDay ? ALL_DAY_END : toLisbonHM(end);
        const days = isAllDay ? expandAllDayRange(start, end) : expandTimedRange(start, end);

        if (days.length > 1) {
            console.log(
                `[ical:${name}] "${comp.summary}" ocupa ${days.length} dias - a repetir em cada um`
            );
        }

        // usamos o MESMO id em todos os dias do mesmo evento (é o mesmo evento
        // fisicamente) - isto também significa que aceitar/rejeitar num dia
        // já não volta a perguntar nos outros dias em que o evento decorre
        const id = stableAutoId(name, sourceId);

        for (const dayInfo of days) {
            events.push(
                buildEvent({
                    id,
                    day: dayInfo.day,
                    month: dayInfo.month,
                    year: dayInfo.year,
                    startTime,
                    endTime,
                    title: comp.summary,
                    subtitle: formatWhen(dayInfo, startTime, endTime),
                    description: comp.description,
                    place: placeName || name,
                    placeSubtitle: comp.location || '',
                    moreInfoLink: comp.url,
                    imageUrl: comp.attach?.val,
                    logoUrl: faviconLogoFor(comp.url || url),
                    colorOfEvent: categorizeEvent({
                        title: comp.summary,
                        description: comp.description,
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

// Datas "flutuantes" (VALUE=DATE) vêm do node-ical como meia-noite UTC.
// Usamos os componentes UTC diretamente (é a data tal como foi escrita na
// fonte, sem fuso horário à mistura) - converter para Europe/Lisbon aqui
// só introduziria o artefacto de, dependendo da hora de verão, o dia
// aparecer deslocado. DTEND em VALUE=DATE é exclusivo (RFC5545): o último
// dia realmente incluído é end - 1 dia.
function expandAllDayRange(start, end) {
    const first = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
    const last = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() - 1);
    return dateRangeInclusive(first, last);
}

// Eventos com hora marcada: se o fim cair num dia de Lisboa diferente do
// início (ex: um hackathon das 20h de sexta às 2h de sábado), mostramos o
// evento em ambos os dias.
function expandTimedRange(start, end) {
    const startParts = toLisbonDayMonthYear(start);
    const endParts = toLisbonDayMonthYear(end);
    const first = ymdToUtcMs(startParts.year, startParts.month, startParts.day);
    const last = ymdToUtcMs(endParts.year, endParts.month, endParts.day);
    return dateRangeInclusive(first, last);
}

