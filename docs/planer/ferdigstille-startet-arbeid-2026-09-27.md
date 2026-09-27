# Arbeidsplan for å ferdigstille startet arbeid

**Dato:** 27.09.2026  
**Status:** Styringsplan. Ikke en ny produktbeslutning.  
**Mål:** Få alt påbegynt arbeid enten ferdigstilt, merget, lukket eller eksplisitt parkert uten å miste oversikt.

## Prinsipp

Vi jobber i én kø. Ingen ny funksjonsbygging starter før aktuell køpost er ferdig definert som ett av disse utfallene:

1. Merget til `main` med grønn CI og relevant produksjons-/preview-kontroll.
2. Lukket fordi den er erstattet, feil vei eller ikke lenger ønsket.
3. Parkert med tydelig eier, grunn og neste port.

En PR er ikke “klar” bare fordi testene er grønne. Den må også være riktig i produkt, tilgang/personvern, designstatus og mergebarhet.

## Nåstatus 27.09.2026

`origin/main` er `680c21d1f` etter PR #970. GitHub CI/verify og prod-røyktest er grønne på main.

Åpne PR-er:

| PR | Status | Hva den trenger |
|---|---|---|
| #958 Team Norway TN-04 til TN-19 | Grønn, clean, men utkast | Port 7 / Anders-gjennomgang, deretter tas ut av draft og merges hvis fortsatt grønn |
| #931 Junior 16 årsplan | Grønn, clean, men utkast | Avklar om dette er fagutkast som skal inn, parkeres eller lukkes |
| #955 NGF-domeneredirect | Rød og konflikt | Vurder om behovet er erstattet; enten lukk eller bygg på nytt fra main |
| #952 WANG hero | Grønn historisk, men konflikt | Rebase/rekonstruer fra main bare hvis designet fortsatt gjelder |
| #947 Rydd utgåtte mapper | Konflikt, mangler full CI | Må behandles som risikabel sletting; gjennomgå fil for fil før eventuell ny PR |
| #926 Én master for språk/trening | Grønn historisk, men konflikt | Høy risiko for overlapp med senere beslutninger; må diffes mot main og deles opp |
| #924 PH-01 I dag | Rød og konflikt | Lukk hvis erstattet av Precision/PH-løp; ellers bygg på nytt fra gjeldende designautoritet |
| #918 OW-3 fase 3 | Utkast og konflikt | Parkert til OW-3 prioriteres eksplisitt |
| #910 Team Norway-demo WIP | WIP og konflikt | Trolig erstattet av #958/#953; bekreft og lukk |

Lokale arbeidsflater:

| Arbeidsflate | Status | Hva den trenger |
|---|---|---|
| `codex/treningsmotor` i prosjektroten | Skitten | Del opp i TrackMan-duplikater, TrackMan observations og Skill Map |
| `claude/team-norway-screens-597b16` | Aktiv worktree for #958 | Port 7, eventuell retting, merge |
| `codex/komplett-design-gjennomgang` | Ulagrede ruteinventar-endringer | Avklar om endringen er nyttig; commit eller kast etter kontroll |
| lokal `main` worktree | Ahead 2 / behind 1 | Ikke bruk som sannhet; erstatt med ren main-worktree når nødvendig |
| lokal `codex/test-plan-master-2026-09-26` | 3 commits, ingen remote | Må vurderes separat: merge, ny PR eller arkiver/lukk |

## Arbeidsrekkefølge

### 0. Kontrollrom før arbeid

Før hver arbeidsøkt:

```bash
git fetch origin --prune
git status -sb --untracked-files=all
gh pr list --state open --limit 100 --json number,title,headRefName,isDraft,mergeStateStatus,statusCheckRollup,url
git worktree list --porcelain
```

Oppdater én kort statuslinje i `~/ak-brain/logg/YYYY-MM-DD.md` etter vesentlig endring. Ved større ryddesteg: oppdater `~/ak-brain/claude-code/active-context.md` og `~/ak-brain/prosjekter/akgolf-hq.md`.

### 1. Sikre ren main

Mål: Én lokal main som speiler GitHub-main uten lokale mergecommits.

Gjør:

- Opprett eller bruk en ren, isolert worktree fra `origin/main`.
- Ikke bruk gammel lokal `main` som beslutningsgrunnlag før den er ryddet.
- Bekreft at `origin/main` har grønn CI og prod-røyktest.

Ferdig når:

- Det finnes en ren main-arbeidsflate for sammenligning og patching.
- Ingen arbeid gjøres direkte i lokal `main`.

### 2. Rydd `codex/treningsmotor`

Mål: Få den skitne hovedarbeidsmappen ut av risikosonen uten å miste arbeid.

Del i tre separate spor:

