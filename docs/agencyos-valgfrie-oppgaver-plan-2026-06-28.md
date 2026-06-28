# AK Golf HQ — plan for valgfrie & utsatte oppgaver (2026-06-28)

> Oppfølger til Fase 1 (P0-robusthet + Coach-varsler levert). Disse er enten valgfri
> opprydding eller utsatte features. Hver oppgave er **grunnet i kode** (filer + kryssref
> verifisert), ikke gjettet. Ingen kode skrevet — dette er planen.

## Oversikt & anbefalt rekkefølge

| # | Oppgave | Type | Effort | Risiko | Trenger beslutning | Når |
|---|---|---|---|---|---|---|
| 1 | Token-migrering | Opprydding | M (i biter) | Lav–medium (visuell) | Nye tokens for noen farger | Nå, fil for fil |
| 2 | Dublett `calendar`/`kalender` | Refaktor | M | Medium (navigasjon) | Bekreft kanon | Etter #1 |
| 3 | Dublett `plan-templates` | Refaktor | S/M | Medium | Bekreft kanon | Etter #2 |
| 4 | MasteryRing + StreakTracker | Komponenter | S | Lav | Konsument-skjerm | Når en skjerm trenger dem |
| 5 | Umatchede resultater | Feature | L | — | Krever import-pipeline | Utsatt (blokkert) |
| 6 | Segment-tilstander (admin) | Opprydding | S men 139 filer | Lav | — | Anbefaler droppe |

---

## 1. Token-migrering (hardkodet hex → design-tokens)

**Hvorfor:** Prosjektet har en HARD regel mot hardkodet hex (kun semantiske tokens). I dag
ligger ~360 hex spredt i CSS/theme-filer. Migrering = én sannhet for farger, og temaer
(lys/mørk, WANG/Team Norway) virker overalt automatisk.

**Filer (ekskl. `globals.css` — den ER token-kilden, røres ikke):**

| Fil | Hex | Karakter |
|---|---|---|
| `src/components/planlegge-v2/styles.css` | 100 | ~50 % token-treff, resten egne grønntoner/off-white |
| `src/components/onboarding/onboarding.css` | 71 | ~85 % eksakte token-treff → nesten mekanisk |
| `src/components/booking/booking.css` | 36 | blandet |
| `src/components/workbench/workbench.css` | 32 | blandet |
| `src/components/workbench-hybrid/theme.ts` | 29 | TS-konstanter → pek på `src/lib/design-tokens.ts` (ikke CSS-var) |
| `src/components/hubs/hubs.css` | 26 | blandet |
| `src/components/teknisk-plan/teknisk-plan.css` | 19 | egne hex + cream-rester |
| `src/app/(marketing)/stats/stats.css` | 19 | marketing — lav prioritet |
| `src/app/team-gfgk/deck.css` | 25 | one-off deck — lav prioritet |

**Metode per fil (samme hver gang):**
1. **Audit** — list hver hex, klassifiser: **A** = eksakt token-match (mekanisk → `var(--token)`),
   **B** = nær variant (map til nærmeste token), **C** = genuint ny farge.
2. **Erstatt A + B** med `var(--token)` / Tailwind-utility.
3. **C:** legg nytt token i `globals.css` FØRST (spør Anders per farge), så bruk det.
4. **Verifiser visuelt:** screenshot før/etter av berørt skjerm — **0 synlig endring** er kravet
   (token-migrering skal ikke endre utseende, kun kilde).
5. Én fil = én commit. Stopp ved tvil om en farge.

**Rekkefølge innad:** onboarding (lett, høy verdi) → workbench + workbench-hybrid → planlegge-v2
→ booking → hubs → teknisk-plan. **Drop/utsett:** stats.css, team-gfgk/deck.css (marketing/one-off),
og alt under `internal/demos/*` (lav verdi — audit sa det).

**Risiko:** Feil token-map gir subtil visuell regresjon → derfor screenshot-gate per fil (steg 4).
**Effort:** M, men deles i biter. ~6 reelle filer.

---

## 2. Dublett-refaktor: `calendar`/`kalender`

**Problemet (verifisert):** Nav peker på `/admin/kalender` (har `page` + `uke` + `maned`), MEN
**5 komponenter lenker aktivt til `/admin/calendar`** (har `page` + `maned`). Begge rendrer en
kalender — bruken er splittet. Derfor er en blind redirect farlig.

**Aktive lenkere til `/admin/calendar`:** `calendar-view-toggle.tsx`, `calendar-day-view.tsx`,
`quick-add-session-modal.tsx`, `kalender/kalender.tsx`, `bookinger/ny-booking-wizard.tsx`
(+ `lib/all-routes.ts` registry, + `portal/STATUS.md` doc).

**Steg:**
1. **Bekreft kanon = `kalender`** (nav-kanon + mest komplett: har `uke`).
2. **Funksjonell sammenligning** `kalender/*` vs `calendar/*` — dekker kalender alt calendar gjør?
   Hvis `calendar/maned` har noe `kalender/maned` mangler → port det inn FØRST (ellers skjuler
   redirect et tap). Obligatorisk steg.
