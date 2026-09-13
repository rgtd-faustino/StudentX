import { stableAutoId } from '../lib/id.mjs';
import { buildEvent } from '../lib/normalize.mjs';
import { categorizeEvent } from '../lib/categorize.mjs';
import { toLisbonDayMonthYear, toLisbonHM } from '../lib/timezone.mjs';
import { fetchWithTimeout } from '../lib/with-timeout.mjs';

// IMPORTANTE - limitação real, não um bug:
// A API pública de PESQUISA da Eventbrite (procurar eventos de qualquer
// organizador por cidade/categoria) foi descontinuada em 2020. Hoje só é
// possível listar eventos de uma organização específica, com um token
// OAuth associado a essa conta. Ou seja: isto só serve para organizações
// com quem a StudentX já tenha uma relação direta (ex: uma associação que
// vos dê o organizationId + um token da própria conta Eventbrite dela) -
// não descobre eventos novos sozinho. A fonte iCal é que faz esse trabalho.
export async function fetchEventbriteOrg(source) {
    const { name, organizationId, colorOfEvent: hint, tokenEnvVar } = source;
    const token = process.env[tokenEnvVar || 'EVENTBRITE_TOKEN'];

    if (!token || !organizationId) {
        console.warn(
            `[eventbrite:${name}] sem token/organizationId configurado - a ignorar esta fonte`
        );
        return [];
    }

    const url = `https://www.eventbriteapi.com/v3/organizations/${organizationId}/events/?status=live&order_by=start_asc&expand=venue`;

    let res;
    try {
        res = await fetchWithTimeout(url, 15_000, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
        console.warn(`[eventbrite:${name}] pedido falhou: ${err.message}`);
        return [];
    }

    if (!res.ok) {
        console.warn(`[eventbrite:${name}] resposta ${res.status} da API`);
        return [];
    }

    const data = await res.json();
    const events = [];

    for (const ev of data.events || []) {
        const start = new Date(ev.start.utc);
        const end = new Date(ev.end.utc);
        const startParts = toLisbonDayMonthYear(start);

        events.push(
            buildEvent({
                id: stableAutoId(name, ev.id),
                day: startParts.day,
                month: startParts.month,
                year: startParts.year,
                startTime: toLisbonHM(start),
                endTime: toLisbonHM(end),
                title: ev.name?.text,
                description: ev.description?.text,
                place: ev.venue?.name || name,
                placeSubtitle: ev.venue?.address?.localized_address_display || '',
                imageUrl: ev.logo?.url,
                moreInfoLink: ev.url,
                colorOfEvent: categorizeEvent({
                    title: ev.name?.text,
                    description: ev.description?.text,
                    sourceCategoryHint: hint,
                }),
                source: name,
                sourceId: ev.id,
                sourceUrl: ev.url,
            })
        );
    }

    return events;
}
