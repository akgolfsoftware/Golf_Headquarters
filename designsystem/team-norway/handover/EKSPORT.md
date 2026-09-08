# EKSPORT — hva som skal inn i `designsystem/team-norway/`

Speilet i repoet er fra **før 08.09.2026** og er utgått på tre punkter: det mangler
TN-15 til TN-21, de fire nye guideline-kortene, og det har fortsatt den gamle
`SKILL.md` som motsier `readme.md` og `tokens/`.

## 0 · Hvorfor dette er en manifestfil og ikke en ferdig mappe

Eksportmappen kan ikke ligge inne i designprosjektet selv. Kompilatoren som bygger
`_ds_bundle.js` skanner **hele** prosjektet for `<Navn>.d.ts` + `<Navn>.jsx`,
`@dsCard`-merkede `.html` og `.dc.html`-maler. En kopi av `components/`,
`guidelines/` og `templates/` inne i prosjektet gir duplikate komponentnavn og
dobbelte kort, og korrumperer designsystemet det skal eksportere.

Kopieringen gjøres derfor rett fra prosjektroten til repoet, med denne fila som
kart. Prosjektroten **er** eksportpakken.

Praktisk, i repoet:

```bash
# 1 · rydd bort det som er død historikk (se §3)
git rm designsystem/team-norway/prompt-batch-2.md \
       designsystem/team-norway/prompt-batch-3.md \
       designsystem/team-norway/prompt-tn03-fellestesting.md \
       designsystem/team-norway/docs/team-norway-workdesk-skjermplan.md

# 2 · legg inn hele prosjektet på nytt, uten uploads/ og thumbnails
#     (samme utelatelser som importen 30.08.2026)
rsync -a --delete \
  --exclude 'uploads/' --exclude 'scraps/' --exclude '.thumbnail*' \
  --exclude 'prisma/' --exclude 'handover/' \
  "<utpakket Claw-prosjekt>/" designsystem/team-norway/

# 3 · legg handover-pakken ved siden av speilet, ikke inni det
cp -r "<utpakket Claw-prosjekt>/handover" designsystem/team-norway-handover
```

`--delete` er med vilje: speilet skal være identisk med prosjektet, ikke en
sammenblanding av to generasjoner. §3 lister det som forsvinner, og det er
gjennomgått.

## 1 · Hva pakken inneholder

| Fra prosjektroten | Filer | Merknad |
|---|---|---|
| `readme.md` | 1 | **Fasit for stil og regler.** Oppdatert 08.09: 21 skjermer, seks menygrupper, nye åpne punkter |
| `SKILL.md` | 1 | Erstattet. Inneholder ingen designverdier lenger — bare pekere til `tokens/`, `components/`, `readme.md` |
| `styles.css` | 1 | Eneste fil en konsument trenger å linke |
| `tokens/` | 4 | `colors.css` · `typography.css` · `spacing.css` · `effects.css`. **Fasit for verdier** |
| `fonts/fonts.css` | 1 | Google Fonts-lenker (Schibsted Grotesk, IBM Plex Mono) |
| `components/` | 44 | 14 komponenter × (`.jsx` + `.d.ts` + `.prompt.md`) + fire kortfiler |
| `guidelines/` | 18 | 14 fra før + **15-icons · 16-truthlayer · 17-states · 18-org-skin** |
| `templates/` | 33 mapper | 21 TN-skjermer (noen med mobilfil) + 10 generelle maler + systemkartet |
| `assets/logo/` | 2 | `team-norway-golf.png` (fasit) + `-original.jpg` (leveransen fra NGF) |
| `docs/` | 4 | Vurderingen 02.09, ferdigstillingsloggen 08.09, gap-analysen, turnering-datakilder |
| `thumbnail.html` | 1 | Prosjektflisen |
| `github.md` | 1 | Kildekoblingen — hvilket repo speilet hører til |
| `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json` | 3 | Kompilatorgenerert. Kopieres, redigeres aldri |

