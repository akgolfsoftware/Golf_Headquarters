# IA-ryddeplan — foreldreløse skjermer + dubletter (forslag)

> ## ✅ STATUS 2026-06-25 (verifisert mot faktisk kode — «kjør alle»)
> Ved kjøring viste det seg at planen var **delvis utdatert** — flere «🟢» var enten alt gjort eller
> i konflikt med en bevisst fasit-flyt. Resultat etter verifisering:
> - **B1 ✅ alt gjort** — `admin/calendar`/`finance`/`messages`/`board` ER redirects (kalender/okonomi/innboks/spillere?view=tavle).
> - **B2 ✅ alt håndtert** — `admin/oppfolging` re-eksporterer `admin/queue` (alias, ikke dublett).
> - **B3 ✅ = B1.**
> - **A2 ✅ koblet** — `coach/videoer` lagt i coach sub-nav (commit 779a1ab).
> - **A6 ✅ koblet** — `tester/foreslatte` + `tester/benchmarks` lagt som actions på Tester-siden (779a1ab).
> - **A5 ⚠ BESLUTNING** — anlegg-tiles lenker bevisst til `/admin/availability` (dokumentert fasit-flyt).
>   Å sende dem til `anlegg/[id]` ville bryte fasiten. Trenger Anders-valg: detalj som egen affordance, eller la stå.
> - **A1 ⚠ BESLUTNING** — Innstillinger er en portet fasit-skjerm. `anlegg/okter/sprak/sikkerhet(218l)/varsler`
>   finnes som egne skjermer; noen dublerer inline-seksjoner. Å legge 5 menyrader endrer fasit-designet → IA-valg, ikke mekanisk.
> - **B6 ⚠ IKKE rør** — `portal/trackman/[sessionId]` er en **fullverdig 473-linjers portert skjerm**, ikke en stub.
>   Ingenting lenker dit (ekte foreldreløs). Ikke auto-redirect (ville slettet en ekte skjerm). Beslutning: wire fra Workbench, eller pensjoner.
> - Resten (A3/A4/A7–A12, B4/B5/B7–B9, C1) gjenstår — flere er 🟡/🔴 som krever per-rad-avklaring.


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
