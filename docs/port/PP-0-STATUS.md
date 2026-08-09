# PP-0 Foundation — status

**Plan:** `docs/port/PIXEL-PERFECT-PLAN-COMPLETE.md`  
**Dato:** 09.08.2026

| ID | Oppgave | Status | Bevis |
|---|---|---|---|
| PP-0.1 | Tokens = Paper v3.1 | **DONE** | `paper-tokens.css` vs `designsystem/paper/tokens/akhq-tokens.css` — bg/surface/cta/accent/rail/r match |
| PP-0.2 | Shell-monopoler PHQ + Agency + Auth | **DONE*** | `shell.tsx` (V2Shell, AGENCYOS_NAV, BunnNav/rail), `PaperChrome`, auth V2 midtkort. *Pixel shell vs fasit = PP-1/2, ikke nytt shell.* |
| PP-0.3 | Knapp/CTAPill ink + enTing clay | **DONE** | `core.tsx`: solid default `T.cta`, `enTing` → `T.handling` + minHeight 56 |
| PP-0.4 | Logo kun Paper-assets / LogoAK | **DONE** | LogoAK SVG Paper-prikk; `AkGolfLogo` → `/logos/paper/*`; sidebar-brand + design-lab + gfgk migrert; 0 gamle `/logos/ak-golf-logo-*` i src |
| PP-0.5 | CTA-lint | **DONE** | ESLint `no-restricted-syntax` for `#D1F843` / `#d1f843` i `src/**` |
| PP-0.6 | TrackMan + Workbench rute-map | **DONE** | `docs/port/PP-0-ROUTE-MAP.md`; TrackMan redirects allerede på plass |
| PP-0.7 | main = prod | **VERIFY** | main pushet `a4ec06d` (+ denne commit). Anders: vent Vercel Ready, hard refresh akgolf.no |

## Exit PP-0

Kode-gates 0.1–0.6: **grønne** etter merge av denne commit.  
0.7: manuell prod-sjekk.

**Neste:** PP-1 PlayerHQ kjerne pixel (Hjem → Plan → Analyse → Meg → Booking → Login).
