# PX-7 — tilstander/brekk — DONE (delvis) 2026-08-29

Gren: `claude/px7-tilstander-brekk-4cp4nu`. Se `docs/natt/PIKSELPLAN-2026-08-28.md`
§2 rad PX-7 for opprinnelig omfang (GAP + B1–B5 + MAT + resterende Analyse-filer).

**Miljøbegrensning i denne økten:** ingen `NEXT_PUBLIC_SUPABASE_URL`/`DATABASE_URL`
i den fjernstyrte containeren → dev-serveren feiler i `instrumentation.ts` (ingen
innlogget rendering mulig). Skjermbilde-gaten (CLAUDE.md, FAST REGEL 04.08) kunne
derfor ikke gjennomføres av agenten selv i denne økten — Anders må se skjermene via
Vercel-preview før merge, som normalt. `npm run verify`-ekvivalenten som faktisk
kunne kjøres (`npx tsc --noEmit`, `eslint` på endrede filer, `npm test`) er grønn.

## Levert og verifisert (tsc + eslint + 1848 tester grønt)

**GAP-1** (`designsystem/train-lock/GAP-1 Tilstander.dc.html` — KA-01/RU-01/S3-01/BO-01):
- Kalender: `error.tsx` — tittel/melding justert til fasit ("Ingen forbindelse" /
  "Kalenderen kunne ikke hentes. Prøv igjen om litt." — «viser sist lagrede uke»
  droppet, siden siden er `force-dynamic` uten cache og IKKE faktisk viser noe
  gammelt ved feil). Tom/laster fantes allerede korrekt (`TlTomTilstand` i
  `KalenderLagUkeV2.tsx`).
- Runde: feil-tilstanden fantes allerede i `runde-recap.tsx` (bedre presisjon enn
  fasitens tekst — kladden er FAKTISK kun lokal frem til lagring lykkes). Sitert.
  Tom-tilstanden (`runde-live-artefakt.tsx`) returnerer bevisst `null` i stedet for
  fasitens eksplisitte "Ingen aktiv runde"-kort (Loop 9/C5-beslutning) — notert som
  AVVIK, ikke endret uten Anders' ja (bryter «enkelhet»-prinsippet å ha et
  alltid-synlig "start runde"-kort i I dag-strømmen).
- Spiller 360: `[id]/error.tsx` — tittel/melding justert til fasit.
- Booking: tom-tilstand fantes allerede (`BookingNyV2.tsx`), sitert.

**GAP-2** (`designsystem/train-lock/GAP-2 Tilstander drift.dc.html`):
- AgenticOS Runtimes: ny "ingen motor svarer"-banner i `AdminAgenticosRuntimes.tsx`,
  utledet fra faktisk `paa === 0` (ekte betingelse på eksisterende data, ingen ny
  datamodell — men merk at `AGENTICOS_RUNTIMES` er statisk/visning, så betingelsen
  kan i praksis aldri trigges før runtimes blir ekte).
- Integrasjoner: `IntegrasjonStatus` fikk `"error"`-tilstand, utledet fra
  `GoogleCalendarConnection.status === "ERROR"` (feltet fantes allerede i skjemaet,
  ble bare ikke lest av UI-en før). Ekte reauth-varsel, ingen ny kolonne.
- Jarvis-kø tom: fantes allerede (`AoTom` i `AdminAgenticosKo.tsx`), sitert.
- GAP-2e (reauth-ark med samtykkeliste) — IKKE bygget: ville krevd en ny
  permission-disclosure-flate uten reelle OAuth-scopes å liste opp bak seg. Vurdert
  som ny feature, ikke en tilstand — utenfor anti-scope.

**GAP-00** (kart/referanse, ikke en skjerm): sitert i `PLAYERHQ_NAV`
(`src/components/v2/shell.tsx`) som IA-kilde, ikke portet som UI.

**B1** (`designsystem/train-lock/B1 Tilstander laster feil.dc.html`):
- `V2Feil` fikk `melding`-prop (skjermspesifikk undertekst, default uendret).
- `V2Laster` fikk tre nye skjerm-speilede varianter: `plan`, `analyse`, `meg`.
- `/portal/planlegge`: ny `loading.tsx` (variant="plan") + `error.tsx` (spesifikk
  tekst).
- `/portal/analysere`: `loading.tsx` → variant="analyse" (var "dashboard"),
  `error.tsx` fikk spesifikk tekst.
