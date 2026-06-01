# Turnering-datakilder — master-kart

> Kartlegging av hvor vi henter ekte data for **alle verdens turneringer** (unntatt lokale
> klubbturneringer). Grunnlag for delsystem A/B/C i turnerings-pipelinen.
> Recon utført 2026-06-01 via 5 parallelle research-agenter.

## Ufravikelig prinsipp: ALDRI fake data

Hver kilde under er merket med ærlig deknings- og tilgangsstatus. Der ingen maskinlesbar
kilde finnes → raden vises som **"ingen kilde / manuell"**, aldri med fabrikkerte tall.
Sider uten ekte data ennå viser "venter på data", ikke placeholder-score.

---

## Hovedinnsikt: verden hviler på fire ankre

Du trenger ikke skrape hundrevis av sider hver for seg. Nesten all relevant turneringsdata
er aggregert i fire plattformer:

| Anker | Dekker | Status hos oss | Tilgang |
|---|---|---|---|
| **DataGolf** | Herre-proff (5 tourer live, 22 historisk) | ✅ integrert | Betalt API ($30/mnd Scratch Plus) |
| **GolfBox** | Europeisk amatør-scoring: **alt norsk** (NGF, Olyo, Srixon, Garmin NC, regioner) + R&A + EGA + Nordic League | manuell import finnes | Offentlig widget-endepunkt (ToS-gråsone) eller offisielt API via avtale |
| **WAGR (R&A)** | Amatør-ranking + identitet + counting events globalt (~4 300/år, 8 300+ spillere) | manuell import finnes | Udokumentert backend-API + CSV-eksport i UI (lisens uavklart) |
| **Clippd** | College: NCAA D1/2/3 + NAIA + NJCAA (offisiell fra 2023) | stub finnes | Lukket partner-API (Next.js/Supabase-SPA) |

Resten av verden (dame-tourer, asiatiske proff-tourer, college-Europa) faller utenfor disse
og krever enten egne scrapere eller en kommersiell aggregator (Sportradar / Data Sports Group).

---

## Det globale universet — tier for tier

### Tier 1 — Herre-proff (DELVIS LØST via DataGolf)

| Tour | Live via DataGolf? | Historisk via DataGolf? | Hvis ikke live: kilde |
|---|---|---|---|
| PGA Tour | ✅ (`pga`/`opp`) | ✅ | — |
| DP World Tour | ❌ (kun odds/hull-aggr.) | ✅ (`euro`) | scrape europeantour.com (OCS) |
| Korn Ferry | ❌ | ✅ (`kft`) | scrape pgatour.com |
| LIV Golf | ✅ (`alt`/liv) | ✅ | — |
| Challenge Tour | ❌ | ✅ (`cha`) | OCS-TIC |
| PGA Tour Champions | ❌ | ✅ (`champ`) | scrape pgatour.com |
| PGA Tour Americas | ❌ | ✅ | scrape pgatour.com |
| Asian Tour | ❌ | ✅ (`atvt`/`atgt`?) | OCS-TIC (`asiantour.ocs-asia.com/tic`) |
| Japan Golf Tour (JGTO) | ❌ | ✅ (`jpn`) | scrape jgto.org (japansk) — tungt |
| Sunshine Tour | ❌ | ✅ (`afr`) | OCS-TIC (`sunshinetour.info/tic`) |
| PGA Tour of Australasia | ❌ | ✅ (`anz`) | OCS-TIC (`snr-live.pga-tic.com`) |
| **Nordic Golf League** | ❌ | ✅ (`ngl`) | **GolfBox** (lett — kjent terreng) |

**DataGolf-grenser (bekreftet av staff):** kun runde-nivå (ikke shot/hull-for-hull per spiller),
ingen dame, ingen amatør, ingen college, ingen Q-School-spesifikk dekning. Live SG kun PGA/opp.

### Tier 1b — Dame-proff (HELT UTENFOR DataGolf — stort gap)

