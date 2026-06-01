# Plan — menystruktur (IA) for Planlegge · Gjennomføre · Analysere

> 2026-06-01. Logisk omkobling av de tre hovedhubene i PlayerHQ mot de skjermene vi faktisk har.
> Mål: sidebar-undermeny og hub-landingsside skal vise SAMME punkter i SAMME rekkefølge, hver
> koblet til riktig (kanonisk) skjerm — ikke via redirect-omveier.

## Designprinsipp — treningssyklusen

PlayerHQ følger utøverens naturlige løkke. Hver hub svarer på ett spørsmål:

| Hub | Spørsmål | Tidshorisont |
|---|---|---|
| **Planlegge** | «Hva skal jeg gjøre?» | Fremover |
| **Gjennomføre** | «Hva gjør jeg nå?» | I dag |
| **Analysere** | «Hvordan gikk det?» | Bakover |

To regler for konsistens:
1. **Sidebar-undermeny = hub-landingssidens kort.** Samme punkter, samme rekkefølge.
2. **Én navigasjonsmodell:** hub-en er en landingsside med oversiktskort → hvert kort/menypunkt går til en **dedikert side**. (Vi dropper det halvferdige `?tab=`-mønsteret som gir redirect-omveier.)

---

## 1 · PLANLEGGE — «Legg planen»

Alt du eller coachen setter opp på forhånd, fra makro (år) til mikro (drill).

| # | Menypunkt | Skjerm (kanonisk rute) | Innhold | Status i dag |
|---|---|---|---|---|
| 1 | Årsplan | `/portal/tren/aarsplan` | Sesongperiodisering, makrosyklus | ✅ levende |
| 2 | Treningsplan | `/portal/tren/teknisk-plan` | Teknisk plan, P-posisjoner, uke-for-uke | ⚠️ redirecter til `?tab=` |
| 3 | Fysplan | `/portal/tren/fys-plan` | Styrke + kondisjon, periodisert | ✅ levende |
| 4 | Mål | `/portal/mal` | SMART-mål + milepæler | ⚠️ redirecter til `?tab=` |
| 5 | Turneringer | `/portal/tren/turneringer` | Påmelding + sesongkalender | ⚠️ redirecter til `?tab=` |
| 6 | Drills | `/portal/drills` | Øvelsesbibliotek (legg til i plan) | ✅ levende |

**Primær-knapp (hub):** `+ Ny plan` (velg type) · sekundært `+ Nytt mål`
**AI-hjelpere** (kort/knapp i relevant underside): Mål-bygger, Foreslå drill, Foreslå turnering (`/portal/ai/*`)

## 2 · GJENNOMFØRE — «Gjør jobben»

Utfør dagens arbeid, book tid, kjør live.

| # | Menypunkt | Skjerm (kanonisk rute) | Innhold | Status |
|---|---|---|---|---|
| 1 | I dag | `/portal/gjennomfore` | Dagens program (hub-landing) | ✅ levende |
| 2 | Kalender | `/portal/kalender` | Uke/måned med planlagte økter | ✅ levende |
| 3 | Booking | `/portal/booking` | Book Pro-time / TrackMan / gruppe | ✅ levende |

**Primær-knapp:** `+ Ny økt` (allerede topp-knapp) · sekundært «Be om time» (`/portal/onskeligokt`)
**Live-økt:** ikke eget menypunkt — kort på hub-en, startes fra en planlagt økt (fullscreen-modus).

## 3 · ANALYSERE — «Se resultatene»

Alt om hvordan det gikk: resultater, statistikk, innsikt.

| # | Menypunkt | Skjerm (kanonisk rute) | Innhold | Status |
|---|---|---|---|---|
| 1 | Statistikk | `/portal/analysere` | Oversikt + trender (hub-forside) | ✅ levende |
| 2 | Strokes gained | `/portal/mal/sg-hub` | Hvor du tjener/taper slag | ✅ levende |
| 3 | Runder | `/portal/mal/runder` | Loggførte runder + scorecard | ✅ levende |
| 4 | TrackMan | `/portal/mal/trackman` | TrackMan-økter + køllesnitt | ✅ levende |
| 5 | Tester | `/portal/tren/tester` | Ferdighetstester + baseline | ✅ levende |
| 6 | Innsikt | `/portal/analysere/hull` | Hull-analyse + AI-innsikt | ✅ levende |

**Primær-knapp:** `+ Loggfør runde` (`/portal/mal/runder/ny`) · sekundært `Importer TrackMan`

---

## Avvik i dag som rettes

1. **Hub-kort ≠ sidebar.** Planlegge-hub mangler Fysplan; Analysere-hub viser «Innsikt» mens sidebar viser «TrackMan». → Samkjør begge til listene over.
2. **Redirect-omveier i menyen.** «Statistikk» peker på `/portal/statistikk` (308 → analysere), Treningsplan/Mål/Turneringer peker på ruter som redirecter til `?tab=`. → Pek menyen rett på kanonisk rute.
3. **To navigasjonsmodeller blandet** (`?tab=` vs dedikerte sider). → Velg dedikerte sider, fjern/behold `?tab=`-redirects kun som fallback for gamle bokmerker.

## Hører IKKE under de tre (egne seksjoner — uendret)

- **Coach** (meldinger, planer, videoer, AI-caddie) · **Min profil** (abonnement, innstillinger, helse, dokumenter, bookinger) · **Talent** (roadmap, nivå — feature-flagget) · **Oversikt** · **Varsler**

---

## Beslutninger jeg trenger fra deg

1. **TrackMan** under Analysere (resultat-data) — OK? *(import «logg ny TrackMan-økt» blir en knapp i Gjennomføre)*
2. **Talent** — egen synlig seksjon, eller flytt under Analysere? *(i dag skjult bak feature-flag)*
3. **Navigasjonsmodell** — dedikerte sider (min anbefaling) bekreftes?

## Når godkjent — implementering (ett trekk)

1. Oppdater `MAIN_ITEMS` i `src/components/portal/sidebar.tsx` med listene over (kanoniske ruter).
2. Samkjør de tre hub-overview-kortene (`portal-{planlegge,gjennomfore,analysere}/*-overview.tsx`) med sidebar.
3. Rydd menylenker bort fra 308-redirects → kanoniske ruter.
4. Verifiser alle punkter levende (curl 200/307, ingen 308 fra meny).
