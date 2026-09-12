---
name: playerhq-arkitektur
description: Komplett arkitektur for PlayerHQ i AK Golf HQ. Bruk ved arbeid i spillerportalen, I dag, plan, Live, analyse, coachkontakt, booking og profil under /portal.
metadata:
  version: "2"
  reviewed: "2026-09-11"
---

Prosjektkilder: `AGENTS.md` → `docs/platform/AGENT-BRIEF.md`. Produktregler styrer funksjon. Designstatus står i `designsystem/README.md`.

# PlayerHQ — arkitektur

## Hva PlayerHQ er

PlayerHQ er den innloggede spillerens daglige verktøy for plan, trening, gjennomføring, analyse, booking og oppfølging. Coach- og administrasjonsarbeid hører hjemme i AgencyOS. Offentlig innhold hører hjemme i markedssidene.

- Adresse: `/portal/*`
- Inngang: `/portal`
- Viktige kodeområder: `src/app/portal/`, `src/components/portal/` og delte komponenter i `src/components/`
- Kontroller faktisk kode og ruter før endring; historiske `v2`, `legacy`, `TL` og `Paper`-navn beviser ikke gjeldende design eller om en fil kan fjernes.

## Nåværende brukerreise som skal bevares og prøves

Spilleren må ha forståelige veier til:

- **I dag:** hva som bør gjøres nå;
- **Plan:** uke, økter og egen/coachstyrt plan;
- **Gjennomføring:** start, Live, lagring, pause/avbryt og oppsummering;
- **Analyse:** utvikling, datagrunnlag, periode og sammenligning;
- **Meg:** profil, innstillinger og relevante avtaler eller abonnement;
- coachkontakt og booking der funksjonen finnes.

Dagens navigasjon i kode er arbeidsunderlag, ikke en permanent visuell eller informasjonsarkitektonisk lås. En ny løsning kan organisere veiene annerledes dersom ingen funksjon forsvinner og de viktigste reisene blir tydeligere.

## Ny designretning

Ved design og UI skal du lese [Atletisk intelligens](../ak-hq-design/references/atletisk-intelligens.md) og bruke `ak-hq-design`.

- Start uten eksisterende visuell fasit når oppgaven gjelder den nye retningen.
- PlayerHQ er den mest sportslige og oppslukende modusen i samme designsystem som AgencyOS.
- Bruk fotografi, bevegelse og stor typografi selektivt i innganger, øktstart og milepæler.
- La tid, progresjon, faktisk øktstatus og én neste handling bære hverdagsflyten.
- Mørk fokusmodus kan passe Live og fordypning; den er ikke automatisk standard på alle PlayerHQ-skjermer.
- Mobil er hovedprøven. Desktop og nettbrett skal fortsatt være komplette og forståelige.

Eksisterende Train-lock-tokens, fonter og komponenter beskriver dagens implementasjon. De er ikke automatisk input til Design System v0.1. Når Anders velger en ny Claude Design-versjon for bygging, skal den kartlegges kontrollert til delte komponenter og designverdier.

## Funksjonelle krav

- Samme økt, mål, tall og status skal henge sammen gjennom I dag, Plan, Live og oppsummering.
- Skill planlagt, pågående, fullført og avbrutt fra lagrer, lagret, synker og feilet.
- Spilleren skal kunne rette feiltrykk og forstå hva som er lagret.
- Bruk brutto score, aldri netto.
- Strokes Gained og andre sammenligninger viser kilde, periode, enhet og symmetrisk skala rundt null der det er relevant.
- Norsk bokmål og ingen emoji i UI.

## Avgrensning

Ikke bygg AgencyOS eller offentlig marked som del av PlayerHQ-arbeid. Ikke la en visuell redesign endre tilgang, betalingsregler, datamodell eller publiseringsadferd uten særskilt bestilling.
