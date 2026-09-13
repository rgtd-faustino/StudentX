/**
 * O `timeout` que tanto o node-ical como o rss-parser aceitam nas opções
 * não se mostrou fiável, e uma primeira tentativa só com Promise.race
 * (deixar de ESPERAR pelo pedido) não chegava: o pedido de rede ficava
 * mesmo aberto por baixo, o que impedia o processo Node de terminar
 * sozinho no fim do script (o comando `timeout` do bash teve de o matar à
 * força - visto isto num teste real). Por isso fazemos nós próprios o
 * fetch com AbortController, que cancela mesmo a ligação.
 */
export async function fetchWithTimeout(url, ms, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function fetchTextWithTimeout(url, ms) {
    const res = await fetchWithTimeout(url, ms);
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    return res.text();
}

// O feed de Alameda do IST partia o parser de XML logo na linha 6 com
// "Invalid character in entity name" - um "&" a espaços de um "=" que não
// é uma entidade válida (normalmente um URL com parâmetros tipo
// "?a=1&b=2" que devia ter sido escrito "&amp;" e não foi). Escapamos
// qualquer "&" que não seja já uma entidade reconhecida, para o XML pelo
// menos conseguir ser interpretado.
export function sanitizeXmlEntities(xml) {
    return xml.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;');
}
