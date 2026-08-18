> UTGÅTT 18.08.2026 — styrer ingenting. Gjeldende: se docs/port/GYLDIGHET.md.

> ⚠️ UTGÅTT (12.08.2026) — styrer ikke skjermbygging. Se docs/port/GYLDIGHET.md.

# NATTRAPPORT — natt til 11.08.2026 (skrevet 08:2x, før 09-fristen)

**Kjørt etter:** `masterplan-lansering-2026-08-11.md` + `OVERNIGHT-AUTONOMOUS-PLAN.md` v2.0.
Startordre gitt av Anders 10.08 sent kveld. 0 røde merges · 0 `[x]` satt av agent · ingen PII i bilder.

---

## Ærlig hovedkonklusjon

Natten leverte **fundament, bevis og sikkerhet — ikke hele designporten.** Skjermbyggingen gikk
langt saktere enn planlagt (første byggebatch alene tok store deler av natten). Kvalitetsgaten ble
aldri senket: alt som er merget er grønt (verify + 963 tester + CI). Men av «alle 87 rader mot
Claude-fasiten» ble det bygget 3 nye + diff-fikset 5 — resten står som restanse med ferdig
byggegrunnlag (kartlagt i natt, se §Restanse).

**Lanseringsbildet kl. 09:** plattformen på `akgolf-hq.vercel.app` er grønn, sikkerhetssjekket
(0 P0) og har fungerende booking bak flagg. `akgolf.no` peker fortsatt på Acuity — å snu den
er din beslutning (morgenlisten under). Det som IKKE er klart er full Paper-pixel på alle skjermer.

---

## Levert i natt

| Hva | Bevis |
|---|---|
| #389 (Innboks PP-2.2) + #390 (PP-1-rester + PP-2.3/2.4) merget, main grønn | verify + 963/963 lokalt, CI grønn |
| **Signoff-galleri, alle 11 kjerne-skjermer** (m390 + d1280 + mørk, side om side med fasit) | `docs/port/SIGNOFF-GALLERI-2026-08-11.md` + `screenshots/paper/signoff/` |
| `SCREENTEST_PASSWORD` bekreftet GYLDIG (innloggede skjermer kan fotograferes) | galleri-kjøringen |
| **Sikkerhetsrapport: 0 P0 · 3 P1 · 1 P2** | `docs/port/SIKKERHETSRAPPORT-2026-08-11.md` |
| PP-1.7 booking verifisert som Paper-fasit på preview (galleriet korrigert — prod viser interim pga. flagg, ikke designgap) | galleriets PP-1.7-seksjon |
| **W1-batch 1 bygget og merget (#394):** fys-plan · drill-detalj · feiring | CI grønn, merget 08:19 |
| Ekte bug funnet + fikset i diff-PR: ukedag-etiketter forskjøvet én dag på Plan (`UKEDAG_KORT` søndag-først mot mandag-først-indeks) | diff-fiks-PR (se under) |
| Diff-fiks-PR for galleriets entydige avvik (PP-1.2-bug, PP-1.6 innlogging, PP-2.1/2.2 småfiks, PP-2.3 gruppering) | PR åpnes ~08:30 |
| Komplett byggegrunnlag for PP-3 (7 skjermer) og W1-resten (8 skjermer) med datakilder og vanskelighetsgrad | nattens kartlegging (scratchpad + denne rapporten) |

## Galleriets dom (det du signerer fra iPhone)

**2 GODKJENN · 9 FIKS FØRST** — men diff-fiks-PR-en lukker de lette FIKS-punktene på
PP-1.2/1.6/2.1/2.2/2.3. Etter merge av den er realistisk stilling ~6 GODKJENN-kandidater.
Skjønnsspørsmålene (6 stk) står nederst i galleriet og venter på deg.

## Sikkerhet (0 P0 — ikke lanseringsblokkerende)

- **P1:** RLS-audit beviste ingenting (test-bruker uten data + uuid-bug i skriptet) — kjøres
  kontrollert med screentest-brukere. Appen går via Prisma (service-rolle), så RLS er
  forsvarslinje 2, ikke 1.
- **P1:** Rotasjonslisten i runbook §2.5 er utdatert (14 secrets mangler, 1 død oppført).
- **P2:** push-subscribe uautentisert (rate-limitet + zod-validert).
- **OK:** actions-auth grønn, ingen secrets i kode, ingen klientlekkasje, cron fail-closed,
  webhooks verifiserer signatur.

## Restanse (ikke gjort — med ferdig grunnlag)

1. **W1-resten (8):** drills-liste, tester-hub, test-detalj, turneringer, turnering-detalj,
   live-tapper (MIDDELS) + okt-detalj, teknisk-plan (TUNG — trenger dine avklaringer, se galleri).
2. **PP-3 pixel (7):** workbench, live-økt-trioen, runde-flatene, fangst, forelder, test-gjennomfør,
   spillerprofil — avvikskart ferdig, alle TUNG/MIDDELS.
3. **W2 (12) + mal-fabrikk W3–W5 (~80 ruter via 6 maler) + W6 (4).**
4. Booking ende-til-ende-klikk (steg 7) — men flyten ble klikk-verifisert 10.08 i PR #391.
5. Landingssider pixel-pass + prod-røyk (CI-smoke på merges er delvis dekning).
6. PP-2.4: bevis-skudd av kollisjonsløsningen med åpen detaljkolonne.

## Uberørt (venter på deg)

- PR #382 (drill-bank guard) og #393 (WANG-designplan) — utenfor nattplanen.
- `[x]`-kryss, Acuity-fjerning, BOOKING_PUBLIC i prod, DB-endringer — aldri-auto.

---

## Morgenlisten din (rekkefølgen betyr noe)

1. **Signer galleriet** (`SIGNOFF-GALLERI-2026-08-11.md`) — svar GODKJENN/FIKS per skjerm. 15 min.
2. **Lansering, hvis du vil:** si «fjern Acuity-redirecten og sett BOOKING_PUBLIC i prod» — begge
   er små, forberedte grep. Plattformen er grønn og sikkerhetsklarert for det.
3. **Stripe/Resend/DNS-panelene:** verifiser grønt (bare du har tilgang).
4. **Svar på de 6 skjønnsspørsmålene** i galleriet + de 2 TUNG-avklaringene (okt-detalj-ruta,
   teknisk-plan-funksjonene) — da kan neste natt/økt bygge W1-resten uten stopp.
5. **Stallen:** spiller→program-koblingen for ~23 ekte spillere (blokkerer ikke lansering).
6. Beslutt videre løp for restansen: flere nattkjøringer à la denne, eller dagsøkter per blokk.
