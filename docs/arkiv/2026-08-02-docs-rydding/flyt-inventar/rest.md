# Flyt-inventar — Forelder/Auth/Marketing/Diverse

Generert 2026-06-17. Knapp-/flyt-inventar for å avdekke døde knapper.
Dekker: Forelder (11), Auth/Onboarding (11), Marketing-kjerne (14), Stats-hovedsider (7), Diverse (2).

Status-koder: **OK** = fører et sted ekte · **DØD** = href="#" / ingen handler / går ingensteds ·
**STUB (bevisst)** = `disabled`/placeholder med kommentar om at funksjon kommer senere (ikke ekte død knapp, men ikke-funksjonell i dag).

---

## Delt chrome

### Forelder-shell (sidebar + mobil-nav, `src/components/forelder/sidebar.tsx`)
Alle 10 nav-lenkene peker på eksisterende ruter — alle OK:
Oversikt `/forelder` · Mine barn `/forelder/barn` · Bookinger `/forelder/bookinger` · Okonomi `/forelder/okonomi` · Coach `/forelder/coach` · Ukerapport `/forelder/ukerapport` · Fakturaer `/forelder/fakturaer` · Varsler `/forelder/varsler` · Samtykker `/forelder/samtykke` · Innstillinger `/forelder/innstillinger`.

### Marketing-header (`MarketingHeader`)
| Element | Fører til | Status |
|---|---|---|
| AK Golf logo | / | OK |
| Coaching | /coaching | OK |
| Slik trener vi | /treningsfilosofi | OK |
| PlayerHQ | /playerhq | OK |
| Anlegg | /anlegg | OK |
| Om oss | /om-oss | OK |
| Logg inn | /auth/login | OK |
| Book tid | /booking | OK |

### Marketing-footer (`MarketingFooter`)
| Element | Fører til | Status |
|---|---|---|
| Performance / Performance Pro | /coaching | OK |
| Drop-in Flex | /booking | OK |
| PlayerHQ | /playerhq | OK |
| Coachene | /coacher | OK |
| Anlegg | /anlegg | OK |
| Partnere | /#partnere | OK |
| Karriere | /jobb | OK |
| post@akgolf.no | mailto:post@akgolf.no | OK |
| Fredrikstad · Sarpsborg | /kontakt | OK |
| Personvern / Vilkår / Cookies | /personvern · /vilkar · /cookies | OK |

---

# FORELDER

## /forelder
| Element | Fører til | Status |
|---|---|---|
| "Se alle" (barn) | /forelder/barn | OK |
| Fokus-barn kort | /forelder/barn/[childId] | OK |
| "Se fakturaer" | /forelder/fakturaer | OK |
| "Se alle" (kommende) | /forelder/bookinger | OK |
| "Historikk" | /forelder/fakturaer | OK |
| "Bytt barn" | /forelder/barn | OK |

## /forelder/barn
| Element | Fører til | Status |
|---|---|---|
| Barn-kort | /forelder/barn/[childId] | OK |

## /forelder/barn/[childId]
| Element | Fører til | Status |
|---|---|---|
| "Mine barn" | /forelder/barn | OK |
| Oversikt / Uke / Mål / Økonomi faner | ?tab=… | OK |

## /forelder/bookinger
| Element | Fører til | Status |
|---|---|---|
| (lesemodus, ingen handlinger) | — | OK |

## /forelder/fakturaer
| Element | Fører til | Status |
|---|---|---|
| (lesemodus, ingen handlinger) | — | OK |

## /forelder/okonomi
| Element | Fører til | Status |
|---|---|---|
| Utestående-varsel-lenke | /forelder/fakturaer | OK |
| "Se alle" | /forelder/fakturaer | OK |

## /forelder/ukerapport
| Element | Fører til | Status |
|---|---|---|
| (lesemodus, ingen handlinger) | — | OK |

## /forelder/varsler
| Element | Fører til | Status |
|---|---|---|
| Varsel-checkboxes | `disabled` | STUB (bevisst — push-varsler "kommer i Spor 1") |

## /forelder/innstillinger
| Element | Fører til | Status |
|---|---|---|
| "Rediger" | /portal/meg | OK |
| "Se alle" | /forelder/barn | OK |
| "Endre passord" | /portal/meg/innstillinger/sikkerhet | OK |
| "To-faktor-autentisering" | /portal/meg/innstillinger/sikkerhet | OK |
| "Logg ut" | /auth/login | OK |