- `/portal/meg` og `/portal` (I dag) rørt IKKE — begge er delt ancestor for
  ~25 undersider uten egen loading/error (Next.js nærmeste-ancestor). Å gjøre dem
  skjerm-spesifikke ville feilsittet på urelaterte undersider (innstillinger, helse,
  talent, venner …). "hjem"/"kort" (generisk) er derfor RIKTIG valg der, ikke en
  mangel — variant="meg" ligger klar i `feil-laste.tsx` for når/hvis Meg-roten får
  egen isolert route-boundary.

**MAT** (`designsystem/train-lock/MAT-00 Materialer.dc.html` +
`MAT-01 Mac Okt FYS hero.dc.html`) — reelle funn, ikke bare sitering:
- `StatusPill` (`core.tsx`) hadde et ekte MAT-00-brudd: `tone="up"` rendret
  TL.ok (#30D158-ekvivalent) — og «Fullført»-status i BÅDE `domene.tsx`
  (`OKT_STATUS.done`) og `domene2.tsx` (`OPPGAVE_STATUS.fullfort`) brukte nettopp
  `tone: "up"`. Lagt til ny tone `"warm"` → `TL.warm`, byttet begge "Fullført"-
  bruken dit. Samme brudd i `AdminHandlingssenterV2.tsx` sin "Fullført"-pille
  (TL.ok → TL.warm). Andre `tone: "up"`-bruk (Bekreftet/Betalt/Samtykke gitt/
  Påmeldt) er IKKE rørt — de er utenfor MAT-00s eksplisitte eksempel og en bredere
  endring ville vært å løse på sparket.
- Sitert i `train-lock.ts` (warm-tokenkommentaren).

## Ikke levert denne økten (spec'et, ikke bygget)

**B2** (iPad/Mac-brekk for PH-01/04/05/10/17): fasitene definerer 4–6 distinkte
vindusbredde-varianter PER skjerm (iPad compact/regular, Mac 1440, + tre
vindusstørrelser: halv/tredjedel/kvadrant — se PH-01-filen for full liste). Appen
har i dag INGEN bredde-avhengig rail/dock-mekanisme i `V2Shell`/`PortalChatHjem.tsx`
for PlayerHQ (kun fast bunn-navigasjon). Å bygge dette blindt — uten mulighet til å
screenshotte resultatet i denne økten (se miljøbegrensning øverst) — er en for stor
risiko på appens mest trafikkerte skjerm (I dag). Utsatt til en økt med fungerende
Vercel-preview/DB-tilgang for visuell iterasjon. Fasitfilene har alt som trengs
(eksakte breddegrenser, layout per bredde) — ingen ny research nødvendig, bare
implementasjon + skjermbilde-gate.

**B3/B4 lys** (`B3 Lys nøkkelskjermer/resterende`, `B4 Lys iPad Mac`): revidert,
IKKE re-bygget. Lys/mørk er ÉN mekanisme (`--tl-*` + `html[data-v2-tema="dark"]`),
så enhver TL-portert skjerm får lys GRATIS. Repo-bred grep etter hardkodet mørk hex
utenfor tokenfila (`src/components/{admin,portal}/v2`, `src/components/v2`) fant
ingen nye lekkasjer utover det C8 (#636, `docs/natt/LOOP-C8-DONE.md`) allerede
dokumenterte. De gjenstående kjente hullene (TM-ellipse/hullkart, auth-søsken,
Paper `T.ax`-filer) er alle enten bevisste unntak eller eies av andre bølger
(TL-port, ikke tilstander/lys) — se sitering i `train-lock-tokens.css`-headeren.

## Dekningstall

`node scripts/maal-fasit-dekning.mjs`: **105/204 → 114/204** sitert (99 → 90
mangler). +9: GAP-00, GAP-1, GAP-2 (3 filer), B1, MAT-00, MAT-01, B3 (2 filer),
B4. Coverage-scriptet måler SITERING, ikke faktisk pikselnærhet (§6 i
PIKSELPLAN) — GAP-2e og B2 (5 filer) er bevisst IKKE sitert siden de ikke er
bygget denne økten.

## Anbefalt neste steg

Ny økt (Sonnet, samme metode) med enten (a) ekte Supabase-tilgang i miljøet, eller
(b) en plan om å iterere via Vercel-preview-skjermbilder i stedet for lokal
dev-server, for å ta B2 (5 filer × opptil 6 brekk hver). B3/B4 «resterende» krever
ingen egen jobb utover det som allerede er verifisert her, MED MINDRE en skjerm
fortsatt står på Paper `T.*` — da er riktig fiks en TL-port (annen bølge), ikke en
lys-fiks i denne.
