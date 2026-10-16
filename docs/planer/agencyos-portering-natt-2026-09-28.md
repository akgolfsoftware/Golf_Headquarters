# AgencyOS i Precision Athletics — nattkjøring 28.–29.09.2026

Anders 28.09.2026: alle AgencyOS-tegninger i Precision Athletics (`7d7c2994`) er godkjent. Porter
dem til kode i én nattkjøring. **Ingenting legges inn i main om natten** — hver bolk ender som en
grønn PR med forhåndsvisning, og Anders godkjenner om morgenen.

Grunnlaget ligger i main (PR «AgencyOS-grunnlag»): `AgencyOSSkall`, `Hurtigknapp`,
komponentstilene, måleverktøyet og tegningene i `designsystem/precision-athletics/`.

## Bolkene

Aktive tegninger per 28.09 (`designsystem/precision-athletics/ui_kits/katalog.js`, uten «utgår»).
Ruter: [skjermlista](../design-system/skjermliste-precision-athletics.md) og plasseringen i
`ui_kits/_shared/ia.js` (`AK_IA.plassering`).

| Bolk | Gren | Tegninger | Hovedruter |
|---|---|---|---|
| A1 Coachens morgen | `claude/port-agencyos-a1` | AG-01 · AG-04 (+HASTER, OPP) · AG-A05 · AG-A08 · AG-RD-02 · AG-19 | `/admin/agencyos`, `/admin/innboks`, `/admin/jarvis` |
| A2 Stall og spiller | `claude/port-agencyos-a2` | AG-07 · AG-08 (+PLAN, TALENT, IUP, IUP-AK) · AG-A02 · AG-A04 · AG-10 · AG-TP-01 · AG-TP-02 · AG-RD-01 | `/admin/spillere`, `/admin/spillere/[id]/*`, `/admin/plan/teknisk` |
| A3 Planlegge og gjennomføre | `claude/port-agencyos-a3` | AG-11 (+GRUPPE, AR, OKT, MAL, FYS) · AG-WB-FYS · AG-WB-TURN · AG-A06 · AG-12 · AG-13 (+U) · AG-14 | `/admin/planlegge`, `/admin/workbench/[playerId]`, `/admin/grupper/[id]/workbench`, `/admin/agencyos/live*`, `/admin/plan*` |
| A4 Kalender og booking | `claude/port-agencyos-a4` | AG-05 (+UKE, MND, AR, ASS) · AG-06 (+NY) | `/admin/kalender*`, `/admin/bookinger*`, `/admin/services` |
| A5 Mer | `claude/port-agencyos-a5` | AG-15 · AG-16 · AG-A03 · AG-20 (+ASS) · AG-23 (+TEAM) | `/admin/tester*`, `/admin/grupper*`, `/admin/agencyos/okonomi`, `/admin/oppsett*` |

Finner du en rute som ikke står her, men som tegningen dekker, tar du den med. Finner du en tegning
som tilhører en annen bolk, lar du den ligge.

## Faste regler (brytes aldri)

1. **Bytt utseendet, behold dataene.** `page.tsx` beholder `requirePortalUser`, lasterne og
   handlingene. Bare visningen byttes. Hver laster, handling og tilgangssjekk fra før skal være med
   etterpå, eller avviket står i PR-en.
2. **Ingen oppdiktede tall eller navn.** Mangler dataene, vises «—». Demodata i tegningene
   (Tobias Lindvik, 950 kr, Tripletex-tall i AG-20, osv.) kopieres aldri inn i kode brukere når.
3. **Ingen endring i database, `prisma/schema.prisma`, tilgangsregler, `vercel.json`, Stripe eller
   miljøvariabler.** Trenger en tegning data som ikke finnes: vis «—» eller skjul delen, og før
   det opp under «Parkert» i PR-en. (Lærdom 28.09: `rounds.source` gikk ut i main før feltet fantes
   i basen og krasjet I dag for spillerne.)
4. **Ingen funksjon forsvinner.** En gammel adresse sendes bare videre når den nye skjermen dekker
   alt den gamle gjorde. Ellers står den urørt og føres opp i PR-en.
5. **Ingen spillernavn eller elevdata i prompts til AI.** Prøvefilene bruker oppdiktede navn.
6. **Stil bare via Precision-klassene (`pa-*`) og tokenene** (`var(--…)`). Ingen hex-farger, ingen
   Tailwind-farger, ingen skrifter utenom tokenene. Rust (`--signal`) bare på det som haster eller
   ødelegger — høyst én per flate. Farge betyr akse og ingenting annet.
7. **Aldri sidelengs rulling.** Flex/grid med tekst som ikke brytes får `minWidth: 0`.
8. Git: bare din egen gren, fra `origin/main`. Stage navngitte filer, aldri `git add -A`. Aldri
   force-push. Aldri merge. Sjekk `git branch --show-current` før hver commit.

## Oppskrift per skjermtype

1. Les tegningen i `designsystem/precision-athletics/ui_kits/agencyos/screens/` og hjelpefilene den
   bruker (`ag-parts.jsx`, `data-*.js`, `../_shared/*`). Tegningen som registrerer
   `AG_SCREENS["AG-xx"]` er fasit; finnes flere, vinner den `katalog.html` laster sist.
2. Les dagens `page.tsx` og komponenten. List lastere, handlinger og tilgangssjekker.
3. Lag visningen som ren komponent (data inn som props) i `src/components/admin/precision/`, med
   grunnkomponentene i `src/components/precision/pa.tsx`. Mangler en grunnkomponent (faner,
   segmentert valg, ark, tabell som blir kortrader, felt), legg den i `pa.tsx` med samme klasser
   som designets `components/*/*.jsx`.
4. Pakk sida i `<AgencyOSSkall navn={…}>` i stedet for `V2Shell`. Ligger sida under
   `src/app/admin/(legacy)/`, legg adressemønsteret i bolkens fil i
   `src/lib/agencyos/precision-portert/aN.ts` (bare din egen fil).
5. Tilstandene data, tom, laster (`loading.tsx` eller `LasterTilstand`) og feil.
6. Prøvefil `tests/visual/precision/skjermer/<ID>.tsx` med oppdiktede data for hver tilstand, og mål:
   `node tests/visual/precision/maal.mjs <ID>` — skal gi 0 avvik i 390, 768, 1024, 1280 og 1440.
   Se på skjermbildene i 390 og 1440 ved siden av tegningen.
7. `npx tsc --noEmit` og `npx eslint <filene dine>` grønne før commit. Én commit per skjermtype.
8. Til slutt i bolken: `npm run verify` grønn, push, PR mot main (ikke merge). PR-teksten har:
   tegninger og ruter, lasterlista fra steg 2, målingen per skjerm, «Parkert», og
   «Gamle adresser som står urørt».

## Stopp

- Faller `npm run verify` to ganger på samme feil: parker skjermtypen (fjern den fra bolken med
  en `git revert` av egne commits), skriv hvorfor i PR-en, og gå videre.
- Uventet i git (konflikt, fremmede endringer på grenen): stopp bolken og rapporter.
