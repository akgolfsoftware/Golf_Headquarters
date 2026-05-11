# AK Golf Web — FAQ

## Identitet

- **Produkt:** Web
- **URL:** `/faq`
- **Arketype:** Web — kategorisert FAQ med soek
- **HTML-referanse:** `wireframe/screen-deck/web/faq.html`
- **Audit:** `wireframe/audit/web-faq.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Sentralisert FAQ-side. Reduserer support-tickets, oker konverterings-rate
ved aa svare pa spørsmål før de blir blockers. Kategorisert + søkbar.

## Layout — UNIKT

### 1. Subhero (#0A1F18 gradient, 80px)

- Eyebrow: `OFTE STILTE SPORSMAL`
- H1: `*Vi har svaret*. Sannsynligvis.`
- Sub: `40+ vanlige sporsmal med svar. Sok, eller bla i kategorier.`
- Sok-felt: `Sok i FAQ` (sentrert, large 480px med ikon)

### 2. Kategori-velger (lys, sticky, 64px)

Horisontal chip-rad:
- Alle (40)
- Coaching (12)
- Pris og betaling (8)
- Junior (6)
- Talent (5)
- Bedrift (4)
- Anlegg (3)
- Personvern (2)

### 3. FAQ-liste (lys, 96px, narrow 880px sentrert)

Per kategori: H2-header + accordion-liste.
Hver FAQ-rad:
- Sporsmal (Inter Tight 18px) + chevron
- Klikk -> expand til svar (Inter 16px, line-height 1.6)
- Tilhorende lenker etter svar: "Les mer i: /tjenester"

**Eksempel-sporsmal per kategori:**

**Coaching (12)**
- Hva er forskjellen pa 1:1 og abonnement?
- Kan jeg velge coach?
- Tilbyr dere online coaching?
- Hva inkluderes i en TrackMan-okt?
- Kan jeg booke samme coach hver gang?
- ...

**Pris og betaling (8)**
- Hvordan betaler jeg?
- Refunderes ubrukte timer?
- Kan jeg bytte tier?
- Hva er 7-dagers-trial?
- ...

**Junior (6)**
- Fra hvilken alder kan barnet starte?
- Hvor er treningene?
- Trenger barnet eget utstyr?
- ...

### 4. Kontakt-CTA (lys-sand, 64px)

`Fant ikke svaret?`
- Tekst: Send oss en melding eller ring 482 35 700.
- CTAs: `Kontakt oss →` + `Ring +47 482 35 700`

### 5. Mørkt CTA-band

`Klar til aa starte?` -> `Book intro →` + `Se priser →`

### 6. Footer

## Klikkbare elementer

| Element | States |
|---|---|
| Sok-felt | default, focus, with-text, clear-button |
| Kategori-chip | default, hover, selected (lime bg) |
| FAQ-rad | collapsed, hover (bg-shift), expanded |
| Inline lenke i svar | default, hover (lime underline) |
| Kontakt-CTA | default, hover, focus |

## Empty / loading / error

- **Empty sok:** "Ingen treff for {sok}. Proev andre nokkelord eller kontakt oss →"
- **Empty kategori:** Skal aldri oppstaa (alle har innhold)

## Ønsket output fra Claude Design

1. Full FAQ-side i lyst tema, alle kategorier collapsed
2. Kategori "Coaching" expanded med 3 FAQ-rader åpne
3. Sok aktivt: "trial" -> 2 treff fremhevet
4. Mobil <=640px — kategori-chips blir scrollbar horisontalt

## Ikke-mål

- Ikke include AI-chatbot
- Ikke include kommentarer/votes per FAQ

## Når du er ferdig

Lim design-link tilbake.
