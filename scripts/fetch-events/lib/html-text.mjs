// Ao testar contra feeds reais (ver aviso "</strong> 27 June<br />" nos
// logs), percebi que o conteúdo de um RSS vem em HTML a sério, tantas vezes
// tudo numa única "linha" sem quebras de linha reais - só <br />, </p>, etc.
// Se só tirarmos as tags (substituindo por espaço), "Date:</strong> 27
// June<br />Time: ..." vira tudo uma frase só, e a regex de extração de
// campos (que corta no fim da linha) acaba por apanhar lixo a mais.
//
// Por isso convertemos primeiro as tags que representam quebra de linha
// visual PARA quebras de linha a sério, só depois é que tiramos o resto das
// tags e descodificamos entidades HTML.

const LINE_BREAK_TAGS_RE = /<\/?(br|p|div|li|h[1-6]|tr|table)\b[^>]*>/gi;
const ANY_TAG_RE = /<[^>]*>/g;

const HTML_ENTITIES = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&apos;': "'",
    '&#8211;': '–',
    '&#8212;': '—',
    '&#8216;': '‘',
    '&#8217;': '’',
    '&#8220;': '“',
    '&#8221;': '”',
    '&#8230;': '…',
};

export function htmlToText(html) {
    if (!html) return '';

    let text = html.replace(LINE_BREAK_TAGS_RE, '\n');
    text = text.replace(ANY_TAG_RE, ' ');
    text = text.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
    text = text.replace(/&[a-z0-9#]+;/gi, (entity) => HTML_ENTITIES[entity] ?? entity);

    // várias linhas em branco seguidas -> uma só; espaços/tabs repetidos -> um
    text = text.replace(/[ \t]+/g, ' ');
    text = text.replace(/\n[ \t]*\n+/g, '\n');
    text = text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join('\n');

    return text.trim();
}
