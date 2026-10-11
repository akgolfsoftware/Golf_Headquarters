# Repoopprydding 11.10.2026

Daterte målinger, ikke en ny produktfasit. [Aktiv hovedplan](../plan-ferdigstilling.md) · [Fast Git-arbeidsflyt](git-arbeidsflyt.md) · [Maskinlesbart register](repo-opprydding-2026-10-11.json).

## Utgangspunkt og metode

71 eksterne grener inklusive main og 33 åpne PR-er ved start. Full historikk er hentet uten prune. Sammenligningsgrunnlag: `166ab799ad5a5298223e98296a2e2f52749f6767`. Det er kontrollert ancestry, patch-ekvivalens (`git cherry`), likhet på endrede filstier og konfliktfri Git-merge (`git merge-tree`). Bare reservegrenen er helt inne i main utover main selv. Ingen annen gren er dermed bevist overflødig.

19 av 33 PR-er gir konflikt ved sammenslåing med start-main; 14 gir konfliktfri Git-merge. Tallet 17 i en tidlig status var feil og er korrigert her. #1060 har #1004-grenen som faktisk base, så testen mot main beskriver sluttintegreringen, ikke bare barnets egen PR-diff.

For de undersøkte PR-headene returnerte GitHub 26 grønne CI-kjøringer, 6 røde og én uten kjøring. Dette er historiske resultater mot angitt head, ikke ny test av hele kombinasjonen. En konfliktfri Git-merge eller identisk patch er ikke funksjonell godkjenning.

## Utført

- PR #993 lukket som utdatert forslag om 600 slettinger. Grenen `chore/rydd-utgatt` og commit `916739c074ed9bd50964bf8473bf71a6447cf5f3` er bevart.
- PR #1214 tatt inn som datert ordkartlegging etter grønn CI og ny lokal dokument-/strukturkontroll. Ny main: `e43cced6a1813fb6d3e1b690c9fbc04dbccf33cd`. Den overstyrer ikke språk-masteren.
- 15 PR-er med konflikt eller rød CI satt tilbake til utkast: #1010, #1052, #1031, #1027, #1024, #1194, #1206, #1207, #1060, #1004, #1195, #1142, #1143, #1144 og #1146. Eksisterende utkast beholdt. Ingen kode er slettet ved dette.
- Hovedplanen oppdateres i #1210 med gjeldende status og varige lenker til de tidligere detaljplanene.
- Lesende `repo:status`-verktøy laget for begge Mac-er. Testene bruker bare et syntetisk lokalt Git-repo og kontrollerer at refs, head, arbeidsfiler og stasher er uendret av lesingen.

## Viktige blokkeringer

- #1206: CI `37964454740` stopper i `check-action-auth`: `harCoachTilgangTilSpiller` velges via en lokal funksjonsvariabel, som kontrollen ikke gjenkjenner som kall. En ubrukt-import-feil er ikke i seg selv bevis på manglende runtime-vakt. Bevar lese-/skriveskillet ved retting.
- #1207: CI `37964452356` gjenkjenner ikke importen `krevDataGolfBruker` i `src/app/(marketing)/stats/sg-sammenlign/actions.ts`. Kontroller vaktens rollekrav før kontrollskriptet eventuelt utvides.
- #1194/#1195: undersøkte historiske bygg stopper i Google-font/Turbopack-oppløsning. De er ikke godkjent på ny main bare fordi årsaken er funnet.
- #1212 flytter kontroll av slettingsgrunnlaget utenfor transaksjonen. Samtidighet og bekreftelse må vurderes; eksisterende grønne tester dekker ikke hele denne risikoen.
- MacBook Air/Mac mini er ikke tilgjengelige. Ingen lokale arbeidskopier, stasher eller ignorerte filer der er kontrollert, flyttet eller slettet. Dette blokkerer endelig grensletting.
- Det aktive main-regelsettet krever `verify`, men ikke oppdatert base. Fem integrasjoner har bypass. Identitet/eierskap må avklares før unntak fjernes; administrative innstillinger er ikke endret.
- Produksjonstest ved push til main er ikke knyttet til bekreftet deploy. Undersøkte produksjonskjøringer var avbrutt. Ingen produksjonsgodkjenning er gitt.

## Lokal kontroll av oppryddingen

