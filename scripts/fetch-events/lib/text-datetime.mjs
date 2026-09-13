// Sites como o do IST não têm um feed iCal - são posts de blogue (RSS) onde
// a data/hora/local do evento vêm escritas em texto dentro do próprio post
// (ex: "Date: October 16, 2025" / "Time: 4:00 p.m. - 5:00 p.m."), em vez de
// campos estruturados tipo DTSTART. Este ficheiro faz esse "text mining".
//
// É inevitavelmente mais frágil do que ler um DTSTART de um iCal - depende
// do texto estar escrito de forma parecida ao que vimos nos exemplos reais.
// Sempre que não conseguir reconhecer o formato, devolve null em vez de
// arriscar uma data errada - ver adapters/rss.mjs, que ignora e avisa
// nesses casos em vez de inventar.

const MONTHS = {
    // inglês
    january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3, april: 4, apr: 4,
    may: 5, june: 6, jun: 6, july: 7, jul: 7, august: 8, aug: 8,
    september: 9, sep: 9, sept: 9, october: 10, oct: 10, november: 11, nov: 11,
    december: 12, dec: 12,
    // português (com e sem acento, por segurança de encoding)
    janeiro: 1, fevereiro: 2, março: 3, marco: 3, abril: 4, maio: 5, junho: 6,
    julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

const MONTH_NAME_RE = Object.keys(MONTHS).sort((a, b) => b.length - a.length).join('|');

// Formatos que reconhecemos, por ordem de tentativa:
//  "16 October 2025" / "16 outubro 2025" / "09 outubro, 2024"
//  "October 16, 2025" / "October 16 2025"
//  "Thursday, 16 October 2025" / "quarta-feira, 09 outubro 2024" (o dia da semana é ignorado - recalculamos)
const DAY_MONTH_YEAR_RE = new RegExp(
    `\\b(\\d{1,2})\\s+(?:de\\s+)?(${MONTH_NAME_RE})[a-z]*\\.?,?\\s+(?:de\\s+)?(\\d{4})\\b`,
    'i'
);
const MONTH_DAY_YEAR_RE = new RegExp(
    `\\b(${MONTH_NAME_RE})[a-z]*\\.?\\s+(\\d{1,2}),?\\s+(\\d{4})\\b`,
    'i'
);

export function parseHumanDate(rawText) {
    if (!rawText) return null;
    const text = rawText.trim();

    let match = text.match(DAY_MONTH_YEAR_RE);
    if (match) {
        const [, day, monthName, year] = match;
        const month = MONTHS[monthName.toLowerCase()];
        if (month) return { day: Number(day), month, year: Number(year) };
    }

    match = text.match(MONTH_DAY_YEAR_RE);
    if (match) {
        const [, monthName, day, year] = match;
        const month = MONTHS[monthName.toLowerCase()];
        if (month) return { day: Number(day), month, year: Number(year) };
    }

    return null;
}

// "4:00 p.m." / "4:00pm" / "16h00" / "16h" / "09:30" / "9h"
const TIME_12H_RE = /\b(\d{1,2}):(\d{2})\s*([ap])\.?m\.?/i;
const TIME_24H_COLON_RE = /\b([01]?\d|2[0-3]):([0-5]\d)\b/;
const TIME_PT_H_RE = /\b([01]?\d|2[0-3])h(\d{2})?\b/i;

export function parseHumanTime(rawText) {
    if (!rawText) return null;
    const text = rawText.trim();

    let match = text.match(TIME_12H_RE);
    if (match) {
        let hour = Number(match[1]) % 12;
        if (match[3].toLowerCase() === 'p') hour += 12;
        return `${String(hour).padStart(2, '0')}:${match[2]}`;
    }

    match = text.match(TIME_PT_H_RE);
    if (match) {
        const hour = Number(match[1]);
        const minute = match[2] ? Number(match[2]) : 0;
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }

    match = text.match(TIME_24H_COLON_RE);
    if (match) {
        return `${match[1].padStart(2, '0')}:${match[2]}`;
    }

    return null;
}
