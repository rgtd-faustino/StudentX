// Constrói um evento com EXATAMENTE os campos que o frontend já consome
// (confirmado lendo calendar.js, carousel.js e opportunities.js), mais alguns
// campos extra (source/sourceId/sourceUrl) que o frontend simplesmente ignora
// - são só para o próprio pipeline saber a origem de cada evento em execuções
// futuras (merge/dedupe/overrides).

const FALLBACK_IMAGE = '/images/logoStudentX.webp';

export function buildEvent({
    id,
    day,
    month,
    year,
    startTime,
    endTime,
    title,
    subtitle,
    place,
    placeSubtitle,
    imageUrl,
    logoUrl,
    moreInfoLink,
    description,
    colorOfEvent,
    destaque = false,
    source,
    sourceId,
    sourceUrl,
}) {
    return {
        day,
        month,
        year,
        id,
        imageSrc: imageUrl || FALLBACK_IMAGE,
        altText: title || 'Evento StudentX',
        descriptionTitle: title || 'Evento',
        descriptionSubtitle: subtitle || '',
        logoSrc: logoUrl || FALLBACK_IMAGE,
        logoAlt: place ? `Logótipo ${place}` : 'Logótipo',
        oppPlaceTitle: place || 'A confirmar',
        oppPlaceSubtitle: placeSubtitle || '',
        moreInfoLink: moreInfoLink || sourceUrl || '#',
        startTime,
        endTime,
        colorOfEvent,
        destaque,
        moreInfoText: description || '',
        // metadados internos do pipeline (o frontend ignora campos que não conhece)
        source,
        sourceId,
        sourceUrl,
    };
}

export function isStillRelevant(event, now = new Date()) {
    if (event.day == null || event.month == null || event.year == null || !event.endTime) {
        return true; // falta informação para decidir - por segurança, mantemos
    }
    const [hour, minute] = event.endTime.split(':').map(Number);
    const end = new Date(event.year, event.month - 1, event.day, hour || 0, minute || 0);
    return end.getTime() >= now.getTime();
}
