# T11 — Innsikt-hub — DONE (27.08.2026)

Gren: `claude/t11-innsikt-hub-port-55ae0b` (harnesset opprettet worktreet automatisk;
avviker fra bestillingens `claude/t11-innsikt-hub-tl`, samme innhold).

## Levert

- **`/admin/analyse`** bygget om fra `AdminAnalyseV2` (Paper `T.*`) til **AG-07
  Innsikt-hub** — ny komponent `InnsiktHubV2.tsx`, kun `TL.*`-tokens. Responsiv i tre
  trinn (390 kompakt / 768–1100 regular / 1101+ wide) som matcher fasitens
  AG-07a/b/c: 2 → 3 → 4 KPI-fliser, «Gå dypere»-liste med 6–7 push-rader
  (Stall-innsikt · Spiller 360 · DataGolf · TrackMan · Fys og last · Tester ·
  Økonomi på wide), motor-skille-teksten i bunn.
- **`/admin/analyse/stall`** (ny rute) — **AG-12 Innsikt stall** — ny komponent
  `InnsiktStallV2.tsx`. KPI (SG uke + spillerantall), SG-per-kategori-søyler
  (4 uker, negativ = opacity 0.4 aldri rødt) med generert innsikt-setning for
  svakeste kategori, og 8-ukers SG-trend-sparkline.
- **`(legacy)/lag-snitt` flettet inn i AG-12**: siden er nå en ren redirect til
  `/admin/analyse/stall`. Den gamle pyramide-akse-fordelingen (`AdminLagSnittV2`)
  er erstattet av stallens SG-per-kategori-visning — samme motor (Broadie-SG),
  finere oppløsning (kategori i stedet for pyramide-akse).
- Orphanede komponenter slettet (ingen gjenværende importer): `AdminAnalyseV2.tsx`,
  `AdminLagSnittV2.tsx`.
- `error.tsx`/`loading.tsx` lagt til for den nye `/admin/analyse/stall`-ruten
  (samme mønster som søsken-rutene).

## Motor-skille (harde regel, verifisert)

Alle SG-tall på begge sider er Broadie-SG fra `Round.sgTotal/sgOtt/sgApp/sgArg/
sgPutt` — aldri blandet med DataGolf/TrackMan/PEI. DataGolf- og TrackMan-radene
er rene push-lenker til egne flater, ingen tall fra dem smeltes inn i AG-07s KPI-er.

## Ikke i scope her (per D-LYS-OG-5T-BESLUTNING.md § 0 AVGJORT 27.08.2026)

- `talent/*` (radar, discovery, sammenligning, wagr-import) — egen
  TalentHQ-konsolideringsbølge, ikke T11.
- `reports` — flettes inn i økonomiflaten (EC-01/C10) i en senere jobb, ikke bygget
  som egen side her.
- `analysere/compliance`, `runder`, `(legacy)/stats/moderering` — disse er
  IKKE re-skinnet i denne omgangen. Fasiten AG-07 viser ingen subnav og ingen
  push-rader til disse tre — de nås fortsatt via samme mekanisme som før
  (`INNSIKT_HUB_TABS`-pillraden i `agency-hub-subnav.tsx`, uendret) og
  V2Shell-railens «Innsikt»-aktiv-tilstand (prefiks-mapping i `shell.tsx` dekker
  allerede alle fire ruter). Å re-style disse tre er en egen, større jobb
  (fortsatt Paper `T.*` internt) — ikke rørt for å holde diffen kirurgisk og fordi
  ingen egen Train-lock-fasit finnes for dem.

## Dokumenterte avvik fra fasiten

1. **«Udekket» (AG-07c Mac-KPI 3)** er definert som «spillere uten planlagt økt
   inneværende uke» — nærmeste ærlige tolkning appens datalag støtter. Fasitens
   bildetekst spesifiserer ikke kilden.
2. **DataGolf og Fys og last har ingen egen stall-nivå-flate i appen ennå** —
   begge push-rader lenker til `/admin/spillere` (Spiller 360) i påvente av at
   egne flater bygges. Ingen fabrikerte tall vises for disse to radene (kun
   fasitens egne statiske undertekster «egen motor» / «ACWR»).
3. **AG-12 har kun mobil-fasit (390×844).** Ingen iPad/Mac-tegning finnes for
   denne skjermen. Komponenten er bygget med `maxWidth: 460` slik at kortene
   beholder fasitens proporsjoner på brede skjermer i stedet for å strekkes ut
   — ingen ny layoutstruktur oppfunnet for bredder fasiten ikke dekker.
4. **8-ukers SG-trend** fyller fremover («forward-fill») over uker uten runder,
   fremfor å komprimere x-aksen — vanlig, ærlig praksis for sparse tidsserier;
   linjen viser «siste kjente nivå», aldri en fabrikert verdi.

## Verifikasjon

- `npx tsc --noEmit` — grønn (0 feil; første kjøring feilet fordi
  `src/generated/prisma` manglet i worktreet — kjørte `npx prisma generate`).
- `npx eslint` på endrede filer — grønn.
- `npm run build` — grønn (måtte `npm ci` først — `node_modules` manglet i
  worktreet, uklart hvorfor, se feillogg-kandidat under).
- `npm run verify` — grønn (prisma validate/generate, tsc, eslint,
  check-action-auth, check-token-gap — bekrefter ingen Presis-hex/farger i
  de nye filene — check-critical-imports, check-doc-lenker, build).
- `npm test` — 1702/1702 grønn, 0 feil.
- **Skjermbilde-gate:** verifisert selv i Browser-panelet — 390×844 og
  1280×900, lys og mørk, for BÅDE `/admin/analyse` og `/admin/analyse/stall`,
  innlogget som `coachtest@akgolf.test`. Alle åtte kombinasjoner rendret
  korrekt (riktig KPI-antall per bredde, riktig push-liste-innhold, ingen
  primary/accent-kollisjon i lys, tomme tilstander vises ærlig — testkontoen
  har ingen runder med SG i de aktuelle vinduene). **Anders har ikke sett
  skjermbildene ennå** — skjermbilde-gaten (CLAUDE.md §Skjermarbeid) krever
  hans godkjenning før merge; denne DONE-rapporten dokumenterer kun min egen
  verifikasjon, ikke hans.

## Mulig feillogg-kandidat (ikke lagt til `docs/feillogg.md` — usikker på årsak)

`node_modules` manglet helt i dette worktreet ved sesjonsstart (ikke symlink,
bare fraværende), til tross for at `.env.local` og flere andre worktrees på
samme maskin hadde det. `npm ci` løste det. Mulig at en samtidig kjørende
økt i et annet worktree ryddet i en delt/symlinket `node_modules` — se
`annen-okts-worktree-kan-forsvinne`-mønsteret i auto-memory. Ikke bekreftet
årsak, derfor ikke skrevet som fasit i feilloggen.

## Neste steg (ikke denne jobben)

- Egen jobb: bygg stall-nivå DataGolf- og Fys/last-flater, koble om de to
  push-radene fra `/admin/spillere` til sine egne ruter.
- Egen jobb: Train-lock-port av `analysere/compliance` / `runder` /
  `(legacy)/stats/moderering` når/hvis Anders vil prioritere disse tre.
- C10/EC-01: flett `reports`-innholdet inn i økonomiflaten.
