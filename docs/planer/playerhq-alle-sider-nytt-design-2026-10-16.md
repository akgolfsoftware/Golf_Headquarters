# PlayerHQ: alle sider over på nytt design (16.10.2026)

Bestilt av Anders 16.10: «Sørg for at samtlige sider er gjennomgått design endringen.»
Oversikt: https://claude.ai/artifact/P9EVjiEyLHKCKQadyhxKna (privat). Planen i ni steg er godkjent 16.10 («OK til planen»).

## Kartleggingen

186 `page.tsx` under `src/app/portal` på main 16.10 (etter #1357):

- 49 er bare videresendinger.
- 52 viser en skjerm bygget fra de nye utkastene (pakke 2–9 i `docs/design-system/utkast-playerhq/`).
- 85 har ny meny (PlayerHQSkall), men gammelt innhold.

Metode: importene fra hver side ble fulgt tre ledd ned og sammenlignet med filene som port-PR-ene for pakke 2–9 la inn
(#1247 #1255 #1278 #1283 #1299 #1308 #1311 #1313 #1316 #1319 #1321 #1323 #1324). Nye skjermbilder ble ikke tatt.

## Steg 1: sider som ikke tegnes (Anders 16.10: «Ja til alle anbefalingene»)

**Sendes videre** (funksjonen finnes allerede i nytt design):

| Side | Sendes til | Grunn |
|---|---|---|
| `/portal/ukesdigest` | `/portal/varsler` | Ukesdigest blir melding i Innboks (28.09) |
| `/portal/talent/min-plan` | `/portal/mal` | Utgår 28.09 (ligger i PR #1354) |
| `/portal/talent/roadmap` | `/portal/planlegge` | Utgår 28.09 (ligger i PR #1354) |
| `/portal/talent/sammenligning` | `/portal/analysere` | Spilleren får ingen sammenligning med andre (28.09) |
| `/portal/talent/mitt-niva` | `/portal/tren/tester` | Talent er bare for coach; testnivået står i Tester |
| `/portal/mal/leaderboard` | `/portal/analysere` | Rangerer spilleren mot klubb, venner og alle (28.09) |
| `/portal/mal/sg-hub/equipment` | `/portal/meg/utstyr` | Dobbelt med Meg › Utstyr |
| `/portal/trening/break-tabell` | `/portal/drills/break-tabell` | Dobbelt med Øvelser › Break-tabell |
| `/portal/gjennomfore` | `/portal` | PH-02 utgår 28.09, slått sammen med I dag (skjermlista) |
| `/portal/tren/wb` | `/portal` | Samme som over |

**Venter på AgencyOS** (coachsider som ligger i spillerportalen; flyttes når skjermen finnes der, tegnes ikke i PlayerHQ):
`/portal/analysere/datagolf` (til DG-01, AgencyOS pakke 10), `/portal/mal/sg-hub/coach/[spillerId]`, `…/[club]` og `…/equipment`.

**Tegnes inn i Plan før de sendes videre:** `/portal/fysisk`, `/portal/tren/fys-plan`, `/portal/tren/turneringer` og
`/portal/tren/turneringer/[id]`. Vedtaket 28.09 legger fysisk og turneringer i Plan, men nye I dag og Plan lenker fortsatt hit,
og Plan har ikke funksjonen ennå. De tas med i pakke 17.

## Pakkene

| Pakke | Sider | Tegning |
|---|---|---|
| 11 Booking og meldinger, resten | booking/ny, ny/bekreft, [bookingId], meg/bookinger/reschedule, coach/melding, coach/sporsmal/[id] · **tegnes:** booking/coach/[coachId], booking/anlegg/[anleggId], coach/melding/ny, coach/sporsmal/ny, coach/tilbakemelding/[oktId], coach/ovelser, onskeligokt/bekreftet | Pakke 7 godkjent 14.10 + `booking-meldinger.html` (godkjent 16.10) |
| 12 Målsetninger, runder og gameplan, resten | mal, mal/runder/[id]/slag, mal/runder/[id]/hull, gameplan/[baneId], gameplan/[baneId]/hull/[nr] · **tegnes:** mal/goal/[id] | Pakke 3, 5 og 9 godkjent + `booking-meldinger.html` (godkjent 16.10) |
| 13 Stats, resten | statistikk/[metric], analysere/historikk, hull, skill-map, turneringer (blir del av Resultater, 16.10), statistikk/runder/[runId]/del, trening/logg, putte-laboratoriet, tren/tester/ny, ny/egen · **ikke tegnet:** datagolf/stasjon (coach, flyttes til AgencyOS pakke 10), coach/sg-hub (forslag: videresend til Stats) | `stats-resten.html`, utkast 1, **godkjent 16.10** (port 7, Anders): https://claude.ai/artifact/FnhAAsmEftVbqbJBFoREAj |
| 14 Meg, resten | abonnement/oppgrader/flyt, avbestill, fortsett, kort/ny, faktura/[id], innstillinger/varsler, sprak, sikkerhet, personvern, integrasjoner, ai-coach, sikkerhet/2fa, deling, dokumenter, resultater, helse/symptom/ny | `meg-resten.html`, utkast 1 (16.10): Velg Full (oppgrader/flyt), Behold PlayerHQ (fortsett), Sikkerhet, Tofaktor (2fa), Dataene dine (eksport fra personvern). **Sendes videre:** avbestill → Abonnement-dialogen, kort/ny og faktura/[id] → Stripe-portalen, varsler/sprak/integrasjoner/personvern → Innstillinger, ai-coach → Hjelp, deling → PH-27, resultater → Profil, helse/symptom/ny → Helse › fravær (pakke 8). https://claude.ai/artifact/L2zH9ob6zNowDFwaFzoeSb |
| 15 Hjelp og tilbakemelding | meg/help, help/kategori/[slug], help/artikkel/[slug], help/kontakt, meg/feedback | `hjelp.html`, utkast 1 (16.10): kontakt og feedback slått sammen til «Skriv til oss». https://claude.ai/artifact/4uTb5TnX2SVpAcR2QcGotH |
| 16 Venner og utfordringer | utfordringer, [id], ny, spiller/[spillerId], samlinger · **venner og venner/[spillerId] med invitasjon, følging og feed: neste versjon** (beslutning 16.10) | Tegnes. Uavklart hva venner-sidene gjør ved lansering |
| 17 Caddie og plan-hjelpere | ai/foresla-drill, foresla-turnering, mal-bygger, utviklingsplan, kalender, kalender/opptatt, tren/feiring/[planId] + fysisk og turneringer i Plan | `plan-hjelpere.html`, utkast 1 (16.10): Turneringer, Én turnering, Fysisk program, Opptatt tid, Perioden er ferdig. **Sendes videre:** foresla-drill → Øvelsesbank, foresla-turnering → Turneringer, mal-bygger → Ny målsetning, utviklingsplan → Teknisk plan og IUP, kalender → Plan, fysisk og fys-plan → Fysisk program. NB: `proxy.ts` sender `tren/turneringer/[id]` til Workbench i dag. https://claude.ai/artifact/8bNwZMydeUYc1Ar9HHj9k5 |
| Pakke 2 | tren/wb/[sessionId] | Følger pakke 2 Treningsøkta |

Hver pakke: utkast i utkast-metoden → Anders ser det (port 7) → bygging i én PR med skjermbilder i 390 og 1280 px →
«merge» fra Anders. Steg 8 legger inn videresendingene over. Steg 9 er sluttkontroll av alle sider i 390 og 1280 px.

**Port 7 for pakke 11 og 12:** Anders godkjente de seks utkastene i `booking-meldinger.html` 16.10 («Ja dette ser bra ut»),
https://claude.ai/artifact/1VqTieHpgVPDYSS9qGL2Xh. Alle sidene i pakke 11 og 12 kan nå bygges.

Ikke rørt: PH-01 I dag, PH-16 Stats, pakke 2 Treningsøkta og pakke 8 Meg (venter på port 7), og Workbench-nivåene.
