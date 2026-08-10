# MASTERPLAN — natt til 11.08.2026, mål: lanseringsklar kl. 09:00

**Skrevet:** 2026-08-10 kveld · **Styrende underplaner:** `OVERNIGHT-AUTONOMOUS-PLAN.md` v2.0
(nattens kjøreregler + auto-godkjenning) og `PIXEL-PERFECT-PLAN-COMPLETE.md` v1.1 (skjerm-køen).
Denne fila er paraplyen som kobler dem til lanseringsmålet.

---

## 0. Ærlig rammesetting — hva «klar kl. 09» faktisk betyr

**Kan bli ferdig i natt (uten Anders):**
- Alle gjenstående skjermer bygget til READY_SIGN med skjermbildebevis (35 `[ ]` + pixel-pass
  på de 52 `[~]`), så langt natten rekker — i pixel-planens rekkefølge.
- Sikkerhetspass: RLS-audit, auth-guard-sjekk, IDOR-e2e, secrets-sjekk — rapport med funn.
- Backend-verifisering mot ekte proddata (databasen HAR ekte data: 42 brukere, 22 bookinger,
  turneringer, TrackMan) — hver hovedflate klikk-verifisert mot prod-DB via preview.
- Booking-flyten testet ende-til-ende t.o.m. Stripe-checkout-siden (aldri gjennomført betaling).
- Landingssidene (marketing) pixel-passert og verifisert.
- Nattrapport + morgengalleri så alt kan signeres fra iPhone på 15 min.

**Kan IKKE bli ferdig i natt — krever Anders (dette er ikke forhandlingsbart, det er dine egne
låste regler):**

| Blokkering | Hvorfor kun Anders |
|---|---|
| Sign-off `[x]` per skjerm | Skjermbilde-gaten (FAST REGEL 04.08) — ingen skjerm er ferdig før du har SETT den |
| Fjerne Acuity-redirecten på akgolf.no | Selve lanseringsbeslutningen (PP-10.7, aldri-auto) |
| Stall: 23 ekte spillere → program | Koblingen spiller→WANG/GFGK/Academy finnes ikke i data — kun i hodet ditt |
| Resend DKIM / DNS / Stripe-panel | Kontoer og innlogginger bare du har |
| SCREENTEST_PASSWORD-status | Uavklart siden 03.08 — uten det kan innloggede skjermer ikke fotograferes automatisk |

**Konklusjon:** kl. 09 kan alt VÆRE BYGGET, testet og bevist — men «lansert» (akgolf.no av
Acuity, kunder inn) er en 30–60-minutters beslutningsrunde du tar om morgenen med galleriet
på iPhone. Det er den ærlige planen. Alt annet ville vært å fremstille delvis som ferdig.

---

## 0.5 Designomfang — ALLE skjermer mot Claude-prosjektet (presisert 10.08 kveld)

Anders har presisert: natten skal levere **nytt design mot Claude Design-prosjektet «AK Golf HQ —
Claude Paper» (`605a48cc`) på ALLE skjermer** — ikke bare bygge de ubygde. Konkret:

- **Alle 87 checklist-rader** (79 fasit-HTML + 8 templates) er i scope: de 52 `[~]` løftes fra
  «chrome portet» til full pixel mot fasit, de 35 `[ ]` bygges fra fasit.
- **Fasit-kilde:** speilet `designsystem/paper/` — verifisert byte-identisk med Claude
  Design-prosjektet 09–10.08, så natten trenger ikke MCP-oppslag per skjerm. Avviker noe,
  vinner Claude-prosjektet (CLAUDE.md invariant 2).
- **Mal-skjermene (W3–W5)** dekkes via mal-pixel + variant-pass per rute — det ER fullt design
  for de ~80 rutene som deler maler, per pixel-planens §1.1.
- Rekkefølgen i steg 2–5 under er sortert etter bruksverdi (kjerne først), men sluttmålet for
  natten er at **ingen in-scope skjerm står igjen med gammelt design**.

## 1. Nattens kjøreplan (10 steg, strikt rekkefølge)

Kjøreregler: `OVERNIGHT-AUTONOMOUS-PLAN.md` §1 (forhåndsgodkjent/aldri-auto) og §3
(autonomi-protokoll) gjelder uendret hele natten. Grønn verify + test før hver merge, aldri rødt
til main, aldri `[x]`, aldri PII, batch pushes.