## /forelder/samtykke
| Element | Fører til | Status |
|---|---|---|
| Samtykke-checkboxes | lagreSamtykker (server action) | OK |
| "Lagre samtykker" | lagreSamtykker (server action) | OK |

## /forelder/coach
| Element | Fører til | Status |
|---|---|---|
| "Kontakt support" | mailto:support@akgolf.no | OK |

---

# AUTH / ONBOARDING

## /auth/login
| Element | Fører til | Status |
|---|---|---|
| Logo | / | OK |
| "Glemt passord?" | /auth/forgot-password | OK |
| "Logg inn" (submit) | signInWithPassword (Supabase) | OK |
| "Logg inn med Google" | signInWithOAuth | OK |
| "Opprett konto" | /auth/signup | OK |

## /auth/signup
| Element | Fører til | Status |
|---|---|---|
| Logo | / | OK |
| Pakke-valg (3) / rolle-valg | state | OK |
| Vilkår / Personvern | /vilkar · /personvern | OK |
| "Opprett konto" (submit) | signUp → /auth/check-email el. /auth/onboarding | OK |
| "Logg inn" | /auth/login | OK |

## /auth/forgot-password
| Element | Fører til | Status |
|---|---|---|
| "Tilbake" | /auth/login | OK |
| "Send lenke" (submit) | resetPasswordForEmail | OK |
| "Tilbake til innlogging" | /auth/login | OK |

## /auth/reset-password
| Element | Fører til | Status |
|---|---|---|
| Logo | / | OK |
| "Lagre nytt passord" (submit) | updateUser → /portal | OK |

## /auth/check-email
| Element | Fører til | Status |
|---|---|---|
| Lenke ved ikke-funnet e-post | /auth/signup | OK |
| "Tilbake til innlogging" | /auth/login | OK |

## /auth/onboarding (spiller-wizard, 7 steg)
| Element | Fører til | Status |
|---|---|---|
| Neste / Tilbake / Hopp over (alle steg) | state-overgang + lagring | OK |
| "Fullfør" (steg 7) | completeOnboarding → /portal | OK |
| "Hopp over og gå til portalen" | completeOnboarding → /portal | OK |

## /auth/onboarding/forelder (4 steg)
| Element | Fører til | Status |
|---|---|---|
| Neste / Tilbake | state + lagring | OK |
| "Fullfør" (steg 4) | completeForelderOnboarding → /forelder | OK |

## /onboard/coach (4 steg)
| Element | Fører til | Status |
|---|---|---|
| Neste / Tilbake | state + lagring | OK |
| "Fullfør" | completeCoachOnboarding → /admin | OK |

## /onboard/klubb (5 steg)
| Element | Fører til | Status |
|---|---|---|
| Neste / Tilbake | state + lagring | OK |
| "Fullfør" | completeKlubbOnboarding → /admin | OK |

## /auth/guardian-consent/[token]
| Element | Fører til | Status |
|---|---|---|
| "Gå til foreldreportal" (om akseptert) | /forelder | OK |
| "Bekreft samtykke" (submit) | confirmGuardianConsent → /auth/login?... | OK |
| Personvern / Vilkår | /personvern · /vilkar | OK |

## /inviter/forelder/[token]
| Element | Fører til | Status |
|---|---|---|
| Lenke ved brukt invitasjon | /auth/login | OK |
| "Godta og opprett konto" (submit) | aksepterInvitasjon (redirect i action) | OK |

---

# MARKETING — KJERNE

## /(marketing) (forsiden)
| Element | Fører til | Status |
|---|---|---|
| Book gratis kartleggings-økt / Book drop-in / Book gratis kartlegging | /booking | OK |
| Se tjenestene | #tjenester | OK |
| Start Performance | /coaching | OK |
| Søk opptak / Snakk med Anders | /kontakt | OK |
| GFGK-kort | /anlegg/gamle-fredrikstad-gk | OK |
| WANG / Miklagard / Mulligan (info-kort) | (ikke-klikkbare) | OK |

## /(marketing)/anlegg
| Element | Fører til | Status |
|---|---|---|
| Book en økt / Book simulatortid | /booking | OK |
| Kontakt oss | /kontakt | OK |
| GFGK-kort | /anlegg/gamle-fredrikstad-gk | OK |
| Miklagard-kort | /anlegg/miklagard-golfklubb | OK |
| Mulligan-kort | /booking | OK |

