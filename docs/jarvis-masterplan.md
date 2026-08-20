> **Merknad (2026-08-17):** Denne repo-versjonen er nå den kanoniske fila — flyttet inn
> fordi `scripts/saker-innsamling/` refererer den. Originalen lå i
> `claude-cowork/akgolf-hq/kunnskap/jarvis-masterplan.md`.

# Jarvis — komplett masterplan v2 (med Familie-OS)

Skrevet 2026-08-16, v2 samme dag (familie-modul + full systemkartlegging av Meg/agent-laget).
Bygger på AgenticOS (skillen `agenticos`), AgencyOS-cockpiten og verifisert kartlegging av
`src/lib/meg/`, `src/lib/agents/` og kalenderlaget i akgolf-hq.

## Hva «Jarvis» betyr

Én assistent som ser alt, foreslår alt, og aldri sender noe uten godkjenning. To ansikter:
- **Jarvis for Anders**: Meg-boten + AgencyOS-cockpit — jobb, drift, kommunikasjon, kalender.
- **Familie-Jarvis**: egen Telegram-gruppebot for kona og barna — felles kalender og logistikk
  («har vi planer neste onsdag?», «når er pappa ferdig på jobb?», henting, fotballkamp).

Suksessmål (fra Agentic OS): svar på alt skriftlig < 6 t · null forfalte oppgaver ·
null kalenderkonflikter — pluss nytt: null glemt familielogistikk.

## Systemkart — hva som ALLEREDE finnes (verifisert 16.08)

| Jarvis-del | Finnes som | Viktig detalj |
|---|---|---|
| Kontaktpunkt | Meg-boten: webhook `/api/meg/telegram`, rå Bot-API | 3-lags auth, rate limit, allowlist med ROLLER (admin/coach) — flerbruker-støtte finnes |
| Godkjenning | `me_pending_action` (1 t utløp) + «BEKREFT»-flyt · Signal→PlanAction i HQ | Mønsteret hendelse→forslag→godkjenning er ferdig bygget |
| Verktøy | 26 Meg-verktøy (logg, minne, Notion, Gmail, kalender, Stripe, Disk) | Rollestyrt tilgang finnes (coach får 2 av 26) |
| Agenter | 55 cron-agenter + 7 hendelsestriggere i `src/lib/agents/` | `gfgk-ballplukking` + `mulligan-vaskeliste` = ferdig mal for ukevakt med Telegram-BEKREFT |
| Kalender | googleapis: freebusy (batch 50), push-watch, `GoogleCalendarSubscription` | Skiller bevisst «vis i kalender» fra «blokkerer booking» — laget for familiekalendere |
| Lokal AI | Ollama på Mini: qwen2.5:7b (i bruk, PII-vask), **hermes3:8b (installert, UBRUKT)**, qwen2.5:32b, gpt-oss:20b, nomic-embed | PII-presedens: mulligan-triage kjører lokalt nettopp for personvern |
| Minne | me_memory/me_knowledge (egen Supabase, RLS deny-all, subject per chat-id) + ak-brain (Obsidian) + ak-second-brain | Tilbakeskriving 21:30 → dagsnotat + mønstre |
| Rytme | morgenbrief 08:30 · kveldsjournal · løftesjekk · WANG-agenda (Vercel cron + LaunchAgents) | Ferdig |

**Gapet:** (1) ingen samlet «venter på deg»-kø (triggers.ts er fire-and-forget uten persistens),
(2) ingen familie-domene overhodet (verifisert: null treff), (3) hermes3/32b-modellene står ubrukte.

## AI-flåten — hvem gjør hva i Jarvis

| Modell | Rolle i Jarvis |
|---|---|
| Claude (Sonnet) | Hovedhjernen: Meg-agenten, svarutkast, triage-resonnering |
| Claude (Haiku) | Billig fallback-klassifisering (finnes i router.ts) |
| Ollama qwen2.5:7b | PII-vask og klassifisering på Mini (i drift) |
| **Ollama hermes3:8b** | **Familie-Jarvis-hjernen: barnas spørsmål behandles 100 % lokalt** |
| Ollama qwen2.5:32b | Tyngre lokal resonnering ved behov (natt-jobber) — valgfri |
| nomic-embed-text | Minne-indeksering (i drift, meg-index 04:30) |
| Gemini | Research og review (uendret rolle fra AgenticOS) |
| Grok | Orkestrering/marked (uendret) |
| Obsidian (ak-brain) | Menneske-lesbart minne — tilbakeskriving hver kveld |

## DEL A — Kjerne-Jarvis (8 steg, som v1 — presisert mot funnene)

Ett steg = én Claude Code-økt (maks 2 t), full git-flyt, Sonnet.

1. **Én kø.** «Saker»-tabell etter `me_pending_action`-mønsteret (status-maskin, utløp,
   subject) men i HQ-Prisma, koblet mot Signal→PlanAction. Alt som venter på Anders:
   e-post, SMS/iMessage, anrop, kalenderavvik, forfalte tasks.
   Verifiser: messages-skillen leser køen og viser ETT tall.
2. **Innsamlerne.** LaunchAgent på Mini (mulligan-triage-malen): Gmail + Beeper/iMessage
   → køen hvert 10. min. PII vaskes med qwen2.5:7b før sky.
   Verifiser: testmelding på SMS og e-post står i køen innen 10 min.
3. **Triage-agenten.** Agent i `src/lib/agents/` (runAgent-konvensjonen): klassifiser,
   skriv svarutkast i Anders' tone, legg i kø. Aldri send.
   Verifiser: 10 ekte saker, minst 8 utkast godkjennes uendret.
