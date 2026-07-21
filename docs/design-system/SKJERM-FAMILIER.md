# Skjerm-familier — wireframe-kanon (2026-07-20)

> Gråtoner først. Hi-fi etter godkjenning. Alle nye PlayerHQ/AgencyOS-skjermer mappe til ÉN familie.

## Fasit-bredder
| Ramme | px | Primær for |
|---|---|---|
| Mobil | 390 | PlayerHQ, Forelder |
| iPad | 834 | Coach i felt, Forelder |
| Desktop | 1280 | PlayerHQ desktop, Marketing |
| AgencyOS full | 1680 | Coach kontrolltårn |

## De 8 familiene

### 1. Shell
**Jobb:** navigere + se hvor du er.
- **PHQ 390:** topp + innhold + **bunn-nav 5**
- **AOS 1680:** **ikon-rail** + toppbar + main
- **AOS 390:** 4 nav + Mer-ark (triage)
- Komponenter: BottomNav, NavRail, SpillerGruppeVeksler

### 2. Hub
**Jobb:** 5 sek til «hva nå?»
- PHQ Hjem: 1 hero-tall + CTA + 2–3 kort
- AOS Stall-tilstand: grid tilstandskort
- Komponenter: TallHero/KpiFlis, Kort, CTAPill, TomTilstand

### 3. Liste
**Jobb:** skanne, filtrere, åpne én.
- 390: kortliste · 1280/1680: tabell/tette rader
- Komponenter: Rad, DataTable, FilterPills

### 4. Detalj
**Jobb:** forstå én enhet.
- 390: stack + faner · 834+: split
- Komponenter: AvatarInit, PillTabs, domain-kort

### 5. Wizard
**Jobb:** fullføre flerstegs handling.
- Stegindikator + Tilbake/Neste + kvittering
- Samme skall PHQ/AOS

### 6. Live
**Jobb:** logge uten distraksjon.
- Fullskjerm, touch ≥44px, pause/avslutt alltid synlig

### 7. Analyse
**Jobb:** tilstand 5s, årsak 30s.
- Én flate med faner (ikke separate moduler)
- Presisjonsstrategi (ikke DECADE i UI)

### 8. Kalender
**Jobb:** se tid og handle der du ser det.
- 390: ukestripe + dag · 1680: uke/måned grid

## Mapping (eksempler)
| Rute | Familie |
|---|---|
| /portal | Hub |
| /portal/planlegge/workbench | Kalender |
| /portal/analysere | Analyse |
| /portal/live/* | Live |
| /admin stall | Hub/Liste |
| /admin/spillere/[id]/* | Detalj |
| /admin/plans/new | Wizard |

## Done wireframe
- [ ] Soner merket
- [ ] 390 + 1280 (+834 AOS)
- [ ] 5-sekunders primærhandling
- [ ] Tom/laster/feil
- [ ] Familie valgt
