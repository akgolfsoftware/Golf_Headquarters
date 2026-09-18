# LØP FERDIG

Verifisert 18.09.2026: alle TN-skjermer har fasit-ramme, hydreres uten `sc-for`/`{{ }}`, logo `/tn/`, Øyvind der spiller vises, SP får 390 når den finnes.

Tester: `node --experimental-strip-types --test src/components/tn/frame-key.test.ts src/components/tn/hydrate.test.ts src/lib/tn/access.test.ts` — 10/10.

| ID | Skjerm | 1440 | 390 | SP-ramme | Øyvind | IDENTISK |
|---|---|---|---|---|---|---|
| TN-01 | Skall | ja | ja | PLAYER_NAV | — | IDENTISK |
| TN-02 | Oversikt | ja | ja | nei (trener) | ja | IDENTISK |
| TN-00 | Workdesk | ja | ja | 390 | ja | IDENTISK |
| TN-03 | Fellestesting | ja | ja | — | ja | IDENTISK |
| TN-04 | Protokoller | ja | ja | — | ja | IDENTISK |
| TN-05 | Protokolldetalj | ja | ja | — | ja | IDENTISK |
| TN-06 | Uttak | ja | ja | — | ja | IDENTISK |
| TN-07 | Rangliste | ja | ja | skjult SP | ja | IDENTISK |
| TN-08 | Skoler | ja | ja | — | ja | IDENTISK |
| TN-09 | Poster | ja | ja | 390 | ja | IDENTISK |
| TN-10 | Post | ja | ja | 390 | ja | IDENTISK |
| TN-11 | Dokumenter | ja | ja | 390 | ja | IDENTISK |
| TN-12 | Samtykke | ja | ja | 390 | ja | IDENTISK |
| TN-12b | Samtykkereise | ja | 1440-fallback | ja | ja | IDENTISK |
| TN-13 | Turneringer | ja | ja | 390 | ja | IDENTISK |
| TN-14 | Samling | ja | ja | 390 | ja | IDENTISK |
| TN-15 | College | ja | ja | — | ja | IDENTISK |
| TN-16 | Månedsplan | ja | ja | 390 | ja | IDENTISK |
| TN-17 | Ny turnering | ja | ja | — | ja | IDENTISK |
| TN-18 | Tilgang | ja | ja | — | — | IDENTISK |
| TN-19 | Inviter | ja | ja | — | — | IDENTISK |
| TN-20 | Apparatet | ja | ja | 390 | ja | IDENTISK |
| TN-21 | Referanse | ja | ja | 390 | ja | IDENTISK |
| TN-22 | IUP-kart | ja | 1440-fallback | — | — | IDENTISK |
| TN-23 | IUP i dag | — | ja | 390 | ja | IDENTISK |
| TN-24 | IUP-samtale | ja | 1440-fallback | ja | ja | IDENTISK |
| TN-25 | Utviklingssjekk | ja | 1440-fallback | ja | ja | IDENTISK |
| TN-26 | Måltavle | ja | 1440-fallback | ja | ja | IDENTISK |
| TN-27 | Prosessmål | ja | 1440-fallback | — | ja | IDENTISK |
| — | Live | ja | ja | 390 | ja | IDENTISK |
| — | Testreise | ja | 1440-fallback | — | ja | IDENTISK |

**Unntak:** Live finnes ikke i Claw-zip. Rammen er bygget på samme tokens/typografi som IUP/oversikt. Der zip mangler 390, vises 1440-artboardet (det *er* filen).

SP lander på IUP i dag. FO ≠ Live. `?tilstand=tom|laster|feil` der zip har artboard.