Full `npm run verify` med økt minnegrense kom gjennom Prisma, TypeScript, lint og de statiske Node-kontrollene før `tsx scripts/ordbok-json.ts` stoppet med `listen EPERM /tmp/tsx-0/...pipe`. Dette er en miljøblokkering, ikke bestått full verify. Senere endringer i dokumenter/verktøy får egen målrettet kontroll; den endelige kandidaten må gjennom full GitHub CI før merge. Ingen kvalitetsvakt er slått av.

Etter de siste lokale endringene består `npm run prosjekt:sjekk`, `git diff --check`, ESLint for de to nye verktøyfilene og 2/2 verktøytester. Den syntetiske Git-testen ble kjørt med en skrivbar `TMPDIR` i arbeidsområdet fordi miljøet her ikke har vanlig `/tmp`. Den er også lagt til i `verify:static`, slik at samme test kjøres av GitHub CI. Original Precision-PR #1215 er ikke endret av oppryddingen.

## PR-register ved start og behandling

| PR | Gren | CI på head | Konflikt mot start-main | Behandling |
|---|---|---|---|---|
| [#1215](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1215) | `codex/precision-kontroller-2026-10-11` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/38136394373) | Nei | Utkast med grønn CI. Ekte tastatur og visuell godkjenning gjenstår; ikke automatisk ferdig designport. |
| [#1214](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1214) | `claude/github-repo-update-059c21` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/38111096445) | Nei | Merget som dokumentert språkkartlegging; ingen ny språkfasit. Lokal grenstatus på Mac-ene må avklares før sletting. |
| [#1213](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1213) | `claude/fase2-1h-vaktskript-2026-10-09` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/38050320401) | Nei | Prioritert gjennomgang av tilgang/data. Tidligere grønn CI; kombinasjonen med aktuell main og #1206 må verifiseres før merge. |
| [#1212](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1212) | `claude/fase2-3c-scorekort-slag-2026-10-09` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/38050278248) | Nei | Behold. Gjennomgå bekreftet sletting, samtidige endringer og kombinasjon med #1203; UI må kontrolleres. |
| [#1211](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1211) | `claude/fase2-1e-under-16-2026-10-09` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/38050257286) | Nei | Behold. Avklar åpne alder-/forelderregler og kontroller samspill med org-tilgang før merge. |
| [#1210](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1210) | `codex/plan-ferdigstilling-2026-10-09` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/37988996803) | Nei | Aktiv hovedplan og repoopprydding. Oppdater denne PR-en fremfor å opprette en konkurrerende plan. |
| [#1209](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1209) | `codex/plan-live-lagring-2026-10-09` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/37987156006) | Nei | Detaljgrunnlag bevart og koblet fra hovedplan #1210. Lukk først når den samordnede planen er tatt inn. |
| [#1208](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1208) | `claude/fase2-1c-coachvideo-eier-2026-10-09` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/37964537268) | Nei | Prioritert gjennomgang av tilgang/data. Tidligere grønn CI; kombinasjonen med aktuell main og #1206 må verifiseres før merge. |
| [#1207](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1207) | `claude/fase2-2-datagolf-coach-2026-10-09` | [failure](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/37964452356) | Nei | Utkast. CI gjenkjenner ikke krevDataGolfBruker i sg-sammenlign/actions. Kontroller selve vakten og kallstedet før oppdatering av kontrollen. |
| [#1206](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1206) | `claude/fase2-1a-org-trenere-2026-10-09` | [failure](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/37964454740) | Nei | Utkast. CI feiler på indirekte tilgangsvaktkall i wb-actions/treukerssyklus-actions. Bevar skille mellom lese- og skriverett; rett uten å svekke vakten. |
| [#1204](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1204) | `claude/fase2-1b-ai-chat-eier-2026-10-09` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/37963513415) | Nei | Prioritert gjennomgang av tilgang/data. Tidligere grønn CI; kombinasjonen med aktuell main og #1206 må verifiseres før merge. |
| [#1203](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1203) | `claude/fase2-1d-talenotat-slag-2026-10-09` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/37952253565) | Nei | Prioritert gjennomgang av tilgang/data. Tidligere grønn CI; kombinasjonen med aktuell main og #1206 må verifiseres før merge. |
| [#1195](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1195) | `docs/beslutning-kodegjennomgang-2026-10-06` | [failure](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/37599994028) | Nei | Utkast. Beslutningsgrunnlag for sikkerhets-PR-ene; historisk CI-feil i fontbygg. Avstem med gjeldende beslutninger og kjør ny kontroll. |
| [#1194](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1194) | `claude/backend-plan-2026-10-05` | [failure](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/37473256078) | Ja | Detaljgrunnlag bevart og koblet fra hovedplan #1210. Lukk først når den samordnede planen er tatt inn. |
| [#1146](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1146) | `grok/ph-neste-tjue` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/37124395818) | Ja | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| [#1144](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1144) | `grok/ph-neste-fem-5` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/37150713255) | Ja | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| [#1143](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1143) | `grok/ph-neste-fem-4` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/37150673849) | Ja | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| [#1142](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1142) | `grok/ph-neste-fem-3` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/37150628986) | Ja | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| [#1083](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1083) | `codex/ak-sg-runtime-2026-10-02` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/37008032351) | Ja | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| [#1060](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1060) | `claude/pakke-1-felles-kjerne` | [failure](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36676496230) | Ja | Utkast, basert på #1004 (ikke main). Vurder deldiff mot forelder og integrering mot main; ikke bulk-merge de 264 filene. |
| [#1052](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1052) | `claude/agencyos-ag07-ny-spiller-0930` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36673151408) | Ja | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| [#1045](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1045) | `claude/agencyos-ag05-tilgjengelighet-0930` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36665903165) | Nei | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| [#1041](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1041) | `claude/agencyos-ag11-maned-0930` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36664580555) | Ja | Behold som utkast/parkert. Avklar produktvalg og målreise, løs konflikter og mål relevant skjerm før videreføring. |
| [#1031](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1031) | `claude/agencyos-ag11-arsplan-periode-0930` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36663307759) | Ja | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| [#1027](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1027) | `claude/agencyos-ag16-arsplan-skoledata-akstigen-0930` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36660982234) | Ja | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| [#1025](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1025) | `claude/ph-bk-02-velg-tid-2026-09-30` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/37342049892) | Ja | Behold som utkast/parkert. Avklar produktvalg og målreise, løs konflikter og mål relevant skjerm før videreføring. |
| [#1024](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1024) | `claude/agencyos-aga03-gruppeanalyse-0930` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36660326299) | Ja | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| [#1023](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1023) | `claude/agencyos-ag15-tester-normer-tildel-0930` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36664763733) | Ja | Behold som utkast/parkert. Avklar produktvalg og målreise, løs konflikter og mål relevant skjerm før videreføring. |
| [#1018](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1018) | `claude/agencyos-ag16-gruppedetalj-timeplan-0930` | [failure](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36657037991) | Ja | Behold som utkast/parkert. Avklar produktvalg og målreise, løs konflikter og mål relevant skjerm før videreføring. |
| [#1010](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1010) | `claude/a4-parkert` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36962183612) | Ja | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| [#1004](https://github.com/akgolfsoftware/Golf_Headquarters/pull/1004) | `claude/port-wang-tn-2026-09-29` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36623564279) | Ja | Utkast. Hent bare fortsatt nyttige skjerm-/funksjonsendringer etter sammenligning med dagens WANG/TN og tilgangsregler. |
| [#993](https://github.com/akgolfsoftware/Golf_Headquarters/pull/993) | `chore/rydd-utgatt` | Ingen kjøring funnet | Ja | PR lukket; gren bevart. Vurder konkrete slettinger i små endringer etter import-/referansekontroll. |
| [#931](https://github.com/akgolfsoftware/Golf_Headquarters/pull/931) | `claude/arsplan-junior-16` | [success](https://github.com/akgolfsoftware/Golf_Headquarters/actions/runs/36344100502) | Ja | Behold som utkast/parkert. Avklar produktvalg og målreise, løs konflikter og mål relevant skjerm før videreføring. |

## Grenregister

Foran/bak gjelder commits mot start-main, ikke antall ferdige funksjoner. Full SHA, endrede filstier, konfliktmeldinger og neste handling står i JSON-registeret. Ingen grener er slettet.

| Gren | SHA | Foran / bak | Åpen PR ved start | Neste handling |
|---|---|---|---|---|
| `chore/rydd-utgatt` | `916739c074ed` | 600 / 233 | #993 | PR lukket; gren bevart. Vurder konkrete slettinger i små endringer etter import-/referansekontroll. |
| `chore/slett-utgatt` | `1d92d737b427` | 18 / 234 | — | Behold slettingsforslaget. Ikke slå inn massedeletinger; hver fil må kontrolleres mot aktive brukere. |
| `chore/slett-utgatt-2026-10-10` | `157dc47b6ad0` | 16 / 0 | — | Behold slettingsforslaget. Ikke slå inn massedeletinger; hver fil må kontrolleres mot aktive brukere. |
| `chore/slett-utgatt-docs` | `9eed0575fb05` | 53 / 20 | — | Behold slettingsforslaget. Ikke slå inn massedeletinger; hver fil må kontrolleres mot aktive brukere. |
| `chore/slett-utgatt-docs-planer` | `f5ed3a23e8d1` | 30 / 20 | — | Behold slettingsforslaget. Ikke slå inn massedeletinger; hver fil må kontrolleres mot aktive brukere. |
| `chore/slett-utgatt-fra-main` | `3908bcbc8319` | 142 / 20 | — | Behold slettingsforslaget. Ikke slå inn massedeletinger; hver fil må kontrolleres mot aktive brukere. |
| `chore/slett-utgatt-innhold` | `acb5ceb53995` | 30 / 0 | — | Behold slettingsforslaget. Ikke slå inn massedeletinger; hver fil må kontrolleres mot aktive brukere. |
| `claude/a4-parkert` | `278b4bfe53c9` | 7 / 179 | #1010 | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| `claude/agencyos-ag05-tilgjengelighet-0930` | `48389a963705` | 2 / 216 | #1045 | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| `claude/agencyos-ag07-ny-spiller-0930` | `2bbd8057dece` | 2 / 216 | #1052 | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| `claude/agencyos-ag11-arsplan-periode-0930` | `315fc0b02cd0` | 2 / 216 | #1031 | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| `claude/agencyos-ag11-maned-0930` | `2ac16ca521a0` | 2 / 216 | #1041 | Behold som utkast/parkert. Avklar produktvalg og målreise, løs konflikter og mål relevant skjerm før videreføring. |
| `claude/agencyos-ag15-tester-normer-tildel-0930` | `1bcaac964c0a` | 4 / 216 | #1023 | Behold som utkast/parkert. Avklar produktvalg og målreise, løs konflikter og mål relevant skjerm før videreføring. |
| `claude/agencyos-ag16-arsplan-skoledata-akstigen-0930` | `c5a6c5f8e4eb` | 2 / 216 | #1027 | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| `claude/agencyos-ag16-gruppedetalj-timeplan-0930` | `affd0578b105` | 2 / 216 | #1018 | Behold som utkast/parkert. Avklar produktvalg og målreise, løs konflikter og mål relevant skjerm før videreføring. |
| `claude/agencyos-ag19-jarvis-caddie-0930` | `4996aefe4c34` | 2 / 216 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `claude/agencyos-ag23-oppsett-0930` | `b326d4616e5a` | 3 / 216 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `claude/agencyos-ag24-drift-0930` | `f2476ffb0669` | 3 / 216 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `claude/agencyos-aga03-gruppeanalyse-0930` | `2a578962a305` | 2 / 216 | #1024 | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| `claude/arsplan-junior-16` | `647d9cdae6c0` | 7 / 250 | #931 | Behold som utkast/parkert. Avklar produktvalg og målreise, løs konflikter og mål relevant skjerm før videreføring. |
| `claude/backend-plan-2026-10-05` | `df2345bcaf6a` | 3 / 59 | #1194 | Detaljgrunnlag bevart og koblet fra hovedplan #1210. Lukk først når den samordnede planen er tatt inn. |
| `claude/fase2-1a-org-trenere-2026-10-09` | `c2a4623f6ccf` | 2 / 8 | #1206 | Utkast. CI feiler på indirekte tilgangsvaktkall i wb-actions/treukerssyklus-actions. Bevar skille mellom lese- og skriverett; rett uten å svekke vakten. |
| `claude/fase2-1b-ai-chat-eier-2026-10-09` | `dbfc0a3a1641` | 1 / 8 | #1204 | Prioritert gjennomgang av tilgang/data. Tidligere grønn CI; kombinasjonen med aktuell main og #1206 må verifiseres før merge. |
| `claude/fase2-1c-coachvideo-eier-2026-10-09` | `6c9501852ea5` | 1 / 5 | #1208 | Prioritert gjennomgang av tilgang/data. Tidligere grønn CI; kombinasjonen med aktuell main og #1206 må verifiseres før merge. |
| `claude/fase2-1d-talenotat-slag-2026-10-09` | `6ce861fa8eb6` | 1 / 8 | #1203 | Prioritert gjennomgang av tilgang/data. Tidligere grønn CI; kombinasjonen med aktuell main og #1206 må verifiseres før merge. |
| `claude/fase2-1e-under-16-2026-10-09` | `a08fe1131a4b` | 1 / 5 | #1211 | Behold. Avklar åpne alder-/forelderregler og kontroller samspill med org-tilgang før merge. |
| `claude/fase2-1h-vaktskript-2026-10-09` | `2353cea9f7cc` | 1 / 5 | #1213 | Prioritert gjennomgang av tilgang/data. Tidligere grønn CI; kombinasjonen med aktuell main og #1206 må verifiseres før merge. |
| `claude/fase2-2-datagolf-coach-2026-10-09` | `30ac2e172e06` | 1 / 5 | #1207 | Utkast. CI gjenkjenner ikke krevDataGolfBruker i sg-sammenlign/actions. Kontroller selve vakten og kallstedet før oppdatering av kontrollen. |
| `claude/fase2-3c-scorekort-slag-2026-10-09` | `1abc1c90c178` | 1 / 5 | #1212 | Behold. Gjennomgå bekreftet sletting, samtidige endringer og kombinasjon med #1203; UI må kontrolleres. |
| `claude/github-repo-update-059c21` | `9ed768b4a578` | 1 / 0 | #1214 | Merget som dokumentert språkkartlegging; ingen ny språkfasit. Lokal grenstatus på Mac-ene må avklares før sletting. |
| `claude/pakke-1-felles-kjerne` | `49db54b169d2` | 35 / 222 | #1060 | Utkast, basert på #1004 (ikke main). Vurder deldiff mot forelder og integrering mot main; ikke bulk-merge de 264 filene. |
| `claude/ph-au-02-registrer-2026-09-30` | `6c64bf1d570c` | 3 / 214 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `claude/ph-au-05-samtykke-lenke-2026-09-30` | `7577bae68b3e` | 1 / 216 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `claude/ph-bk-02-velg-tid-2026-09-30` | `38816adb6f5a` | 8 / 59 | #1025 | Behold som utkast/parkert. Avklar produktvalg og målreise, løs konflikter og mål relevant skjerm før videreføring. |
| `claude/ph-ph-03-oktark-2026-09-30` | `b92f7faaf65c` | 6 / 190 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `claude/ph-ph-04-live-for-start-v2-2026-09-30` | `8ceff2ad3760` | 3 / 189 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `claude/ph-ph-05-live-aktiv-2026-09-30` | `9ba8e784a9d4` | 3 / 188 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `claude/ph-ph-06-live-fysisk-2026-09-30` | `d3b16990601e` | 4 / 187 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `claude/ph-ph-07-etter-okt-2026-09-30` | `d27fa63fe5f5` | 2 / 183 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `claude/ph-ph-08-runde-live-2026-09-30` | `32b9b4a85819` | 2 / 191 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `claude/ph-ph-14-tester-2026-09-30` | `9ad875208645` | 1 / 216 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `claude/ph-ph-15-test-gjennomfor-2026-09-30` | `f7bc6262451e` | 1 / 216 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `claude/ph-ph-17-trackman-2026-09-30` | `e5ba9489da1f` | 3 / 213 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `claude/ph-ph-18-snittscore-runder-2026-09-30` | `4f3002e93037` | 1 / 216 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `claude/ph-ph-20-gameplan-2026-09-30` | `7e41d199381c` | 1 / 216 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `claude/ph-ph-21-innboks-2026-09-30` | `a1aeda7adb3d` | 2 / 216 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `claude/ph-ph-22-caddie-chat-2026-09-30` | `c0746947ffef` | 1 / 216 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `claude/ph-ph-23-booking-2026-09-30` | `017db35ff6c5` | 1 / 216 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `claude/ph-ph-25-abonnement-innstillinger-2026-09-30` | `71e110653188` | 1 / 216 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `claude/port-wang-tn-2026-09-29` | `5693da104a04` | 34 / 222 | #1004 | Utkast. Hent bare fortsatt nyttige skjerm-/funksjonsendringer etter sammenligning med dagens WANG/TN og tilgangsregler. |
| `codex/ag19-caddie-jarvis` | `eeb0b31028e4` | 1 / 70 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `codex/ag21-oppgaver` | `9f92e0ae85a3` | 2 / 70 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `codex/ag23-oppsett` | `83bf59f3ad28` | 1 / 69 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `codex/ak-sg-runtime-2026-10-02` | `aab824423c62` | 3 / 156 | #1083 | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| `codex/ph26-fysplan-2026-10-03` | `97828aae1a41` | 2 / 94 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `codex/plan-ferdigstilling-2026-10-09` | `60525fc970d0` | 1 / 5 | #1210 | Aktiv hovedplan og repoopprydding. Oppdater denne PR-en fremfor å opprette en konkurrerende plan. |
| `codex/plan-live-lagring-2026-10-09` | `c7c11e286969` | 2 / 5 | #1209 | Detaljgrunnlag bevart og koblet fra hovedplan #1210. Lukk først når den samordnede planen er tatt inn. |
| `codex/precision-kontroller-2026-10-11` | `e8d61a7d4788` | 1 / 0 | #1215 | Utkast med grønn CI. Ekte tastatur og visuell godkjenning gjenstår; ikke automatisk ferdig designport. |
| `codex/testbatteri-scorekort-2026-10-02` | `49cdc552e730` | 3 / 135 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `docs/beslutning-kodegjennomgang-2026-10-06` | `a7f20d7cdc19` | 1 / 59 | #1195 | Utkast. Beslutningsgrunnlag for sikkerhets-PR-ene; historisk CI-feil i fontbygg. Avstem med gjeldende beslutninger og kjør ny kontroll. |
| `docs/ordbok-master` | `817f84109fb8` | 1 / 59 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `docs/workbench-beskrivelse` | `83c992d23146` | 1 / 59 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `fix/d13-samtykke-wang-tn-tester` | `0d304a0b50e7` | 4 / 59 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `grok/ph-neste-fem-2` | `40b6fb764058` | 1 / 95 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |
| `grok/ph-neste-fem-3` | `d1a88db4f8ed` | 1 / 95 | #1142 | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| `grok/ph-neste-fem-4` | `1b040f45f523` | 1 / 95 | #1143 | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| `grok/ph-neste-fem-5` | `b645d2448fc6` | 1 / 95 | #1144 | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| `grok/ph-neste-tjue` | `7c62ac78b648` | 1 / 102 | #1146 | Utkast ved konflikt. Sammenlign målskjermen og dataflyten med dagens app og valgt Precision-referanse før deler videreføres. |
| `main` | `166ab799ad5a` | 0 / 0 | — | Felles integrert grunnlag; ingen direkte push. |
| `reserve/lokal-main-runde-kontrakt-2026-09-27` | `4b553524585f` | 0 / 245 | — | Historikken er i main. Kandidat for sletting først etter kontroll av begge Mac-er. |
| `review/kodegjennomgang` | `6ce6ec4d20fa` | 2 / 59 | — | Unikt avvik uten åpen PR. Undersøk tidligere PR og dagens bruk; bevar frem til semantisk sammenligning og lokal kontroll er ferdig. |

## Neste kontroll

1. Kjør og sammenlign lokale rapporter fra begge Mac-er. Sikre unikt arbeid før enhver sletting.
2. Kontroller hovedplan-/verktøykandidaten med full CI, og oppdater denne rapporten med resultat og SHA.
3. Etter samordnet plan på main kan #1194 og #1209 lukkes med lenke til bevart detaljgrunnlag.
4. Gjennomgå sikkerhets-PR-ene i avhengighetsrekkefølge. Nye eller endrede tilgangsregler må ha positive og negative tester.
5. Løs skjermkonflikter ved å hente avgrenset nyttig arbeid, ikke ved å erstatte dagens app med gamle filer.
6. Rydd først grener/worktrees som er bevist overflødige og kontrollert på begge maskiner. Åpne produktvalg og ukontrollert UI blir stående som åpne.
