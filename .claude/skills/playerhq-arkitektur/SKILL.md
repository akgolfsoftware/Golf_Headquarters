---
name: playerhq-arkitektur
description: Komplett arkitektur for PlayerHQ i AK Golf HQ. Bruk ved arbeid i spillerportalen, I dag, plan, Live, analyse, coachkontakt, booking og profil under /portal.
metadata:
  version: "3"
  reviewed: "2026-09-27"
---

Prosjektkilder: `AGENTS.md` → `docs/platform/AGENT-BRIEF.md`. Produktregler styrer funksjon. Designautoritet står i `docs/design-system/design-autoritet.md`; dagens designretning er Claude Design «App design» / Precision Athletics (`7d7c2994-cf63-4c5f-9bdc-fdaf67655a70`). Treningsplanlegging, språk, treningsområder, periodisering og analysebegreper eies av `docs/treningsplanlegging-og-sprak.md`, som er eneste master. `designsystem/README.md` viser arbeidsstatus og historisk underlag.

# PlayerHQ — arkitektur

## Hva PlayerHQ er

PlayerHQ er den innloggede spillerens daglige verktøy for plan, trening, gjennomføring, analyse, booking og oppfølging. Coach- og administrasjonsarbeid hører hjemme i AgencyOS. Offentlig innhold hører hjemme i markedssidene.

- Adresse: `/portal/*`
- Inngang: `/portal`
- Viktige kodeområder: `src/app/portal/`, `src/components/portal/` og delte komponenter i `src/components/`
- Kontroller faktisk kode og ruter før endring; historiske komponentnavn som `v2`, `legacy` og `TL` beviser ikke gjeldende design eller om en fil kan fjernes.
- PlayerHQ viser spillerens publiserte og autoriserte bilde. Trenerens planlegging, godkjenning, hypotesevalg og endring av fremtidige økter skjer i AgencyOS/Workbench.

## Nåværende brukerreise som skal bevares og prøves

Spilleren må ha forståelige veier til:

- **I dag:** hva som bør gjøres nå;
- **Plan:** uke, økter og egen/coachstyrt plan;
- **Gjennomføring:** start, Live, lagring, pause/avbryt og oppsummering;
- **Analyse:** utvikling, datagrunnlag, periode og sammenligning;
- **Meg:** profil, innstillinger og relevante avtaler eller abonnement;
- coachkontakt og booking der funksjonen finnes.

Dagens navigasjon i kode er arbeidsunderlag, ikke en permanent visuell eller informasjonsarkitektonisk lås. En ny løsning kan organisere veiene annerledes dersom ingen funksjon forsvinner og de viktigste reisene blir tydeligere.

## Gjeldende designretning

Ved design og UI skal du lese [Atletisk intelligens](../ak-hq-design/references/atletisk-intelligens.md) og bruke `ak-hq-design`.

- Gjeldende retning er AK Golf Design System / Precision Athletics, ikke Train-lock eller Paper.
- PlayerHQ er den mest sportslige og oppslukende modusen i samme designsystem som AgencyOS.
- Bruk fotografi, bevegelse og stor typografi selektivt i innganger, øktstart og milepæler.
- La tid, progresjon, faktisk øktstatus og én neste handling bære hverdagsflyten.
- Mørk fokusmodus kan passe Live og fordypning; den er ikke automatisk standard på alle PlayerHQ-skjermer.
- Mobil er hovedprøven. Desktop og nettbrett skal fortsatt være komplette og forståelige.

Tokens, fonter og komponenter som ligger i koden i dag beskriver dagens implementasjon. De er ikke automatisk input til gjeldende design. Når Anders velger en Claude Design-versjon for bygging, skal den kartlegges kontrollert til delte komponenter og designverdier.

## Trenings- og datakjede

PlayerHQ skal henge sammen med hele treningskjeden:

