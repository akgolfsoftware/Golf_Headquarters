# Team Norway: neste skjermer og planleggeren i alle tre flater (plan, 23.10.2026)

Bestilt av Anders 23.10: «bygg neste skjermer», HCP-skjermene utsettes, og planlegger-skjermene fra Team Norway skal også finnes i PlayerHQ og AgencyOS.
Bygger på [registeret](tn-trenerflate-register-2026-10-21.md), [wireframes](../design-system/utkast-tn/trenerflate/README.md) og beslutningene 21.10 i `.claude/rules/beslutninger.md`.

## 1. Hvor vi står (verifisert mot koden 23.10)

- Ferdig: skall og meny (pakke a), Min profil (pakke b), bildene byttet (PR 1660).
- Turneringsplanleggeren finnes allerede i alle tre flater som én felles komponent (`src/components/turneringsplan/Turneringsplanlegger.tsx`, roller `spiller`, `coach`, `tn`): PlayerHQ `/portal/tren/turneringer`, AgencyOS `/admin/spillere/[id]/turneringsplan`, Team Norway `/team-norway/spiller/[spillerId]/turneringsplan`.
- Finnes ikke ennå: `/team-norway/referanse/*` (WAGR, Sammenlign, Søk, Planlegger, Norsk golf, Tester), spillerfanene Ranking, Turneringer og Trening, og tilstanden «spiller uten deling».
- Planleggeren for referansespillere (WAGR-spillere uten HQ-konto) finnes bare på teamnorwayref. Tabellen `wagr_reference_plans` (`WagrReferencePlan`) ligger i basen og er den delte lagringen.
- HCP Norge: utsatt (Anders 23.10). Menypunktet skjules til videre.

## 2. Hva «planlegger i alle tre flater» betyr

| Flate | Hva som finnes | Hva som bygges |
|---|---|---|
| Team Norway | Planen for én spiller med deling (treneren foreslår) | Referanse › Planlegger: plan for hver norsk WAGR-spiller, delt mellom trenerne |
| AgencyOS | Planen for én spiller i stallen (coachen endrer direkte) | Samme Referanse-planlegger for coach, pluss lenke fra Spiller 360 |
| PlayerHQ | Spillerens egen plan med WAGR-anslag | Bare egen plan. Ingen navngitte andre spillere (se avvik under) |

**Avvik som må avgjøres:** 28.09 bestemte du at spilleren ikke ser sammenligning mot andre spillere, og 21.10 at Team Norway bare er for trenere. En Referanse-planlegger med navngitte spillere i PlayerHQ strider mot begge. Anbefaling: PlayerHQ beholder egen plan (med nivåanslag uten navn), og referanse-planleggeren går i Team Norway og AgencyOS.

## 3. Plan (10 steg, én PR per steg med auto-merge når verify og CI er grønne)

1. **Kartlegg WAGR-kolonnene mot basen** (`wagr_snapshots`, `wagr_player_strengths`, `wagr_model_runs`, `wagr_reference_plans`) og skriv ett felles datalag. Ferdig når en lesespørring gir samme tall som teamnorwayref for samme uke.
2. **Personvern først:** test som låser at en spiller i TN-gruppa ikke får TN-innhold, og at en trener uten delingssamtykke ikke ser IUP, tester eller trening. Ferdig når begge testene er grønne.
3. **Referanse-skall** `/team-norway/referanse` med faner WAGR · Sammenlign · Søk · Planlegger · Norsk golf · Tester (HCP skjult). Ferdig når menyen er målt i 390, 1280 og 1920 px uten sidelengs rulling.
4. **Referanse › WAGR:** leaderboard, graf, turneringer og sesong, med kilde «World Amateur Golf Ranking (WAGR), The R&A» og dato.
5. **Referanse › Sammenlign og Søk** (alle norske, født 2005 eller tidligere, bare brutto).
6. **Referanse › Planlegger** i Team Norway: bygger på `Turneringsplanlegger` og `wagr_reference_plans`. Treneren foreslår; planen lagres delt.
7. **Planlegger i AgencyOS:** samme Referanse-planlegger for coach og lenke fra Spiller 360. Ferdig når coachen kan åpne, endre og lagre en referanseplan.
8. **Planlegger i PlayerHQ:** gjennomgang av `/portal/tren/turneringer` mot Skrå-designet, og «Se hva Team Norway ser» (`/portal/meg/deling/innsyn`) når spilleren er i en TN-gruppe. Ingen navngitte andre spillere.
9. **Spillerprofil (IUP):** fanene Ranking, Turneringer og Trening, og tilstanden «spiller uten deling» i stedet for 404.
10. **Norsk golf (bare samlede tall: nivå, klubb, region, tour) og videresendinger** for gamle adresser. Steg 10 i det gamle redesignet (Gruppeposter, Dokumenter, Skoler, College) bygges etter ditt ja til utkast 4.

Rekkefølge: 1–2 først, deretter 3–9 i rekkefølge, 10 sist. Ingen to steg rører samme filer samtidig.

## 4. Rammer og risiko

- **Måling:** hver skjerm i 390 og 1280 px (og 1920) uten sidelengs rulling og konsollfeil. Arbeidskopien har ikke `.env`, og Vercel er stoppet, så innloggede skjermer kan ikke måles her uten at du gir en måte å logge inn lokalt på.
- **Barnevern:** ingen navngitte spillere under 18 i samlede tall. Navngitte juniorprofiler er fortsatt uavklart (beslutninger 21.10, punkt 5).
- **Data som mangler:** WAGR-plass før turnering, plass per uke og gruppelistene ligger bare i filer hos pipelines. Der viser vi «—» til de er i basen.
- **Skjermbilder** tas lokalt, ikke på Vercel (byggestopp fra 07:10).

## 5. Uavklart

1. PlayerHQ: bare egen plan (anbefalt), eller også referanse-planlegger (strider mot 28.09)?
2. Hvordan skal innloggede skjermer måles lokalt?
3. Utkast 4 (steg 10 i det gamle redesignet): ja eller nei?
