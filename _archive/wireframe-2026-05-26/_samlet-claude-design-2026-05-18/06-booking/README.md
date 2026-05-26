# Booking Export — Bølge G

Eksport-pakke fra `akgolf-hq/wireframe/design-package/` klar for portering til **`akgolf-booking`**-repoet.

## Formål

Dette er den ferdig designede booking-flyten (spillerside) fra design-pakken. Den skal porteres inn i `akgolf-booking` som faktiske React-komponenter. CoachHQ-admin sin booking-oversikt (`final/04-bookinger.html`) er IKKE inkludert — den blir værende i `akgolf-hq` siden den hører til admin-laget.

## Kopier-kommando

Når `akgolf-booking`-repoet er klargjort:

```bash
cp -r ~/Developer/akgolf-hq/wireframe/booking-export/* ~/Developer/akgolf-booking/from-design-package/
```

## Mappe-struktur

```
booking-export/
├── README.md                  (denne fila)
├── shared-components.md       (komponent-mapping mot akgolf-hq)
├── designs/
│   ├── modal-C/               (22 booking-modaler — alle steg + states)
│   └── screens-booking/       (8 fullsides booking-skjermer + delt CSS)
└── tokens/
    ├── colors_and_type.css    (forest/lime/cream-system + Inter Tight)
    ├── tokens.css             (semantiske design-tokens)
    ├── modal-shell.css        (modal-frame, backdrop, transitions)
    └── playerhq-shell.css     (sidebar + topbar for PlayerHQ)
```

## Fillister

### `designs/modal-C/` — booking-modaler (22 filer)

**01 — Book Session (3-stegs flyt):**
- `01-book-session-steg1-free.html` — Steg 1, gratisbruker (begrenset valg)
- `01-book-session-steg1-pro.html` — Steg 1, Pro-bruker (full tilgang, credits synlig)
- `01-book-session-steg1-locked.html` — Steg 1, Locked-state (upgrade-gate)
- `01-book-session-steg2.html` — Steg 2, default (tidsvalg)
- `01-book-session-steg2-dark.html` — Steg 2, dark mode
- `01-book-session-steg2-loading.html` — Steg 2, loading skeleton
- `01-book-session-steg3.html` — Steg 3, bekreftelse + sammendrag

**02 — Reschedule (omplanlegging):**
- `02-reschedule-default.html` — Standard reschedule-modal
- `02-reschedule-valgt.html` — Med valgt ny-tid
- `02-reschedule-confirm.html` — Bekreftelses-state
- `02-reschedule-success.html` — Suksess-state
- `02-reschedule-dark.html` — Dark mode

**03 — Facility Detail (anlegg-detalj fra booking):**
- `03-facility-detail-oversikt.html` — Hovedoversikt
- `03-facility-detail-tider.html` — Ledige tider-tab
- `03-facility-detail-utstyr.html` — Utstyr-tab
- `03-facility-detail-anmeldelser.html` — Anmeldelser-tab
- `03-facility-detail-dark.html` — Dark mode
- `03-facility-detail-loading.html` — Loading state

**04 — Booking Confirmation (etter-booking):**
- `04-booking-confirmation.html` — Default confirmation
- `04-booking-confirmation-dark.html` — Dark mode
- `04-booking-confirmation-loading.html` — Loading

**Indeks:**
- `index.html` — gallery-side for alle modaler

### `designs/screens-booking/` — fullside booking-flyt (8 filer)

- `01-booking-index.html` — Landing / hva vil du booke
- `02-booking-tjenester.html` — Tjeneste-velger (1-til-1, gruppe, klinikk, etc.)
- `03-booking-coaches.html` — Coach-katalog
- `04-booking-coach-detalj.html` — Coach-profil
- `04-booking-kalender.html` — Kalender-velger
- `05-booking-anlegg.html` — Fasilitet-velger
- `05-booking-info.html` — Info / kontakt
- `_shared/arketype-g.css` — Delt stylesheet for screens (Arketype G)