LPGA, LET, Epson, JLPGA, KLPGA, LET Access. **Ingen er i DataGolf** (verken API eller arkiv).
- LET + LET Access: OCS-TIC (`live-let.ocs-software.com`, `live-letas.ocs-software.com`)
- LPGA + Epson + Q-Series: `live.lpgascoring.com` (intet åpent API)
- JLPGA (japansk), KLPGA (koreansk): tungt, vurder kommersiell feed
- **Anbefaling:** kommersiell aggregator (Sportradar / Data Sports Group) er trolig billigere
  enn 6 skjøre scrapere hvis dame-live trengs.

### Tier 1c — Q-Schools (alle verdensdeler)

PGA/KFT Q-School (pgatour.com), DP World Q-School (europeantour.com), LPGA Q-Series
(lpgascoring.com), Asian/Japan Q-Schools (TIC / jgto-qt.jp). Ingen dedikert DataGolf-dekning.
Ad-hoc scraping per sesong.

### Tier 2 — Amatør globalt (WAGR)

| Kilde | Hva | Tilgang |
|---|---|---|
| WAGR menn + WWAGR kvinner | Ranking, counting events, spillerprofiler, resultater | Next.js-app, JS-rendret. Backend `worldgolfranking2021api.wagr.com/api/` (udokumentert) + **CSV-eksport i UI** (eneste sanksjonerte uttrekk) |
| R&A championships (The Amateur m.fl.) | Live leaderboards, match-play | **GolfBox** embeddet (puller fra `golfbox.dk/livescoring`) |
| EGA (European Amateur, lag-EM, 27 events) | Leaderboards, lag, arkiv | **GolfBox-widget** (`ega-golf.ch/golfbox-result-widget/{id}`) |

**WAGR er master for ranking + spiller-identitet** (de-facto offisiell, R&A+USGA, ukentlig onsdag),
men lister **kun sertifiserte counting events** (~4 300/år) — ikke alle amatørturneringer.

### Tier 3 — Norske + nordiske amatør/junior-tourer (alle på GolfBox)

| Tour | Hvor data bor | Eksisterende verktøy |
|---|---|---|
| NGF-turneringer (NM m.m.) | `golfbox.no/app_livescoring/` | 1167 importert manuelt |
| Olyo Tour (6 regioner) | GolfBox via NGF | `import-norske-turneringer.ts` |
| Srixon Tour (WAGR-tellende) | GolfBox via NGF | ↑ |
| Garmin Norgescup | `golfbox.no/app_livescoring/` (IKKE eget subdomene) | ↑ |
| Region-tourer (Østland m.fl.) | GolfBox via NGF | ↑ |
| GJGT / Global Junior Golf | **IKKE GolfBox** — `globaljuniorgolflive.com` | `import-gjgt.ts` |

### Tier 4 — College

| Kilde | Dekker | Tilgang |
|---|---|---|
| **Clippd / Scoreboard** | NCAA D1/2/3 + NAIA + NJCAA (offisiell fra 2023), M+K | Next.js/Supabase-SPA, **lukket partner-API**. Stabile IDer. Playwright eller lisens |
| Golfstat | NCAA historikk + live-backup | **Statisk HTML** (lett å parse), men dyp historikk bak betalt abonnement |
| stats.ncaa.org | — | **Blindvei** — Akamai-blokkert (403), tynn golf-dekning |
| Europeisk universitetsgolf (BUCS/EUSA/R&A Student) | sluttresultater | Fragmentert, PDF, ingen API — "best effort" |

---

## GolfBox i detalj — den europeiske gullåren

