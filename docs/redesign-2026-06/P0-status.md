# P0 — lanseringsblokkere (status 17. juni)

Kilde for original liste: `docs/STATUS-NÅ.md` (avsnitt «Blokkert — 8 P0»), som peker på en `docs/restanse-review-2026-06-13.md` som **ikke lenger finnes i repoet**. Statusen under er re-verifisert mot faktisk kode 17. juni — flere P0-er er løst siden 13. juni-listen ble skrevet, men STATUS-NÅ.md er ikke oppdatert.

Betaling åpner **1. juli**. Frem til da gir koden bevisst gratis tilgang til alle (`gratisForAlle()` i `src/lib/feature-flags.ts`), så enkelte P0-er «biter» ikke før 1. juli — men må verifiseres før den datoen.

## Liste

| # | P0 | Hvor | Uavhengig av design? | Innsats | Krever Anders? |
|---|----|------|----------------------|---------|----------------|
| 1 | Abonnements-/gratis-logikk (PRO fra prøveperiode / coaching-pakke / gruppe) | `src/lib/feature-flags.ts` (`resolveTier`), wiret i `src/lib/auth/getCurrentUser.ts:42` | Ja | — (ser **løst**) | Nei — kun bekreft regelen stemmer |
| 2 | PRO-for-alle-kampanjen «kald»/utløpt | `src/lib/feature-flags.ts:18-23` (`BETALING_STARTER` = 1. juli) | Ja | Liten (verifisering) | Beslutning: bekreft 1. juli-dato |
| 3 | Live Stripe-nøkler i `.env.local` | `.env.local` (lokal) + Vercel env | Ja | Liten | Ja — sjekke/rotere nøkler i paneler |
| 4 | Soft-slettet konto kan logge inn | `src/lib/auth/getCurrentUser.ts:23` | Ja | — (ser **løst**) | Nei |
| 5 | Dataeksport: én flate er placeholder | Ekte: `…/innstillinger/personvern` · Stub: `…/innstillinger/eksport` | Ja | Liten | Nei |
| 6 | E-postleveranse ikke verifisert (Resend SPF/DKIM) | DNS for akgolf.no + Resend-panel | Ja | Liten | Ja — DNS + Resend |
| 7 | `NEXT_PUBLIC_APP_URL` feil i prod | Vercel env (kode bruker den ~25 steder) | Ja | Liten | Ja — Vercel-panel |
| 8 | Deploy-rutine uavklart (push ≠ live) | Prosess / `vercel deploy --prod` | Ja | Liten | Beslutning |

## Kan tas NÅ (uavhengig av redesignet)

**Alle 8 er uavhengige av redesignet** — ingen venter på nytt design. De deler seg i tre grupper:

### A. Ser allerede LØST i kode — trenger kun bekreftelse (ikke nytt arbeid)
- **#1 Abonnements-/gratis-logikk:** `resolveTier()` i `src/lib/feature-flags.ts` implementerer alle fire gratis-veiene (lanserings-vindu, coaching-pakke med `monthlyCredits > 0`, gruppemedlemskap, 30-dagers prøveperiode) og overskriver `user.tier` ett sted i `getCurrentUser.ts`. Dekket av tester i `src/lib/__tests__/feature-flags.test.ts`. STATUS-NÅ.md sin påstand «ingen kode setter PRO …» er **utdatert**.
- **#2 PRO-kampanje:** håndteres av samme `gratisForAlle()`-port som gir alle PRO frem til `BETALING_STARTER` (1. juli). Ingen «kald vegg» før da. Bekreft bare at datoen er riktig.
- **#4 Soft-slettet konto:** `getCurrentUser.ts:23` returnerer `null` når `deletedAt` er satt → slettede kontoer behandles som utlogget. **Løst.**

### B. Små kode-fikser jeg kan gjøre nå
- **#5 Dataeksport-placeholder:** Den ekte GDPR-eksporten (art. 15, laster ned JSON) ligger og virker i `…/innstillinger/personvern`. Den forvirrende «kommer snart»-stubben er den separate `…/innstillinger/eksport`-flaten. Fix: enten fjern/redirect stub-flaten til personvern-siden, eller koble den til samme action. GDPR-plikten er teknisk allerede oppfylt — dette er rydding for å unngå at det *ser ut* som eksport mangler.

### C. Panel/DNS/beslutning — krever Anders (kode-uavhengig)
- **#3 Stripe-nøkler:** verifiser at `.env.local` har TEST-nøkler, live kun i Vercel.
- **#6 Resend SPF/DKIM** for akgolf.no (DNS).
- **#7 `NEXT_PUBLIC_APP_URL`** settes til `https://akgolf.no` i Vercel prod (koden faller tilbake til riktig default mange steder, men ikke alle — bl.a. Notion-OAuth og noen e-postlenker bruker Vercel-URL som fallback).
- **#8 Deploy-rutine:** beslutt og dokumenter at prod krever `vercel deploy --prod` (eller koble auto-deploy fra main).

## Venter på design eller Anders

- **På design:** ingen P0 venter på redesignet. Alle kan lukkes nå.
- **På Anders (paneler/DNS/beslutning):** #3, #6, #7, #8 (+ bekreftelse på #2-datoen). Disse er manuelle handlinger i Stripe/Resend/DNS/Vercel som jeg ikke kan gjøre selv.

## Anbefalt rekkefølge

1. **#1, #2, #4 — verifiser «løst» og oppdater STATUS-NÅ.md** (lukk tre P0-er på papiret; de er allerede i kode). Liten innsats, høy ryddegevinst.
2. **#5 — rydd eksport-stubben** (eneste reelle gjenstående kode-P0; liten fiks jeg kan ta nå).
3. **#7 + #3 — Vercel env** (`NEXT_PUBLIC_APP_URL` + bekreft Stripe live-nøkler kun i Vercel). Anders, små panel-steg.
4. **#6 — Resend SPF/DKIM** (DNS-propagering tar tid → start tidlig før 1. juli).
5. **#8 — lås deploy-rutine** (beslutning + dokumenter i go-live-sjekklista).

Frist-anker: alt betalings-relevant (#3, #6, #7) må stå før **1. juli**, ikke før.
