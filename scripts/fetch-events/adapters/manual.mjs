import { readFile } from 'node:fs/promises';

/**
 * sources/manual-events.json é o sucessor de "editar o events.json à mão":
 * continua a ser a equipa a escrever estes eventos diretamente (ex: os que
 * vêm do formulário de submissão, depois de revistos), mas agora entram no
 * mesmo pipeline que os automáticos, em vez de ser um ficheiro à parte que
 * ninguém lembra de atualizar.
 */
export async function loadManualEvents(path) {
    let raw;
    try {
        raw = await readFile(path, 'utf8');
    } catch {
        console.warn(`[manual] não encontrei ${path} - a continuar sem eventos manuais`);
        return [];
    }

    let data;
    try {
        data = JSON.parse(raw);
    } catch (err) {
        console.warn(`[manual] ${path} tem JSON inválido: ${err.message}`);
        return [];
    }

    const items = Array.isArray(data) ? data : data.items || [];
    return items.map((ev) => ({ ...ev, source: ev.source || 'manual' }));
}