3. Oppdater de 5 komponentene + `all-routes.ts`: `/admin/calendar` → `/admin/kalender`.
4. Erstatt `calendar/page.tsx` + `calendar/maned/page.tsx` med `redirect()` (gamle bokmerker virker).
5. **Verifiser:** klikk-test alle kalender-innganger (view-toggle, day-view, quick-add, ny-booking)
   lander riktig + `npm run build`.

**Risiko:** Medium — står og faller på steg 2. **Effort:** M.
**Åpen beslutning:** bekreft `kalender` = kanon.

---

## 3. Dublett-refaktor: `plan-templates`/`plans/templates`

**Problemet (verifisert):** `/admin/plan-templates` er mest komplett (`page`/`ny`/`[id]`/
`[id]/rediger`/`[id]/effectiveness`) og er nav-kanon. MEN `plan-templates/page.tsx` lenker selv
til den GAMLE `/admin/plans/templates` for redigering, og `plans/templates` har sin egen
rediger-flyt (`actions.ts` + `rediger-client.tsx`).

**Steg:**
1. **Kanon = `plan-templates`** (mest komplett + nav).
2. Sammenlign `plan-templates/[id]/rediger` vs `plans/templates/[id]/rediger` — bekreft at
   plan-templates sin er komplett (begge `ny` + `effectiveness` finnes der).
3. Oppdater `plan-templates/page.tsx`-lenken: `/admin/plans/templates` → `/admin/plan-templates`.
4. Oppdater interne lenker i `plans/templates/[id]/rediger/*` → `plan-templates`.
5. Erstatt `plans/templates/*` med `redirect()` til `plan-templates`-ekvivalentene.
6. **Verifiser:** redigeringsflyt ende-til-ende + `npm run build`.

**Risiko:** Medium (to rediger-flyter — bekreft kanon er komplett før redirect). **Effort:** S/M.
**Åpen beslutning:** bekreft `plan-templates` = kanon.

---

## 4. MasteryRing + StreakTracker (komponenter)

**Hvorfor:** Nevnt i gap-analysen for spiller-progresjon / teknisk plan (gamification).

- **MasteryRing** — ring som viser mestring 0–100 % per ferdighet/drill. **Sjekk først om
  eksisterende `KpiRing` dekker behovet** (kan hende vi ikke trenger ny komponent).
- **StreakTracker** — kompakt «dager på rad»-visning (IKKE kalender; `StreakCalendar` finnes alt).

**Avhengighet (viktig):** Bygges når en konkret skjerm trenger dem — å bygge dem løst nå er
spekulativ kode (bryter «ingen spekulativ kode»-regelen). Når en konsument-skjerm finnes:
spec props fra den skjermen → bygg i `src/components/athletic/` → brand-review → bruk.

**Effort:** S hver. **Risiko:** Lav.

---

## 5. Umatchede resultater (UTSATT — forutsetning mangler)

**Hvorfor utsatt:** Det finnes **ingen bulk-resultat-import** som lager umatchede rader i dag
(verifisert: datagolf-sync = SG-baselines; turneringssync = fyller PublicPlayer-katalog; ingen
oppretter `TournamentResult`/`PublicPlayerRound`). Skjermen forutsetter en pipeline som ikke er bygd.

**Når en resultat-import bygges, da:**
1. `UnmatchedResult`-modell (kilde, rånavn, score/dato, foreslått `userId` via fuzzy-match, status).
   Additiv DB via `db execute` (`CREATE TABLE IF NOT EXISTS`, jf. gotchas — IKKE `migrate dev`/`db push`).
2. Importen skriver umatchede rader hit i stedet for å droppe dem.
3. `/admin/umatchede`-skjerm: liste + fuzzy-forslag + «koble til spiller»-handling → oppretter
   lenke + re-importerer raden.

**Effort:** L. **Blokkert til** import-pipeline bygges (egen beslutning/feature).

---

## 6. Segment-tilstander for admin (ANBEFALER DROPPE)

139 admin-undersider mangler EGEN `error.tsx`/`loading.tsx` — MEN admin-rot har begge, og de
**dekker hele undertreet** (Next.js error/suspense bobler opp). Gevinsten av 139 ekstra filer er
marginal. **Anbefaling: drop.** Alternativt: legg dem KUN på de 3–4 tyngste dataflatene hvis du
vil ha mer lokale skeletons. Ikke verdt en full sweep.

---

## Anbefalt sekvens

1. **Token-migrering** — onboarding + workbench først (høyest verdi, lavest risiko), i biter, screenshot-gate per fil.
2. **Dublett `calendar`** — etter funksjonell sammenligning.
3. **Dublett `plan-templates`**.
4. **MasteryRing/StreakTracker** — først når en skjerm trenger dem.
5. **Umatchede + segment-tilstander** — utsett / drop.

## Beslutninger jeg trenger fra deg

- **Token:** OK at jeg foreslår nytt token per «type-C»-farge underveis (spør deg per farge)?
- **Kanon:** bekreft `kalender` (#2) og `plan-templates` (#3) som kanon. *(Anbefalt.)*
- **Omfang token:** skal marketing/one-off-CSS (`stats.css`, `team-gfgk/deck.css`, `internal/demos/*`)
  være med, eller droppes? *(Anbefaler droppe.)*
