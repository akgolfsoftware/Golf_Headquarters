# AK Golf HQ — Komplett Claude Design-brief

> **Hva dette er:** ÉN selvstendig brief til Claude Design. Den inneholder alt: oppdrag, designsystem,
> full komponentkatalog, kvalitetsrubrikk (10/10), Workbench-som-master-hub, navigasjonskart (riktig
> skjerm bak riktig knapp), komplett funksjon→flyt-spec, og leveranseformat. Lim hele inn, eller gi som fil.
> Kode-forankret per 2026-06-25. Identiteten er LÅST og er et aktivum — dette handler om håndverk, ikke ommaling.

---

## 0 · GULLREGELEN — riktig skjerm bak riktig knapp (les to ganger)

Navigasjonskartet (del 6) er **fasit**. Design KUN skjermer som finnes der, plassér hver NØYAKTIG der kartet sier, hver knapp får en destinasjon fra kartet (ingen døde knapper). Mangler en destinasjon eller er noe uklart: **STOPP og spør Anders.** Ikke gjett, ikke finn opp ruter.

---

## 1 · HVA APPEN ER

AK Golf HQ forteller hver golfspiller — uansett alder/nivå — **nøyaktig hva de skal trene på for å nå neste nivå**, basert på data, og holder dem til det. **Tallet er helten. Diagnose, ikke gjetting.** Fire produkter under ett tak: **PlayerHQ** (spiller), **AgencyOS** (coach), **Forelder**, **Marketing**.

Fem ting som MÅ sitte: (1) Diagnose → neste nivå (nivå + 2–3 gap rangert etter slag-gevinst). (2) Stats inn lavfriksjon (manuell SG-import + slag-logging, ingen banekart V1). (3) Plan som følger diagnosen (ett trykk inn i Workbench; AI foreslår, spiller/coach godkjenner). (4) Mot proffene (persentil + utfordring vs pro). (5) Coach-loop i AgencyOS (se stall, hvem er bak, tildel/godkjenn plan).

Følelse: **Spiller** = «vet på 5 sek hva jeg skal i dag og hvorfor» — rolig presisjon i et tett cockpit, aldri mas. **Coach** = «ser umiddelbart hvem som trenger meg nå». **Forelder** = barnets fremgang, organisert og tydelig.

---

## 2 · DESIGNSYSTEM (LÅST — ikke avvik)

**Farger:** cream `#FAFAF7` (base, aldri ren hvit) · paper `#FFFFFF` (kort) · sand `#F1EEE5` · border `#E5E3DD` · `#C9C6BD` (sterkere skille) · muted `#5E5C57` · ink `#0A1F17` (tekst) · **forest `#005840`** (merke/primær) · **lime `#D1F843`** (signal). Status: ok `#1A7D56` · warn `#B8852A` · urgent `#A32D2D` · info `#2563EB`. Pyramide-akser: Fysisk forest · Teknisk warn · Golfslag info · Spill lime · Turnering urgent.

**Lime-regel (kritisk):** lime er krydder, ikke tapet. **Aldri lime tekst alene på lys bakgrunn** (mørk tekst på lime). Maks ett lime-element i synsfeltet, på det viktigste. På mørkt tema er lime tekst OK.

**Typografi:** Inter (UI) · **Inter Tight** (display/hero, tett tracking, editorial italic-aksent) · **JetBrains Mono** (ALLE tall/eyebrows/KPI, tabular-nums). Skala: Display-XL 56–72 (tracking −0.03em, italic-aksent på nøkkeltall) · Display-L 36–44 · Title 20–24 · Body 14–16 (lh 1.5) · Caption 12–13 · Mono-data 11–14 · Eyebrow 10–11 uppercase tracking 0.1em. Norsk format: komma-desimal, mellomrom som tusenskille, % etter mellomrom, 24t. Delta: ▲▼ + farge.

