# Design-briefs: Bolk 5-trioen + mobil Workbench/AgencyOS

> **GODKJENT av Anders 17. juli 2026 (kveld):** alle fire mockups (D1 fellesmelding, D2 veksler,
> D3 fokus-spillere, D4/M1 mobil-nav) er godkjent som de ligger i `ui_kits/v2/` (gruppe «v2-bolk5»:
> `agencyos-fellesmelding|veksler|fokus|mobilnav.jsx/.html`). «Mer»-mønsteret: **skuff (kandidat A,
> anbefalt)** valgt. Implementering per skjerm etter Byggerunde-oppskriften; D3 trenger et lite
> additivt coach-preferanse-felt for pin.
>
> **STATUS 17. juli (natt) — D1/D2/D3 bygget + M2/M3 designet:**
> - **D1, D2, D3 implementert** som draft-PR-er mot main (venter Anders' ja): D1 fellesmelding
>   ([PR #67](https://github.com/akgolfsoftware/Golf_Headquarters/pull/67)), D2 veksler
>   ([PR #68](https://github.com/akgolfsoftware/Golf_Headquarters/pull/68)), D3 fokus-spillere
>   ([PR #69](https://github.com/akgolfsoftware/Golf_Headquarters/pull/69)). Alle nettleser-verifisert.
> - **M2 (Workbench-mobil) og M3 (kjerneskjermer) DESIGNET** i `ui_kits/v2/`
>   (`agencyos-wb-mobil-retninger.jsx/.html` + `agencyos-mobil-kjerne.jsx/.html`, gruppe «v2-bolk5»).
>   **M2-retning VALGT av Anders (17. juli, natt): A = oppgavedrevet kø** (`RetningA` i
>   `agencyos-wb-mobil-retninger.jsx` — panel-replika B forkastes, ikke bygg den). M3 dekker
>   cockpit/innboks/stall/kalender under den godkjente bunn-nav-en. Begge er nå fullt besluttet og
>   klare for implementering (samme draft-PR-flyt som D1–D3).
>
> Skrevet 17. juli 2026 etter Anders' prioritering: Bolk 5-trioen først i design-køen, og mobil-utgave
> av Workbench/AgencyOS TRENGS før lansering. Briefene kjøres i det levende Claude Design-prosjektet
> («AK Golf HQ Design System», `ui_kits/v2/`) når DesignSync er innlogget (`/design-login`).
> Prosessregel (låst): design → system → prod — ingenting av dette bygges før Anders har godkjent mockup.
> Backlog (bevisst nedprioritert): dropzone-primitiv, illustrativt banekart (hull-analyse), EquipmentView i v2.

Alle briefer følger beslutningshierarkiet fra ak-designekspert: **1 Jobben → 2 Flyten → 3 Hierarkiet
→ 4 Komposisjonen → 5 Craft.** Alle tilstander (hover/focus/loading/empty/error) skal leveres;
én accent-jobb per skjerm; norsk bokmål; Lucide-ikoner; aldri sperrer — kun anbefalinger.

---

## D1 — Fellesmelding til turneringsdeltakere (AgencyOS)

**Jobben:** Coachen (Anders) skal kunne sende ÉN beskjed til alle (eller et utvalg av) deltakerne i
en turnering — typisk oppmøtetid, banestatus eller endring — uten å åpne hver spillersamtale.

**Flyten (3 steg, modal eller høyre-panel fra turneringsdetaljen i AgencyOS):**
1. *Velg mottakere:* deltakerlisten forhåndsvalgt ALLE; av-/påkryssing per spiller (AvatarInit + navn
   + status-chip påmeldt/venteliste). Teller «12 av 14 valgt».
2. *Skriv:* ett tekstfelt (TekstOmraade), valgfri mal-snarveier («Oppmøtetid», «Væravlysning» — hentes
   fra skjermtekst-banken, ikke fritt oppdiktet). Forhåndsvisning av hvordan meldingen lander hos
   spilleren (samme boble som i innboksen).
3. *Send:* bekreftelsesrad («Sendes til 12 spillere som melding i PlayerHQ-innboksen»), Send-knapp
   (lime CTA — skjermens ENE accent-jobb), deretter kvitteringstilstand med «Se tråden»-lenke.

**Hierarki:** mottaker-tellingen og Send er det viktigste; meldingsfeltet størst; per-spiller-listen
sekundær. **Data:** eksisterende deltakerliste (`TournamentEntry`) + meldings-infrastrukturen
(`/portal/coach/melding`-trådene) — ingen ny datamodell. **Tilstander:** tom deltakerliste (ærlig
tomtilstand, ingen send), sending pågår, delvis feil («2 av 12 feilet — prøv igjen»).

## D2 — Spiller↔gruppe-veksler (AgencyOS toppmeny)

**Jobben:** Coachen bytter kontekst mellom enkeltspiller og gruppe (f.eks. Team Wang / GFGK junior)
uansett hvor han står i AgencyOS — uten å navigere via Stallen hver gang.

**Flyten:** fast veksler-komponent øverst i V2Shell-toppraden (ved siden av søk): viser aktiv kontekst
(AvatarFoto + navn, eller gruppe-emblem + gruppenavn). Klikk → nedtrekk med to seksjoner:
*Spillere* (søkbar liste, sist brukte øverst) og *Grupper*. Valg bytter kontekst og laster samme
skjermtype for ny kontekst der det gir mening (spiller-detalj → ny spillers detalj; cockpit → filtrert).

**Hierarki:** veksleren skal være synlig men ikke dominere — det er navigasjon, ikke innhold. Én
accent kun på aktiv-markøren i listen. **Viktig avklaring designet må svare på:** hva skjer på
skjermer som ikke har gruppe-ekvivalent (f.eks. faktura)? Anbefaling: veksleren viser da kun
spillere, med forklarende mikrotekst. **Tilstander:** tom gruppeliste, søk uten treff, laster.

## D3 — Fokus-spiller-blokk med pin + AI-forslag (cockpit)

**Jobben:** Cockpiten skal alltid vise «spillerne som trenger deg nå» — dels de coachen selv har
pinnet, dels AI-foreslåtte (stall-SG-avvik, plan-etterlevelse, skade-signal).

**Flyten:** blokk øverst i cockpit med to soner: *Pinnet av deg* (0–3 kort, pin/unpin via
stjerne/pin-ikon på spillerkort ellers i appen og i blokken) og *Foreslått nå* (AI, maks 3, hvert
kort med ÉN klarspråk-grunn: «Plan-etterlevelse 40 % siste 2 uker»). Kort-klikk → spiller-detalj;
«Avvis forslag»-handling (X) som lærer bort støy. Forslag er anbefalinger — aldri alarmer/sperrer.

**Hierarki:** grunnen (hvorfor spilleren er foreslått) er viktigst på kortet — tall med enhet og
retning, ikke nakne tall. **Data:** eksisterende signaler (cockpit stall-SG/plan-etterlevelse er alt
bygget); pin trenger et lite nytt felt (coach-preferanse) — flagges som additivt datamodell-behov i
implementasjonsfasen. **Tilstander:** ingen pinnet (hint om hvordan), AI uten forslag («alt ser
stabilt ut» — ærlig, ikke tom boks), laster.

## D4 — Mobil-utgave av Workbench + AgencyOS (faseplan)

**Beslutning (Anders 17. juli):** mobil TRENGS før lansering. Dette er en egen designfase, ikke én skjerm.

**Fase M1 — Navigasjonsprinsipp (først, alt annet avhenger av det):**
- AgencyOS på mobil: dagens venstre-rail + Mer-meny må oversettes. Anbefaling å utforske: bunn-nav
  med 4–5 hovedseksjoner (Cockpit/Innboks/Stall/Kalender/Mer) — samme mønster som PlayerHQ-mobilen,
  gjenkjennbart og tommelvennlig. Mørkt tema beholdes (BUSINESS-RULES §Tema).
- Avklaring designet må ta: hva er «Mer» på mobil (full skuff vs. side)?

**Fase M2 — Workbench mobil (den vanskelige):**
- Workbench er desktop-tung (multi-panel planlegging). Mobil-jobben er IKKE å krympe panelene, men å
  velge: hvilke Workbench-jobber MÅ kunne gjøres på mobil (justere en økt, svare på avvik, godkjenne
  forslag) vs. hva som henvises til desktop (full ukeplanlegging). Anbefalt retning: oppgave-drevet
  mobil-Workbench (kø av handlinger) i stedet for panel-replika. Dette er et produktvalg — mockupen
  skal vise begge så Anders kan velge.

**Fase M3 — Kjerneskjermene bølge for bølge:** cockpit → stall/spiller-detalj → innboks → kalender →
resten. Én skjerm per mockup, godkjennes enkeltvis, implementeres skjerm for skjerm som i porteringsløpet.

**Rammer:** 390 px referansebredde, eksisterende v2-tokens/typografi, ingen nye farger; alle
tilstander per skjerm; «?»-forklaringene (HjelpTips) skal fungere på touch.

---

## Neste steg

1. `/design-login` i en interaktiv økt → DesignSync mot prosjekt `bb9b2b1d-ce2b-4757-be37-ee2096ba9d0d`.
2. Kjør D1–D3 som enkelt-briefs i `ui_kits/v2/` (små, kan gå parallelt); D4/M1 som egen retningsoppgave.
3. Anders godkjenner mockups → implementering planlegges per skjerm (samme oppskrift som Byggerunde A–G).
