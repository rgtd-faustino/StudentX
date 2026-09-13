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
 */
export function resolveIdCollisions(events) {
    const seen = new Set();
    for (const ev of events) {
        let id = ev.id;
        while (seen.has(id)) {
            console.warn(
                `[id] colisão de id (${id}) em "${ev.descriptionTitle}" (fonte: ${ev.source}) - a ajustar`
            );
            id += 1;
        }
        seen.add(id);
        ev.id = id;
    }
    return events;
}
