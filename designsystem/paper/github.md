repo: akgolfsoftware/Golf_Headquarters
branch: main
path: docs/port

## Last sync
date: 2026-08-09T10:48:00Z

### Updated in this project
- W5 (Marketing · Forelder · Auth · System) konsolideringsgate mot kode: `(marketing)/stats/*` (~45 ruter) skilt ut som eget produktspor — resten er 63 reelle ruter dækket av 6 maler. Notat: `kart/w5-marketing-auth-forelder-2026-08-09.md`.
- Tegnet 6 W5-wireframes: `fase2/marketing/marketing-side.html`, `marketing-katalog.html`, `fase2/auth/auth-flyt.html`, `auth-samtykke.html`, `fase2/forelder/forelder-barn.html`, `fase2/system/system-tilstander.html`. Delt `fase2/felles/w5-base.css` + `w5-demo.js`.
- Bølgeplanen W1–W6 er dermed gjennomført. Gjenstår: stats-sporet (~45, blokkert av PR-F) og drift/AgenticOS-sporet (~14).

### Forrige (W4, 2026-08-09)
- W4 (AgencyOS) konsolideringsgate mot kode: ~128 `page.tsx` under `src/app/admin/` → ~38 redirect-stubber (verifisert på filstørrelse), ~26 `(legacy)`-ruter fases ut, 12 har fasit fra pulje 4, drift/AgenticOS (~14) skilt ut som eget spor. Notat: `kart/w4-agencyos-konsolidering-2026-08-09.md`.
- Tegnet 6 W4-wireframes i `fase2/agencyos/`: godkjenninger (kø for 5 ruter), gruppe-detalj (5 ruter), bookinger og kapasitet (6), planbibliotek (8), turneringer (5), oppsett (14). Delt `w4-base.css` (akhq-tokens v3.1 verbatim + AgencyOS-skall) + `w4-demo.js`.

### Forrige (W3, 2026-08-09)
- W3 (Meg · Booking · Talent · Coach) konsolideringsgate mot kode: 63 anslåtte ruter → 17 reelle skjermer → 6 maler. 10 `(legacy)/coach/*` og 3 Meg-ruter er redirect-stubber (169–439 B) og utgår. Notat: `kart/w3-konsolidering-og-manifest-2026-08-09.md`.
- Tegnet 6 W3-wireframes i `fase2/playerhq/`: innstillinger (mal for 9 ruter), abonnement, helse, booking-ny, coach-hub, talent. Delt `w3-base.css` (akhq-tokens v3.1 verbatim) + `w3-demo.js`.
- W6-avklaringer fra Anders: WANG-innlogging = engangskode (som tegnet); `/gfgk-junior/kalender` beholdes som egen rute.

### Forrige (W6, 2026-08-09)
- W6 (WANG + GFGK) telt mot kode: 10 ruter, ikke med i de 343 — 6 har allerede fasit fra egne Claude Design-prosjekter, 4 manglet. Vedtak: begge micrositene beholder eget chrome/tokens, ikke Paper-shell. Notat: `kart/w6-telling-wang-gfgk-2026-08-09.md`.
- Tegnet 4 nye fase2-filer i merkevare-tokens: `fase2/wang/wang-coach-arsplan.html`, `fase2/wang/wang-logg-inn.html`, `fase2/gfgk/gfgk-kalender.html`, `fase2/gfgk/gfgk-veileder-artikkel.html`.
- W7 finnes ikke i bølgeplanen (W1–W6) — W3/W4/W5 står fortsatt igjen.

### Forrige sync (2026-08-08)
- Tegnet W2 — Analysere-undersider: verifiserte mot kode at kun `/portal/analysere/hull` mangler fasit (ikke ~40 som gammel skjermplan antok); `/portal/analysere` er allerede dekket av `fase1/playerhq-analyse.html`.
- Ny fil `fase2/playerhq/playerhq-analyse-hull.html` — §12 detaljside, Sone-kart + Hull for hull, Suksess+Tom.
- W2-rest (fulgt `docs/port/CLAUDE-DESIGN-PROMPT-RESTERENDE-SKJERMER.md`): 7 nye filer — Runder (liste+detalj), Gameplan (liste+banekart), DataGolf, TrackMan (liste+detalj). Manifest i `fase2/manifest-w2-rest-analysere-dybde.md`.
- Hjem-rest (varsler/venner/utfordringer) utsatt til neste batch.

## Screen map

