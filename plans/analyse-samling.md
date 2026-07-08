# Samle all analyse til én skjerm (Analysere) — plan

**Dato:** 2026-07-08 · Utfører Bøtte 2 (låst «Analyse samlet»). Mål: én analyse-hovedskjerm
med smart, sømløs flyt mellom delene.

## Slik blir det (målbilde)

**Én skjerm — Analysere — med seks faner (finnes allerede):**
`SG · Fokus · Runder · Baggen · Putting · Nivå`

Hver fane viser **sammendraget**. Vil du dypere (en bestemt runde, en kølles SG-detalj, en
TrackMan-økt), åpnes det **på stedet** med tydelig «tilbake» — du mister aldri plassen din.

Alt som i dag ligger spredt flyttes hit som drill-downs under Analysere:
- `mal/runder/*` (runde-detalj, slag-for-slag) → **Runder-fanen** sine detaljer
- `mal/sg-hub/*` (benchmark, utstyr, forhold, yardage, strategi …) → **SG-fanen** sine dybder
- `mal/trackman/*` → **Baggen-fanen** sin TrackMan-dybde
- `mal/statistikk` → inn i relevante faner

De gamle adressene **redirecter** til de nye, så ingen lenker/bokmerker brekker.

**Mål (goals) blir IKKE flyttet hit** — `/portal/mal`, bygger, milepæler, leaderboard er
*mål*, ikke analyse. De blir stående (hører til Oversikt/Workbench per låst regel).

## Det «smarte» ved flyten

1. **Delbar/bokmerkbar dybde:** fane + valg ligger i adressen (`?tab=sg&kolle=7j`), så en
   bestemt analyse kan deles og gjenåpnes rett dit.
2. **Drill-down i kontekst:** detalj åpnes med brødsmule tilbake til fanen — ikke en ny hub
   du må navigere ut av.
3. **Kryss-hopp der det gir mening:** fra en runde med svak nærspill-SG → hopp til SG-fanen;
   fra SG-fanen sitt største tap → «din svakhet → denne øvelsen»-broen (finnes alt).
4. **Én meny-inngang:** «Analysere» i nav. SG-Hub/Runder/TrackMan forsvinner som egne
   menypunkter (de er faner/dybder nå).

## Steg (jeg bygger, verifiserer per steg)

1. Flytt de dype destinasjonene under `/portal/analysere/*` (runde-detalj finnes alt; legg til sg-hub-dybder + trackman-detalj), gjenbruk eksisterende komponenter — ingen ny UI oppfunnet.
2. Koble fane-sammendragene til drill-down + brødsmule-tilbake + adressestyrt dybde.
3. Redirect gamle `/portal/mal/{runder,sg-hub,trackman,statistikk}` → nye analysere-adresser.
4. Fjern SG-Hub/Runder/TrackMan som egne nav-punkter; behold «Analysere».
5. Verifiser: `npm run verify` · begge moduser · mobil+desktop · ekte data · alle gamle lenker lander riktig. Oppdater MASTER-SKJERMPLAN.

**Ferdig når:** spilleren har én «Analysere» der alt henger sammen, gamle adresser lander
riktig, og ingen analyse-funksjon er tapt. ~19 spredte sider kollapser til dybder under én skjerm.

## Omfang / risiko

Stor jobb (flytter/redirecter ~19 ruter, kobler drill-down-flyt). Bygges på egen branch,
review med før/etter-lenke før merge. Ingen datalag endres — kun hvor skjermene bor + flyten.
