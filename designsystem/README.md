# Designarbeid og referanser

## Gjeldende designautoritet — 21.09.2026

[AK Golf Design System og Claude Design-prosjektet «App design»](../docs/design-system/design-autoritet.md)
styrer alt nytt designarbeid. Train-lock og Paper er utgående og har ingen visuell autoritet,
selv om eldre dokumenter eller kode bruker ordene «låst», «valgt» eller «fasit». Det skal ikke
spørres om dette på nytt. Eldre materiale under brukes bare til funksjonsdekning, sporbarhet og
kontrollert overgang.

## Aktiv Workbench-leveranse — 20.09.2026

Anders har bestilt portering av den konkrete Workbench-masteren med åtte piller.
[Overleveringen](../docs/workbench-handover.md) peker til kontrollert HTML, 16 PNG-er,
manifest og filhasher. Rust er kun de avtalte handlingene; øvrige kort og fyll er
grafitt. Denne bestillingen styrer Workbench-omfanget foran eldre kandidatstatus
under. `selectedForBuilding` i designprosjektet er ikke endret. Appens visuelle
og funksjonelle kontroll føres separat.

## Historisk produktretning før systemvalget — oppdatert 13.09.2026

Arbeidet startet fra blankt lerret i Claude Design og videreføres nå som ett **AK Golf HQ Design System** for hele den brukerrettede appen. PlayerHQ, AgencyOS, Team Norway og WANG er de fire prioriterte kjernene. Booking, marked, innlogging/konto, forelder, delt innsyn og systemtilstander skal bruke samme fundament gjennom navngitte profiler og mønstre. Arbeidsretningen heter **Atletisk intelligens**: sportslig og oppslukende PlayerHQ, rolig og presis AgencyOS, tid som ryggrad og mørk fokusmodus bare der oppgaven trenger konsentrasjon.

**Team Norway er særskilt låst og visuelt godkjent 13.09.2026:** Claw-pakken er valgt visuell autoritet for alle egne `/team-norway/*`-skjermer. Den ekte logoen, paletten, typografien, komponentgrammatikken og skjermmønstrene skal brukes; dette er ikke et rent farge-/logobytte. AK Golf HQs kode, funksjoner, datamodeller, tilgang, samtykke og personvern er fortsatt funksjonell autoritet. Se [beslutning og implementeringsomfang](../docs/design-system/team-norway-claw-valgt-2026-09-13.md).

Se [den sentrale retningskontrakten](../.claude/skills/ak-hq-design/references/atletisk-intelligens.md). Anders' bildesett fra 11.09 styrer visuell smak. Eksisterende Train-lock, Paper, v2 og tidligere designpakker brukes til funksjonsdekning og implementasjonsforståelse, ikke som visuell fasit i denne utforskingen.

