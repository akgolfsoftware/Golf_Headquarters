# MASTERPLAN LANSERING — oppdatert 12.08.2026

**Skrevet:** 2026-08-12 · **Avløser:** `masterplan-lansering-2026-08-11.md` (nattens mål er nådd —
denne planen dekker det som gjenstår fra bygget produkt til lansert produkt).
**Styrende underplaner:** `PIXEL-PERFECT-PLAN-COMPLETE.md` (skjerm-køen) · `docs/STATUS-NÅ.md` (snapshot).

---

## 0. Hvor vi faktisk står (målt 12.08, ikke antatt)

**Frontend — designporten er i praksis ferdigbygget:**
- Nattens seks PR-er (#415–#420) + #413/#414/#421/#422 er **merget til main** 12.08 morgen.
  Main er grønn (#422 rettet token-gap-gaten).
- Checklist: **0 `[x]` · 78 `[~]` · 9 `[ ]`** — de 9 er 8 templates-rader (shell-validering,
  ikke skjermer) + WANG-innlogging (blokkert av produktbeslutning, spørsmål 1 under).
  **Ingen andre in-scope skjermer står ubygget.**
- Galleri 12.08: **7 GODKJENN · 2 FIKS.** GFGK-kalender-fiksen kom med i #419 før merge.
  **Planbibliotek mobil er fortsatt åpen** (92 utvidede kort, mangler kompaktvisning).
- Åpne PR-er: #406 (WANG deling, draft — Anders' egen) · #382 (drill-bank guard).

**Backend — koden er klar, aktiveringen er ikke:**
- Stripe-herding (dedup, retry-cron, betingede sideeffekter) i prod. Betaling starter 1. sep
  (`BETALING_STARTER` i `src/lib/feature-flags.ts`) — alle er PRO gratis frem til da.
- Registrerte spillere (31+) har **aldri logget inn**; 0 push-abonnementer.
- P0-blokkere hos Anders: Resend DKIM · DNS (`akgolf.no` → Acuity-redirect) · Stripe
  live-nøkler/webhook-sjekk · Google Calendar (tokens PAUSED).
- `SCREENTEST_PASSWORD` er kompromittert (eksponert 03.08) og status-uavklart — må roteres.
- PII-funn i natt: WANG-preview-data har ekte elevnavn (mindreårige) — håndtert i galleriet,
  men datagrunnlaget må byttes til fiktive navn.

**Konklusjon:** det som skiller oss fra lansering er ikke bygging — det er **én mobilfiks,
sign-off, P0-aktivering i paneler, og lanseringsbryteren.**

---

## 1. Planen — seks faser i rekkefølge

### FASE 1 — Rydd og fiks (agent, i dag)
1. **Planbibliotek mobil:** bygg fasitens kompakte status-/fanevisning (eneste FIKS fra
   galleriet 12.08). Egen gren + PR + nytt skjermbilde.
2. **Roter `SCREENTEST_PASSWORD`:** ny verdi i Supabase + `.env.local` + GitHub-secrets i
   SAMME operasjon (jf. memory: DB-rotasjon glemmer `.env.local`). Verifiser med én innlogging.
3. **WANG-testdata:** bytt elevnavnene i preview-/testdatagrunnlaget til fiktive navn før
   neste galleri (PII, mindreårige).
4. **#382** (drill-bank guard): verifiser grønn og be Anders om merge-ja.

### FASE 2 — Sign-off (Anders, ~30 min fra iPhone)
5. Gå gjennom `SIGNOFF-GALLERI-2026-08-11.md` (kjernens 11) + `SIGNOFF-GALLERI-2026-08-12.md`
   (nattens 9) — GODKJENN/FIKS per skjerm. Agent setter `[x]` i `PAPER-ZIP-CHECKLIST.md`
   kun per din signering.
6. Svar på de **8 produktspørsmålene** i `NATTRAPPORT-2026-08-12.md` §Åpne spørsmål
   (WANG-innlogging, planbibliotek-panel, agenticos-samleflate, meg-tekst, WANG-årsplan,
   GFGK-kalender/artikkel, vedlikehold/403-ruter). Ingen blokkerer lansering.

### FASE 3 — P0-aktivering backend (Anders i paneler · agent i kode, parallelt)
**Anders (panel/DNS, ~30 min totalt):**
7. Resend DKIM for `send.akgolf.no` (SPF+MX er OK).
8. Stripe: verifiser live-nøkler i Vercel + at webhooken abonnerer på de 13 event-typene i
   `src/lib/stripe/handle-event.ts`, og kjør ÉN testbetaling som ender som rad i `Payment`.
9. Google Calendar: re-koble tokens (`/admin/settings/calendar`).

**Agent (kode):**
10. Aktiveringsflyt for registrerte spillere + at `lastLoginAt` settes ved innlogging.
11. Push-opt-in-prompt ved første PlayerHQ-besøk (motoren finnes, 0 abonnementer).
12. Aktiverings-e-post: utkast klart til Anders' godkjenning (sendes ETTER DKIM).
13. Verifiser betalings-cutover: `gratisForAlle()` slår av automatisk 1. sep — test begge sider
    av datoen i enhetstest.

### FASE 4 — Regresjon og prod-verifisering (agent, PP-10)
14. Templates-radene: shell-validering (de 8 `[ ]`).
15. Full e2e mot prod: `kjerne-klikk.spec.ts` (390px + 1280px), a11y, auth-guard, IDOR,
    booking-smoke, meta/OG. Rødt fikses før neste fase.
16. Ny DB-sjekk (sist 14.07): spillere / innlogginger / push-abonnementer — tallene inn i
    `STATUS-NÅ.md`.

### FASE 5 — Lansering (Anders' beslutning, ~15 min)
17. **PP-10.7 — lanseringsbryteren:** fjern Acuity-redirecten fra `vercel.json` (liten PR,
    ditt eksplisitte ja) → `akgolf.no` viser plattformen.
18. Godkjenn utsending av aktiverings-e-posten til spillerne.
19. Stall: koble de ~23 ekte spillerne → program (WANG/GFGK/Academy). Blokkerer IKKE
    lansering — spillerne ser portalen sin uansett.

### FASE 6 — Etter lansering (løpende)
- 1. september: overvåk betalings-cutover første døgn (webhook-feil, `Payment`-rader).
- Bølge 4-rest: live offline-kø for drill-reps + DB-persist (i dag sessionStorage).
- Mal-variant-sjekker (15 min per småruter) løpende — malene er bygget.
- W7-stats (~45 marketing-statssider) + agenticos-samleflate: egne bølger, egen plan.

---

## 2. Kritisk vei (kortest mulig til lansert)

> FASE 1.1 (planbibliotek-fiks) → FASE 2.5 (sign-off) → FASE 3.7–3.9 (DKIM/Stripe/DNS-paneler)
> → FASE 4.15 (prod-e2e grønn) → FASE 5.17 (Acuity av) = **LANSERT.**

Alt annet i planen kan gjøres parallelt eller etterpå. Med sign-off i dag og panelrunden i
morgen tidlig er lansering realistisk **innen 48 timer**.

## 3. Suksesskriterier «lansert»

| Kriterium | Måling |
|---|---|
| Alle in-scope skjermer signert `[x]` (unntatt templates + WANG-innlogging m/beslutning) | `PAPER-ZIP-CHECKLIST.md` |
| `akgolf.no` viser plattformen (Acuity-redirect fjernet) | DNS + `vercel.json` |
| DKIM grønt + aktiverings-e-post sendt | Resend-panel + utsendingslogg |
| Stripe-testbetaling → rad i `Payment` | Stripe-dashbord + DB |
| Prod-e2e grønn (klikk, a11y, auth-guard, IDOR) | `npm run test:e2e` mot prod |
| Minst én ekte spiller logget inn | `lastLoginAt` i DB |
