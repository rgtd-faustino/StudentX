import { createHash } from 'node:crypto';

// O calendar.js e o opportunities.js fazem parseInt(event.id) em vários sítios
// (findEventById, cleanupExpiredEvents, etc.) - por isso o id TEM de ser sempre
// um número inteiro, nunca uma string tipo "eventbrite-abc123".
//
// Reservamos os ids abaixo de AUTO_ID_BASE para os eventos manuais (o vosso
// esquema atual usa 0,1,2,3,4...), e geramos ids altos e estáveis para os
// eventos vindos de fontes automáticas, para nunca colidirem.

const AUTO_ID_BASE = 900_000_000;
const AUTO_ID_RANGE = 99_000_000; // mantém o id dentro de Number.isSafeInteger com folga

/**
 * Gera um id inteiro estável a partir do nome da fonte + id do evento na fonte.
 * É determinístico: a mesma fonte + o mesmo evento produzem sempre o mesmo id,
 * o que é essencial para o merge (evita duplicar o mesmo evento em cada execução)
 * e para não invalidar os cookies de "aceites/rejeitados" dos utilizadores.
 */
export function stableAutoId(sourceName, sourceEventId) {
    const key = `${sourceName}::${sourceEventId}`;
    const hash = createHash('sha1').update(key).digest();
    const n = hash.readUInt32BE(0);
    return AUTO_ID_BASE + (n % AUTO_ID_RANGE);
}

/**
 * Última rede de segurança: se por azar dois eventos diferentes gerarem o
 * mesmo id (colisão de hash, ou sobreposição com um id manual), vamos
 * incrementando até encontrar um id livre, e avisamos nos logs.
 *
 * IMPORTANTE: o mesmo id em dias DIFERENTES é intencional (é assim que um
 * evento multi-dia evita perguntar para aceitar/rejeitar em cada dia) - só
 * é colisão a sério se o mesmo id aparecer no MESMO dia. A primeira versão
 * disto não distinguia os dois casos, e via o log real da Action, estava a
 * "corrigir" precisamente os casos que era suposto deixar em paz.
 */
export function resolveIdCollisions(events) {
    const seen = new Set();
    for (const ev of events) {
        let key = `${ev.id}::${ev.day}-${ev.month}-${ev.year}`;
        while (seen.has(key)) {
            console.warn(
                `[id] colisão de id (${ev.id}) em "${ev.descriptionTitle}" no mesmo dia (${ev.day}/${ev.month}/${ev.year}) - a ajustar`
            );
            ev.id += 1;
            key = `${ev.id}::${ev.day}-${ev.month}-${ev.year}`;
        }
        seen.add(key);
    }
    return events;
}
