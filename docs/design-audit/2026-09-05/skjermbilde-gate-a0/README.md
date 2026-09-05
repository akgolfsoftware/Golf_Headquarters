# Skjermbilde-gate A0 — 05.09.2026 (Ø12-rest + etterkontroll STEG 15)

Spor A i `docs/MASTERPLAN-GJENSTAAENDE.md` §2.13, rad A0. Alle bilder er tatt mot prod
(`akgolf-hq.vercel.app`, main) innlogget som `coachtest@akgolf.test`, 390×844 (mobil) og
1280×900 (desktop), lys og mørk (`ak-v2-tema`-cookie). Hver montasje viser de fire visningene
side om side. Skript: ad hoc Playwright (samme innloggingsmønster som
`scripts/train-lock-pixel-diff.mjs`), konsollfeil og horisontal overflow logget per rute.

| Fil | Skjerm | Rute | Overflow | Konsollfeil |
|---|---|---|---|---|
| `montasje-s3-03-spiller.jpg` | S3-03 Spiller profil bento (Ø12) | `/admin/spillere/[id]` | 0 px alle fire | CSP blokkerer én Next-chunk (se under) |
| `montasje-15-4-kalender.jpg` | 15.4 Kalender (Uke-fanen) | `/admin/kalender` | 0 px | ingen |
| `montasje-15-5-jarvis.jpg` | 15.5 Jarvis (Kø-fanen) | `/admin/jarvis` | 0 px | ingen |
| `montasje-15-6-turnering.jpg` | 15.6 Turnering (Alle) | `/admin/turnering` | 0 px | ingen |
| `montasje-15-8-analyse-stall.jpg` | 15.8 Analyse · Stall (default) | `/admin/analyse` | 0 px | samme CSP-chunk |
| `montasje-15-8-analyse-spiller.jpg` | 15.8 Analyse · Spiller | `/admin/analyse?fane=spiller` | 0 px | samme CSP-chunk |
| `montasje-15-8-analyse-etterlevelse.jpg` | 15.8 Analyse · Etterlevelse | `/admin/analyse?fane=etterlevelse` | 0 px | samme CSP-chunk |
| `montasje-15-9-plan.jpg` | 15.9 Plan | `/admin/plan` | 0 px | ingen |
| `s3-03a-spiller-profil-mac-fasit.jpg` / `-diff.jpg` | Fasit-ramme S3-03a (1440) og pixel-diff | rigg | — | avvik **14,34 %** |
| `s3-03b-spiller-profil-iphone-fasit.jpg` / `-diff.jpg` | Fasit-ramme S3-03b (390) og pixel-diff | rigg | — | avvik **15,15 %** |

`ERR_ABORTED`-linjer på `?_rsc=`-forespørsler er avbrutte Next-prefetch, ikke feil.

## Funn

1. **S3-03 — to hvite primær-CTA-er i samme skjerm.** Bentoens «Åpne uke i Workbench» øverst
   og den gamle profilheaderens «Åpne i Workbench» lenger ned (de tre eldre panelene som ble
   liggende under bentoen i Ø12). DESIGN-SYSTEM §6: én primær per skjerm. Løses når Ø13
   (master–detalj, PR #771) rydder de gamle panelene — ikke i A0.
2. **15.4 Kalender — to hvite primære på 390 og 1280:** «Ny hendelse» i hodet og «Ny booking»
   i ukeverktøylinjen. «Ny hendelse» finnes dessuten to ganger (hode + verktøylinje-lenke).
   Kandidat for 19.5-løkka på `admin/kalender`.
3. **15.9 Plan — intern sjargong i UI-tekst:** «Slippes som ghost-dager i kilder» og «Ikke
   bygget ennå (bølge 2)». Kopi, ikke layout. 19.5-løkka.
4. **15.8 Analyse — hodet sier «Innsikt», ruten og planen sier Analyse.** Observasjon, ikke
   avgjort som feil — Anders avgjør sammen med de to avvikene som allerede står i 15.8.
5. **CSP i prod:** `/_next/static/immutable/chunks/<hash>.js` blokkeres av
   `script-src 'self' 'nonce-…' 'strict-dynamic'` på `/admin/spillere/[id]` og `/admin/analyse`
   (alle tre faner). Chunken lastes uten nonce. Skjermene rendrer likevel, men noe klientkode
   kjører ikke. Kun synlig i nettleserkonsollen — verken verify, CI eller e2e fanger det.
   Fulgt opp som egen oppgave, utenfor A0.

## Rigg — S3-03

Lagt inn i `tests/visual/skjerm-mapping.ts` som `kalibrert`. Restavviket har tre kjente
årsaker: fasiten tegner den pensjonerte 64 px-ikonrailen (appen har AX-01, 232 px med tekst);
demo-spilleren har ingen økter denne uken, så app viser tom-tilstand-kort der fasiten viser
72 %-måler, teknisk plan og «Nå»-kort; portrett og minikalender er bevisst utelatt (Ø12).
