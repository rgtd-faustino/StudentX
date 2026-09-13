// Extrai campos do tipo "Etiqueta: valor" do texto de um post (o padrão que
// vimos tanto em inglês, no IST - "Date: X" / "Time: Y" / "Location: Z" -
// como em português, em vários sites Joomla da ULisboa - "Data de início: X"
// / "Hora de Início: Y" / "Local: Z"). Cada campo tenta várias etiquetas
// possíveis (aliases) e fica com a primeira que encontrar.

// NOTA: as etiquetas toleram espaço antes dos dois pontos ("Date :" e não só
// "Date:") - um exemplo real do IST veio formatado assim, e sem essa
// tolerância a extração falhava silenciosamente.
const FIELD_ALIASES = {
    date: [/date\s*:\s*([^\n\r]+)/i, /data de in[íi]cio\s*:\s*([^\n\r]+)/i],
    endDate: [/data de fim\s*:\s*([^\n\r]+)/i],
    time: [/time\s*:\s*([^\n\r]+)/i, /hora de in[íi]cio\s*:\s*([^\n\r]+)/i],
    endTimeLabeled: [/hora de fim\s*:\s*([^\n\r]+)/i],
    location: [/location\s*:\s*([^\n\r]+)/i, /venue\s*:\s*([^\n\r]+)/i, /\blocal\s*:\s*([^\n\r]+)/i],
};

export function extractLabeledFields(text) {
    if (!text) return {};
    const result = {};
    for (const [field, patterns] of Object.entries(FIELD_ALIASES)) {
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                result[field] = match[1].trim();
                break;
            }
        }
    }
    return result;
}

// Divide um valor de hora tipo "4:00 p.m. - 5:00 p.m." ou "16h00-18h00" em
// [início, fim]. Se só houver uma hora (sem intervalo), fim vem null.
const RANGE_SEPARATOR_RE = /\s*(?:[-–—]|\bto\b|\bàs\b|\bas\b)\s*/i;

export function splitTimeRange(value) {
    if (!value) return [null, null];
    const parts = value.split(RANGE_SEPARATOR_RE).filter(Boolean);
    return [parts[0] || null, parts[1] || null];
}
