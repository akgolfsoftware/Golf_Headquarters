# IA-ryddeplan — foreldreløse skjermer + dubletter (forslag)

> ## ✅ STATUS 2026-06-25 (verifisert mot faktisk kode — «kjør alle» + «koble alt additivt»)
> Planen var **delvis utdatert** — flere «🟢» var alt gjort eller i konflikt med en bevisst fasit-flyt.
> Endelig tilstand etter full verifisering + utførelse (11 commits):
>
> **KOBLET denne økten (additivt, null sletting):**
> - **A1** — «MER»-gruppe lenker `anlegg` + `okter` (9ef691c). `sprak/sikkerhet/varsler` dekkes av inline-seksjoner.
> - **A2** — `coach/videoer` i coach sub-nav (779a1ab).
> - **A3** — «Se profil» → coach-profil i coach-hub (130b813).
> - **A6** — `tester/foreslatte` + `benchmarks` actions (779a1ab).
> - **A7/A8/A9** — `organisasjon`/`stats/overview`/`stats/moderering`/`godkjenn-portal` i ny **ADMIN-only «Intern»-seksjon** (6362476).
> - **A10** — `blogg/cases/suksess/junior` i ny «Ressurser»-footerkolonne; `priser`+`faq` i header (9ef691c, c9772f65).
> - **A12** — logout lander nå på den dedikerte `/auth/logget-ut`-skjermen (c9772f65).
> - **B6** — `trackman/[sessionId]` konsolidert → redirect til kanon `mal/trackman/[id]` (c107593).
>
> **ALT HÅNDTERT FRA FØR (verifisert):** B1/B3 (redirects), B2 (`oppfolging`=alias), B4 (`caddie` redirect; `planlegge`/`komm`/`hjelp`/`videoer` er EKTE sider, ikke dubletter), B8 (`onboard/coach`+`klubb` er alt redirects).
>
> **VERIFISERT = IKKE EN DUBLETT (planen tok feil — rør IKKE):** B7 `putte-laboratoriet` (831l ekte) + `reach`/`break-tabell` (ingen rent redirect-mål). B9 `inviter/forelder` vs `auth/guardian-consent` = to DISTINKTE aktive flyter (forelder-invitasjon vs GDPR-mindreårig-samtykke), hver med egen link-generator.
>
> **GJENSTÅR (ekte beslutninger, ikke mekanisk):**
> - **A4-anlegg / A5** — `booking/anlegg/[id]` + `admin/anlegg/[id]` krever en anlegg-velger-UI → hører til design-runden. (A4-coach dekket via `booking/ny?coachId`.)
> - **B5** — to ~440-linjers EKTE kalender-sider; «hvilken er kanon?» = Anders-valg.
> - **C1** — StatsCmdK: stats er bevisst ute av v1.


> **Hva dette er:** forslag per skjerm for #3 (foreldreløse) + #4 (dubletter/stale), utledet fra det
> kode-verifiserte `SKJERM-KNAPP-KART.md`. **Ingenting er gjort her** — dette er kartet, ikke jobben.
> Hak av (✅ = kjør / ✋ = la stå) per rad, så utfører jeg de godkjente. «Pensjoner» = redirect til kanonisk
> rute (ingen sletting av innhold) med mindre du sier slett.
>
> **Risiko-merking:** 🟢 trygt (redirect/koble nav-lenke) · 🟡 verifiser data først · 🔴 sletter UI/flate.

## A · Foreldreløse — KOBLE inn i nav (bygget, men ingen knapp peker dit)

### PlayerHQ
| # | Skjerm | Anbefaling | Risiko | Kjør? |
|---|---|---|---|---|
| A1 | `meg/innstillinger/{anlegg,okter,sprak,varsler,sikkerhet}` | Legg dem i Innstillinger-menyen (i dag vises bare ai-coach/integrasjoner/personvern) | 🟢 | ☐ |
| A2 | `coach/videoer` | Koble fra Coach-hub SUB-NAV | 🟢 | ☐ |
| A3 | `coach/[coachId]` (coach-profil) | Koble «se coach-profil» fra coach-hub, ELLER pensjoner | 🟡 | ☐ |
| A4 | `booking/coach/[id]` + `booking/anlegg/[id]` | Koble «book direkte med coach/anlegg» fra booking-hub, ELLER pensjoner | 🟡 | ☐ |

