# AK Golf Platform — CoachHQ — Tilgjengelighet (coach-kalender)

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/tilgjengelighet`
- **Arketype:** F — Settings + profile (kalender-konfig-variant)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/tilgjengelighet.html`
- **Audit:** finnes ikke ennå — generer i denne pakken
- **Tilhørende modaler:** `BlockTimeModal`, `RecurringRuleModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Tilgjengelighet styrer når Anders kan bookes for 1:1 coaching. Det Anders setter her, vises i `booking.akgolf.no` for kunder. Skjermen har to hovedmoduser: **Standard uke** (faste åpningstider per ukedag) og **Unntak** (ferier, kurs, sykefravær — overstyrer standard).

## Layout — UNIKT for denne skjermen

Bruker arketype-F-felles-spec. To-fane-toggle øverst: **Standard uke** | **Unntak + ferier**.

### Fane: Standard uke

7 rader (Mandag–Søndag), hver rad har:
- Ukedag-label (Geist 14px)
- Toggle "Tilgjengelig" (av/på)
- Hvis på: tids-slot-rader med "Fra: 09:00" "Til: 17:00" "Pause: 12:00–13:00"
- "+ Legg til slot" link per dag
- "Kopier til andre dager →" link

Eksempel default:
- Mandag: 09:00–12:00, 13:00–17:00 (på)
- Tirsdag: 09:00–17:00 (på)
- Onsdag: 09:00–12:00 (på, kort dag)
- Torsdag: 09:00–17:00 (på)
- Fredag: 09:00–15:00 (på)
- Lørdag: 10:00–14:00 (på, helg-takst)
- Søndag: av (slot-input skjult)

### Side-panel høyre (sticky)

**Booking-regler:**
- Min varsel før booking: dropdown "2 timer" (4t / 12t / 24t / 48t)
- Maks framover bookbar: dropdown "60 dager"
- Buffer mellom timer: dropdown "0 min" (5/10/15/30)
- Tillat samme-dag-booking: toggle (på)
- Auto-godkjenn bookinger: toggle (av — Anders må godkjenne hver)

**Forhåndsvisning:**
- Liten kalender-preview viser hvordan neste 7 dager ser ut for kunden
- Lenke: "Åpne booking-side som kunde →" (booking.akgolf.no/anders i ny fane)

### Fane: Unntak + ferier

Tabell med kolonner:

| Periode | Type | Beskrivelse | Aksjoner |
|---|---|---|---|
| 1.–7. juli 2026 | Ferie | "Sommerferie — ikke tilgjengelig" | "..." |
| 15. mai 2026 (heldag) | Kurs | "MORAD-oppdatering Stockholm" | "..." |
| 22. mai 14:00–17:00 | Blokkert | "Privat turnering Bossum" | "..." |
| Hver onsdag 18:00–20:00 (recurring) | Familie | "Junior-trening med datter" | "..." |

**Primary CTA:** `+ Legg til unntak` → `BlockTimeModal`
**Sekundær:** `+ Recurring-regel` → `RecurringRuleModal`

## KPI-strip (4 kort)

1. Tilgjengelig timer denne uka: 38
2. Bookede timer denne uka: 26 (68% utnyttelse)
3. Kommende ferier: 2 (juli + sept)
4. Snitt-varsel før booking: 18 timer

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| Tilgjengelig-toggle per dag | av (muted, slot-felt skjules), på (accent, slot-felt vises) |
| Tids-input | default, fokus, ugyldig (rød border + "Sluttid må være etter starttid") |
| "+ Legg til slot" | default, hover, klikk → ny rad legges inn |
| "Kopier til andre dager" | default, klikk → popover med checkbox per dag |
| "Forhåndsvisning som kunde" | default, hover, klikk → ny fane |
| Fane-toggle | default, hover, active (underline accent) |
| Unntak-rad | default, hover, klikk → `BlockTimeModal` (rediger) |
| Recurring-badge på rad | accent-pill med `Repeat`-ikon |

## Empty / loading / error

Felles arketype-F + UNIKT:
- **Empty unntak:** "Ingen unntak. Åpningstidene gjelder 100% →"
- **Konflikt:** Hvis nytt unntak overlapper med eksisterende booking: rød toast "X bookinger berøres. Send avlysnings-e-post? →"
- **Lagring:** Inline grønn checkmark "Lagret" pr. dag når toggle endres

## Ønsket output fra Claude Design

1. Lyst tema, fane Standard uke (alle 7 dager med varierte slots)
2. Mørkt tema, fane Unntak (4 rader inkl. recurring)
3. Side-panel utvidet med booking-regler synlig
4. Kopier-til-andre-dager popover åpen
5. Konflikt-toast vises (en booking berøres)
6. Mobil ≤640px — fane-toggle som segmented, dag-rader stables, side-panel under

## Ikke-mål

- Ikke designe `BlockTimeModal`, `RecurringRuleModal` (egen batch)
- Ikke designe selve booking-flyten (akgolf-booking — egen prosjekt)
- Ikke designe sync til Google Calendar (egen integrasjon)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
