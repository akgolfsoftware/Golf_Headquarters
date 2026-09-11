# Prosjektkart og opprydding — 10.09.2026

Oppfølging 11.09: [siste samling og opprydding](samling-og-opprydding-2026-09-11.md) oppdaterer kodepakker, grener, arbeidskopier og kontrollstatus. Områdekartet under beskriver prosjektets struktur; daterte bevis gjelder sine oppgitte versjoner.

Hele prosjektmappen er kartlagt på filnivå, inkludert ignorerte filer og genererte mapper. Oppryddingen skiller aktiv kode, gjeldende instrukser, designleveranser, referanser, historikk og lokale driftsdata. Dette er en mappe- og kildeopprydding; det er ikke en påstand om at alle funksjoner er feilfrie eller alle skjermer ferdig portert.

[Start her](../../START-HER.md) · [dokumentregister](dokumentregister.md) · [filregister](filregister.json) · [flyttelogg](flyttelogg-2026-09-10.json).

## Resultat

- Én felles prosjektinstruks i `AGENTS.md`. Claude og Qwen peker dit; Grok leser samme kilder.
- Delte skills i `.claude/skills/`, med `.agents/skills` som relativ peker. De to ekstra Codex-kommandoene er bevart som felles wrappers. Ingen automatisk omdøping av Claude Design, modellnavn eller regelstier.
- Delte hooks i `.claude/hooks/`, med `.codex/hooks` som relativ peker. Hook-koden er uendret. Maskinlokalt oppsett er bevart og ignorert av Git.
- Ett designkart per flate. Motstridende Paper-, tema- og coach-menyinstruksjoner i aktive innganger er rettet.
- Eldre statusfortellinger og oppsettsguider er arkivert; full tidligere arbeidsliste og alle bestillinger er bevart.
- Designplaner er samlet under `docs/planer/design/`. Masterbrain-pakken ligger under `docs/referanse/masterbrain-rebuild/`.
- Åtte utgåtte designverktøy og den gamle databaseproben `verify.mjs` er arkivert og sperret. Ubrukte startmal-ikoner og Paper-tokenfilen er flyttet ut av offentlig innhold.
- 3,57 GB gamle byggfiler er fjernet. Lokale skjermbilder, testbilder, brainstorm-filer og miljøsikkerhetskopier er bevart i det ignorerte lokale arkivet.
- `npm run prosjekt:sjekk` kontrollerer struktur og lenker i både verify og CI; `npm run prosjekt:register` oppdaterer fil- og dokumentoversikten uten å lese private data.

## Hele mappen, område for område

