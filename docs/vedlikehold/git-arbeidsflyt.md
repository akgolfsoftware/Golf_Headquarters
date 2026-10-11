# Git-arbeidsflyt for AK Golf HQ

Gjelder MacBook Air, Mac mini og alle kodeagenter. GitHub er felles transport og historikk. En lokal kopi kan ha nyere arbeid enn GitHub; det må måles, ikke antas.

## Start en økt

1. Bekreft riktig repo og oppgave. Les `START-HER.md` og oppgavens PR.
2. Kjør `npm run repo:status -- --fetch --label macbook-air` eller `mac-mini` i hver kjent klone. Kommandoen henter referanser, men bytter ikke gren, overskriver ikke filer og sletter/pruner ingenting.
3. Se etter endrede/usporede filer, stasher, upushede commits og avvik fra `origin/main`. Rapporten teller filene, men leser ikke innhold eller ignorerte filer. Andre kloner og andre maskiner er ikke undersøkt av denne kommandoen.
4. Bevar eksisterende arbeid før bytte av gren eller oppdatering. Ikke bruk automatisk stash, `reset --hard`, `clean -fd` eller force-push.
5. Søk i åpne og lukkede PR-er og grenregisteret før ny kode bygges. Én oppgave har én PR og én ansvarlig skriver.

Rapporten uten `--fetch` er lokal og kan ha utdaterte eksterne referanser. `same_as_upstream` gjelder bare commit-identiteten, ikke ulagrede filer. En grunn klone kan gi ufullstendig historikksammenligning. Lokale rapporter kan inneholde private filstier; de skal ikke committes.

## Arbeid og maskinbytte

- Bruk én arbeidsgren per avgrenset oppgave, `codex/` for Codex. Registrer gren og PR før større arbeid.
- Ikke la to agenter eller maskiner skrive samtidig på samme gren. Ved overlevering bytter ansvarlig skriver.
- Et worktree er en arbeidskopi, ikke en sikkerhetskopi. Lokale endringer følger ikke automatisk en push fra et annet worktree.
- Før maskinbytte: kontroller diff, følg gjeldende kontroll-/commitregler, push, og bekreft remote SHA mot lokal SHA. Ikke meld «lagret på GitHub» før dette stemmer.
- Overlevering i PR-beskrivelsen: commit, gjort, faktisk kontroll, åpne funn, neste konkrete steg og hvilken maskin som overtar. Ikke lim inn hemmeligheter eller ekte persondata.
- På neste maskin: fetch, bekreft identiteten og fortsett samme oppgave. Opprett ikke en ny implementasjon fordi arbeid mangler på `main`.
- Dersom kontrollmiljøet blokkerer full verify: bevar lokalt arbeid og dokumenter feilen. Eventuelle brukerautoriserte utkast-unntak gjelder bare angitt leveranse; de gjør ikke arbeidet godkjent for merge.

## Før merge

1. Registrer forventet head SHA og siste `main` SHA.
2. Les diffen, avhengighetene og kontrollresultatene. En konfliktfri Git-merge beviser ikke korrekt atferd.
3. Kontroller kombinasjonen med aktuell `main`. Etter konfliktløsning eller kodeendring må relevante tester og full kvalitetsport kjøres på nytt.
4. `npm run verify` omfatter statisk kontroll, tester og bygg. CI må være grønn for riktig kandidat. Dokumentarbeid må også bestå `npm run prosjekt:sjekk`.
5. Skjermendringer trenger faktisk visuell kontroll og Anders' godkjenning etter `AGENTS.md`; grønn CI er ikke visuell godkjenning.
6. Bruk forventet head SHA ved merge. Ikke bruk integrasjonsunntak til å omgå en rød eller uavklart gate.
7. Bekreft ny `main` og CI etter merge. Registrer deploy og produksjonskontroll separat.

Produksjonstester må oppgi faktisk deploy og appversjon. Push til `main` er ikke i seg selv bevis for deploy. Eksisterende Playwright-workflow kjører ved push og mot produksjons-URL; før dette er koblet til bekreftet deploy, kan resultatet ikke brukes som bevis for den nye committen.

## Rydd grener og worktrees

En gren kan først slettes når nyttig innhold er tatt inn eller bevart under en varig referanse, PR-en har sluttstatus, og begge maskinene er sjekket for lokale commits/endringer. Et arkivnavn alene gjør ikke arbeid overflødig. Squash/cherry-pick krever innholdssammenligning; `git branch --merged` er ikke nok.

Lukk utdaterte PR-er med begrunnelse og lenke til bevart arbeid. Bruk `git worktree remove` på bekreftet rene, ubrukte worktrees. Prune bare utdaterte worktree-registreringer etter fysisk kontroll. Slett aldri stasher, ignorerte filer eller lokale sikkerhetskopier som del av automatisk rydding.

## Verktøy og kontekst

`AGENTS.md` er felles instruks. Delte skills/hooks beholdes på eksisterende felles plass. Last bare oppgavens relevante skills og connectors. Git og filverktøy brukes til kode; browser brukes til faktisk UI. Lagre bevis med commit og kontrollmiljø, og les målrettede utdrag fremfor hele gamle logger. Ingen parallelle agenter som skriver i samme filer.

## Kontroll før noe kalles ferdig

Skill alltid mellom: sikret lokalt, pushet, PR opprettet, kontrollert, visuelt godkjent, merget, deployet og kontrollert i produksjon. «Ferdig» må angi hvilket av disse nivåene som er oppnådd.
