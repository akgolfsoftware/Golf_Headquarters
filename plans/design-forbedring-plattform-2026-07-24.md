# Design-forbedring hele plattformen — diagnose + plan (2026-07-24)

> **Metode:** ak-design-evolution (diagnose før kode). Mobbin MCP: **nei** (ikke koblet).
> **Kontekst:** Designsystem-pass (PR #127) og KS-1 er i main. Dette er *anvendelsen*
> skjerm for skjerm — ikke nytt tokensett.
> **Uten «GO V1»:** kun denne planen. Implementasjon starter når Anders sier GO.

---

## 1. Nå (ærlig)

| # | Bra / svakt |
|---|---|
| 1 | **Systemet under er sterkt** — tokens, motion-katalog, BunnArk-kontrakt, AA-lys, ordbok i labels |
| 2 | **PlanV2 ≈ ferdig B-pakke** — KPI → én CTA → i dag → ghost Workbench |
| 3 | **Analyse bryter B på første blikk** — default-fane er Trening, ikke Form/SG; 2+ trykk til «Planlegg» |
| 4 | **Hjem dobler primær CTA** når det ikke finnes økt i dag (nesteHandling + Workbench) |
| 5 | **AgencyOS-cockpit er grøt** — «Én ting NÅ» finnes, men drukner under KPI/Live/Innboks/Stall |
| 6 | **HjelpTips ~35 % PlayerHQ / ~11 % AgencyOS** — «?»-regelen brytes systematisk |
| 7 | **SerieMeny** er egen overlay uten BunnArk-kontrakt (fokus-felle/scroll-lås) |

---

## 2. Tre retninger (maks 3)

| # | Retning | Hva spilleren/coachen gjør på 10 s |
|---|---|---|
| **1 ★** | **V1 Dommer-finpuss** — Hjem + Plan + Analyse til 5-sek + én CTA + «?» | Spiller åpner appen → ser form → trykker Start/Planlegg. Coach merker ikke noe ennå. |
| 2 | **V3 Coach-dag først** — cockpit NÅ øverst, stall rad→detalj, SerieMeny→BunnArk | Coach ser én prioritet og tømmer kø — spilleren merker lite. |
| 3 | **V6 Craft overalt** — HjelpTips-pass + overlays + axe | Appen føles «ferdig» og tilgjengelig, men flyt-problemene i Analyse/Cockpit består. |

**Anbefaling: retning 1 (GO V1).** Plan er nesten ferdig; Analyse er det største gapet mot låst B-pakke; Hjem er en liten CTA-fiks. Deretter V3, deretter V6.

---

## 3. GO V1 — kirurgisk sjekkliste (etter GO)

### Analyse (`AnalysereV2.tsx`) — størst impact
1. Default-fane → `"sg"`; SG først i fanelisten.
2. Tom SG: én `CTAPill` «Logg runde» (vei videre).
3. Fjern synlig `ARG`/`APP`/`OTT` som `code=` i `FordelingRad` (norske labels allerede OK).
4. `HjelpTips` på Trening-volum + etterlevelse; TomTilstand med CTA på TrackMan/Tester.

### Hjem (`HjemV2.tsx`)
5. Når ingen økt i dag: **kun én** primær `CTAPill` (nesteHandling *eller* Workbench — den andre ghost/tekst).
6. `HjelpTips` på dagens pyramide-akse.

### Plan (`PlanV2.tsx`) — finpuss
7. `HjelpTips` på uke-% og «Fra form (SG)».
8. Tom uke: ghost-CTA til Workbench inne i kortet.

**Ferdig når:** Anders består 5-sekunders-testen på telefon for alle tre uten å tenke. MASTER-haker oppdateres i samme commits.

---

## 4. Etter V1 (rekkefølge)

| GO | Fokus |
|---|---|
| **GO V3** | Cockpit: NÅ øverst. Stall: rad = detalj, Workbench = CTA; sorter «trenger deg». Godkjenninger: primær følger køen. SerieMeny → BunnArk. |
| **GO V2** | Live + runde: tommel-soner, oppsummering med én neste handling. |
| **GO V6** | HjelpTips-dekning ★ → 100 %, axe-smoke, navigasjonsovergang. |
| **GO V4 / V5** | Booking/betaling · marketing/stats (egen bølge). |

---

## 5. Anti-mål

- Ikke nytt farge-system / mørk PlayerHQ  
- Ikke 361-skjermers redesign-batch  
- Ikke kopiere Whoop/Linear-skin — kun flyt-mønster  