**Nøytral-rampe (dybde uten farge):** cream → paper → sand → border → #C9C6BD → muted → ink. **Elevasjon (varm, lav):** hvile = hårlinje · kort = `0 1px 2px / 0 2px 8px rgba(10,31,23,.04)` · overlay = `0 8px 24px rgba(10,31,23,.10)`. Aldri kald grå.

**Spacing:** 8pt-grid (8/16/24/32/48/64), data-tett 12/14. **Radius:** 8/14/20/28/full (knapper helt runde). Hårfine 1px-linjer organiserer rader/celler — ikke bokser overalt.

**Ikoner:** kun Lucide (1,5px stroke). Ingen emoji, ingen hjemmetegnede SVG.

**Tema per produkt:** PlayerHQ **ALLTID LYST** · AgencyOS **mørk «terminal» + lys-toggle** (default mørk) · Forelder/Marketing **lyst**. «Cockpit» = tetthet + hierarki, ikke nødvendigvis mørkt.

**Fire tilstander overalt:** innhold · tom (med «neste handling») · laster (skeleton, aldri spinner) · feil.

**Språk:** norsk bokmål, «du». «nærspill» (ikke kortspill), «spiller» (ikke elev), «økt» (ikke session), «statistikk» (ikke stats), «mål» (ikke goal). «ELITE» og «CoachHQ» vises ALDRI.

---

## 3 · KOMPONENTKATALOG (~57 — bygg ALLE, lyst + mørkt, identiske på tvers)

**A · Atomer:** Button (lime/forest/ghost, rounded-full pill, mono 12px bold uppercase, ≥44px mobil) · Badge · BadgeShelf · Avatar (tone regelstyrt) · Eyebrow · Delta (signert ▲▼) · GhostNumber (stort bakgrunns-tall) · ViewSwitcher (liste/kanban/kalender) · StatusPill · Chip/FilterPill · Toggle · PulseDot · SearchField (⌘K) · EmptyState · Skeleton.
**B · Hero & kort:** PageHero · PhotoHero · DetailHero · AthleticCard · FeaturedCard · HubCard · InsightCard · WellnessCard · TournamentCard · ShareCard · AuthCard.
**C · KPI & progresjon:** KpiCard · KpiStrip · StatTile · KpiRing · MasteryRing · GoalProgress · PersonalBest · LevelLadder (A–K) · StreakTracker.
**D · Data-viz (golf):** SgBar · SgBreakdown · Sparkline · TrendBand · PyramidProgress (5-akse) · PercentileGauge (vs pro) · SkillRadarLive · DispersionMap (slag-spredning) · RiskHeatmap · StableMatrix · TestMatrix · ClubMetricGrid · HoleStrip · RoundScorecard · JourneyMap · PlayerPipeline · LiveRepPulse.
**E · Tabeller & tavler:** DataTable Pro (rad ≥md → kort <md) · KanbanBoard (TODO/DOING/BLOKKERT/DONE) · InboxList · SettingsList.
**F · Kalendere & tidslinjer:** DayCal · WeekGrid · MonthGrid · YearPlanGantt · PeriodTimeline · ItineraryRow.
**G · Kommunikasjon & flyt:** MessageThread · QueueItem («hvem trenger meg nå») · WizardShell · CommandPalette (⌘K) · Sidebar + BottomNav + SubNav/Tabs + CockpitTabBar.

---

## 4 · KVALITETSRUBRIKK — hver komponent OG skjerm skal være 10/10 (ikke 3/10)