## /(marketing)/anlegg/[slug]
| Element | Fører til | Status |
|---|---|---|
| Ring klubben | tel:… | OK |
| Se alle anlegg | /anlegg | OK |
| Klubbens nettside / Book greenfee / Bli medlem | ekstern URL | OK |
| Se tilgjengelige tider | /booking | OK |

## /(marketing)/blogg
| Element | Fører til | Status |
|---|---|---|
| Søk | /blogg?q=… | OK |
| Kategori-filterknapper | filter | OK |
| Featured / post-kort / "Les hele saken" | /blogg/[slug] | OK |
| Pagination "Forrige" / "Neste" | `disabled` | STUB (bevisst — "én side foreløpig") |

## /(marketing)/coacher
| Element | Fører til | Status |
|---|---|---|
| Book tid med en coach / Book en økt | /booking | OK |
| Se coaching-pakkene | /coaching | OK |
| Anders / Markus (coach-kort) | /coacher/[slug] | OK |
| Kontakt oss | /kontakt | OK |

## /(marketing)/coaching
| Element | Fører til | Status |
|---|---|---|
| Se pakkene | #pakker | OK |
| Book enkelttime / Se ledige tider | /booking | OK |
| Bli Performance / Performance Pro-kunde | subscribe-flyt | OK |
| Kontakt oss | /kontakt | OK |

## /(marketing)/booking
| Element | Fører til | Status |
|---|---|---|
| Lokasjon-kort | ?lokasjon=… | OK |
| Coach-kort / Gruppe-økt | ?lokasjon=…&trener=… | OK |
| Endre lokasjon / trener | /booking[?lokasjon=…] | OK |
| Tjeneste-kort | /booking/[slug] | OK |
| Ta kontakt | mailto:post@akgolf.no | OK |

## /(marketing)/cases
| Element | Fører til | Status |
|---|---|---|
| Case-kort / "Les historien" | /cases/[slug] | OK |
| Book gratis kartleggings-økt | /booking | OK |

## /(marketing)/turneringer
| Element | Fører til | Status |
|---|---|---|
| Filter-faner (Alle/Norske/Norge/Pro) | ?tab=… | OK |
| Turnering-kort | /turneringer/[slug] | OK |

## /(marketing)/priser
| Element | Fører til | Status |
|---|---|---|
| Se pakkene | #pakker | OK |
| Book drop-in | /booking | OK |
| Start Performance / Se coaching-pakkene | /coaching | OK |
| Snakk med oss / Søk opptak | /kontakt | OK |
| Opprett (gratis) konto | /auth/signup | OK |

## /(marketing)/kontakt
| Element | Fører til | Status |
|---|---|---|
| Book direkte / Book en økt | /booking | OK |
| post@akgolf.no / Send oss en e-post | mailto:post@akgolf.no | OK |
| Telefon | tel:+4748216540 | OK |
| Ring klubben (3 stk) | ekstern maps/tel | OK |

## /(marketing)/om-oss
| Element | Fører til | Status |
|---|---|---|
| Book første time | /booking | OK |
| Møt coachene | /coacher | OK |
| Ta kontakt | /kontakt | OK |

## /(marketing)/junior
| Element | Fører til | Status |
|---|---|---|
| Meld på (alle nivåer) | #pamelding | OK |
| Spør oss | /kontakt | OK |
| Send e-post | mailto:post@akgolf.no | OK |

## /(marketing)/playerhq
| Element | Fører til | Status |
|---|---|---|
| Prøv PlayerHQ gratis / Prøv gratis nå / Opprett konto | /auth/signup | OK |
| Se hva du får | #funksjoner | OK |
| Se coaching-pakker / Bli Academy-kunde | /coaching | OK |

---

# MARKETING — STATS (hovedsider)

## /(marketing)/stats
| Element | Fører til | Status |
|---|---|---|
| Se ukens turneringer / Se norske i aksjon | /turneringer | OK |
| Utforsk alle verktøy | #moduler | OK |
| Se alle / Norsk spillerbase | /stats/spillere | OK |
| Åpne leaderboard | /stats/norske | OK |
| PGA Tour Stats | /stats/pga | OK |
| SG-sammenligning | /stats/sg-sammenlign | OK |
| Prøv gratis / Start PlayerHQ gratis | /portal | OK |
| Se priser / Se coaching-tilbud | /priser · /coaching | OK |