## Tokens-mapping (forest / lime / cream)

Booking-pakken bruker AK Golf sitt etablerte system:

| Token-rolle | Lyst tema | Mørkt tema | Tailwind v4 mapping i `akgolf-hq` |
|---|---|---|---|
| Forest (primær brand) | `#005840` | `#D1F843` | `bg-primary` / `text-primary` |
| Lime (accent / energi) | `#D1F843` | `#D1F843` | `bg-accent` / `text-accent` |
| Cream (bakgrunn) | `#FAFAF7` | `#0F2A22` | `bg-background` |
| Forest 950 (mørk tekst) | `#0A1F17` | `#F5F4EE` | `text-foreground` |
| Stone (borders) | `#E5E3DD` | `#2B4F42` | `border-border` |

Hex-verdiene i CSS-filene MÅ erstattes med semantiske Tailwind-utilities når komponenten flyttes til `akgolf-booking`. Det er det samme designsystemet som `akgolf-hq`/`CLAUDE.md` definerer.

**Typografi:** Inter (sans), Inter Tight (display), JetBrains Mono (tabulære tall). Alle via `next/font/google`.

## Tier-system regler

Booking-flyten har tre states som MÅ implementeres som diskriminert union:

| State | Når vises | UX-konsekvens |
|---|---|---|
| `free` | Bruker uten coaching-abonnement | Kun pay-per-session tilgjengelig. Pris vises tydelig. Ingen credits-counter. |
| `pro` | Bruker med Pro 300 kr/mnd | Credits-counter øverst (`4 credits igjen denne måneden`). Coaching-økter koster credits, ikke kr. |
| `locked` | Bruker prøver å booke noe som krever oppgradering | Upgrade-gate vises i steg 1. CTA: "Oppgrader til Pro" → routes til `/abonnement`. |

**Viktig:** ELITE-tier er fjernet fra UI. Kun GRATIS + PRO 300 kr/mnd. Se `MEMORY.md` for tier-modellen.

## UX-konvensjoner

- **Språk:** Norsk bokmål med æ/ø/å. Aldri engelsk i UI.
- **Tidsformat:** 24h (`14:30`, ikke `2:30 PM`).
- **Dato:** `man 18. mai` / `18. mai 2026`.
- **Valuta:** `kr` (etter beløp, ikke før): `450 kr`. Internt lagres i øre som `Int`.
- **Credits:** `2 credits` (entall: `1 credit`).
- **Lokasjon vs Fasilitet:** Lokasjon = parent (f.eks. GFGK). Fasilitet = child (Performance Studio). Booking går mot fasilitet.
- **Ingen emojis i UI.** Lucide-ikoner kun.

## Verifikasjon

Etter portering til `akgolf-booking`, åpne hver modal-state i Storybook eller dev-server og kryssjekk mot HTML-filene i denne pakken. Spesielt:

- [ ] Steg 1 free/pro/locked viser riktig CTA
- [ ] Steg 2 har korrekt 24h tidsvelger
- [ ] Steg 3 sammendrag har riktig pris/credits-format
- [ ] Reschedule respekterer 24h-grense (regel fra akgolf-hq)
- [ ] Facility detail har alle 4 tabs (oversikt/tider/utstyr/anmeldelser)
- [ ] Dark mode aktiveres via `.dark`-klasse på `<html>`

## Eierskap

- **Designpakke kilde:** `akgolf-hq/wireframe/design-package/project/modal-C/` + `screens/booking/`
- **Target repo:** `akgolf-booking` (eget prosjekt, deler Supabase + designtokens med `akgolf-hq`)
- **Bølge:** G (booking-laget i AK Golf-plattform-utrullingen)

Hvis du oppdager designendringer som er gjort i `akgolf-booking` etter at denne pakken er kopiert: oppdater kildene i `akgolf-hq/wireframe/design-package/` slik at sannheten forblir der.
