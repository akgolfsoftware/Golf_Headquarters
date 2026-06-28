# akgolf.no (Marketing) + Booking + Forelder + Auth + System — skjermer (desktop + mobil)

> **Dato:** 2026-06-29 · Kilde: `docs/MASTER-SKJERMPLAN.md` + faktisk rute-enumerering.
> **Hva dette er:** De resterende plattform-flatene, i samme desktop/mobil-format som
> `playerhq-agencyos-skjermer-desktop-mobil.md`. Sammen dekker de to dokumentene **hele plattformen**.

**Statustegn:** ✓ = ferdig/designet · **R** = responsiv (fungerer på mobil+desktop, men ikke v10-pusset) ·
~ = delvis · – = ikke laget. ★ = kjerneskjerm.

---

## Auth (innlogging og oppstart) — `/auth`
| Skjerm | Adresse | Mobil | Desktop | iPad |
|---|---|:--:|:--:|:--:|
| Logg inn ★ | `/auth/login` | ✓ | ✓ | ✓ |
| Registrer ★ | `/auth/signup` | ✓ | ✓ | ✓ |
| Glemt passord ★ | `/auth/forgot-password` | ✓ | ✓ | ✓ |
| BankID ★ | `/auth/bankid` | ✓ | ✓ | ✓ |
| Onboarding (spiller, 8 steg) | `/auth/onboarding` | ✓ | ✓ | – |
| Logget ut | `/auth/logget-ut` | ✓ | ✓ | – |
| Tilbakestill passord | `/auth/reset-password` | R | R | – |
| Sjekk e-post | `/auth/check-email` | R | R | – |
| Onboarding (forelder) | `/auth/onboarding/forelder` | R | R | – |
| Foreldresamtykke (token) | `/auth/guardian-consent/[token]` | R | R | – |
| Samtykke venter | `/auth/samtykke-venter` | R | R | – |

## Forelder (foreldreportal) — `/forelder`
> Bygget mobil + desktop, men datakvalitet ikke fullverifisert. iPad gjenstår.

| Skjerm | Adresse | Mobil | Desktop | iPad |
|---|---|:--:|:--:|:--:|
| Forelder-hjem | `/forelder` | ✓ | ✓ | – |
| Barn (oversikt) | `/forelder/barn` | ✓ | ✓ | – |
| · Barn-detalj | `/forelder/barn/[childId]` | ✓ | ✓ | – |
| Bookinger | `/forelder/bookinger` | R | R | – |
| Coach | `/forelder/coach` | R | R | – |
| Fakturaer | `/forelder/fakturaer` | R | R | – |
| Økonomi | `/forelder/okonomi` | R | R | – |
| Samtykke | `/forelder/samtykke` | R | R | – |
| Ukerapport | `/forelder/ukerapport` | R | R | – |
| Innstillinger | `/forelder/innstillinger` | R | R | – |
| Varsler | `/forelder/varsler` | R | R | – |
| Inviter forelder (token) | `/inviter/forelder/[token]` | R | R | – |

## Marketing (akgolf.no — offentlige sider)
> Offentlige nettsider er **responsive** (fungerer mobil + desktop). Kun forsiden er v10-designet;
> resten er funksjonelle, men ikke pusset til designsystemet ennå.

| Skjerm | Adresse (`/(marketing)/…`) | Mobil | Desktop |
|---|---|:--:|:--:|
| Forside | `/` | ✓ | ✓ |
| Coaching | `coaching` | R | R |
| Coacher (+ profil) | `coacher`, `coacher/[slug]` | R | R |
| Junior | `junior` | R | R |
| Priser | `priser` | R | R |
| PlayerHQ (salgsside) | `playerhq` | R | R |
| Om oss | `om-oss` | R | R |
| Kontakt | `kontakt` | R | R |
| Jobb | `jobb` | R | R |
| FAQ | `faq` | R | R |
| Suksess | `suksess` | R | R |
| Treningsfilosofi | `treningsfilosofi` | R | R |
| Cases | `cases` | R | R |
| Anlegg (+ detalj) | `anlegg`, `anlegg/[slug]` | R | R |
| Blogg (+ innlegg) | `blogg`, `blogg/[slug]` | R | R |
| Turneringer (+ detalj) | `turneringer`, `turneringer/[slug]` | R | R |
| Cookies / Personvern / Vilkår | `cookies`, `personvern`, `vilkar` | R | R |

