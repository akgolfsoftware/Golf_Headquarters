# Byggekontrakt · Fase 1 · AK Golf HQ

Gjelder alle filer i denne mappa. Brudd = leveransen underkjennes.

## 1. Filformat
- **Én selvstendig `.html`-fil per skjerm.** Åpnes direkte i nettleser og VIRKER. Ingen `<x-dc>`, ingen `x-import`, ingen `support.js`/`ds-base.js`, ingen build-steg.
- `<!doctype html><html lang="nb" data-theme="light">`
- Fontlenke i `<head>`:
  `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Lora:ital,wght@0,400;0,500;1,400&family=Poppins:wght@400;500;600&display=swap" rel="stylesheet">`
- **Innhold i `_foundation.css` limes VERBATIM inn i første `<style>`.** Ikke endre en eneste verdi. Skjermspesifikk CSS kommer etter, i samme eller neste `<style>`.

## 2. Tokens — nådeløst
- **Null hex utenfor `:root` og `[data-theme="dark"]`.** Ingen `#fff`, ingen `rgba(0,0,0,...)`, ingen `black`/`white`. Alt via `var(--…)`.
- **Null hardkodet px på spacing.** Bruk `var(--s1)`…`var(--s8)`. Unntak tillatt: 1px kanter, `0`, prosent, `vh`/`vw`, `ch`, font-size, line-height, og eksplisitt begrunnede layout-mål (kolonnebredder, ikonstørrelser) — kommenter disse.
- **Radius kun `var(--r)` / `var(--r-sm)` / `var(--r-pill)`.** Ingen `border-radius: 8px`.
- Skygge kun `var(--shadow)`.

## 3. Aksentmonopol — én oransje handling
- **Nøyaktig én `.btn.now` per skjermtilstand.** Det er «Én ting nå».
- Alle andre knapper: `.btn` (ghost) eller `.btn.ink` (blekkfylt).
- Aksent ellers kun til: `:focus-visible`-ring (allerede i fundamentet), logoprikk, og `--accent-soft` som bakgrunn på selve «Én ting nå»-blokka.
- **Aldri** aksent på badges, tall, statuspunkter, dekorasjon.
- Skriv en HTML-kommentar rett over `.btn.now` som sier hvorfor akkurat denne er skjermens ene handling.

## 4. Trykkflater
- Alt interaktivt ≥ `var(--tap)` (44px). `.btn.now` ≥ `var(--tap-lg)` (48px). Fangst/mikrofon ≥ `var(--tap-capture)` (60px).
- På mobil er primærhandlingen og composeren **bunnfestet**, ikke i scroll-flyt. Bruk `position:sticky; bottom:0` eller fast dock med `env(safe-area-inset-bottom)`.

## 5. Interaksjoner må VIRKE
- Ingen `() => {}`. Ingen `href="#"`. Ingen knapp uten handler.
- Alt interaktivt har `data-od-id="kebab-case-id"`.
- Skriv vanlig vanilla JS nederst i fila. Ingen React, ingen CDN-avhengighet.
- Tema-toggle med `localStorage` (`akhq-theme-agencyos` / `akhq-theme-playerhq`), respekterer `prefers-color-scheme` ved første besøk.

## 6. Tilstander — obligatorisk
Hver skjerm må kunne vise **tom, laster, feil, suksess** — og de skal være demonstrerbare. Legg en liten `.state-switch`-rad øverst (eyebrow «demo-tilstand» + fire `.chip` med `aria-pressed`) som faktisk bytter tilstand i DOM. Denne raden er merket `data-demo-only="true"` slik at Grok vet den skal ut.
- **Tom** = `.empty` med overskrift, forklaring i Lora, og en handling som gir neste steg.
- **Laster** = `.skel`-blokker i samme form som ekte innhold.
- **Feil** = tekst som sier hva som feilet og hva brukeren kan gjøre. Ikke «noe gikk galt».

