# Spillertest (demospillere)

Kjører PlayerHQ som to fiktive demospillere mot lokal dev-server. Bevisst manuell, ikke i CI.

| Spiller | E-post | Passord |
|---|---|---|
| Øyvind Rohjan (voksen) | screentest@akgolf.test | SCREENTEST_PASSWORD i .env.local |
| Sofie Testesen (13 år, forelder Kari Rohjan) | screentest-junior@akgolf.test | samme |

```bash
npx tsx scripts/seed-demo-junior-playwright-2026-10-23.ts   # lager/retter juniorkontoen
npm run test:spiller                                         # alt
npm run test:spiller -- tests/spiller/spiller-flyter.spec.ts # bare hovedflytene
```

- `spiller-sider.spec.ts`: åpner alle sider under `/portal` (fra filsystemet) på 390 og 1280 px for begge spillere. Funn: `test-results/spiller-funn/`.
- `spiller-flyter.spec.ts`: hovedflytene (økt, målsetning, utfordring, tester, runde, booking, rollegrenser).
- Skriver bare til demokontoene. Booking bekreftes aldri, og utfordringer opprettes uten deltakere, så ingen e-post eller varsler går til ekte personer.
- Kjører mot den delte produksjonsbasen (preview deler base). Testøkter, mål og utfordringer merkes «Playwright-».
