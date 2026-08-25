# LOOP-B2 — Release-gren for Workbench bølge 1 (DONE)

Gren: `release/workbench-b1`, satt sammen fra `main` 2026-08-25.

## Flettet inn

| Kilde | Commit | Innhold |
|---|---|---|
| `origin/main` (basis for grenen) | `7482d834` | inkl. WANG-årsplan (#578) og turnerings-dedupe-fix (#576) |
| `origin/claude/sessioninspector-drill-ui-125d70` (PR #577) | `4d20a14a26846e1b7f7ec2abc72e4d8f0ceaa416` | Loop 2S — delt `DrillListEditor` i Ny økt + `SessionInspector` |
| `origin/claude/workbench-rls-policies-8b054b` | `49fa667b0e2ecc2eaf3d6d55e5d40a0f2e5babea` | RLS på `workbench_sessions`/`workbench_drills` (migrasjon + apply-script) + Loop 3S-dokumentasjon |

Begge feature-grenene delte felles base `b376fe64` (allerede inneholder Loop 1 + Loop 2 +
tom-uke-fix), så det innholdet er med transitivt — ingen egen merge var nødvendig for det.

## Konflikter

**Ingen manuelle konfliktløsninger nødvendig.** `src/lib/domain/workbench/labels.ts` ble
auto-merget rent av git (ort-strategien) i andre merge — begge grenene la til ulike,
ikke-overlappende linjer i fila.

Merge-commits:
- `1e897af7810fe4641c9a0650a1f8587c6adf9540` — merge av `workbench-rls-policies-8b054b`
- (foregående merge-commit for `sessioninspector-drill-ui-125d70`, umiddelbart før)

## Verifisering

```
npm run verify   → EXIT 0 (prisma validate/generate, tsc, eslint, action-auth, token-gap,
                    critical-imports, next build + serwist build — alle steg grønne)
npm test         → 1605 tester, 179 suiter, 0 feil, 0 hoppet over
```

Full output: `/tmp/b2-release/verify.log`, `/tmp/b2-release/test.log` (lokal maskin, ikke committet).

## Kjent gjenstående (ikke del av B2)

- **Ekte «I dag» er IKKE fullkoblet** — `PortalChatHjem`/portal-hjem leser ennå ikke
  `loadPlayerDay`, fire tilstander (publisert/hvile/pågår/feil) mangler. Dette er **B4** i
  `docs/natt/LAUNCH-PLAN-FULL-2026-08-25.md` §5, avhenger av denne grenen (B2).
- Mobil-inspector er fortsatt `hidden lg:block` — coach kan ikke redigere enkeltøkt på mobil
  fra denne grenen. Del av **B3** (Agency-herding).
- `PR #575` (`docs/natt-plan-2026-08-25`) er identisk med innholdet denne grenen allerede har
  og kan lukkes som superseded — ikke gjort her (ligger under Del 1-opprydding, egen
  Anders-godkjenning kreves før noe slettes/lukkes).
- `docs/natt/README.md` peker fortsatt på feil kodegren (`natt-a1-a4`) — retting hører til B2
  i ryddetabellen i launch-planen, men er ikke gjort i denne sesjonen (anti-scope: R1/docs-opprydding).

## Anti-scope overholdt

Ingen endring i `prisma/schema.prisma` utover det som fulgte med de to feature-grenenes
egne commits (additiv, allerede gjennomgått i deres egne DONE-dokumenter). Ingen
`prisma migrate`/`db push` kjørt. Ingen bølge 2 (C1–C10), ingen Train-lock-port, ingen
docs-opprydding (R1) utført.

## Push

Grenen er pushet til `origin/release/workbench-b1`. **Ingen PR opprettet mot main** —
per oppdrag, kun release-gren.
