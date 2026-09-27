# Turneringsdata → komplette spillerprofiler — første analyse

Dato: 2026-09-26. Lesende undersøkelse av `ak-golf-pipelines` (main pluss ukommittert
arbeid fra 24.–26.09) og `akgolf-hq` (worktree `claude/ak-golf-pipelines-5a2024`, lik
`origin/main`). Ingen kode, database eller jobb er endret. Tall fra basen er hentet fra
kartleggingene 14.09 og 22.09 — basen ble ikke lest direkte i denne økten (se §9).

Bestillingen (Anders 26.09): all turneringsstatistikk fra GolfBox skal henge på
spillerprofilen, turnering for turnering, med brutto score, til par, slag vunnet eller
tapt mot startfeltet, slag bak vinner, justert for banens vanskelighet. Profilene
oppdateres automatisk hver mandag og vises i PlayerHQ, AgencyOS, Team Norway, WANG og
rangskjermene. («AK12» i bestillingen utgår — Anders 26.09, se §8.)

---

## 0. Kort svar

- **Alle tallene du ber om finnes allerede** — i rålageret `dashboard` i pipelines-repoet.
  Til par, mot feltet, slag bak vinner og justert score ligger ferdig regnet per runde
  i én visning (`dashboard.v_runde`), med sesongsnitt og persentil i eget kull oppå.
- **De når ikke appen.** Kopien til app-hyllen `public` tar bare med score, plassering og
  til par. Én eneste skjerm i dag viser de riktige tallene (PlayerHQ → Meg → Resultater),
  og den er ikke visuelt godkjent.
- **Mandagskjeden virker, men er ikke komplett.** 21.09 gikk alle tre GitHub-jobbene
  grønne for første gang. Men identitetsløseren og beregningsmotoren står ikke i noen
  jobb — de ble kjørt for hånd 22.09. Uten dem blir nye runder liggende uten spiller og
  uten tall.
- **To systemer skriver til samme app-tabeller med ulik nøkkel.** HQ sin egen GolfBox-jobb
  (GitHub Actions, hver time) og pipelines sin mandagsjobb nøkler samme GolfBox-turnering
  forskjellig. Det gir dubletter. Må sjekkes i basen før noe mer bygges (§4b).
  **Besluttet 26.09: pipelines blir eneste kilde** (`.claude/rules/beslutninger.md`).
- **Anbefaling:** én kilde (pipelines), én identitet (`dashboard.persons`), én kopi til
  appen med de fem nivåtallene, én mandagskjede med vakt, og én datamodul i HQ som alle
  fem flatene leser fra. Rekkefølge i §7.

---

## 1. Slik henger det sammen i dag

```
GolfBox (scores.golfbox.dk)
   │
   ├──► ak-golf-pipelines (Python, GitHub Actions, mandag 04:00 UTC)
   │       python -m pipelines.golfbox       → dashboard.tournaments, tournament_results,
   │                                            round_holes (hull for hull), field_stats (feltsnitt)
   │       python -m pipelines.identity      → dashboard.persons + person_aliases   [IKKE i jobben]
   │       python -m pipelines.sg            → runde_vanskelighet, person_niva,
   │                                            turnering_feltstyrke                 [IKKE i jobben]
   │       refresh_views                     → åtte materialiserte visninger
   │       golfbox_public_sync (etter jobben)→ public.tournaments, public_player_entries,
   │                                            public_player_rounds  (score/plassering/til par)
   │
   └──► akgolf-hq selv
           .github/workflows/scrape-golfbox.yml (hver time 06–20 UTC)
                                             → samme public-tabeller, egen skraper (TypeScript,
                                                syncGolfBoxLeaderboards)      [SKAL SLUTTE, 26.09]
           /api/cron/turneringer-ngf (daglig 04:30)   → kalender og frister, navnekobling, speil
           /api/cron/norge-mandag-sync (mandag 06:00) → kalender, navnekobling, backfill, dedupe

Appen leser:
   PlayerHQ Meg → Resultater ........ dashboard (via funksjonen profile_results)   ← eneste med nivåtall
   Alt annet ........................ public.*  (score, plassering, til par)
```

Tre ting å merke seg i bildet:

1. **Rålageret er rikt, app-hyllen er fattig.** `dashboard.tournament_results` har
   medlemsnummer, klubb, handicap, fødselsår og person-id. `dashboard.round_holes` har
   score og par per hull. `dashboard.field_stats` har snittet for HELE startfeltet (også
   utlendinger og anonyme), regnet før norsk-filteret — det kan ikke regnes i ettertid.
   Ingenting av dette kopieres til `public`.
