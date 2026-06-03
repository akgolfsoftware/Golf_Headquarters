# Ferdigstillingsplan MVP — AK Golf HQ

Opprettet 2026-06-03. Mål: alt ferdig og lansert **denne uka**.
Kontekst: 2-3 Claude-sesjoner jobber samtidig i samme arbeidskopi på branch
`feat/fase0-design-port`. Selve launch-detaljene ligger i `docs/go-live-sjekkliste.md`
og `LAUNCH-CHECKLIST.md` — denne planen handler om å få arbeidet TRYGT i mål.

---

## Gjeldende status (3. juni)

- ✅ Kritiske audit-funn K2–K10 lukket (committet + pushet)
- 🟢 K1 Stripe: betaling ekte, kort-form kobles (Anders' plan)
- 🟡 Workbench (Bolk 1/2 + mer) — annen sesjon jobber, delvis ucommittet
- 🟡 design-handover-reorg — ~250 filer ucommittet i treet (annen sesjon)
- ⏳ K10 drill-modeller — krasj-sikret, migrasjon dokumentert (post-launch ok)
- ⏳ Beta-passord ikke rotert ennå

---

## Fase 0 — Stabiliser arbeidstreet (NÅ, mens sesjoner kjører)

Den største risikoen er git-race mellom sesjonene. Regler så lenge >1 sesjon kjører:

1. **INGEN branch-bytte.** Bli på `feat/fase0-design-port`. (Det var derfor dialogen
   om «switching to main» dukket opp — ikke bytt, ikke stash andres arbeid.)
2. **Hver sesjon eier sine filer og committer SITT eget arbeid løpende.**
   Ingen store ucommittede hauger som henger. De ~250 design-handover-filene må
   committes av sesjonen som lagde dem.
3. **Én sesjon committer om gangen** — unngå samtidige git-skriv.
4. Verifiser jevnlig: `git status` skal ikke vise fremmede ucommittede filer når
   du tror du er ferdig.

**Neste handling:** be hver aktive sesjon committe + pushe sitt arbeid. Mål: rent
arbeidstre (`git status` tomt) før Fase 2.

---

## Fase 1 — Fullfør gjenstående bygg (denne uka)

**Scope-beslutning (Anders, 3. juni): ALLE skjermer i planen vår skal med i MVP.
Ingen skjermer utsettes til v1.1.** Fasit: `docs/skjermplan.md` + skjerm-manifestene
(`docs/skjerm-manifest-playerhq.md`, `-agencyos.md`, `-workbench.md`).

### Infrastruktur/sikkerhet
| Oppgave | Eier | Status |
|---|---|---|
| Koble Stripe kort-form til Billing Portal (K1) | Anders + Claude | I kveld |
| Commit/rydd design-handover-reorg | Design-sesjon | Pågår |
| Roter de 4 beta-passordene | Anders (Supabase) | Gjenstår |

### Gjenstående skjermer (fra `docs/skjermplan.md` — alle MÅ ferdig)
| # | Skjerm | Rute | Innsats |
|---|---|---|---|
| 3 | Intern-spiller-leaderboard | `/portal/tren/turneringer/[id]` | re-scopes |
| 4 | Turnerings-scorecard per runde | `/portal/tren/turneringer/[id]/runde/[nr]` (+admin) | M |
| 5 | Live turnerings-tracking | `/portal/tren/turneringer/[id]/live` (+coach) | L |
| 7 | Shot-map / dispersion | `/portal/statistikk/shot-map` | M |
| 8 | Benchmark-skjerm | `/portal/mal/sg-hub/benchmark` | M |
| — | Workbench-serien (Bolk 1/2/...) | workbench-flatene | Pågår (egen sesjon) |

Hold `docs/skjermplan.md` oppdatert: marker `[x]` når hver skjerm er deployet.
MVP er IKKE klar for Fase 3 før alle boksene der er `[x]`.

K10 (drill-modeller) holdes UTENFOR MVP — krasj-sikret, gjøres post-launch
(se `docs/oppfolging-k10-drill-modeller.md`).

---

## Fase 2 — Verifikasjon (når alle sesjoner er committet)

Kjør fra ren branch, i rekkefølge:

```bash
npx prisma validate && npx prisma generate
npx tsc --noEmit        # skal være 0 feil
npm run build           # skal kompilere grønt
npm run e2e             # Playwright kjerneflyt
```

Manuell røyktest av de fire produktene:
- **Auth/onboarding:** signup → /auth/onboarding → lagrer → /portal
- **Booking:** velg coach → bekreft → Stripe checkout
- **PlayerHQ:** dashboard, treningsplan, live-økt
- **CoachHQ:** coach-login → /admin → spilleroversikt

Gå gjennom `docs/go-live-sjekkliste.md` punkt for punkt.

---

## Fase 3 — Merge til main (ÉN gang, koordinert)

Forutsetning: alle sesjoner ferdige, alt committet+pushet, Fase 2 grønn.

1. Sørg for at kun ÉN sesjon er igjen (lukk de andre).
2. Lag PR: `feat/fase0-design-port` → `main`.
3. Gå gjennom diff-en (stor — workbench + opprydding + audit-fikser).
4. Merge.

---

## Fase 4 — Deploy + røyktest i prod

1. Sett ALLE prod env-vars i Vercel (kritiske + anbefalte fra `.env.example`):
   Supabase, DATABASE_URL/DIRECT_URL, Stripe (live keys), RESEND, CRON_SECRET,
   ANTHROPIC_API_KEY, BOOKING_DRAFT_SECRET, NOTION_*, GOOGLE_TOKEN_ENCRYPTION_KEY.
2. Deploy til prod (Vercel).
3. Reconnect Google Calendar-tokens (var utløpt — `invalid_grant`).
4. Røyktest i prod: samme fire flyter som Fase 2.
5. Verifiser Supabase advisor = 0 ERROR (RLS).

---

## Post-launch backlog (ikke blokkerende)

- K10: legg til 3 Prisma-modeller + migrasjon + RLS, fjern guards
- Rute-konsolidering: calendar/kalender, analyse/analysere, approvals/godkjenninger, locations/anlegg
- Komponent-dedup: empty-state, profil-rediger-modal, sheet, sidebar (×7)
- Notion per-user OAuth: verifiser env satt i prod (ellers deaktiver knapp)

## SIST I KØEN — SG-tracking + statistikkføring (SG-mapping)

Design klart og bevart i `docs/superpowers/specs/2026-06-03-sg-tracking-design.md`.
**Parkert til etter alt over.** Venter på supplerende research (Perplexity, Grok, Gemini,
Manus) om hvordan systemet skal legges opp + full gjennomgang av masterdokumentet i cowork.
Starter IKKE før de dokumentene er inne og designet er endelig godkjent.
Mye av fundamentet finnes allerede (Shot-modell, slag-wizard, beregnSg) — gjenstår bro,
proximity, putt-baseline-fiks, mentalt scorekort.

---

## Beslutningspunkter for Anders

1. ✅ **AVKLART:** Alle skjermer i planen vår skal med i MVP — ingen utsettelse
   til v1.1. Workbench-serien inkludert. Fasit: `docs/skjermplan.md` + manifestene.
2. **Hard launch-dato denne uka?** Sett en dag → da vet vi når Fase 3/4 må skje.
   NB: med full skjerm-scope (#4,5,7,8 + workbench) er det mer arbeid i Fase 1 —
   #5 Live turnerings-tracking er «L» (stor). Vurder om den realistisk rekker uka.
3. **Hvem lukker de andre sesjonene** før merge (Fase 3)?
