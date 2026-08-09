# W5 — konsolideringsgate og manifest (Marketing · Forelder · Auth · System), 2026-08-09

Anslaget i `docs/port/skjermplan-tegnet-og-wireframe.md` var **68** (Marketing 40 + Forelder 11 +
Auth 10 + System 7). Talt mot kode på `main`: marketing-treet er større enn 40 — men det er fordi
**`(marketing)/stats/*` er et eget produkt**, ikke sider i AK Golfs marketing.

## Konsolideringsgate — vedtak til Anders

### 1. `(marketing)/stats/*` er ikke marketing — det er DataGolf-produktet
~45 ruter (`stats/pga/*`, `stats/spillere/[slug]`, `stats/turneringer/[slug]`,
`stats/regions/[slug]`, `stats/leaderboards`, `stats/sg-sammenlign*`, `stats/verktoy/*`,
`stats/wrapped/[slug]`, `stats/aargang/*`, `stats/klubber/*`, `stats/baner/*`, `stats/quiz`,
`stats/uka` …). De deler ikke IA med resten av marketing: de er datatunge tabeller og
utforskere med egne filtre. **Tas ut av W5 og gjøres til egen bølge (W7-stats)**, og henger
uansett på **PR-F** (DataGolf-plassering), som fortsatt er åpen. — *Anbefalt ja.*

### 2. Resten av marketing er 27 ruter → 2 maler
- **Marketing-side:** forside · coaching · playerhq · junior · priser · om-oss ·
  treningsfilosofi · faq · kontakt · jobb · suksess · vilkar · personvern · cookies (14 ruter,
  tre varianter av samme skall: hero+bevis, pris, prosa).
- **Katalog:** coacher(+`[slug]`) · anlegg(+`[slug]`) · blogg(+`[slug]`) · cases ·
  turneringer(+`[slug]`) (11 ruter — liste + detalj er samme mal uansett innholdstype).
- `(marketing)/booking*` (4 ruter) har **allerede fasit**: `fase1/booking.html`. — *Anbefalt ja.*

### 3. Auth: 18 ruter → 2 maler
`logg-inn` og `login` er samme flate (alias), `signup`, `check-email`, `forgot-password`,
`reset-password`, `bankid`, `etter-innlogging`, `logget-ut`, `onboarding`, `checkout-resume`,
`onboard/coach`, `onboard/klubb` er tilstander i **auth-flyt**. `guardian-consent/[token]`,
`lyd-samtykke/[token]`, `samtykke-venter`, `onboarding/forelder`, `inviter/forelder/[token]`
er **auth-samtykke** — skilt ut fordi samtykke har egne regler (aldri forhåndshuket, punktvis,
hva deles med hvem før knappen). `fase1/innlogging.html` består som fasit for
førstegangsinntrykket. — *Anbefalt ja.*

### 4. Forelder: 11 ruter → hub (har fasit) + 1 mal
`fase1/foreldreportal.html` er fasit for `/forelder`. `barn`, `barn/[childId]`, `ukerapport`,
`okonomi`, `fakturaer`, `bookinger`, `varsler`, `innstillinger`, `samtykke`, `coach` deler
skall og personvernregel — **én mal med fanevisninger**. — *Anbefalt ja.*

### 5. System: 7 → 1 mal med fem tilstander
`offline`, 404, 500, vedlikehold, ingen tilgang (403), funksjon av (FEATURES-gate).
`dev-banekart`, `(internal)/design-system` og `intern/komponenter/*` er interne verktøy —
**ikke skjermer**. — *Anbefalt ja.*

**Netto: 68 anslått (+45 stats) → stats ut som egen bølge → 27+18+11+7 = 63 reelle ruter →
6 tegnede maler, hvorav 5 nye + 2 som allerede hadde fasit (booking, foreldre-hub).**

## Tegnet i denne økten (6 wireframes + 2 delte filer)

