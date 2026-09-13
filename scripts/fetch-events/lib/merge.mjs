import { resolveIdCollisions } from './id.mjs';
import { isStillRelevant } from './normalize.mjs';

/**
 * Junta os eventos de todas as fontes (manuais + automáticas), resolve
 * colisões de id, remove eventos já terminados, e ordena por data.
 *
 * Nota sobre duplicados ENTRE fontes diferentes (ex: o mesmo evento aparece
 * no calendário da faculdade E foi submetido manualmente por alguém): isto
 * não tenta adivinhar - fica só um aviso nos logs para reverem no PR. Tentar
 * adivinhar automaticamente que dois textos descrevem "o mesmo evento" dá
 * demasiados falsos positivos para correr sem supervisão.
 */
export function mergeAndPrune(allEvents, { now = new Date() } = {}) {
    warnPossibleCrossSourceDuplicates(allEvents);

    const withResolvedIds = resolveIdCollisions(allEvents);

    return withResolvedIds
        .filter((ev) => isStillRelevant(ev, now))
        .sort((a, b) => {
            const da = new Date(a.year, a.month - 1, a.day);
            const db = new Date(b.year, b.month - 1, b.day);
            return da - db;
        });
}

function warnPossibleCrossSourceDuplicates(events) {
    const byTitleAndDay = new Map();
    for (const ev of events) {
        const key = `${normalizeTitle(ev.descriptionTitle)}::${ev.day}-${ev.month}-${ev.year}`;
        if (!byTitleAndDay.has(key)) byTitleAndDay.set(key, []);
        byTitleAndDay.get(key).push(ev);
    }
    for (const [key, group] of byTitleAndDay) {
        const distinctSources = new Set(group.map((e) => e.source));
        if (group.length > 1 && distinctSources.size > 1) {
            console.warn(
                `[merge] possível duplicado entre fontes (${[...distinctSources].join(', ')}): "${group[0].descriptionTitle}" no mesmo dia - confirma no PR se é o mesmo evento`
            );
        }
    }
}

function normalizeTitle(title = '') {
    return title.trim().toLowerCase();
}