## 2 · Filer i dagens speil som ERSTATTES

Alle med nyere innhold. Ingen av dem skal flettes — den nye versjonen vinner.

| Fil i speilet | Hvorfor |
|---|---|
| `readme.md` | Uendret siden 02.09. Viser 15 skjermer der det nå er 21, og lister `SKILL.md`-konflikten som åpen (den er lukket) |
| `SKILL.md` | Gammel generasjon: «Jost + Public Sans», «ingen skygger, ingen piller». Systemet bruker Schibsted Grotesk, IBM Plex Mono, tre skyggenivåer og `--radius-full`. **Dette er den viktigste enkeltfilen i erstatningen** — den har vært en aktiv felle for enhver som leste speilet |
| `LES-MEG.md` | Sier «15 foundation-kort», «12 skjermmaler» og at `TnBatch1.dc.html` er i feil stil og 206 bytes. Alle tre er utdatert: 18 kort, 33 maler, og TN-00 er omtegnet i Claw-stil med tom/laster/feil |
| `guidelines/01…14` | Uendret innhold, men kopieres på nytt så mappen er konsistent |
| `tokens/*.css` | Uendret verdimessig siden 01.09 — kopieres for å bekrefte at produksjonsspeilet `--tn-*` fortsatt er i takt (se `PORTING.md` §2) |
| `styles.css`, `fonts/fonts.css` | Samme |
| `components/` | `MetricTile.source`, `HeroMeta.source`, `Select.error`, `DataTable.empty/loading` er nye props, og `.d.ts`-filene er oppdatert samtidig. Rå hex er borte fra alle 14 |
| `templates/` (alle) | 21 TN-skjermer mot tidligere 14, ni maler ryddet fra rå px/hex til tokens, systemkartet omskrevet |
| `_ds_bundle.js`, `_ds_manifest.json`, `_adherence.oxlintrc.json` | Regenerert |
| `github.md` | Ny sync-seksjon |

## 3 · Filer som SLETTES — død historikk

| Fil | Hvorfor den er død |
|---|---|
| `prompt-batch-2.md` | Bestillingsskjema for batch 2. Utført. Beskriver skjermer som nå finnes ferdig, med en skjermnummerering som ikke lenger gjelder |
| `prompt-batch-3.md` | Samme, batch 3 |
| `prompt-tn03-fellestesting.md` | Bestilling av TN-03. Utført 31.08 |
| `docs/team-norway-workdesk-skjermplan.md` | Skjermplanen — «hva som er bestilt, hva som gjenstår». Erstattet av `SKJERMREGISTER.md` i denne pakken, som i tillegg har rute, roller, tilstander og byggstatus per skjerm |

De tre prompt-filene er ikke bare uinteressante, de er **aktivt villedende**: de
inneholder skjermnumre og navn fra før nummereringen ble lagt om 08.09
(Trenerkatalog og Referansenivåer flyttet fra TN-15/16 til TN-20/21).

Beholdes: `docs/vurdering-2026-09-02.md` (fortsatt fasit for gap-listen),
`docs/ferdigstilling-2026-09-08.md` (beslutningsloggen for det som ble rettet),
`docs/gap-iup-2025.md`, `docs/turnering-datakilder.md`.

## 4 · Kontroll etter kopiering

```bash
ls designsystem/team-norway/guidelines | wc -l      # 18
ls -d designsystem/team-norway/templates/*/ | wc -l # 33
grep -rn "Jost\|Public Sans" designsystem/team-norway/   # ingen treff
grep -c "TN-21" designsystem/team-norway/readme.md       # minst 1
grep -rn "06 Praksis" designsystem/team-norway/guidelines | wc -l  # 4
```

Siste linje er kortgruppen de fire nye kortene ligger i. Står det `05 Praksis`
noe sted, er kopien halv — gruppen ble rettet fra 05 til 06 fordi `05 Komponenter`
allerede var tatt.
