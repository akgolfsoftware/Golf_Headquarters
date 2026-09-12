# D2-AO — teknisk AgencyOS-reise 12.09.2026

Gren: `grok/d2-ao-teknisk-reise-2026-09-12`. Ingen visuell portering. D0 er ikke bestått.

## Hva som er rettet

- Stall-lista bruker samme spillerporte som hjem og spillerkort (`coachScopedPlayerWhere`), inkludert gruppetrenere. Tidligere så lista bare spillere med direkte enrollering.
- Spillerkortets oversiktsdata lastes ikke før eierskap/coach-tilgang er bekreftet. Uvedkommende får `null`, ikke tilleggsoppslag.

## Hva som allerede virket

J04-kjeden hjem → stall → spillerkort → Workbench → publisering er kartlagt i [J04-kontrollen](2026-09-11-agencyos-coach-reise-j04.md). Oppfølging (`/admin/queue`) hører i Stall, ikke Kø.

## Ikke påstått

- Innlogget Next-/databasereise (P0-TEST blokkert, [blokkering](p0-test-blokkering-2026-09-12.md)).
- Visuell godkjenning eller valgt Claude Design-fasit.
