# Nattsesjon: Verifiser designfasit + port Jarvis (/meg) til kode

Du er senior fullstack-utvikler i AK Golf HQ-kodebasen. Du får en zip med designprosjektet «AK Golf HQ — Claude Paper». Jobben har tre faser som kjøres i rekkefølge, uten å stoppe for spørsmål — dette er en ubemannet nattsesjon. Alle avvik du finner logges, de blokkerer ikke.

## Fase 0 — Pakk ut og orienter deg (maks 20 min)

1. Pakk ut zipen til `./design-fasit/` og les i denne rekkefølgen:
   - `readme.md` (rotnivå — regler, tokens, komponentindeks, rollefordeling)
   - `tokens/akhq-tokens.css` (ENESTE tokenkilde — bruk verbatim, aldri legg til/fjern/omdøp tokens)
   - `jarvis/jarvis-base.css` + `jarvis/jarvis-base.js` (delt fundament for alle 12 skjermene)
   - `github.md` (kobling til kodebasen)
2. List alle filer i `jarvis/` og noter mtime. Bygg en manifest-tabell i `./natt-rapport.md`:
   `| fil | mtime | funnet | tokens-ok | clay-ok | tilstander-ok |`

## Fase 1 — Verifiser at fasiten er komplett og oppdatert (siste 48 t)

**Skjermplanen — nøyaktig disse 12 skal finnes i `jarvis/`, alle endret siste 48 timer:**

| # | Fil | Jobb |
|---|-----|------|
| 1 | `meg-hjem.html` | Flaten: Én-ting-nå-kort, tråd, composer, kø-indikator |
| 2 | `meg-saker.html` | Saker-køen: statusgrupper, kanal-faner, anrop-radvariant |
| 3 | `meg-sak.html` | Én sak utvidet: utkast, Godkjenn/Rediger/Avvis, «Sendt via Gmail» |
| 4 | `meg-kalendervakt.html` | Avvikskort m/ diff-blokk, Godkjenn alle |
| 5 | `meg-dagen.html` | Agenda-tidslinje: nå-linje, innboksblokker, reisetid |
| 6 | `meg-morgenbrief.html` | Dokument 08:30: kø-tall, tre viktigste, lyd 1:40 |
| 7 | `meg-kveldsjournal.html` | Dagens fasit + refleksjon → ak-brain |
| 8 | `meg-ukesreview.html` | SLA-%, token-bar, kanal-fordeling, gled/neste |
| 9 | `meg-maskinrom.html` | Innsamler-helse, «Kjør nå», feilet-tilstand |
| 10 | `meg-historikk.html` | Read-only revisjonslogg m/ søk + kanalfilter |
| 11 | `meg-innstillinger.html` | Fire ting: kanaler, SLA, stemme, stille tidsrom |
| 12 | `meg-fangst.html` | Clay-mic 72px, type-chips, autolagring, «Fanget → inbox» |

**Per fil, kjør disse sjekkene og før resultatet inn i manifest-tabellen:**

1. **Finnes + fersk:** filen eksisterer og mtime < 48 t. Mangler den eller er eldre → logg som `MANGLER`/`UTDATERT`.
2. **0 hex utenfor tokens:** `grep -E '#[0-9a-fA-F]{3,6}' <fil>` — eneste lovlige treff er saksnumre (`#2026-…`) og anker-lenker. Alle farger skal være `var(--*)`.
3. **Maks 1 clay-flate:** tell forekomster av `btn now`/`--accent` som fyllflate. Fasit: hjem=1 (godkjenn), sak=1 (godkjenn), vakt=1 (Godkjenn alle), fangst=1 (mikrofonen), alle andre=0.
4. **0 attrapper:** ingen `href="#"`, ingen tomme `onclick`. Alle `onclick="location.href=…"` skal peke på en fil som finnes i `jarvis/`.
5. **Tilstander til stede:** hjem (haster/tom/godkjent m/ angre) · saker (6/10+/1/tom/laster/feil m/ retry) · sak (venter/godkjent/sendt/avvist) · vakt (avvik/ren/godkjent/avvist) · maskinrom (OK/feilet/kjører) · historikk (treff/ingen treff). Sjekk at DOM-nodene for hver tilstand finnes (`hidden`-attributter + demo-brytere).
6. **Interaksjonskontrakt:** `data-od-id` på regioner/paneler/CTA · `role="dialog"` på artefaktet · Escape lukker · fokusretur til utløser (i `jarvis-base.js`) · SLA-tid alltid i `.sla`/mono med «igjen»/«over frist» · lys+mørk via `data-theme` + `localStorage['akhq-theme-meg']` · bruddpunkter ≤640 (bunn-ark) og ≥1101 (sidepanel 380px).

