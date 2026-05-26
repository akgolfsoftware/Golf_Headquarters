# AK Golf Platform — PlayerHQ — Varsler

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/meg/varsler`
- **Arketype:** F — Settings + profile (toggle-matrise)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/playerhq/meg-notif.html`
- **Audit:** finnes ikke ennå — generer i denne pakken
- **Tilhørende modaler:** Ingen (alt skjer inline)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Markus styrer her hvilke varsler han får og på hvilken kanal (push, e-post, SMS). For hver hendelse-type (booking-bekreftelse, ny coach-melding, planendring) kan han velge separat per kanal. Standard er fornuftige defaults — "viktige" på alle kanaler, "info" kun in-app.

## Layout — UNIKT for denne skjermen

Bruker arketype-F-felles-spec. To-seksjons-design:

### Seksjon: Globale brytere (helt øverst)

3 store toggles i en rad:
- **Push i appen** — kanal-status pill: "Aktiv" (grønn) / "Blokkert i nettleser" (rød)
- **E-post** — verifisert-status: "markus@example.no ✓"
- **SMS** — verifisert-status: "+47 412 34 567 ✓"

Hvis kanal er av globalt: alle kategori-toggles for den kanalen blir disabled (muted).

### Seksjon: Varsler per kategori

Stor tabell-layout (eller stacked liste på mobil). Kolonner: Kategori | Push | E-post | SMS

| Kategori | Push | E-post | SMS |
|---|---|---|---|
| Booking bekreftet | () på | () på | () av |
| Booking avlyst | () på | () på | () på |
| Påminnelse 24t før | () på | () av | () av |
| Påminnelse 1t før | () på | () av | () av |
| Ny coach-melding | () på | () på | () av |
| Plan oppdatert | () på | () av | () av |
| Tester forfaller | () på | () på | () av |
| Faktura sendt | () av | () på | () av |
| Faktura forfalt | () på | () på | () på |
| Leaderboard-endring (pos) | () på | () av | () av |
| Coach-anbefaling (AI) | () på | () av | () av |
| Skade-påminnelse (rehab) | () på | () av | () av |
| Sesong-oppsummering (mnd) | () av | () på | () av |

### Seksjon: Stille perioder

- Toggle: "Ikke forstyrr 22:00 → 07:00" (på default)
- Toggle: "Ikke forstyrr søndager" (av)
- Custom-perioder: "+ Legg til stille periode" (gir mulighet for f.eks. "Hver mandag 14:00–17:00 (skole)")

### Seksjon: Markedsføring + tips

| Type | E-post |
|---|---|
| Månedlig nyhetsbrev | () av |
| Tips og artikler | () av |
| Tilbud og kampanjer | () av |
| Klubb-informasjon (GFGK) | () på |

## Save-bar (sticky bunn)

Form er **dirty**-aware. Når noe endres, vises sticky bar bunn:
- "5 endringer ulagrede"
- `Avbryt` (ghost) | `Lagre alle endringer` (primary)

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| Global-toggle per kanal | av (muted, disabler kategori-toggles), på (accent) |
| Kategori-toggle | av, på, disabled (når global av — vis tooltip "Slå på {kanal} først") |
| Verifiserings-status | "Verifisert ✓" (grønn), "Send på nytt →" (link, hvis pending) |
| Stille-periode-toggle | av/på |
| "+ Legg til periode" | default, hover, klikk → inline-form |
| Save-bar | hidden (form clean), slide-in (form dirty) |
| "Lagre alle" | default, hover, loading, success (toast + bar fader ut) |

## Empty / loading / error

Felles arketype-F + UNIKT:
- **Push blokkert:** Banner "Push er blokkert i Safari. Slå på i Safari → Innstillinger → Notifikasjoner →"
- **E-post unverif:** "E-post ikke verifisert. Send link på nytt →"
- **SMS unverif:** "SMS-nummer ikke verifisert. Vi sender en kode →"

## Ønsket output fra Claude Design

1. Lyst tema, alle kanaler aktive, default-toggles
2. Mørkt tema
3. SMS-kanal av globalt — vis disabled-state på alle SMS-kolonner
4. 5 endringer dirty — save-bar synlig
5. Push blokkert-banner
6. Mobil ≤640px — tabell blir stacked: hver kategori er et kort med 3 toggles inni

## Ikke-mål

- Ikke designe verifiserings-flyt (egen mini-modal, batch-4)
- Ikke designe varslings-historikk (egen sub-skjerm, batch-7)
- Ikke implementere push-API integrasjon

## Når du er ferdig

Lim design-link tilbake til Claude Code.