## 7. Språk og domene
- Norsk bokmål med æ ø å i all UI-tekst. Kode og id-er på engelsk kebab-case.
- AK-terminologi presist — **AK-formel v2 (bekreftet av Anders 03.08.2026)**: kategorier A–K, pyramide FYS/TEK/SLAG/SPILL/TURN, 17 områder (fasit: `AkFormelVelger` i komponentbiblioteket), motorikk UTEN_BALL/LAV_HAST/AUTO, belastning INNENDORS/TRENINGSOMRADE/BANE/KONKURRANSE, press ALENE/OBSERVERT/KONKURRANSE/TURNERING, P1.0–P10.0, GRUNN/SPESIALISERING/TURNERING, AK-stigen.
- **Utgått (v1) — skal ikke forekomme i noen fil:** L-faser (L-KROPP…L-AUTO), CS-nivåer (CS0/CS20–CS100), miljø M0–M5, press PR1–PR5.
- Øktformel: `PYRAMIDE_OMRADE_MOTORIKK_BELASTNING_PRESS`, f.eks. `TEK_INNSPILL_50_LAV_HAST_TRENINGSOMRADE_OBSERVERT`.
- Alle tall i `.num` med enhet OG retning: «2,1 m H», «+2,92 SG», «62 %». Norsk desimalkomma, mellomrom som tusenskille. Brutto score, aldri netto.
- Deltaer med grunnlag: «+0,6 vs forrige 5 runder».

## 8. Demodata — én sannhet på tvers av alle filer
Bruk NØYAKTIG disse. Ikke finn på nye navn eller tall.

| Felt | Verdi |
|---|---|
| Coach | Anders Kristiansen |
| Dato | fredag 31. juli 2026, uke 31 |
| Klokke «nå» | 09:12 |
| Spiller 1 | Øyvind Rohjan · kat. D · SG total +2,92 · ukeplan venter godkjenning |
| Spiller 2 | Jonas Hveem · kat. C · SG total −0,93 · sjekkpunkt ulest, stille i 9 dager |
| Spiller 3 | Filip Sandberg · kat. B · SG total +0,88 · trenger plan neste uke |
| Spiller 4 | Mia Kolstad · kat. E · SG total +0,41 · følger planen |
| Anlegg | Mulligan Indoor · Sim 1–3 — **sted for coaching, ikke utleieprodukt** |
| Booking | Gjelder **kun coachingtjenester**. AK selger ikke simulatortid. Ledige luker = bookbare coachingtimer |
| Selskaper | AK Golf Academy · Junior Academy · WANG Toppidrett · GFGK (B2B) |
| I kø | 7 saker |
| Agentfeil | 1 (Faktura-vakten, kjøring 03:14) |
| PlayerHQ-bruker | Øyvind Rohjan |
| Øyvinds økt i dag | 16:00–17:30 · Sim 2 · `TEK_INNSPILL_50_LAV_HAST_TRENINGSOMRADE_OBSERVERT` · wedge 40–70 m |

(Demo-kanon: Øyvind Rohjan er spilleren — fulle navn, aldri «Emma»/gamle demo-navn. Jonas/Filip/Mia er stall-fyll og byttes mot reell stall før pilot.)

## 9. Sløyfen FØR → UNDER → ETTER
Hver skjerm som nevner et steg i sløyfa må **lenke** til neste med ekte `href` til nabofila. Tekst uten lenke er underkjent.
Filnavn å lenke mot: `agencyos-konsoll-desktop.html`, `agencyos-konsoll-mobil.html`, `playerhq-chat-desktop.html`, `playerhq-chat-mobil.html`, `fangstsheet.html`, `agencyos-kalender.html`, `agencyos-kalender-mobil.html`.

## 10. Navigasjon
- **Maks fem flater.** AgencyOS-rail (64px, alltid mørk): Konsoll · Innboks · Spillere · Kalender · Workbench. Ikke flere. Alt annet via chat eller ⌘K. (Rail-navnene låst av Anders 05.08.2026.)
- PlayerHQ bunnfaner (maks fire): I dag · Plan · Analyse · Meg.
- Samme navnesett i desktop og mobil. `tabItems ⊆ railItems`.

## 11. Egenkontroll før du leverer
Kjør disse mentalt og rett før du svarer:
1. `grep -c '#[0-9A-Fa-f]\{3,6\}'` utenfor `:root`/`[data-theme]` → skal være 0
2. Antall `.btn.now` per tilstand → skal være 1
3. Antall `() => {}`, `href="#"`, `onclick=""` tomme → skal være 0
4. Alle fire tilstander lar seg vise via demo-bryteren → ja
5. Alt interaktivt ≥44px → ja
6. Åpner fila i nettleser uten nettverk (utenom fonter) og virker → ja