2. **Beregningslaget er bygget** (migrasjon 0013, 0016 i pipelines): `v_runde` gir per
   runde `til_par`, `felt_snitt`, `mot_felt`, `vanskelighet`, `justert_score`,
   `slag_bak_vinner`. `v_person_sesong` gir sesongsnitt og `persentil_kull`.
   `v_person_monster` gir birdie-, bogey- og dobbeltrate og snitt per par 3/4/5.
   `get_full_player_profile(person_id)` pakker hele profilen som JSON.
3. **HQ har sin egen GolfBox-skraper i tillegg** (GitHub Actions-jobben
   `scrape-golfbox.yml`, hver time, `syncGolfBoxLeaderboards`). Den er den som faktisk har
   holdt norske resultater ferske i appen (kartlegging 14.09), og den har den kjente
   svakheten at «første klasse-forekomst» kan være netto (minnenotat 30.08). Vercel-cronene
   `turneringer-ngf` og `norge-mandag-sync` henter bare kalender og kobler navn.

---

## 2. Krav mot det som finnes

| Krav (Anders 26.09) | Finnes? | Hvor | Når appen |
|---|---|---|---|
| Brutto score per runde | Ja | `dashboard.tournament_results.rounds`, `public_player_rounds.score` | Ja |
| Til par | Delvis | `v_runde.til_par` — krever par, som bare finnes når alle 18 hull har par i hulldata | Ja (fra kilden, ikke regnet) |
| Mot startfeltet (vunnet/tapt) | Ja | `field_stats` + `v_runde.mot_felt` | **Nei** |
| Slag bak vinner | Ja | `v_turnering_vinnere` + `v_runde.slag_bak_vinner` (per klasse) | **Nei** |
| Banens vanskelighet | Modell | `runde_vanskelighet` (feltstyrke-modellen, §5) — ikke rating/slope | **Nei** |
| Justert score på tvers av turneringer | Ja | `v_runde.justert_score`, `v_person_sesong.justert_snitt` | **Nei** |
| Persentil i eget kull | Ja | `v_person_sesong.persentil_kull` (min 4 runder, kull ≥ 10) | **Nei** |
| Én profil per menneske | Ja | `dashboard.persons` + `person_aliases` (alle medlemsnumre) | **Nei** — `public_players` matcher på navn + fødselsår, `ngfId` er tom (0 rader) |
| Automatisk hver mandag | Delvis | `junior-tours-sync.yml` → `golfbox-public-sync.yml` | Identitet og beregning mangler i kjeden |
| Manuell registrering | Ja (base) | `register_manual_tournament()` (0017) | Ingen skjerm kaller den |

Tall vi vet (kilde og dato):

| Mål | Tall | Kilde |
|---|---|---|
| Turneringer i `public` | 7 295 | kartlegging 14.09 |
| Norske runder i `public` uten SG | 183 657 | kartlegging 14.09 |
| GolfBox-runder i `dashboard` etter etterfylling | 102 440 (OLYO 46 819 · GolfBox u/serie 30 150 · Srixon 15 730 · Norgescup 8 139) | ak-brain 22.09 |
| Pipelines-tester | 641 grønne, 8 hoppet over | kjørt 26.09 i denne økten |
| Mandagsjobbene 21.09 | alle grønne (junior-tours 09:26, golfbox-public 10:43, datagolf-public 13:37 UTC) | GitHub Actions 26.09 |

---

## 3. Hva som virker (ikke bygg på nytt)

- **Innhentingen** (`pipelines/golfbox/`): brutto-only, norsk-only, anonyme hoppes over,
  hull for hull med par, medlemsnummer, klubb, handicap, feltsnitt før filter.
  Verifisert mot ekte GolfBox-svar. 641 tester.
- **Identiteten** (`pipelines/identity/`): medlemsnummeret er autoritativt; klubbytte gir
  nytt nummer på samme person; aldri gjetting mellom to kandidater. Regelen «feil
  sammenslåing er verre enn delt profil» står i koden.
- **Beregningen** (`pipelines/sg/`): feltsnitt per hull (`felt.py`) og feltstyrke-modell
  (`feltstyrke.py`). Modellen er ærlig om grensene sine: bare spillere som er bro mellom
  turneringer får nivå; én runde alene gir 0.
