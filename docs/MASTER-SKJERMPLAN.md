# Master-skjermplan — AK Golf HQ

> Dette er den komplette lista over hver eneste skjerm i appen, og om den er helt ferdig eller ikke. Én plass å se alt.

Sist oppdatert: 3. juni 2026.

---

## Slik bruker vi denne (regel)

Før noen — du eller en hjelper — rører en skjerm: finn raden her først, og oppdater de seks hakene i samme slengen. En skjerm er ikke ferdig før alle seks hakene er grønne (✓). Og ingen ting som designeren (Claude Design) har tegnet får bli liggende ubrukt — alt tegnet skal til slutt ende opp som en ekte skjerm i appen. Lista nederst («Tegnet, men ikke brukt ennå») er sjekklista for akkurat det.

**De seks hakene (det som må til for at en skjerm er «ferdig»):**

1. **Design** — ser ut som den skal (riktig utseende, riktig oppsett).
2. **Mob/Desk/iPad** — fungerer fint på de tre skjermstørrelsene: mobil, datamaskin og iPad. Skrives som tre tegn, f.eks. `✓✓–` betyr mobil og data OK, iPad ikke sjekket.
3. **Adresse-ok** — ligger på riktig nettadresse i appen (ikke bare i en test/forhåndsvisning).
4. **Flyt** — knappene tar deg dit de skal (slik planen vår sier).
5. **Data** — viser ekte tall fra databasen, ikke liksom-tall.
6. **Funker** — testet, og den knekker ikke.

Tegnforklaring: ✓ = ferdig · ~ = delvis / i arbeid · – = ikke startet.

---

## Status akkurat nå (tallene)

- **Skjermer totalt vi sporer:** ca. 180 hovedskjermer (pluss mange små undersider — alle er med i lista under).
- **Helt ferdige (alle seks haker grønne):** 2 — begge Workbench-variantene (spiller + coach). Det er foreløpig de eneste med ekte data hele veien.
- **Nytt design ferdig i forhåndsvisning (men venter på ekte data + ekte adresse):** ca. 43 skjermer. Disse fikk nytt v10-utseende i natt, men kjører fortsatt på liksom-tall og ligger i en forhåndsvisning — ikke på sin ekte nettadresse ennå. De er altså «pene, men ikke ferdig koblet».
- **Ikke startet / fortsatt gammelt design:** flertallet av de ca. 180 — de finnes som adresse i appen, men er ikke pusset opp til nytt design ennå.
- **Ting designeren har tegnet, men som IKKE har funnet en plass i appen ennå (drop-off):** se egen liste lenger ned. Dette er det viktigste å passe på.

Kort sagt: de 43 nye skjermene ser nå riktige ut, men trenger to ting til før de er ferdige — ekte tall fra databasen og kobling til sin ekte nettadresse. Bare de 2 Workbench-skjermene er helt i mål. Resten av appen er fortsatt gammelt design eller ikke startet.

### Hva som er bygget i natt (status å sette inn)

I natt ble 43 skjermer bygget med nytt v10-design i en forhåndsvisning med liksom-tall. De får derfor:
Design ✓ · Mob/Desk/iPad `✓✓–` (iPad ikke sjekket) · Adresse-ok `~` (kun forhåndsvisning, ikke ekte adresse ennå) · Flyt `~` · Data `–` (liksom-tall) · Funker ✓ (i forhåndsvisning).

- **PlayerHQ (pulje 1 + 2):** Hjem, SG-Hub, Live-økt (brief / aktiv / oppsummering), Runder, Statistikk, Analyse, Meg, Abonnement, Drills (bibliotek + detalj), Tester, Årsplan, Booking (hub + ny), Logg ny runde, TrackMan, Turneringer, Varsler, Innstillinger, Forelder-side, Onboarding.
- **AgencyOS (pulje 1 + 2):** Cockpit (hjem), Spillere/Stallen, Innboks, Spiller-detalj, Kalender, Bookinger, Tester, Turneringer, Caddie, Sammenlign spillere, Compliance, Drift/anlegg.
- **Auth + forelder + marketing:** Logg inn, Registrer, Glemt passord, BankID, Logget ut, Forelder ser barn, Marketing-forside.

**Workbench er spesiell:** de eneste 2 skjermene som er helt ferdige hele veien, inkludert ekte data (jobben kalt «W5b» er gjort) og ekte adresse. Både spiller- og coach-utgaven.

---

## Skjermene — PlayerHQ

PlayerHQ er spillerens eget verktøy: «hva skal JEG gjøre i dag?» Adressene begynner med `/portal`.

### Hjem

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Hjem (Workbench-hjem) ★ | `/portal` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| Varsler | `/portal/varsler` | ✓ | ✓✓– | ~ | ~ | – | ✓ |

