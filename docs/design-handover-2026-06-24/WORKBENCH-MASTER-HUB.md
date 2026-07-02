# Workbench Master-Hub — komplett funksjons- og flyt-spec

> **Beslutning (Anders 2026-06-25):** Workbench er det **operative hjertet** i appen — hver funksjon
> appen kan gjøre/vise skal nås og *fullføres* derfra. Resten av nav er bare innganger til Workbench.
> Fritt designet (ikke bundet av dagens), komplett flyt-spec for HVER funksjon, begge produkter.
>
> **Lese-nøkkel for flyter:** `Knapp` → [skjerm/panel] → [neste steg] → **resultat**. Hvert «→» er ett trykk
> der det er mulig (trykkbudsjett ≤2 til kjernehandling). Hver knapp har en destinasjon — ingen døde knapper.

---

# DEL 1 · KONSEPT — Workbench som master-hub

Tenk på Workbench som et **cockpit/IDE for golfutvikling**, ikke en side blant mange:

- **Persistent shell:** venstre sone-rail · hoved-canvas (det du jobber med) · høyre **inspector** (kontekst/handlinger for valgt element). Mobil: sone-bunn-nav + fullskjerm-canvas + bunn-ark-inspector.
- **Alt skjer in-place:** du forlater sjelden Workbench — sub-flyter åpner i canvas eller inspector, ikke som separate sider du «navigerer bort» til.
- **Tallet/diagnosen er alltid synlig** som ankeret. Hver handling fører tilbake til «hva betyr dette for nivået mitt».

---

# DEL 2 · PlayerHQ Workbench (spillerens master-hub)

## Soner (venstre rail / mobil bunn-nav)
1. **I dag** · 2. **Plan** · 3. **Analyse** · 4. **Utfør** · 5. **Coach** · 6. **Mål** · 7. **Meg**

---

### SONE 1 · I DAG (landing — «hva gjør jeg nå»)
Canvas: diagnose-snapshot (nivå + topp gap), dagens økt-kort, coach-notat, neste-handling. Inspector: dagens detaljer.

| Knapp/element | Flyt |
|---|---|
| `Start dagens økt` | → [Live brief: oppvarming→hovedfase→avslutning] → `Start` → [Aktiv økt fullskjerm, logg per rep] → `Avslutt` → [Sammendrag + feiring] → **økt logget, SG/streak oppdatert** |
| `Se hele planen` | → bytter til **Plan**-sonen (Uke-zoom) |
| `Logg runde` | → [Runde-wizard: bane→score→hull-detaljer (valgfritt)] → `Lagre` → **runde lagret, SG/HCP/diagnose oppdatert** |
| Coach-notat-kort | → **Coach**-sonen, melding-tråd åpen |
| Diagnose-kort `Se hva dette betyr` | → **Analyse**-sonen, diagnose-fane |
| Bjelle (varsler) | → inspector: varsel-liste (økt klar / coach-melding / bak planen / nivå-opprykk) → trykk varsel → relevant sone |

### SONE 2 · PLAN (Workbench-kjernen — planlegging)
Canvas: zoom-bryter **År (Gantt) / Uke / Økt**. Inspector: valgt økt/periode-detalj + handlinger.

| Knapp | Flyt |
|---|---|
| `Ny økt` | → inspector: [type (teknisk/fys/spill/turnering)] → [dato+tid] → [bygg: legg til drills fra bibliotek, mål-kobling, varighet] → `Lagre` → **økt i planen, synlig i Uke/Gantt** |
| `AI-foreslå plan` | → [AI leser diagnose+mål] → canvas viser foreslåtte økter (markert «forslag») → `Godkjenn alle` / per-økt `Godkjenn`/`Avslå`/`Rediger` → **godkjente økter låses inn i planen** |
| Klikk en økt | → inspector: økt-detalj (drills, mål, varighet, notat) → `Rediger` / `Flytt` (dra i Uke/Gantt) / `Dupliser` / `Slett` / `Start nå` |
| `Drill-bibliotek` | → inspector: søkbart bibliotek (kategori-chips) → dra drill inn i en økt → **drill lagt til økten** |
| `Periodisering` (Gantt) | → [legg til periode/fase over måneder] → `Lagre` → **fase-bånd i Gantt, økter knyttes til fasen** |
| `Koble mål` | → [velg mål] → **økten teller mot målets fremgang** |
| Turnering i Gantt | → [turnering-detalj] → `Forbered`: auto-genererer opptrapping-økter → **økter lagt inn før turneringen** |

### SONE 3 · ANALYSE (diagnose + all stats)
Canvas: faner **Diagnose · SG · TrackMan · Runder · Tester · Innsikt**. Tallet er helten.

