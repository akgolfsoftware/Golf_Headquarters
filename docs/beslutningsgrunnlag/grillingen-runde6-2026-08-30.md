# Grillingen runde 6, 30.08.2026 — grunnlag

Fullt underlag bak beslutningsblokken «GRILLINGEN RUNDE 6» i `.claude/rules/beslutninger.md`.
Ni svar fra Anders om arbeidsdagen sin og AgencyOS-arkitekturen. Alle målinger gjort mot
kodebasen 30.08.2026 før spørsmålene ble stilt.

Konsolideringslista (42 skjermer → 10 funksjoner) er nå ført inn som arbeid i
`docs/MASTERPLAN-GJENSTAAENDE.md` **STEG 15** — bygg derfra, ikke herfra.
Målt tilstand: `docs/arkitektur-kartlegging-2026-08-30.md`.

---

- **GRILLINGEN RUNDE 6 — Anders' arbeidsdag og AgencyOS-arkitekturen (Anders
  2026-08-30, i økt):** ni svar som låser hva AgencyOS skal være. Alle målinger
  gjort mot kodebasen 30.08.2026 før spørsmålene ble stilt.

  **Forbehold Anders ga innledningsvis:** ingenting i AgencyOS-/PlayerHQ-
  arkitekturen er låst — heller ikke railens fem punkter (Stall · Workbench ·
  Kø · Jarvis · Meg) eller «Mer»-arkivet. Svarene under er retningsgivende
  produktbeslutninger, ikke en fredet IA. En egen, komplett arkitektur-
  kartlegging av begge appene er ønsket som SENERE økt (Anders valgte å
  fullføre runde 6 først).

  1. **Mandagen begynner ikke foran en skjerm (6.1).** 08:00–10:00 trening med
     WANG Toppidrett — ofte etter konkurransehelg, og da alltid teknisk
     grunntreningsøkt for å få grunnteknikken tilbake. Ettermiddag/kveld:
     privattimer med de samme spillerne pluss vanlige kunder. Maskinen åpnes i
     mellomrommene. **Konsekvens: AgencyOS' morgenflate er en mobilflate**,
     ikke en dashboard-vegg — den skal kunne skannes stående på treningsfeltet.
  2. **Kø = alt som krever Anders i dag (6.2).** Ikke bare ja/nei-saker: svar på
     e-post, SMS, forespørsler, tilbakemeldinger, oppfølginger og godkjenninger
     — «alt som krever manuell tid av meg». Kø er stedet han kommer à jour og
     får kontroll over alle deler av bedriften. De fem målte godkjennings-
     adressene (`/admin/godkjenninger`, `/admin/agenticos/godkjenn`,
     `/admin/agenticos/ko`, `/admin/tester/foreslatte`,
     `/admin/tournaments/dubletter`) blir én.
  3. **Spillerplanen er alltid kanonisk; gruppe er en planleggingsmodus (6.3).**
     En spiller har ALLTID sin individuelle plan. Ligger spilleren i en gruppe
     (GFGK Mini/Basis/Aspirant/Elite, WANG Toppidrett Fredrikstad, Team
     Norway-grupper), planlegges gruppeøkta i grupperegi — men økta lagres i
     hver enkelt spillers treningsplan med alle detaljer. **Én økt kan være
     delt:** WANG 08:00–10:00 kan ha første time individuell (hver av de 11
     jobber på sin egen utviklingsplan) og siste 45 minutter felles. Hver blokk
     skal spesifisere ansvarlig trener — AK Golf Academy, Team Norway eller
     annen WANG-trener. Ikke tre ulike planleggingsjobber; én med to nivåer.
  4. **Workbench åpner på spillerlisten med ukestatus (6.4)** — allerede låst i
     «PRODUKTRETNING — åtte svar» pkt. 6. Uendret.
  5. **Stall-lista: navn, neste økt, siste aktivitet, én varsel-prikk (6.5).**
     SG-form/delta, plan-etterlevelse per akse, hcp, pakke og skyldig beløp
     flyttes ut av raden og inn i spillerkortet — de er lese-informasjon, ikke
     skanne-informasjon. Prikk-nivåene: fylt = trenger deg, åpen = følg med,
     ingen = på planen.
  6. **Oppgaver og Kø er to ulike ting, skilt av TID (6.6).**
     **Kø** = i dag, krever meg (pkt. 2 over).
     **Oppgaver** = prosjektstyring og rutiner, Notion-modellen: oppgaver
     knyttet til prosjekt, pluss gjentakende rutiner (daglig/ukentlig/månedlig)
     som «rydd driving range» eller «send e-post til foreldre». Hver rutine
     merkes med om den **kan automatiseres** eller **må gjøres fysisk**.
     Konsekvens: `handlingssenter` + `workspace` + `workspace/prosjekter` +
     `workspace/notion` slås sammen til ÉN Oppgaver-flate. `/admin/queue`
     (spiller-signaler) er verken Kø eller Oppgaver — det er oppfølging, og
     hører hjemme i Stall.
  7. **Jarvis forbereder alt, sender ingenting (6.7).**
     **Gjør selv, uten å spørre:** sortere e-post/SMS inn i Kø, skrive
     svarutkast, foreslå økter, oppdage avvik, forberede møteunderlag, lage
     rapportutkast, rydde data (f.eks. turneringsdubletter).
     **Krever ALLTID Anders' ja:** sende e-post/SMS, bekrefte booking,
     publisere økt til spiller, dele noe med forelder, og alt som koster penger.
     Regelen i én setning: alt som forlater huset eller endrer noe for et
     menneske, krever ja.
  8. **Push-varsler til coach — tre kategorier (6.8):** (a) noen venter på svar
     nå (booking-forespørsel, melding fra spiller/forelder, avlysning),
     (b) dagen endrer seg (økt avlyst/flyttet, forfall, ny bekreftet booking),
     (c) penger (betaling feilet, nytt abonnement, oppsigelse, forfalt faktura).
     **Spillerens fremgang og avvik skal IKKE pushes** — det haster aldri i
     minutter og hører hjemme i Stall.
  9. **ÉN INNGANG PER FUNKSJON — konsolideringsregelen (6.9).** Anders avviste
     kutt som mål: «målet er ikke nødvendigvis å kutte, men at vi har alt
     forenklet, slik at det ikke er fem forskjellige innganger til samme
     funksjon». **Regel: hver funksjon har nøyaktig én adresse. Det som i dag er
     egne sider blir faner eller paneler inne i den ene siden. Ingen
     funksjonalitet fjernes; alle gamle adresser blir redirects.**

     Målt tilstand 30.08.2026: 90 ekte AgencyOS-skjermer (ikke-legacy,
     ikke-redirect). Railen (AX-01) + radene under Meg gir 9 adresser — ~57
     skjermer står utenfor navigasjonen, og **15 har ingen vei inn i det hele
     tatt** (`agencyos/ak-stigen`, `agenticos/projects|runtimes|skills`,
     `analysere/compliance`, `gdpr`, `kalender/hendelse/ny`, `kalender/lag`,
     `settings/api`, `settings/security`, `talent/wagr-import`, `team/ekstern`,
     `team/inviter`, `videoer`, `workspace/prosjekter`).

     **Konsolideringslista — 42 skjermer → 10 funksjoner:**

     | Funksjon | Slås sammen fra |
     |---|---|
     | Kø | `godkjenninger`, `agenticos/godkjenn`, `agenticos/ko`, `tester/foreslatte`, `tournaments/dubletter` |
     | Oppsett | `settings` + `api`/`calendar`/`periode-navn`/`security`/`tilgang`, `klubb/innstillinger`, `integrasjoner` |
     | Kalender | `kalender`, `kalender/lag`, `kalender/hendelse/ny`, `agencyos/uka`, `stall/dag` |
     | Jarvis | `agenticos`, `agenticos/projects`, `agenticos/runtimes`, `agenticos/skills` |
     | Oppgaver | `handlingssenter`, `workspace`, `workspace/prosjekter`, `workspace/notion` |
     | Turnering | `tournaments`, `tournaments/ny`, `tournaments/dubletter`, `turnering-kart` |
     | Kommunikasjon | `innboks`, `innboks-epost`, `email-templates`, `/meg` |
     | Analyse | `analyse`, `analyse/stall`, `analysere/compliance` |
     | Plan | `planlegge`, `plan-templates`(+`/ny`), `teknisk-plan` |
     | Hjem | `agencyos` (Konsoll), `brief` (Daglig brief) |

     `/admin/talent/*` er per beslutningen 26.08 uansett feilplassert —
     talent-flatene skal bo under `/innsyn`, aldri i AgencyOS-menyen.
