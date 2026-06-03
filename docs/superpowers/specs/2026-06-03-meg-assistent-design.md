# Meg-assistenten — Sovereign Personal OS for Anders

**Dato:** 2026-06-03
**Status:** Design godkjent — klar for byggeplan
**Eier:** Anders Kristiansen (eneste bruker)

---

## 1. Hva dette er (i klartekst)

En personlig assistent som fungerer som Anders' eksterne hjerne. Han snakker inn
tanker, logg og spørsmål fra hvor som helst (helst via Apple Watch), assistenten
forstår hva det er, lagrer det i en database **han selv eier**, og svarer + dytter
ham proaktivt. Hver morgen får han én brief som blander hans egne tall med dagens
viktigste fra AgencyOS. Over tid lærer den hans mønstre.

Kjerneprinsipp fra kildematerialet: **suverent minne** — Anders eier dataene, de
ligger adskilt fra alt annet, og de kan flyttes mellom AI-modeller uten å forsvinne
i en "black box".

---

## 2. Beslutninger (låst i brainstorming 2026-06-03)

| Tema | Valg | Begrunnelse |
|---|---|---|
| Hvor man ser det | Skjult `/meg`-seksjon **inni** AK Golf HQ | Gjenbruker design, auth og hosting Anders alt har. Ingen ny app å vedlikeholde. |
| Hvor dataene bor | **Egen, separat Supabase-database** | Suverenitet + hardt skille fra kundedata. Private data kan aldri lekke via golf-plattformen. |
| Kanal inn/ut | **Telegram-bot** | Gratis, ferdig på minutter, ingen business-verifisering, ingen kostnad per melding, takler tale + foto direkte. |
| Stemme → tekst | **Wispr Flow** på Anders' enhet + Apple Watch-snarvei | Transkripsjon skjer klient-side. Backend mottar ferdig tekst — ingen Whisper å bygge/drifte. |
| MVP-kjerne | Chat + logg + minne + morgenbrief + kveldsjournal | Lavest friksjon, mest verdi dag 1. |
| MVP-ferdigheter (oppå kjernen) | Mikrostegs-nedbryting · "Du lovet/glemte X" · Foto/stemme mat-logging · Personlig CRM-nudge | Alle deler samme motor; ikke separate systemer. |
| Moduler (ADHD, søvn, kosthold, investering, mål) | Starter som **tagger** i loggen | Unngår fire nye systemer. Egne skjermer bygges én og én senere. |

**Bevisst frarådet** (fra kildens master-prompt, ikke tatt inn):
- Egen separat React-app → nei, vi bruker eksisterende Next.js 16.
- Google Sheets for økonomi nå → nei, YAGNI for MVP.
- Bygge CRM + Habit + Brain + Journal alt på en gang → nei, ryggrad først.
- Whisper i backend → unødvendig, Wispr Flow gjør det klient-side.

---

## 3. Målgruppe, personvern, sikkerhet (dokumentert)

**Målgruppe:** Én bruker — Anders Kristiansen. Systemet er bevisst **single-tenant**.
Ingen deling, ingen invitasjoner, ingen multi-bruker. Dette forenkler alt.

**Personvern:**
- **Dataeierskap:** Anders eier 100 %. Egen Supabase-database, egen prosjekt-nøkkel.
- **Tilgang:** Kun Anders. Ingen kunde, spiller eller annen coach når dataene — ikke
  engang ved feil i golf-plattformen, fordi det er en fysisk separat database.
- **Tredjeparter som prosesserer data** (dokumenteres for åpenhet): Telegram (melding
  i transitt), Wispr Flow (tale → tekst på enhet), Anthropic Claude API (forstår/svarer),
  Supabase (lagring). Ingen andre.

**Sikkerhet:**
- **Kryptering:** Supabase krypterer at-rest; all trafikk over TLS.
- **Autentisering:**
  - Telegram-webhook beskyttet med hemmelig token (`X-Telegram-Bot-Api-Secret-Token`).
  - **Allowlist på Telegram chat-id** — boten svarer KUN Anders' egen chat-id. Alle
    andre avsenders meldinger forkastes.
  - Supabase service-role-nøkkel brukes kun server-side (route handler), aldri i nettleser.
  - `/meg`-rutene i AK Golf HQ låst til Anders' bruker-id.
- **Revisjonsspor:** Hver melding inn og hver handling boten gjør lagres (`me_conversation`
  + `me_log`), så Anders alltid kan se hva som er lagret og hvorfor.

