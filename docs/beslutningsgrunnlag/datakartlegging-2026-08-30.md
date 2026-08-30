# Datakartlegging 30.08.2026 — grunnlag

Målt underlag bak beslutningsblokken «DATAKARTLEGGING» i `.claude/rules/beslutninger.md`.
870 spørringer mot produksjonsbasen, 19 parallelle agenter.
Rapport: https://claude.ai/code/artifact/4e712519-a0f0-4c5e-9363-14dbb2f01a24

Flyttet hit 30.08.2026 fordi målingene er oppslagsverk, ikke regler. **De bindende reglene
(hvilke kolonner som skal leses, hva som aldri skal bygges) står fortsatt i beslutninger.md** —
de lastes i hver økt. Dette dokumentet slår du opp i når du trenger tallene.

---

- **DATAKARTLEGGING — fire svar + målt inventar (Anders 2026-08-30, i økt):**
  full kartlegging av DataGolf-lageret og norsk turneringsdata. 870 spørringer
  mot produksjonsbasen, 19 parallelle agenter. Rapport:
  https://claude.ai/code/artifact/4e712519-a0f0-4c5e-9363-14dbb2f01a24

  **Anders' fire svar:**

  1. **`/stats/aargang` flyttes bak innlogging.** Siden er bygget som åpen
     kohort-utforsker for fødselsår 2000–2012 — nøyaktig det 30.08-beslutningen
     om spillere født 2008+ forbyr. Den slettes ikke og tømmes ikke; den flyttes
     til gratis-konto-laget, samme sted som live-sidens lag 2.
  2. **Kjønn SKAL legges til som felt** (Anders: «Vi må legge til kjønn»).
     Hele veien, i denne rekkefølgen: (a) felt i datamodellen, (b) manuell
     utfylling for Anders' egne spillere (WANG, GFGK, Academy) umiddelbart,
     (c) utledning fra klassekode som EKSPLISITT MERKET supplement — den dekker
     kun 2 266 av 8 593 norske (26,4 %) og gir 200 jenter mot 2 066 gutter,
     altså systematisk skjevt, (d) ekte kilde via NGF/GolfBox som mål.
     Uten kjønn er enhver kullsammenligning villedende for halve gruppen.
  3. **Fail-closed på fødselsår gjelder KUN ikke-DataGolf-spillere.** Regelen
     «mangler fødselsår → skjul» ville fjernet 3 556 av 3 569 DataGolf-proffer
     fra de åpne sidene — voksne proffer på offentlige tourer, altså det laget
     som faktisk er trygt. Norske turneringsspillere må ha fødselsår OG være
     myndige for å vises åpent.
  4. **Stripe-koblingen sikres framover, historikken godtas.** Webhooken fikses
     nå slik at alt fra 1. sep er målbart. De 49 vellykkede betalingene på
     59 100 kr (samt 7 feilede på 10 500 kr) forblir historikk uten kobling til
     bruker/booking/abonnement.

  **Hastesak (før 1. september, én arbeidsdag totalt):**
  - **1 655 norske spillere født 2008+ ligger åpent med navn og fødselsår** på
    45 stats-sider uten innlogging. Yngste fødselsår i basen er 2021. Filteret
    koster kun 10,74 % av norsk turneringsdata — 89,0 % av deltakelsene er
    myndige. Ett felles predikat på fire innganger: `/stats/spillere`,
    `/stats/spillere/[slug]`, `/stats/sok`, `/api/stats/search`.
  - **`/stats/wrapped` gir 3 598 spillere oppdiktet fødselsår** (`birthYear ?? 1990`).
    Direkte TruthLayer-brudd. 10 minutters fiks.
  - **DataGolf-attribusjon mangler på 0 av 45 offentlige sider.** Lisensvilkår.
    Eneste forekomst i `src/` står på en adminflate (AdminBenchmarksV2.tsx:171).

  **Målte korreksjoner av premisset (bruk disse tallene, ikke de gamle):**
  - `public_players` = **12 839**, ikke 13 614 (13 614 var Postgres-estimat).
    Norske: **8 593**, hvorav **8 546 (99,5 %) har fødselsår**.
  - «941 245 norske resultater» er feil. 941 245 er HELE `public_player_rounds`,
    hvorav **757 928 er DataGolf-proffdata**. Ekte norsk grunnlag:
    **183 317 runder / 147 670 deltakelser**, 2014–2026.
  - `dg_rounds` = **962 208** med komplett SG på alle. Fordelt på 21 tourer;
    PGA 392 248 (1983–2026), Nordic League 53 155 (2020–2026).
  - **16 kilder finnes i turneringsdata, men `source_registry.yaml` har kun 4
    registrerte.** Tolv kilder henter uten registrert lisens-/GDPR-grunnlag.
    Dette bryter pipelines-repoets egen regel 2 og må lukkes.

  **Grunnlagsbeslutninger for all videre analysebygging:**
  - **Til-par leses fra `public_player_entries.scoreToPar`** — utfylt på
    **166 169 av 170 465** gyldige norske runder (97,48 %), allerede
    banenormalisert. **Par skal ALDRI utledes fra `public.baner` og påføres
    juniorrunder:** treffer eksakt i 39,7 %, systematisk avvik −1,02 slag
    (Borregaard −7,00, Huseby & Hankø −4,00, begge med SD 0,00) fordi juniorer
    spiller kortere tee. Ville framstilt juniorer 1–7 slag dårligere.
  - **Netto-filter er en HVITLISTE av 13 faktiske nettokoder, aldri mønsteret
    «ender på N».** Mønsteret treffer også `Open` (22 529 rader), `Mann` (95)
    og `A-klassen` (13) — 26 % av tabellen, deriblant den største klassen.
    Klassekode finnes KUN i `dashboard.tournament_results`; den mangler helt i
    `public`-tabellene appen leser fra, og lageret merker alle 87 564 rader som
    «brutto» inkludert de 13 709 med nettokode.
  - **`position` skal ALDRI brukes som persentil.** Det er plassering INNEN
    KLASSE: 1 976 av 2 044 norske turneringer har flere enn én på plass 1
    (snitt 4,59). Bruk feltstyrke-justert score.
  - **Aldersstige bygges fra 16 år og oppover**, ikke fra 13. Under 16 er den
    ikke monoton (13 år 16,66 → 14 år 17,48) på grunn av tee-effekt.
  - **Volumtall til NGF sies som +24,3 %** (målt på OLYO alene, eneste kilde med
    jevn dekning bakover), ikke +54 % som flerkilde-tallet gir — der endrer
    kildesammensetningen seg mellom årene.
  - **Datahelse leses fra `public.agent_runs`**, ikke `dg_sync_state`. Sistnevnte
    rapporterer 0 % feil på 2 617 kjøringer; `agent_runs` dekker 40 agenter og
    769 feil, inkludert `jarvis-gmail-innsamling` med **735 av 735 feilet**.

  **Anbefalt byggerekkefølge (topp 5, alle kan bygges FØR identitetslaget
  tettes — deltakelser er koblet per spiller med null foreldreløse rader):**
  1. Lukk de tre åpne hullene over (1 dag).
  2. Til-par-grunnlaget: ett view, filtrer score 55–130, kollaps 43
     dublettgrupper (1 dag). Bærer ni andre punkter.
  3. Utviklingsfart og jevnhet mot spilleren selv — **912 spillere** har to
     kvalifiserende sesonger og fersk 2026-sesong (2 dager).
  4. Testene over tid — **64 spiller/test-par med 3 målinger hver over opptil
     336 dager** i `dashboard.test_results`; `dashboard.test_shots` har 732 slag
     med PEI (228 med SG) og er første bruker av `src/lib/domain/pei/` (1–2 dager).
  5. Køllelengder og gapping — alle 12 køller har 19–52 slag; målt hull på
     **24,3 m** mellom 5-jern og 4-hybrid (under 1 dag).

  **Åtte ferdige analyser har lesemodul uten skjerm.** `src/lib/dashboard-data/`
  har 15 zod-validerte lesefunksjoner mot alle åtte materialiserte views, med
  tester og **null importører fra skjermkode**. To av dem er tomme av samme
  grunn: `player_source_matches.birth_year` er utfylt i 0 av 124 rader — fylles
  det, får kohort-progresjonen 313 treff umiddelbart (2 timer).

  **Identitetslaget — trinnvis, billigere enn antatt.** Trinn 0 (½ dag):
  eksakt navnematch treffer 2 486 av 4 873 ekte navn (51 %) og dekker 59,9 % av
  resultatradene; kun **3** er tvetydige. Løfter `mv_canonical_players` fra 47
  til ~2 500. Nordic League er allerede koblet: alle 22 529 rader har `dg_id`,
  og joinen virker på `dg_events.event_id` (172/172 treff), ikke `dg_events.id`
  (0 treff) — 50 arrangementer kan dateres med én UPDATE i dag.

  **Klubb og klassekode kastes i scraperen.** `src/lib/scrapers/golfbox.ts`
  linje 223 parser `ClubName` og forkaster det; samme mønster for `class`.
  Begge kommer inn hver time. Én pipeline-endring gir både klubbdimensjonen
  (`mv_club_aggregates` har i dag 46 rader med **1 unik verdi: «Øst»** — det er
  region, ikke klubb) og ekte brutto-garanti.

  **Kvalitetsadvarsel — `mv_cohort_baselines` skal IKKE vises før den er rettet.**
  J19 2025 har snitt 155,3 og p90 241,8; det er flerrundetotaler behandlet som
  enkeltrunder. 2 865 av 33 002 spiller-år i `mv_player_yearly_stats` har snitt
  over 120 slag, og 65 % mangler til-par.

  **Ikke bygg:** plassering som persentil · par påført fra baneregisteret ·
  aldersstige under 16 år · sesongform som populasjonskurve (mars 528 spillere,
  september 2 842 — ulike populasjoner) · regionkart presentert som nasjonalt
  (alle seks regioner er kun OLYO) · banevanskelighetsindeks per bane (redundant
  mot feltsnitt) · kohort-persentil til spiller/forelder/åpen flate (produktsvar
  3) · odds/prognoser/fantasy. Proffreferanse for jenter er ikke mulig: alle 26
  tourer i lageret er herretourer — det er et produktvalg som må tas, ikke en
  skjerm som kan bygges.

  **Fortsatt åpent (må låses før viewet skrives):** nivådefinisjonen i
  opprykksanalysen gir +2,10 eller +2,27 slag avhengig av om et spiller-år
  tilordnes ett nivå eller flere (77 mot 159 opprykkere). Retningen er robust,
  størrelsen er et definisjonsvalg — endres den etterpå, er det TruthLayer-brudd.

  **Venter på Anders:** MD-fila med turneringer og lenker (spesifikasjon for
  landskapsanalysen, jf. TN-Workdesk punkt 7) er ikke levert. Kartleggingen er
  gjort uten den; bygging av landskapsflaten venter fortsatt på den.
