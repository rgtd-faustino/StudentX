const DIAS = ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'];
const MESES = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

/**
 * Constrói o texto "Sexta-Feira, 27 de julho às 18:00 - 23:59", no mesmo
 * estilo que já era usado nos eventos manuais existentes.
 */
export function formatWhen({ day, month, year }, startTime, endTime) {
    const localNoon = new Date(year, month - 1, day, 12);
    const dia = DIAS[localNoon.getDay()];
    return `${dia}, ${day} de ${MESES[month - 1]} às ${startTime} - ${endTime}`;
}