## /(marketing)/stats/pga
| Element | Fører til | Status |
|---|---|---|
| Breadcrumb | /stats | OK |
| Statistikk-kort (6) | /stats/pga/[metrikk] | OK |
| **"Lek deg med putt-data"** | **`StatsBtn` uten href/onClick** | **DØD — ren `<button>` uten handler; skulle trolig peke til /stats/pga/putt-explorer (ruta finnes!)** |
| Prøv gratis | /portal | OK |
| Sammenlign uten konto / Prøv sammenligningsverktøyet | /stats/sg-sammenlign | OK |

## /(marketing)/stats/spillere
| Element | Fører til | Status |
|---|---|---|
| Breadcrumb | /stats | OK |
| Tier-/årgang-/view-filtre | ?tier=…/?aar=…/?view=… | OK |
| Spiller-kort + tabell-rad | /stats/spillere/[slug] | OK |
| Paginering Forrige/Neste | ?side=… | OK |
| **"Sjekk om jeg er her"** | **`href="#søk"`, `onClick={undefined}`** | **DØD — anchor-mål `#søk` finnes ikke på siden; ingen onClick** |
| Prøv PlayerHQ gratis | /playerhq | OK |

## /(marketing)/stats/baner
| Element | Fører til | Status |
|---|---|---|
| Breadcrumb | /stats | OK |
| Start gratis | /auth/signup | OK |
| Utforsk stats | /stats | OK |

## /(marketing)/stats/turneringer
| Element | Fører til | Status |
|---|---|---|
| Breadcrumb | /stats | OK |
| Tour-/tids-filtre | ?tour=…/?tid=… | OK |
| Se alle norske spillere | /stats/norske | OK |
| Turnering-kort | /stats/turneringer/[slug] | OK |

## /(marketing)/stats/verktoy
| Element | Fører til | Status |
|---|---|---|
| Verktøy-kort (5) | /stats/verktoy/[verktøy] | OK |
| Kom i gang | /portal/meg/abonnement | OK |
| Prøv SG-sammenligning | /stats/sg-sammenlign | OK |

## /(marketing)/stats/sg-sammenlign
| Element | Fører til | Status |
|---|---|---|
| Start sammenligning (innlogget) | /stats/sg-sammenlign/start | OK |
| Start gratis sammenligning (utlogget) | /auth/signup?next=… | OK |
| Logg inn (utlogget) | /auth/login?next=… | OK |

---

# DIVERSE

## /meg
| Element | Fører til | Status |
|---|---|---|
| (rent display, ingen interaktive elementer) | — | OK |

## /team-gfgk (presentasjons-deck)
| Element | Fører til | Status |
|---|---|---|
| Forrige / Neste / dot-knapper | go(n) (intern slide-state) | OK |
| Tastatur (piler / Home / End / PgUp/Dn) | go(n) | OK |

---

## Oppsummering: 45 skjermer, 2 ekte døde knapper

**Ekte døde knapper (2):**
1. **/(marketing)/stats/pga — "Lek deg med putt-data"** — rendret som ren `StatsBtn` (`<button>`) uten `href` eller `onClick`. Gjør absolutt ingenting ved klikk. Mest alvorlig fordi destinasjonen `/stats/pga/putt-explorer` FAKTISK finnes — knappen er bare aldri koblet til.
2. **/(marketing)/stats/spillere — "Sjekk om jeg er her"** — `<a href="#søk" onClick={undefined}>`. Anchor-målet `#søk` finnes ikke på siden, og onClick er eksplisitt undefined. Hopper ingensteds.

**Bevisste stubs (ikke ekte døde, men ikke-funksjonelle i dag) — 2:**
- /forelder/varsler — varsel-checkboxes er `disabled` (kommentar: push-varsler "kommer i Spor 1").
- /(marketing)/blogg — pagination "Forrige"/"Neste" er `disabled` (kommentar: "én side foreløpig").

**Resten:** Alle forelder-, auth-/onboarding- og marketing-kjerne-skjermene er rene — hver knapp/lenke fører til en eksisterende rute, server action eller gyldig mailto/tel/ekstern URL. Ingen lenker til KUTT-rutene (/suksess, /stats/blogg). Forelder-shell-nav (10 lenker) er fullstendig koblet.