De 10 tingene som skiller mal fra verdensklasse, anvend på ALT:
1. Knivskarpt hierarki — tallet/diagnosen er den utvilsomme helten (Eyebrow → Display-tall → kontekst).
2. Typografi-presisjon — eksakte størrelser, tett tracking på display, mono tabular på alle tall.
3. Struktur via hårfine 1px-linjer + justering, ikke bokser. Maks ett kort-nivå.
4. Lime KUN som signal (maks ett per synsfelt).
5. Dybde uten farge — nøytral-rampe + varm lav elevasjon. Aldri flatt.
6. Tetthet med pust — streng 4/8-rytme, aldri vilkårlige px.
7. Alle fire tilstander designet like nøye.
8. Mikro-detalj — konsekvent radius, ens ikoner, fargede deltaer, baseline-justering.
9. Begge temaer like polert.
10. Piksel-presisjon — alt på rutenett, ingen «nesten».

**Arbeidsmåte:** etter hver komponent/skjerm, gi karakter 1–10 mot disse. Under 9 → iterer. Lever ikke før alt er ≥9. Konsistens på tvers er del av karakteren.

---

## 5 · WORKBENCH SOM MASTER-HUB (det operative hjertet)

Workbench er **hele appen** — hver funksjon nås og fullføres derfra; resten av nav er innganger dit. Tenk cockpit/IDE: **persistent shell** med venstre **sone-rail** · hoved-**canvas** · høyre **inspector** (kontekst+handlinger). Mobil: sone-bunn-nav + fullskjerm-canvas + bunn-ark-inspector. Alt skjer in-place — du forlater sjelden Workbench. Diagnosen/tallet alltid synlig som anker.

- **PlayerHQ Workbench — 7 soner:** I dag · Plan · Analyse · Utfør · Coach · Mål · Meg.
- **AgencyOS Workbench — 8 soner:** Cockpit · Stall · Spiller-Workbench · Planlegge · Gjennomføre · Innboks · Analyse · Drift. (Kjernen: **Spiller-Workbench** = coachens versjon av en spillers plan.)

---

## 6 · NAVIGASJONSKART — knapp → skjerm (FASIT)

### PlayerHQ `/portal` (LYST, 5 faner: mobil bunn-nav = desktop sidebar)
| Fane | Rute | Undersider |
|---|---|---|
| **Hjem** | `/portal` | «Start dagens økt»→live · «Se hele planen»→Plan · «Logg runde» · bjelle→`/portal/varsler` · avatar→Meg |
| **Plan** | `/portal/planlegge` (Workbench) | Årsplan `/tren/aarsplan` · Treningsplan `/tren/teknisk-plan` · Fysplan `/tren/fys-plan` · Mål `/mal` · Turneringer `/tren/turneringer` · Drills `/drills` · Coach-hub `/coach` (Oversikt·Planer·Øvelser·Videoer·SG-hub·Meldinger·AI) |
| **Gjør** | `/portal/gjennomfore` | Ny økt `/ny-okt` · Øktlogg · Treningslogg. Live = fullskjerm `/(fullscreen)/live/[id]` brief→active→summary |
| **Analyse** | `/portal/analysere` | Statistikk `/analysere` · SG `/mal/sg-hub` · Runder `/mal/runder` · TrackMan `/mal/trackman` · Tester `/tren/tester` · Innsikt `/analysere/hull` |
| **Meg** | `/portal/meg` | Profil · Abonnement `/meg/abonnement` (GRATIS/PRO 300 kr/mnd, ingen årlig) · Bookinger · Innstillinger · Helse · Utstyrsbag · Dokumenter · Hjelp · Sikkerhet |

