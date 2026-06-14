# Byggeplan — komplett lansering av AK Golf HQ

> Veien fra dagens tilstand til **hele plattformen live for ekte/betalende brukere**, alle fire flater med ekte data. Grunnfestet i `docs/restanse-review-2026-06-13.md` (P0), `docs/design-brief/07-READINESS-MATRISE.md` (kode/data-gap), `docs/design-brief/00–05` (design), `docs/MASTER-SKJERMPLAN.md` (skjerm-gate). Dato: 2026-06-14.

## Definisjon av «lansert»
Alle fire flater (Marketing · Booking · PlayerHQ · AgencyOS) kjører i prod med **ekte data**, betaling virker, og hver skjerm har de 6 grønne hakene (Design · Mob/Desk/iPad · Adresse · Flyt · Data · Funker). Ingen mock på betalings-/tilgangskritiske flater.

## Hvem gjør hva
- **Claude Design:** genererer/forfiner prototyper (fra brief-pakka + BETA-fasit).
- **Claude Code:** porter design til kode, bygger funksjoner, kobler data, tester.
- **Anders (paneler/beslutninger):** Stripe/Resend/Vercel/DNS/domene + produkt-/metodikkbeslutninger (`docs/AAPNE-SPORSMAAL.md`).

---

## FASE 0 — Lanserings-blokkerere (FØR ekte brukere)
Uavhengig av design. Fra restanse-review. **Ingen betalende brukere før disse er lukket.**
| # | Tiltak | Eier |
|---|---|---|
| 0.1 | Abonnement-/gratis-logikk: sett PRO fra prøveperiode / coaching-pakke / gruppe (i dag mangler `trialEndsAt` + kvalifiserings-kode) | Claude Code |
| 0.2 | PRO-for-alle-kampanjen utløp 1. juni — gatene er «kalde» nå; sørg for at kvalifiserte gratis-brukere ikke møter oppgrader-vegg | Claude Code + beslutning |
| 0.3 | Live Stripe-nøkler ut av `.env.local` → kun i Vercel; lokal dev på TEST-nøkler | Anders (panel) |
| 0.4 | Soft-slettet konto kan logge inn → sjekk `deletedAt` i auth (GDPR) | Claude Code |
| 0.5 | Dataeksport: fjern placeholder-flate / pek til ekte `exportUserData()` | Claude Code |
| 0.6 | Resend SPF/DKIM for akgolf.no (ellers spam → ingen nye brukere) | Anders (DNS) |
| 0.7 | `NEXT_PUBLIC_APP_URL` riktig i prod (akgolf.no, ikke Vercel-URL) | Anders (panel) |
| 0.8 | Deploy-rutine: skru på auto-deploy ELLER fast `vercel deploy --prod`-rutine | Anders (beslutning) |

---

## FASE 1 — Design ferdigstilles (Claude Design → kode)
1. Opprett nytt Claude Design-prosjekt, last opp **opplastingspakka** (zip — se under).
2. Generer flate for flate fra BETA-fasit: **AgencyOS → PlayerHQ → Booking → Marketing** (behold + utbedre de 52 komponentene).
3. Port hver skjerm til kode via `.claude/rules/design-porting-gate.md` (kritiker-agent → 0 avvik).
4. Oppdater de 6 hakene i `docs/MASTER-SKJERMPLAN.md` per skjerm.
*Avhenger ikke av Fase 0 — kan kjøre parallelt.*

---

## FASE 2 — Kjernefunksjoner (differensiatorene)
Det `07-READINESS-MATRISE` flagget som størst. Dette er BYGG, ikke design.
| # | Tiltak | Hvorfor |
|---|---|---|
| 2.1 | **Supabase Realtime** for cockpit + chat (i dag polling/gammel data) | «Hvem trenger meg nå» faller uten sanntid |
| 2.2 | **«Generér uke» + «Balansér»** (server-logikk fra mal + pyramide-mål) | Kjernen i Workbench-løftet |
| 2.3 | **Workbench-paneler med ekte data** (AgencyOS-paneler får mock i dag) | Coachens hovedverktøy |
| 2.4 | **Bulk-operasjoner for gruppe** (tildel plan/test, fellesmelding til turneringsdeltakere) | ≤2-trykk coach-løfte |
| 2.5 | **Live-økt: konsolider V1/V2-spor** + bekreft persistering | Datakonsistens |

---

## FASE 3 — Tette gjenstående hull
| # | Tiltak |
|---|---|
| 3.1 | WAGR-skjerm (rute mangler; modell finnes) |
| 3.2 | BankID-backend (PlayerHQ auth) |
| 3.3 | Samle Forespørsler + Godkjenninger (+ meldinger/råd) til én innboks |
| 3.4 | Mock → ekte data: player-360, talent-radar/sammenligning, økonomi/finance |
| 3.5 | PlayerHQ: gjennomføre (kalender/booking-faner) + analyse sub-faner (SG/Runder/TrackMan/Tester) |
| 3.6 | Turnerings-prep AI-sammendrag + melding-til-deltakere |

---

## FASE 4 — Booking + Marketing + Stats (minst ferdig)
| # | Tiltak |
|---|---|
| 4.1 | **Booking-flyt komplett** (design + bygg) — inntektsvei, nesten ikke designet. Erstatt Acuity-midlertidig |
| 4.2 | Marketing landingssider (forside, coaching, priser, junior, treningsfilosofi, coacher, anlegg, blogg) |
| 4.3 | Stats-portal (`/stats`) — kjernesidene først |

---

## FASE 5 — QA + go-live
| # | Tiltak |
|---|---|
| 5.1 | Per skjerm: alle 6 haker grønne i MASTER-SKJERMPLAN (inkl. Funker = browser/Playwright-testet) |
| 5.2 | RLS-verifisering (advisor 0 ERROR), soft-delete, GDPR-flyt |
| 5.3 | e2e (Playwright) på kjerneflytene: start økt, logg runde, book, planlegg & tildel |
| 5.4 | `npx prisma validate && npx tsc --noEmit && npm run build` grønt |
| 5.5 | Prod-deploy (`vercel deploy --prod`), DNS/domene, røyktest |

---

## Rekkefølge & avhengigheter
- **Fase 0 og Fase 1 kan kjøre parallelt** (kode-blokkerere vs design).
- Fase 2 avhenger av at skjermene fra Fase 1 finnes.
- Fase 3–4 etter Fase 2-kjernen.
- Fase 5 løpende per skjerm + samlet før go-live.

## Det viktigste å huske
Databasene er **ikke** flaskehalsen (124 modeller dekker alt). Lansering handler om: **lukke Fase 0-blokkererne**, **ferdigstille designet** (Fase 1), og **bygge de manglende funksjonene + sanntid** (Fase 2–3). Design og bygg kan gå i parallell.
