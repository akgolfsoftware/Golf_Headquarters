# Brief til Claude Design — hovedskjermer i PlayerHQ + AgencyOS

Kopier hele denne inn til Claude Design. Den er skrevet for å gi ferdige, komponerbare
skjermdesign — ikke løse komponenter — bygget av komponentene vi allerede har.

**Oppdatert 2026-07-06:** revidert mot faktisk repo-tilstand. Analyse («Min golf») er allerede
bygget og fjernet fra listen. Gjennomføre er allerede komponert og fjernet. Lagt til AgencyOS-
seksjon (var ikke dekket før).

---

## Hva du designer

**To apper i samme designsystem.** PlayerHQ er spillerens app — mobil-først, alltid lyst tema.
AgencyOS er coachens app — desktop-først, mørkt tema (Bloomberg-tett). Samme komponentbibliotek,
samme tokens, ulikt informasjonstrykk: PlayerHQ er luftig og motiverende, AgencyOS er tett og rask.

Brukeren i PlayerHQ er en seriøs golfspiller (junior til aspirerende Tour) som trener målrettet
mot strokes gained. Coachen (AgencyOS) legger planer; spilleren gjennomfører og følger fremgang.

**Jobben til PlayerHQ:** på 5 sekunder skal spilleren se *hvor hen står* og *hva hen skal gjøre i dag*.
**Jobben til AgencyOS:** på 5 sekunder skal coachen se *hvilken spiller trenger meg nå*.

---

## DEL 1 — PlayerHQ (spiller, lyst tema, mobil 390 px)

### Skjermene som skal designes (prioritert rekkefølge)

1. **Hjem** (`/portal`) — dagens inngang. Dommen (største SG-lekkasje + anbefalt handling) + dagens
   økt + SG-status. **Ikke bygget ennå — høyest prioritet i hele denne runden.**
2. **Planlegge** — spillerens Workbench-inngang (planen fra coach, kun lesevisning + åpne-lenker).
3. **Meg** (`/portal/meg`) — profil, utstyr, helse, abonnement. Lavest visuell kompleksitet, men
   berører flest brukere daglig (kontoinnstillinger).

*(Analyse og Gjennomføre er allerede designet og bygget — ikke inkludert her.)*

Design **Hjem først** og fullt ut; de andre bygger på samme visuelle logikk.

### Komponentene du KOMPONERER fra (ikke tegn nye uten grunn)

Bruk disse — de finnes ferdig i kodebasen. Meld gap hvis noe mangler; ikke improviser ad-hoc UI.

**Fundament:** Button (pill, forest signal) · Card (hårfin, radius 16) · Eyebrow (mono-caps) ·
KpiTile (stort mono-tall + enhet + delta, teller opp) · DataTable · Sparkline.

**Golf-domene (signatur):**
- **NesteFokusKort** — «dommen, ikke grafen». Peker ut største SG-lekkasje + anbefalt trening i klarspråk. *Helten på Hjem.*
- **SgTotalKort** — SG total mot baseline: stort tall → trend → forklaring.
- **SgKategoriBar** — Tee-slag/Innspill/Nærspill/Putting som divergerende stolper fra null (tap venstre/rød, gevinst høyre/grønn).
- **SgTrend** — SG over tid med hendelsesmarkører (tester, periodeskifter).
- **Scorekort · TigerFiveKort · GappingChart · LaunchWindowKort · StrikeSmashKort · PuttModellKort · SlagLekkasjeKart · DiagnoseKort · KategoriKravKort.**

Full kontrakt per komponent: `public/design-handover/components/**/prompt.md`.

### Inspirasjonskilder (hva «bra» ser ut som — PlayerHQ)

Ikke kopier — destillér prinsippet:
- **Whoop / Oura** — daglig «readiness»: ett tydelig tall + én anbefalt handling øverst. Dette er modellen for Hjem (NesteFokusKort som dommen).
- **Strava** — fremgang over tid, segmenter, «du slo din beste». Belønn utvikling.
- **Apple Fitness / Things** — mobil-ergonomi, tommelvennlig, små gleder av bevegelse.
- **TrackMan** — dispersion og launch-data som tolkes, ikke bare vises (side i meter, negativ = venstre).

### Fasit og rammer (ufravikelig — PlayerHQ)

- **Fonter:** Familjen Grotesk (display/overskrift) · Inter (brødtekst) · JetBrains Mono (alle tall + eyebrows).
- **Farger:** forest #005840 (primær/CTA) · lime #D1F843 (aksent — KUN på mørke innfellinger, aldri lime-fyll på lys flate) · kritt-lys bakgrunn #F7F7F4. Semantiske farger (opp/ned) er ikke aksent.
- **Tall:** alltid mono, tabulær. Alltid enhet + retning («+2,4 slag», «12 m H» — aldri bare «12»).
- **Én accent-jobb per skjerm** — lime markerer den ene tingen brukeren skal se/gjøre.
- **Ikoner:** Lucide, 1,5px. Ingen emoji.
- **Dagslys-krav:** kritisk data ≥ 7:1 kontrast, brødtekst ≥ 15–16 px (appen brukes ute i sol).

### Åpne valg du gjerne foreslår på (Hjem)