### AgencyOS `/admin` (MØRK + lys-toggle). Cockpit `/admin/agencyos` (faner I dag·Live·Uka·Spillere·Økonomi·Caddie) + gruppert sidebar:
| Gruppe | Knapper → skjerm |
|---|---|
| **Daglig** | Oversikt `/admin/agencyos` · Ukeoversikt `/workspace` · Oppgaver `/workspace/oppgaver` · Tildelt meg `/workspace/tildelt-meg` |
| **Stall & talent** | Spillere `/spillere` · Stall `/stall` · Grupper `/grupper` · Talent (Radar/Sammenligning/WAGR) |
| **Operasjon** | Workbench `/coach-workbench` · Handlingssenter `/handlingssenter` · Planlegge (Treningsplaner/Plan-maler/Drills/Økter/Teknisk plan/Turneringer) · Gjennomføre (Kalender/Bookinger/Anlegg/Tilgjengelighet/Tjenester/TrackMan/Opptak) |
| **Analyse** | Stall-analyse · Risiko · Lag-snitt · Tester (+Foreslåtte/Fasiter) · Runder · Compliance · Reach · Rapporter |
| **Innboks** | Forespørsler `/foresporsler` · Godkjenninger `/godkjenninger` · Meldinger `/innboks` |
| **System** | Økonomi · Team · Integrasjoner · AI-agenter · E-postmaler · Audit-logg · Innstillinger |
| **Intern (ADMIN)** | Organisasjon · Stats-oversikt · Moderering · Portal-godkjenning |
Spiller-detalj `/admin/spillere/[id]`: faner Profil·Fremgang·Tester·Tildel test·Workbench·Plan. Anlegg=`/admin/anlegg` KANON. Økonomi/Team/Anlegg ADMIN-only.

### Forelder `/forelder` (lyst): Hjem · Barn `/barn/[id]` · Bookinger · Fakturaer · Økonomi · Ukerapport · Varsler · Innstillinger · Samtykke `/samtykke`.
### Marketing akgolf.no (lyst): Header Coaching·Slik trener vi·PlayerHQ·Priser·Anlegg·FAQ·Om oss (+Logg inn·Book tid). Footer: Tjenester·AK Golf·Ressurser (Blogg/Cases/Suksesshistorier/Junior)·Kontakt. Turneringer+stats UTE av v1. Booking: `/booking`→`/booking/[slug]`→bekreft→Stripe→kvittering (med «opprett konto»-bro).
### Auth: Login·Registrer·Glemt/Reset·Logget ut `/auth/logget-ut`·Onboarding-wizard·Foreldresamtykke `/auth/guardian-consent/[token]`.

---

## 7 · FUNKSJON → FLYT (knapp → skjerm → neste → resultat)

### PlayerHQ
- **Ny økt:** `Ny økt` → [type: teknisk/fys/spill/turnering] → [dato+tid] → [bygg: drills fra bibliotek + mål-kobling + varighet] → `Lagre` → **økt i planen (Uke/Gantt)**.
- **AI-foreslå plan:** `AI-foreslå` → [AI leser diagnose+mål] → forslag-økter i canvas → per-økt `Godkjenn`/`Avslå`/`Rediger` → **låst inn**.
- **Start økt:** `Start dagens økt` → [brief: oppvarming→hovedfase→avslutning] → `Start` → [aktiv fullskjerm, logg per rep ≤1 trykk, trygg Pause] → `Avslutt` → [sammendrag + feiring + hjemmelekse] → **logget, SG/streak oppdatert**.
- **Logg runde:** `Logg runde` → [bane→score→hull-detaljer valgfritt] → `Lagre` → **runde + SG/HCP/diagnose oppdatert**.
- **SG-import:** `SG-import` → [lim/last opp → bekreft mapping] → `Importer` → **SG + diagnose re-beregnet**.
- **Importer TrackMan:** → [velg/last opp → shot-tabell forhåndsvis] → `Lagre` → **TrackMan-økt lagret**.
- **Registrer test:** → [velg test → resultat] → `Lagre` → **test lagret, pyramide oppdatert**.
- **Lukk gapet (diagnose):** `Lukk gapet` på et gap → **Plan-sonen med AI-forslag for nettopp det gapet**.
- **Sammenlign mot pro:** → [persentil + benchmark vs Tour] → `Utfordring` → **utfordring lagt til Plan**.
- **Coach:** `Send melding`→tråd→`Send`→**varslet**. `AI-coach`→chat m/dine data. `Book økt`→[coach/anlegg→dag/tid→bekreft]→Stripe→**i Plan**.
- **Mål:** `Nytt mål`→[type/verdi/frist]→`Lagre`→**koblbart til økter**.
- **Meg:** Abonnement `Oppgrader`→300 kr/mnd Stripe-flyt. Hver underside egen flyt fra Meg-sonen.