Siste repo-kontrollerte samlede kandidat er **v0.4.10**; prosjektet står 16.09.2026 på v0.4.17/18 med Workbench **v0.12** (fem AK-akser), ikke kontrollert i repoet som samlet pakke; morgenrutinen 16.09 fant ingen ny eksport. Pakkens tokensett v0.4.3 ligger i koden som tokenlag (`src/styles/ak-hq-tokens.css`, PR #912) uten å endre noen skjerm — forarbeid, ikke fasit. Port før valg: se arbeidslisten CD-1–CD-7. Den dekker 32 av 35 funksjonsfamilier, alle 17 hovedreiser med klikkbar dekning og 72 av de opprinnelig registrerte 480 rutene som egne klikkbare flater; ti reiser er merket komplette i designregisteret. Kontrollert eksport har SHA-256 `01fdb517a840593ff5c2828eac90ee0710c0fea222198b263b1e43187f6c1801`. Kandidaten oppgir fortsatt `selectedForBuilding: false` og er derfor ikke en samlet byggebestilling. P11, O11 og O12 mangler fortsatt produktvalg og klikkbar familiedekning; øvrige bevisgrenser står i [masterplanen · historisk Git-versjon](https://github.com/akgolfsoftware/Golf_Headquarters/blob/a235444b0f7287b0ce7270c28b32d34517711a2f/docs/MASTERPLAN-GJENSTAAENDE.md). Den eldre [v0.3.3-kontrollen · historisk Git-versjon](https://github.com/akgolfsoftware/Golf_Headquarters/blob/f58904991c759b439891b46969f3ac9b03414b0f/docs/design-audit/claude-design-v0-3-3-2026-09-12.md) bevares som historisk kontrollgrunnlag.

Når en komplett pakke er valgt for bygging, er den eneste visuelle autoriteten for omfanget i pakken. Den ferdige pakken må inkludere de fire kjernene og navngi profil/mønster for øvrige brukerflater før lansering. Gamle designverdier og regler skal ikke overleve som skjulte standarder. De kan bare eksistere midlertidig mens en konkret brukerreise erstattes og prøves. Komplett krav til designomfang og Groks portering står i [Claude Design → Grok-kontrakten · historisk Git-versjon](https://github.com/akgolfsoftware/Golf_Headquarters/blob/007dd4e14e2a60882b30fe86105b3023100bc53e/docs/planer/claude-design-til-grok-portering-2026-09-12.md).

## Historisk portering og nåværende implementasjon

**Valgt for den bestilte porteringen 10.09.2026:** Anders har valgt Train-lock for PlayerHQ og AgencyOS, Claw / Team Norway for interne Team Norway-skjermer og WANG for WANG-skjermene. Bestillingen gjelder alle skjermene i disse fire områdene. Se [valgte kilder og kontrollstatus · historisk Git-versjon](https://github.com/akgolfsoftware/Golf_Headquarters/blob/5c87ebf7ae61200b651d72feb10cc24fd3978afe/docs/design-audit/portering-fire-flater-2026-09-10.md).

Byggegrunnlaget er `Player HQ Train lock (4).zip`, `Claw Design — Team Norway Golf.zip` og det eksisterende WANG-speilet. De to leverte ZIP-filene er inspisert og identifisert med SHA-256. Team Norway-pakkens 230 sammenlignbare designfiler er identiske med speilet; Train-lock har nyere filer som må kobles til hver portert reise.

Dette avsnittet dokumenterer porteringen og dagens implementasjonsgrunnlag. Den nye bestillingen fra 11.09 overstyrer Train-lock som visuell målretning for videre utforsking, men sletter ikke kode, historikk eller funksjonskrav. Gamle dokumenters slettelister, datamodellforslag og publiseringsinstrukser er underlag, ikke selvstendige kjøreordrer.

## Eksisterende underlag

For nytt arbeid: bruk [AK HQ Design-skillen](../.claude/skills/ak-hq-design/SKILL.md) og [samlet hovedprompt og arbeidsbeskrivelse](../docs/design-system/ak-hq-designarbeid.md). De definerer prosessen og dekningen, ikke et nytt låst utseende.

Tabellen viser hvor materialet og dagens implementasjon finnes. Versjonsvalget for den aktive porteringen står over.

| Flate | Eksisterende referanser | Dagens implementasjon |
|---|---|---|
| PlayerHQ `/portal`, AgencyOS `/admin`, Forelder `/forelder` | [Train-lock](train-lock/DESIGN-SYSTEM.md), [skjermregister](train-lock/SCREEN-INDEX.md), [portering](train-lock/PORTING.md) | `src/styles/train-lock-tokens.css`, `src/lib/v2/train-lock.ts` (`TL`) |
| Booking, også offentlig `/booking` | Tidligere lys Train-lock-flyt; finn B-skjermene i registeret | `--tl-*` / `TL` |
| Markedssider `/` og øvrig offentlig nettsted | [AK Golf-master](ak-golf/readme.md) | `--ak-*`, `src/styles/ak-golf.css`; genererte verdier kommer fra `ak-golf/tokens.json` |
| WANG `/team-wang` | [WANG](wang/LES-MEG.md), [portering](wang/PORTING.md) | `src/styles/wang-tokens.css` |
| Team Norway `/team-norway` | [Claw / Team Norway](team-norway/handover/PORTING.md) | Team Norway-pakkens tokenbro; delte analyseflater har Train-lock-struktur |
| Lokale utkast / tidligere godkjente tillegg | [Canvas](canvas/README.md) | Se den enkelte referansen. |

### Trenerprototypene for Team Norway og WANG

De to trenerflatene har hver sin klikkbare prototype i Claude Design. De er arbeidsflaten
for videre skjermarbeid på disse områdene, og de bruker **hvert sitt designsystem** — Team
Norway Golf for TN, WANG Toppidrett for WANG. Visuelle valg skal ikke krysse mellom dem.

| Flate | Prosjekt i Claude Design | Mappe | Omfang |
|---|---|---|---|
| Team Norway | Claw Design — Team Norway Golf | `templates/tn-coach-demo/` | TN-00–TN-27, 34 dyp-lenker, ni menypunkter |
| WANG | WANG Toppidrett Designsystem | `templates/wang-coach-demo/` | 59 skjermer, åtte menygrupper |

Begge er kontrollert 21.09.2026: hver rute er åpnet og målt, uten JavaScript-feil.
Kjente gap står i hver prototypes `readme.md` (og `kontroll-og-gap.md` for Team Norway).
Speilene under `team-norway/` og `wang/` i dette repoet er eldre og beholdes som
byggeunderlag for ruter, roller og datamodell — ikke som skjermfasit.


[Tema-dokumentet](../docs/design-system/TEMA-LYS-MORK.md) beskriver dagens kode. Det fastsetter ikke tema eller fonter i neste design. Historiske `Fasit:`-kommentarer dokumenterer opphav, ikke en aktuell godkjenning.

## Fra Claude Design til appen

1. Arbeid med sammenhengende brukerreiser. Anbefalt første gjennomgang er spillerens vei fra **I dag → Plan → gjennomfør økt → oppsummering**. Rekkefølgen er et forslag, ikke en ny låsing av meny eller produkt.
2. Når Anders velger en versjon for bygging, registrer designlenke eller eksport med versjon/dato, tilhørende skjermer, hovedhandlinger og overganger. Ta med mobil, desktop og relevante tomme, lastende, feil- og fullført-tilstander. Registrer avtalte temaer.
3. Bygg og vurder denne reisen samlet. Vis appen ved siden av valgt versjon, dokumenter funksjonstester og kjente avvik, og registrer Anders' vurdering. Andre skjermer kan fortsatt være under utforsking.

Byggestatus og rekkefølge føres i [arbeidslisten · historisk Git-versjon](https://github.com/akgolfsoftware/Golf_Headquarters/blob/a235444b0f7287b0ce7270c28b32d34517711a2f/docs/MASTERPLAN-GJENSTAAENDE.md). En komplett app før lansering er fortsatt målet; levering i gjennomgåtte deler endrer ikke dette målet.

## Bevaring og tekniske kontroller

Originalpakkene beholdes som referanser. Ved ny import brukes pakkens dokumenterte synk eller en versjonert leveranse, slik at opphav og tidligere arbeid bevares. Ikke overskriv dem med antakelser om arbeid som fortsatt pågår i Claude Design.

Gamle Paper-verktøy er arkivert og sperret etter oppryddingen. At designvalg er åpne, starter ikke disse verktøyene på nytt. Når en ny retning bestilles, oppdateres berørte designkontroller sammen med implementasjonen. Vanlige krav til personvern, tilgang, dataintegritet og autorisasjon gjelder fortsatt.
