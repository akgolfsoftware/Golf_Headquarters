# Kjørebok — komplett opprydding, steg for steg

Du bruker to verktøy. **Claude Code** gjør ALT av kode og git (du skriver aldri git selv).
**Claude Design** lager designkilden.

- **Claude Code** = Terminal på Mac Mini, i mappa `~/Developer/akgolf-hq`. Du snakker til den i klartekst.
- **Claude Design** = `claude.ai/design`, prosjektet «AK Golf HQ Design System» (i nettleser).

Alle tre instruksjonsfilene ligger nå i repoet: `docs/opprydding/`. Claude Code leser dem der.

**Rekkefølgen (7 steg):**
1 Token-konvergens → 2 Håndhevelse → 3 Ny designkilde → 4 Importer ZIP → 5 Codemod → 6 Migrer skjermer → 7 Slett & rydd.
Steg 1, 2, 5, 6, 7 = Claude Code. Steg 3 = Claude Design. Steg 4 kobler dem.

**Regel gjennom hele:** Claude Code jobber på branch og verifiserer (tsc + build + skjermbilder)
før noe merges. Går noe galt → si «rull tilbake». Main er alltid trygg. Én ting om gangen.

---

## STEG 1 — Token-konvergens (Claude Code)

**Hvor:** Terminal, Claude Code i `~/Developer/akgolf-hq`.

**Lim inn:**
> Les `docs/opprydding/03-opprydding-plan.md`. Utfør Fase 0 og Fase 1: lag branch
> `opprydding/token-konvergens`, ta baseline-skjermbilder av nøkkelskjermene i lys og mørk,
> konverger `globals.css`-tokenene mot `src/styles/golfdata-tokens.css`, og verifiser mot
> baseline. Ikke merge — vis meg skjermbilde-diffen først.

**Ferdig når:** build er grønt og du har sett diff-bildene. Lys modus ~uendret, mørk modus har
fått v14-bakgrunn (#141513). Ser det riktig ut → si «merge til main».

## STEG 2 — Håndhevelse (Claude Code)

**Hvor:** samme.

**Lim inn:**
> Utfør Fase 2: legg til ESLint-regel som blokkerer import av gammelt athletic (unntatt
> golfdata), og CI-gate mot rå hex. Ikke-migrerte filer får `eslint-disable` med
> `TODO(opprydding)`. Verifiser at build er grønt og at en ny gammel-athletic-import gir feil.

**Ferdig når:** build grønt, rekkverkene står — ny drift er nå umulig.

## STEG 3 — Ny designkilde (Claude Design)

**Hvor:** `claude.ai/design`, prosjektet «AK Golf HQ Design System» (logg inn først).

**Gjør:** åpne `docs/opprydding/02-claude-design-prompt.md`, marker alt, kopier, lim inn i
prosjektet. La den bygge ferdig. Deretter: eksporter/last ned prosjektet som ZIP.

**Ferdig når:** du har en `.zip`-fil på maskinen (typisk i Nedlastinger).

## STEG 4 — Importer ZIP-en (Claude Code)

**Hvor:** Terminal, Claude Code.

**Lim inn** (bytt ut stien med hvor ZIP-en ligger):
> Her er den nye design-handover-ZIP-en: `~/Downloads/<filnavn>.zip`. Erstatt
> `public/design-handover/` med innholdet, og port komponentene vi trenger til
> `src/components/athletic/golfdata/` per `public/design-handover/PORTING.md`. Sjekk at
> token-verdiene fortsatt matcher `globals.css` — endret ZIP-en noen, kjør rask re-konvergering.
> Verifiser.

**Ferdig når:** build grønt, golfdata har de nye komponentene + `prompt.md`-kontraktene.

## STEG 5 — Codemod atomene (Claude Code)

**Lim inn:**
> Utfør Fase 3: codemod de seks atomene på tvers av repoet — `AthleticEyebrow`→`Eyebrow`,
> `AthleticBadge`→`Tag`, `AthleticButton`→`Button`, `AthleticAvatar`→`Avatar`, gammel
> `Sparkline`→golfdata `Sparkline`, `AthleticCard`/`DataCard`→`Card`. Verifiser per område.

**Ferdig når:** ~80 filer byttet automatisk, build grønt.

## STEG 6 — Migrer skjermer i bølger (Claude Code)

**Lim inn:**
> Utfør Fase 4, én bølge om gangen og STOPP etter hver så jeg kan se: (1) `src/components`,
> (2) `/portal`, (3) `/admin`, (4) marketing + forelder. Per skjerm: erstatt håndrullet UI med
> golfdata-komponenter, fjern gammel-athletic-import + `eslint-disable`, verifiser mot de 6
> hakene i MASTER-SKJERMPLAN + tilstandsgalleriet. Finnes ikke komponenten → meld gap, ikke improviser.

**Ferdig når:** hver bølge er grønn og du har godkjent. Dette er den lange delen — flere økter,
ikke stress gjennom den.

## STEG 7 — Slett og rydd (Claude Code)

**Lim inn:**
> Utfør Fase 5: slett det gamle athletic-biblioteket (behold golfdata), dedupe `globals.css`
> (fjern terminal `--t-*`, cockpit-tokens, `--pyr`-duplikater, `--cream/--sand/--paper`,
> ubrukte `gradient-avatar`), og håndter `styles/v2/patterns.css`. Verifiser.

**Ferdig når:** 0 gammel-athletic-import, `globals.css` inneholder kun DS-tokens + @theme + base.

---

## Hva du gir hvor (hurtigreferanse)

| Steg | Verktøy | Du gir | Du får |
|---|---|---|---|
| 1, 2, 5, 6, 7 | Claude Code | «les `docs/opprydding/03-…`, utfør Fase X» | verifisert kode på branch |
| 3 | Claude Design | innholdet i `02-claude-design-prompt.md` | v14 handover-ZIP |
| 4 | Claude Code | stien til ZIP-en | oppdatert golfdata + kontrakter |

## Hvis du står fast

- Claude Code er usikker → be den «stopp og spør», aldri gjett (din egen CLAUDE.md-regel).
- Noe ser feil ut etter en fase → «rull tilbake denne branchen». Du mister ingenting.
- Ikke start neste steg før forrige er grønt og godkjent.

## Rekkefølgen kort forklart (hvorfor akkurat denne)

- **1 før alt:** token-konvergens er ett grep i én fil som får hele appen på riktig farge-/
  spacing-verdi. Rask seier, lav risiko, og golfdata-komponenter ser først riktige ut etter dette.
- **2 rett etter:** rekkverkene stopper ny drift mens du migrerer — ellers lekker det tilbake.
- **3–4:** hent den komplette designkilden inn FØR du migrerer skjermer, så du migrerer mot et ferdig sett.
- **5–6:** codemod tar de enkle 80, deretter håndarbeidet skjerm for skjerm.
- **7 sist:** slett først når ingenting peker på det gamle lenger.