- **Profilkoblingen for spilleren selv** (0012/0014 + `src/lib/profil-kobling/`):
  «Er dette deg?» med rate-limit, aldri score før bekreftet kobling, kun eierens egne
  tall. Personvernmessig den tryggeste delen av hele systemet.
- **DataGolf holdes ute** av alt spillere ser (`v_runde` utelukker Nordic League).
  Lisensen tillater ikke visning for andre. Ikke rør dette.

---

## 4. Funnene, viktigst først

### a. Nivåtallene stopper i rålageret

`golfbox_public_sync` kopierer `finish_pos`, `total_score`, `to_par` og rundescorene.
Ikke `mot_felt`, ikke `slag_bak_vinner`, ikke `justert_score`, ikke `person_id`, ikke
klubb. Dermed kan ingen av flatene som leser `public` vise det du ber om, uansett hvor
mye skjerm som tegnes. Dette er hovedjobben.

### b. To skrivere, ulik nøkkel → dubletter

| | HQ Actions `scrape-golfbox.yml` (`golfbox-sync.ts`) | Pipelines (`writers/public_db.py`) |
|---|---|---|
| `sourceId` i `public.tournaments` | GolfBox-RID (`competitionId`) | **`dashboard.tournaments.id`** (intern løpenummer) |
| Finner eksisterende ved | RID på tvers av alle GolfBox-opphav | kun eget opphav + eget løpenummer |
| Spillermatch | navn (`resolvePlayer`) | navn + fødselsår, tvetydig hoppes over |
| `tour` | klassifisert | alltid `junior-no` (også NorgesCup) |

Samme turnering kan altså ligge to ganger i `public.tournaments`, med hvert sitt sett
deltakelser. HQ har allerede en `dubletter`-side i admin og et `mergedIntoId`-felt, som
tyder på at dette har skjedd før. Første kjøring av pipelines-speilingen var 21.09, så
omfanget må måles nå:

```sql
select name, "startDate"::date, count(*) as antall, array_agg("sourceOrigin"||':'||"sourceId")
from public.tournaments
where "sourceOrigin" in ('OLYO','SRIXON','NORGESCUP','OSTLANDS','GOLFBOX','NM','SENIOR','REGIONTOUR')
group by name, "startDate"::date having count(*) > 1
order by 2 desc limit 50;
```

### c. Fire identiteter for samme menneske

1. `dashboard.persons` — medlemsnummer med historikk. Den riktige.
2. `public.public_players` — navn + fødselsår, `ngfId` aldri fylt.
3. `User.publicPlayerId` — coach kobler (admin → turnering-kobling) eller eksakt navnetreff.
4. `dashboard.profile_links` — spilleren bekrefter selv («Er dette deg?»).

2 og 3 vet ikke om 1. 3 og 4 er to koblinger av samme bruker som kan peke på to ulike
personer. Ingen av delene er feil hver for seg, men de må bli ett system.

### d. Mandagskjeden mangler to ledd og har to eiere

`junior-tours-sync.yml` kjører innhenting → navnematch (gammel) → visninger. Deretter
`golfbox-public-sync.yml`. **Ingen jobb kjører `pipelines.identity` eller
`pipelines.sg`.** De ble kjørt lokalt etter etterfyllingen 22.09 (`etter-backfill.sh`).
Hver mandag etter det får nye rader ingen person og ingen tall. Samtidig kjører HQ sin
egen skraper daglig og skriver i samme tabeller (b). Jobbene feilet 07.09 og 14.09 før
den grønne kjøringen 21.09 — det finnes ingen vakt som sier fra når det skjer
(`sync-vaktbikkje` i HQ sjekker ikke pipelines).

### e. Banevanskelighet: vi har ikke rating og slope, og trenger det ikke først

Kun ca. 9 % av turneringene har banenavn; ingen har rating eller slope (README).
`public.baner` har feltene, men er tom. Det vi har er bedre til formålet:

- **Feltsnittet** (samme bane, samme dag, samme vær) fjerner bane og vær innenfor én
  turnering. Gyldig for å rangere i et felt og følge én spiller over tid.
- **Feltstyrke-modellen** bruker spillere som spiller flere turneringer som bro, og
  skiller «vanskelig runde» fra «svakt felt». Det gjør `justert_score` sammenlignbar
  på tvers av tourer. Samme prinsipp som DataGolf bruker.
