# Design-audit — prod-sider (B3d)

Generert: 14. mai 2026

## Sammendrag

Skann av `src/app/{admin,portal,(marketing),auth}` for design-systemet:

| Sjekk | Antall treff |
|---|---|
| Hardkodede hex-farger (#RRGGBB) | 171 |
| Brudd på 8pt-grid (p-3, p-5, p-7, m-3, m-5, gap-3, gap-5) | 182 |
| Ikke-godkjente fonter | 0 ✓ |
| Heroicons/Phosphor-imports | 0 ✓ |
| Emoji i prod-kode | 0 ✓ |

## Hardkodede hex-farger — typer treff

Hovedkilder:
- `bg-[rgba(0,88,64,0.12)]` o.l. i `admin/bookings/page.tsx` for status-piller (Bekreftet/Venter/Avlyst)
- `text-[#3d4d0f]`, `text-[#7a4910]` osv. i samme — semitone-farger som ikke finnes som tokens
- `linear-gradient(135deg,#005840,#1A7D56)` i avatar-bg-funksjoner
- Diverse i `admin/*` for KPI-strip-akser

**Anbefaling V1:** behold disse — det er stilistisk bevisst valg, men opprett `--color-status-confirmed/pending/cancelled` som tokens i V1.5 for full konsistens.

## 8pt-grid-brudd

Hoveddel: `p-3` (12px) og `p-5` (20px) brukes der `p-4` (16px) ville fungert. Også `gap-3` mange steder.

**Anbefaling V1:** ikke prioritert. CLAUDE.md håndhever 8pt-grid i kode-review framover, men eksisterende brudd er kosmetisk og endrer ikke funksjonalitet.

## Konklusjon

- Marketing-sider (de 5 nye) er rene — bruker tokens konsistent.
- Portal-sider blander tokens og hex-strings i KPI-/badge-kontekst.
- Admin-sider er mest "blandet" pga. design-spesifikke akser fra CoachHQ-skissene.

**Beslutning:** dokumentert som kjent teknisk gjeld. Ikke V1-blokker. Fikses inkrementelt når sidene berøres for andre endringer.