---

## 4. Arkitektur (flyten, enkelt)

```
[Apple Watch-knapp]
      │  Anders snakker
      ▼
[Wispr Flow]  tale → tekst (på enheten)
      │  sender tekst (eller foto)
      ▼
[Telegram-bot]
      │  webhook (m/ hemmelig token + chat-id-sjekk)
      ▼
[AK Golf HQ — /api/meg/telegram]   ◄── route handler i eksisterende Next.js
      │  1. verifiser avsender
      │  2. Claude forstår: hva slags melding er dette?
      │  3. lagre i egen Supabase
      │  4. evt. utfør ferdighet (nedbryting, mat-estimat ...)
      │  5. svar tilbake i Telegram
      ▼
[Egen Supabase-database]  ◄── suverent minne, kun Anders
      ▲
      │  leses av
[/meg-skjerm i AK Golf HQ]   dashboard: brief, logg, grafer
[Morgenbrief-jobb (cron)]    henter Anders' tall + AgencyOS-tall → Telegram + skjerm
```

**To databaser, bevisst:** AK Golf HQ sin egen Postgres (Prisma 7) for kunde/golf-data,
OG en separat Supabase for Meg-data. `/meg`-koden snakker med Meg-databasen via en egen
klient (separat connection-string), ikke via den eksisterende Prisma-klienten.

---

## 5. Datamodell (egen Supabase)

Få tabeller, bevisst. Modulene er tagger, ikke tabeller.

- **`me_log`** — én rad per ting som logges.
  `id, created_at, kind, text, value_num, value_unit, tags[], source, raw_ref, meta_json`
  - `kind`: `sleep | training | mood | nutrition | finance | goal | task | note | person`
  - `source`: `telegram_text | telegram_voice | telegram_photo | web | system`
  - `raw_ref`: peker til evt. originalfoto/lyd i Supabase Storage.

- **`me_conversation`** — hele chat-historikken (komplett, søkbart minne).
  `id, created_at, role (user|assistant), content, tokens, related_log_id`

- **`me_brief`** — daglige briefer som er sendt.
  `id, created_at, type (morning|evening), content_md, agencyos_snapshot_json`

- **`me_goal`** — mål som følges over tid.
  `id, created_at, title, status, target_date, progress_note, last_reviewed_at`

- **`me_task`** — oppgaver + mikrosteg (for nedbryting og "du lovet X").
  `id, created_at, title, parent_id, status, due_at, promised_to, est_minutes, source_log_id`

- **`me_person`** — lett personlig CRM (for nudge).
  `id, name, relation, last_contact_at, context_note, next_nudge_at`

- **`me_memory`** — komprimerte fakta/beslutninger (IKKE rå chat).
  `id, created_at, fact, category, confidence, source_log_ids[]`
  Dette er nøkkelen mot "memory bloat": vi destillerer logg til korte fakta her.

**Søk:** hybrid — vanlig nøkkelord + semantisk (pgvector-embedding på `me_log.text`
og `me_memory.fact`) så "hvordan har søvnen vært i juni?" finner riktig på tvers av måneder.

---

## 6. MVP-omfang

### Ryggrad (alltid med)
1. **Telegram inn/ut** med chat-id-allowlist + hemmelig token.
2. **Forstå & lagre:** Claude klassifiserer melding → `kind` + `tags` → `me_log`,
   og hele meldingen → `me_conversation`.
3. **Svar:** boten bekrefter/svarer i samme tone som Anders skriver.
4. **Spør historikken:** "hvordan har X vært?" → hybrid-søk → svar.
5. **Morgenbrief (cron):** Anders' tall siste døgn + dagens AgencyOS (se §7) → Telegram + `/meg`.
6. **Kveldsjournal:** kveldsprompt → fri oppsummering lagres → mater mønsteranalyse senere.
7. **`/meg`-skjerm:** dagens brief, logg-historikk, enkle trendgrafer (søvn/trening/humør).
8. **Minne-komprimering:** jobb som destillerer logg → `me_memory` (unngår bloat).

### Fire ferdigheter (oppå ryggraden)
- **Mikrostegs-nedbryting:** stor oppgave → 3-4 deloppgaver i `me_task` med tidsestimat.
- **"Du lovet / du glemte X":** fanger løfter (`promised_to`, `due_at`) og forfall, dytter før det smeller.
- **Foto/stemme mat-logging:** Telegram-foto → Claude vision estimerer → `me_log kind=nutrition`.
- **Personlig CRM-nudge:** folk Anders nevner → `me_person`; ukentlig liste over hvem å kontakte + åpningslinje.

