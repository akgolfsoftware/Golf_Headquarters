# T10 — Turneringer portet til Train-lock

**Dato:** 27.08.2026 · **Gren:** `claude/t10-turneringer-designsystem-81f035` (worktree
`teamnorway-wang-trainer-screens-4a5fa8` — allerede fersk fra `main` da økten startet, ny
worktree ble derfor ikke opprettet på nytt) · **Omfang:** `/admin/tournaments`,
`/admin/tournaments/[id]`, `/admin/tournaments/dubletter`, `/admin/turnering-kart`.

## Hva som ble gjort

| Fil | Endring |
|---|---|
| `src/components/admin/v2/tournaments/AdminTurneringerTrainLock.tsx` | **NY.** Erstatter `AdminTurneringerV2` (Paper T.\*) på listesiden. Master–detalj (A2): KPI-panel «Turneringer i tall» konstant til høyre, radene lenker videre (ingen inline-valg, i motsetning til Godkjenninger). |
| `src/app/admin/tournaments/page.tsx` | Bruker ny TL-komponent, `bredde="full"` (master–detalj-mønsteret). |
| `src/app/admin/tournaments/[id]/page.tsx` | Hode, KPI-rad, påmeldte-liste og resultatliste portet til TL (`TlKort`/`TlRadGruppe`/`TlRad`/`TlInspektorKpi`/`TlCaps`/`TlTilbake`). Kort dato-format lagt til for KPI-kortet (se Avvik). |
| `src/app/admin/tournaments/dubletter/page.tsx` + `merge-liste.tsx` | Full TL-port — selvstendig, ingen delte modaler. Nøytral status i stedet for grønn/lime («Sannsynlig dublett»). |
| `src/app/admin/turnering-kart/page.tsx` | Full TL-port — rent server-komponent, ingen klient-avhengigheter. |

## Om TU-01/TU-02-fasiten (viktig avvik fra en bokstavelig lesning av oppdraget)

`TU-01 Turneringer.dc.html` og `TU-02 Onsøy Open.dc.html` er **PlayerHQ-skjermer** — en
spillers «Analyse · Turnering»-liste over egne starter, med tilbake-lenke til «Meg» og en
gameplan-CTA. De er IKKE admin-skjermer for coachens turneringsdatabase (GolfBox-scrape,
dedup, resultatregistrering, påmelding av spillere).

Porten fulgte derfor CLAUDE.md sin regel «Port HTML 1:1: nei. Port oppførsel, hierarki,
copy»: TU-01s liste-rad-mønster (tittel + dato-rad, hårlinje, caps-etikett) er gjenbrukt
for listesiden, og TU-02s stat-kort-grid + panel-rad-mønster for detaljsiden — men
INNHOLDET er admin sitt (stall-KPI-er, dublett-varsel, chip-status, påmeldte/resultater),
ikke spillerens gameplan-tekst. Dette er dokumentert i filhodene på begge nye/endrede
filer. Flagg denne tolkningen til Anders — hvis TU-01/TU-02 var ment som en fasit for helt
andre admin-skjermer (f.eks. en fremtidig «mine turneringer»-visning et annet sted), sier
denne leveransen ifra om det.

## Bevisst IKKE portet (dokumentert avvik, innenfor anti-scope)

`TournamentForm`, `ResultForm` (`[id]/result-form.tsx`), `UnmergeBanner`
(`[id]/unmerge-banner.tsx`), `TournamentEnrollModal`/`PriorityPill`
(`coachhq/tournament-enroll-modal.tsx`) og `FellesmeldingFlyt` beholder sin eksisterende
v2/Tailwind-stil (trigger-knapper + modal-innhold). Årsak:

- Alle fem er egne modal-/skjema-komponenter — CLAUDE.md sier eksplisitt «Gjenbruk … Modal».
- Full TL-omskriving er ~1500 linjer på tvers av 5 filer — utenfor denne oppgavens
  erklærte omfang og oppdragets anti-scope («ingen refaktor av urørt kode»).
- De er kun brukt på `/admin/tournaments/[id]` (verifisert med grep) — ingen risiko for å
  påvirke andre skjermer, men porten deres bør gjøres i egen økt.

Synlig konsekvens: «Endre», «+ Legg til», «+ Nytt resultat» og «Send fellesmelding»
beholder rundede v2-knapper med grønn/nøytral aksent i stedet for TL sin hvite
primær-pille — verifisert i skjermbilde-gaten, ser akseptabelt ut i begge temaer men er
ikke 1:1 TL. Anbefalt oppfølging: egen liten økt for disse fem filene.

## Reell bug funnet og fikset under skjermbilde-verifisering

`TlRad` gjør HELE raden til en `<a>` når `href` er satt. Fellesmelding-pillen i `trailing`
var også en egen `<Link>` → **ugyldig nøstet `<a>`-i-`<a>`**, som ga en ekte
hydration-feil i nettleseren (verifisert med `read_console_messages` + DOM-sjekk
`document.querySelectorAll('a a').length`). Fikset ved å la KUN tittelen være lenke (som i
den opprinnelige `AdminTurneringerV2`/`TurneringTittel`-mønsteret) og legge chevronen
manuelt i `trailing` i stedet for via `TlRad`s innebygde `href`. Verifisert null nøstede
`<a>`-er etter fiks.

## Skjermbilde-gate (Anders 04.08.2026, presisert samme dag)

Verifisert i kjørende app (Vercel-mønster, lokal dev mot ekte Supabase-data — worktreens
`.env.local` er en pre-eksisterende symlink til rot-`.env.local`, ikke kopiert) som coach
`coachtest@akgolf.test`:

- `/admin/tournaments` — 390px + 1280px (master–detalj-panel), lys + mørk. ✅
- `/admin/tournaments/[id]` — 390px + 1280px, lys + mørk. ✅ (KPI-dato-kortet fikk kortere
  format etter første skjermbilde viste 4-linjers brekk med spelled-out måned/år)
- `/admin/tournaments/dubletter` — 1280px, lys + mørk. ✅
- `/admin/turnering-kart` — 1280px, lys + mørk. ✅

Ikke tatt formelt skjermbilde av: dubletter/turnering-kart på 390px (begge er
enkeltkolonne uten master–detalj-logikk som avviker fra allerede verifiserte mønstre i
samme økt — lav risiko per D-LYS-OG-5T-BESLUTNING.md §0.9, men bør sjekkes før merge om
Anders vil ha fullt 4-punkts skjermbilde på alle fire).

## npm run verify

Grønn — `prisma validate && prisma generate && tsc --noEmit && eslint --quiet src &&
check-action-auth && check-token-gap && check-critical-imports && check-doc-lenker &&
npm run build` (inkl. `next build` + serwist), EXIT:0. Kjørt i worktreen mot ekte
Supabase-data (symlinket `.env.local`) etter `npm ci` (Turbopack nekter symlinket
`node_modules` — kjent gotcha). Merk: en tidligere kjøring med bevisst dummy
`DATABASE_URL`/`DIRECT_URL` (for å unngå å røre ekte data under `prisma generate`) endte
opp med å overstyre de ekte, symlinkede credentials for HELE build-steget og feilet på
static generation av ikke-relaterte sider — retting: ikke sett dummy DB-env for annet enn
et frittstående `prisma generate`-kall.

## Ikke i denne runden

`tournaments/ny` (turneringsplanlegging → Workbench, beslutning 04.08 — urørt per
oppdrag). Portingen av de fem gjenbrukte modal-/skjema-komponentene (se over).
