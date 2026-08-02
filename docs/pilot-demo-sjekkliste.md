# Pilot / lanseringsdemo — sjekkliste (uten Resend)

**Oppdatert:** 2026-07-31  
Resend/DKIM venter til **etter** demo. Bruk manuell lydsamtykke.

## Før demo (5 min)

1. Logg inn som coach: `anders@akgolf.no` (eller E2E-coach).
2. Gå til **Opptak** (`/admin/recording`).
3. Hvis **Avbrutt opptak funnet** vises: trykk **Forkast** (ellers får du ikke Start/samtykke).
4. Velg en spiller (f.eks. E2E Pilot / kjent demo-spiller).
5. Hvis «Venter på samtykke»:
   - Trykk **Manuell registrering (myndig / nød)**
   - Velg **Selv (myndig)**
   - Trykk **Registrer GITT uten e-post**
6. Start opptak (mikrofon) — eller bare vis UI hvis du ikke skal ta ekte lyd.
7. Etter analyse: **Godkjenninger** → **Godkjenn** sjekkpunkt-sak.
8. Åpne spiller → se **Før neste økt · sjekkpunkt**.

## Automatisk røyktest (valgfritt)

Krever `E2E_COACH_EMAIL` + `E2E_COACH_PASSWORD` i `.env.local`.

```bash
npm run pilot:flyt-smoke
```

Kjører mot prod (`akgolf-hq.vercel.app`) med manuell samtykke + API-flyt (uten ekte mikrofon).

**Merk:** Smoke er ikke ekte complete med lydbiter (`complete` kan gi 400).  
`dummy-transcript` er **av i prod** med mindre `ALLOW_DUMMY_TRANSCRIPT=1` — smoke hopper til transcribe eller fortsetter ærlig.

## Ikke i demo

- Foresatt-e-post / magisk lenke (kode finnes, venter på DKIM)
- Paper-port
- Stripe-cutover

## Hvis noe feiler

| Symptom | Sjekk |
|---------|--------|
| Kan ikke starte opptak | Samtykke GITT? Manuell registrering. |
| Start feiler 500 | Vercel-logger; rate-limit (Upstash) skal være fail-open. |
| Tom stall | Enrollment coach→spiller mangler. |
| Ingen sak i kø | Analyse ikke ferdig / dummy-transcript i smoke. |