| Spor | Filer | Handling |
|---|---|---|
| TrackMan-duplikater | TrackMan-import, Prisma-migrasjon, datakart og tester som allerede matcher #969 | Sammenlign mot `origin/main`; behold ikke duplikatendringer som egne commits |
| TrackMan observations | `src/lib/agents/trackman-observations*`, endringer i `trackman-agent.ts`, agent-register | Lag egen liten PR etter sikkerhet/personvern/AI-vurdering |
| Skill Map | `public/images/skill-map/`, `src/app/portal/analysere/skill-map/`, `src/components/portal/skill-map/`, `src/lib/domain/skill-map*` | Lag egen PR bare hvis flaten er visuelt kontrollert og designmessig ønsket nå |

Ferdig når:

- Prosjektroten enten er ren eller har kun én bevisst aktiv oppgave.
- Hvert spor har egen PR, egen lukking eller egen parkering.

### 3. Ferdigstill #958 Team Norway

Mål: Avslutte Team Norway-løpet som faktisk er nærmest ferdig.

Gjør:

- Kjør Port 7 / Anders-gjennomgang av TN-04 til TN-19.
- Rett kun funn fra gjennomgangen.
- Kjør `npm run verify`.
- Ta PR-en ut av draft først når port og kontroll er bestått.
- Merge hvis CI og Vercel fortsatt er grønne.

Ferdig når:

- #958 er merget eller eksplisitt lukket.
- Team Norway-demo #910 er vurdert som erstattet eller fortsatt nødvendig.

### 4. Avklar dokument-/fagutkast

Mål: Ikke la fagutkast ligge som evige grønne draft-PR-er.

Rekkefølge:

1. #931 Junior 16 årsplan: besluttes inn, parkert eller lukket.
2. lokal `codex/test-plan-master-2026-09-26`: vurder om de tre commitene fortsatt skal inn.
3. #926 Én master for språk/trening: diffes mot dagens masterkilder; del opp hvis noe fortsatt er gyldig.

Ferdig når:

- Hvert fagutkast har én av tre statuser: merget, lukket eller parkert med dato/eier.

### 5. Konflikt-PR-er: lukk eller bygg på nytt

Mål: Ikke bruke tid på konfliktløsing før vi vet at arbeidet fortsatt gjelder.

Prioritet:

| PR | Anbefalt retning |
|---|---|
| #955 | Lukk hvis domenebehovet er utdatert eller bygg ny minimal redirect-PR fra main |
| #952 | Bygg på nytt fra main bare hvis WANG-hero fortsatt er valgt design |
| #947 | Ikke merge gammel sletting. Lag ny, kontrollert oppryddings-PR hvis behovet står |
| #924 | Lukk hvis PH-01 er erstattet av Precision/ny PH-retning |
| #918 | Parker til OW-3 prioriteres |
| #910 | Lukk hvis #958 dekker Team Norway-demoen |

Ferdig når:

- Ingen konflikt-PR står åpen uten en konkret “neste handling”.

### 6. Design- og ruteinventar

Mål: Rydde worktree `codex/komplett-design-gjennomgang`.

Gjør:

- Sammenlign `ruteinventar.csv/json` mot faktisk ruter.
- Hvis verdien er reell: lag én dokument-/asset-PR.
- Hvis den er mellomlagring: flytt status til ak-brain og kast lokale filendringer etter eksplisitt kontroll.

Ferdig når:

- Worktree-en er ren eller har en aktiv PR.

## Fast rytme fremover

### Daglig start

- Les `~/ak-brain/claude-code/active-context.md`.
- Sjekk åpne PR-er og worktrees.
- Velg maks én kode-PR og én dokument-/beslutningsoppgave.
- Ikke start ny flate før valgt oppgave har tydelig port.

### Før merge

En PR kan bare merges når alt er sant:

- Ikke draft.
- Mergebar / clean.
- CI grønn.
- Vercel/preview grønn hvis relevant.
- Sikkerhet/personvern vurdert hvis `src/`, `prisma/`, persondata, AI, import eller tilgang røres.
- Visuell kontroll gjort når skjerm/UI røres.
- Ak-brain oppdatert med hva som faktisk ble gjort.

### Ukentlig rydding

- Slett remote branches uten åpen PR.
- Lukk PR-er som er erstattet.
- Parkér arbeid som ikke skal tas neste uke.
- Sørg for at hver aktiv worktree har én tydelig oppgave.

## Ikke gjør

- Ikke merge draft-PR bare fordi den er grønn.
- Ikke konfliktløse gamle PR-er før produktverdien er bekreftet.
- Ikke blande Skill Map, TrackMan observations og TrackMan-importduplikater i samme commit.
- Ikke kjøre databaseendringer som del av dokument- eller statuskontroll.
- Ikke rydde lokale WIP-branches med tvang uten at innholdet er vurdert.

## Neste konkrete steg

1. Lag ren main-worktree eller frisk opp eksisterende ren main-arbeidsflate.
2. Del `codex/treningsmotor` i tre spor og få prosjektroten ren.
3. Kjør Port 7 på #958 og merge/lukk Team Norway-løpet.
4. Lukk eller parker #910 etter #958-beslutningen.
5. Avklar #931 og lokal `codex/test-plan-master-2026-09-26`.
6. Gå gjennom konflikt-PR-ene én og én med “lukk eller bygg på nytt”-regel.
