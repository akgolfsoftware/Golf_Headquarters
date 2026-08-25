# W5 Marketing/Auth/Forelder/System — variant tracking (overnight)

> **DELVIS SUPERSEDERT 25.08.2026:** Train-lock er fasit for PlayerHQ/AgencyOS — de radene
> er historikk. Marketing-/auth-/system-rader kan fortsatt være aktuelle (marketing har egen
> fasit: ak-golf-website); forelder-omfanget er uavklart (AAPNE-SPORSMAAL T4).

Status: **slug-port 2026-08-11/12 (PP-8)** — marketing-katalog + system-tilstander bygget.
Alle rader: m390/d1280 sign-off = Anders.

| Mal | Variant-ruter | Kode slug | Status | Sign-off |
|---|---|---|---|---|
| marketing-katalog | `/coacher`, `/coacher/[slug]` | `marketing-coacher-liste` / `marketing-coacher-detalj` | Bygget PP-8 | [ ] |
| marketing-katalog | `/anlegg`, `/anlegg/[slug]` | `marketing-anlegg-liste` / `marketing-anlegg-detalj` | Bygget PP-8 | [ ] |
| marketing-katalog | `/blogg`, `/blogg/[slug]` | `marketing-blogg-liste` / `marketing-blogg-detalj` | Bygget PP-8 | [ ] |
| marketing-katalog | `/cases` | `marketing-cases` | Bygget PP-8 | [ ] |
| marketing-katalog | `/turneringer`, `/turneringer/[slug]` | `marketing-turneringer-liste` / `marketing-turnering-detalj` | Bygget PP-8 (KPI/leaderboard retematchet, ikke i selve malen) | [ ] |
| system-tilstander | `/offline` | `system-offline` | Bygget PP-8 | [ ] |
| system-tilstander | `not-found.tsx` (404) | `system-404` | Bygget PP-8 | [ ] |
| system-tilstander | `error.tsx` (segment 500) | `system-500` | Bygget PP-8 | [ ] |
| system-tilstander | `global-error.tsx` (katastrofal 500) | `system-500-global` | Bygget PP-8, egen inline-stil (ingen layout/fonter tilgjengelig) | [ ] |
| system-tilstander | vedlikehold / ingen tilgang (403) | — | **Ingen ekte rute ennå.** `PaperIkon.vedlikehold` / `PaperIkon.ingenTilgang` + `PaperTilstand` er klare til bruk, ikke koblet til noen side. Åpent punkt, se PR #417-body. | — |
| auth-flyt / auth-bankid | `/auth/bankid` | `auth-bankid` | Fantes fra før (spot-sjekket PP-8, ingen avvik funnet: tittel, primær-CTA, tom-tilstand OK) | [ ] |
| auth-samtykke | `/auth/samtykke-venter` | (SamtykkeVenterV2, egen slug) | Fantes fra før (spot-sjekket PP-8, ingen avvik funnet) | [ ] |
| forelder-barn | — | — | **Ingen rute bruker denne malen ennå** — ikke bygget, verken før eller i PP-8. Ute av scope her; flagg til neste W5-runde. | — |
| marketing-side | `/` | `marketing-forside` | Bygget 13.08 (skallvariant «forside») | [ ] |
| marketing-side | `/coaching` | `marketing-coaching` | Bygget 13.08 (forside) | [ ] |
| marketing-side | `/playerhq` | `marketing-playerhq` | Bygget 13.08 (forside) | [ ] |
| marketing-side | `/junior` | `marketing-junior` | Bygget 13.08 (forside) | [ ] |
| marketing-side | `/om-oss` | `marketing-om-oss` | Bygget 13.08 (forside) | [ ] |
| marketing-side | `/treningsfilosofi` | `marketing-treningsfilosofi` | Bygget 13.08 (forside) | [ ] |
| marketing-side | `/suksess` | `marketing-suksess` | Bygget 13.08 (forside) | [ ] |
| marketing-side | `/jobb` | `marketing-jobb` | Bygget 13.08 (forside) | [ ] |
| marketing-side | `/kontakt` | `marketing-kontakt` | Bygget 13.08 (forside + skjemafelt fra auth-flyt) | [ ] |
| marketing-side | `/priser` | `marketing-priser` | Bygget 13.08 (skallvariant «pris») — innhold følger BUSINESS-RULES (299/gratis), ikke fasitens demo-pakker | [ ] |
| marketing-side | `/faq` | `marketing-faq` | Bygget 13.08 (pris/qa) | [ ] |
| marketing-side | `/vilkar` | `marketing-vilkar` | Bygget 13.08 (skallvariant «prosa») | [ ] |
| marketing-side | `/personvern` | `marketing-personvern` | Bygget 13.08 (prosa) | [ ] |
| marketing-side | `/cookies` | `marketing-cookies` | Bygget 13.08 (prosa) | [ ] |

## Avvik og valg i marketing-side-runden (13.08)

1. **Marketing er nå fast lys.** Fasiten sier «Marketing er primært LYS — ingen tema-toggle»,
   men rot-layoutens default for alt utenom /portal|/admin|/forelder er mørk. Løst med
   scope-tokens på `.pk-page` (mønster fra `wang-tokens.css`), ikke med tema-klassen.
   Dette gjør også katalog-flatene fra PP-8 lyse — de var mørke frem til nå.
2. **«Bestill time» rettet fra clay til blekk** — begge marketing-fasitene bruker `.btn ink`.
3. **Presis-mønstre uten motstykke i fasiten er fjernet:** parallakse-hero, scroll-avsløring
   (`m-avslor`), klebrig telefonsekvens og SG-illustrasjon på forsiden, samt de mørke
   telefon-mockupene på /playerhq (erstattet av Paper-native app-utsnitt med samme tall).
   `forside-app-mock.tsx` og `scroll-animasjon.tsx` ble foreldreløse og er slettet.
4. **Kontaktskjemaet:** samme server-action og feltnavn, men native felt med `name` —
   de fem skjulte speil-feltene er borte.
5. **Trekkspill er native `<details>`** (som i fasiten), ikke klient-state.

Oppdateres fortløpende under overnight.