| Prosjekt-fil | Repo-kilde |
|---|---|
| `fase2/marketing/marketing-side.html` | `src/app/(marketing)/page.tsx`, `priser`, `om-oss`, `coaching`, `playerhq`, `junior`, `faq`, `vilkar`, `personvern`, `cookies` |
| `fase2/marketing/marketing-katalog.html` | `src/app/(marketing)/coacher/[slug]`, `anlegg/[slug]`, `blogg/[slug]`, `cases`, `turneringer/[slug]` |
| `fase2/auth/auth-flyt.html` | `src/app/auth/logg-inn`, `login`, `signup`, `check-email`, `forgot-password`, `reset-password`, `bankid`, `etter-innlogging`, `logget-ut`, `onboarding`, `src/app/onboard/*` |
| `fase2/auth/auth-samtykke.html` | `src/app/auth/guardian-consent/[token]`, `lyd-samtykke/[token]`, `samtykke-venter`, `onboarding/forelder`, `src/app/inviter/forelder/[token]` |
| `fase2/forelder/forelder-barn.html` | `src/app/forelder/barn/[childId]`, `ukerapport`, `okonomi`, `fakturaer`, `bookinger`, `varsler`, `samtykke`, `coach` |
| `fase2/system/system-tilstander.html` | `src/app/offline/page.tsx` + not-found/error-grensesnittene |
| `fase2/agencyos/agencyos-godkjenninger.html` | `src/app/admin/godkjenninger/page.tsx`, `src/components/admin/v2/AdminGodkjenningerV2.tsx`, `src/lib/admin/ko-telling.ts`, `src/lib/agents/plan-action-executor.ts` |
| `fase2/agencyos/agencyos-gruppe-detalj.html` | `src/app/admin/grupper/[id]/page.tsx` (+ `arsplan`, `timeplan`, `workbench`), `src/components/admin/v2/GruppeDetaljV2.tsx`, `RullUtMalPanel.tsx` |
| `fase2/agencyos/agencyos-bookinger.html` | `src/app/admin/bookinger/page.tsx`, `src/components/admin/v2/AdminBookingerV2.tsx` |
| `fase2/agencyos/agencyos-planbibliotek.html` | `src/app/admin/plans/page.tsx`, `src/app/admin/plan-templates/*`, `src/app/admin/teknisk-plan/page.tsx` |
| `fase2/agencyos/agencyos-turneringer.html` | `src/app/admin/tournaments/page.tsx` (+ `[id]`, `dubletter`), `src/app/admin/turnering-kart/page.tsx` |
| `fase2/agencyos/agencyos-oppsett.html` | `src/app/admin/settings/page.tsx` (+ `api`, `calendar`, `security`, `periode-*`, `tilgang`), `src/components/admin/v2/AdminSettingsV2.tsx`, `src/app/admin/integrasjoner`, `gdpr`, `audit-log`, `feillogg` |
| `fase2/wang/wang-coach-arsplan.html` | `src/app/team-wang/coach/page.tsx`, `coach/coach-arsplan.tsx`, `_data/coach-arsplan.ts`, `src/styles/wang-tokens.css` |
| `fase2/wang/wang-logg-inn.html` | `src/app/team-wang/logg-inn/page.tsx`, `logg-inn/wang-login.tsx` |
| `fase2/gfgk/gfgk-kalender.html` | `src/app/gfgk-junior/kalender/page.tsx`, `src/styles/gfgk-junior-tokens.css` |
| `fase2/gfgk/gfgk-veileder-artikkel.html` | `src/app/gfgk-junior/veileder/[slug]/page.tsx`, `_data/veileder-artikler.ts` |
| `fase2/playerhq/playerhq-analyse-hull.html` | `src/app/portal/analysere/hull/page.tsx`, `src/components/portal/v2/AnalysereHullV2.tsx`, `src/lib/domain/hole-heatmap.ts` |
| `fase1/playerhq-analyse.html` (urørt) | `src/app/portal/analysere/page.tsx` |
| `fase2/playerhq/playerhq-runder-liste.html` | `src/app/portal/mal/runder/page.tsx`, `src/components/portal/v2/RunderV2.tsx` |
| `fase2/playerhq/playerhq-runde-detalj.html` | `src/app/portal/mal/runder/[id]/page.tsx`, `src/components/portal/v2/RundeDetaljV2.tsx` |
| `fase2/playerhq/playerhq-gameplan-liste.html` | `src/app/portal/gameplan/page.tsx`, `src/components/portal/v2/GameplanV2.tsx` |
| `fase2/playerhq/playerhq-gameplan-banekart.html` | `src/app/portal/gameplan/[baneId]/page.tsx` |
| `fase2/playerhq/playerhq-datagolf.html` | `src/app/portal/datagolf/page.tsx`, `src/components/portal/v2/DataGolfV2.tsx` |
| `fase2/playerhq/playerhq-trackman-liste.html` | `src/app/portal/mal/trackman/page.tsx` |
| `fase2/playerhq/playerhq-trackman-detalj.html` | `src/app/portal/mal/trackman/[id]/page.tsx` |
