# Dagsplan — designe resterende skjermer (hele plattformen)

**Dato:** 2026-07-22  
**Modus:** Automatisk godkjenning — AI går til neste oppgave uten å vente  
**Stopp kun ved:** hard feil, manglende secrets, eller du skriver `stopp`

---

## Mål i dag

1. **Design:** Alle produktflater har oppdatert hi-fi + B-følelse (familie-mal, ikke 361 unike kunstverk).  
2. **Kode (prioritet):** PlayerHQ du bruker mest = B i app der det mangler.  
3. **AgencyOS / Forelder / Auth:** Design-boards fullført + 1–3 flaggskip i kode hvis tid.  
4. **Lagring:** Commit underveis + stor commit på slutten.

**Ikke realistisk i dag:** Hver av 361 sider pixel-perfekt i React.  
**Realistisk:** Design 100 % dekning · kode på kjerne + bølge 2–3.

---

## Allerede ferdig (hopp over)

| Type | Status |
|---|---|
| FASIT + B-pakke (Hjem/Plan/Analyse) | Låst |
| Inventar 361 + familie-boards | Finnes |
| App B: Hjem, Plan, Analyse, Gjør, Live, Meg, Fysisk, delvis Booking/Kalender/Økt/Drill | Delvis |
| Localhost DB | Kan feile — design-HTML + prod-URL er fallback |

---

## Automatisk flyt (regler)

1. Fullfør oppgave → marker ferdig → start neste uten spørsmål.  
2. Typecheck etter kode-endringer (ikke blokker hele dagen på rød støy utenfor berørte filer).  
3. Ved usikkerhet: velg **B-pakke** (oversikt + én grønn CTA).  
4. Hver 90 min: mini-commit hvis mye endret.  
5. Du kan når som helst: `stopp` · `status` · `commit` · `bare design` · `bare kode`.

---

## Blokker (hele dagen)

### Blokk 0 — Oppsett (15 min)
- [ ] 0.1 Bekreft designmappe + index  
- [ ] 0.2 Oppdater `RETNING-B-PAKKE` / fremdrift  
- [ ] 0.3 Velg leveransekanal: **HTML-boards** (alltid) + **kode** der DB funker / prod for manuell sjekk  

### Blokk 1 — Design-system konsistens (45–60 min)
- [ ] 1.1 STANDARD.html + FASIT: B overalt (PlayerHQ lys, AgencyOS mørk)  
- [ ] 1.2 `families-hifi.html`: 8 familier lys + mørk, B-hierarki  
- [ ] 1.3 Felles «skjermkort»-mal (jobb 5s · CTA · tilstander)  

### Blokk 2 — PlayerHQ design (alle 131) (1,5–2 t)
- [ ] 2.1 Oppdater `board-playerhq.html` mot B (hub/liste/detalj/live/wizard)  
- [ ] 2.2 Flaggskip fullskjerm: Workbench desktop, Runde, Coach-hub spiller  
- [ ] 2.3 Inventar: hver PlayerHQ-rad peker på riktig board + familie  
- [ ] 2.4 Åpne index for visuell sjekk (auto)  

### Blokk 3 — AgencyOS design (100) (1,5–2 t)
- [ ] 3.1 `board-agencyos.html` mørk + B-idé (tilstand 5s · én hovedhandling)  
- [ ] 3.2 Flaggskip: Stall, spiller 360, plan-bygger, kalender coach  
- [ ] 3.3 Inventar AgencyOS 100 % hi-fi-ref  

### Blokk 4 — Forelder + Auth + System (1 t)
- [ ] 4.1 `board-forelder.html` (lys, enklere språk)  
- [ ] 4.2 `board-auth-system.html` (login, onboarding, feil, marketing-skjermer)  
- [ ] 4.3 Inventar 100 % for disse produktene  

### Blokk 5 — Kode-bølge PlayerHQ (2–3 t, parallel der mulig)
Rekkefølge (auto):
1. Booking full flyt  
2. Runde live/logg  
3. Driller-liste  
4. Analyse øvrige faner  
5. Gameplan / DataGolf (lett)  
6. Coach-meldinger spiller  
7. Meg undersider (profil, abonnement, innstillinger-hub)  
8. Workbench desktop forenkling (kun hvis stabil DB)

**Fallback hvis localhost DB død:** bare design-HTML + dokumenter kode-gap.

### Blokk 6 — Kode-bølge AgencyOS flaggskip (1–2 t hvis tid)
- [ ] 6.1 Stall  
- [ ] 6.2 Spiller 360 (hode + CTA)  
- [ ] 6.3 Plan-bygger inngang  

### Blokk 7 — Avslutning (45 min — må skje)
- [ ] 7.1 Inventar: 361 rader med hi-fi_status  
- [ ] 7.2 `KVELD-RAPPORT` / dagsrapport: design % · kode % · gap  
- [ ] 7.3 Commit + push  
- [ ] 7.4 Åpne design-index i Chrome  

---

## Suksess i kveld

| Krav | Mål |
|---|---|
| Design alle produkter | Boards oppdaterte + inventar 100 % |
| PlayerHQ kode B | Kjerne + blokk 5 minst 5 flater |
| AgencyOS | Design komplett; kode 0–3 flaggskip |
| Auto-flyt | Ingen manuell GO mellom oppgaver |
| GitHub | Alt committed |

---

## Kommandoer for deg

| Du skriver | Effekt |
|---|---|
| **GO** / **start** | Kjør hele planen med auto-neste |
| **stopp** | Pause, status |
| **status** | Hvor vi er |
| **commit** | Lagre nå |
| **bare design** | Hopp over kode-blokker |
| **bare kode** | Hopp over design-boards |

---

## Start

Skriv **GO** for å kjøre med automatisk neste oppgave.
