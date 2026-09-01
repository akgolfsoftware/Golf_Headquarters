<role>
Du er senior frontend-engineer på AK Golf HQ.
Stack: Next.js 16.2 + React 19 + TypeScript strict + Tailwind v4 + shadcn.
Du mottar en zip med hele Train-lock designfasiten (Claude Design-prosjektet «Player HQ Train lock», ~200 filer) og skal plassere den riktig i repoet — ikke porte skjermer til kode ennå.
</role>

<mission>
1. Pakk ut zip til `design/train-lock/` i repoet (opprett mappen hvis den ikke finnes).
2. Les `DESIGN-SYSTEM.md`, `SCREEN-INDEX.md`, `PORTING.md`, `HANDOFF.md`, `CLAUDE.md` FØRST — i den rekkefølgen.
3. Sammenlign med det som eventuelt allerede ligger i `design/train-lock/` eller tilsvarende plassering fra tidligere økter.
4. Rydd bort alt gammelt som denne zip-en erstatter, slik at repoet aldri har to versjoner av samme skjerm eller doc.
5. IKKE begynn å porte skjermer til React-komponenter i denne omgangen — det er neste steg og et eget oppdrag.
</mission>

<stopp_regel>
Hvis zip-en mangler noen av filene under, STOPP og list nøyaktig hvilke som mangler. Ikke fortsett med gap-fylling eller antagelser om innhold.
Påkrevd i roten av zip: DESIGN-SYSTEM.md, SCREEN-INDEX.md, PORTING.md, HANDOFF.md, CLAUDE.md.
</stopp_regel>

<konflikthåndtering_gammelt_innhold>
- Finnes `design/train-lock/` fra før: diff filnavn mot den nye zip-en.
- En fil med samme navn i begge → NY vinner. Overskriv, ikke behold gammel versjon ved siden av.
- En fil i gammel mappe som IKKE finnes i ny zip → den er trolig utgått (fjernet/erstattet i Claude Design-prosjektet). List den opp og SPØR før sletting — ikke slett stille.
- Se spesielt etter: duplikate LOCK-filer (`TRAIN LOCK`, `AG-00 LOCK`, `AO-00 LOCK`), duplikate `.md`-doc-filer, og gamle `... v1`/uten-suffiks-versjoner av noe som nå har en `v2`.
- Ingen `.dc.html`-fil skal ligge i to mapper i repoet samtidig.
</konflikthåndtering_gammelt_innhold>

<plassering>
- `design/train-lock/*.dc.html` — alle skjermfiler, flat struktur (ikke lag undermapper per prefiks — `SCREEN-INDEX.md` er navigasjonen).
- `design/train-lock/DESIGN-SYSTEM.md`, `SCREEN-INDEX.md`, `PORTING.md`, `HANDOFF.md` — dokumentasjonen, samlet på ett sted.
- `design/train-lock/CLAUDE.md` → flett innholdet inn i repoets rot-`CLAUDE.md` (append en seksjon «## Train-lock designfasit» som peker til mappen) i stedet for å legge en andre `CLAUDE.md` et sted Claude Code ikke leser den automatisk.
- `uploads/`-innhold i zip-en (referansebilder, gamle prompts) → `design/train-lock/reference/`, ikke sammen med `.dc.html`-filene.
</plassering>

<verifisering>
Etter utpakking og opprydding må dette stemme:
- `design/train-lock/` inneholder nøyaktig filene fra zip-en, ingen duplikater fra en tidligere import.
- Rot-`CLAUDE.md` peker til `design/train-lock/DESIGN-SYSTEM.md` og `SCREEN-INDEX.md`.
- `git status` viser en ren diff: nye/endrede filer i `design/train-lock/`, ingen utilsiktede endringer andre steder i repoet.
- Ingen `.dc.html`-fil refererer til en asset-sti som ikke finnes etter flyttingen.
</verifisering>

<output_format>
1. Diff-sammendrag: nye filer, overskrevne filer, filer foreslått slettet (med begrunnelse) — vent på bekreftelse før sletting.
2. Endelig mappestruktur under `design/train-lock/`.
3. Hva som EKSPLISITT ikke ble gjort i denne omgangen: porting av skjermer til React/Tailwind (det er neste oppdrag, jf. `PORTING.md`).
</output_format>
