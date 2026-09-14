// Em vez de irmos guardando/atualizando à mão um logótipo por instituição
// (frágil - muda o logo deles, esquecemo-nos de atualizar), usamos o favicon
// do próprio site da fonte. Funciona automaticamente para QUALQUER fonte
// nova que a equipa adicionar no futuro, sem precisar de configurar nada.
//
// O serviço de favicons do Google é gratuito, não pede chave de API, e é
// usado por muita gente para isto mesmo - mas é um serviço de terceiros,
// por isso se um dia deixar de responder, o logótipo cai simplesmente para
// o logo da StudentX (FALLBACK_IMAGE em normalize.mjs), nunca fica partido.

export function faviconLogoFor(url) {
    if (!url) return null;
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
    } catch {
        return null;
    }
}
