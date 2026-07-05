# Brief til Claude Design — hovedskjermer i PlayerHQ

Kopier hele denne inn til Claude Design. Den er skrevet for å gi ferdige, komponerbare
skjermdesign — ikke løse komponenter — bygget av komponentene vi allerede har.

---

## Hva du designer

**PlayerHQ** — spillerappen i AK Golf HQ. Mobil-først, alltid lyst tema. Brukeren er en
seriøs golfspiller (junior til aspirerende Tour) som trener målrettet mot strokes gained.
Coachen (AgencyOS) legger planer; spilleren gjennomfører og følger fremgang.

**Jobben til appen:** på 5 sekunder skal spilleren se *hvor hen står* og *hva hen skal gjøre i dag*.
Verdiforslaget er coaching-intelligens: appen forteller deg hva du taper mest på og hva du skal trene.

## Skjermene som skal designes (i prioritert rekkefølge)

1. **Hjem** (`/portal`) — dagens inngang. Dommen (største SG-lekkasje + anbefalt handling) + dagens økt + SG-status.
2. **Analyse** (`/portal/analysere`) — «Min golf». SG-dybde, TrackMan, runder, tester i faner.
3. **Gjennomføre** (`/portal/gjennomfore`) — dagens program, start økt, logg.
4. **Planlegge** — spillerens Workbench-inngang (planen fra coach).
5. **Meg** (`/portal/meg`) — profil, utstyr, helse, abonnement.

Design **Hjem først** og fullt ut; de andre bygger på samme visuelle logikk.

## Komponentene du KOMPONERER fra (ikke tegn nye uten grunn)

Bruk disse — de finnes ferdig i kodebasen. Meld gap hvis noe mangler; ikke improviser ad-hoc UI.

**Fundament:** Button (pill, forest signal) · Card (hårfin, radius 16) · Eyebrow (mono-caps) ·
KpiTile (stort mono-tall + enhet + delta, teller opp) · DataTable · Sparkline.

**Golf-domene (signatur):**
- **NesteFokusKort** — «dommen, ikke grafen». Peker ut største SG-lekkasje + anbefalt trening i klarspråk. *Helten på Hjem.*
- **SgTotalKort** — SG total mot baseline: stort tall → trend → forklaring.
- **SgKategoriBar** — OTT/APP/ARG/PUTT som divergerende stolper fra null (tap venstre/rød, gevinst høyre/grønn).
- **SgTrend** — SG over tid med hendelsesmarkører (tester, periodeskifter).
- **Scorekort · TigerFiveKort · GappingChart · LaunchWindowKort · StrikeSmashKort · PuttModellKort · SlagLekkasjeKart · DiagnoseKort · SpillerTilstandKort · KategoriKravKort.**

Full kontrakt per komponent: `public/design-handover/components/**/prompt.md`.

## Inspirasjonskilder (hva «bra» ser ut som)

Ikke kopier — destillér prinsippet:
- **Whoop / Oura** — daglig «readiness»: ett tydelig tall + én anbefalt handling øverst. Dette er modellen for Hjem (NesteFokusKort som dommen).
- **Strava** — fremgang over tid, segmenter, «du slo din beste». Belønn utvikling.
- **Linear** — rolige flater, presist hierarki, ingen dekor uten jobb. For verktøy-/planflater.
- **Stripe** — tillit i flyt og skjema, tydelig primærhandling.
- **Apple Fitness / Things** — mobil-ergonomi, tommelvennlig, små gleder av bevegelse.
- **TrackMan** — dispersion og launch-data som tolkes, ikke bare vises (side i meter, negativ = venstre).
- **Bloomberg-terminal** — kun for AgencyOS-cockpit (tett data); PlayerHQ er luftig, ikke tett.

## Fasit og rammer (ufravikelig)

- **Fonter:** Familjen Grotesk (display/overskrift) · Inter (brødtekst) · JetBrains Mono (alle tall + eyebrows).
- **Farger:** forest #005840 (primær/CTA) · lime #D1F843 (aksent — KUN på mørke innfellinger, aldri lime-fyll på lys flate) · kritt-lys bakgrunn #F7F7F4. Semantiske farger (opp/ned) er ikke aksent.
- **Tall:** alltid mono, tabulær. Alltid enhet + retning («+2,4 slag», «12 m H» — aldri bare «12»).
- **Én accent-jobb per skjerm** — lime markerer den ene tingen brukeren skal se/gjøre.
- **Ikoner:** Lucide, 1,5px. Ingen emoji.
- **Språk:** norsk bokmål (æ/ø/å). Terminologi: Innspill/Nærspill (aldri «kortspill»), SG mot navngitt baseline, klarspråk for spiller (ingen fagkoder). Demo-navn: Øyvind Rohjan (spiller), Anders Kristiansen (coach). Ordbok: `public/design-handover/CLAUDE.md`.
- **Tilstander er produktet:** design hver skjerm med tom / lastende / full / feil-tilstand. En skjerm uten tomtilstand er en skisse.
- **Dagslys-krav:** kritisk data ≥ 7:1 kontrast, brødtekst ≥ 15–16 px (appen brukes ute i sol).

## To åpne valg du gjerne foreslår på

1. **Hjem-hierarki:** ledes skjermen av dommen (NesteFokusKort), av tallene, eller av dagens økt? (Vi lener mot dommen først + økt rett under.)
2. **Signal-knapp på lys flate:** forest med hvit tekst, eller forest med lime tekst?

## Leveranse

Per skjerm: en komposisjon av komponentene over, i lys mobil (390 px) + desktop-utvidelse, med
alle tilstander. Meld eksplisitt hvis du trenger en komponent vi ikke har — så porter vi den fra v13.
Verifiser mot `public/design-handover/guidelines/premium-referanse.html` som kvalitetsnivå.