1. **Hjem-hierarki:** ledes skjermen av dommen (NesteFokusKort), av tallene, eller av dagens økt? (Vi lener mot dommen først + økt rett under.)
2. **Signal-knapp på lys flate:** forest med hvit tekst, eller forest med lime tekst?

### Eksakt tekst å bruke (Hjem — kopier direkte)

```
Tier-pill: PlayerHQ · PRO
Eyebrow (dato): SØN 6. JULI · 08:20
Hero-tittel: God morgen, Øyvind. (italic på fornavn)
Undertekst: Én økt i dag. Største gevinst ligger fortsatt i innspill.

NesteFokusKort (dommen):
- Eyebrow: NESTE FOKUS
- Verdikt: Innspill 50–100 m er største lekkasje
- Bevis: ↘ −0,8 slag · Innspill · mot Broadie scratch
- Forklaring: Du taper mest fra kort avstand inn. Én innspill-økt i uka lukker mesteparten av gapet mot Tour-snitt.
- Benchmark: Tour-snitt: +0,4 slag
- Handling (knapp): Legg inn innspill-økt

Start-CTA (lime primary + play): Start økt

SgTotalKort:
- Eyebrow: SG TOTAL
- Verdi: +2,4 slag · trend ↗ +0,4
- Meta: siste 12 runder · mot Broadie scratch
- Forklaring: Formen stiger — du henter mest på tee og putting.

KPI-strip: SG TOTALT +2,4 · RUNDER 12 (siste 90 d) · SNITTSCORE 72,4

Dagens plan:
- Eyebrow: DAGENS PLAN
- Økt-rad: Innspill 200–50 · 09:00 · 2 drills · 60 min

Coach-notat:
- Eyebrow: COACH
- Navn: Anders Kristiansen · HEAD COACH · 3 t
- Melding: «Denne uka prioriterer vi innspill fra 50–100 meter — der ligger den største SG-gevinsten din nå.»

Tomtilstander:
- Ingen økt i dag: «Ingen økt planlagt i dag.» + knapp «Planlegg økt →»
- Ingen SG ennå: verdi — + «Spill din første runde for å se hvor slagene tapes og vinnes.»
```

---

## DEL 2 — AgencyOS (coach, mørkt tema, desktop-først)

**Viktig avgrensning:** `/admin/agencyos` («Cockpit», daglig briefing med business-KPIer) **finnes
allerede og skal IKKE redesignes i denne runden.** Det som mangler er en annen skjerm med et annet
formål — se under.

### Skjermen som skal designes

1. **Stall** (`/admin/stall`) — coachens roster-oversikt. **Ikke komponert med designsystemet
   ennå** (bruker egne, eldre kort — ikke `SpillerTilstandKort`). Dette er skjermen der coachen skal
   lese tilstanden til HELE stallen på 5 sekunder: hvem trenger meg i dag, hvem har økt, hvem haster.
   **Høyest AgencyOS-prioritet.**

### Komponentene du komponerer fra (AgencyOS)

- **SpillerTilstandKort** — kortet i grid-et. Én per spiller: navn, HCP, kategori, SG-tilstand-prikk (lime = økt i dag, coral = haster, nøytral = ellers).
- **KpiTile, DataTable** — samme fundament-komponenter som PlayerHQ, men i mørkt tema og tettere spacing.
- Klikk på et kort skal åpne full spilleranalyse — **gjenbruk PlayerHQ sine Analyse-komponenter i coach-dybde**, ikke en duplisert visning (arkitekturprinsipp: én implementasjon, rolle `spiller|coach`).

### Fasit og rammer (ufravikelig — AgencyOS)

- **Tema:** mørk base, near-black `#0A0B0A` (IKKE grønn-mørk). Data-tett, Bloomberg-referanse for tetthet — men rolig, ikke støyende.
- **To tall, aldri blandet:** Plan-kvalitet (0–100) og Gjennomføring (%) er separate hero-tall, aldri slått sammen til ett.
- **Coach ser fagkoder + navn** (`TEK · INN150 · L-BALL · CS70 · M2 · PR2`) — motsatt av PlayerHQ som kun viser klarspråk.
- **Anbefalinger, aldri sperrer:** avvik vises som synlig chip + klarspråk-forklaring; sterkt avvik gir tydeligere chip + automatisk coach-varsel. Ordene «brudd», «overstyr», «krever begrunnelse» finnes ikke i UI.
- **Ikoner:** Lucide 1,5px. Ingen emoji.

### Eksakt tekst å bruke (Stall — kopier direkte)

```
Eyebrow: MIN STALL
Hero-tittel: Min stall
Undertekst: 38 aktive spillere · sortert etter oppfølgingsbehov
Spillerkort: Øyvind Rohjan · HCP +3,5 · KAT A · SG-tilstand-prikk (lime = økt i dag, coral = haster)
Filter: Alle · Trenger oppfølging · NM-spor · Junior
Tomtilstand: «Ingen spillere i stallen ennå.»
```

---

## Leveranse (begge apper)

Per skjerm: en komposisjon av komponentene over, i riktig standardbredde (PlayerHQ: lys, 390 px
mobil + desktop-utvidelse · AgencyOS: mørk, desktop 1280 px), med alle tilstander (tom / lastende /
full / feil). Meld eksplisitt hvis du trenger en komponent vi ikke har — så porter vi den fra v13.
Verifiser mot `public/design-handover/guidelines/premium-referanse.html` som kvalitetsnivå.
