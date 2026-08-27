# T13-detaljer — Oppsett-detaljsider til Train-lock (27.08.2026)

Leveranse fra oppgavebriefen «Port de 14 klasse A-detaljsidene under Oppsett
til Train-lock etter hub-mønsteret fra AG-13/AG-18 (allerede portet i T13)».
Gren: `claude/t13-detaljer-train-lock-b219e4`.

## Hva er gjort

Alle 14 detaljsidene + 5 T13-restsider (19 skjermer totalt) er re-skinnet fra
Paper (`T.*`-tokens) til Train-lock (`TL.*`-tokens), med `tl-kit.tsx` +
`AdminProfilTrainLock.tsx` (T13-hubben) som mønster. Ingen funksjonsendring —
samme datahenting, server actions, auth-sjekk og zod-validering som før.

### De 14 detaljsidene

| Side | Ny komponent |
|---|---|
| `/admin/settings/api` | `AdminApiKeysTrainLock.tsx` |
| `/admin/settings/calendar` | `AdminKalenderSynkTrainLock.tsx` |
| `/admin/settings/security` | `AdminSecurityTrainLock.tsx` |
| `/admin/settings/tilgang` | `AdminTilgangTrainLock.tsx` + `AdminTilgangPerTrenerTrainLock.tsx` |
| `/admin/klubb/innstillinger` | `AdminKlubbInnstillingerTrainLock.tsx` |
| `/admin/anlegg` | **konsolidert** inn i klubb/innstillinger, se under |
| `/admin/team/ekstern` | `AdminEksternLeserTrainLock.tsx` |
| `/admin/team/inviter` | `AdminInviterCoachTrainLock.tsx` |
| `/admin/integrasjoner` | `AdminIntegrasjonerTrainLock.tsx` |
| `/admin/gdpr` | `AdminGdprTrainLock.tsx` |
| `/admin/audit-log` | `AdminAuditLogTrainLock.tsx` |
| `/admin/feillogg` | `AdminFeilloggTrainLock.tsx` |
| `/admin/hjelp` | `AdminHjelpTrainLock.tsx` |
| `/admin/services` | `AdminServicesTrainLock.tsx` + `AdminServiceFormTrainLock.tsx` |

### Klubb + anlegg — konsolidert til ÉN flate

`/admin/anlegg` (fasilitet-CRUD med bookinger denne uka) er slått sammen med
`/admin/klubb/innstillinger` (org-innstillinger + klubb-liste) til én
Train-lock-skjerm, per oppgavebrief. `/admin/anlegg/page.tsx` er nå en ren
`redirect("/admin/klubb/innstillinger")` — gamle lenker (settings-huben sin
`fasiliteterHref`, globalt søk) virker fortsatt. `revalidatePath` i
`location-actions.ts` peker nå på `/admin/klubb/innstillinger`.

### T13-restsidene (godkjent 27.08, se D-LYS-OG-5T-BESLUTNING.md §0.8)

| Side | Ny komponent |
|---|---|
| `/admin/marketing` | `AdminMarketingTrainLock.tsx` |
| `/admin/videoer` | `AdminVideoerTrainLock.tsx` |
| `/admin/workspace` | `AdminWorkspaceHubTrainLock.tsx` (+ `tl-workspace-kit.tsx`) |
| `/admin/workspace/notion` | `AdminWorkspaceNotionTrainLock.tsx` |
| `/admin/workspace/prosjekter` | `AdminWorkspaceProsjekterTrainLock.tsx` |

`/admin/workspace/oppgaver` er IKKE rørt (utenfor scope — redirecter uendret
til `/admin/handlingssenter`).

## To hex-literaler fanget av check-token-gap — begge rettet

1. `AdminServiceFormTrainLock.tsx`: dialogens boksskygge (`rgba(0,0,0,0.5)`)
   erstattet med `inset 0 0 0 1px ${TL.hair}` (Train-lock: opaque materiale,
   ingen drop-shadow). Backdrop bruker nå `var(--tl-scrim)` via en liten
   scoped `::backdrop`-regel (native `<dialog>`-element).
2. `AdminWorkspaceNotionTrainLock.tsx`: Notion-logoens `#000`/`#fff` er
   tredjeparts merkevarefarge (skal IKKE temafarges) — samme unntak som
   forgjengeren hadde, flyttet i `scripts/check-token-gap.mjs` sin
   `ALLOW_MARKUP`-liste til den nye komponentfilen.

## Miljøfeller underveis (ikke kode-relatert)

- `node_modules` manglet i worktreet midt i økta (sannsynligvis fjernet av
  en annen parallell økt/prosess) — rettet med `npm ci` i worktreet, per
  gotcha «worktree-build-krever-npm-ci».
- `src/generated/prisma` manglet ved sesjonsgjenopptak — rettet med
  `npx prisma generate` (kun schema, ingen DB-tilkobling nødvendig).

## Verifikasjon

```
npm run verify
```
Grønt (prisma validate, tsc --noEmit, eslint, check-action-auth,
check-token-gap, check-critical-imports, check-doc-lenker, next build).
Ingen typefeil i noen av de porterte filene.

## Skjermbilde-gate

Verifisert manuelt i nettleser (innlogget `coachtest@akgolf.test`, ADMIN):
- `/admin/settings` (hub) — mørk desktop, mørk mobil (390px), lys desktop
- `/admin/klubb/innstillinger` (konsolidert klubb+anlegg) — mørk desktop, mørk mobil
- `/admin/settings/tilgang` — mørk desktop
- `/admin/gdpr` — lys desktop
- `/admin/workspace/notion` — mørk desktop
- `/admin/anlegg` → bekreftet redirect til `/admin/klubb/innstillinger`

Full godkjenning fra Anders (skjermbilde-gaten, CLAUDE.md §Beslutninger
16.08) gjenstår — skjermbildene over er tatt og sendt i samtalen, ikke bare
påstått.

## Ikke i scope / bevisst urørt

- `/admin/workspace/oppgaver` (ikke del av oppgavebrief).
- `/admin/settings/periode-navn` (ikke nevnt i brief).
- Ingen nye design-tokens, ingen refaktor av urørt kode, ingen merge til main.
