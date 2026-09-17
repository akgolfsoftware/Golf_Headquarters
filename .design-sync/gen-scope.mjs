#!/usr/bin/env node
// Genererer .design-sync/pkg/index.ts (eksportlista), scope-symlenker (gruppering)
// og componentSrcMap i .design-sync/config.json fra de ekte komponentfilene.
// Kjør på nytt når en komponent legges til/fjernes i src/components/{ui,v2}.
// Kilden er alltid src/ — dette skriptet skriver aldri produktkode.
import { readFileSync, writeFileSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { join, basename, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const PKG = join(HERE, 'pkg');

// fil → gruppe (mappenavn i Claude Design-panelet). Filer som ikke står her, er bevisst utenfor:
// ui/icon (dublett av v2 Icon), ui/popover (dublett av v2 Popover), ui/toast (kun provider/hook),
// v2/shell + v2/spiller-veksler (krever Next-ruter), v2/design-lab-v2 (lab), v2/rolle (kun provider),
// v2/hurtig-opprett (importerer server actions fra src/app — drar prisma/supabase inn i bundelen).
const GRUPPER = {
  'ui/button.tsx': 'primitiver', 'ui/input.tsx': 'primitiver', 'ui/textarea.tsx': 'primitiver',
  'ui/select.tsx': 'primitiver', 'ui/checkbox.tsx': 'primitiver', 'ui/radio.tsx': 'primitiver',
  'ui/switch.tsx': 'primitiver', 'ui/skeleton.tsx': 'primitiver',
  'ui/kpi-card.tsx': 'molekyler', 'ui/tabs.tsx': 'molekyler', 'ui/breadcrumb.tsx': 'molekyler',
  'ui/progress-bar.tsx': 'molekyler', 'ui/progress-ring.tsx': 'molekyler', 'ui/tooltip.tsx': 'molekyler',
  'ui/dialog.tsx': 'dialoger', 'ui/sheet.tsx': 'dialoger', 'ui/dropdown-menu.tsx': 'dialoger',
  'v2/core.tsx': 'kjerne', 'v2/icon.tsx': 'ikoner',
  'v2/datavis.tsx': 'datavis', 'v2/spesialviz.tsx': 'spesialviz',
  'v2/domene.tsx': 'domene', 'v2/domene2.tsx': 'domene',
  'v2/skjema.tsx': 'skjema', 'v2/overlays.tsx': 'overlegg', 'v2/struktur.tsx': 'struktur',
  'v2/kalender.tsx': 'kalender', 'v2/time-grid.tsx': 'kalender',
  'v2/inspektorpanel.tsx': 'inspektor', 'v2/samtale.tsx': 'samtale', 'v2/fysisk.tsx': 'fysisk',
  'v2/utviklingsplan.tsx': 'utviklingsplan',
  'v2/tilbakemelding.tsx': 'tilbakemelding', 'v2/hjelp.tsx': 'tilbakemelding',
  'v2/wb-mobil.tsx': 'workbench', 'v2/wb-composer.tsx': 'workbench', 'v2/composer.tsx': 'workbench',
  'v2/bunn-ark.tsx': 'workbench', 'v2/dropzone.tsx': 'workbench',
  'v2/compliance-viz.tsx': 'workbench', 'v2/pyramide-syklus.tsx': 'workbench',
  'v2/laster.tsx': 'tilstander', 'v2/feil-laste.tsx': 'tilstander',
  'v2/tema.tsx': 'skall', 'v2/toppbar-hoyde.tsx': 'skall',
};
// Navnekollisjon: overlays.Ark er den kanoniske `Ark`; wb-mobil sin eksporteres som WbArk
// (samme alias som src/components/v2/index.ts bruker).
const ALIAS = { 'v2/wb-mobil.tsx': { Ark: 'WbArk' } };
// Utgåtte/ikke-renderbare komponenter — se .design-sync/NOTES.md §Bevisst utenfor omfanget.
// LFaseBadge: utgått (beslutning 05.08.2026), skal ikke tilbys som byggbar i Claude Design.
// AmbientBakgrunn: rendrer null uten PROFIL.src (settes av appen i runtime) — ingen statisk tilstand.
const EKSKLUDER_EKSPORT = new Set(['LFaseBadge', 'AmbientBakgrunn']);

const indexLines = ['// GENERERT av .design-sync/gen-scope.mjs — ikke rediger for hånd.',
  '// Eksportlista for Claude Design-synken: appens ekte komponenter, ingen reimplementasjon.',
  'import "./process-shim"; // må stå først: next/link leser process.env ved lasting'];
const pins = {};
const seen = new Map();
rmSync(join(PKG, 'scope'), { recursive: true, force: true });
for (const [rel, gruppe] of Object.entries(GRUPPER)) {
  const abs = join(ROOT, 'src/components', rel);
  const text = readFileSync(abs, 'utf8');
  const names = [];
  for (const m of text.matchAll(/^export (?:default )?(?:function|const|class) ([A-Z][A-Za-z0-9]*)\b/gm)) {
    const n = m[1];
    if (/^[A-Z0-9]+$/.test(n) || names.includes(n) || EKSKLUDER_EKSPORT.has(n)) continue; // ALL_CAPS-konstanter er ikke komponenter
    names.push(n);
  }
  const exports = names.map((n) => {
    const alias = ALIAS[rel]?.[n];
    const out = alias ?? n;
    if (seen.has(out)) throw new Error(`Navnekollisjon: ${out} i ${rel} og ${seen.get(out)}`);
    seen.set(out, rel);
    return alias ? `${n} as ${alias}` : n;
  });
  const linkDir = join(PKG, 'scope', gruppe);
  mkdirSync(linkDir, { recursive: true });
  const linkPath = join(linkDir, basename(rel));
  symlinkSync(relative(linkDir, abs), linkPath);
  for (const e of exports) pins[e.split(' as ').at(-1)] = `scope/${gruppe}/${basename(rel)}`;
  indexLines.push(`export { ${exports.join(', ')} } from "../../src/components/${rel.replace(/\.tsx$/, '')}";`);
}
writeFileSync(join(PKG, 'index.ts'), indexLines.join('\n') + '\n');

const cfgPath = join(HERE, 'config.json');
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
cfg.componentSrcMap = Object.fromEntries(Object.entries(pins).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
console.log(`index.ts: ${Object.keys(GRUPPER).length} filer, ${seen.size} komponenter, ${new Set(Object.values(GRUPPER)).size} grupper`);