### ADHD-prinsipper innebygd (gjelder hele MVP)
- Lavest mulig friksjon (snakk, ikke skjemaer).
- Lagvise, vedvarende påminnelser — gjentas til gjort, ikke ett enkelt varsel.
- Ingen straff for hull (streaks som ikke kjefter).
- Mikrosteg framfor store oppgaver.

---

## 7. AgencyOS-synk

Morgenbriefen og `/meg`-skjermen trekker inn dagens viktigste fra AgencyOS
(`/admin/agencyos` i samme repo). Siden Meg-koden lever i samme Next.js-app, leses
AgencyOS-data direkte via eksisterende server-side data-lag (Prisma mot golf-databasen)
— et lite, lesende "snapshot" (spillere som trenger oppfølging, dagens økter, varsler),
lagret som `me_brief.agencyos_snapshot_json`. Ingen kopiering av kundedata til Meg-databasen
utover dette dags-snapshotet i briefen.

---

## 8. Inndata-oppsett (Anders' enhet — oppskrift, ikke kode)

Dokumenteres i onboarding:
1. Opprett Telegram-bot via @BotFather → få bot-token.
2. Finn Anders' egen chat-id (allowlist).
3. Wispr Flow installert på Mac + iPhone.
4. **Apple Watch-snarvei** (Apple Shortcuts): "Snakk → Wispr Flow dikterer → send tekst
   til Telegram-boten". Trykk på klokka, snakk, ferdig — uten å ta opp telefonen.

---

## 9. Minne & læring over tid

- **Komprimer, ikke lagre rått:** rå chat i `me_conversation`, men destillerte fakta i
  `me_memory`. Mønsteranalyse kjører mot `me_memory` + `me_log`, ikke hele råloggen.
- **Vindusminne:** siste N meldinger holdes ferskt i kontekst; eldre hentes via søk ved behov.
- **Mønster-rapport (senere lag):** ukentlig/månedlig jobb som ser sammenhenger
  ("mindre produktiv når søvn < 6t").
- **Strategisk rådgiver (senere lag):** "basert på historikken min, hva bør jeg gjøre nå?"

---

## 10. Onboarding + referansemateriale

Første gang `/meg` åpnes: kort intro + **NotebookLM-YouTube-video** innebygd.
**Åpent punkt:** Anders gir lenken → settes inn (plassholder til da).

---

## 11. Senere-kart (bygges én og én, ingenting glemmes)

1. Egne skjermer/grafer per modul (søvn, trening, kosthold, humør).
2. Readiness-/recovery-score (når wearable-data er koblet).
3. Smart mat-logging med makroer over tid.
4. Fremoverskuende cash-flow-varsel på tvers av de fire selskapene.
5. Ukentlig retro + "3 ting som flytter nålen mot 500K".
6. Månedlig mønster-rapport.
7. Strategisk rådgiver-spørringer mot full historikk.
8. Møteforberedelse (bios + agenda + docs samlet automatisk).
9. Investeringsoversikt (egen modul, ikke Google Sheets).

---

## 12. Suksesskriterier (MVP er ferdig når...)

- Anders kan trykke på klokka, snakke, og se loggen lande i `me_log` + få svar i Telegram.
- Et foto av et måltid blir til en `nutrition`-logg med estimat.
- "hvordan har søvnen vært denne uka?" gir et korrekt svar fra historikken.
- Morgenbrief kommer automatisk hver morgen med Anders' tall + AgencyOS-snapshot.
- En stor oppgave brytes til mikrosteg på forespørsel.
- Et løfte ("send tilbud fredag") fanges og dyttes før forfall.
- Ingen andre enn Anders' chat-id får svar fra boten.
- `/meg`-skjermen viser brief + logg + trendgrafer.

---

## 13. Åpne punkter

- [ ] NotebookLM-YouTube-lenke (Anders leverer).
- [ ] Bekreft Telegram bot-token + chat-id ved oppsett.
- [ ] Opprett ny Supabase-prosjekt for Meg-databasen (separat fra golf-DB).
- [ ] Avklar tone/personlighet for boten (kort, direkte — matcher Anders' stil).