### AgencyOS
| # | Skjerm | Anbefaling | Risiko | Kjør? |
|---|---|---|---|---|
| A5 | `admin/anlegg/[id]` | Legg rad-lenke fra anlegg-lista til detaljen | 🟢 | ☐ |
| A6 | `admin/tester/foreslatte` + `tester/benchmarks` | Koble fra Tester-siden (fane/knapp) | 🟢 | ☐ |
| A7 | `admin/organisasjon` (hub) | Koble fra System-gruppe, ELLER pensjoner (barna nås alt via sidebar) | 🟡 | ☐ |
| A8 | `admin/stats/overview` + `stats/moderering` | Koble fra Analyse, ELLER pensjoner (QA-intern) | 🟡 | ☐ |
| A9 | `admin/godkjenn-portal*` | Intern QA — flytt til `/admin/intern/*` eller pensjoner | 🟡 | ☐ |

### Marketing (footeren viser dem ikke)
| # | Skjerm | Anbefaling | Risiko | Kjør? |
|---|---|---|---|---|
| A10 | `/blogg`, `/cases`, `/faq`, `/junior` | Legg i footer/header der de skal leve | 🟢 | ☐ |
| A11 | `/priser` + `/turneringer` | Vurder i header (konverterings-kritisk) | 🟢 | ☐ |

### Auth
| # | Skjerm | Anbefaling | Risiko | Kjør? |
|---|---|---|---|---|
| A12 | `/auth/logget-ut` | Koble `logout()` hit (går i dag til `/login`), ELLER arkiver | 🟡 | ☐ |

## B · Pensjoner / konsolider (dubletter & stale flater)

| # | Skjerm(er) | Anbefaling | Risiko | Kjør? |
|---|---|---|---|---|
| B1 | `admin/calendar*` (dead toggle) | Redirect → `/admin/kalender` (kanon) | 🟢 | ☐ |
| B2 | `admin/queue` + `admin/oppfolging` | Behold én, redirect den andre | 🟢 | ☐ |
| B3 | `admin/finance` + `admin/messages` + `admin/board` | Redirect → `/admin/okonomi` · `/admin/innboks` · `/admin/spillere?view=tavle` | 🟢 | ☐ |
| B4 | `admin/planlegge` · `kommunikasjon` · `hjelp` · `videoer` · `caddie`(stub) | Redirect til kanonisk / pensjoner | 🟡 | ☐ |
| B5 | PlayerHQ «kalender» ×3 (`/portal/kalender` · `/tren/kalender` · `gjennomfore?tab=kalender`) | Velg én kanonisk, fjern de to andre inngangene | 🟡 | ☐ |
| B6 | `portal/trackman/[sessionId]` (dup av `mal/trackman/[id]`) | Redirect → kanon | 🟢 | ☐ |
| B7 | `portal/reach` · `trening/break-tabell` · `trening/putte-laboratoriet` | Sannsynlig dødt — 🔴 arkiver (bekreft) | 🔴 | ☐ |
| B8 | `/onboard/coach` + `/onboard/klubb` (parallell ukoblet onboarding) | Avklar vs `/auth/onboarding`; 🔴 arkiver den ene | 🔴 | ☐ |
| B9 | Forelder-invitasjon ×2 (`/inviter/forelder/[token]` vs `/auth/guardian-consent/[token]`) | Avklar hvilken er kanon, pensjoner den andre | 🟡 | ☐ |

## C · Stats-navet henger løst (eget produkt — ikke i v1)
| # | Sak | Anbefaling | Risiko | Kjør? |
|---|---|---|---|---|
| C1 | `StatsCmdK` bygget men aldri montert → ~15 stats-foreldreløse | Monter den ELLER lag `stats/layout.tsx` med nav | 🟡 | ☐ |

---

**Slik svarer du:** «kjør alle 🟢» (jeg tar de trygge redirects/koblinger), eller plukk rader (f.eks. «A1, A5, B1-B3»),
eller «kjør alt unntatt 🔴». De 🔴-røde (sletting) rører jeg ikke uten eksplisitt ja per rad.

*Utledet 2026-06-24 fra SKJERM-KNAPP-KART.md (kode-verifisert mot 406 ruter).*