| Fil | Rute(r) den er fasit for | Mal | Tilstander |
|---|---|---|---|
| `marketing/marketing-side.html` | `(marketing)/` + coaching, playerhq, junior, priser, om-oss, treningsfilosofi, faq, kontakt, jobb, suksess, vilkar, personvern, cookies | editorial hero / pris / prosa | Forside · Priser · Prosa |
| `marketing/marketing-katalog.html` | coacher(+`[slug]`), anlegg(+`[slug]`), blogg(+`[slug]`), cases, turneringer(+`[slug]`) | §10 liste + §12 detalj | Liste · Detalj · Tomt filter |
| `auth/auth-flyt.html` | `/auth/logg-inn`, `login`, `signup`, `check-email`, `forgot-password`, `reset-password`, `bankid`, `etter-innlogging`, `logget-ut`, `onboarding`, `checkout-resume`, `/onboard/*` | §8 flerstegs | Logg inn · Kode · Feil kode · Ny bruker · Glemt passord · Logget ut |
| `auth/auth-samtykke.html` | `/auth/guardian-consent/[token]`, `lyd-samtykke/[token]`, `samtykke-venter`, `onboarding/forelder`, `/inviter/forelder/[token]` | §8 skjema | Foresatt · Lydopptak · Venter · Utløpt |
| `forelder/forelder-barn.html` | `/forelder/barn`(+`[childId]`), `ukerapport`, `okonomi`, `fakturaer`, `bookinger`, `varsler`, `innstillinger`, `samtykke`, `coach` | §11 hub + §12 detalj | Barnet mitt · Økonomi · Flere barn · Uten samtykke |
| `system/system-tilstander.html` | `/offline`, 404, 500, vedlikehold, 403, FEATURES-gate | systemtilstand | Offline · Finnes ikke · Teknisk feil · Vedlikehold · Ingen tilgang |
| `felles/w5-base.css` | — | tokens + to skall (editorial + produktkolonne) | akhq-tokens v3.1 **verbatim** |
| `felles/w5-demo.js` | — | delt demo-rigg | tilstand + tema (temanøkkel per flate) |

## Beslutninger i tegningen

- **Marketing er primært lys** — ingen tema-toggle der. Produktflatene (auth, forelder, system)
  har lys + mørk via `data-theme`, med temanøkkel satt per flate på `<html data-temanokkel>`.
- **Fylt aksentflate er tillatt i marketing** (baseline v2.1: kun marketing/innlogging), men CTA
  er fortsatt blekk. Ingen av de seks filene bruker oransje som knappefarge.
- **Bilder er stripete plassholdere med mono-tekst** som sier hva som skal inn og i hvilket
  format — ikke håndtegnet SVG-illustrasjon.
- **Samtykke er aldri forhåndshuket**, og hvert punkt kan svares på for seg. Personvernlinjen
  «du ser oppmøte, plan og økonomi — ikke spillerens notater» står i selve foreldrevisningen,
  ikke bare i vilkårene.
- **Systemtilstander sier hva som fortsatt virker.** Feilkoden er med, men i mono nederst,
  for support — aldri som overskrift.

## Åpne punkter til Anders

1. **Stats-sporet (vedtak 1):** skal `(marketing)/stats/*` bli W7 med egen visuell avklaring —
   den er datatung og ligner mer på AgencyOS enn på marketing? Den er uansett blokkert av PR-F.
2. **Marketing-visualitet:** skjermplanen ba om egen avklaring før W5. Tegnet på baseline-tokens
   (Poppins/Lora, papir, blekk-CTA) med marketing-typeskalaen fra tokens. Vil du ha et mer
   uttrykksfullt marketing-språk — større kontrast, farget flate, egne fonter — er det en egen
   runde, og den bør tas før nettsidene kodes.
3. **BankID:** tegnet som sidestilt valg under engangskode. Er BankID faktisk i bruk i dag, eller
   er det en plan? Påvirker om den skal ligge først.
4. **`logg-inn` vs `login`:** to ruter, samme flate. Kan den ene bli redirect?

## Regnskap

W6 la +10 ruter (343 → 353). W3 tegnet 6 maler, W4 6, W5 6. Bølgeplanen W1–W6 er dermed
**gjennomført** — det som gjenstår er de to sporene som ble skilt ut underveis:
**stats-sporet** (~45, blokkert av PR-F) og **drift/AgenticOS-sporet** (~14, W4 vedtak 8).
