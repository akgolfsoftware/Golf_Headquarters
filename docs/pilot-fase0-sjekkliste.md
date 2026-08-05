# Pilot Fase 0 + rest — sjekkliste for Anders

**Oppdatert:** 2026-07-31 (autonom 2t-kjøring)

## Allerede gjort i kode/DB
- [x] Schema: LydSamtykke, TradApning, PlanAction.sjekkpunkt/fangstId, Group.kind
- [x] Whisper AK-glossar
- [x] `--handling` token (innført under «C, smalt» 31.07; lever videre som Paper-aksenten `#D97757`)
- [x] Hard LydSamtykke-gate på `/api/recording/start` + UI
- [x] Pilot: coach kan registrere GITT på `/admin/recording`
- [x] IndexedDB-kø for lydchunks
- [x] sjekkpunkt settes ved PlanAction-godkjenning

## Krever deg (panel/DNS/person)
- [ ] **DKIM** for `send.akgolf.no` (Resend) — **utsatt til etter lanseringsdemo**
- [ ] **Vercel** `DIRECT_URL` / `DATABASE_URL` etter eventuelle passordbytter + redeploy
- [ ] **Stripe** live-nøkler / cutover-dato
- [ ] **Google Calendar** re-koble
- [ ] **Aktiver** spillere uten innlogging (e-post etter DKIM)
- [x] Schema-runde + FØR/UNDER/ETTER i main (flere PR-er 2026-07-31)
- [ ] **Juridisk** gjennomgang av personvern-utkast (lyd/mindreårige)

## Demo (uten Resend)
- [x] Manuell lydsamtykke på `/admin/recording`
- [x] Demo-sjekkliste: `docs/pilot-demo-sjekkliste.md`
- [x] Røyktest-script: `npm run pilot:flyt-smoke`

## Ikke i denne runden (bevisst) — #14 backlog post-demo
- Paper-port til `src/`
- Whisper range-spike (10 opptak på rangen)
- Full Spillere-flate (`Group.kind` UI) — schema klar, ikke bug
- `TradApning` («sist sjekket») UI — schema klar, ikke bug

## Foresatt-e-post (kode levert — krever DKIM + SQL)
- [x] Magisk lenke `/auth/lyd-samtykke/[token]` + send fra `/admin/recording`
- [ ] Kjør SQL: `prisma/sql/2026-07-31-lyd-samtykke-token.sql` mot prod DIRECT_URL
- [ ] DKIM grønn for `send.akgolf.no` (se `docs/LANSERING-P0-ANDERS.md` #1–4)
- [ ] Test: send til egen innboks → åpne lenke → GITT