| Knapp | Flyt |
|---|---|
| Diagnose-fane | → nivå (A–K) + 2–3 gap rangert etter slag-gevinst + `Lukk gapet`-knapp per gap → trykk → **Plan**-sonen med AI-forslag for nettopp det gapet |
| `SG-import` | → [lim/last opp SG-data] → [bekreft mapping] → `Importer` → **SG oppdatert, diagnose re-beregnet** |
| `Logg runde` | → runde-wizard (som I dag) → **runde + SG lagret** |
| `Importer TrackMan` | → [velg/last opp økt] → [shot-tabell forhåndsvis] → `Lagre` → **TrackMan-økt lagret, ballistikk synlig** |
| `Registrer test` | → [velg test fra batteri] → [skriv inn resultat] → `Lagre` → **test lagret, pyramide oppdatert** |
| `Sammenlign mot pro` | → [persentil-gauge + benchmark-bar vs Tour] → `Utfordring` → **konkret utfordring lagt til Plan** |
| Hull-innsikt | → [hull-for-hull-stripe + dispersjon] → trykk hull → detaljert spredning |

### SONE 4 · UTFØR (live + logg)
| Knapp | Flyt |
|---|---|
| `Start økt` (fra hvor som helst) | → [brief] → [aktiv fullskjerm: timer, drills, logg per rep ≤1 trykk] → `Pause`/`Avbryt` (trygt) → `Avslutt` → [sammendrag + feiring + «hjemmelekse»] → **logget** |
| `Treningslogg` | → kronologisk logg → trykk en økt → detaljer/notat |
| On-course logging | → [hull-for-hull slag-logg under runde] → `Fullfør` → **runde lagret** |

### SONE 5 · COACH
| Knapp | Flyt |
|---|---|
| `Send melding` | → [tråd] → skriv → `Send` → **melding sendt, coach varslet** |
| `AI-coach` | → [chat med caddie, leser dine data] → spør → svar med data-kontekst |
| `Videoanalyse` | → [coach-tegnede linjer/vinkler på video] |
| `Se coach-profil` | → [coach-detalj] → `Book time` → Booking-flyt |
| `Book økt` | → [velg coach/anlegg→dag/tid→bekreft] → Stripe (om betalt) → **booking bekreftet, i Plan** |

### SONE 6 · MÅL
| Knapp | Flyt |
|---|---|
| `Nytt mål` | → [type/verdi/frist] → `Lagre` → **mål i hub, koblbart til økter** |
| Klikk mål | → fremgang + koblede økter → `Rediger`/`Arkiver` |

### SONE 7 · MEG
Profil · Abonnement (`Oppgrader` → 300 kr/mnd Stripe-flyt) · Bookinger · Helse/Wellness · Utstyrsbag · Dokumenter · Varsler · Innstillinger (varsler/integrasjoner/personvern/AI/anlegg/apparater) · Hjelp · Sikkerhet. Hver `→` egen underside-flyt, alt nås fra Meg-sonen.

---

# DEL 3 · AgencyOS Workbench (coachens master-hub)

## Soner
1. **Cockpit** · 2. **Stall** · 3. **Spiller-Workbench** · 4. **Planlegge** · 5. **Gjennomføre** · 6. **Innboks** · 7. **Analyse** · 8. **Drift**

---

### SONE 1 · COCKPIT (I dag)
Canvas: «hvem trenger meg nå»-kø · dagens timeline · KPI-rad (aktive spillere, forespørsler, økter i dag, stall-SG, plan-etterlevelse).

| Knapp | Flyt |
|---|---|
| Kø-rad (spiller) | → **Spiller-Workbench** for den spilleren |
| `Tildel plan` | → [velg spiller→plan-mal/AI-forslag→tilpass→send] → **plan hos spilleren + varsel** |
| `Ny økt` | → [velg spiller/gruppe→type→tid→bygg] → **økt planlagt** |
| KPI-kort | → relevant **Analyse**-flate |

### SONE 2 · STALL
Canvas: spiller-tabell (rad ≥md → kort <md), grupper, talent-radar, pipeline.

| Knapp | Flyt |
|---|---|
| Spiller-rad | → **Spiller-Workbench** |
| `Ny spiller`/`Inviter` | → [skjema/invitasjons-lenke] → **spiller opprettet/invitert** |
| `Grupper` | → gruppe-liste → klikk → gruppe-detalj (medlemmer, felles plan) |
| `Talent-radar` | → radar-vis → klikk akse → spiller-pipeline for det området |

### SONE 3 · SPILLER-WORKBENCH (kjernen i coach-flyten — per spiller)
Canvas: spillerens diagnose + plan (samme zoom År/Uke/Økt som spilleren ser). Inspector: handlinger.

