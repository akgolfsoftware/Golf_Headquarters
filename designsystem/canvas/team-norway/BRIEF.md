# Team Norway Workdesk — skjermbrief før tegning

Skrevet 30.08.2026. Underlaget for canvasen som skal tegnes i Claude Design før
noe av TN-bølgen kodes (`.claude/rules/beslutninger.md` §TEGN SKJERMEN FØR DU
BYGGER DEN). Paste-klar prompt: `PROMPT.md` i samme mappe.

**Designsystem i Claude Design:**
https://claude.ai/design/p/a03bf94a-c923-4c04-82ff-415773557e37?via=share

---

## 1. Hva Team Norway Workdesk er

Et komplett arbeidsområde for Team Norway-trenere som **erstatter
Messenger-grupper, e-post og Word/Excel**. Bygger på org-flate-grunnmuren fra
bølge N og samtykke-stakken (`src/lib/auth/ekstern-leser-scope.ts`).

Låst av Anders 30.08.2026 (`beslutninger.md` §TEAM NORWAY-WORKDESK, MASTERPLAN
STEG 17):

- **Dataansvar: AK Golf eier alt.** Hver TN-spiller/forelder samtykker direkte
  til AK Golf.
- **Forretningsmodell:** gratis pilot 2026/27 → **spillerlisenser** fra 2027,
  aldri plattformleie. Organisasjonen betaler spillerens lisens, ikke systemet.
  TN-spillere har krav om komplett PlayerHQ (FULL).
- **Poster, ikke chat.** Ingen fri chat noe sted. Trener poster til gruppe og
  til enkeltspiller, med video, bilder, lenker og vedlegg (flybilletter,
  hotellreservasjoner). 1:1-poster til mindreårige er sporbare og synlige for
  forelder — idrettens åpenhetsprinsipp.
- **Dokumenter med lesekvittering:** «12 av 14 har åpnet uttakskriteriene» +
  «sist oppdatert».
- **Delte testprotokoller** på tvers av AK Golf, WANG og Team Norway. Versjonert
  og låst ved første bruk: resultater peker på versjonen, endring gir ny versjon,
  eierorganisasjonen endrer, delte mottakere bruker.
- **Pilot høsten 2026:** Anders + 2–5 navngitte TN-trenere, tilgang kun til egne
  grupper, spillere inn via samtykke. Bevis på én samling før utrulling.
- **TN-branding:** Anders lager brandingsystemet selv. TN-rød `#D50431` KUN på
  logo og skinne, aldri som statusfarge. Canvasen tegnes derfor med
  plassholder-logo og nøytral Train-lock-flate.

## 2. Utgangspunktet i koden (målt 30.08.2026)

- Team Norway finnes **ikke** som rute i dag. Eneste spor: `Group`-rad med
  `slug: "team-norway"`, `kind: "ekstern"`, og generisk «ekstern leser»-flate
  `/innsyn` + `/innsyn/[spillerId]`.
- En TN-spiller er **samme `User`-rad** som PlayerHQ-brukeren. Koblingen er
  `GroupMember`. Ingen egen elev-tabell.
- Samtykke ligger i `DelingsSamtykke` (scope `TEST_RESULTATER` / `STATS`,
  `gittAvRolle` SELV/FORESATT) og lesetilgang i `EksternLeserGruppe`.
- `GroupSchedule.kind` har allerede `SAMLING` / `HELDAGSSAMLING`.
- Det finnes **ingen** kode for at en organisasjon betaler en annen brukers
  abonnement. Lisensflaten er derfor ny skjerm, ikke en eksisterende visning.

Konsekvens for tegningen: alt er nytt, og ingen tegnet Train-lock-fasit finnes
for disse flatene. Canvasen er utkastet Anders godkjenner.

## 3. Deling i to trinn (styrer hva TN faktisk ser)

| Trinn | Innhold | Pris |
|---|---|---|
| 1 | Tester + turneringer + statistikk | Gratis å dele |
| 2 | Komplett profil: treningsplan, TrackMan, analyse, fremgang | Krever FULL |