Tre tilgangsnivåer:
1. **Offisielt API** — `api.golfbox.net` (krever avtale fra GolfBox, Silkeborg DK). NGF-relasjon kan være døråpner. Ren vei.
2. **Offentlige widget-endepunkter (mest lovende)** — `scores.golfbox.dk/api/js/.../competitionid/{ID}` / `customerid/{X}`. Bygd for embedding, svarer 200 uten auth. Returnerer strukturert leaderboard/startliste-data.
3. **Livescoring-`.asp`-sider** — `golfbox.no/livescoring/startlist.asp?tour={GUID}&lang=1044`. Server-rendret, statisk nok for cheerio. GUID per turnering.

**Scraping-vurdering: LETT–MIDDELS** (ikke Playwright/cookies for offentlig lesing).
Cookie/login gjelder kun score-innskriving, ikke lesing.

**To verifiseringssteg før vi bygger (1 kall hver):**
```
curl -s "https://scores.golfbox.dk/api/js/topxleaderboard/standalonewidget/true/x/5/template/golfbox/competitionid/<ID>/width/350"
curl -s "https://www.golfbox.no/livescoring/startlist.asp?tour={GUID}&lang=1044"
```
Gir (1) data → **lett (feed)**. Kun (2) → **middels (HTML)**.

---

## Identitet & dedup (kritisk — samme event/spiller fra flere kilder)

| Domene | Master-nøkkel | Merknad |
|---|---|---|
| Herre-proff | DataGolf `dg_id` | allerede i bruk |
| Amatør | WAGR-spiller-ID | forankre identitet her |
| College | Clippd Player ID | stabil innenfor økosystem |
| Event-dedup | `sourceOrigin` + `sourceId` | samme event fra WAGR + GolfBox + DataGolf må merges |

Kryss-kilde-kobling (Golfstat→Clippd, EGA→WAGR) er **fuzzy** (navn + lag + sesong). Bygg
eksplisitt aliastabell for navnvarianter; ikke anta felles ID på tvers.

---

## Lovlighet — ærlig flagg

**Alle scrape-veier er ToS-gråsone.** De rene veiene er lisenser/avtaler:
- DataGolf: betalt API ✅ (allerede)
- GolfBox: offisielt API via NGF-avtale (ren) eller widget-scrape (gråsone)
- WAGR/R&A: kontakt R&A/USGA for lisens; CSV-eksport er eneste sanksjonerte selvbetjening
- Clippd: søk partner-API/datalisens framfor å skrape SPA-en
- Dame + asiatiske live: kommersiell aggregator (Sportradar / DSG) gir lisensiert tilgang

**Verifiser ToS per kilde før produksjon.** Bruk `AKGolfBot/1.0 (+akgolf.no)`-User-Agent + rate-limiting uansett.

---

## Anbefalt utrullingsrekkefølge

1. **GolfBox-verifisering** (1 dag) — kjør de to curl-kallene, fastslå feed vs HTML. Låser opp ALT norsk + R&A + EGA + Nordic League samtidig.
2. **Tier 3 norsk** (delsystem A MVP) — bygg GolfBox-adapter (kalender først), GitHub Actions cron.
3. **Tier 2 WAGR** — CSV-eksport eller backend-API for amatør-ranking + counting events + spiller-identitet.
4. **Tier 4 college** — Clippd (søk partner-API) + Golfstat statisk for historikk.
5. **Tier 1 utvidelse** — flere DataGolf-tourer (historisk) + OCS-TIC-parser for live der DataGolf mangler.
6. **Tier 1b dame + asiatiske** — vurder kommersiell feed framfor egne scrapere.

---

## Åpne beslutninger for Anders

1. **Lisens vs scrape:** søker vi offisielle avtaler (GolfBox API, WAGR-lisens, Clippd partner-API) — eller aksepterer vi widget/HTML-scraping i gråsonen for v1?
2. **Kommersiell aggregator:** kjøper vi Sportradar/Data Sports Group for dame + asiatiske live (sparer 6+ skjøre scrapere), eller utelater vi de live foreløpig?
3. **Dybde:** holder kalender + leaderboard, eller skal vi ha per-runde/hull-for-hull der det finnes (mye tyngre)?