- **Par** finnes bare når alle 18 hull har par i hulldataene. Da vises til par; ellers
  strek, ikke gjetning (TruthLayer).

Rating/slope kan legges på senere som et tredje lag, men skal ikke blokkere.

### f. Ukommittert arbeid i pipelines-repoet (24.–26.09)

39 endrede filer (+146/−2 735) og 20 nye, ikke committet: yaml/json/csv flyttet til
`data/`, fixtures flyttet, `pyproject.toml` ny, workflows endret til `pip install -e`,
migrasjon **0016 og 0017 som ifølge active-context er kjørt mot produksjon**, nye skript
(`export_player_profiles.py`, `register_manual_tournament.py`, `get_tournaments_catalog.py`)
og `docs/design-system/CLAW_DESIGN_SKILL.md` + `team-norway-design-system.md`.

Testene er grønne med dette arbeidet (641/641). Men: prod-basen har to migrasjoner
repoet ikke har i git, og designdokumentene hører ikke hjemme i pipelines (Claw er
dessuten utgående per beslutninger.md). Må committes eller ryddes før neste steg.

### g. Mindre funn

- `SOURCE_TO_ORIGIN` speiler bare 5 av kildene. Ren «golfbox» (30 150 runder uten
  serie), `regions_tour`, `nordic_league` og `manual` når aldri appen via pipelines.
- `v_turnering_vinnere` tar `MIN(total_score)` per klasse — riktig for slagspill, men
  klassekode tom (`''`) slår sammen alle uten klasse.
- Unik nøkkel `(tournament_id, player_name, class_code)` i rålageret kan overskrive to
  spillere med samme navn i samme klasse (kjent fra 22.09).
- `register_manual_tournament()` setter `class_code` til kjønn (`M`/`F`) — det kolliderer
  med klassekodene fra GolfBox i vinner-beregningen.

---

## 5. Anbefalt målbilde

Ett prinsipp: **pipelines regner, appen viser.** Ingen beregning i Next.js som ikke
finnes i `dashboard` først.

```
GolfBox ──► pipelines (mandag, én kjede, én jobb)
              1. golfbox (i år + i fjor)
              2. identity      ← inn i jobben
              3. sg            ← inn i jobben
              4. refresh_views
              5. public_sync   ← utvidet: person-id, medlemsnr, klubb, feltsnitt,
                                  mot felt, bak vinner, vanskelighet, justert, par
              6. vakt: skriv én rad til dashboard.modell_kjoring + varsle HQ ved rødt
                                  │
                                  ▼
                        public.* (Prisma, eid av HQ)
                          public_players      + personId, ngfId (nåværende medlemsnr), klubb
                          public_player_entries + slagBakVinner, feltN
                          public_player_rounds  + feltSnitt, motFelt, parRunde,
                                                  vanskelighet, justertScore
                                  │
                                  ▼
                        HQ: src/lib/spillerprofil/  (én datamodul, ren funksjon + tester)
                                  │
              ┌───────────┬───────┴───────┬────────────┬────────────┐
           PlayerHQ    AgencyOS      Team Norway      WANG      Rangskjermer
```

Valgene bak bildet:

| Valg | Anbefaling | Hvorfor |
|---|---|---|
| Hvem skriver norske resultater til appen | **Pipelines alene (besluttet 26.09).** HQ-jobben `scrape-golfbox.yml` slutter å skrive resultater; cron `turneringer-ngf` beholdes for kalender og frister | Pipelines har medlemsnummer, hull og feltsnitt; HQ-skraperen har netto-svakheten. Anders: «så vi ikke gjør dobbelt med arbeid» |
| Nøkkel i `public.tournaments` | **GolfBox-RID som `sourceId`**, ett opphav per RID | Det HQ allerede bruker; fjerner dublettkilden |
| Spilleridentitet i appen | `public_players.personId` → `dashboard.persons.id`. Én person = én `PublicPlayer` | Medlemsnummer slår navn + fødselsår |
| Kobling bruker ↔ profil | `profile_links` (spillerens eget ja) er fasit. `User.publicPlayerId` settes fra den, ikke motsatt. Coach kan fortsatt koble i AgencyOS, men det lager en `pending` som spilleren (eller forelder) bekrefter | Personvern for mindreårige; én sannhet |
| Hvor tallene leses fra | `public.*` for alle flater. `profile_results()` mot `dashboard` beholdes bare for hullkortet (rådata) | Én kilde, Prisma-typet, RLS-enkelt |
| Kolonner i `public` | HQ legger dem til (additivt, kirurgisk `db execute`, aldri `migrate`). Pipelines fyller, legger aldri til | CLAUDE.md-regel i begge repo |
| Banevanskelighet | Feltsnitt + modell nå. Rating/slope som lag 3 senere | §4e |
| Frekvens | Mandag. Ingen daglig kjøring av resultater | Bestillingen; GolfBox-last |

