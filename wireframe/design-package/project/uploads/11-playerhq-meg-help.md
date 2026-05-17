# AK Golf Platform — PlayerHQ — Hjelp + support

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/meg/hjelp`
- **Arketype:** G — Other (search-driven help-center)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/playerhq/meg-help.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `ContactSupportModal`, `ArticleDetailModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Hjelp er Markus' selvbetjenings-sted når han lurer på noe — "hvordan logger jeg en runde?", "hva er pyramide?", "hvordan oppgraderer jeg til Pro?". Strukturert som søk + kategorier + populære artikler. Hvis han ikke finner svar, kan han kontakte support.

## Layout — UNIKT for denne skjermen

### Hero med søk

- Italic editorial: *"Hva lurer du på?"*
- Stort søkefelt sentrert, 600px bredt: `[Søk hjelp-artikler eller skriv et spørsmål...]`
- Suggested-pills under: `Logg runde` `Pyramide` `Oppgrader til Pro` `Bytt coach`

### Kategorier (5 cards)

Grid 3+2:
1. **Komme i gang** — `Sparkles` ikon — 8 artikler
2. **Trening** — `Dumbbell` ikon — 14 artikler
3. **Coaching** — `Headphones` ikon — 12 artikler
4. **Booking + betaling** — `Calendar` ikon — 9 artikler
5. **Kontoinnstillinger** — `Settings` ikon — 6 artikler

Hver card klikkbar → kategori-side (sub-route).

### Populære artikler (5)

Numerert liste:
1. "Hvordan logger jeg en runde fra GolfBox?"
2. "Hva er pyramide-fokus?"
3. "Slik bytter du coach"
4. "Pro vs Elite — hva er forskjellen?"
5. "Slik bruker du Live Session"

Hver klikkbar → `ArticleDetailModal`.

### Kontakt support (bunn)

Card med 3 alternativer side-om-side:
- **Chat med oss** — "Svar innen 1t på hverdager" — ikon `MessageCircle` — primary CTA
- **Send e-post** — "support@akgolf.no" — ikon `Mail` — secondary
- **Be coachen din** — "Anders Kristiansen er din coach" + avatar — ghost link

## KPI-strip — IKKE for denne (rolig hjelp-side)

## Filter-bar — IKKE for denne

## Klikkbare elementer

| Element | States |
|---|---|
| Søkefelt | default, focus (ring accent), with-text, suggestions-dropdown open |
| Suggested-pill | default, hover, klikk → fyll søk + utfør |
| Kategori-card | default, hover (lift), klikk → kategori-side |
| Populær-artikkel | default, hover (bg-shift), klikk → `ArticleDetailModal` |
| Chat-CTA | default, hover, klikk → åpne chat-widget (Intercom/Crisp) |
| Coach-link | default, hover, klikk → `/meg/coach` |

## Empty / loading / error

- **Empty (søk uten treff):** "Ingen artikler matcher 'X'. Prøv å spørre support direkte →"
- **Loading (artikkel åpnes):** Skeleton-tekst i modal
- **Chat-down:** Banner "Chat er nede. Send e-post i mellomtiden →"

## Ønsket output fra Claude Design

1. Lyst tema, full hjelp-side
2. Mørkt tema, samme
3. Søkefelt med suggestions-dropdown åpen
4. Søk-resultat-state (3 treff for "pyramide")
5. Mobil ≤640px — kategorier 1-kolonne, kontakt-cards stables vertikalt

## Ikke-mål

- Ikke designe `ContactSupportModal`, `ArticleDetailModal` (egen batch)
- Ikke designe full artikkel-rendering (egen design-fase)
- Ikke designe chat-widget (3rd party)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
