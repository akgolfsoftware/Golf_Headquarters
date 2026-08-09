# W6 — telling, konsolideringsgate og manifest (WANG + GFGK), 2026-08-09

Planen (`docs/port/skjermplan-tegnet-og-wireframe.md`) sier: **W6 må telles først** — WANG og
GFGK er ikke med i de 343. Her er tellingen, verifisert mot kode på `main` (`src/app/`).

## Telling — 10 ruter, ikke ~40

| Rute | Kilde | Fasit i dag |
|---|---|---|
| `/team-wang` (4 faner: oversikt · plan · skole · foreldre) | `team-wang/page.tsx` + `wang-fellesside.tsx` | JA — Claude Design «WANG Toppidrett Fredrikstad Golf v2» |
| `/team-wang/coach` | `coach/coach-arsplan.tsx` | **NEI → tegnet nå** |
| `/team-wang/logg-inn` | `logg-inn/wang-login.tsx` | **NEI → tegnet nå** |
| `/gfgk-junior` (forside, 9 seksjoner) | `gfgk-junior/page.tsx` | JA — Claude Design «GFGK Junior og Elite» |
| `/gfgk-junior/gruppe/[gruppe]` (4 grupper, én mal) | `gruppeplan-innhold.tsx` | JA — samme kanon |
| `/gfgk-junior/treningsplaner` | `treningsplaner-innhold.tsx` | JA — samme kanon |
| `/gfgk-junior/veileder` (kunnskapsbase, 4 seksjoner) | `veileder/page.tsx` | JA — samme kanon |
| `/gfgk-junior/veileder/[slug]` (artikkel) | `veileder/[slug]/page.tsx` | **NEI → tegnet nå** |
| `/gfgk-junior/kalender` | `kalender/page.tsx` (delte komponenter, ikke GFGK-egne) | **NEI → tegnet nå** |
| `/team-gfgk` (klubbdeck, egen `deck.css`) | `team-gfgk/presentation.tsx` | Egen deck-kanon — **utenfor W6** |

`_components`, `_data`, layouts og `manifest.webmanifest` er ikke skjermer.

## Konsolideringsgate — vedtak til Anders

1. **Begge micrositene beholder eget chrome.** WANG (navy/mint, Montserrat + Quattrocento) og
   GFGK (gull/rød/teal, Source Sans + Plex Mono) har egne token-sett scopet under `.wang-tp` /
   `.gfgk-jr`. De skal **ikke** legges på PlayerHQ-Paper-shellen — Paper er AK-produktets
   identitet, micrositene er klubbenes. **Anbefalt ja.**
2. **`/gfgk-junior/kalender` beholdes som egen rute**, men fikses: den bruker i dag delte
   app-komponenter (`FlereGrupperKalender`, `EmptyState`) og bryter dermed GFGK-uttrykket.
   Tegnet fasit erstatter dem med GFGK-egne faner + øktkort.
3. **De fire gruppesidene er ÉN mal**, ikke fire skjermer — allerede løst i kode
   (`generateStaticParams`). Ingen ny tegning.
4. **`/team-gfgk` (klubbdeck) tas ikke inn i skjermregnskapet** — det er en presentasjon, ikke
   en app-flate. Hører hjemme i W5 (marketing) hvis den skal revideres.
5. **W6-tillegg til regnskapet: +10 ruter** (343 → 353), hvorav 6 allerede har fasit.

## Tegnet i denne økten (4 filer)

| Fil | Rute | Mal | Tilstander | Én ting nå | Merknad |
|---|---|---|---|---|---|
| `fase2/wang/wang-coach-arsplan.html` | `/team-wang/coach` | §11 dashbord + §12 detalj | Suksess, Tom | «Publiser uke 37–44» (navy) | Trenerverktøy, desktop-kritisk. WANG-tokens verbatim. Elevliste fra AgencyOS-gruppa. |
| `fase2/wang/wang-logg-inn.html` | `/team-wang/logg-inn` | §8 skjema/flerstegs | Suksess (e-post), Kode, Feil | «Send meg kode» / «Logg inn» | 430px. Engangskode, ikke passord. Fyller §8-hullet fra W1 (skjemavalidering). |
| `fase2/gfgk/gfgk-kalender.html` | `/gfgk-junior/kalender` | §10 filter + liste | Suksess, Tom | «Gi meg beskjed» (ghost i tom) | Erstatter delte app-komponenter med GFGK-uttrykk. Ingen persondata. |
| `fase2/gfgk/gfgk-veileder-artikkel.html` | `/gfgk-junior/veileder/[slug]` | §12 detaljside | Suksess, Tom (avpublisert) | ingen fylt CTA — lesevisning | Prosa-mal for alle 25 artiklene, kategorifarge fra `KATEGORI_META`. |

Alle fire: kun merkevare-tokens fra `wang-tokens.css` / `gfgk-junior-tokens.css` (ingen Paper-
tokens, ingen clay), `data-od-id` på alt interaktivt, norsk bokmål, 44px trykkflater.

## Åpne punkter

1. **WANG-innlogging:** koden bruker `requirePortalUser` — er engangskode på e-post riktig
   mekanisme, eller skal WANG-elever logge inn med samme AK-konto som PlayerHQ? Tegnet som
   engangskode; bytt til AK-SSO hvis Anders sier det.
2. **GFGK-kalender vs. gruppeside:** overlapper delvis. Beholdt som egen rute (vedtak 2) fordi
   den viser alle fire gruppene samtidig — vurder redirect hvis bruken er lav.
3. **Logoer:** begge micrositene bruker egne bildefiler (`/team-wang/icon-*.png`,
   `/gfgk-junior/logo-mark.png`). Wireframene har tekstmerke som plassholder.

## W7 finnes ikke i planen

Bølgerekka er W1–W6. W3 (Meg/Booking/Talent/Coach), W4 (AgencyOS-rest, ~111) og W5
(Marketing/Forelder/Auth) står fortsatt igjen — se separat spørsmål til Anders.
