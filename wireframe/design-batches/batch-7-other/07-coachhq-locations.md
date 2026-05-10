# AK Golf Platform — CoachHQ — Lokasjoner (utvidet detail-view)

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/locations`
- **Arketype:** G — Other (master-detail, kart + per-lokasjon-konfig)
- **Tier-gating:** Admin
- **HTML-referanse:** `wireframe/screen-deck/coachhq/locations.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `NewLocationModal`, `EditLocationModal`, `MapPinModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Lokasjoner er parent-konseptet for fasiliteter — geografiske steder hvor AK Golf opererer. Eksempler: Mulligan Indoor Golf (én adresse), Gamle Fredrikstad GK (én adresse), Bossum Golfklubb, WANG Toppidrett. Booking går mot **fasilitet**, men adresse, åpningstid-policy, betalingsmottaker, kontakt-person ligger på **lokasjon**.

Forskjellig fra batch-2-locations (list + filter) — dette er utvidet detail-view med kart og per-lokasjon-policy.

## Layout — UNIKT for denne skjermen

Master-detail 30/70:

### Master (venstre, 30%)

- Liste lokasjoner med:
  - Navn (Geist 14px)
  - Adresse (muted 12px)
  - Antall fasiliteter (badge): `4 fasiliteter`
  - Status-prikk (aktiv / pause / planlagt)
- CTA bunn: `+ Ny lokasjon` → `NewLocationModal`
- Søk øverst

### Detail (høyre, 70%)

For valgt lokasjon:

#### Header
- Stort lokasjon-navn (italic Instrument Serif 36px)
- Subtitle: `Storgata 23, 1607 Fredrikstad · 4 fasiliteter`
- Status-pill: Aktiv

#### Seksjon 1: Kart
- Mapbox/OpenStreetMap embed med pin på adressen
- Knapper: `Åpne i Maps`, `Kopier adresse`
- Underliggende info: avstand til nærmeste sentrum, parkering-info (linje "Gratis parkering · 18 plasser")

#### Seksjon 2: Kontakt + ansvarlig
- Kontakt-person: navn + e-post + telefon
- Ansvarlig coach (avatar + navn + rolle)
- "Endre →"-link per felt

#### Seksjon 3: Fasiliteter under denne lokasjonen
- Liste med 4 fasiliteter (Studio 1-4 hvis Mulligan)
- Hver med navn + type + belegg-prosent + "Åpne →" til facility-detail

#### Seksjon 4: Åpningstid-policy (override)
- Default fra fasilitet, men lokasjon kan overstyre (f.eks. "Stengt søndager pga klubbreglement på Bossum")

#### Seksjon 5: Betalings-mottaker
- Stripe-konto (eller "Felles AK Golf-konto")
- MVA-håndtering
- "Endre →" → `EditLocationModal`

#### Seksjon 6: Statistikk (siste 30d)
- Inntekt: `47 200 kr`
- Bookinger: 142
- Snitt-pris per booking: `333 kr`

## KPI-strip (4 kort, øverst)

1. Aktive lokasjoner: 4
2. Totalt fasiliteter: 11
3. Inntekt alle MTD: 142 800 kr
4. Snitt-belegg: 67%

## Klikkbare elementer

| Element | States |
|---|---|
| Master-rad | default, hover, selected (accent-border + bg-shift) |
| Kart-pin | default, hover (tooltip), klikk → `MapPinModal` (full info) |
| Endre-link per seksjon | default, hover, klikk → `EditLocationModal` med rett tab åpen |
| Fasilitet-rad | default, hover, klikk → `/admin/facilities/:id` |
| Åpne i Maps | default, hover, klikk → ekstern lenke (system-Maps) |

## Empty / loading / error

- **Empty (ingen lokasjoner):** "Ingen lokasjoner registrert. Lag din første →"
- **Detail-empty (ingen valgt):** "Velg en lokasjon i listen for å se detaljer"
- **Kart-load-error:** Fallback til "Adresse: Storgata 23 — Åpne i Maps →"

## Ønsket output fra Claude Design

1. Lyst tema, master-detail åpent på Mulligan Indoor Golf
2. Mørkt tema, samme
3. Kart med pin (synlig som embed)
4. Detail på GFGK (annet eksempel)
5. Mobil ≤640px — master blir top-liste, detail under, kart full bredde

## Ikke-mål

- Ikke designe `NewLocationModal`, `EditLocationModal`, `MapPinModal` (egen batch)
- Ikke designe Stripe-onboarding for ny mottaker
- Ikke designe selve kart-rendering-implementasjonen

## Når du er ferdig

Lim design-link tilbake til Claude Code.
