> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

# Wave I status — Pattern marketing / public / stats (2026-08-09)

> **Master:** [`WAVE-STATUS-MASTER.md`](./WAVE-STATUS-MASTER.md)

## Scope
Offentlige markeds- og stats-sider **uten** Paper HTML-fasit (plan §6.3 Wave I).

## Levert

### Chrome / system
| Endring | Detalj |
|---|---|
| **MCta** | Solid primær: **clay** (`T.handling`) · 56px · radius 12 (ikke lime) |
| **MRamme** | `data-paper-wave-i` + `data-paper-pattern="marketing"` |
| **StatsRamme** | arver MRamme + `waveId` (stats-*) |
| **40 V2-sider** | eksplisitt `waveId` på MRamme/StatsRamme |

### Sider (utvalg)
Forside · Coaching · PlayerHQ · Priser · Om oss · Kontakt · FAQ · Jobb · Junior  
Blogg · Anlegg · Coacher · Booking (+ bekreft/kvittering) · Cases · Vilkår · Cookies · Personvern  
**Stats:** hub, søk, verktøy, baner, klubber, spillere, turneringer, norske, uka, min progresjon, blogg

### Bevisst beholdt (marketing)
- **Mørk-først** chrome (ikke PlayerHQ cream) — produktvalg i MRamme
- **Store hero-titler** (M.heroD/M) — marketing-skala, ikke app 17px
- **Lime** på nav-active / em-aksent (status/merke) — ikke primær CTA

## DONE-def (uten fasit)
Tokens + clay primær + wave-markør. Pixel-diff ikke krav.

## Neste
**Wave J** — legacy/intern/onboard rest **eller** Mac push A–I.
