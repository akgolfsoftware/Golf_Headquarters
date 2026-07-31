# Pilot Fase 0 + rest — sjekkliste for Anders

**Oppdatert:** 2026-07-31 (autonom 2t-kjøring)

## Allerede gjort i kode/DB
- [x] Schema: LydSamtykke, TradApning, PlanAction.sjekkpunkt/fangstId, Group.kind
- [x] Whisper AK-glossar
- [x] `--handling` token (C smalt)
- [x] Hard LydSamtykke-gate på `/api/recording/start` + UI
- [x] Pilot: coach kan registrere GITT på `/admin/recording`
- [x] IndexedDB-kø for lydchunks
- [x] sjekkpunkt settes ved PlanAction-godkjenning

## Krever deg (panel/DNS/person)
- [ ] **DKIM** for `send.akgolf.no` (Resend) — blokkerer ekte foresatt-e-post
- [ ] **Vercel** `DIRECT_URL` / `DATABASE_URL` etter eventuelle passordbytter + redeploy
- [ ] **Stripe** live-nøkler / cutover-dato
- [ ] **Google Calendar** re-koble
- [ ] **Aktiver** spillere uten innlogging (e-post etter DKIM)
- [ ] **Ja til merge** av `feature/schema-runde-sloyfe-v2` → main
- [ ] **Juridisk** gjennomgang av personvern-utkast (lyd/mindreårige)

## Ikke i denne runden (bevisst)
- Paper-port til `src/`
- Foresatt-e-post med magisk lenke
- Whisper range-spike (10 opptak på rangen)
- Full Spillere-flate (Group.kind UI kan utvides senere)