1. **Fundament (30 min):** merge åpne grønne PR-er (#389, #390, PP-2-grenen #390-oppfølgeren),
   `npm run verify && npm test` på main. Rødt = fiks først. Avklar SCREENTEST_PASSWORD —
   finnes det i `.env.local`, brukes det; ellers merkes innloggede skjermbilder BLOCKED.
2. **Morgengalleri v2 (2 t):** nye side-om-side-bilder (app vs fasit, m390 + d1280, lys + mørk)
   for PP-1 (7 skjermer) + PP-2.1–2.4 → `SIGNOFF-GALLERI-2026-08-11.md` med GODKJENN/FIKS-anbefaling
   per skjerm.
3. **Diff-lukking (2 t):** entydige avvik galleriet avdekker fikses med minimal diff og
   re-fotograferes. Skjønnsspørsmål → spørsmålsliste til Anders, ikke gjetting.
4. **PP-3 pixel-pass (3 t):** Live-økt, Runde, Fangst, Workbench-mobil, Forelder — chrome-PORT
   → READY_SIGN. Workbench-mobil og live-økt først (høyest bruk).
5. **Full designport på ALT gjenstående (resten av natten, i pixel-planens rekkefølge):**
   PP-4 W1 (11 skjermer) → F2.6-primitiver → PP-5 W2 (12) → PP-6–8 mal-fabrikk (mal 100 %
   først, så variant-pass over alle ruter som deler malen) → PP-9 W6. Dette dekker både de
   35 ubygde OG rest-pixel på alle `[~]` som ikke ble tatt i steg 2–4 — sluttmål: ingen
   in-scope skjerm med gammelt design. Commit per 1–3 skjermer, alltid grønt.
6. **Sikkerhetspass (parallelt med 5, egen agent):** `scripts/audit-rls`,
   `check-action-auth.mjs`, e2e auth-guard + IDOR-suiten, grep etter hardkodede secrets,
   sjekk at ingen `.env`-verdier lekker i klientbundle. Funn → fiks det som er trygt
   (minimal diff), resten inn i rapporten som P0/P1-liste.
7. **Booking ende-til-ende (30 min):** offentlig booking på preview (BOOKING_PUBLIC er satt
   der): tjeneste → tid → skjema → Stripe-checkout-siden vises. STOPP før betaling.
   Admin-siden: bookingen synlig i `/admin/bookinger`-flyten med testdata.
8. **Landingssider (1 t):** marketing-forsiden + undersider pixel-passert, meta/OG-e2e grønn,
   mobil 390 verifisert.
9. **Prod-røyk (30 min):** Playwright-smoke mot `akgolf-hq.vercel.app` (a11y, ruter, PWA,
   auth-guard). Alt som er merget i natt ligger da automatisk i prod via Vercel.
10. **Nattrapport (siste 30 min):** `NATTRAPPORT-2026-08-11.md` — READY_SIGN-teller før/etter,
    BLOCKED-liste med årsak, sikkerhetsfunn, lenke til galleri, og **morgenlisten din** (under).

---

## 2. Din morgenliste (kl. 08:00–09:00, alt fra iPhone/Mac)

Rekkefølgen er valgt så lansering kan skje selv om du bare rekker de tre første.

1. **Signer galleriet** — bla gjennom, svar GODKJENN eller FIKS per skjerm (15 min).
2. **Lanseringsbryteren:** si «fjern Acuity-redirecten» — liten PR fjerner den fra
   `vercel.json`, akgolf.no viser plattformen (5 min + deploy).
3. **Stripe/Resend/DNS:** verifiser i panelene at webhook, DKIM og domene står grønt (10 min).
4. **Stallen:** gi koblingen spiller→program for de ~23 ekte spillerne (kan tas etter kl. 09 —
   blokkerer ikke lansering, spillerne ser portalen sin uansett).
5. **Aktiverings-e-post** til spillerne — utkast ligger klart, du godkjenner sending.

---

## 3. Suksesskriterier kl. 09:00

| Måltall | Minimum | Mål |
|---|---|---|
| Skjermer READY_SIGN med bevis i galleri | 25 | alle 87 rader |
| Røde merges / `[x]` satt av agent / PII i bilder | **0** | 0 |
| Sikkerhetsrapport levert (RLS + auth + IDOR) | ja | 0 åpne P0 |
| Booking verifisert t.o.m. Stripe-side | ja | ja |
| Beslutninger som venter på Anders | ≤ 5, listet | ≤ 3 |
