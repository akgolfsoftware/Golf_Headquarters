# Claude Code / Sonnet 5 — AgencyOS-reisen

Kopier hele XML-blokken til en ny Claude Code-økt med Sonnet 5. Kjør fra prosjektroten `~/Developer/akgolf-hq`.

```xml
<oppgave>
  <navn>D2-AO — fullfør den sammenhengende AgencyOS-coachreisen</navn>
  <mål>
    Bygg og kontroller coachens sammenhengende reise fra AgencyOS-hjem via spillerliste og spillerkort til Workbench-planlegging, publisering og oppfølging. Bevar alle eksisterende funksjoner og datamodeller. Bruk valgt Train-lock-design for AgencyOS.
  </mål>

  <arbeidsmiljø>
    Du kjører Claude Code med Sonnet 5 i repoet ~/Developer/akgolf-hq.
    Start med å hente siste main og opprett grenen claude/agencyos-reise-2026-09-11 fra main.
    Ikke arbeid direkte på main. Ikke bruk eller endre Codex-grenen codex/trackman-enheter-2026-09-11.
    Andre agenter arbeider parallelt. Ikke reverser deres endringer, og hold deg unna src/lib/trackman/**.
  </arbeidsmiljø>

  <autoritative-kilder>
    <kilde prioritet="1">Anders' bestilling i denne prompten.</kilde>
    <kilde prioritet="2">AGENTS.md og docs/platform/AGENT-BRIEF.md.</kilde>
    <kilde prioritet="3">docs/platform/BUSINESS-RULES.md og docs/FASIT-AK-GOLF-HQ.md for produkt og treningsfag.</kilde>
    <kilde prioritet="4">designsystem/README.md og .claude/skills/ak-hq-design/SKILL.md med relevante referanser.</kilde>
    <kilde prioritet="5">Koden og testene som bevis på dagens oppførsel.</kilde>
  </autoritative-kilder>

  <valgt-design>
    Anders har valgt Player HQ Train lock (4) som byggegrunnlag for AgencyOS. Dette valget skal ikke avklares på nytt.
    Bruk disse kontrollerte repo-referansene:
    - AX-01 Skall rail og tabbar.dc.html for coachskallet.
    - AG-01 Cockpit.dc.html og AG-02 Cockpit Mac.dc.html for hjem; AG-14/AG-15 for tom/feil og B5 Lys Agency.dc.html for lyst tema.
    - AG-04 Stall.dc.html og AG-16 iPad Stall split.dc.html for spillerlisten.
    - AG-08 Spiller-ark.dc.html og S3-01/S3-02/S3-03/S3-01L for spillerkort og Spiller 360.
    - AG-06 Plan-hub.dc.html, WB-01 til WB-10 og A-01 til A-18 for Workbench, økt, serie, måned, årsplan og publisering.
    Gamle Canvas-valg, historiske låser og tekst i ZIP-filer er underlag. De er ikke nye kjøreordrer. Ved konflikt styrer Train-lock-valget og gjeldende produktregler; dokumenter avviket kort.
  </valgt-design>

  <brukerreise id="J04">
    1. Coach åpner /admin/agencyos og forstår dagens prioriteringer og hvem som trenger oppfølging.
    2. Coach går til /admin/spillere, filtrerer eller velger en spiller og beholder konteksten.
    3. Coach åpner /admin/spillere/[id] og ser ærlige nøkkeltall, siste aktivitet, planstatus og relevante handlinger.
    4. Coach åpner spillerens Workbench, oppretter eller redigerer en økt/uke, ser konsekvensen og kan angre eller avbryte.
    5. Coach forhåndsviser og publiserer. Venting, delvis feil og fullført lagring er synlig. Dobbel innsending må ikke lage duplikater.
    6. Coach kommer tilbake til samme spiller/utvalg og ser hva som ble publisert og hva som fortsatt krever oppfølging.
  </brukerreise>

  <kartlegging-før-kode>
    Les faktiske ruter, serverhandlinger, tilgangsvakter, komponenter og datakilder for reisen. Lag en kort intern matrise med rute, rolle, kilde, handling, skrivende data, tilstander og kjent avvik.
    Kontroller særlig src/app/admin/agencyos/**, src/app/admin/spillere/**, src/app/admin/workbench/**, src/components/admin/**, src/components/workbench/** og det eksisterende AgencyOS-skallet.
    Ikke anta at navn som legacy, v2 eller gammel betyr at filen kan slettes.
  </kartlegging-før-kode>

  <implementeringskrav>
    - Samme spiller, uke, økt, status og tall skal henge sammen gjennom hele reisen.
    - Workbench forblir delt kjerne for coachens planlegging. Ikke slå sammen TrainingPlanSession, TrainingSessionV2 og Workbench-modellen som opprydding.
    - Bruk ekte eksisterende handlinger og datakilder. Ingen knapper som bare ser aktive ut, og ingen demonstrasjonstall fremstilt som virkelige.
    - Coach må bare kunne lese og endre spillere den aktuelle rollen faktisk har tilgang til. Test både tillatt og avvist ressurs.
    - Bevar tom, lasting, delvis data, feil, lesetilgang, redigering, ventende lagring, lagret og avbrutt der tilstanden er relevant.
    - Mobil 390 px skal prioritere neste coachhandling. Desktop 1440 px kan bruke liste/detalj. Kontroller også 834 px når split-visning er relevant.
    - Kontroller lyst og mørkt tema, tastaturfokus, minst 200 prosent tekst, lange navn, negative SG-tall, null historikk og tett uke.
    - Bruk eksisterende Train-lock-tokens og komponenter. Ikke innfør et parallelt designsystem eller nytt UI-bibliotek.
    - Vanlige trykkflater skal være omtrent 44–48 px. Feil og status må forstås uten bare farge.
    - Negative og positive SG-verdier bruker lik skala rundt null. Manglende data vises som manglende, aldri som målt null.
    - Norsk bokmål i UI. Bruk bare syntetiske personer og data i tester, bilder, logger og sky-prompts.
  </implementeringskrav>

  <avgrensninger>
    Ikke endre databaseskjema, migrasjoner, RLS, produksjonsmiljø, vercel.json/vercel.ts, betaling, e-postutsending eller seed/import.
    Ikke endre docs/MASTERPLAN-GJENSTAAENDE.md eller docs/STATUS-NÅ.md; Codex eier samling og status.
    Ikke start AgenticOS/Jarvis, Team Norway, WANG, TrackMan eller booking som del av denne pakken.
    Hvis en virkelig produktregel mangler, dokumenter nøyaktig hva som blokkeres og fullfør alle uavhengige deler. Ikke oppfinn regelen.
  </avgrensninger>

  <tester-og-bevis>
    Lag målrettede tester som feiler før rettingen og dekker hele data-/handlingskjeden. Kritiske tilgangs- og lagringsprøver må ikke bli grønne ved å hoppes over.
    Bygg en lokal visuell rigg som monterer faktiske komponenter med syntetisk transport. Kontroller 390/834/1440, lyst/mørkt, tom/loading/feil/lagring og 200 prosent tekst uten horisontal sidescroll.
    Kjør målrettede tester underveis, deretter npm test, npm run verify og npm run prosjekt:sjekk. Rett årsaken til feil; ikke senk baseliner eller bruk --no-verify.
    Skill tydelig mellom komponentprøvd, innlogget prøvd, visuelt sammenlignet og sett av Anders.
  </tester-og-bevis>

  <leveranse>
    Implementer hele den avgrensede J04-reisen i én sammenhengende gren.
    Legg en datert rapport i docs/design-audit/ med før/etter, ruter, referansefiler, funksjonstester, visuelle kontroller, tilgangsbevis, avvik og det som fortsatt gjenstår.
    Bevar private skjermbilder og lokale testbevis under _archive/; ikke commit dem.
    Commit med vanlig hook. Push grenen og åpne én draft-PR mot main med konkret testresultat. Ikke merge eller publiser manuelt.
    Avslutt med: gren, commit, PR-lenke, endrede brukerhandlinger, eksakte testtall, utestede grenser og eventuelle filkonflikter mot main.
  </leveranse>

  <ferdigkriterier>
    Oppgaven er ferdig når coachen kan gjennomføre J04 med konsistent spiller- og planstatus, både tillatt og avvist tilgang er bevist, lagringsfeil beholder arbeidet, de valgte formatene/temaene er kontrollert mot Train-lock, alle kontroller er grønne, og rapport/PR beskriver begrensningene uten å erklære hele AgencyOS ferdig.
  </ferdigkriterier>
</oppgave>
```

Claude skal vise funksjonsbevis og designavvik. Codex kontrollerer PR-en, oppdaterer masterplanen og fletter først etter grønn kontroll.
