# Designport fase 1 — Grunnmur: oppgaveplan i åtte økter

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (én økt om gangen,
> i denne fila sin rekkefølge) eller superpowers:subagent-driven-development. Hver økt er en egen
> fil med avkryssbare steg (`- [ ]`). Les KUN øktens fil pluss denne indeksen — ikke alle åtte.

**Mål:** Måleverktøyet blir ærlig og automatisk, den vedtatte TallHero-rettelsen kommer inn, og
dokumentene slutter å lyve — slik at hver skjerm som signeres etterpå signeres mot riktig
oppførsel, mot gyldig tegning, og beskyttes av CI. Ingen skjerm porteres i fase 1.

**Arkitektur:** Fase 1 rører verktøykjeden rundt porten (vakter i `npm run verify` og
`.github/workflows/ci.yml`, sign-off-riggen i `tests/visual/` + `scripts/train-lock-pixel-diff.mjs`,
datofrys i `src/lib/testing/dato-override.ts`, nattlig måling i `.github/workflows/playwright.yml`)
og dokumentene (`designsystem/train-lock/*.md`, MASTERPLAN, beslutninger). Eneste komponent som
endres er `TallHero` i `src/components/v2/core.tsx` (vedtatt 03.09).

**Tech Stack:** Next.js 16 App Router · TypeScript · `node:test` via `tsx` (ikke vitest) ·
Playwright · GitHub Actions · Train-lock-tokens (`--tl-*` / `TL`).

**Spec:** `docs/superpowers/plans/2026-09-05-komplett-designport.md` §3 (prinsipp) og §4 Fase 1.
Beslutning: `.claude/rules/beslutninger.md` §KOMPLETT DESIGNPORT. Arbeid: MASTERPLAN STEG 20.1.

## Globale krav (gjelder hver økt)

- Én økt = maks 2 timer (CLAUDE.md §Forbruk). Én økt = én fil under. Ferdig økt = merget PR.
- Fersk gren fra `origin/main` per økt. Aldri `git add -A` — stage navngitte filer.
- Kode-endring: `npm run verify` grønn før commit. Docs-only: `node scripts/check-doc-lenker.mjs`.
- Worktree uten `.env.local`: kopier ALDRI `.env*` inn. Sett dummy `DIRECT_URL`/`DATABASE_URL` i
  skallet for `prisma generate` (gotchas.md §Aldri kopier .env*). Riggen (målinger mot prod)
  kjøres kun fra maskinen med `.env.local` — øktene 3, 4 og 6 sier hvordan.
- Ingen nye avhengigheter. Ingen nye design-tokens. Train-lock er fasit (invariant 2). Aldri SF Pro.
- Ingen emoji. Norsk bokmål i kommentarer og UI. Repoet er offentlig — ingen hemmeligheter i kode.
- Hovedmappa `~/Developer/akgolf-hq` sto 05.09 på `feat/steg-19-6-19-7-kontrast-tallhero` med
  150 ukommitterte filer (beslutningskø 30). Rør ikke den grenen. Jobb i et worktree.
