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

| Oppgave | Eier | Status |
|---|---|---|
| Koble Stripe kort-form til Billing Portal (K1) | Anders + Claude | I kveld |
| Ferdigstill Workbench (Bolk-serien) | Workbench-sesjon | Pågår |
| Commit/rydd design-handover-reorg | Design-sesjon | Pågår |
| Roter de 4 beta-passordene (sikkerhet) | Anders (Supabase) | Gjenstår |

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

---

## Beslutningspunkter for Anders

1. **Workbench i MVP?** Skal hele workbench-serien (Bolk 1/2/...) være med i
   første lansering, eller kan den vente til v1.1? Påvirker hvor lenge Fase 1 tar.
2. **Hard launch-dato denne uka?** Sett en dag → da vet vi når Fase 3/4 må skje.
3. **Hvem lukker de andre sesjonene** før merge (Fase 3)?
