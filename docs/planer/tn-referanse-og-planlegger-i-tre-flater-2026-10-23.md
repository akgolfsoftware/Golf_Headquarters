# Team Norway: neste skjermer og planleggeren i alle tre flater (plan, 23.10.2026)

Bestilt av Anders 23.10: «bygg neste skjermer», HCP-skjermene utsettes, og planlegger-skjermene fra Team Norway skal også finnes i PlayerHQ og AgencyOS.
Bygger på [registeret](tn-trenerflate-register-2026-10-21.md), [wireframes](../design-system/utkast-tn/trenerflate/README.md) og beslutningene 21.10 i `.claude/rules/beslutninger.md`.

## 1. Hvor vi står (rettet 23.10 etter å ha lest main; første versjon bygde på gammel status)

- Allerede i main: Referanse-delen med WAGR, graf, turneringer, sesong, Sammenlign, Søk, Norsk golf og Tester (#1594, #1616, #1643), spillerfanene Ranking, Turneringer og Trening, og personverntester for TN-tilgang.
- HCP Norge: utsatt og skjult i meny og faner (Anders 23.10, #1662). Siden finnes, men er ikke lenket.
- Turneringsplanleggeren finnes i alle tre flater som én komponent (`Turneringsplanlegger.tsx`, roller `spiller`, `coach`, `tn`): PlayerHQ `/portal/tren/turneringer`, AgencyOS `/admin/spillere/[id]/turneringsplan`, Team Norway `/team-norway/spiller/[spillerId]/turneringsplan`.
- Mangler: Referanse › Planlegger (plan for WAGR-spillere uten HQ-konto, lagret i `wagr_reference_plans`) i Team Norway og AgencyOS.

## 2. Hva «planlegger i alle tre flater» betyr

| Flate | Hva som finnes | Hva som bygges |
|---|---|---|
| Team Norway | Planen for én spiller med deling (treneren foreslår) | Referanse › Planlegger: plan for hver norsk WAGR-spiller, delt mellom trenerne |
| AgencyOS | Planen for én spiller i stallen (coachen endrer direkte) | Samme Referanse-planlegger for coach, pluss lenke fra Spiller 360 |
| PlayerHQ | Spillerens egen plan med WAGR-anslag | Bare egen plan. Ingen navngitte andre spillere (se avvik under) |

**Avvik som må avgjøres:** 28.09 bestemte du at spilleren ikke ser sammenligning mot andre spillere, og 21.10 at Team Norway bare er for trenere. En Referanse-planlegger med navngitte spillere i PlayerHQ strider mot begge. Anbefaling: PlayerHQ beholder egen plan (med nivåanslag uten navn), og referanse-planleggeren går i Team Norway og AgencyOS.

## 3. Plan (rettet)

1. **Gjort:** HCP skjult (#1662).
2. **Datalag for referanseplan:** egen lesing for en WAGR-spiller uten HQ-bruker (`byggPlanvisning` krever i dag en HQ-bruker via `public_players."wagrId"`), og skriving til `wagr_reference_plans`. Ferdig når samme spiller gir samme sjanser som i spillerens egen plan.
3. **Referanse › Planlegger i Team Norway:** ny fane, bygger på `Turneringsplanlegger` med en egen handlingsflate for referanseplanen (dagens handlinger er knyttet til spillerens egne påmeldinger). Trenerne endrer direkte for spillere uten HQ-konto, med logg over hvem som endret; planen deles mellom trenerne. Får spilleren konto, gjelder forslagsregelen (Anders 23.10, beslutninger.md §REFERANSE › PLANLEGGER).
4. **Planlegger i AgencyOS:** samme referanseplan for coach, og lenke fra Spiller 360.
5. **PlayerHQ:** bare egen plan (bekreftet 23.10). Gjennomgang mot Skrå og «Se hva Team Norway ser».
6. **Videresendinger og steg 10** (Gruppeposter, Dokumenter, Skoler, College) etter ja til utkast 4.

Hvert steg er én PR med auto-merge når verify og CI er grønne.

## 4. Rammer og risiko

- **Måling:** hver skjerm i 390 og 1280 px (og 1920) uten sidelengs rulling og konsollfeil. Arbeidskopien har ikke `.env`, og Vercel er stoppet, så innloggede skjermer kan ikke måles her uten at du gir en måte å logge inn lokalt på.
- **Barnevern:** ingen navngitte spillere under 18 i samlede tall. Navngitte juniorprofiler er fortsatt uavklart (beslutninger 21.10, punkt 5).
- **Data som mangler:** WAGR-plass før turnering, plass per uke og gruppelistene ligger bare i filer hos pipelines. Der viser vi «—» til de er i basen.
- **Skjermbilder** tas lokalt, ikke på Vercel (byggestopp fra 07:10).

## 5. Uavklart

1. ~~PlayerHQ~~ Avgjort 23.10: bare egen plan.
2. Hvordan skal innloggede skjermer måles lokalt?
3. Utkast 4 (steg 10 i det gamle redesignet): ja eller nei?
