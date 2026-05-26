# AK Golf Platform — PlayerHQ — Coach-detalj

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/coach`
- **Arketype:** C — Detail + tabs (5 tabs, coach-info)
- **Tier-gating:** **Pro** (Free ser ikke coach-fanen i det hele tatt)
- **HTML-referanse:** `wireframe/screen-deck/playerhq/coach-detalj.html`
- **Audit:** `wireframe/audit/playerhq-coach-detalj.md`
- **Tilhørende modaler:** `SessionHistoryModal`, `FocusRatingDetailModal`, `CertificationDetailModal`, `SwapCoachModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Spillerens view av sin(e) coach(er). Hovedcoach er Anders K (28 økter sammen). Sub-coaches kan vises (Markus har 3 coaches totalt). Spilleren kan se profil, sertifiseringer, sende melding, be om økt, eller bytte coach for én konkret økt.

## Header-blokk — UNIKT

- **Avatar:** 64px sirkel med Anders K profilbilde + grønn online-dot
- **H1:** `Anders Kristiansen` (Geist 32px)
- **Subtittel:** `Hovedcoach · NGF Trener IV · 12 år erfaring · Online nå`
- **Stat-pills (4):** `28 økter sammen` (klikk → SessionHistoryModal) · `2 uleste meldinger` · `14:00 neste økt i dag` · `4,9 snitt-fokus / 5` (klikk → FocusRatingDetailModal)
- **Primary CTA:** `Be om økt` (link til `/portal/coach/request`)
- **Sekundær:** `Send melding` (link til `/portal/coach/message` — pakke 15)

## Tab-strip (5 tabs)

| Tab | Innhold |
|---|---|
| **Om** (default) | Bio + spesialiteter + sertifiseringer |
| **Mine økter** | Liste over alle økter med Anders |
| **Meldinger** | Tråd-historikk |
| **Notater** | Coach-notater til meg |
| **Plan** | Aktiv plan av Anders |

## Layout — Om-tab (default)

- **Bio-card (8-col):** Italic Instrument Serif quote om coaching-filosofi + 3 paragraphs Geist
- **Stat-rich (4-col):** "12 år · 280+ spillere · 4,9 ★"
- **Spesialiteter-pills (12-col):** Pyramide-fokus (TEK, SLAG, SPILL) — klikkbare som filter
- **Sertifiseringer-tabell (12-col):** NGF Trener IV, TPI Level 3, TrackMan Master Coach, Mac O'Grady MORAD — klikk-rad → CertificationDetailModal

### Drawer (åpen ved klikk på stat-rich)
- "Andre coacher du kan booke" — 2 alternative coaches (Sara, Tom) som cards
- `Send melding til Anders`
- `Bytt coach for én økt` (åpner SwapCoachModal)
- `Les notatet →` (link til siste notat)

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip | default, hover, active |
| Online-dot | static (grønn) / offline (grå) / "siden 14:22" |
| `Send melding` | default, hover, klikk → compose-skjerm |
| `Be om økt` CTA | default, hover, klikk → wishlist-skjerm |
| Spesialitet-pill | default, hover, active (filter) |
| Sertifisering-rad | default, hover, klikk → modal |
| Stat-rich-card | default, hover, klikk → modal/drawer |

## Multi-coach-state

Hvis spiller har flere coaches (som Markus): drawer viser dem som cards med:
- Avatar 32px + navn
- Rolle ("Putt-spesialist Tom Hansen" / "Mental coach Sara Lien")
- `Bytt til denne →` knapp

## Empty / loading / error

- **Empty per tab:** "Ingen meldinger ennå", "Anders har ikke skrevet notat", "Ingen aktiv plan"
- **Offline-state:** Coach offline → grå dot + "Sist sett: i går 18:24"
- **Loading:** Skeleton bio-card + sertifisering-tabell

## Eksempel-data

- **Coach:** Anders Kristiansen
- **Spiller:** Markus Roinås Pedersen
- **Erfaring:** 12 år, 280+ spillere
- **Snitt-fokus:** 4,9/5 (over 28 økter)
- **Sertifiseringer:** NGF Trener IV, TPI Level 3, TrackMan Master, MORAD
- **Andre coacher:** Tom Hansen (Putt), Sara Lien (Mental)

## Ønsket output fra Claude Design

1. Lyst tema, Om-tab default
2. Mørkt tema, samme
3. Drawer åpen med multi-coach-alternativer
4. Tab-bytte til Mine økter
5. Coach offline-state
6. Empty: ingen meldinger
7. Mobil ≤640px — bio + stats stables, sertifisering blir kort

## Ikke-mål

- Ikke designe `SwapCoachModal`, `SessionHistoryModal` (egne pakker)
- Ikke designe compose-skjerm (egen pakke 15)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
