# W5 Marketing/Auth/Forelder/System — variant tracking (overnight)

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
| marketing-side | forside/coaching/priser/playerhq m.fl. | — | Ikke rørt i PP-8 (egen fasit/oppgave, se `designsystem/paper/fase2/marketing/marketing-side.html`) — sjekk annen gren/PR før duplisert arbeid. | — |

Oppdateres fortløpende under overnight.
