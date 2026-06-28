# Fase 1 — bygg-bestilling for resterende skjermer (2026-06-28)

> Oppfølger til `agencyos-skjerm-komponentrevisjon-2026-06-28.md`. P0-robusthet er levert
> (tilstands-trio + flate-tilstander), og STUB-ene viste seg å være ekte/redirects. Dette er
> «bygg-bestilling per skjerm» for de 3 reelt manglende flatene — datakontrakt, tilstander,
> merkevare, kompleksitet. Hver påstand er verifisert mot kode, ikke gjettet.

## Sammendrag — status etter datagrunning

| Skjerm | Faktisk status (verifisert) | Anbefalt handling |
|---|---|---|
| **Coach-varsler-senter** | MANGLER. Modeller finnes (Signal/PlanAction/Notification). Ingen ny modell. | **BYGG FØRST** (S/M) |
| **Stats-publisering** | Nøkkel-UI **ferdig** (`/admin/settings/api`). API åpent i dag. | 1 beslutning → trolig 0 kode |
| **Umatchede resultater** | **Ikke klar** — ingen resultat-import lager umatchede rader. | UTSETT til import finnes |

---

## Skjerm 1 — Coach-varsler-senter  (BYGG FØRST)

**Rute:** `/admin/varsler` (ny). **Auth:** COACH + ADMIN. **Tema:** AgencyOS mørkt (`.dark`).

**Brukerjobb:** Coach ser, samlet på én flate: agent-forslag som venter på handling, ferske
signaler om spillerne, og egne uleste varsler — uten å lete i 4 menyer.

**Datakontrakt (alt eksisterende modeller):**
- `PlanAction` where `status="PENDING"` og `userId ∈ coachens spillere`, `include: user, plan`.
  Dette er agent-forslag (DRILL_SUGGEST, TAPER_ENGAGE, WITHDRAW …) som venter coach-godkjenning.
- `Signal` — siste rad pr `(userId, kind)` for stallen, filtrert til «verdt å vise» pr kind
  (kinds: SG_TOTAL/SG_AREA/HCP_TREND/CLUB_AVG/PYRAMID_AREA/STREAK).
- `Notification` — coachens egne uleste (`readAt = null`): type/title/body/link.
- «Coachens spillere» hentes via **samme kilde som `/admin/spillere`** (serviceType-relasjon,
  ikke `role=COACH` — jf. coach-identity-model). Ikke bygg ny spiller-spørring.
- Ny loader: `src/lib/admin/load-varsler.ts` (rene Prisma-tellinger + grupper).

**UI (gjenbruk, ikke nybygg):**
- `AthleticHero` topp (eyebrow «AGENCYOS · VARSLER»).
- 3 grupper via `SectionHeader` + `action-list`/`queue-item`: «Venter på deg» (PlanActions),
  «Signaler» (Signal), «Meldinger» (Notification). Filterchips per gruppe.
- Rad = `AthleticAvatar` + tekst + relativ tid + handling:
  - PlanAction → Godta/Avvis (gjenbruk eksisterende plan-action-actions).
  - Notification → «Marker lest» (ny liten server-action `markNotificationRead`).
- lime kun på aktiv/haster (jf. brand-regel), aldri flate.

**4 tilstander (bruk athletic-trioen fra P0.1):**
- innhold · tom («Ingen varsler nå» + EmptyState-ikon Bell) · laster (Skeleton-rader) · feil (ErrorState).

**Kompleksitet:** S/M. Ny rute + loader + 1 server-action. Ingen migrasjon. Ingen ny komponent.

**Åpen beslutning:** aggregat (én rad pr spiller-signal, ekspander for detalj) **[anbefalt]** vs.
full per-spiller-liste. Påvirker kun gruppering, ikke datamodell.

---

## Skjerm 2 — Stats-publisering  (nesten ferdig — trenger 1 beslutning)

**Funnet i kode:**
- `/admin/settings/api` håndterer **allerede** `ApiKey`: opprett (`create-key-modal`),
  revoke, scopes, prefix-visning, `actions.ts`. **Nøkkelstyring er levert.**
- `/api/stats/search` spør `prisma.publicPlayer` **uten auth** → API-et er åpent i dag.
- `ApiKey`-modellen har `scopes` (Json), `hashedKey`, `expiresAt`, `revokedAt`.

**Gjenstår — avhenger 100 % av din beslutning:**
1. Skal det offentlige stats-API-et **gates med nøkkel**, eller forbli **åpent**?
2. Skal du **styre hva som er offentlig** (felt/spillere), eller er alt i `publicPlayer` ment offentlig?

**Utfall:**
- «Åpent + alt i publicPlayer er offentlig» → **0 kode**, vi lukker punktet.
- «Gate + styring» → liten jobb: x-api-key-sjekk mot `ApiKey.hashedKey` + scope `stats:read` i
  `/api/stats/*`, + ev. en eksponerings-toggle. Ingen ny modell.

**Anbefaling:** ta beslutningen; sannsynligvis ingen ny skjerm trengs — kun en avklaring.

---

## Skjerm 3 — Umatchede resultater  (UTSETT — forutsetning mangler)

**Funnet i kode:**
- `datagolf-sync.ts` synker **SG-baselines** (hopper over ukjente *lie*-typer, ikke spillere).
- `turneringer/sync.ts` (`syncNorwegianPlayers`) **fyller PublicPlayer-katalogen** fra DataGolf
  etter navn — den kobler ikke resultater til interne brukere.
- **Ingen** oppretter `TournamentResult` / `PublicPlayerRound` (grep tomt). `Round` lages av
  spillerens egen runde-logging.

**Konsekvens:** «Koble importerte resultater uten profil til spiller» forutsetter en
bulk-resultat-import som **ikke finnes**. Å bygge skjermen nå = bygge hele
import → fuzzy-match → lagre-pipelinen først. Dette er ikke et raskt P1-kort.

**Anbefaling:** UTSETT til (hvis) en resultat-import bygges. Da legges til:
`UnmatchedResult`-modell (importrad + rå navn + foreslått `userId`) + fuzzy-koble-UI.
Egen, større leveranse — ikke Fase 1.

---

## Anbefalt rekkefølge

1. **Coach-varsler-senter** — bygg nå (eneste rene, klare skjerm; ingen migrasjon).
2. **Stats-publisering** — 30-sekunders beslutning fra deg → trolig 0 kode.
3. **Umatchede resultater** — park til en resultat-import finnes.
4. **MasteryRing / StreakTracker** — bygg når en skjerm (f.eks. varsler eller progresjon) trenger dem.
   Å bygge dem løst nå = komponenter ingen bruker (bryter «ingen spekulativ kode»).

## Beslutninger jeg trenger fra deg

- **Coach-varsler:** aggregat m/ ekspander (anbefalt) eller per-spiller-liste?
- **Stats:** gate API-et med nøkkel, eller forbli åpent? Hva er offentlig?
