# AK Golf Web — Karriere

## Identitet

- **Produkt:** Web
- **URL:** `/jobb`
- **Arketype:** Web — careers-page
- **HTML-referanse:** `wireframe/screen-deck/web/jobb.html`
- **Audit:** `wireframe/audit/web-jobb.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Karriere-siden tiltrekker coaches og tech-folk. AK Golf vil ansette 4-6 nye
mennesker neste 12 mnd. Tone: ambitiost, ekte, ikke "sok jobben din i et
selskap som verdsetter deg" corporate-floskler.

## Layout — UNIKT

### 1. Subhero (#0A1F18 gradient, 80px)

- Eyebrow: `KARRIERE`
- H1: `Bygg *norsk golf* med oss.`
- Sub: `Vi vokser. Hvis du er drevet, faglig sterk, og vil bidra til noe bygget pa lang sikt — snakk med oss.`

### 2. Hvorfor jobbe her (lys, 96px, grid-3)

3 cards:
- **Faglig miljø** — Jobber med Anders + spesialister + tech-team
- **Spillerne ferst** — Du jobber med ekte spillere, ikke kunde-tickets
- **Fart fremover** — Vi bygger plattform, du fa rom til aa eie ting

### 3. Apne stillinger (lys, 96px)

3-5 stillingsannonser. Hver er en rad:
- Tittel (Inter Tight 24px)
- Eyebrow (mono): `LOKALITET · ROLLE-TYPE`
- 2-linje-beskrivelse
- Spec-rad: deltid/heltid · onsite/hybrid · oppstart
- CTA: `Les mer + soek →`

**Apne stillinger (eksempel):**
1. **Coach (junior, 50%)** — Drobak — Idealt PGA eller TPI · Oppstart august 2026
2. **Full-stack utvikler (Next.js)** — Fredrikstad/remote — Bygger AK Golf HQ-plattformen · Oppstart asap
3. **Driftansvarlig Mulligan** — Fredrikstad — Daglig drift av indoor-anlegget · Oppstart juni 2026
4. **Salgsansvarlig B2B** — Hybrid — Bedrifts- og klubb-salg · Oppstart asap

### 4. Apen soknad (lys-sand, 64px)

`Ingen passer? Soek apent.`
- Tekst: Vi ansetter dyktige folk uansett rolle. Hvis du tror du kan bidra — fortell oss.
- CTA: `Send apen soknad →`

### 5. Slik soker du (lys, 64px)

3 stegs:
1. Send CV + en side om hvorfor du vil til AK Golf
2. 30 min videocall med Anders
3. Praktisk dag — du provejobber 1 dag, vi snakker etterpa

### 6. Sitater fra ansatte (lys-sand, 64px)

2 sitater:
- *"Jobben min hadde ikke vart mulig pa noe annet sted i Norge."* — Markus, talent-coach
- *"Anders gir deg eierskap fra dag en. Det er sjelden."* — Sara, coach

### 7. Mørkt CTA-band

`Hvor passer du?` -> `Se ledige stillinger ↑` (lime) + `Send apen soknad →` (outline)

### 8. Footer

## Klikkbare elementer

| Element | States |
|---|---|
| Stillings-rad | default, hover (lift + ring), klikk -> stilling-detalj eller modal |
| Apen soknad CTA | default, hover, focus |
| Steg-card | default, hover |

## Empty / loading / error

- **Empty (ingen apne):** "Ingen apne stillinger naa. Send apen soknad →"
- **Loading:** Skeleton-rader

## Ønsket output fra Claude Design

1. Full karriere-side i lyst tema
2. Mobil <=640px — alt stables
3. Hover pa Coach junior-rad
4. Empty-state (ingen apne)

## Ikke-mål

- Ikke designe stillings-detalj (kan vaere en modal eller egen page)
- Ikke include online ATS / soknads-form (linker til epost eller ekstern ATS)

## Når du er ferdig

Lim design-link tilbake.
