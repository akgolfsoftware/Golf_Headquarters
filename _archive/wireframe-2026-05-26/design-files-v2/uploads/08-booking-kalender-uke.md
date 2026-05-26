# AK Golf Platform — Booking — Kalender (uke)

## Identitet

- **Produkt:** Booking
- **URL:** `/kalender?view=uke`
- **Arketype:** G — Wizard / steg 3 av 5 (uke)
- **Tier-gating:** Ingen
- **HTML-referanse:** `wireframe/screen-deck/booking/kalender-uke.html`
- **Audit:** `wireframe/audit/booking-kalender-uke.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Alternativ visning av steg 3 — uke-kalender med tidsblokker per dag. Bedre for kunder som er fleksible på tid og vil se hele uken på en gang. Hver tids-pill er klikkbar (hopper til steg 4 sammendrag).

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec. Progress-stripe: "3. Velg tid" (primary).

- **Hero (kompakt):** Mono "ANDERS K. · PERSONLIG COACHING" + H1 "Uke 19 — *11.–17. mai*"
- **Top-höyre:** "‹ Forrige uke", "I dag", "Neste uke ›", "Måneds-visning"
- **Uke-grid:**
  - 7 kolonner (Mandag 11. → Søndag 17.)
  - Tidsblokker fra 06:00 til 22:00, 30-min slots venstre i grå mono
  - Hver ledig slot = lime accent pill med tid (08:00, 09:00 osv)
  - Opptatte slots = muted (ikke klikkbar)
  - Stengt = helt blank cellebakgrunn
  - Dagens dato har vertikal accent-linje gjennom hele kolonnen
- **Footer-actions:** "← Måneds-visning" + ingen Fortsett (slot-klikk = videre)

## Eksempel-uke

Uke 19 (11.–17. mai 2026):
- Man 11.: 09:00, 10:00, 14:00, 15:00 ledig
- Tir 12.: 08:00, 09:00, 10:00, 14:00, 15:00, 16:00, 17:00, 18:00 ledig (8 stk)
- Ons 13.: 08:00, 14:00, 15:00 ledig
- Tor 14.: helt fullt
- Fre 15.: 08:00, 09:00 ledig
- Lør 16.: 10:00, 11:00, 14:00 ledig
- Søn 17.: nasjonaldag, stengt

## Klikkbare elementer

| Element | States |
|---|---|
| Tids-pill | default, hover (lift + ring), valgt (deeper accent), opptatt (muted disabled) |
| Naviger-knapper | default, hover, disabled |
| "Måneds-visning" | klikk → `07-booking-kalender-maned` |

## Empty / loading / error

- **Empty (hele uka fullt):** "Ingen ledige tider denne uka. Se neste uke →"
- **Loading:** Skeleton-grid
- **Error:** "Kunne ikke laste."

## Ønsket output fra Claude Design

1. Lyst tema, uke 19 default, tirsdag 12. mai 09:00 valgt
2. Mørkt tema
3. Hover på 09:00-tirsdag-pill
4. Empty (helt fullt)
5. Mobil ≤640px — uke blir 1-dag-view (dagens dato), pile for å bla, time-strip vertikal

## Ikke-mål

- Ikke designe måneds-view (pakke 07)
- Ikke designe tider-side (pakke 09 — den brukes når kunde går via måned)
- Ikke designe admin (CoachHQ batch 2-bookings)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
