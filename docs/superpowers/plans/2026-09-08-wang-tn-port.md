# Portplan — WANG og Team Norway, skjerm for skjerm

Dato: 2026-09-08 · Status: **Bølge 1 godkjent.** T1 (TN-09) i arbeid — én skjerm, stopp for Anders ser.
Kilde: zip-ene synket samme dag (#823 Train-lock, #824 Claw + WANG).
Registrene er fasit for rekkefølge: `designsystem/wang/SKJERMREGISTER.md` og
`designsystem/team-norway/handover/SKJERMREGISTER.md`.

Dette er **ikke** PlayerHQ/AgencyOS. De følger Train-lock. Denne planen eier bare
`/team-norway/*` (Claw) og `/team-wang` (WANG-merket). Analyse og DataGolf tegnes
aldri her — de er Train-lock med TN-skinn (beslutning 31.08).

**Lansering 11.09 (FULL, Stripe) er et annet spor.** Denne porten blokkerer ikke
kjøp. Anbefalt start: etter røyktesten, eller parallelt hvis Anders vil.

---

## 1 · Tre ferdig-punkter

1. **Bølge 1 merget og sett.** Alle skjermer merket «kan bygges nå» i de to
   registrene er i koden, Anders har sett hver (mobil 390 + desktop 1280), og
   filhodet har Fasit + Avvik (ingen Claw/WANG-rigg ennå).
2. **Ingen gjettet tabell.** Skjermer merket «venter på datamodell» bygges først
   når tabellen finnes (kirurgisk `db execute`, aldri `migrate`). Tom tilstand
   med hel setning inntil da — aldri oppdiktede tall.
3. **Ingen to fasiter på én skjerm.** Claw-tokens (`--tn-*`) bare under
   `/team-norway`. WANG-tokens (`--wang-*` / `.wang-tp`) bare under `/team-wang`.
   PlayerHQ og AgencyOS røres ikke.

---

## 2 · Status i kode (målt 08.09)

### Team Norway — 4 ruter i dag

| Register | I koden | Merknad |
|---|---|---|
| TN-09 Gruppeposter | `/team-norway/[groupId]` | Bygget. Må treffe rettet fasit |
| TN-10 Post til én spiller | `/team-norway/spiller/[spillerId]` | Bygget. Samme |
| TN-11 Dokumenter | `/team-norway/[groupId]/dokumenter` | Bygget. Samme |
| TN-18 Trenere og tilgang | `/team-norway/tilgang` | Bygget (#815). Avvik i filhodet: én kanonisk gruppe, ikke fire lag; «legg til trener» mangler |
| TN-12 Samtykke | `/portal/…/deling` + `/forelder/samtykke/deling` | Bygget som PlayerHQ/forelder, ikke under `/team-norway` |
| TN-01 Skall | `layout` + `TnRail` | Finnes. Fasiten krever 252 px rail (koden 232) og tom «ingen grupper tildelt» |

Resten av TN-00–TN-21 er ikke ruter.

### WANG — 4 ruter i dag

| Register | I koden | Merknad |
|---|---|---|
| A1–A6 Skall, hjem, årsplan, periode, uke | `/team-wang` fire faner | Bygget mot 25.08-årsplanfasiten. Registeret sier A6 «i dag» er hardkodet |
| C7 Logg inn | `/team-wang/logg-inn` | Finnes. Skal treffe ny tegning |
| C6 Trenerflate | `/team-wang/coach` | Finnes. **Åpen beslutning:** lesevisning eller redirect til Workbench |
| C5 IUP | `/team-wang/coach/iup/[elevId]` | Finnes. Registeret: venter på kildelinje-felter |

Batch 1–3 (B1–B9, C1–C4, C8–C9, D1–D12) er ikke ruter.

---

## 3 · Regler som aldri brytes

- Én skjerm per PR. Aldri batch. Anders ser før «ferdig».
- Les designfilen. Kopier tokennavn (Claw) / eksakte mål (WANG). Ingen «ca.».
- Tilgangsmatrisen **før** UI. Mindreårige: navnefri fellesside, ingen PII i logger.
- `loading.tsx` importerer aldri `"use client"`.
- Skjemaendring: kirurgisk `db execute` mot `DIRECT_URL`, aldri `migrate`/`db push`.
- Presentasjon (TN, 1920×1080) og systemkart porteres **ikke** — de er dokument, ikke app.

---

## 4 · Bølge 1 — det som kan bygges nå (anbefalt start)

Ingen ny tabell. Rekkefølge er den registrene selv gir.

### 4A · Team Norway (~8 økter)

| # | Skjerm | Jobb |
|---|---|---|
| T1 | TN-09, TN-10, TN-11 | Tre allerede bygde flater mot rettet fasit (tokens, 44 px trykk, kildelinje). Anders ser. |
| T2 | TN-18 | Sign-off mot ny tegning. Ikke fire lag og ikke «legg til trener» uten at TN-19/TN-20 finnes — avviket står. |
| T3 | TN-01 | Rail 252 px, seks menygrupper, tom/laster/feil, mobil «Mer». |
| T4 | TN-20 Trenerkatalog | Ny rute `/team-norway/apparatet`. Gir **ingen** tilgang. Navn fra IUP er data, ikke eksempel — men xlsx ligger ikke i repoet; les fra det som allerede er i basen, ellers tom tilstand. |
| T5 | TN-12 | Bekreft at eksisterende samtykke-sider treffer Claw-tegningen, eller pek registeret til den faktiske adressen. Ikke dupliser under `/team-norway` uten beslutning (én inngang). |
| T6 | TN-19 Inviter spiller | Gjenbruk `ParentInvitation`-mønsteret. Under 15 år: invitasjon til foresatt. |

TN-18 kan bygges/signeres selv om B2 (bare sportssjef?) er åpen — tegningen er den samme.

### 4B · WANG (~9 økter)

| # | Skjerm | Jobb |
|---|---|---|
| W1 | C7 Logg inn | Treff `c7-logg-inn.html`. Finnes. |
| W2 | C8 Systemtilstander | Laster / feil / uten nett / 403 på alle `/team-wang`-ruter. `loading.tsx` uten klient-JS. |
| W3 | C1 Elevliste | `/team-wang/elever`. `GroupMember`. Navnefri der eleven er mindreårig uten samtykke. |
| W4 | B7 + C4 Turneringer | Liste og detalj. `wang-turneringer.ts`. Åpen visning navnefri. |
| W5 | B6 Statistikk-skinn | Token-oppgave: Train-lock-innhold med WANG-skinn, ikke ny analyse. |
| W6 | D11 Trenere og roller | `GroupMember.role`. |
| W7 | C3 Økt-detalj | `okt-detalj.tsx` er urutet — koble til kalender-fanen. |
| W8 | B3 Resultater per elev | Egne tester. Kildelinje-komponenten bygges én gang (treffer også C5 senere). |
| W9 | A1–A6 etterkontroll | Fellessiden mot 08.09-tegningen. Hardkodet «i dag» i A6 vekk. |

---

## 5 · Bølge 2 — venter på tabell (ikke start før bølge 1 er sett)

Grupperes etter modell, ikke etter skjerm-ID. Én modell-PR, deretter skjermene den låser opp.

### Team Norway (13 skjermer, 6 modellklynger)

| Klynge | Skjermer | Mangler |
|---|---|---|
| 1 Runde/felt | TN-13, TN-17, TN-07 | Rundescore og feltsnitt. `TournamentResult` har bare plassering/score |
| 2 Protokollversjon | TN-04, TN-05, TN-03, TN-21 | Versjon, eier, låsedato, kø for fellestesting |
| 3 Samling/uttak | TN-14, TN-06, TN-00 (delvis), TN-02 (delvis) | Samling på gruppenivå. `TrainingCamp` er per spiller |
| 4 Månedsplan | TN-16 | Avvik mot *publisert* plan |
| 5 Skole | TN-08 | Normaliserte skolenavn. Navn-varianten er **låst** (ingen navnliste til NGF) |
| 6 TN-00 pulje 1 | hjem / liste / ark | Liste kan tegnes mot `GroupMember` nå; «krever handling» trenger klynge 3+4 |

### WANG (19 skjermer)

Testdag/protokoll (B1, B2) · ukesrapport (B4) · dokumenter (B5) · elev-ark oppmøte (B8) ·
samling/uttak (B9, C2) · IUP-kilde (C5) · skole/timeplan/prøve (C9, D4, D5) ·
plasser/rekruttering (D2, D3, D1) · poster (D7, D8) · periode/måned (D9, D10) ·
inviter (D12) · foreldremøte (D6).

Ikke gjett feltnavn. `DATAMODELL.md` i hver pakke er kontrakten.

---

## 6 · Det Anders må svare på (blokkerer ferdigstillelse, ikke alltid start)

### Team Norway — `handover/APNE-BESLUTNINGER.md`

| # | Spørsmål | Anbefaling |
|---|---|---|
| B1 | Får spilleren legge inn turneringer selv? | Ja, som utkast uten belegg. Tegnet slik. |
| B2 | Bare sportssjef gir tilgang? | Ja, strengt. Tegnet slik. TN-18 er bygget slik. |
| B3 | Måle «åpnet» på invitasjon, og hvem under 15? | Foresatt. |
| B4 | College: egen modell eller felt på gruppen? | Felt på gruppen til det tvinger egen tabell. |
| B5 | TN-13 under Claw eller Train-lock? | Claw under Data. Train-lock eier spillerens egen Analyse. |

Workbench-malen i Claw overlapper Train-lock WB-*. **Ikke port** før eierskap er sagt.

### WANG — `APNE-BESLUTNINGER.md`

| # | Spørsmål | Anbefaling |
|---|---|---|
| 1–2 | Rekrutteringspunkter: antall, navn, vekt, karakterer, felles vs skole | Ikke gjett. D1 bygges som editor med «ikke bestemt». |
| 3 (C6) | Består `/team-wang/coach`? | **A: lesevisning.** Planlegging i Workbench. |
| 4 | Timeplan føres her eller importeres? | Visning inntil import finnes. |
| 5 | Volum: tre kategorier eller årshjulets fem akser? | Fem akser (TEK/SLAG/SPILL/TURN/FYS). Ikke et tredje sett. |
| 6 | Hva får én skole se om en annen skoles mindreårige kandidat? | Juridisk. Ikke bygg D3 før svar. |
| 7 | Inviter: hvem eier kontoen — PlayerHQ eller WANG? | PlayerHQ eier kontoen. WANG er lisens/gruppe. |
| 8 | Sletteregler for filer | Før B5/D7. |

---

## 7 · Anbefalt rekkefølge

**Ett spor om gangen.** Først Team Norway bølge 1, så WANG bølge 1, så modellklyngene.
Grunnen: TN har allerede fire flater som skal treffe ny tegning — det er raskere
læring enn å åpne 19 WANG-tabeller.

Ikke start bølge 2 i samme uke som Stripe/røyktest.

Estimat bølge 1: ~17 økter à én skjerm. Bølge 2: ikke tallfestet før modellene er
godkjent — der er tabellen jobben, ikke pikslene.

---

## 8 · Hva som bevisst ikke inngår

- PlayerHQ, AgencyOS, Forelder, markedssider, booking.
- Claw-presentasjon og systemkart.
- Claw-Workbench inntil eierskap mot Train-lock WB er svart.
- Å flytte TN-tokens inn i produktskjermer, eller WANG-navy inn i AgencyOS.
- IUP-xlsx inn i repoet.

---

## 9 · Første økt hvis planen får ja

T1: TN-09 Gruppeposter mot rettet `TnGruppeposter.dc.html`. Mobil 390 + desktop.
Filhode Fasit + Avvik. Stopp for «sett».