### AgencyOS
- **Hvem trenger meg nå:** kø-rad → **Spiller-Workbench**.
- **Tildel plan:** `Tildel plan` → [velg spiller → plan-mal/AI-forslag fra diagnose → tilpass økter] → `Send til spiller` → **periodene lastes hos spilleren + varsel**.
- **AI-foreslå (coach):** → AI leser spillerens gap → forslag → `Godkjenn`/`Rediger` per økt → **låst inn**.
- **Ny økt (coach):** → [velg spiller/gruppe → type → tid → bygg] → **planlagt**.
- **Registrer test:** → [velg test → spiller → resultat] → **lagret, pyramide oppdatert**.
- **Innboks:** Forespørsel/Godkjenning → detalj → `Godkjenn`/`Avslå` → **status + spiller varslet**. Melding → `Svar`.
- **Gjennomføre:** `Ny booking`→[tjeneste/anlegg/tid→bekreft]. `Nytt anlegg`→LocationForm. `Sett tilgjengelighet`→tids-rutenett→lagre. `Ny tjeneste`→navn/varighet/pris.
- **Rapporter:** `Generer rapport`→[type→eksport CSV/PDF].
- **Drift (ADMIN):** `Inviter coach`→rolle. Økonomi/Integrasjoner/AI-agenter/Audit egne flater.

---

## 8 · HVA VISES HVOR (kjerneflater)
- **PlayerHQ Hjem:** foto/forest-hero «Hei, {fornavn}» (Inter Tight italic), HCP + neste turnering-teller, tier-pill «PlayerHQ · {tier}». Tett KPI-stripe (SG totalt/snittscore/neste økt) mono + signert delta. «Dagens økt»-kort. Coach-notat. Diagnose-kort: nivå + 2–3 gap rangert.
- **PlayerHQ Analyse:** diagnose først, SG-bar mot benchmark, faner. Tallet er helten.
- **AgencyOS Cockpit:** «hvem trenger meg nå»-kø (spiller+grunn+status-pill), dagens timeline, tett KPI-rad, «Tildel plan». 0 trykk til det viktigste.
- **AgencyOS Stall:** tett tabell (rad ≥md → kort <md), avatar-toner regelstyrt (lime=økt i dag, pri=haster). Rad→spiller-detalj.
- **Forelder Hjem:** barnets neste økt synlig ved innlogging (0 trykk), tett men forklart fremgangskort.

---

## 9 · LEVERANSEFORMAT
- **Én skjerm per artifact/fil**, navngitt etter ruten (f.eks. `PlayerHQ — Analyse (/portal/analysere)`).
- For hver skjerm: **fire tilstander** + **tre bredder** (375/768/1280).
- **Annotér hver knapp** med destinasjon fra kartet (del 6) / flyt (del 7) — entydig porting.
- Bygg av komponentkatalogen (del 3), aldri generiske default-komponenter.
- Start med kjerneflatene (PlayerHQ Workbench: I dag/Plan/Analyse/Utfør + AgencyOS Cockpit/Spiller-Workbench/Innboks), så resten.

## 10 · NÅR DU ER I TVIL
Ikke gjett på struktur, produkt eller Workbench. Mangler en knapp destinasjon, er innhold uklart, eller kolliderer noe med en låst regel: **list spørsmålet og spør Anders** før du designer videre. Rene visuelle/layout/tekst-valg innenfor reglene tar du selv.

---

*Kode-forankret per 2026-06-25. Del 6 (nav) + del 7 (flyt) er fasit for «riktig skjerm bak riktig knapp». Identiteten er låst; håndverket skal være 10/10.*
