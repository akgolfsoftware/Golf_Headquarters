> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

# Plan — alt som ennå ikke er bygget (per 13.08.2026, etter W4-merge)

**Skrevet:** 2026-08-13, rett etter at W4-runden (#437/#438/#440/#441/#442/#443) gikk inn i main.
**Kilder:** `rutefasit.md` · `NATTRAPPORT-2026-08-13.md` · PP-W3/W4-VARIANTS · `beslutninger.md` ·
`masterplan-lansering-2026-08-12.md`. Lanserings-P0 (paneler, DKIM, Stripe, bryteren) styres
fortsatt av masterplanen — denne planen dekker KODE OG SKJERMER som ikke er bygget.

## Rekkefølgen (10 steg)

### Steg 1 — W5-variantene (største uberørte blokk)
Hele mal-tabellen i `rutefasit.md` §W5: marketing-sidene (tre skallvarianter), katalogrutene,
auth-flyt + samtykke, forelder-flaten (én mal med fanevisninger), system-tilstander som globalt
mønster i rot-layoutene. Kjøres som W4: parallelle byggeagenter per mal-familie, PR per familie,
galleri, sign-off. **Ingen kjente blokkeringer.** Anslag: 5 strømmer, samme størrelse som W4.

### Steg 2 — Drift-rest: brief + recording pixel-pass
`/admin/brief` og `/admin/recording` mot Paper-mønsteret (rutefasit §Drift, «eksisterende V2»).
Workspace/KommandoTask og dispatch-redirects kom i #439 — dette er de to som gjenstår. Liten jobb.

### Steg 3 — W3-rest som kan bygges uten beslutning
- `meg/help`-familien porteres til `gfgk-veileder-artikkel`-malen med PlayerHQ-chrome (ruter finnes).
- `CoachPlanerV2`/`CoachSgHubV2`: rydd Fragment-strukturen så slug-tagging blir entydig.
- Full pixel-verifisering av de 21 W3-rutene som ble slug-tagget i #434 (15 min per rute, mal ved siden).

### Steg 4 — W4-rest: tre egne skjerm-jobber
1. **`/admin/plans/[planId]`** — v2-komponentisering + fasitens inspektørpanel i full bredde.
2. **`DataTable`-komponent** (finnes ikke i `src/` i dag) + konvertering av `/admin/okter`;
   gjenbrukes senere av §9-tabellene ellers i AgencyOS.
3. **`/admin/spillere/[id]/plan/[planId]`** (nested detalj) — samme pass som plans/[planId].

### Steg 5 — Funksjonsbeslutning allerede tatt, kode mangler: tester
Fra `beslutninger.md` 04.08: Testbatteriet som eget ark i Workbench (design finnes i
`workbench-mobil.html`) + sync **TestResult → TalentHQ**. Blokkert av ÉN avklaring:
hvilke testprotokoller spilleren skal se (21 vs. 20 — spørsmål 5 under er IKKE dette;
dette er den gamle uavklarte fra 04.08). Bygges så snart Anders svarer.

### Steg 6 — Turneringsplanlegging inn i Workbench
`workbench-turnering.html` bygges som del av `WorkbenchV2` (vedtak 04.08). Ingen kode finnes.

### Steg 7 — DataGolf-skjermene inn i PlayerHQ
Vedtak 04.08: skjermene skal finnes i PlayerHQ. Omfang/plassering (egen flate vs. faner i
Analyse) er fortsatt uavklart — trenger Anders' valg før bygging (spørsmål 6 under).

### Steg 8 — W7-stats (~45 marketing-statssider)
Egen designrunde (blokkert av PR-F per rutefasit). Tegnes før koding — settes opp som egen
Claude Design-/fase2-bølge når Anders prioriterer den.

### Steg 9 — Kjente småting (løpende, ingen egen økt)
- Foreldreløse `admin/bookinger/bookinger.tsx` + `bookinger-view.tsx` (gamle `text-accent`) — slettes ved anledning.
- Bunn-ark under cookie-banner (gotcha «Ikke løst») — z-index-klassen.
- De sju `grid-cols-[3fr_2fr]`-komponentene uten `min-w-0` (latent, sjekkes når de porteres).
- Bølge 4-rest fra masterplanen: offline-kø for drill-reps → DB-persist.

### Steg 10 — Sign-off-runde for W4-galleriene
Anders går gjennom PP-W4-VARIANTS-radene (13 skjermbilder sendt 13.08) og setter `[x]`.
FIKS-punkter derfra går inn som småjobber foran steg 1-strømmene ved behov.

## Beslutninger som blokkerer deler av planen (svar når du kan)

| # | Spørsmål | Blokkerer |
|---|---|---|
| 1 | Skal Oppfølgingskø + Handlingssenter slås sammen med godkjenningskøen til fasitens «én flate»? | godkjenninger-konsolidering |
| 2 | Booking-veiviser: bygges om fra 5 til fasitens 3 steg (rører kollisjonsvern)? | booking-ny |
| 3 | Menynavn «Innstillinger» → «Oppsett»? (henger på rail-avklaringen) | oppsett-navn |
| 4 | Ruter fasiten nevner som ikke finnes: `foresporsler`, `klubb/integrasjoner`, `klubb/team(+inviter)` — bygges eller strykes fra fasiten? | W4-komplettering |
| 5 | `innstillinger/okter`: skal standardvarighet + påminnelsestid inn i datamodellen (`UserPreferences`)? | W3-rest |
| 6 | DataGolf i PlayerHQ: egen flate eller faner i Analyse? | steg 7 |
| 7 | `helse/symptom/ny` → BottomSheet-ark (strukturendring)? | W3-rest |
| 8 | `/portal/talent` hub: egen flate eller redirect til mitt-niva? | W3-rest |
| 9 | Testprotokoller synlig for spiller: 21 eller 20 (CANON)? | steg 5 |
| 10 | Grupper: skal workbench-fanen inn i fane-raden, eller forbli egen inngang? | grupper-komplettering |

## Anbefalt kjøring

Steg 1 (W5) er neste natt-/dagkjøring — samme oppsett som W4, ingen blokkeringer. Steg 2–4 kan
gå i samme kjøring som egne strømmer. Steg 5–7 venter på svarene over. Lanserings-P0 fra
masterplanen (paneler + bryteren) er fortsatt den korteste veien til lansert og går foran alt
dette om Anders vil lansere først.
