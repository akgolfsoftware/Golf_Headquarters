# Sesjonsplan med kvalitetssikring — AK Golf HQ · 3. juni 2026

Plan for gjenstående arbeid i denne sesjonen: få MVP trygt fra dagens tilstand til
lansert. Hvert ledd har en eksplisitt **QA-port** som MÅ bestås før neste ledd starter.

## Mål og omfang (utledet fra sesjonskontekst)
- **Mål:** lansere AK Golf HQ MVP (booking + PlayerHQ + CoachHQ/AgencyOS + marketing).
- **Omfang:** siste mile — verifisering → merge til `main` → prod-deploy. IKKE ny
  feature-bygging (SG-tracking + #4/#5/#7 er parkert; workbench eies av annen sesjon).
- **Utgangspunkt:** alle 10 kritiske audit-funn lukket og pushet. tsc + build grønn.
- **Tidsramme:** ~90 min aktiv Claude-tid + venting på andre sesjoner/din prod-konfig.

## Roller
- **Claude:** verifisering, kode-fiks, merge-utførelse, røyktest.
- **Anders:** koordinere de andre sesjonene, prod-konfig (Vercel/Stripe/Supabase), godkjenninger.

---

## Ledd 0 — Stabiliser arbeidstreet
- **Beskrivelse:** alle aktive sesjoner (2–3) committer sitt arbeid. Verifiser rent tre.
- **Tid:** ~15 min (avhenger av andre sesjoner) · **Ansvar:** Anders (koordinerer) + Claude (verifiserer)
- **KPI:** 0 ucommittede filer; branch ahead/behind = 0.
- 🔒 **QA-PORT:** `git status` tomt + ingen fremmede filer. Ikke start Ledd 1 før dette.

## Ledd 1 — Statisk verifisering
- **Beskrivelse:** `prisma validate && generate`, `tsc --noEmit`, `npm run build`.
- **Tid:** ~5 min · **Ansvar:** Claude
- **KPI:** prisma gyldig · tsc 0 feil · build «Compiled successfully».
- 🔒 **QA-PORT:** alle tre grønne. Rødt → fiks før Ledd 2 (ikke gå videre med kjent feil).

## Ledd 2 — Levende verifisering (e2e + røyktest)
- **Beskrivelse:** `npm run e2e` + manuell røyktest av fire kjerneflyter:
  auth/onboarding · booking → Stripe checkout · PlayerHQ-dashboard · CoachHQ/AgencyOS-timeplan.
- **Tid:** ~20 min · **Ansvar:** Claude
- **KPI:** e2e grønn · alle fire flyter fullfører · booking oppretter ordre · AgencyOS `/uka` viser timeplan.
- 🔒 **QA-PORT:** alle flyter passerer. Avvik logges; kritisk feil → fiks + kjør Ledd 1 på nytt.

## Ledd 3 — Merge til main
- **Beskrivelse:** PR `feat/fase0-design-port` → `main`, gjennomgå diff, merge.
- **Tid:** ~15 min · **Ansvar:** Claude (utfører) + Anders (godkjenner)
- **KPI:** PR opprettet · diff gjennomgått · merge uten konflikt.
- 🔒 **QA-PORT (FØR):** kun ÉN sesjon aktiv (de andre lukket) — unngå git-race.
  🔒 **QA-PORT (ETTER):** build grønn på `main` etter merge.

## Ledd 4 — Prod-konfig
- **Beskrivelse:** sett prod env-vars (Stripe live, CRON_SECRET, ANTHROPIC, krypteringsnøkler,
  BOOKING_DRAFT_SECRET) i Vercel · aktiver Stripe Customer Billing Portal · roter de 4 beta-passordene.
- **Tid:** ~20 min · **Ansvar:** Anders (Vercel/Stripe/Supabase) + Claude (verifiserer sjekkliste)
- **KPI:** alle kritiske + anbefalte env satt · Billing Portal aktiv · passord rotert.
- 🔒 **QA-PORT:** env-sjekkliste komplett mot `.env.example` — ingen manglende kritiske vars.

## Ledd 5 — Deploy + prod-røyktest
- **Beskrivelse:** deploy til Vercel prod · reconnect Google Kalender-tokens · røyktest i prod ·
  Supabase advisor-sjekk (RLS).
- **Tid:** ~15 min · **Ansvar:** Claude + Anders
- **KPI:** deploy grønn · Google freebusy uten `invalid_grant` · fire flyter virker i prod · advisor 0 ERROR.
- 🔒 **QA-PORT:** prod-røyktest passerer → **LANSERT**. Feil → rollback (se `docs/rollback.md`).

---

## Evaluering / retro (etter Ledd 5)
- **Tid:** ~5 min · **Ansvar:** Claude + Anders
- Kort: hva gikk bra, hva må følges opp post-launch (K10-migrasjon, SG-tracking, #4/#5/#7).

## Totalt tidsestimat
| Ledd | Tid |
|---|---|
| 0 Stabiliser | 15 min |
| 1 Statisk | 5 min |
| 2 Levende | 20 min |
| 3 Merge | 15 min |
| 4 Prod-konfig | 20 min |
| 5 Deploy + røyktest | 15 min |
| Retro | 5 min |
| **Sum aktiv** | **~95 min** |

Pluss ventetid på andre sesjoner (Ledd 0) og din prod-konfig (Ledd 4) — utenfor Claude-tid.

## Prinsipp for kvalitetssikring
Ingen ledd starter før forrige ledds QA-port er **bestått med bevis** (kommando-output, ikke
antakelse). Samme disiplin som prosjektets design-porting-gate: verifiser før du går videre.
