#!/usr/bin/env node
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fetchIcalSource } from './adapters/ical.mjs';
import { fetchRssSource } from './adapters/rss.mjs';
import { fetchEventbriteOrg } from './adapters/eventbrite.mjs';
import { loadManualEvents } from './adapters/manual.mjs';
import { mergeAndPrune } from './lib/merge.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');

const SOURCES_PATH = path.join(__dirname, 'config', 'sources.json');
const MANUAL_PATH = path.join(REPO_ROOT, 'sources', 'manual-events.json');
const OVERRIDES_PATH = path.join(REPO_ROOT, 'sources', 'overrides.json');
const OUTPUT_PATH = path.join(REPO_ROOT, 'json', 'events.json');

async function loadJsonSafe(filePath, fallback) {
    try {
        return JSON.parse(await readFile(filePath, 'utf8'));
    } catch {
        return fallback;
    }
}

async function main() {
    const sources = await loadJsonSafe(SOURCES_PATH, { ical: [], rss: [], eventbrite: [] });
    const overrides = await loadJsonSafe(OVERRIDES_PATH, {});

    const results = [];

    for (const src of sources.ical || []) {
        console.log(`A obter fonte iCal: ${src.name} (${src.url})`);
        const events = await fetchIcalSource(src);
        console.log(`  -> ${events.length} evento(s)`);
        results.push(...events);
    }

    for (const src of sources.rss || []) {
        console.log(`A obter fonte RSS: ${src.name} (${src.url})`);
        const events = await fetchRssSource(src);
        console.log(`  -> ${events.length} evento(s)`);
        results.push(...events);
    }

    for (const src of sources.eventbrite || []) {
        console.log(`A obter fonte Eventbrite: ${src.name}`);
        const events = await fetchEventbriteOrg(src);
        console.log(`  -> ${events.length} evento(s)`);
        results.push(...events);
    }

    const manual = await loadManualEvents(MANUAL_PATH);
    console.log(`A ler eventos manuais (sources/manual-events.json): ${manual.length}`);
    results.push(...manual);

    // correções pontuais por id, sem precisar de mexer em código
    // (ex.: {"900012345": {"colorOfEvent": "blue", "destaque": true}})
    let overrideCount = 0;
    for (const ev of results) {
        const override = overrides[String(ev.id)];
        if (override) {
            Object.assign(ev, override);
            overrideCount += 1;
        }
    }
    if (overrideCount) console.log(`A aplicar ${overrideCount} override(s) de sources/overrides.json`);

    const finalEvents = mergeAndPrune(results);

    await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await writeFile(OUTPUT_PATH, JSON.stringify({ items: finalEvents }, null, 2) + '\n', 'utf8');

    console.log(
        `\nConcluído: ${finalEvents.length} evento(s) escrito(s) em ${path.relative(REPO_ROOT, OUTPUT_PATH)}`
    );
}

main().catch((err) => {
    console.error('Erro fatal no pipeline de eventos:', err);
    process.exitCode = 1;
});
