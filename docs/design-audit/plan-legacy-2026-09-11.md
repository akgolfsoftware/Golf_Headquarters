# D2-PLAN — eldre planøkter i ukeoversikten

11.09.2026. Codex-pakke på `codex/plan-legacy-2026-09-11`, etter main-samlingen [PR #835](https://github.com/akgolfsoftware/Golf_Headquarters/pull/835). Denne nye pakken er lokal og ikke flettet eller publisert.

## Før / etter / hvorfor

| Før | Etter | Hvorfor |
|---|---|---|
| Plan og ukeprogresjonen leste V2 og Workbench, men utelot eldre TrainingPlanSession uten V2-speil | Eldre økter hentes fra aktive planer med status ACCEPTED, ACTIVE eller PAUSED | Godtatte økter skal ikke forsvinne fordi de mangler en nyere speilrad |
| Datamodellen kunne kreve to representasjoner av samme økt | Et eksisterende V2-speil skjuler originalen, også utenfor den viste uken og ved avlysning | Flytting/fullføring/avlysning skal ikke gjenopplive originalen eller telle dobbelt |
| Eldre økter manglet representasjon i ny Plan | Egen `model: plan`, bevart plan-ID, dato, pyramide, mål, sted og øvelser | Riktig redigeringskobling og start-/fortsett-/oppsummeringsrute uten å slå sammen øktmodellene |

## Omfang og regler

- `src/app/portal/actions.ts`: fem nye linjer kobler inn leseren etter eksisterende tilgangskontroll. SG-funksjonene er urørt.
- `src/lib/portal/legacy-plan-week-data.ts`: kun lesing. Avgrenser på spiller, aktiv/godtatt plan og halvåpen Oslo-uke. DRAFT, REJECTED, PENDING_PLAYER, ARCHIVED og inaktive planer tas ikke inn som eldre planøkter. ABANDONED følger I dag-filteret og utelates.
- `src/lib/portal/plan-week.ts`: ACTIVE/PAUSED vises som pågående, COMPLETED som fullført, CANCELLED/SKIPPED beholder status. Eldre modell har ikke strukturert avbruddsårsak; en slik årsak oppfinnes ikke fra fritekst. Hoppet over uten kjent årsak teller etter eksisterende etterlevelsesregel; avlyst gjør ikke det.
- Ukeminutter er fortsatt planlagt varighet, ikke målt treningstid. Drillens egne minutter går foran bibliotekets varighet; manglende drilltid representeres med 0 i den eksisterende talltypen, uten å dikte opp ti minutter.
- Eksisterende V2-/Workbench-filtre, øktmodeller, databasen, globale stilverdier og PH-06-filer er uendret. Speiloppslag gjøres bare når uken har eldre kandidater og er begrenset til deres ID-er og samme spiller.

## Kontroll

**Bestått:** 11 nye kontrolltilfeller i `plan-week.test.ts` og `week-overview.test.ts`. Samlet `npm test`: **2 337 bestått**, ingen feil/hoppet over (2 334 ordinære + 3 komponenttester).

Kontrollene bruker den faktiske `getWeekOverview`, visningsmodellen og ukeprogresjonen med simulert databasegrense. De dekker avvist tilgang uten databasekall, tre øktmodeller i én sortert uke, felles økt-/minuttelling, flyttede/avlyste speil utenfor ukeoppslaget, tom uke, status/ruter, manglende felt, sommer-/vintertid, årsskifte og lesefeil som ikke skjules som tomtilstand. Spørringenes eier-, godkjennings- og datofilter er eksplisitt kontrollert.

**Bestått kvalitetsgate:** `npm run verify`, inkludert Next/Serwist-bygg, samt `npm run prosjekt:sjekk`. Kontrollkopien bruker syntetisk miljø og har ingen produksjonsmiljøfiler. Streng lint av berørte kode-/testfiler bestod med null advarsler. Rå kontrollogger lagres privat under `_archive/main-samling-2026-09-11/`.

**Ikke kontrollert her:** databaseintegrasjon mot ekte planrader, innlogget spillerreise, nye skjermbilder eller visuell godkjenning. Dette er en retting av datalesingen i den allerede porterte Plan-skjermen; den visuelle retningen er ikke endret. Eksisterende V2-filter for planstatus er beholdt og harmoniseres ikke som del av denne pakken. PH-06 eies av Claude Code i separat arbeidsmappe.

## Samling og opprydding

PR #835 fikk grønn GitHub CI og ble flettet med `2807d4d08`. Vercel-preview ble avbrutt av dokumentfilteret, og separat kildeopplasting ble avvist av automatisk godkjenningskontroll; preview er derfor ikke bestått. Ingen produksjonsinnstilling ble endret.

Den flettede porteringsgrenen er fjernet lokalt og på GitHub. Den rene, gamle mappen `samlet-lanseringskontroll` er fjernet. Seks GolfBox-restfiler er bytekontrollert mot samlingskoden og sikkerhetskopiert privat, sammen med gammel Git-historikk i en bundle. Den gamle GolfBox-arbeidsmappen er deretter fjernet. Arbeidsgrenene for manuell SG og produktplan/intervju, samt fem eksisterende stasher, er bevart. Claude-mappen har egen kopi av avhengighetene og generert klient, slik at parallelle bygg ikke skriver til samme filer.

**Publisert main kontrollert:** Git-koblingen publiserte automatisk `2807d4d085072c22d14adf7e7fbd8fe01d6918d6` til Vercel, deploy `dpl_D1gELgyUAAkAoSjbXzGSpAdELSwW`, status READY. `/auth/login` svarer HTTP 200 med e-post-/passordskjema; `/portal` uten appinnlogging svarer 307 til `/auth/login?next=%2Fportal`. Dette bekrefter publisert kodeversjon og utlogget inngang, ikke innlogget funksjon eller datalagring.