4. **Godkjenning fra lomma.** Meg-boten får kø-verktøy: viser saker med utkast,
   «BEKREFT»-flyten (finnes) sender via riktig kanal. HQ-køen speiler.
   Verifiser: ett e-postsvar og én SMS godkjent og sendt kun fra iPhone.
5. **Anrop + kalender-vakt.** Ubesvarte anrop (fra Mini) blir saker. Kalender-agent
   (freebusy finnes) flagger konflikt, manglende reisetid, avtale uten varsel.
   Verifiser: testanrop og konstruert konflikt dukker opp som saker.
6. **Rytmen på køen.** Morgenbrief åpner med kø-status, innboksblokkene (11:30/16:00)
   er kø-gjennomgang, kveldsjournal melder restanse.
   Verifiser: én hel dag der ingenting ble fulgt opp utenfor køen.
7. **Personlig cockpit.** /meg-flaten med «Én ting nå» (Paper-fasit, AiDispatchPanelV2-
   mønsteret). Verifiser: skjermbilde-gate 390px + 1280px, lys/mørk.
8. **Stemme.** Morgenbrief og kø-status som lyd (TTS). Sist, valgfritt.

## DEL B — Familie-OS (5 steg)

Prinsipp: **barnas data forlater aldri Mac Mini.** Familie-boten kjører LOKALT på Mini
(polling-tjeneste som LaunchAgent, ikke Vercel-webhook) med hermes3:8b som hjerne —
Claude brukes kun hvis en voksen-sak krever det, og da anonymisert. Dette følger
PII-presedensen fra mulligan-triage.

**F1 — Familie-boten.**
Egen Telegram-bot (eget token — barna skal ALDRI ha tilgang til Meg og de 26 verktøyene).
Gjenbruk `access.ts`-mønsteret med nye roller: `familie-voksen` (kona) og `familie-barn`,
med hvert sitt lille verktøysett (kalender-spørsmål, kalender-forslag, familielogg).
Teknisk merknad fra kartleggingen: i gruppechat MÅ identitet leses fra avsenderens
`from.id`, ikke chattens `chat.id` — ellers deler alle én kontekst.
Verifiser: gruppen opprettet, hvert familiemedlem gjenkjennes med riktig rolle,
ukjente avvises.

**F2 — Familiekalenderen.**
Én delt Google-kalender «Familie» + hvert medlems egen kalender koblet via
`GoogleCalendarSubscription` (visIKalender-flagget er laget for akkurat dette —
familiekalender vises uten å blokkere coaching-booking). «Når er pappa ferdig på jobb?»
besvares KUN med ledig/opptatt fra Anders' jobbkalendere (freebusy-batchen finnes) —
aldri detaljer om kunder/spillere.
Verifiser: «har vi planer neste onsdag?» i gruppen gir riktig svar fra ekte kalenderdata.

**F3 — Hendelser fra melding.**
«Fotballkamp lørdag 12:00» → boten foreslår kalenderoppføring med BEKREFT-flyten
(gjenbruk `confirm.ts`/`pending.ts`-mønsteret): barn-forslag må bekreftes av en voksen
i gruppen, voksen-forslag av personen selv. Aldri auto-innlegging (samme regel som
Anders' egen kalender-regel).
Verifiser: barne-testmelding gir forslag; først etter voksen-BEKREFT ligger den i
Familie-kalenderen.

**F4 — Familielogistikk-vakten.**
Kveldsmelding til gruppen (kl. 20:00): morgendagens logistikk — hvem henter, hvilke
aktiviteter, kollisjoner mellom foreldrenes kalendere («begge er opptatt når X skal
hentes 15:30»). Gjenbruk ballplukking/vaskeliste-agentmønsteret for faste familievakter
(søppel, henting-rotasjon) med BEKREFT.
Verifiser: én uke der gruppen får kveldsmeldingen og én reell kollisjon flagges før den skjer.

**F5 — Familieminne.**
Egen `subject`-isolert loggtabell (me_*-mønsteret, egen familie-database eller eget skjema —
IKKE golf-DB, IKKE Meg-tabellene): «Emma har svømming onsdager», «tannlege-avtale mars».
hermes3 svarer på spørsmål fra dette minnet + kalenderen. Ingen tilbakeskriving til
ak-brain/ak-second-brain — familiens minne bor hos familien.
Verifiser: «når er neste tannlegetime?» besvares riktig uken etter at den ble nevnt.

## Regler (ufravikelige, hele veien)

- AI foreslår → menneske godkjenner → system utfører. Aldri auto-send, aldri auto-kalender.
- Barnas meldinger og familieminnet behandles kun lokalt (hermes3:8b på Mini).
- «Når er pappa ferdig»-svar er ledig/opptatt — aldri innholdet i jobbkalenderen.
- Én sak → én flate. Køen eier saken.
- Ingen nye MCP-servere/plattformer. Sonnet i byggeøktene. Én økt per steg, maks 2 t.
- Alt i akgolf-hq-repoet med full git-flyt (familie-boten som `scripts/familie-bot/` +
  egen LaunchAgent, etter mulligan-triage-malen).

## Rekkefølge — anbefalt

1. Steg 1-3 (kjernekøen) — størst ADHD-gevinst, 3 økter.
2. F1-F2 (familie-bot + kalender) — kan kjøres parallelt med del A siden den er lokal
   og uavhengig, 2 økter. Dette er den raskeste veien til synlig verdi for familien.
3. Steg 4-6, så F3-F5, så 7-8.

Totalt: kjerne-Jarvis i drift etter 3-4 økter · familie-Jarvis svarer på kalenderspørsmål
etter 2 økter · komplett system etter 12-13 økter.
