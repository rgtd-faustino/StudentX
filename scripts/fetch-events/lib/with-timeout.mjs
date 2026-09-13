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
