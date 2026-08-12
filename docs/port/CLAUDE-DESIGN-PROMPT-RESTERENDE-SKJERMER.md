> ⚠️ UTGÅTT (12.08.2026) — styrer ikke skjermbygging. Se docs/port/GYLDIGHET.md.

# Prompt til Claude Design (Sonnet 5) — resterende skjermer uten fasit

**Prosjekt:** AK Golf HQ · Claude Design `605a48cc`  
**Speil i repo:** `designsystem/paper/`  
**Kjør med:** Claude Sonnet 5 (Design / Artifacts-økt)  
**Oppdatert:** 2026-08-08

---

## Viktig før du limer inn

| Rolle | Ansvar |
|---|---|
| **Grok / kode-agent** | Porter **eksisterende fase1-fasit** til appen (visuell fidelity). Koder ikke ~300 uten fasit. |
| **Claude Design (denne prompten)** | Tegner **fase2/** for skjermer **uten** fasit. Godkjent wireframe = ny fasit. |
| **Anders** | Konsoliderings-ja, batch-godkjenning, sign-off |

**Holder det med bare «komponenter hvor»-wireframe-plan?**  
**Nei.** En plan uten tegnet HTML er ikke nok til pixel-eksakt app. Mønsterdokumentet tillater midlertidig polish, men regelen er: **ingen skjerm kodes som «ferdig Paper» uten tegnet fasit.**

**Skal Design tegne det som allerede er i zip/fase1?**  
**Nei.** `fase1/` er låst fasit. Design tegner bare **W2–W6** (manglende). Kode-agenten porterer fase1.

---

## PROMPT — kopier alt under streken til Claude Design

---

```
# OPPDRAG: AK Golf HQ — tegn resterende PlayerHQ/AgencyOS-skjermer (fase2)

Du er senior produkt-designer i Claude Design for **AK Golf HQ**.
Du jobber i prosjekt **605a48cc** (Claude Paper).

## MÅL
Tegne **full Paper-komposisjon** (ikke gråboks) for alle app-skjermer som **mangler** fasit i `fase1/`.  
Hver godkjente fil i `fase2/` blir **fasit** som kodes 1:1 i Next.js-appen.

## IKKE GJØR
- Ikke omskriv eller erstatt filer i **fase1/** (de er låst).
- Ikke finn opp ny fargepalett, typografi eller radius — bruk **kun** tokens fra `_foundation.css` / `akhq-tokens` (Paper v3.1).
- Ikke legg «Én ting nå» (clay `#D97757`) på mer enn **én** primær handling per skjerm.
- Ikke bruk Presis grønn/lime (`#005840`, `#D1F843`) til logo, CTA eller rail.
- Ikke fyll demo med fabrikkerte SG/score utover det som er ærlig i fasit-kanon (Øyvind Rohjan-demo er OK i wireframe).
- Ikke tegn redirects / utgåtte ruter (se konsolidering).

## DESIGN-SYSTEM (LÅST)
- Surfaces: `--bg #faf9f5`, `--surface #fff`, `--soft #f0eee6`, `--border #e8e6dc`
- Text: `--fg #141413`, `--muted #5e5d59`
- Rail alltid mørk: `#141413` · rail-on `#faf9f5` · logo-dot på mørk `#D97757`
- Radius app: 12px · Type: Poppins (UI) + Lora (brød) + IBM Plex Mono (tall)
- Tom-tilstand: soft + **dashed** border + Lora body 13.5–14
- Empty actions = ink/ghost — **ikke** clay
- Viewport: mobil **430px** (telefonramme demo-only bort ved integrasjon) + desktop der ruten er desktop-kritisk
- `data-od-id` på alle interaktive elementer
- Tilstander **minst**: Suksess + Tom. Laster/Feil kan følge mønster-standard hvis ikke unik.

## METODE PER BØLGE (obligatorisk rekkefølge)

### Steg 0 — Les speilet
Bruk eksisterende fase1-referanser:
- playerhq-chat-desktop/mobil, playerhq-plan, playerhq-analyse, playerhq-meg
- workbench-desktop/mobil
- agencyos-konsoll-desktop/mobil, spillere, innboks, kalender
- innlogging, fangstsheet

### Steg 1 — Konsolideringsforslag (før tegning)
For området: list foreslåtte **kutt/sammenslåinger** (faner under eksisterende hub vs egen rute).  
Output en tabell:
| Rute i dag | Forslag | Begrunnelse |
Vent ikke på svar midt i batch hvis du er i autonom batch-modus: prioriter **hub + sheet + detalj** fremfor 10 nesten-like lister.

### Steg 2 — Mal-tildeling
Hver gjenværende skjerm: mal (list/detail/form/dashboard/sheet/wizard) + hvilke fase1-komponenter gjenbrukes.

### Steg 3 — Tegn full Paper HTML
Lag filer under **fase2/** med samme stil som fase1:
- Inkluder foundation tokens verbatim
- 4 tilstander der unikt nødvendig; ellers Suksess+Tom
- Lys tema default; mørk der produkt krever det
- Norsk bokmål UI-tekst
- Navn: `fase2/<område>/<kort-navn>.html`

### Steg 4 — Leveranse-manifest
For hver fil:
| Fil | Ekte rute (forslag) | Mal | Tilstander | Én ting nå | Merknad |

## BØLGE-REKKEFØLGE (start her)

### BATCH W2 — PlayerHQ Analysere-dybde + Hjem-rest (FØRST)
**Allerede har fasit (ikke tegn på nytt):**  
`/portal/analysere` hub (`playerhq-analyse.html`)

**Tegn undersider / dybde (konsolider hardt — helst sheets/faner, ikke 40 ruter):**
1. Hull-analyse (i dag `/portal/analysere/hull`) — detalj/sheet fra hub
2. Gameplan-visning spillerside (hvis egen flate)
3. TrackMan-import / session-liste (deep mode)
4. Trenings-historikk filter-sheet
5. Test-resultat detalj (hvis ikke dekket av W1 test)
6. Hjem-rest: fangst-full, system-meldinger, kø-indikator (hvis egen chrome)

**Konsolideringsmål W2:** fra ~40 «skjermer» → **≤12 tegnede flater**.

### BATCH W3 — Meg + Booking + Coach + Talent
Referanse: `playerhq-meg.html`, `playerhq-booking.html`
Tegn: innstillinger-seksjoner, abonnement, samtykke, coach-melding, talent-profiler, booking-flyt-steg som mangler.

### BATCH W4 — AgencyOS-rest
Referanse: agencyos-konsoll, spillere, spillerprofil, workbench
Tegn stall-undersider, planlegge-coach, innsikt, admin-innstillinger-dybde.  
**Konsolider:** mange admin-ruter → faner i hub.

### BATCH W5 — Marketing + Auth-rest + Forelder + System
Referanse: innlogging, foreldreportal, booking
Tegn manglende auth-steg, feiltilstander, marketing-landing kun hvis ikke allerede brandet.

### BATCH W6 — WANG + GFGK junior
Egen telling først: list ruter under `team-wang` / `gfgk-junior`, foreslå om de deler PlayerHQ-shell eller eget chrome.

## KVALITETSKRAV (stopp-kriterier per fil)
- [ ] Kun Paper-tokens (ingen tilfeldig hex utenfor :root)
- [ ] Maks én clay primary CTA
- [ ] Tom-tilstand ærlig (ikke «lorem» med fake SG)
- [ ] `data-od-id` på knapper/lenker/tabs
- [ ] Logo: on-ink på mørk rail, on-paper på lys flate (se ak-golf-logo-bruk)
- [ ] Safe-area på mobil
- [ ] Samme 4-nav PlayerHQ: I dag · Plan · Analyse · Meg (der det er PlayerHQ)

## OUTPUT-FORMAT I CHATTEN
1. Kort konsolideringsforslag for batchen
2. Fil-liste som opprettes
3. Deretter generer HTML-filene
4. Avslutt med manifest-tabell

## START NÅ
Begynn med **BATCH W2**.  
Første leveranse i denne økten: konsolideringsforslag + minst **6** fase2-HTML for Analysere-dybde (Suksess+Tom).  
Ikke spør om tokens — de er låst. Spør kun hvis en rute er uklar mot eksisterende hub.
```

---

## Etter Claude Design-økten

1. Anders batch-godkjenner  
2. Speil filer inn i `designsystem/paper/fase2/…`  
3. Oppdater `docs/port/fasit-liste-paper.md`  
4. Kode-agent porterer med skjermbilde-gate  

## Hva kode-agenten (Grok) gjør parallelt

| Spor | Handling |
|---|---|
| A | Visuell fidelity-pass på **fase1** som allerede er i app (Hjem → Plan → Analyse → Meg → Live → Workbench → AgencyOS) |
| B | Logo/chrome/tokens app-wide |
| C | **Venter** på fase2 før ~300 nye flater kodes som «Paper-ferdig» |

