# Ni gjenværende grener — beslutningsunderlag (2026-07-27)

Alle andre grener er ryddet. Disse ni har innhold som **ikke** finnes i main, verifisert av
to uavhengige agenter per gren (én triage + én skeptiker med mandat om å motbevise sletting).

Ingen av dem kan merges som de er — alle er langt bak main og ville rullet tilbake nyere arbeid.
Verdien ligger i å **plukke ut enkeltdeler**, ikke i å merge grenen.

## Anbefalt rekkefølge

| # | Gren | Hva som er verdt å redde | Innsats | Anbefaling |
|---|---|---|---|---|
| 1 | `fix/lansering-kjopsvei` | Krympe-sperre i turneringsimporten | Liten | **Plukk commit `f833c092`** |
| 2 | `chore/meg-embeddings-supabase` | LaunchAgent-stier + gratis embeddings | Liten | **Plukk sti-fiksen nå**, resten senere |
| 3 | `feature/wang-treningsplanlegger` | Tilgangssjekk på drills + gruppeplan-propagering | Middels | **Del opp** — sikkerhet først |
| 4 | `v2/bolge-a1-stall` | IDOR-scoping på tre spiller-sider | Liten | **Plukk sikkerhetsdelen** |
| 5 | `claude/vercel-link-login-z0nvpx` | Migrasjonsbaseline + DDL-dokumentasjon | Middels | **Trenger beslutning** |
| 6 | `claude/design-changes-abw5pc` (PR #136) | Stemningsbilder på fire markedssider | Liten | **Trenger beslutning** — er bildene gode nok? |
| 7 | `redesign/analyse-samling` | Pivot-analyse av treningsloggen | Stor | **Trenger beslutning** — konsept, må bygges på nytt |
| 8 | `claude/mobile-desktop-improvements-90kanx` | Fire funksjoner (mobil-zoom, TrackMan-import m.m.) | Stor | **Trenger beslutning** — plukk 4 av 358 filer |
| 9 | `claude/skjermplan-v2-opprydding` | To småfikser (URL-sanering, tidssone) | Liten | **Plukk fiksene, slett grenen** |

---

## Detaljer per gren

### 1. `fix/lansering-kjopsvei` (f833c092)

**Verdt å redde:** `scripts/import-norske-turneringer.ts` — en sperre som stopper importen hvis
den nye eksporten har under 80 % av radene som allerede ligger i databasen. Motivert av en ekte
hendelse 15. juni 2026 der en scraper-feil halverte Srixon-eksporten uten at noen merket det.
Samme commit senker MIN_YEAR fra 2016 til 2014 så Titleist Tour-historikken kommer med.

**Ikke merge grenen:** resten (markedsføringssiden for coaching) er eldre enn main og ville
regressert. Plukk kun commit `f833c092`.

### 2. `chore/meg-embeddings-supabase` (8696f7fb)

**Verdt å redde, haster litt:** to LaunchAgent-filer i repoet peker på en mappe som ikke finnes
(`~/Developer/Golf_Headquarters` — repoet heter `akgolf-hq`) og på feil npm-sti. Hvis Meg-boten
eller Mulligan-triagen noen gang aktiveres, feiler de stille.

**Større del:** bytter tekstsøket i Meg fra betalt Voyage til gratis Supabase-modell. Krever ny
database-migrasjon i Meg sitt eget prosjekt. Egen jobb.

### 3. `feature/wang-treningsplanlegger` (03e485ff)

**Sikkerhet først:** grenen legger tilgangssjekk på øvelses-sidene i PlayerHQ
(`canUserAccessDrill`). I main er de eldre øvelses-sidene ugatet — en spiller kan i prinsippet
åpne en øvelse hen ikke har fått tildelt. Bør inn uansett hva du bestemmer om resten.

**Funksjonen:** gruppeplan-propagering — legger du en økt på gruppens timeplan, dukker den opp i
hver enkelt spillers plan. Main viser gruppeplanen i kalenderen, men kopierer den ikke ut.
205 linjer + tester. Reell funksjonalitet, men et produktvalg.

### 4. `v2/bolge-a1-stall` (778c00b7)

**Sikkerhet:** tre sider (`/admin/spillere/[id]/profil`, `/rediger`, `/tildel-test`) henter
spilleren uten å sjekke at det er coachens egen spiller. Alle andre tilsvarende sider i main
gjør sjekken. Én coach kan altså åpne en annen coachs spillerprofil med foreldrekontakt,
skadehistorikk og notater. Grenen har fiksen.

**Resten:** fem Talent-komponenter som ingen side bruker — verdiløse uten en skjerm å vise dem på.

### 5. `claude/vercel-link-login-z0nvpx` (da8f1f6e)

**Verdt å vurdere:** en ren migrasjonsbaseline som løser en kjent, dokumentert felle — i dag
kan man ikke kjøre `prisma migrate dev` fordi en gammel migrasjon feiler når alle 81 spilles av
fra bunnen. Grenen har også et komplett uttrekk av produksjonsdatabasens struktur og alle
sikkerhetsregler (~200 KB dokumentasjon som ikke finnes noe annet sted).

**Beslutning:** dette rører databasen. Skal ikke gjøres uten at du sier fra.

### 6. `claude/design-changes-abw5pc` (PR #136, fortsatt utkast)

Fire AI-genererte stemningsbilder på markedssider som mangler foto (booking, junior, PlayerHQ,
priser) + et 344-linjers prompt-dokument. **Beslutning:** liker du bildene? Hvis nei, lukk PR-en
og slett grenen.

### 7. `redesign/analyse-samling` (4592ddd3)

Et 276-linjers analysepanel: filtrer treningsloggen på fire dimensjoner og sammenlign perioder.
Ingenting tilsvarende i main. **Men** det er bygget på designsystemet som ble avviklet 25. juli,
og datalaget i main har ikke lenger feltene panelet trenger. Konseptet er verdt å ta vare på;
koden må skrives på nytt.

### 8. `claude/mobile-desktop-improvements-90kanx` (2b020f11)

358 filer, 903 commits bak main, praktisk umulig å merge. Fire funksjoner finnes ikke i main:
mobil-visninger for Workbench (liste/kanban/to dager), TrackMan-import fra skjermbilde,
media og notater per øvelse i live-økt, og opprett-øvelse-flyt. Resten er ~40 admin-skjermer
bygget mot det avviklede designsystemet — ikke verdt å redde.

### 9. `claude/skjermplan-v2-opprydding` (2963b083)

Grenen selv er foreldet (erstattet av porteringsbølgene). To småfikser er verdt å ta med:
URL-sanering på øvelsesforslag-siden og korrekt tidssone på tidsstempler. Begge er små nok til
å gjøres direkte i main.

---

## Gjenopprett en slettet gren

```
git branch <navn> <sha>
git push origin <navn>
```

GitHub beholder slettede grener i ca. 90 dager og kan gjenopprette dem fra PR-siden.
