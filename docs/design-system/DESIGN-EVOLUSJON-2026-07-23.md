# Design-evolusjon — veien mot verdensklasse

**Dato:** 2026-07-23  
**Metode:** ak-designekspert v8 + akgolf-design-system + mesterens mønstre + Mobbin-kategori-research (fitness/sports).  
**Mobbin MCP:** *ikke koblet i Grok i dag* — se nederst hvordan du kobler. Research basert på Mobbin-kategorier + etablerte mønstre (Whoop/Strava/Linear/Apple).

---

## 1. Hvor vi er (ærlig)

| Lag | Status | Karakter |
|---|---|---|
| Tokens + merkevare | Låst (forest/lime/cream) | 9/10 |
| Skjerm-gate PHQ + AgencyOS | 0 GAP redesign | 8/10 |
| B-pakke (Hjem/Plan/Analyse) | I app | 8/10 |
| Flyt (én jobb → én inngang) | Sterk i kjerne | 7,5/10 |
| Craft (motion, tommel, empty, 5s) | Ujevn på tvers | 6,5/10 |
| Verdensklasse *følelse* end-to-end | Ikke bevist med ekte bruk | 6–7/10 |

**Konklusjon:** Fundamentet er profft. Neste steg er **ikke** nytt designsystem — det er **5 flaggskip-flyter** til «5 sekunder + 1 trykk»-nivå, med mønstre lånt fra beste apper (ikke kopiert skin).

---

## 2. Hva verdensklasse betyr her (mål)

1. **5 sekunder:** standpunkt + neste steg  
2. **1–2 trykk** til primærjobb  
3. **Én grønn handling** per skjerm  
4. **Tom tilstand = onboarding**, aldri blindvei  
5. **Data → dom → handling** (aldri tall uten mening)  
6. **ADHD-vennlig:** én ting om gangen, null sjargong uten «?»

---

## 3. Mønstre å låne (Mobbin fitness/sports + mesterbibliotek)

### PlayerHQ (spiller, alltid lys)

| Jobb | Lån fra | Konkret for AK |
|---|---|---|
| «Hvordan er formen?» | Whoop / Oura | Én score/hero øverst → trend → «hvorfor» → én CTA |
| «Hva trener jeg i dag?» | Strava / Nike Training | Stor «Start» i tommel-sone; plan som kort, ikke tabell |
| Live økt / runde | Apple Fitness | Fullskjerm, store tall, minimal chrome, auto-fremdrift |
| Progresjon / talent | Duolingo (uten skyld) | Feire egen historikk; aldri «du mistet streak»-straff |
| Tom uke | Notion | «Ingen økt ennå» + én knapp «Åpne plan» |

### AgencyOS (coach, mørk default)

| Jobb | Lån fra | Konkret for AK |
|---|---|---|
| Dagens prioriteter | Linear | Kort «NÅ»-liste, keyboard/cmd, optimistisk lagring |
| Stall / 360 | Linear issues + Notion DB | Rad = spiller; hover = handlinger; filter før full side |
| Workbench uke | Notion calendar + Linear | DnD, ghost under drag, iPad-grip alltid synlig |
| AI-forslag | Linear triage | Godkjenn/avvis i kø — aldri gjemt under 4 menyer |
| Booking/betaling | Stripe | Beløp + vilkår før bekreftelse; tydelige tilstander |

### Mobbin-kategorier å scrolle (når MCP/abonnement er på)

