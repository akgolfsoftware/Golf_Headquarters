# AK Golf Platform — CoachHQ — Coach-profil

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/profil`
- **Arketype:** F — Settings + profile
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/coach-profil.html`
- **Audit:** `wireframe/audit/coachhq-coach-profil.md`
- **Tilhørende modaler:** `AvatarUploadModal`, `ChangePasswordModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Coach-profilen er Anders sin egen "om meg"-side i CoachHQ. Profilbilde, navn, tittel, kort bio og spesialfelt (sertifiseringer, språk, klubb-tilknytning) vises både her og på den offentlige siden `akgolf.no/coach/anders`. Endringer her propagerer dit. Coach kan også laste opp bilder til eget galleri (brukes på landingssider).

## Layout — UNIKT for denne skjermen

Bruker arketype-F-felles-spec. To-kolonne form-layout:

### Venstre kolonne (320px sticky)
- Stor avatar (160x160) med "Endre →" → `AvatarUploadModal`
- Navn (Geist 24px) + tittel under (muted 14px)
- Status-badge: "Aktiv coach" (accent-pill)
- 3 stat-kort vertikalt: "38 spillere", "12 år som coach", "GFGK + WANG"
- Lenke: "Se offentlig profil →" (åpner akgolf.no/coach/anders i ny fane)

### Høyre kolonne (form-seksjoner)

**Seksjon: Personalia**
| Felt | Default | Edit-mønster |
|---|---|---|
| Fullt navn | "Anders Kristiansen" | Inline input |
| Tittel | "Hovedcoach, AK Golf Academy" | Inline input |
| E-post | "anders@akgolf.no" | Inline input + verifiseringskrav |
| Mobil | "+47 412 34 567" | Inline input |
| Fødselsdato | "14. mars 1980" | Datepicker |

**Seksjon: Profesjonelt**
| Felt | Default |
|---|---|
| Bio (textarea, max 500 tegn) | "Hovedcoach for AK Golf Academy. Spesialist på MORAD og periodisering for talenter…" |
| Sertifiseringer (multi-select chips) | "PGA of Norway", "TPI Level 2", "Mac O'Grady MORAD" |
| Språk (multi-select) | "Norsk", "Engelsk" |
| Klubb-tilknytning | "Gamle Fredrikstad GK", "WANG Toppidrett Fredrikstad" |
| Coaching-stil (rich-text) | "Datadrevet, men menneskelig først…" |

**Seksjon: Galleri (4 bilder)**
- Grid 2x2, hvert bilde 200x150
- Hover viser "Slett" + "Sett som hoved"
- "+ Last opp bilde" plassholder med dashed border

## KPI-strip

Ikke relevant for denne skjermen (profil er personlig).

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| Avatar (klikk) | default, hover (overlay "Endre"), klikk → `AvatarUploadModal` |
| "Se offentlig profil →" | default, hover (underline), klikk → ny fane |
| Endre-link per felt | default, hover, klikk → inline-edit |
| Sertifiseringer-chip | default, hover (X-ikon vises), klikk X → fjern |
| Galleri-bilde | default, hover (overlay med 2 knapper) |
| "+ Last opp bilde" | default, hover (border accent), klikk → fil-velger |

## Empty / loading / error

Felles arketype-F + UNIKT:
- **Empty bio:** "Ingen bio ennå. Skriv noe om deg selv →"
- **Empty galleri:** Tomt grid med bare "+ Last opp"-plassholder
- **Verifiserings-pending:** "E-post venter på verifisering. Send på nytt →"

## Ønsket output fra Claude Design

1. Lyst tema, fullt utfylt profil
2. Mørkt tema
3. Inline-edit på "Tittel" (input med fokus)
4. Hover-state på galleri-bilde
5. Empty bio-state
6. Mobil ≤640px — venstre kolonne stables på topp, deretter form-seksjoner

## Ikke-mål

- Ikke designe `AvatarUploadModal`, `ChangePasswordModal` (egen pakke)
- Ikke designe offentlig profil-side (akgolf.no — egen batch i batch-8)
- Ikke designe tilgjengelighet-kalender (egen pakke 5)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