| Mappe / filer | Rolle og behandling |
|---|---|
| `src/app/` | Alle ruter, API-er, sideoppsett og server actions. Beholdt. Bare dokumenthenvisninger er rettet. |
| `src/components/` | Produktkomponenter og felles byggesteiner. Beholdt; `v2`, `legacy` og `athletic` slettes ikke ut fra navn alene. |
| `src/lib/` | Forretningslogikk, integrasjoner, auth, beregninger og tester. Beholdt; ingen funksjonsrefaktorering. |
| `src/styles/`, `src/app/globals.css` | Aktive designverdier og stilark. Ingen visuelle verdier endret. |
| `src/data/`, `src/fixtures/` | Appens statiske data og testgrunnlag. Beholdt. |
| `src/generated/` | Prisma-generert klient. Lokal, regenererbar, beholdt for utvikling. |
| `prisma/` | Skjema, migrasjoner, SQL og seed-kilder. Beholdt. Ingen databasekommando kjørt mot tjenesten. |
| `supabase-meg/` | Separat personlig databaseskjema. Beholdt på stabil sti. |
| `designsystem/` | Train-lock, AK Golf, WANG, Team Norway og canvas. Alle leverte filer er bevart byte for byte; nytt kart ligger på rotnivå. |
| `docs/` | Samordnet dokumentinngang, aktiv arbeidsliste, daterte underlag og tydelig arkiv. Hele registeret lenker til hvert dokument. |
| `scripts/` | Kontroller, dataimport, bildeverktøy og lokale driftsjobber. Aktive stier beholdt; komplett katalog; utgått designverktøy flyttet. |
| `scripts/arkiv/` | Historiske engangsverktøy, inkludert utgåtte designverktøy. Ikke aktive npm-innganger. |
| `tests/` | Nettleser-, komponent- og visuelle tester. Testkoden beholdt. Lokale bilder er arkivert utenfor Git. |
| `public/` | Offentlig leverte bilder, fonter, merker, PWA-innhold og kino. Kun ubrukte startmalikoner og utgått Paper-CSS er arkivert. |
| `content/` | Publiserbart innhold. Beholdt. |
| `data/` | Importmal og private lokale eksportfiler. Kun metadata kartlagt; innhold og plassering beholdt. |
| `.claude/` | Regler, felles skills/hooks, kommandoer og lokalt verktøyoppsett. Foreldede kildehenvisninger rettet. |
| `.agents/`, `.codex/` | Felles innhold via relative pekere; lokale innstillinger bevart. Ingen uavhengige kopier av reglene. |
| `.grok/` | Grok-arbeidsflyt. Leser felles prosjekt- og designinstruks først. |
| `.github/`, `.husky/` | CI og Git-kontroller. Eksisterende kjøring beholdt; én lesende struktur-/lenkekontroll lagt til CI. Ingen publisering utløst. |
| `.vscode/`, `.claude/launch.json` | Startoppsett ryddet for slettede midlertidige mapper og andre prosjekter. |
| `.impeccable/` | Verktøykonfigurasjon beholdt; regenererbar hook-cache fjernet. |
| `.vercel/` | Lokal prosjektkobling beholdt. Ubrukte byggeutdata fjernet. |
| `.next/`, TypeScript-cache | Ubrukte byggfiler fjernet etter kontroll av kjørende prosesser. Regenereres ved utvikling/bygg. |
| `node_modules/` | Installerte avhengigheter beholdt. Ingen oppgradering eller reinstallasjon i prosjektmappen. |
| `.git/` | Historikk og øvrige grener beholdt. Arbeid på egen `codex/`-gren; ingen opprydding av andres grener. |
| `.worktrees/` | Git-ignorerte arbeidskopier for parallelle oppgaver. Hver kopi beholder sin egen gren og lokale filer; mappen skal ikke ryddes som genererte byggfiler. |
| `.env*` | Aktiv konfigurasjon urørt; eldre `.bak`-kopier flyttet lokalt uten å lese verdier. Aldri til Git. |
| Lokale logger og minnedatabaser | Beholdt på opprinnelige stier når driftsjobb eller runtime kan bruke dem. Ingen innholdsanalyse. |
| `_archive/local-opprydding-2026-09-10/` | Ignorert lokalt arkiv: originalkopier, full før-inventar, skjermbilder, testbilder og private sikkerhetskopier. Ikke publiser eller commit dette. |
| Rotens konfigurasjon | npm/lock, Next, TypeScript, ESLint, MDX, PostCSS, Playwright, Serwist, Vercel, sikkerhet og miljømal. Beholdt; npm har fått prosjektkontroller og mistet `speil:paper`. |

## Historiske designhenvisninger

[Registeret over gamle kildehenvisninger](historiske-designhenvisninger.md) viser 242 kildefiler med historiske design- eller DONE-referanser. De er ikke omskrevet til falske Train-lock-siteringer. Faktisk skjermport og de dokumenterte funksjonsfeilene er videre arbeid; oppryddingen gjør dem synlige.

## Kontroller og avgrensning

[Kontrollresultatene](kontrollresultat-2026-09-10.md): 2 152 tester bestod, typekontroll og lint bestod, alle trinn i verify er gjennomført og produksjonsbygget bestod i en isolert kopi. Seks positive og negative prøver av de nye kontrollene bestod. Alle 861 opprinnelige designleveransefiler er byte-identiske; alle 40 flyttinger er kontrollert mot originalen. Filregisteret beskriver alle eksisterende, Git-sporede og ikke-ignorerte prosjektfiler. Det fullstendige før-inventaret med lokale filer ligger i det private lokale arkivet. En oppføring i registeret er en klassifisering, ikke en påstand om at hver funksjon er gjennomtestet.

Den separate revisjonen fant [åpne funksjonsfeil](../beslutningsgrunnlag/revisjonsfunn-2026-09-10.md). De er tatt inn i arbeidslisten, slik at videre arbeid ikke starter fra den gamle påstanden om at kun betalingsoppsett gjenstår.

## Tilbakeføring

Git bevarer utgangspunktet `a619ec5df` og den lokale oppryddingsgrenen. Flytteloggen gir opprinnelig og ny sti samt kontrollsummer. Det lokale arkivet bevarer også de tidligere usporede verktøykopiene. Ved tilbakeføring: velg konkrete filer fra Git eller lokal originalkopi; ikke nullstill hele prosjektet eller overskriv nye brukerendringer.

Nye genererte bilder kan ligge i `tests/visual/ut/` og `screenshots/` under en aktiv måling, men de er aldri ny designfasit. Oppdater riktig register og kilde fremfor å lage enda et parallelt masterdokument.