## Booking (markedsføring → kjøp)
> Booking finnes på flere flater: **marketing** (offentlig kjøp), **PlayerHQ** (`/portal/booking`,
> egen doc), **AgencyOS** (`/admin/bookinger`, egen doc), **Forelder** (`/forelder/bookinger`).

| Skjerm | Adresse (`/(marketing)/…`) | Mobil | Desktop |
|---|---|:--:|:--:|
| Booking-oversikt | `booking` | R | R |
| · Booking-tjeneste | `booking/[slug]` | R | R |
| · Bekreft | `booking/[slug]/bekreft` | R | R |
| · Kvittering | `booking/kvittering/[bookingId]` | R | R |

## akgolf.no/stats — det store offentlige stats-universet (45 sider)
> Funksjonelt med **ekte data**, **responsivt** (mobil + desktop), men **ikke v10-designet**.
> Dette er funnel-flaten som skal løftes til verdensklasse (se `akgolf-stats-claude-design-prompt.md`).
> Alle adresser under `/(marketing)/stats/…`:

| Område | Sider | Mobil | Desktop |
|---|---|:--:|:--:|
| Forside + uka + 2026 | `stats`, `stats/uka`, `stats/2026` | R | R |
| Spillere + årgang | `stats/spillere(/[slug])`, `stats/aargang(/[aar])` | R | R |
| Baner + klubber + regioner | `stats/baner(/[slug])`, `stats/klubber(/[slug])`, `stats/regions(/[slug])` | R | R |
| Turneringer + tour | `stats/turneringer(/[slug])(/statistikk)`, `stats/tour/[slug]` | R | R |
| Leaderboards + norske | `stats/leaderboards`, `stats/norske` | R | R |
| PGA-stats | `stats/pga` + `drive-distance`, `fairway-pct`, `gir-pct`, `putt-explorer`, `putts-per-round`, `scoring-avg`, `sg-total`, `spillere(/[dg_id])` | R | R |
| Verktøy (kalkulatorer) | `stats/verktoy` + `avstand`, `score-til-hcp`, `sg-estimator`, `tour-ekvivalent`, `whs-kalkulator` | R | R |
| Sammenlign + SG-sammenlign | `stats/sammenlign-spillere`, `stats/sg-sammenlign(/start)(/resultat/[id])` | R | R |
| Blogg + søk + quiz + wrapped + min progresjon | `stats/blogg(/[slug])`, `stats/sok`, `stats/quiz`, `stats/wrapped/[slug]`, `stats/min-progresjon` | R | R |

## System + interne sider (ikke for vanlige brukere)
| Skjerm | Adresse | Merknad |
|---|---|---|
| Offline-side | `/offline` | Vises uten nett. Funker. |
| 404 (ikke funnet) | (system) | v10-design tegnet, ikke koblet til ekte 404 ennå. |
| Onboard coach | `/onboard/coach` | 4-stegs coach-oppstart. Ikke v10-designet. |
| Onboard klubb | `/onboard/klubb` | 5-stegs klubb-oppstart. Ikke v10-designet. |
| Interne/demo-flater (~29 stk) | `/(internal)/*`, `/intern/komponenter/*`, `*-demo` | Utviklerverktøy — ikke ekte brukerskjermer; flere bør ryddes før lansering. |

---

## Hovedkonklusjoner

1. **Auth-kjernen er komplett** (login/signup/glemt/BankID på mobil+desktop+iPad). Restflyt (reset, samtykke) er responsiv, ikke v10-pusset.
2. **Forelderportalen** er bygget mobil+desktop (11 ruter), men datakvalitet ikke fullverifisert; iPad gjenstår.
3. **akgolf.no Marketing + 45 stats-sider** er **responsive og funksjonelle** på begge — men kun forsiden er v10-designet. Stats-flaten er den prioriterte funnelen som skal til verdensklasse.
4. **iPad** gjenstår på alt utenom Auth-kjernen.

> Sammen med `playerhq-agencyos-skjermer-desktop-mobil.md` dekker dette **hele plattformen**:
> PlayerHQ (153), AgencyOS (146), Marketing/stats (72), Forelder (11), Auth (11) + system/interne.
> Full 6-hake-status: `docs/MASTER-SKJERMPLAN.md`.
