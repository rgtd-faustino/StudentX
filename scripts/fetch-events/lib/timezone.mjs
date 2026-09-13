// A StudentX é um projeto de Lisboa e o events.json guarda day/month/year/startTime/endTime
// como valores "de parede" (wall time) em hora de Lisboa - não em UTC.
//
// O runner do GitHub Actions corre sempre em UTC, e muitos VEVENTs vêm com hora certa (UTC)
// ou com TZID diferente. Se usássemos date.getHours()/getDate() diretamente, íamos buscar a
// hora no fuso horário do PROCESSO (UTC no Actions), o que desloca eventos perto da meia-noite
// para o dia errado. Por isso convertemos sempre explicitamente para Europe/Lisbon aqui.

const LISBON_TZ = 'Europe/Lisbon';

const partsFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: LISBON_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
});

/**
 * Converte um objeto Date (um instante, independente do fuso horário local do processo)
 * nos componentes correspondentes à hora de parede em Lisboa.
 */
export function toLisbonParts(date) {
    const parts = Object.fromEntries(
        partsFormatter.formatToParts(date).map((p) => [p.type, p.value])
    );

    let hour = Number(parts.hour);
    if (hour === 24) hour = 0; // salvaguarda para motores JS onde a meia-noite sai como "24"

    return {
        year: Number(parts.year),
        month: Number(parts.month),
        day: Number(parts.day),
        hour,
        minute: Number(parts.minute),
    };
}

export function toLisbonDayMonthYear(date) {
    const { day, month, year } = toLisbonParts(date);
    return { day, month, year };
}

export function toLisbonHM(date) {
    const { hour, minute } = toLisbonParts(date);
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
