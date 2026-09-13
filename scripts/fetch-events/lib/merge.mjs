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
    const deduped = dedupeByLink(allEvents);
    warnPossibleCrossSourceDuplicates(deduped);

    const withResolvedIds = resolveIdCollisions(deduped);

    return withResolvedIds
        .filter((ev) => isStillRelevant(ev, now))
        .sort((a, b) => {
            const da = new Date(a.year, a.month - 1, a.day);
            const db = new Date(b.year, b.month - 1, b.day);
            return da - db;
        });
}

// Se duas fontes diferentes derem eventos com o MESMO moreInfoLink no mesmo
// dia, é a sério o mesmo evento, não só uma coincidência de título - vimos
// isto ao vivo (o feed de Taguspark devolvia os mesmos artigos do de
// Oeiras). Isto é mais forte do que o aviso de "possível duplicado" abaixo,
// por isso removemos mesmo, ficando só com a primeira ocorrência. A chave
// inclui o dia para não apagar por engano os vários dias de um evento
// multi-dia que, esse sim, repete o mesmo link de propósito.
function dedupeByLink(events) {
    const seen = new Map();
    const result = [];

    for (const ev of events) {
        const link = ev.moreInfoLink;
        const isRealLink = Boolean(link) && link !== '#';
        const key = isRealLink ? `${link}::${ev.day}-${ev.month}-${ev.year}` : null;

        if (key && seen.has(key)) {
            console.log(
                `[merge] "${ev.descriptionTitle}" (fonte: ${ev.source}) descartado - mesmo link e dia que a fonte "${seen.get(key)}"`
            );
            continue;
        }

        if (key) seen.set(key, ev.source);
        result.push(ev);
    }

    return result;
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