Spilleren (forelder for mindreårige) styrer trinn per organisasjon og kan trekke
når som helst. **To brytere, aldri ti.** Skjermene må vise tydelig hva som er
låst av manglende samtykke — og skille «ikke delt» fra «ikke målt».

## 4. Skjermlisten

| # | Skjerm | Hvorfor |
|---|---|---|
| TN-01 | Hjem / i dag | Neste samling, poster som venter, dokumenter uten kvittering, testdager |
| TN-02 | Gruppe / spillerliste | Roster med status og samtykketrinn per spiller |
| TN-03 | Spiller-ark | Det TN faktisk har lov til å se, med dato + kilde på hvert tall |
| TN-04 | Poster-strøm (gruppe) | Erstatter Messenger-gruppa |
| TN-05 | Ny post (composer) | Mottaker gruppe/enkeltspiller, vedlegg, video, lenke |
| TN-06 | 1:1-post til mindreårig | Åpenhetsbanner: forelder ser denne |
| TN-07 | Dokumenter | «Sist oppdatert» + kvitteringsteller per fil |
| TN-08 | Dokument-detalj | Hvem har åpnet, hvem mangler, purring (krever ja) |
| TN-09 | Testprotokoll-bibliotek | Delte protokoller, eier-organisasjon, versjon |
| TN-10 | Protokoll-detalj + versjonering | Låst ved første bruk, «ny versjon»-dialog |
| TN-11 | Testføring (testdag) | Velg protokoll → før spiller for spiller i kø, bulk fysisk |
| TN-12 | Testresultater for gruppe | Per protokoll, versjonsmerket |
| TN-13 | Samling | Program, deltakere, reisevedlegg, oppmøte |
| TN-14 | Kartlegging (landskapsanalyse) | Turneringer/spillere/deltakelser per år — med kildeadvarsel |
| TN-15 | Innsikt per spiller | Kun der trinn 2 er delt |
| TN-16 | Tilgang og samtykke | Hvem har konto, hvilke grupper, hva de ser; invitere trener |
| TN-17 | Spillerens TN-flate i PlayerHQ | To brytere, poster fra TN |
| TN-18 | Forelderens TN-flate | 1:1-poster synlige, samtykke for mindreårig |
| TN-19 | Lisens og fakturering | Organisasjonsbetalt spillerlisens (pilot = gratis, sies høyt) |
| TN-20 | Innlogging / onboarding TN-trener | Pilot, 2–5 trenere |

Tilstander som skal tegnes på tvers: tom, laster (skjelett), feil, «mangler
samtykke», offline.

## 5. Kartlegging — hva som KAN vises (STEG 17.5)

- **Kan bygges nå (17.5a):** turneringer per år, spillere per år, deltakelser,
  nivå. Målt 2018→2026: 187→177 turneringer, 1 989→2 984 spillere,
  10 705→13 212 deltakelser.
- **Advarselen MÅ stå i skjermen:** U19 hopper 328 (2024) → 1 006 (2025) fordi
  kildesammensetningen endret seg (OLYO kom inn), ikke fordi virkeligheten
  endret seg. Volumtall til NGF sies som **+24,3 % målt på OLYO alene**.
- **Klubbdimensjon (17.5b): blokkert** — klubbnavnet kastes i scraperen i dag.
- **Regionkart (17.5c): skal ikke bygges** — alle regioner er kun OLYO.
- **Lenker per turnering (17.5d): blokkert** — `dashboard.tournament_links` er tom.

Blokkerte dimensjoner tegnes som ærlige «ikke tilgjengelig ennå»-tilstander,
aldri som utfylte eksempeltall.

## 6. Ikke bygg / ikke tegn

Fri chat · plassering som persentil · kohort-persentil vist til spiller,
forelder eller ekstern leser · regionkart som nasjonalt bilde · odds og
prognoser · skolekarakterer (kun Anders' egen sportslige **vurdering**) ·
grønn som generell statusfarge · navn på ekte mindreårige.