---

## 6. Skjermene

| Flate | Rute i dag | Viser i dag | Kilde | Skal vise / mangler |
|---|---|---|---|---|
| **PlayerHQ · Meg → Resultater** | `/portal/meg/resultater` | til par, mot feltet, justert, mønster, hullkort | `dashboard` via `profile_results()` | + slag bak vinner, persentil. Ikke visuelt godkjent (port 7). Eneste skjerm som er nær målet |
| **PlayerHQ · Analyse → Turneringer** | `/portal/analysere/turneringer` | plassering, til par, runder per år | `public` via `User.publicPlayerId` | Samme tall som over. Bør bli én skjerm, ikke to |
| **AgencyOS · Spiller** | `/admin/spillere/[id]` (+ `/analyse`, `/turnering-kobling`) | turneringer i oversikts-bento, historikk i analyse | `public` | Egen «Turneringer»-fane (er ikke lenket i dag), nivåtall, stall-sammenligning (coachens verktøy) |
| **Team Norway · Rangliste (TN-07)** | `/team-norway/rangliste` | snitt plassering, snitt brutto score | `tournament_results` (speil til bruker) | Rangerer på rå score → feil. Skal bruke justert snitt, mot feltet, starter, persentil. Fortsatt «ikke et uttak» |
| **Team Norway · Spiller** | `/team-norway/spiller/[id]` | poster og tidslinje (TN-10) | — | Ny profilside med turneringshistorikk. Krever databehandleravtale før TN-trenere ser mindreårige |
| **WANG** | `/team-wang` i HQ (skall) | ingenting | — | Besluttet 26.09: vises i HQ `/team-wang`, samme base. `wang-toppidrett` (egen base) er et annet prosjekt og holdes utenfor |
| **Rangskjermene** | `ngf-junior-dashboard` (Vite, egen Vercel) · `/stats/leaderboards`, `/stats/spillere/[slug]`, `/stats/klubber`, `/stats/regions` | ranking fra CSV-uttrekk (`intern_nivaakart`) · offentlige stats fra `public` | CSV på Drive · `public` | Dashboardet er utenfor mandagskjeden. PR #955 ruter domenet til `/team-norway/rangliste`. Offentlige stats: barnevern-regelen (født 2008+ uten samtykke vises aldri) |

Felles for alle: **måling, dato og kilde på hvert tall** (TruthLayer), strek når verdien
mangler, aldri estimat uten merking. DataGolf-tall aldri på flater andre enn Anders ser.

---

## 7. Foreslått rekkefølge (ikke godkjent)

Hvert steg har en kontroll. Steget er ikke ferdig før kontrollen er grønn.

1. **Mål dublettene og rydd pipelines-repoet.** Kjør spørringen i §4b. Commit eller
   forkast det ukommitterte arbeidet; migrasjon 0016/0017 inn i git; Claw-dokumentene ut.
   *Kontroll:* `git status` ren i pipelines, 641 tester grønne, dubletttall kjent.
2. **Én nøkkel.** Pipelines-speilingen bruker GolfBox-RID som `sourceId` og finner på tvers
   av opphav, som HQ. Engangs-sammenslåing av eksisterende dubletter (`mergedIntoId`).
   *Kontroll:* spørringen i §4b gir 0 rader.
3. **Identitet og beregning inn i mandagsjobben.** `identity` → `sg` → `refresh_views` i
   `junior-tours-sync.yml`, i den rekkefølgen. Én kjede, ikke to workflows.
   *Kontroll:* `dashboard.modell_kjoring` får ny rad hver mandag; `person_id` null-andel
   for nye rader under 5 %.
4. **Kolonnene i `public`.** HQ legger til `personId`, `ngfId`-fylling, `clubName` på
   spiller; `slagBakVinner`, `feltN` på deltakelse; `feltSnitt`, `motFelt`, `parRunde`,
   `vanskelighet`, `justertScore` på runde. Kirurgisk `CREATE/ALTER ... IF NOT EXISTS`.
   *Kontroll:* `prisma validate` grønn, `db-check` OK/WARN, ingen `migrate`.