| Knapp | Flyt |
|---|---|
| `Tildel plan` | → [plan-mal eller AI-forslag basert på spillerens diagnose] → [tilpass økter] → `Send til spiller` → **periodene lastes hos spilleren + varsel** |
| `AI-foreslå` | → AI leser spillerens gap → forslag i canvas → `Godkjenn`/`Rediger` per økt → **låst inn** |
| `Ny økt`/`Rediger økt` | → som spillerens Plan-flyt, men coach lager for spilleren |
| `Registrer test` | → [velg test→spiller→resultat] → **test lagret, pyramide oppdatert** |
| `Send melding` | → tråd med spilleren → **sendt** |
| Faner: Profil · Fremgang · Tester · Tildel test · Plan | hver fane = panel i canvas |

### SONE 4 · PLANLEGGE
Treningsplaner · Plan-maler (`Ny mal`→bygg→lagre) · Drill-bibliotek (`Ny drill`→lagre) · Økter · Teknisk plan · Turneringer · Periodisering. Hver `→` bygg-flyt i canvas.

### SONE 5 · GJENNOMFØRE
Kalender · Bookinger & kapasitet (`Ny booking`→velg tjeneste/anlegg/tid→bekreft) · Anlegg (`Nytt anlegg`→LocationForm) · Tilgjengelighet (`Sett tilgjengelighet`→tids-rutenett→lagre) · Tjenester (`Ny tjeneste`→navn/varighet/pris) · TrackMan (`Importer økt`) · Opptak.

### SONE 6 · INNBOKS
| Knapp | Flyt |
|---|---|
| Forespørsel | → detalj → `Godkjenn`/`Avslå` → **status oppdatert, spiller varslet** |
| Godkjenning | → detalj → `Godkjenn`/`Avslå` |
| Melding | → tråd → `Svar` |

### SONE 7 · ANALYSE
Stall-analyse · Risiko · Lag-snitt · Tester · Runder · Compliance · Reach · Rapporter (`Generer rapport`→velg type→eksport CSV/PDF). Hver flate egen analyse-canvas.

### SONE 8 · DRIFT (kun ADMIN)
Økonomi · Team (`Inviter coach`→rolle) · Integrasjoner · AI-agenter · E-postmaler · Audit-logg · Innstillinger · (Intern: organisasjon/stats/moderering/portal-godkjenning).

---

# DEL 4 · Claude Design build-prompter

To prompter (én per produkt). Lim master-prompten + design-systemet inn FØRST, deretter denne. Be om én sone om gangen.

## Prompt — PlayerHQ Workbench
```
Design PlayerHQ Workbench som et MASTER-HUB (cockpit), ikke en side blant mange — spilleren gjør ALT herfra. Bruk design-systemets komponenter. Lyst tema. 375 + 1280, fire tilstander.

Shell: venstre sone-rail (7 soner: I dag·Plan·Analyse·Utfør·Coach·Mål·Meg) · hoved-canvas · høyre inspector (kontekst+handlinger). Mobil: bunn-nav for soner + fullskjerm-canvas + bunn-ark-inspector. Diagnose/tallet alltid synlig som anker.

Design hver sone som et arbeids-panel med fulle flyter (knapp → neste panel → resultat), per flyt-spec i WORKBENCH-MASTER-HUB.md del 2. Spesielt: «Ny økt» (type→dato→bygg med drills/mål→lagre→i planen), «AI-foreslå plan» (forslag→godkjenn per økt→låst inn), «Start økt» (brief→aktiv→sammendrag), «Logg runde», «SG-import», diagnose «Lukk gapet»→Plan. Ingen døde knapper — hver fører dit spec-en sier. Annotér hver knapp med destinasjon.
```

## Prompt — AgencyOS Workbench
```
Design AgencyOS Workbench som coachens MASTER-HUB (command center). Mørk terminal + lys-variant. 768 + 1280 + mobil-skuff, fire tilstander, tett cockpit.

Shell: venstre sone-rail (8 soner: Cockpit·Stall·Spiller-Workbench·Planlegge·Gjennomføre·Innboks·Analyse·Drift) · canvas · inspector. Kjernen er Spiller-Workbench: coachens versjon av en spillers plan med «Tildel plan», «AI-foreslå», «Registrer test», «Send melding».

Design hver sone med fulle flyter per WORKBENCH-MASTER-HUB.md del 3. Spesielt: Cockpit «hvem trenger meg nå»-kø → Spiller-Workbench, «Tildel plan» (mal/AI→tilpass→send→hos spiller+varsel), Innboks «Godkjenn/Avslå», Gjennomføre «Ny booking». Ingen døde knapper. Annotér hver knapp med destinasjon fra spec-en.
```

---

*Dette spec-et er fasit for Workbench-as-master-hub. Hver knapp har en destinasjon; hver funksjon en komplett flyt. Porting til kode følger samme flyter.*
