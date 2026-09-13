// Salvaguarda contra eventos com datas mal formadas na fonte - nunca
// repetimos um evento por mais dias do que isto.
export const MAX_DAYS_PER_EVENT = 14;

/**
 * Devolve a lista de {day, month, year} entre duas datas UTC, inclusive.
 * Usado para repetir um evento multi-dia em cada dia que ocupa.
 */
export function dateRangeInclusive(firstMs, lastMs, maxDays = MAX_DAYS_PER_EVENT) {
    const days = [];
    const ONE_DAY = 24 * 60 * 60 * 1000;
    let cursor = firstMs;
    let count = 0;

    while (cursor <= lastMs && count < maxDays) {
        const d = new Date(cursor);
        days.push({ day: d.getUTCDate(), month: d.getUTCMonth() + 1, year: d.getUTCFullYear() });
        cursor += ONE_DAY;
        count += 1;
    }

    if (days.length === 0) {
        const d = new Date(firstMs);
        days.push({ day: d.getUTCDate(), month: d.getUTCMonth() + 1, year: d.getUTCFullYear() });
    }

    return days;
}

export function ymdToUtcMs(year, month, day) {
    return Date.UTC(year, month - 1, day);
}
