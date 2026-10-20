# Byggeplan: komplett spillerprofil og DataGolf-sider

Dato: 20.10.2026. Godkjent av Anders samme dag. Status: plan, ingenting bygget.

## Godkjente design (private Artifacts)

| Flate | Valgt | Lenke |
|---|---|---|
| Player HQ | Forslag A (rolig forside) | https://claude.ai/artifact/QNXpAttaDHx7sbUxjDy44s (fane «Player HQ forslag A») |
| AgencyOS | Forslag B (hele stallen i tabell, profil i sidepanel) | samme lenke, fane «AgencyOS forslag B» |
| Team Norway (profil og DataGolf) | Team Norways godkjente design, tre nye skjermer | https://claude.ai/artifact/Y2q85o83jWKR4BmSYucPn3 |
| WANG | Ny fane «Komplett profil» i elevprofilen | https://claude.ai/artifact/VuKzoJ3f7m17816nYrRQph |

Kilder til utkastene ligger i `docs/design-system/utkast-tn/`, `utkast-wang/` og `utkast-playerhq/`.
HTML-ene fra denne økten er ikke lagt inn i repoet ennå (steg 1).

## Hva som finnes fra før

- Datalaget `src/lib/profil-kobling/` (tilgang, visning, til-turneringer) og de tre midlertidige komponentene
  `src/components/profil/KomplettProfil{AgencyOS,Tn,Wang}.tsx` ligger på grenen `claude/profil-leser`
  (ikke i main). Ruter: `/admin/spillere/[id]/profil-komplett`, `/team-norway/spiller/[spillerId]/profil`,
  `/team-wang/coach/profil/[elevId]`.
- Player HQ har `/portal/meg/profil` og `/portal/meg/resultater`, men ingen samlet profil.
- DataGolf: `/admin/datagolf*` (DG-01–09), `/team-norway/datagolf`, `/portal/analysere/datagolf*`.
  Tilgang i dag: `DATAGOLF_ROLLER = ["ADMIN"]` i `src/lib/auth/datagolf-regel.ts`, altså bare admin.

## Harde regler for hele byggingen

- Brutto score. Ingen netto-klasser.
- Ingen Data Golf-tall på spillerprofilen, uansett rolle. `nordic_league` (DataGolf) vises aldri i spillerens egen profil.
- Golf-ID bare for trenere, aldri for spiller eller forelder (åpent valg 1 under).
- Mindreårige: bare resultater fra kilder der forbund eller tour har publisert dem.
- Runder merket «Bare deg» og IUP-utkast vises aldri.
- Team Norway og WANG leser samme data som spilleren via koblingen til Player HQ-profilen. Ingen kopi.
- Hver flate beholder sitt eget design. Ingen AK-farger i TN og WANG, ingen TN/WANG-farger i AgencyOS.
- Ingen emojier, Lucide-ikoner. Tekstkontrast minst 4,5:1. Ingen sidelengs rulling på 360 og 390 px.
- Aldri `commit -a`. Egen worktree per steg. Ikke rør main direkte.

## Steg (maks ti)

1. **Legg inn designkildene i repoet.** Lagre de fire HTML-utkastene i `docs/design-system/` og oppdater
   `bestilling-komplett-spillerprofil-2026-10-20.md` med valgene over. Ferdig når: filene åpner lokalt.
2. **Slå sammen datalaget.** Få `claude/profil-leser` inn i main (PR, tsc, lint og tester grønne).
   Ferdig når: `profil-kobling`-testene kjører grønt i main.
3. **Player HQ: samlet profil, forslag A.** Ny side under `/portal/meg/profil` med siste turnering som stort tall,
   siste resultater, fargede testkort, IUP og statistikk. Bare det spilleren selv kan se. Tomtilstander for
   «ingen tester», «ingen IUP», «ikke koblet».
4. **AgencyOS: stall som tabell, forslag B.** Bytt `KomplettProfilAgencyOS` til tabell med filter (gruppe, status)
   og profil i sidepanel. Bygg på Stall-siden etter audit B1 (Trenger deg fra ekte signaler, #1471).
5. **Team Norway: profilskjerm.** Bytt `KomplettProfilTn` til TN-byggeklossene fra utkastet. Tester med egne enheter
   viser lenke til Team Norway › Tester, ikke verdi.
6. **WANG: fane «Komplett profil».** Bytt `KomplettProfilWang` til WANG-utkastet, som egen fane i elevprofilen.
7. **DataGolf, nye skjermer (Team Norway-stil):** turnering med forhåndsprognose, sammenlign proffer. Data fra
   eksisterende `dg_*`-tabeller. Ny datahenting for prognose avklares først (åpent valg 3).
8. **DataGolf-tilgang.** Bekreft og test at bare Anders ser alle DataGolf-sider (dagens `["ADMIN"]` dekker det
   så lenge han er eneste admin), med test som feiler hvis noen annen rolle slipper inn.
9. **Kontroll.** Mobil (360/390) og PC (1280/1440) for alle flater, tilgangstest per rolle (spiller, forelder,
   coach, TN, WANG), sjekk at ingen netto-klasse, `nordic_league` eller DataGolf-tall vises på profilen.
10. **Utrulling.** PR per flate, merge når alt er grønt, Vercel-forhåndsvisning sjekket før main.

Rekkefølge: 1, 2, så 3–6 uavhengig av hverandre, 7–8 parallelt med dem, 9 og 10 til slutt.

## Åpne valg som Anders må ta før steg 3 og 7

1. **Golf-ID i Player HQ.** Bestillingen sier bare for trenere. Designet viser den også for spilleren selv.
   Anbefaling: skjul den for spilleren (gjeldende regel), vis den for trenere.
2. **Ekte navn i designene.** Utkastene bruker Max Risvågs ekte, offentlige resultater (han er født 2008).
   Repoets regel sier syntetiske navn. Dette gjelder bare utkastene, ikke bygget app.
3. **Prognosen i DataGolf.** Krever data vi kanskje ikke henter i dag (forhåndsmodell per turnering).
   Bekreftes i steg 7 før bygging, og kan koste ekstra kall mot DataGolf (grense 40 per minutt).
4. **DataGolf bare for Anders.** Tidligere vedtak (16.10) sa «alle coacher i AK Golf, WANG og Team Norway».
   Dagens kode gir bare ADMIN. Anbefaling: behold ADMIN til du uttrykkelig åpner for flere.
5. **Nordic League (GolfBox).** Kommer fra GolfBox, ikke DataGolf, men er utelatt i utkastene. Skal det vises
   for trenere?

## Ikke i denne planen

WANG- og Team Norway-demokontoene (audit A2/A3), Cockpit-lastetid (A1) og tom Innboks (A4) er egne spor i
`docs/design-audit/` og lanseringsplanen.