5. **Utvidet speiling.** `public_db.py` skriver på person, ikke navn; fyller de nye
   kolonnene fra `v_runde`. Kontraktstesten (`test_public_schema_contract.py`) utvides.
   *Kontroll:* håndregnet fasit på én turnering (tre spillere) stemmer i `public`.
6. **Én datamodul i HQ.** `src/lib/spillerprofil/` — ren funksjon fra rader til profil
   (karriere, sesonger, turneringer, runder), testet, brukt av alle flater. Slår sammen
   `turneringshistorikk.ts` og `profil-kobling/typer.ts`.
   *Kontroll:* enhetstester; Meg → Resultater og Analyse → Turneringer viser samme tall.
7. **Koblingen samles.** `User.publicPlayerId` utledes av bekreftet `profile_link`; coach-
   kobling lager `pending`. Engangs-avstemming av de 9+ koblede spillerne.
   *Kontroll:* ingen bruker med to ulike personer; ingen bekreftet kobling uten ja.
8. **HQ slutter å skrive resultater (besluttet 26.09).** `scrape-golfbox.yml` går over til
   kalender-modus eller slås av; `syncGolfBoxLeaderboards` fjernes fra
   `scripts/scrape-golfbox.ts`. `turneringer-ngf` beholder kalender og frister.
   `norge-mandag-sync` slutter med navnematch og backfill.
   *Kontroll:* ingen `public_player_entries` med `updatedAt` fra HQ etter byttet.
9. **Vakt.** Pipelines skriver status; HQ `sync-vaktbikkje` (mandag 08:00) varsler Anders
   ved manglende rad eller rød jobb.
   *Kontroll:* simulert rød kjøring gir varsel.
10. **Skjermene, én om gangen, i denne rekkefølgen:** PlayerHQ Meg → Resultater (nærmest
    ferdig) → AgencyOS spillerfane → Team Norway rangliste (TN-07 omregnet) → Team
    Norway spillerprofil → WANG → rangskjermene. Hver med port 7 (Anders har sett den,
    390 px og desktop, lys og mørk, tom/laster/feil).

Steg 1–3 kan starte nå. Steg 4–5 er den egentlige jobben. Steg 10 skal ikke starte før 6.

---

## 8. Spørsmål til Anders

**Avklart 26.09** (registrert i `.claude/rules/beslutninger.md` §PIPELINES ER ENESTE KILDE
FOR TURNERINGSRESULTATER): AK12 utgår. Pipelines er eneste kilde for resultater, og
HQ-skraperen slutter. WANG-profilen bor i HQ `/team-wang`; WANG-appen holdes utenfor.

Fortsatt åpne:

1. **Ren «GolfBox» uten serie (30 150 runder), Regions Tour og manuelle turneringer** —
   skal de også til appen? I dag stopper de i rålageret. (Beslutningen sier at pipelines skal
   dekke det HQ-skraperen dekket, så svaret er trolig ja — men serie-merkingen må gjøres.)
2. **Nordic League** finnes bare via DataGolf. Regelen 21.09 sier DataGolf vises aldri
   for andre. Står den? (Åpent siden 22.09.)
3. **Databehandleravtale med Team Norway og WANG** før noen av deres trenere ser
   mindreårige spilleres tall. Er den i gang?

---

## 9. Ikke verifisert i denne økten

- Ingen spørring mot basen: lesing av `.env` ble avslått, og Supabase-MCP er ikke
  autorisert i denne økten. Alle basetall er fra 14.09 og 22.09.
- Om dublettene i §4b faktisk finnes, og hvor mange.
- Om migrasjon 0016/0017 faktisk er kjørt mot produksjon (active-context sier ja).
- Hva GitHub-jobbene 07.09 og 14.09 feilet på (ikke hentet logg — se gotchas om polling).

---

## Relatert

- [golfdata-kartlegging-2026-09-14.md](golfdata-kartlegging-2026-09-14.md) — hva vi har, målt
- [turnering-datakilder.md](../turnering-datakilder.md) — kildekart
- `ak-golf-pipelines/docs/plan-spillerprofiler-og-nivakartlegging.md` — tistegsplanen 21.09
- `ak-golf-pipelines/drizzle/migrations/0010`–`0017` — datamodellen som finnes
- [beslutninger.md](../../.claude/rules/beslutninger.md) §Data — brutto, barnevern, TruthLayer
