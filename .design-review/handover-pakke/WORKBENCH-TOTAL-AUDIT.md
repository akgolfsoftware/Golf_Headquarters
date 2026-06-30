# WORKBENCH — TOTAL-AUDIT (komplett status + datakoblinger)

> **Hva dette er:** Fullstendig gjennomgang av *hver* Workbench-flate, -visning, -knapp og -funksjon: hva som er
> ferdig og koblet, hva som er visuell skinn (ikke wiret), og hva som faktisk mangler. + kart over hvilke
> plattform-data Workbench kan/bør koble seg mot for å bli navet. Bygger på `WORKBENCH-SLOYFE-SPEC.md`,
> `WORKBENCH-SWOT-OG-INTERAKTIVITET.md`, `KODE-SPEC-videreutvikling-funksjoner.md`.
> ⚠️ = Workbench-kjernen (Anders' domene) — bekreft før koding.
>
> **Statuskoder:** ✅ funksjonell (interaktivitet wiret) · ◑ skinn (vises, men ikke koblet til data/handling) · ⛔ mangler / stub.

---

## 1 · Surface-inventar — alle Workbench-filer

| # | Fil | Rolle | Status |
|---|---|---|---|
| 1 | `Workbench (hovedskjerm).dc.html` | Hoved-UI: 5 zoom + sidebar + quick-edit | ✅ rik interaktivitet (se §2) |
| 2 | `Workbench (hovedskjerm) v2 - coach-modus.dc.html` | Coach-variant: scope-velger, gruppe, bulk | ✅ bygd (1010 l.) — **var ikke i pakken, nå lagt inn** |
| 3 | `Workbench Funksjoner (full UI).dc.html` | Funksjonskatalog gruppert per sløyfe-fase | ✅ bygd (497 l.) — **nå lagt inn** |
| 4 | `Workbench Gap-til-okt (terminal).dc.html` | Diagnose-gap → dra inn som økt | ✅ dra-og-slipp wiret |
| 5 | `Workbench Plan - Planlegging, Skills og Trackman.dc.html` | Planlegging + ferdighets-/TrackMan-kobling i økt | ✅ bygd (246 l.) — **nå lagt inn** |
| 6 | `Workbench Trackman.dc.html` | TrackMan-parametere/mål i Workbench-kontekst | ✅ bygd (397 l.) — **nå lagt inn** |
| 7 | `Workbench Sløyfe-diagram (system).dc.html` | System-diagram av den lukkede sløyfa | ✅ bygd (137 l.) — **nå lagt inn** |
| 8 | `Workbench - Live volum-budsjett (terminal).dc.html` | Budsjett oppdateres live under dra | ✅ fasit (denne økten) |
| 9 | `PlayerHQ Plan-Workbench (terminal-lys).dc.html` | Spillerens inngang (lys, mobil) | ✅ bygd |
| — | `Workbench Evaluering (terminal).dc.html` | Evaluerings-/retrospektiv-flate | ✅ **NÅ BYGD** (var tom stub) — måloppnåelse-ring, SG-delta planlagt vs faktisk, vurdering 1–5, auto neste-anbefaling → «Bruk i neste plan» (lukker sløyfa) |

> **Audit-funn 1:** 5 ferdige Workbench-skjermer lå i prosjektet men **manglet i handover-pakken** — nå kopiert inn i pakken + begge puljer.
> **Audit-funn 2:** «Evaluering» fantes som tom stub — **nå bygd** denne økten: måloppnåelse, SG-delta (planlagt vs faktisk), compliance, vurdering (coach+spiller 1–5), og auto `nesteAnbefaling` som pre-fyller neste plan. Sløyfa er visuelt lukket; gjenstår å wire `nextRecommendation → plan/generate` ⚠️.

---

## 2 · Element-audit — hoved-UI (`Workbench (hovedskjerm)`)

### Toppbar
| Element | Status | Note |
|---|---|---|
| Logo + Workbench-merke | ✅ | |
| Spiller-chip (ØR) | ◑ | viser; bytte skjer via sidebar |
| Visnings-faner: Årsplan · År · Måned · Uke · Dag | ✅ | alle 5 bytter visning |
| «AI-periodiser» | ◑ | gir toast; ikke koblet til ekte generator ⚠️ |
| «Publiser» | ◑ | statisk — mangler utkast→publisert-tilstand ⚠️ |
| Sesongmål-stripe (HCP-mål + totalvolum) | ◑ | statisk visning |

### Sidebar
| Element | Status | Note |
|---|---|---|
| Spillere (liste, bytt aktiv) | ✅ | klikk bytter (toast); coach-scope |
| Plan-nav: Sesongmål / Standardøkter / Teknisk plan / Maler | ◑ | **lenker ikke wiret** — skal rute til respektiv flate |
| Pyramide nå (5 nivåer) | ◑ | statiske barer — skal lese live pyramide-indeks |
| Analyse-mini (SG totalt + kategorier + plan %) | ◑ | statisk — skal lese live SG |

### Visninger
| Visning | Status | Detalj |
|---|---|---|
| **Årsplan (Gantt)** | ✅/◑ | periode-barer **dra + strekk wiret**; volum-heatmap beregnes av periodene; AI-advarsel statisk |
| **År (12-mnd volum)** | ◑ | barer fargelagt av periode — statiske data |
| **Måned (budsjett + kalender)** | ◑ | pyramide-budsjett + juni-rutenett; dag-klikk gir toast (ikke navigasjon) |
| **Uke (dag-kolonner)** | ✅ | **dra-og-slipp økter, bibliotek-dra-inn, kontekstmeny, kopier uke, AI-fyll, angre** — alt wiret |
| **Dag (timeplan)** | ◑ | statisk timeline |

### Quick-edit-skuff (åpnes fra økt)
✅ åpne/lukke wiret. Innhold (rikt, men **kontrollene er visuell skinn**, ikke bundet input): navn · tid · varighet · sted/anlegg · miljø · mål/hensikt · intensitet · treningsområde · **AK-formel (6 felt)** · **L-faser (reps+tid)** · drills fra øvelsesbank · TrackMan-parametere · forventet SG · gjenta · notat/video/fil · tildel (spiller/gruppe). → **Wiring-jobb:** bind hvert felt til `Økt`-objektet (§5 i SLOYFE-SPEC).

### Kontekstmeny
✅ Rediger / Dupliser / Slett — wiret (dupliser + slett endrer state, angre finnes).

---

## 3 · Den ene reelle luken — Evaluerings-flaten (⛔ bygg)
`Workbench Evaluering` er tom. Dette er **kanten som lukker sløyfa** (`Evaluering → Plan`). Uten den er Workbench en åpen linje. Bygg fra datamodellen som allerede er spesifisert:
- **Datamodell:** `Evaluation` i `KODE-SPEC-videreutvikling-funksjoner.md §5` (scope, goalProgress, sgDelta, coach/playerRating, **nextRecommendation**).
- **Innhold:** økt- + periode-retrospektiv · måloppnåelse % · SG-delta per kategori/vindu · coach- + spiller-vurdering (1–5) · auto-generert `nesteAnbefaling` som **pre-fyller neste planlegging**.
- **Skinn:** terminal, samme språk som resten. 4 states.
- **Prioritet:** høyest av alt Workbench-relatert — den gjør linje → ring.

---

## 4 · Wiring-gap (skinn → koblet) — prioritert
Det meste finnes visuelt; jobben er å **koble**:
1. ⚠️ **Quick-edit-felt → `Økt`-objekt** (alle felt i §2-skuffen) — uten dette lagres ikke redigering.
2. ⚠️ **AI-periodiser / AI-fyll → ekte generator** (i dag toast) — fra mål + svakeste SG.
3. **Sidebar Plan-nav → ruting** (Sesongmål/Standardøkter/Teknisk plan/Maler).
4. **Pyramide + Analyse-mini → live data** (i dag statisk).
5. ⚠️ **Publiser → utkast/publisert-tilstand** + coach→spiller-propagering.
6. **År/Måned/Dag-visninger → ekte data + navigasjon** (Uke + Årsplan er allerede interaktive).

---

## 5 · Workbench som NAV — datakoblings-kart
> «Hvor mye funksjon og data kan Workbench koble seg mot?» Dette er svaret: alt det sentrale på plattformen møtes her. Hver kant er en konkret integrasjon.

### Data INN (Workbench leser)
| Kilde | Hva den gir Workbench | Status |
|---|---|---|
| **SG-profil / diagnose** | svakeste kategori → volum-vekt, gap-kort (`Gap-til-okt`) | ◑ visuelt, bind til SG-modell |
| **Tester (testbatteri)** | startnivå låser blokk ⚠️; FYS-indeks → pyramide | ◑ |
| **TrackMan** | parametere + målverdier i økt (`Workbench Trackman`) | ◑ |
| **Mål / Sesongmål** | styrer periodisering + budsjett | ◑ |
| **Øvelsesbank / drills** | fyller økt; evidens-tagget SG-løft per drill | ◑ |
| **Booking / anlegg / kapasitet** | bind økt til bås/tid (`Økt.booking`) ⚠️ | ⛔ logistikk-kant |
| **Kalender** | tilgjengelighet, kollisjoner | ⛔ |
| **Belastning: RPE / søvn / hvilepuls (FYS)** | ACWR-vakt ⚠️ | ⛔ beregnes |
| **Turneringskalender** | auto-taper før turnering | ⛔ |
| **Vær** | flagg ute-økter | ⛔ (forslag) |
| **Pyramide-indeks** | balanse-budsjett per trinn | ◑ |

### Data UT (Workbench skriver/utløser)
| Mål | Hva Workbench sender | Status |
|---|---|---|
| **Live-økt / gjennomføring** | `Økt[PLANLAGT→KLAR]` → start-økt + L-fase-logging | ◑ kobling |
| **Cockpit «hvem trenger meg»** | etterlevelse / ubookede økter / SG-fall | ◑ |
| **Evaluering → neste plan** | `nextRecommendation` lukker ringen ⚠️ | ⛔ (krever §3-flate) |
| **Foreldrerapport** | periode-retrospektiv på kadens | ⛔ |
| **Spiller (fra coach)** | tildelt plan propagerer ⚠️ (fan-out) | ◑ coach-modus finnes |
| **Analyse-attribusjon** | planlagt fokus vs. faktisk SG-bevegelse | ⛔ |

> **Kjernepoeng:** Workbench rører **11 datakilder inn** og **6 mål ut**. Det er navet — men flertallet av kantene er i dag *visuelle*, ikke koblet. Veien til «100 %» er primært **wiring + de 3 manglende kantene** (booking-logistikk, belastning/ACWR, Evaluering→Plan), ikke ny UI.

---

## 6 · Scorecard + vei til 100 %
| Lag | Status |
|---|---|
| Visuelle flater | **100 %** (alle 10 bygd — Evaluering nå på plass) |
| Interaktivitet (Uke + Årsplan) | ✅ wiret |
| Interaktivitet (År/Måned/Dag/quick-edit/sidebar) | ◑ skinn → wiring |
| Datakoblinger inn/ut | ◑/⛔ flertall ikke koblet |
| Lukket sløyfe (Evaluering→Plan) | ⛔ |

**Rekkefølge til 100 %:**
1. ⚠️ Bekreft `Økt`/`Evaluering`/tilstandsmaskin/fan-out med Anders.
2. **Bygg Evaluerings-flaten** (§3) → lukk ringen.
3. **Wire quick-edit-felt → `Økt`** (§4.1) → redigering lagres.
4. **Koble live data inn** (SG, pyramide, tester) (§5) → flatene slutter å være statiske.
5. **Logistikk + ACWR + booking-kant** (§5) → planen blir gjennomførbar + trygg.
6. **AI-generator + utkast/publisert + propagering** (§4.2/4.5).
7. År/Måned/Dag → ekte data.

> Knytt hver bygd/wiret flate til `KOMPLETT-SKJERMKART.md` + `Rute-til-fil-register`. Implementerings-fasit: `KODE-SPEC-videreutvikling-funksjoner.md` + `WORKBENCH-SLOYFE-SPEC.md`.

---

## 7 · Funksjons-backlog 2 — nye funksjoner å legge til
> Utover det avtalte (SLOYFE §7–8, SWOT §F). Prioritert. ⚠️ = Workbench-kjerne, bekreft med Anders.

### Mål & prognose
- **Mål-objekt i Workbench** — delmål + milepæler knyttet til turneringskalender (mål bor i Oversikt, redigeres her). Status: ✅ tegnet (`Workbench Maal-prognose`).
- **Sesongmål-prognose** — bane-projeksjon: «ved nåværende tempo når du HCP 3,8 til EM-kvalik». On track / off track mot frist. Status: ✅ tegnet.

### Restitusjon & helhet (utover ACWR)
- **Hvile/deload som førsteklasses** — hviledager, deload-uker, mobilitet + søvn som planlagbare blokker. Status: ✅ bygd (`Workbench Tillegg`).
- **Ferdighets-vedlikehold (spaced repetition)** ⚠️ — re-tren mestret ferdighet før den forfaller. Status: ✅ bygd (`Workbench Tillegg`).

### Kontekst-koblinger (nav)
- **Utstyr & miljø per økt** — ✅ bygd. **Ressurs/økonomi** ⚠️ — ✅ bygd. **Skole/forelder** — ✅ bygd. **Reise/borteturnering** — ✅ bygd. (`Workbench Tillegg`)

### Plan-kvalitet & samarbeid
- **Plan-kvalitetsscore** — ✅ bygd. **Selvbooking** — ✅ bygd. **Kommentartråd** — ✅ bygd. **Plan-eksport/deling** — ✅ bygd. (`Workbench Tillegg`)

### Integrasjon
- **Sidebar «Plan»-nav wiret** i `Workbench (hovedskjerm)` → lenker til Mål-prognose, Evaluering, Volum-budsjett, Trackman, Funksjoner. Workbench henger nå sammen som én hub.
- **`Workbench Komplett (terminal).dc.html`** — den komplette integrerte skjermen: wiret sidebar + sesongmål-stripe + uke-cockpit med live volum-budsjett + høyre «Hele sløyfa»-skinne (Mål-prognose · Belastning/hvile · Evaluering · Plan-kvalitet · SG) som lenker til hver delflate. Dette er Workbench som ett hele.
- **`Workbench Underskjermer (terminal).dc.html`** — alle sub-nivå-flater/modaler tegnet: full økt-editor, drill-bibliotek + drill-detalj, mal-/standardøkt-bibliotek, periode-editor ⚠️, gruppe fan-out ⚠️, milepæl-editor, ekspansjoner (alle 18 hull), standardøkt-hurtigvalg.
- **`Workbench Demo (interaktiv).dc.html`** — klikkbar demo som binder alle skjermene (inkl. underskjermer) med ekte knapper.

**Topp 3 (effekt ÷ risiko):** sesongmål-prognose · hvile/deload førsteklasses · mål-objekt med milepæler. De to første prognose-/mål-flatene er tegnet i `Workbench Maal-prognose (terminal).dc.html`.