### Planlegge

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Planlegge-hub | `/portal/planlegge` | – | --- | ✓ | – | – | ~ |
| **Workbench (planlegging)** ★ | `/portal/planlegge/workbench` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| Årsplan | `/portal/tren/aarsplan` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Rediger periode | `/portal/tren/aarsplan/periode/[id]/rediger` | – | --- | ✓ | – | – | ~ |
| Teknisk plan (liste) | `/portal/tren/teknisk-plan` | – | --- | ✓ | ~ | ~ | ✓ |
| · Teknisk plan detalj | `/portal/tren/teknisk-plan/[planId]` | – | --- | ✓ | ~ | ~ | ✓ |
| Fys-plan (liste) | `/portal/tren/fys-plan` | – | --- | ✓ | ~ | ~ | ✓ |
| · Fys-plan detalj/bygger | `/portal/tren/fys-plan/[planId]` | – | --- | ✓ | ~ | ~ | ✓ |
| Drills (bibliotek) | `/portal/drills` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Drill-detalj | `/portal/drills/[id]` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| Mål-hub | `/portal/mal` | – | --- | ✓ | ~ | ~ | ✓ |
| · Mål-bygger (wizard) | `/portal/mal/bygger` | – | --- | ✓ | ~ | ~ | ~ |
| · Mål-detalj | `/portal/mal/goal/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| · Milepæler | `/portal/mal/milepaeler` | – | --- | ✓ | ~ | ~ | ~ |
| · Leaderboard | `/portal/mal/leaderboard` | – | --- | ✓ | ~ | ~ | ~ |
| Turneringer (mine) | `/portal/tren/turneringer` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Turnering-detalj | `/portal/tren/turneringer/[id]` | ~ | ✓✓– | ~ | ~ | – | ~ |
| · Ny turnering | `/portal/tren/turneringer/ny` | – | --- | ✓ | ~ | ~ | ~ |
| Utfordringer | `/portal/utfordringer` | – | --- | ✓ | ~ | ~ | ~ |
| · Ny utfordring (wizard) | `/portal/utfordringer/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Utfordring-detalj | `/portal/utfordringer/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| AI: mål-bygger | `/portal/ai/mal-bygger` | – | --- | ✓ | ~ | ~ | ~ |
| AI: foreslå drill | `/portal/ai/foresla-drill` | – | --- | ✓ | ~ | ~ | ~ |
| AI: foreslå turnering | `/portal/ai/foresla-turnering` | – | --- | ✓ | ~ | ~ | ~ |

### Gjennomføre (inkl. live-økt)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Gjennomføre-hub | `/portal/gjennomfore` | – | --- | ✓ | ~ | ~ | ✓ |
| Kalender | `/portal/kalender` | – | --- | ✓ | ~ | ~ | ✓ |
| Kalender (alt. adresse) | `/portal/tren/kalender` | – | --- | ✓ | ~ | ~ | ✓ |
| Ny økt (handlingsvalg) | `/portal/ny-okt` | – | --- | ✓ | ~ | ~ | ✓ |
| Ønsket økt (be coach) | `/portal/onskeligokt` | – | --- | ✓ | ~ | ~ | ~ |
| · Ønsket økt bekreftet | `/portal/onskeligokt/bekreftet` | – | --- | ✓ | ~ | ~ | ~ |
| Live-økt: brief | `/portal/(fullscreen)/live/[sessionId]/brief` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| Live-økt: aktiv | `/portal/(fullscreen)/live/[sessionId]/active` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| Live-økt: oppsummering | `/portal/(fullscreen)/live/[sessionId]/summary` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| Live-økt: drill-logger | `/portal/(fullscreen)/live/[sessionId]/logger` | ~ | ✓✓– | ✓ | ~ | ~ | ✓ |
| Live-økt: score-tapper | `/portal/(fullscreen)/live/[sessionId]/tapper` | ~ | ✓✓– | ✓ | ~ | ~ | ✓ |
| Tren (fullskjerm) | `/portal/(fullscreen)/tren` | – | --- | ✓ | ~ | ~ | ~ |
| Økt-detalj | `/portal/tren/[sessionId]` | – | --- | ✓ | ~ | ~ | ✓ |
| · Planlagt økt | `/portal/tren/[sessionId]/planlagt` | – | --- | ✓ | ~ | ~ | ✓ |
| Feiring (etter plan ferdig) | `/portal/tren/feiring/[planId]` | – | --- | ✓ | ~ | ~ | ~ |

### Analysere

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Analyse-hub | `/portal/analysere` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Hull-analyse | `/portal/analysere/hull` | ~ | ✓✓– | ✓ | ~ | ✓ | ✓ |
| Statistikk (oversikt) | `/portal/statistikk` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Metrikk-detalj | `/portal/statistikk/[metric]` | – | --- | ✓ | ~ | ~ | ~ |
| · Sammenlign | `/portal/statistikk/sammenlign` | – | --- | ✓ | ~ | ~ | ~ |
| · Del runde | `/portal/statistikk/runder/[runId]/del` | – | --- | ✓ | ~ | ~ | ~ |
| **SG-Hub (Strokes Gained)** ★ | `/portal/mal/sg-hub` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Kølle-detalj | `/portal/mal/sg-hub/[club]` | – | --- | ✓ | ~ | ~ | ~ |
| · Benchmark | `/portal/mal/sg-hub/benchmark` | – | --- | ✓ | ~ | ✓ | ✓ |
| · Best vs nå | `/portal/mal/sg-hub/best-vs-now` | – | --- | ✓ | ~ | ~ | ~ |
| · Utstyr | `/portal/mal/sg-hub/equipment` | – | --- | ✓ | ~ | ~ | ~ |
| · Avstander (yardage) | `/portal/mal/sg-hub/yardage` | – | --- | ✓ | ~ | ~ | ~ |
| · Forhold (vær/bane) | `/portal/mal/sg-hub/conditions` | – | --- | ✓ | ~ | ~ | ~ |
| · Strategi | `/portal/mal/sg-hub/strategy` | – | --- | ✓ | ~ | ~ | ~ |
| · Coach ser spiller-SG | `/portal/mal/sg-hub/coach/[spillerId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Coach: kølle | `/portal/mal/sg-hub/coach/[spillerId]/[club]` | – | --- | ✓ | ~ | ~ | ~ |
| · Coach: utstyr | `/portal/mal/sg-hub/coach/[spillerId]/equipment` | – | --- | ✓ | ~ | ~ | ~ |
| Runder (liste) | `/portal/mal/runder` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Runde-detalj | `/portal/mal/runder/[id]` | – | --- | ✓ | ~ | ~ | ✓ |
| · Slag-for-slag | `/portal/mal/runder/[id]/shot-by-shot` | – | --- | ✓ | ~ | ~ | ~ |
| · Logg ny runde | `/portal/mal/runder/ny` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| TrackMan (liste) | `/portal/mal/trackman` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · TrackMan-sesjon | `/portal/mal/trackman/[id]` | ~ | ✓✓– | ✓ | ~ | ~ | ~ |
| · TrackMan (alt. adresse) | `/portal/trackman/[sessionId]` | ~ | ✓✓– | ✓ | ~ | ~ | ~ |
| Tester (oversikt) | `/portal/tren/tester` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Test-detalj | `/portal/tren/tester/[testId]` | ~ | ✓✓– | ✓ | ~ | ~ | ~ |
| · Test-katalog (NGF) | `/portal/tren/tester/katalog` | – | --- | ✓ | ~ | ~ | ~ |
| · Ny test | `/portal/tren/tester/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Ny egen test | `/portal/tren/tester/ny/egen` | – | --- | ✓ | ~ | ~ | ~ |
| · Test live (fullskjerm) | `/portal/(fullscreen)/test/[testId]/live` | – | --- | ✓ | ~ | ~ | ~ |
| · Test oppsummering | `/portal/(fullscreen)/test/[testId]/summary` | – | --- | ✓ | ~ | ~ | ~ |
| Bane-bibliotek | `/portal/mal/baner` | – | --- | ✓ | ~ | ~ | ~ |
| · Bane-detalj | `/portal/mal/baner/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Statistikk-side (gml.) | `/portal/mal/statistikk` | – | --- | ✓ | ~ | ~ | ~ |

### Coach (spillerens kontakt med coach)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Coach-hub | `/portal/coach` | – | --- | ✓ | ~ | ~ | ✓ |
| · Coach-profil | `/portal/coach/[coachId]` | – | --- | ✓ | ~ | ~ | ~ |
| Meldinger (innboks) | `/portal/coach/melding` | – | --- | ✓ | ~ | ~ | ✓ |
| · Ny melding | `/portal/coach/melding/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Meldingstråd | `/portal/coach/melding/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| · Vedlegg | `/portal/coach/melding/[id]/vedlegg` | – | --- | ✓ | ~ | ~ | ~ |
| Coach-planer | `/portal/coach/plans` | – | --- | ✓ | ~ | ~ | ~ |
| · Plan-detalj | `/portal/coach/plans/[planId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Ny økt i plan | `/portal/coach/plans/[planId]/ny-okt` | – | --- | ✓ | ~ | ~ | ~ |
| · Perioder | `/portal/coach/plans/perioder` | – | --- | ✓ | ~ | ~ | ~ |
| Coach-øvelser | `/portal/coach/ovelser` | – | --- | ✓ | ~ | ~ | ~ |
| · Ny øvelse | `/portal/coach/ovelser/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Rediger øvelse | `/portal/coach/ovelser/[id]/rediger` | – | --- | ✓ | ~ | ~ | ~ |
| Coach-videoer | `/portal/coach/videoer` | – | --- | ✓ | ~ | ~ | ~ |
| Coach-notater | `/portal/coach/notes` | – | --- | ✓ | ~ | ~ | ~ |
| · Notat-detalj | `/portal/coach/notes/[noteId]` | – | --- | ✓ | ~ | ~ | ~ |
| Spørsmål til coach | `/portal/coach/sporsmal/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Coach-AI | `/portal/coach/ai` | – | --- | ✓ | ~ | ~ | ~ |

### Meg (profil og innstillinger)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Meg (profil) | `/portal/meg` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Rediger profil | `/portal/meg/profil/rediger` | – | --- | ✓ | ~ | ~ | ~ |
| Abonnement | `/portal/meg/abonnement` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Oppgrader | `/portal/meg/abonnement/oppgrader` | – | --- | ✓ | ~ | ~ | ~ |
| · Oppgrader-flyt | `/portal/meg/abonnement/oppgrader/flyt` | – | --- | ✓ | ~ | ~ | ~ |
| · Avbestill | `/portal/meg/abonnement/avbestill` | – | --- | ✓ | ~ | ~ | ~ |
| · Nytt kort | `/portal/meg/abonnement/kort/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Faktura-detalj | `/portal/meg/abonnement/faktura/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Mine bookinger | `/portal/meg/bookinger` | – | --- | ✓ | ~ | ~ | ~ |
| · Endre tid | `/portal/meg/bookinger/reschedule/[bookingId]` | – | --- | ✓ | ~ | ~ | ~ |
| Helse | `/portal/meg/helse` | – | --- | ✓ | ~ | ~ | ~ |
| · Nytt symptom | `/portal/meg/helse/symptom/ny` | – | --- | ✓ | ~ | ~ | ~ |
| Innstillinger | `/portal/meg/innstillinger` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Varsler | `/portal/meg/innstillinger/varsler` | – | --- | ✓ | ~ | ~ | ~ |
| · Personvern | `/portal/meg/innstillinger/personvern` | – | --- | ✓ | ~ | ~ | ~ |
| · Sikkerhet | `/portal/meg/innstillinger/sikkerhet` | – | --- | ✓ | ~ | ~ | ~ |
| · Språk | `/portal/meg/innstillinger/sprak` | – | --- | ✓ | ~ | ~ | ~ |
| · Anlegg | `/portal/meg/innstillinger/anlegg` | – | --- | ✓ | ~ | ~ | ~ |
| · Integrasjoner | `/portal/meg/innstillinger/integrasjoner` | – | --- | ✓ | ~ | ~ | ~ |
| · Eksport | `/portal/meg/innstillinger/eksport` | – | --- | ✓ | ~ | ~ | ~ |
| · Økter | `/portal/meg/innstillinger/okter` | – | --- | ✓ | ~ | ~ | ~ |
| Sikkerhet | `/portal/meg/sikkerhet` | – | --- | ✓ | ~ | ~ | ~ |
| · To-faktor (2FA) | `/portal/meg/sikkerhet/2fa` | – | --- | ✓ | ~ | ~ | ~ |
| Utstyrsbag | `/portal/meg/utstyrsbag` | – | --- | ✓ | ~ | ~ | ~ |
| Dokumenter | `/portal/meg/dokumenter` | – | --- | ✓ | ~ | ~ | ~ |
| Foreldre (foresatt-info) | `/portal/meg/foreldre` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| Feedback | `/portal/meg/feedback` | – | --- | ✓ | ~ | ~ | ~ |
| Hjelpesenter | `/portal/meg/help` | – | --- | ✓ | ~ | ~ | ~ |
| · Hjelp-artikkel | `/portal/meg/help/artikkel/[slug]` | – | --- | ✓ | ~ | ~ | ~ |
| · Hjelp-kategori | `/portal/meg/help/kategori/[slug]` | – | --- | ✓ | ~ | ~ | ~ |
| · Kontakt | `/portal/meg/help/kontakt` | – | --- | ✓ | ~ | ~ | ~ |

### Booking

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Booking-hub | `/portal/booking` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Ny booking (wizard) | `/portal/booking/ny` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Ny booking bekreft | `/portal/booking/ny/bekreft` | – | --- | ✓ | ~ | ~ | ~ |
| · Booking-detalj | `/portal/booking/[bookingId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Coach-profil (booking) | `/portal/booking/coach/[coachId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Anlegg-detalj (booking) | `/portal/booking/anlegg/[anleggId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Bekreftet | `/portal/booking/bekreftet` | – | --- | ✓ | ~ | ~ | ~ |

### Talent (elite-spor — egen del av PlayerHQ)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Talent-hub | `/portal/talent` | – | --- | ✓ | ~ | ~ | ~ |
| · Min plan | `/portal/talent/min-plan` | – | --- | ✓ | ~ | ~ | ~ |
| · Mitt nivå | `/portal/talent/mitt-niva` | – | --- | ✓ | ~ | ~ | ~ |
| · Roadmap | `/portal/talent/roadmap` | – | --- | ✓ | ~ | ~ | ~ |
| · Sammenligning | `/portal/talent/sammenligning` | – | --- | ✓ | ~ | ~ | ~ |

> Merknad: Talent-delen er knyttet til «Elite Fase 2», som er bevisst utsatt. Disse adressene finnes, men er ikke prioritert nå.

### Aliaser og hjelpe-ruter (PlayerHQ)

Disse finnes i appen, men er enten eldre kortadresser som peker videre, eller små hjelpe-sider. Tatt med for å være komplett.

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Stats (kortadresse → statistikk) | `/portal/stats` | – | --- | ✓ | ~ | ~ | ~ |
| Analyse (kortadresse → analysere) | `/portal/analyse` | – | --- | ✓ | ~ | ~ | ~ |
| Reach (oppsøk-verktøy) | `/portal/reach` | – | --- | ✓ | ~ | ~ | ~ |
| Agent-pipeline (AI internt) | `/portal/agent-pipeline` | – | --- | ✓ | ~ | ~ | ~ |
| Se annen spiller | `/portal/spiller/[spillerId]` | – | --- | ✓ | ~ | ~ | ~ |
| Øvelser (alias for drills) | `/portal/tren/ovelser` | – | --- | ✓ | ~ | ~ | ~ |
| · Øvelse-detalj | `/portal/tren/ovelser/[id]` | – | --- | ✓ | ~ | ~ | ~ |

> Merknad: `/portal/stats` og `/portal/analyse` er kortadresser for `/portal/statistikk` og `/portal/analysere`, og `/portal/tren/ovelser` overlapper med `/portal/drills`. Disse bør ryddes til én adresse hver — se «Veien til 100%» (Bolk 4).

---

## Skjermene — AgencyOS

AgencyOS er coachens kontrolltårn: «hvem trenger MEG i dag?» Adressene begynner med `/admin`. (Het tidligere CoachHQ.)

### Oversikt (coachens hjem)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| **Cockpit (hjem)** ★ | `/admin/agencyos` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Uka (kanban) | `/admin/agencyos/uka` | – | --- | ✓ | ~ | ~ | ~ |
| · Spillere (snarvei) | `/admin/agencyos/spillere` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ |
| · Økonomi | `/admin/agencyos/okonomi` | – | --- | ✓ | ~ | ~ | ~ |
| · Caddie (AI-chat) | `/admin/agencyos/caddie` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Caddie-aktivitet | `/admin/agencyos/caddie/aktivitet` | – | --- | ✓ | ~ | ~ | ~ |
| Admin-rot (gml. hjem) | `/admin` | – | --- | ✓ | ~ | ~ | ✓ |
| Daglig AI-brief | `/admin/brief` | – | --- | ✓ | ~ | ~ | ~ |
| Coaching-board | `/admin/board` | – | --- | ✓ | ~ | ~ | ~ |
| Oppfølging | `/admin/oppfolging` | – | --- | ✓ | ~ | ~ | ~ |
| Oppgave-kø | `/admin/queue` | – | --- | ✓ | ~ | ~ | ~ |
| **Innboks** ★ | `/admin/innboks` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| Meldinger (alt.) | `/admin/messages` | – | --- | ✓ | ~ | ~ | ~ |
| Kommunikasjon-hub | `/admin/kommunikasjon` | – | --- | ✓ | ~ | ~ | ~ |
| Reach | `/admin/reach` | – | --- | ✓ | ~ | ~ | ~ |

### Min uke / Workspace

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Workspace-hub | `/admin/workspace` | – | --- | ✓ | ~ | ~ | ~ |
| · Tildelt meg | `/admin/workspace/tildelt-meg` | – | --- | ✓ | ~ | ~ | ~ |
| · Oppgaver | `/admin/workspace/oppgaver` | – | --- | ✓ | ~ | ~ | ~ |
| · Oppgave-detalj | `/admin/workspace/oppgaver/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| · Prosjekter | `/admin/workspace/prosjekter` | – | --- | ✓ | ~ | ~ | ~ |
| · Notion-sync | `/admin/workspace/notion` | – | --- | ✓ | ~ | ~ | ~ |

### Stall (spillere, grupper, talent)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Stall-oversikt | `/admin/stall` | – | --- | ✓ | ~ | ~ | ✓ |
| **Spillere (alle)** ★ | `/admin/spillere` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Ny spiller | `/admin/spillere/ny` | – | --- | ✓ | ~ | ~ | ~ |
| **Spiller-detalj** ★ | `/admin/spillere/[id]` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Profil | `/admin/spillere/[id]/profil` | – | --- | ✓ | ~ | ~ | ~ |
| · **Workbench (coach-i-spiller)** ★ | `/admin/spillere/[id]/workbench` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| · Plan-detalj | `/admin/spillere/[id]/plan/[planId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Tester | `/admin/spillere/[id]/tester` | – | --- | ✓ | ~ | ~ | ~ |
| · Tildel test | `/admin/spillere/[id]/tildel-test` | – | --- | ✓ | ~ | ~ | ~ |
| · Rediger | `/admin/spillere/[id]/rediger` | – | --- | ✓ | ~ | ~ | ~ |
| Grupper | `/admin/grupper` | – | --- | ✓ | ~ | ~ | ~ |
| · Gruppe-detalj | `/admin/grupper/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Talent-hub | `/admin/talent` | – | --- | ✓ | ~ | ~ | ~ |
| · Talent-detalj | `/admin/talent/[playerId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Discovery | `/admin/talent/discovery` | – | --- | ✓ | ~ | ~ | ~ |
| · Radar | `/admin/talent/radar` | – | --- | ✓ | ~ | ~ | ~ |
| · Radar per spiller | `/admin/talent/radar/[playerId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Kohort | `/admin/talent/kohort` | – | --- | ✓ | ~ | ~ | ~ |
| · Region | `/admin/talent/region` | – | --- | ✓ | ~ | ~ | ~ |
| · Ressurser | `/admin/talent/ressurser` | – | --- | ✓ | ~ | ~ | ~ |
| · Sammenligning | `/admin/talent/sammenligning` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · WAGR-benchmark | `/admin/talent/wagr-benchmark` | – | --- | ✓ | ~ | ~ | ~ |
| · WAGR-import | `/admin/talent/wagr-import` | – | --- | ✓ | ~ | ~ | ~ |

### Planlegge (lage planer FOR spillerne)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Plan-sentral (hub) | `/admin/planlegge` | – | --- | ✓ | ~ | ~ | ~ |
| Planer (alle) | `/admin/plans` | – | --- | ✓ | ~ | ~ | ✓ |
| · Ny plan (AI-wizard) | `/admin/plans/new` | – | --- | ✓ | ~ | ~ | ~ |
| · Plan-detalj | `/admin/plans/[planId]` | – | --- | ✓ | ~ | ~ | ✓ |
| · Maler | `/admin/plans/templates` | – | --- | ✓ | ~ | ~ | ~ |
| · Ny mal | `/admin/plans/templates/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Rediger mal | `/admin/plans/templates/[id]/rediger` | – | --- | ✓ | ~ | ~ | ~ |
| · Mal-effektivitet | `/admin/plans/templates/[id]/effectiveness` | – | --- | ✓ | ~ | ~ | ~ |
| Plan-maler (alt.) | `/admin/plan-templates` | – | --- | ✓ | ~ | ~ | ~ |
| · Plan-mal detalj | `/admin/plan-templates/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| · Ny plan-mal | `/admin/plan-templates/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Rediger plan-mal | `/admin/plan-templates/[id]/rediger` | – | --- | ✓ | ~ | ~ | ~ |
| Drills (bibliotek) | `/admin/drills` | – | --- | ✓ | ~ | ~ | ✓ |
| · Drill-detalj | `/admin/drills/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| · Rediger drill | `/admin/drills/[id]/rediger` | – | --- | ✓ | ~ | ~ | ~ |
| Teknisk plan | `/admin/teknisk-plan` | – | --- | ✓ | ~ | ~ | ~ |
| · Per spiller | `/admin/teknisk-plan/[spillerId]` | – | --- | ✓ | ~ | ~ | ~ |
| **Turneringer** ★ | `/admin/tournaments` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Turnering-detalj | `/admin/tournaments/[id]` | ~ | ✓✓– | ✓ | ~ | ~ | ~ |
| · Ny turnering | `/admin/tournaments/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Dubletter (rydd) | `/admin/tournaments/dubletter` | – | --- | ✓ | ~ | ~ | ~ |
| Økter | `/admin/okter` | – | --- | ✓ | ~ | ~ | ~ |
| Videoer | `/admin/videoer` | – | --- | ✓ | ~ | ~ | ~ |
| Opptak | `/admin/recording` | – | --- | ✓ | ~ | ~ | ~ |

### Gjennomføre (daglig drift)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Daglig drift (hub) | `/admin/gjennomfore` | – | --- | ✓ | ~ | ~ | ~ |
| · Økt-detalj | `/admin/gjennomfore/okter/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Kalender | `/admin/kalender` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Uke | `/admin/kalender/uke` | ~ | ✓✓– | ✓ | ~ | ~ | ~ |
| · Måned | `/admin/kalender/maned` | ~ | ✓✓– | ✓ | ~ | ~ | ~ |
| Kalender (alt.) | `/admin/calendar` | – | --- | ✓ | ~ | ~ | ~ |
| · Måned (alt.) | `/admin/calendar/maned` | – | --- | ✓ | ~ | ~ | ~ |
| **Bookinger** ★ | `/admin/bookinger` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Ny booking | `/admin/bookinger/ny` | – | --- | ✓ | ~ | ~ | ~ |
| Anlegg | `/admin/anlegg` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Anlegg-detalj | `/admin/anlegg/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Tilgjengelighet | `/admin/availability` | – | --- | ✓ | ~ | ~ | ~ |
| Kapasitet | `/admin/kapasitet` | – | --- | ✓ | ~ | ~ | ~ |
| Tjenester/priser | `/admin/services` | – | --- | ✓ | ~ | ~ | ~ |
| Fasiliteter (alt.) | `/admin/facilities` | – | --- | ✓ | ~ | ~ | ~ |
| · Fasilitet-detalj | `/admin/facilities/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Lokasjoner | `/admin/locations` | – | --- | ✓ | ~ | ~ | ~ |
| TrackMan (på tvers) | `/admin/trackman` | – | --- | ✓ | ~ | ~ | ~ |
| Live-økt: brief (coach) | `/admin/live/[sessionId]/brief` | – | --- | ✓ | ~ | ~ | ✓ |
| Live-økt: aktiv (coach) | `/admin/live/[sessionId]/active` | – | --- | ✓ | ~ | ~ | ✓ |
| Live-økt: oppsummering (coach) | `/admin/live/[sessionId]/summary` | – | --- | ✓ | ~ | ~ | ✓ |
| Coach-workbench (prototype) | `/admin/coach-workbench` | – | --- | ✓ | – | ~ | ~ |

### Innsikt (analyse på tvers)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Innsikt-hub | `/admin/analysere` | – | --- | ✓ | ~ | ~ | ~ |
| · Compliance | `/admin/analysere/compliance` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| Stall-analyse | `/admin/analyse` | – | --- | ✓ | ~ | ~ | ~ |
| Analytics | `/admin/analytics` | – | --- | ✓ | ~ | ~ | ~ |
| Lag-snitt | `/admin/lag-snitt` | – | --- | ✓ | ~ | ~ | ~ |
| Tester (på tvers) | `/admin/tester` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Test-detalj | `/admin/tester/[id]` | ~ | ✓✓– | ✓ | ~ | ~ | ~ |
| · Foreslåtte tester | `/admin/tester/foreslatte` | – | --- | ✓ | ~ | ~ | ~ |
| · Tildel test | `/admin/tester/tildel/[spillerId]` | – | --- | ✓ | ~ | ~ | ~ |
| Økt-forespørsler | `/admin/foresporsler` | – | --- | ✓ | ~ | ~ | ~ |
| Godkjenninger | `/admin/godkjenninger` | – | --- | ✓ | ~ | ~ | ~ |
| · Godkjenning-detalj | `/admin/godkjenninger/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Godkjenninger (alt.) | `/admin/approvals` | – | --- | ✓ | ~ | ~ | ~ |
| · Approval-detalj | `/admin/approvals/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Rapporter | `/admin/reports` | – | --- | ✓ | ~ | ~ | ~ |
| Runder (på tvers) | `/admin/runder` | – | --- | ✓ | ~ | ~ | ~ |
| Skader/sykdom (tilstander) | `/admin/tilstander` | – | --- | ✓ | ~ | ~ | ~ |
| Finans (MRR/utestående) | `/admin/finance` | – | --- | ✓ | ~ | ~ | ~ |
| Finans (alt. adresse) | `/admin/okonomi` | – | --- | ✓ | ~ | ~ | ~ |
| Stats-oversikt | `/admin/stats/overview` | – | --- | ✓ | ~ | ~ | ~ |
| Stats-moderering | `/admin/stats/moderering` | – | --- | ✓ | ~ | ~ | ~ |

### Admin (organisasjon og innstillinger)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Organisasjon-hub | `/admin/organisasjon` | – | --- | ✓ | ~ | ~ | ~ |
| Klubb-innstillinger | `/admin/klubb/innstillinger` | – | --- | ✓ | ~ | ~ | ~ |
| Integrasjoner | `/admin/integrasjoner` | – | --- | ✓ | ~ | ~ | ~ |
| Innstillinger | `/admin/settings` | – | --- | ✓ | ~ | ~ | ✓ |
| · API | `/admin/settings/api` | – | --- | ✓ | ~ | ~ | ~ |
| · Kalender | `/admin/settings/calendar` | – | --- | ✓ | ~ | ~ | ~ |
| · Sikkerhet | `/admin/settings/security` | – | --- | ✓ | ~ | ~ | ~ |
| · Tilgang | `/admin/settings/tilgang` | – | --- | ✓ | ~ | ~ | ~ |
| Team | `/admin/team` | – | --- | ✓ | ~ | ~ | ~ |
| · Inviter | `/admin/team/inviter` | – | --- | ✓ | ~ | ~ | ~ |
| Audit-log | `/admin/audit-log` | – | --- | ✓ | ~ | ~ | ~ |
| · Audit-detalj | `/admin/audit-log/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| AI-agenter | `/admin/agents` | – | --- | ✓ | ~ | ~ | ~ |
| · Agent-detalj | `/admin/agents/[agentId]` | – | --- | ✓ | ~ | ~ | ~ |
| E-postmaler | `/admin/email-templates` | – | --- | ✓ | ~ | ~ | ~ |
| · Rediger e-postmal | `/admin/email-templates/[id]/rediger` | – | --- | ✓ | ~ | ~ | ~ |
| Profil | `/admin/profile` | – | --- | ✓ | ~ | ~ | ~ |
| Hjelp | `/admin/hjelp` | – | --- | ✓ | ~ | ~ | ~ |
| Caddie (alt. adresse) | `/admin/caddie` | – | --- | ✓ | ~ | ~ | ~ |
| Design-godkjenning | `/admin/godkjenn-portal` | – | --- | ✓ | ~ | ~ | ~ |
| · Koblinger | `/admin/godkjenn-portal/koblinger` | – | --- | ✓ | ~ | ~ | ~ |
| · Kobling-detalj | `/admin/godkjenn-portal/koblinger/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| · Review | `/admin/godkjenn-portal/review` | – | --- | ✓ | ~ | ~ | ~ |

> Merknad: Flere AgencyOS-funksjoner finnes på to adresser samtidig (f.eks. `/admin/finance` og `/admin/okonomi`, `/admin/kalender` og `/admin/calendar`, `/admin/innboks` og `/admin/messages`, `/admin/godkjenninger` og `/admin/approvals`, `/admin/plans/templates` og `/admin/plan-templates`). Det er dobbeltarbeid som bør ryddes — se «Veien til 100%».

---

## Skjermene — Auth + Forelder + Marketing + System

### Auth (innlogging og oppstart)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Logg inn | `/auth/login` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| Registrer | `/auth/signup` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| Glemt passord | `/auth/forgot-password` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| Tilbakestill passord | `/auth/reset-password` | – | --- | ✓ | ~ | ~ | ~ |
| Sjekk e-post | `/auth/check-email` | – | --- | ✓ | ~ | ~ | ~ |
| BankID | `/auth/bankid` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| Onboarding (spiller, 8 steg) | `/auth/onboarding` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| Onboarding (forelder) | `/auth/onboarding/forelder` | – | --- | ✓ | ~ | ~ | ~ |
| Foreldresamtykke (token) | `/auth/guardian-consent/[token]` | – | --- | ✓ | ~ | ~ | ~ |
| Samtykke venter | `/auth/samtykke-venter` | – | --- | ✓ | ~ | ~ | ~ |
| Logget ut | `/auth/logget-ut` | ✓ | ✓✓– | ~ | ~ | – | ✓ |

### Forelder (foreldreportal)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Forelder-hjem | `/forelder` | ~ | ✓✓– | ✓ | ~ | – | ~ |
| Barn (oversikt) | `/forelder/barn` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| · Barn-detalj | `/forelder/barn/[childId]` | ~ | ✓✓– | ✓ | ~ | – | ~ |
| Bookinger | `/forelder/bookinger` | – | --- | ✓ | ~ | ~ | ~ |
| Coach | `/forelder/coach` | – | --- | ✓ | ~ | ~ | ~ |
| Fakturaer | `/forelder/fakturaer` | – | --- | ✓ | ~ | ~ | ~ |
| Økonomi | `/forelder/okonomi` | – | --- | ✓ | ~ | ~ | ~ |
| Samtykke | `/forelder/samtykke` | – | --- | ✓ | ~ | ~ | ~ |
| Ukerapport | `/forelder/ukerapport` | – | --- | ✓ | ~ | ~ | ~ |
| Innstillinger | `/forelder/innstillinger` | – | --- | ✓ | ~ | ~ | ~ |
| Varsler | `/forelder/varsler` | – | --- | ✓ | ~ | ~ | ~ |
| Inviter forelder (token) | `/inviter/forelder/[token]` | – | --- | ✓ | ~ | ~ | ~ |

### Marketing (akgolf.no — offentlige sider)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Forside | `/(marketing)` | ✓ | ✓✓– | ~ | ~ | – | ✓ |
| Anlegg | `/(marketing)/anlegg` | – | --- | ✓ | ~ | ~ | ✓ |
| · Anlegg-detalj | `/(marketing)/anlegg/[slug]` | – | --- | ✓ | ~ | ~ | ✓ |
| Blogg | `/(marketing)/blogg` | – | --- | ✓ | ~ | ~ | ✓ |
| · Blogg-innlegg | `/(marketing)/blogg/[slug]` | – | --- | ✓ | ~ | ~ | ✓ |
| Booking | `/(marketing)/booking` | – | --- | ✓ | ~ | ~ | ✓ |
| · Booking-tjeneste | `/(marketing)/booking/[slug]` | – | --- | ✓ | ~ | ~ | ~ |
| · Booking bekreft | `/(marketing)/booking/[slug]/bekreft` | – | --- | ✓ | ~ | ~ | ~ |
| · Booking kvittering | `/(marketing)/booking/kvittering/[bookingId]` | – | --- | ✓ | ~ | ~ | ~ |
| Cases | `/(marketing)/cases` | – | --- | ✓ | ~ | ~ | ✓ |
| Coacher | `/(marketing)/coacher` | – | --- | ✓ | ~ | ~ | ✓ |
| · Coach-profil | `/(marketing)/coacher/[slug]` | – | --- | ✓ | ~ | ~ | ✓ |
| Coaching | `/(marketing)/coaching` | – | --- | ✓ | ~ | ~ | ✓ |
| Junior | `/(marketing)/junior` | – | --- | ✓ | ~ | ~ | ✓ |
| Priser | `/(marketing)/priser` | – | --- | ✓ | ~ | ~ | ✓ |
| PlayerHQ (salgsside) | `/(marketing)/playerhq` | – | --- | ✓ | ~ | ~ | ✓ |
| Om oss | `/(marketing)/om-oss` | – | --- | ✓ | ~ | ~ | ✓ |
| Kontakt | `/(marketing)/kontakt` | – | --- | ✓ | ~ | ~ | ✓ |
| Jobb | `/(marketing)/jobb` | – | --- | ✓ | ~ | ~ | ✓ |
| FAQ | `/(marketing)/faq` | – | --- | ✓ | ~ | ~ | ✓ |
| Suksess | `/(marketing)/suksess` | – | --- | ✓ | ~ | ~ | ✓ |
| Treningsfilosofi | `/(marketing)/treningsfilosofi` | – | --- | ✓ | ~ | ~ | ✓ |
| Turneringer | `/(marketing)/turneringer` | – | --- | ✓ | ~ | ~ | ✓ |
| · Turnering-detalj | `/(marketing)/turneringer/[slug]` | – | --- | ✓ | ~ | ~ | ✓ |
| Cookies | `/(marketing)/cookies` | – | --- | ✓ | ~ | ~ | ✓ |
| Personvern | `/(marketing)/personvern` | – | --- | ✓ | ~ | ~ | ✓ |
| Vilkår | `/(marketing)/vilkar` | – | --- | ✓ | ~ | ~ | ✓ |

#### Marketing → Stats (det store offentlige stats-universet)

Dette er en stor offentlig statistikk-seksjon (PGA-tall, norske spillere, verktøy osv.). Den er funksjonell med ekte data, men ikke pusset opp til v10-design. Gruppert kompakt her — alle adressene under begynner med `/(marketing)`:

| Område | Adresse(r) (under `/(marketing)/stats/...`) | Design | Adresse-ok | Data | Funker |
|---|---|---|---|---|---|
| Stats-forside + uka + 2026 | `stats`, `stats/uka`, `stats/2026` | – | ✓ | ~ | ✓ |
| Spillere + årgang | `stats/spillere`, `stats/spillere/[slug]`, `stats/aargang`, `stats/aargang/[aar]` | – | ✓ | ✓ | ✓ |
| Baner + klubber + regioner | `stats/baner(/[slug])`, `stats/klubber(/[slug])`, `stats/regions(/[slug])` | – | ✓ | ✓ | ✓ |
| Turneringer (offentlig) | `stats/turneringer(/[slug])(/statistikk)`, `stats/tour/[slug]` | – | ✓ | ✓ | ✓ |
| Leaderboards + norske + PGA | `stats/leaderboards`, `stats/norske`, `stats/pga` (+ drive-distance, fairway-pct, gir-pct, putt-explorer, putts-per-round, scoring-avg, sg-total, spillere, spillere/[dg_id]) | – | ✓ | ✓ | ✓ |
| Verktøy (kalkulatorer) | `stats/verktoy` (+ avstand, score-til-hcp, sg-estimator, tour-ekvivalent, whs-kalkulator) | – | ✓ | ✓ | ✓ |
| Sammenlign + SG-sammenlign | `stats/sammenlign-spillere`, `stats/sg-sammenlign(/start)(/resultat/[id])` | – | ✓ | ✓ | ✓ |
| Blogg + søk + quiz + wrapped + min progresjon | `stats/blogg(/[slug])`, `stats/sok`, `stats/quiz`, `stats/wrapped/[slug]`, `stats/min-progresjon` | – | ✓ | ✓ | ✓ |

### System + interne sider (ikke for vanlige brukere)

| Skjerm | Adresse | Merknad |
|---|---|---|
| Offline-side | `/offline` | Vises uten nett. Funker. Ingen v10-design nødvendig. |
| 404 (ikke funnet) | (system) | Nytt v10-design bygget i forhåndsvisning i natt (`mx-404.png`). Ikke koblet til appens ekte «ikke funnet»-side ennå. |
| Onboard coach | `/onboard/coach` | 4-stegs coach-oppstart. Ingen v10-design. |
| Onboard klubb | `/onboard/klubb` | 5-stegs klubb-oppstart. Ingen v10-design. |
| Design-system (internt) | `/(internal)/design-system`, `/design-system-v2` | Utviklerverktøy. Ikke en brukerskjerm. |
| Demoer (internt) | `/(internal)/demos/*` (newplan, ny-okt, plan-bygger, trackman-import) | Test-/demo-sider. Ikke ekte skjermer. |
| Komponent-demoer (internt) | `/intern/komponenter/*`, `/demo`, `/hull-demo`, `/kalender-demo`, `/kalender-maaned-demo`, `/lokasjoner-demo`, `/sesjon-opptak-demo`, `/talent-*-demo` | Interne testflater for komponenter. Ikke ekte skjermer — vurder å rydde bort før lansering. |

> Disse interne/demo-adressene (rundt 29 stk) er IKKE ekte brukerskjermer og teller ikke som «mangler design». De er verktøy for utvikling, og flere bør fjernes før lansering.

---

## Tegnet, men ikke brukt ennå (drop-off)

Dette er det viktigste å passe på: ting designeren (Claude Design) har tegnet ferdig, men som ennå IKKE har funnet veien inn i appen som en ekte, koblet skjerm. Målet er at denne lista skal bli tom.

### A. Ferdige skjermbilder uten en oppdatert ekte skjerm

Designeren leverte 44 ferdige skjermbilder. De fleste er nå bygget i forhåndsvisning (pulje 1 + 2) eller har en motpart i appen. Disse har et bilde, men skjermen i appen er enten ikke pusset opp eller ikke koblet til ekte adresse ennå:

| Tegnet skjermbilde | Hører hjemme på | Status |
|---|---|---|
| `mx-404.png` (404-side) | Appens «ikke funnet»-side | Bygget i forhåndsvisning. Mangler kobling til ekte side. Enkel jobb — bør gjøres. |
| `pl-onboarding.png` | `/auth/onboarding` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `pl-forelder.png` | `/portal/meg/foreldre` (eller foreldreportalen) | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `pl-varsler.png` | `/portal/varsler` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `pl-innstillinger.png` | `/portal/meg/innstillinger` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `pl-trackman.png` | `/portal/mal/trackman` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `pl-turnering.png` | `/portal/tren/turneringer` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `fo-barn.png` (forelder ser barn) | `/forelder/barn` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-caddie.png` (coach AI-chat) | `/admin/agencyos/caddie` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-compare.png` (sammenlign spillere) | `/admin/talent/sammenligning` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-compliance.png` | `/admin/analysere/compliance` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-drift.png` (drift/anlegg) | `/admin/anlegg` / drift-sidene | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-kalender.png` | `/admin/kalender` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-tester.png` | `/admin/tester` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `mk-forside.png` (marketing-forside) | `/(marketing)` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |

> De øvrige skjermbildene (f.eks. `pl-hjem`, `pl-sghub`, `pl-runder`, `pl-live-*`, `ag-dashboard`, `ag-stallen`, `ag-innboks`, `ag-spiller`, `ag-workbench`, `au-login` m.fl.) er allerede tatt i bruk eller bygget i forhåndsvisning i natt — de er IKKE drop-off.

### B. Ferdige design-komponenter (HTML) uten en plass i appen

Designeren leverte 47 ferdige komponent-design (HTML-biter). Mange er brukt i skjermene over. Disse er IKKE tydelig tatt i bruk ennå, og bør finne et hjem:

**PlayerHQ-komponenter som ennå ikke er synlig brukt:**

| Tegnet komponent | Hva det er | Hører hjemme på |
|---|---|---|
| `components-voice-input.html` | Snakk-inn-tall (stemme-logging) | Live-økt-logger / score-tapper — la spilleren si tallene i stedet for å taste. Ikke bygget. |
| `components-credit-indicator.html` | «Du har X klipp igjen»-måler | Booking-hub (`/portal/booking`) — vise credits. Tegnet, ikke tydelig brukt. |
| `components-gap-to-drill.html` | «Din svakhet → denne øvelsen»-bro | SG-Hub eller analyse → foreslå drill ut fra svakhet. Ikke bygget. |
| `components-insight-narrative.html` | AI-fortelling i ord om formen din | Hjem (AI-innsikt) / analyse. Delvis. |
| `components-season-timeline.html` | Tidslinje for hele sesongen | Årsplan (`/portal/tren/aarsplan`). Delvis. |
| `components-test-week.html` | «Testuke»-oppsett | Tester (`/portal/tren/tester`). Ikke tydelig brukt. |
| `components-course-heatmap.html` | Varmekart over banen | Hull-analyse (`/portal/analysere/hull`). Delvis. |
| `components-trackman-stability.html` | TrackMan stabilitet-graf | TrackMan-skjermene. Ikke tydelig brukt. |
| `components-trackman-trend.html` | TrackMan trend-graf | TrackMan-skjermene. Ikke tydelig brukt. |
| `components-sg-training-scatter.html` | SG vs trening punktsky | SG-Hub / analyse. Ikke tydelig brukt. |

**AgencyOS-komponenter som ennå ikke er synlig brukt:**

| Tegnet komponent | Hva det er | Hører hjemme på |
|---|---|---|
| `components-co-agent.html` | Coachens AI-medhjelper-panel | Caddie (`/admin/agencyos/caddie`). Ikke bygget. |
| `components-multi-compare.html` | Sammenlign flere spillere side om side | `/admin/talent/sammenligning`. Ikke bygget. |
| `components-coach-mobile.html` | Coach-visning på mobil | Mobil-utgave av AgencyOS. Ikke bygget (AgencyOS er laget for data/desktop først). |
| `components-foreldre.html` | Foreldre-komponent for coach | Coachens foreldre-/kommunikasjonsside. Ikke tydelig brukt. |
| `components-cmdk.html` | Hurtigsøk-boks (⌘K) | Søk i hele AgencyOS. Delvis — søkefeltet finnes, men hurtig-paletten er ikke bekreftet koblet. |

### C. Hele «Elite»-pakken er tegnet, men ikke i bruk

Designeren har levert en egen elite-mappe (spredningsverktøy for utslag — «dispersion»):

- `elite/DispersionTool.html`, `elite/Utslag-spredning.html`, `elite/components-trackman-dispersion.html`.

Dette hører hjemme i elite-/talent-delen (f.eks. shot-map/dispersjon: `/portal/statistikk/shot-map` eller talent-radar). **Bevisst utsatt** — «Elite Fase 2» er parkert. Det er greit at den ligger ubrukt nå, men den må ikke glemmes når Elite Fase 2 starter.

### D. UI-kits (byggeklosser, ikke skjermer)

Designeren leverte fem komplette «verktøykasser» (UI-kits) med farger, knapper og maler: booking, coachhq, marketing, playerhq og en felles. Disse er IKKE enkeltskjermer, men grunnlaget alt bygges på. De brukes løpende når skjermene pusses opp. Ingen handling i seg selv — men sjekk at fargene og knappene faktisk matcher det vi bygger.

---

## Mangler helt

Skjermer/funksjoner som planen vår (manifestene) sier vi trenger, men som ikke har noen ferdig design eller ikke kan bygges ennå:

1. **Shot-map / spredningsplott** (`/portal/statistikk/shot-map`) — designet finnes (elite-pakken), men databasen mangler punkt-koordinater for hvert slag. Kan ikke vise ekte data før datamodellen utvides. (Notert som data-blokkert.)
2. **Scorecard per runde, hull-for-hull** (`/portal/tren/turneringer/[id]/runde/[nr]`) — mangler i databasen; `Round` har bare totalscore, ikke hull-for-hull. Data-blokkert.
3. **Live turnerings-tracking** (`/portal/tren/turneringer/[id]/live`) — hele live-scoring-dataflyten mangler. Data-blokkert.
4. **Fellesmelding til turneringsdeltakere** — planen for AgencyOS sier vi skal kunne sende én melding til alle deltakerne i en turnering. Flyten er beskrevet, men ingen ferdig design er levert for selve «velg deltakere → skriv → send»-stegene. Trenger design.
5. **Spiller↔gruppe-veksler** (player-picker alltid øverst i AgencyOS) — beskrevet i planen som en ny fast del av toppmenyen, men ikke levert som design. Trenger design.
6. **Fokus-spiller-blokk med pin + AI-forslag** — delvis bygget på cockpit, men «pin manuelt»-mekanismen + AI-forslagsfeltet er ikke ferdig designet. Trenger design.
7. **Mobil-utgave av Workbench og AgencyOS** — designet er laget for stor skjerm (desktop). Mobil-varianter er ikke tegnet for disse to. Spørsmål til deg: trengs mobil her før lansering, eller holder desktop?

---

## Veien til 100% (rekkefølge)

Enkle bolker, i den rekkefølgen som gir minst risiko og raskest synlig fremgang.

**Bolk 1 — Gjør ferdig det som ble bygget i natt (ingen nytt design trengs).**
De 43 skjermene som er tegnet og bygget i forhåndsvisning (PlayerHQ-hjem, SG-Hub, Live-økt, Runder, Statistikk, Analyse, Meg, Abonnement, Drills, Tester, Årsplan, Booking, Varsler, Innstillinger, TrackMan, Turneringer, Logg ny runde, Forelder-side, Onboarding + AgencyOS cockpit, Spillere, Innboks, Spiller-detalj, Kalender, Bookinger, Tester, Turneringer, Caddie, Sammenlign, Compliance, Drift + auth-sider + marketing-forside): flytt dem fra forhåndsvisning til ekte adresse, koble på ekte data, og test. Mål: alle seks haker grønne.

**Bolk 2 — Plukk de enkle drop-off-skjermbildene (kan bygges selv).**
404-siden mangler fortsatt kobling. Andre tegnede skjermbilder som ennå ikke er bygget kobles på. Disse er tegnet og venter — bare å koble på.

**Bolk 3 — Ta i bruk de tegnede komponentene (kan bygges selv).**
Bygg inn stemme-logging, credit-måler, svakhet-til-drill-bro, sesong-tidslinje, TrackMan-grafene og spiller-sammenligning der de hører hjemme (se drop-off-liste B). Da blir flere skjermer komplette samtidig.

**Bolk 4 — Rydd dobbeltadressene (kan bygges selv).**
Velg én adresse per funksjon der det finnes to (finance/okonomi, kalender/calendar, innboks/messages, plans-templates/plan-templates, godkjenninger/approvals, agencyos-spillere/spillere, og på spillersiden stats/statistikk, analyse/analysere, drills/ovelser). Behold én, la den andre peke videre. Mindre forvirring, mindre å vedlikeholde.

**Bolk 5 — Det som trenger nytt design fra deg (Anders).**
Disse kan vi ikke bygge riktig før du har godkjent et design:
- Fellesmelding til turneringsdeltakere (velg → skriv → send).
- Spiller↔gruppe-veksler øverst i AgencyOS.
- Fokus-spiller med manuell pin + AI-forslag.
- Avgjørelse: trengs mobil-utgave av Workbench/AgencyOS nå?

**Bolk 6 — Det som er data-blokkert (krever databasearbeid først).**
Shot-map/spredning, scorecard hull-for-hull, live turnerings-tracking. Her må vi bygge ut databasen og en måte å samle inn tallene på FØR skjermene kan vise ekte data. Ikke noe vi løser med design.

**Bolk 7 — Elite Fase 2 (bevisst utsatt).**
Hele talent-/elite-delen + den tegnede elite-spredningspakken tas når du sier fra. Designet ligger klart.

---

> Når en rad over endrer seg: oppdater de seks hakene her med en gang. Det er den eneste måten denne planen holder seg sann.

---

## Endringslogg

- 3. juni (natt): Pulje 1 + 2 ferdig — 43 skjermer fikk nytt v10-design i forhåndsvisning (liksom-tall). Workbench eneste med ekte data. Neste: ekte data + koble til ekte adresser.