`mål og tilgjengelighet → årsplan → periode → uke → økt/test/turnering → gjennomføring → registrert resultat → kvalitetssikret analyse → trenerbeslutning → justert plan → ny måling`.

- Plan og begreper følger `docs/treningsplanlegging-og-sprak.md`: 52-ukers årsplan, 4-8 ukers perioder, månedsplan, ukeplan, øktplan, øvelser, Pyramiden og de 19 treningsområdene.
- Spillerens målinger kommer fra autoriserte appdata: brutto runder, intern slaglogging, manuelt registrerte SG-tall, UpGame-CSV, TrackMan-import, tester, Live-økt og registrert tid/anstrengelse.
- `null` betyr ukjent, aldri null målt verdi. Manglende runder, slag, TrackMan-felt eller testresultat skal vises som manglende datagrunnlag.
- Masterbrain er metode, begreper, testprotokoller og godkjent øvelsesbank. Det eier ikke spillerens rådata og skal ikke få fri tilgang til hele HQ-databasen.
- AI og Caddie kan foreslå eller forklare, men planendringer går via coachens godkjenning. Ingen automatisk publisering av ny økt, teknisk diagnose eller planendring fra PlayerHQ alene.

## Analyse og Skill Map

Skill Map er PlayerHQs interaktive analysemodell for spillerens ferdigheter. Den kan visualisere et hull eller en ferdighetsflate der soner er klikkbare, zoomer inn og åpner et analysepanel.

- Kartsoner skal kobles til kanoniske treningsområder, for eksempel `TEE_TOTAL`, `INNSPILL_200`, `INNSPILL_150`, `INNSPILL_100`, `INNSPILL_50`, `CHIP`, `PITCH`, `LOB`, `BUNKER`, `PUTT_0_3`, `PUTT_3_5`, `PUTT_5_10`, `PUTT_10_25`, `PUTT_25_40` og `PUTT_40_PLUSS`.
- Hver sone må hente spillerens egne data via serverkontrollert lesing for den innloggede profilen. Klienten skal ikke lese databasen direkte eller bygge analyser fra skjulte statiske tall.
- Panelet skal skille målt verdi, beregnet analyse, faglig hypotese, datakvalitet og mulig coach-/treningshandling.
- Strokes Gained, treningsdata, testdata og TrackMan må vise kilde, periode, antall, enhet og referanse. Ved for lite data skal sonen si det tydelig.
- Når panelet lukkes, går visualiseringen tilbake til helhet. Zoom og bevegelse er brukeropplevelse; datakontrakten er viktigere enn effekten.
- Samme analysegrunnlag skal kunne forklares i AgencyOS for coach. Spilleren ser bare data og vurderinger han eller hun har tilgang til.

## Funksjonelle krav

- Samme økt, mål, tall og status skal henge sammen gjennom I dag, Plan, Live og oppsummering.
- Skill planlagt, pågående, fullført og avbrutt fra lagrer, lagret, synker og feilet.
- Spilleren skal kunne rette feiltrykk og forstå hva som er lagret.
- Bruk brutto score, aldri netto.
- Strokes Gained og andre sammenligninger viser kilde, periode, enhet og symmetrisk skala rundt null der det er relevant.
- SG mot eget nivå må ikke brukes ukritisk som beslutningsgrunnlag før kjent avvik er rettet: dagens referanse bruker maks 20 runder, mens nærspill/putting krever 24 runder for pålitelig status, og siste fem runder overlapper referansen.
- Test- og TrackMan-anbefalinger skal bare gis når protokoll, enhet, antall og datakvalitet er tydelig. Ett radartall er en hypotese, ikke en teknisk diagnose.
- Norsk bokmål og ingen emoji i UI.

## Avgrensning

Ikke bygg AgencyOS eller offentlig marked som del av PlayerHQ-arbeid. Ikke la en visuell redesign endre tilgang, betalingsregler, datamodell, AI-lesing, Masterbrain-synk eller publiseringsadferd uten særskilt bestilling.