- Etter hver økt: MASTERPLAN 20.1 får «økt N levert (PR #…)», og `docs/feillogg.md` får en linje
  hvis noe gikk galt.

## Slik starter du en økt (kopier og lim)

```bash
cd ~/Developer/akgolf-hq && git fetch origin && git worktree add .claude/worktrees/fase1-okt-N -b claude/fase1-okt-N origin/main && cd .claude/worktrees/fase1-okt-N && npm ci && export DIRECT_URL=postgresql://dummy:dummy@localhost:5432/dummy DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy && npx prisma generate && cat docs/superpowers/plans/2026-09-05-designport-fase-1-okt-N.md
```

Bytt `N` med øktnummeret. Les så øktfila fra toppen og kryss av steg for steg.

## Rekkefølge og avhengigheter

| Økt | Fil | Innhold | Avhenger av | Krever prod-rigg |
|---|---|---|---|---|
| 1 | `…-okt-1.md` | Vakter inn i verify og CI: bredde-gate, ingen-paper, kontrast (rapport), dekningsvakt, signalfarge-tellevakt | — | Nei |
| 2 | `…-okt-2.md` | TallHero slutter å telle (19.7) + Vei A-regelen inn i gotchas/README (19.6) | — | Nei |
| 3 | `…-okt-3.md` | Datofrys gjennom Plan/Analyse, `--dato` i seed, dato per riggrad, PH-07 remåles i fylt uke | — | Ja |
| 4 | `…-okt-4.md` | Riggen får `fasitDato`/`minutter`/`aarsak`/`viewport`/`selector`, gyldighetssjekk i README, AO-radene rettes, panel-modus, AO-03/AO-08 måles | Økt 3 først (begge rører rad-typen) | Ja |
| 5 | `…-okt-5.md` | Filhode-konvensjon (`Fasit:` + `Rigg:`/`Avvik:`) i PORTING.md + `check-fasit-sitering.mjs` i verify og CI | Økt 1 (CI-steg-mønsteret) | Nei |
| 6 | `…-okt-6.md` | Nattlig måling (`train-lock-pixelnaerhet.spec.ts`) + lys/mørk-røyktest i `playwright.yml` | Økt 3 og 4 (feltene i riggen) | Ja |
| 7 | `…-okt-7.md` | Slett døde Paper-verktøy, rett `check-token-gap.mjs` og `kvalitet.mjs`, MASTERPLAN 2.1 | — | Nei |
| 8 | `…-okt-8.md` | Dokumenter og siteringer: D3 registreres, HANDOFF (proto-batchene, «Meny per enhet»), SCREEN-INDEX, seks filhoder, MASTERPLAN 2.12/10.3 | Sist (etter 5 og 7) | Nei |

Anbefalt rekkefølge: **1 → 2 → 7 → 3 → 4 → 5 → 6 → 8.** Øktene 1, 2 og 7 kan gå parallelt
(ulike filer). Øktene 3 og 4 rører samme type i `tests/visual/skjerm-mapping.ts` — ta 3 først.

## Fase 1 er ferdig når

1. `npm run verify` og `.github/workflows/ci.yml` kjører `check-ingen-paper.mjs` (blokkerende),
   `check-v2shell-bredde.mjs` (blokkerende), `check-tl-kontrast.mjs` (rapport), dekningsvakten og
   signalfarge-tellevakten — grønt på `main`.
2. `grep -n useCountUp src/components/v2/core.tsx` treffer ikke `TallHero` (kun `KpiFlis`).
3. `hentEffektivNaa()` er eneste klokke i `src/app/portal/actions.ts`; PH-07 er remålt i fylt uke
   med tall under 10 %; AO-03 og AO-08 har tall i riggen.
4. Alle rader i `tests/visual/skjerm-mapping.ts` har `fasitDato`; hver `ukalibrert` har `aarsak`;
   `tests/visual/README.md` har gyldighetssjekken.
5. `scripts/check-fasit-sitering.mjs` kjører i verify og CI; PORTING.md har konvensjonen.
6. `tests/visual/train-lock-pixelnaerhet.spec.ts` og lys/mørk-røyktesten har kjørt grønt én natt i
   `playwright.yml` (secret `SCREENTEST_PASSWORD` finnes allerede siden 26.08.2026).
7. `scripts/signoff-gallery.mjs`, `signoff-side.mjs`, `tests/e2e/paper-visual/` og
   `check-typografi.mjs` er slettet; `check-token-gap.mjs` nevner ikke Paper.
8. D3 står i `beslutninger.md`; HANDOFF har proto-batchene og «Meny per enhet» merket overstyrt;
   `node scripts/check-doc-lenker.mjs` er grønn.

## Ikke i fase 1 (bevisst)

- Utgått-merking av PH-15, gammel DG-01, A-07, A-08, AG-05, AG-13 — designbeslutning, stilles til
  Anders før fase 2 (beslutningskø 31 pkt 6).
- KA-04-montering i I dag — skjermendring, fase 2 med canvas + gate.
- P-05-siteringene — gjort i PR #788. PH-21 — gjort i PR #789. S3-03-riggrader — PR #787.
- 19.6-kontrast-sweepen i hovedmappa (150 filer) — beslutningskø 30. Kun tellevakten låser nivået.
- Synk av `proto/` — beslutningskø 32. Referansen ligger i `designsystem/train-lock/referanse/`.

## Øktfilene

- [Økt 1 — Vakter inn i verify og CI](2026-09-05-designport-fase-1-okt-1.md)
- [Økt 2 — TallHero slutter å telle, Vei A-regelen inn](2026-09-05-designport-fase-1-okt-2.md)
- [Økt 3 — Datofrys og PH-07 remåles](2026-09-05-designport-fase-1-okt-3.md)
- [Økt 4 — Riggen får felt og panel-modus, AO-radene rettes](2026-09-05-designport-fase-1-okt-4.md)
- [Økt 5 — Filhode-konvensjon og vakt mot fasit-drift](2026-09-05-designport-fase-1-okt-5.md)
- [Økt 6 — Nattlig måling og lys/mørk-røyktest](2026-09-05-designport-fase-1-okt-6.md)
- [Økt 7 — Slett døde Paper-verktøy](2026-09-05-designport-fase-1-okt-7.md)
- [Økt 8 — Dokumenter og siteringer](2026-09-05-designport-fase-1-okt-8.md)

Hver øktfil er skrevet 05.–06.09.2026 av en planlegger som leste de faktiske filene på
`origin/main` (b0595b304 + #787/#788), og sjekket av en skeptiker. Linjenumre er veiledende
hvis filene er endret siden — bruk `grep -n`-ankrene som står ved hvert steg.
