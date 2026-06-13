# Prosjekt-opprydding & struktur-review (13. juni 2026)

> Komplett gjennomgang av alle dokumenter, regler og «låste/absolutte» beslutninger — hva som kan
> slettes/arkiveres/fikses, og en enklere docs-struktur. Kodeverifisert. Den TRYGGE delen (arkivering av
> døde/passerte docs) er UTFØRT i denne økten (se §4); det sensitive (CLAUDE.md-redigering, full reorg)
> er anbefalinger som venter på din OK.

## 1. Kilde-til-sannhet i dag (behold — dette er settet å stole på)
- `docs/platform/` (AGENT-BRIEF, BUSINESS-RULES, PLATFORM-PRD, DATA-MODEL, screen-context) — plattformkanon.
- `docs/MASTER-SKJERMPLAN.md` — autoritativ skjermstatus.
- Dagens 5 planer: `forenklingsplan`, `agencyos-kontrolltarn-plan`, `verdensledende-treningsapp-plan`, `ai-treningsmotor-plan`, `restanse-review` (alle 2026-06-13) + `ux-arkitektur.md` v2.0 + `ux/01–04`.
- `.claude/rules/design-porting-gate.md`, `docs/design-system-lint.md`, `docs/flyt-effektivitet-prinsipper.md`.
- `docs/ordliste-ak-golf.md` (terminologi-kanon), drift/juridisk (`gdpr-behandlingsregister`, `sla`, `runbook`, `rollback`, `go-live-sjekkliste`).

## 2. Låste/absolutte regler — gyldig vs revider
**Fortsatt gyldige (bekreftet mot kode):** tema per produkt · AgencyOS-navn · navne-kanon · Planlegge→Workbench · Analyse samlet · abonnement uten tier (nå implementert) · ELITE finnes ikke i UI · FYS-formel avventer · designsystem-FORBUDT (ESLint) · master-skjermplan-gaten · porting-gate-unntak.

**Bør revideres (peker på noe som ikke finnes lenger):**
1. **CLAUDE.md «Wireframe-mappen er arkiv»-seksjon + 2 FORBUDT-punkter** → `wireframe/` er SLETTET. Regelen er nå støy. Fjern seksjonen (behold ev. én linje i FORBUDT).
2. **CLAUDE.md mappestruktur + «Låste beslutninger» peker på `docs/design-handoff-komplett/`** → mappen er SLETTET (arkivert i dag tidligere). Fjern referansen.
3. **PLATFORM-PRD «Skjerm-gate» lister 7 haker** mens MASTER-SKJERMPLAN/AGENT-BRIEF sier **6** (Mob/Desk/iPad = én kolonne) → juster PRD til 6.

## 3. Motsetninger doc vs kode å rette
1. **4 docs peker på slettet `public/design-handover/v10/`** (dead-reference-felle): `launch-mapping`, `v10-porting-koe`, `claude-design-samle-app-prompt`, `skjerm-manifest-workbench`. → arkivert (§4).
2. **`restanse-review-2026-06-13` P0-liste delvis allerede løst** (abonnement, deletedAt, eksport-plassholder fikset senere samme dag) → bør få «✅ løst i kode 13. juni»-note øverst.
3. **CoachHQ-navnet i ~20 src-filer** + **ELITE i ~14 TS-filer** (eyebrows/typer/styling) tross låsing → mekaniske restanser (egen oppryddings-PR).
4. **`sla.md`/`runbook.md` lover infrastruktur som ikke finnes** (status.akgolf.no, uptime-monitor, «Pro/Elite-rapport») → juster ordlyd (også i restanse-review P2).

## 4. UTFØRT i denne økten (trygg arkivering → `docs/_arkiv/`)
Døde/passerte standalone-docs flyttet til `docs/_arkiv/` (git mv, reversibelt): de v10-bundne (4), de
selv-merkede FORELDET-manifestene (3), og passerte planer/funn (`plan-komplett-skjermer-2026-06-10`,
`regelverk-revisjon-2026-06-04`, `decisions-2026-05`, `datakvalitet-funn`, `fase-d-datafundament`, `todo`,
`ai-coach-trenings-plan`). Se commit-diffen for nøyaktig liste.

## 5. Anbefalt (venter på din OK — ikke utført)
1. **Rett CLAUDE.md** (fjern wireframe-seksjon + design-handoff-komplett-peker) — sensitivt (governing fil), gjør gjerne nå hvis du sier ja.
2. **Flytt Claude Design-prompt-docs ut av repo til Drive** (`My Drive/.../prompt/`, fast regel) — ~7 filer (`agencyos-mission-control-design-prompts`, `meg-assistent-skjerm-prompts`, `claude-design-prompter`, `agency-build/`, `kobling-godkjenning/`, `design-koblinger/`).
3. **Arkivér `docs/migration/`** (V1→V2 ferdig) + passerte `docs/superpowers/plans/` (Fase 0/1).
4. **Ryddigere docs-struktur:** `docs/{platform, planer, drift, domene, design, _arkiv}` — flat rot går fra ~75 → ~15 levende filer.

## 6. Foreslått struktur
```
docs/
  platform/   ← kanon (AGENT-BRIEF, BUSINESS-RULES, PLATFORM-PRD, DATA-MODEL, screen-context)
  MASTER-SKJERMPLAN.md
  planer/     ← dagens 5 planer + ux-arkitektur + ux/
  drift/      ← sla, runbook, rollback, go-live, gdpr, restanse-review, code-review
  domene/     ← ordliste, turnering-datakilder, oppfolging-k10, mcp-server-setup
  design/     ← design-resources/, design-system-lint, flyt-effektivitet-prinsipper
  _arkiv/     ← alt passert
```