1. [Health & Fitness mobile](https://mobbin.com/explore/mobile/app-categories/health-fitness) — Home Dashboard, Logging  
2. [Sports mobile](https://mobbin.com/explore/mobile/app-categories/sports) — Activity dashboard  
3. Flows: *Logging & Tracking*, *Creating account*, *Favoriting*  
4. UI: Progress indicator, Chip, FAB, Card, Tab bar  

**Regel:** Lån **struktur og trykk-rekkefølge**. Behold AK-farger, fonter, B-pakke.

---

## 4. Anbefalt utvikling — 6 bølger

### Bølge V1 — Dommer-finpuss (1–2 uker) ★ anbefalt først

Kun Hjem, Plan/Workbench-spiller, Analyse. Mål: **du** klarer 5-sekunders-testen på telefon uten å tenke.

- [x] Hero: form-tall + trend + status på 300 ms  
- [x] Én lime/forest-CTA, ingen konkurrerende grønne knapper  
- [x] Tom tilstand med neste steg på alle tre  
- [x] «?» på SG/ARG/nærspill der det trengs  

**Ferdig når:** Du åpner appen og vet «hva nå» før du scroller.  
**Levert 2026-07-24 (GO V1):** Analysere default SG + Logg runde; Hjem én primær CTA; Plan HjelpTips + tom-uke ghost.

### Bølge V2 — Live + runde (1 uke)

- [ ] Live økt: tommel-soner, store tall, pause/lagre  
- [ ] Runde hurtigmodus: verifisert på bane (færre trykk)  
- [ ] Oppsummering: SG + én neste handling (ikke 6 lenker)

### Bølge V3 — Coach-dag (1–2 uker)

- [ ] Cockpit: AI-dispatch + «NÅ» = eneste prioritet  
- [ ] Stall: sortering etter «trenger deg»  
- [ ] Godkjenninger: batch + tydelig diff  
- [ ] Workbench iPad: DnD smoke (deg)

### Bølge V4 — Booking & betaling (1 uke)

- [ ] Stripe-nivå tillit: pris synlig, feil på norsk  
- [ ] Booking: maks steg, status (venter/bekreftet/avlyst)

### Bølge V5 — Marketing + stats (egen bølge)

- [ ] akgolf.no: samme hierarki som B (hero + én CTA)  
- [ ] Stats: status-bar + CTA (allerede delvis)

### Bølge V6 — Craft-system (løpende)

- [ ] Motion 150–250 ms, reduced-motion  
- [ ] Hover-popover standard (interaksjonsstandarder)  
- [ ] Komponent-lab: alle states for 10 nøkkel-komponenter  

---

## 5. Hva du IKKE skal gjøre

1. Nytt farge-system eller «mørk PlayerHQ»  
2. 361 unike redesigns  
3. Gamification som straffer junior  
4. Dashboard med 8 like kort  
5. Modal inni modal  
6. Låne Whoop/Strava-skin (mørk neon) — bare flyt-mønster  

---

## 6. Suksessmål (målbare)

| Mål | Måling |
|---|---|
| 5-sekunders-test | 5 av 5 nøkkel-skjermer bestått av deg |
| Trykk til start økt | ≤ 2 fra Hjem når økt finnes |
| Trykk til lagre hull (hurtig) | ≤ 2 (velg score + lagre) |
| Coach: se AI-kø | ≤ 1 trykk fra cockpit |
| Spiller ser aldri DRAFT | Smoke + kode-gate |

---

## 7. Mobbin MCP — status og hvordan koble

**Config:** Lagt inn i `~/.grok/config.toml`:

```toml
[mcp_servers.mobbin]
url = "https://api.mobbin.com/mcp"
enabled = true
```

**URL:** `https://api.mobbin.com/mcp` (Streamable HTTP + OAuth)  
**Krever:** Betalt Mobbin-plan + innlogging i nettleser ved første bruk.

### Status 2026-07-23

| Steg | Status |
|---|---|
| Server i config | ✅ |
| Server starter | ✅ |
| OAuth / innlogging | ❌ **må du gjøre** (handshake feiler til du autoriserer) |

### Du gjør dette én gang (Grok)

1. I Grok: skriv **`/mcps`** (eller Ctrl+L → MCP Servers)  
2. Finn **mobbin**  
3. Velg **Authenticate** / logg inn  
4. Nettleser åpner → logg inn med **Mobbin-kontoen** din  
5. Trykk **r** i MCP-modal for å refreshe  
6. Sjekk: `grok mcp doctor mobbin` → skal bli grønn  

**Alternativ CLI** (hvis Grok støtter det i din versjon):

```bash
grok mcp add --transport http mobbin https://api.mobbin.com/mcp
# deretter /mcps → Authenticate
```

Tokens lagres lokalt under `~/.grok/mcp_credentials.json` (ikke i git).

### Etter autorisering

Si i chat f.eks.:  
«Søk Mobbin for home dashboard fitness-apper»  
Skill `ak-design-evolution` bruker da MCP først.

---

## 8. Skill

Se: `~/.claude/skills/ak-design-evolution/SKILL.md`  
(og speil i HQ hvis ønskelig)

---

## 9. Anbefaling til deg nå

**Én ting:** Bølge **V1** — finpuss Hjem + Plan + Analyse til «verdensklasse 5 sekunder».  
Ikke start marketing før de tre føles uimotståelige.

Si **«GO V1»** når du vil at koden skal følge denne bølgen.
