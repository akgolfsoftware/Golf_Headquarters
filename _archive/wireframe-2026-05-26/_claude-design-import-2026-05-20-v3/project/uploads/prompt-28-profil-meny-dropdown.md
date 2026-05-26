# Prompt 28 — Profil-meny dropdown (header)

## Hensikt

Header øverst i hele PlayerHQ har avatar i høyre hjørne. Klikk åpner dropdown med rask tilgang til profil-relaterte sider, tier-status, og logg ut.

## Trigger

Klikk på avatar/initial i header.

## Layout

- Popover ankret til avatar, 320 × auto, cream, `rounded-lg`, drop-shadow.
- Topp-blokk profil-card:
  - Avatar 48×48 + navn Inter Tight 16 px semibold + e-post JetBrains Mono 11 px muted
  - Tier-badge "PRO" lime ved siden av navnet
- Divider
- Meny-rader (hver med Lucide-ikon venstre, ChevronRight høyre om submenu):
  - Min profil → `/portal/meg`
  - Abonnement → `/portal/meg/abonnement` (tier-pill høyre)
  - Bookinger → `/portal/meg/bookinger` (count-pill)
  - Helse → `/portal/meg/helse` (rødt prikk hvis aktiv skade)
  - Sikkerhet → `/portal/meg/sikkerhet` (2FA-status-pill)
  - Innstillinger → `/portal/meg/innstillinger`
- Divider
- Tema-toggle (lys/mørk/auto) — kompakt segment-control
- Språk-velger (NO / EN) — popover-undermeny
- Divider
- Hjelp → `/portal/meg/help`
- Logg ut (destructive tekst)

## Komponenter

- `Popover`, `DropdownMenu`, `Switch` (theme)
- Lucide: User, CreditCard, Calendar, HeartPulse, Shield, Settings, Sun, Moon, Globe, HelpCircle, LogOut, ChevronRight

## Eksempel-data

```
Markus Røinås Pedersen
markus.rp@example.no
Tier: PRO
Bookinger: 3 kommende
Helse: 1 aktiv skade
2FA: aktivert
Tema: auto
Språk: norsk
```

## Branding-krav

- Cream + lime tier-pill.
- Lucide stroke 1.75.
- Destructive farge for "Logg ut".
- Norsk bokmål.

## Tilstander

- **GRATIS**: tier-pill grå, "Oppgrader til Pro"-CTA øverst lime.
- **Coach-rolle**: ekstra rad "Bytt til CoachHQ".
- **Foreldre-rolle**: ekstra rad "Mine barn".