Skriv Fase 1-konklusjon i `natt-rapport.md`: KOMPLETT eller liste over avvik. Fortsett uansett til Fase 2 med det som finnes.

## Fase 2 — Port til kode (resten av natten)

**Mål:** ruten `/meg` med alle 12 flater/artefakter, som egen modul `src/features/jarvis/` (eller prosjektets tilsvarende konvensjon — les kodebasen først og følg dens mønstre for routing, state og mappestruktur).

**Arkitekturbeslutninger (faste, ikke diskuter):**
1. `/meg` er ÉN rute. Køen, sak, vakt, dagen, brief, journal, review, maskinrom, historikk, innstillinger og fangst er ARTEFAKTER i et panel (sidepanel ≥1101px, bunn-ark ellers) styrt av state (`activeArtifact`), IKKE nye ruter. Deep-link via query-param (`/meg?artefakt=saker&sak=2026-0847`).
2. Domenemodell — port verbatim:
   ```ts
   type Kanal = 'EPOST'|'SMS'|'IMESSAGE'|'TELEGRAM'|'ANROP'|'KALENDER'|'TASK';
   type SakStatus = 'VENTER'|'GODKJENT'|'AVVIST'|'UTFORT'|'UTLOPT';
   interface Sak { id: string; kanal: Kanal; status: SakStatus; avsender: string;
     emne: string; innhold: string; foreslattSvar: string; frist: string; // ISO, opprettet + 6t
     opprettet: string; }
   ```
   Tilsvarende `Avvik` (vakten: type konflikt/reisetid/varsel, diff før/etter), `LoggRad` (historikk: tid, handling, kanal, godkjentAv, sakId), `InnsamlerStatus` (maskinrom).
3. Gullregelen i kode: ingen mutasjon uten eksplisitt godkjenn-handling. `POST /saker/:id/godkjenn` er eneste vei til sending; 10 s angrefrist implementeres klient-side før kallet fyres. Alt utført skrives til revisjonsloggen med `godkjentAv` + tidsstempel.
4. «Én ting nå»-valget er en ren funksjon, port fotnoten fra hjem-skjermen: over SLA vinner (mest over først) → ellers minst tid igjen → likt: ANROP før skriftlig. Skriv enhetstest på den.
5. Stil: importer `tokens/akhq-tokens.css` uendret. Kopier `jarvis-base.css` som modulens fundament. Ingen nye hex, ingen nye tokens. Clay-monopolet håndheves: én `btn now` per skjermtilstand.
6. Demodata: samle universet fra HTML-filene (Øyvind/Mette/GFGK/Henrik/anropet/kalender-invitasjonen + behandlet/utløpt) i ÉN fil `jarvis-demo.ts` bak et repository-interface, så ekte innsamlere kan byttes inn uten UI-endring.
7. Familie-Jarvis skal IKKE inn — ingen familie-widget, ingen barnedata, noe sted.

**Rekkefølge (commit per steg, konvensjonelle commit-meldinger):**
1. Typer + demodata + «én ting nå»-funksjonen m/ tester
2. Skall: `/meg`-rute, toppbar, tråd, composer, artefaktpanel m/ fokuskontrakt (Escape, fokusretur, scrim), ⌘K-palett
3. Skjerm 1–3 (kjernen) m/ alle tilstander
4. Skjerm 4–5 (vaktene)
5. Skjerm 6–8 (døgnrytmen)
6. Skjerm 9–11 (systemet)
7. Skjerm 12 (fangsten)
8. Sluttsjekk: kjør lint + typecheck + tester; klikk gjennom alle artefakter i begge temaer og begge bredder (bruk Playwright hvis oppsatt); oppdater `natt-rapport.md` med Fase 2-status per skjerm

**Definisjonen av ferdig per skjerm:** pikselnær fasiten i begge moduser · alle tilstander fra fasiten nåbare · ingen attrapper · `data-od-id` bevart · SLA-tider regnes fra `frist` (ikke hardkodede strenger) · touch-mål ≥44px.

## Fase 3 — Morgenrapport

Avslutt `natt-rapport.md` med: hva som er portet og verifisert · avvik funnet i Fase 1 · bevisste avvik fra fasiten med begrunnelse · det som IKKE ble rukket, i prioritert rekkefølge · tre konkrete spørsmål til Anders som blokkerer neste steg. Ikke pynt på status — en ærlig rød linje er mer verdt enn en grønn løgn.
