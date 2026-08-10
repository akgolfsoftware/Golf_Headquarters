# Legge inn årsplanen — oppskrift

Skrevet 10.08.2026 for at Anders skal komme rett i gang neste morgen, uten å lete.
Gjelder golfgruppa ved WANG Toppidrett Fredrikstad.

**Kort versjon:** gå til `/admin/grupper` → velg gruppa → **Workbench**. Dra periodene inn på
tidslinja, fyll ut popup-en, trykk «Rull ut» til slutt. Alt er på plass i dag — ingenting
i designarbeidet blokkerer dette.

---

## 1. Hvor

| Hva | URL |
|---|---|
| Finn gruppa | `/admin/grupper` |
| **Årsplanen (her legges periodene inn)** | `/admin/grupper/<id>/workbench` |
| Lesevisning med kalender og turneringer | `/admin/grupper/<id>/arsplan` |
| Faste treningstider | `/admin/grupper/<id>/timeplan` |
| Skoledata (trinn, terminer) | `/admin/grupper/<id>/arsplan/skoledata` |

Workbench er innleggingsflaten. `/arsplan` er kun visning — den har ingen redigering.

---

## 2. De sju periodetypene

Dra fra paletten til venstre inn på tidslinja. Typene er låst i `LPhase`-enumet:

| Type | Bruk |
|---|---|
| **Grunn** | Grunntrening — volum, teknikk, base |
| **Spesial** | Spesialisering mot konkurranse |
| **Turnering** | Konkurranseperiode |
| **Testuke** | Uke satt av til testing |
| **Ferie** | Fri — ingen planlagt trening |
| **Treningssamling** | Samling over flere dager |
| **Heldagssamling** | Én hel dag |

Merk: dette er AK-formel **v1**-fasene (L-faser). `beslutninger.md` sier v2 ikke har L-faser,
men databasen bruker dem fortsatt som periodetyper. De fungerer — bare ikke forveksle dem med
motorikk-/press-nivåene i v2-formelen.

---

## 3. Hva du kan fylle ut per periode

Popup-en åpnes når du slipper en periode på tidslinja, og når du klikker en eksisterende.

| Felt | Format | Merknad |
|---|---|---|
| **Periodetype** | valgt ved dra | endres ved å slette og dra ny |
| **Startdato / sluttdato** | dato | sluttdato må være ≥ startdato |
| **Fokus** | fritekst, **maks 200 tegn** | f.eks. «Putting + nærspill» |
| **Ukevolum min / maks** | **timer** (desimaler ok) | lagres som minutter i basen |
| **Øktbudsjett** | antall økter/uke per område | se under |

### Øktbudsjettet er pyramidefordelingen

Dette er feltet du spurte etter. Fem områder, 0–21 økter per uke hver:

**FYS · TEK · SLAG · SPILL · TURN**

Summen vises under feltene («Sum: 12 økter/uke»). Lagres som JSON og zod-valideres ved lesing,
så en ugyldig verdi kan ikke ødelegge visningen.

---

## 4. Utrulling til spillerne

Knappen **«Rull ut til N spillere»** øverst kopierer gruppens perioder til hver spillers
**individuelle** årsplan.

Oppførsel du bør kjenne før du trykker:

- Bekreftelsesdialog viser antall perioder og antall spillere før noe skjer.
- Spillere som **allerede har en overlappende periode av samme type hoppes over** — ingenting
  overskrives. Navnene deres listes i kvitteringen.
- Gruppen beholder sin egen plan. Spillerne beholder sine individuelle planer. Utrulling er en
  kopi, ikke en kobling — senere endringer i gruppeplanen forplanter seg **ikke** automatisk.

**Rekkefølge som lønner seg:** legg inn hele årsplanen først, kontroller den, og rull ut til
slutt. Ruller du ut halvveis, må resten rulles ut i en ny runde, og du får en lengre
«hoppet over»-liste å lese gjennom.

---

## 5. Det du IKKE får lagret i morgen

Av de tre tingene du pekte på, er én dekket og to mangler felt i basen.

| Ønske | Status | Hva du gjør i morgen |
|---|---|---|
| **Pyramidefordeling** | ✅ **finnes** | Bruk øktbudsjettet (FYS/TEK/SLAG/SPILL/TURN) |
| **Mål per periode** | ❌ mangler felt | Skriv kortformen i **Fokus** (200 tegn). Fullt måltekst noteres utenfor systemet inntil feltet finnes |
| **Tester per periode** | ❌ mangler felt | Marker perioden som **Testuke**. Hvilke tester som inngår kan ikke lagres ennå |

Modellen har et `notes`-felt, men det er **ikke koblet til innleggingsskjemaet** — det kan ikke
fylles ut fra grensesnittet i dag.

Begge manglene krever nye felter på `GroupPeriodBlock`, altså en schema-endring. Den er
bevisst ikke gjort i natt: `prisma/schema.prisma` er ask-beskyttet av `beskytt.mjs`, og
schema-endringer skal ikke skje i en autonom økt. Fremgangsmåten når det skal gjøres står i
`.claude/rules/gotchas.md` §Schema-endringer — additivt via `db execute`, aldri `migrate dev`
eller `db push`.

---

## 6. Feller å unngå

- **Datoer:** lagres som UTC-midnatt med vilje. Legger du inn fra lokal maskin er dette
  allerede håndtert i `lokalDag()` — men ikke «fiks» det hvis en dato ser rar ut i en rå
  DB-spørring; den er riktig lagret.
- **Ukevolum er timer i skjemaet, minutter i basen.** Skriv `7,5` for sju og en halv time.
- **Fokus-feltet kuttes ved 200 tegn.** Lange målformuleringer hører ikke hjemme der.
- **Utrulling kan ikke angres samlet.** Det finnes ingen «rull tilbake»-knapp — perioder må
  fjernes per spiller hvis du ombestemmer deg.
