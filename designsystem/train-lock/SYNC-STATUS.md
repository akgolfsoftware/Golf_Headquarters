# Train-lock — synkstatus

**Sist synket: 01.09.2026 kl 10:05 fra «Player HQ Train lock.zip» (218 designfiler i
prosjektet) — verifisert med CRC/sha256 mot repoets forrige tilstand, ikke bare tatt på
tro. Del av revisjonsøkten 01.09.2026 (designstatus-kartlegging + doc-opprydding).**

## Innhold

213 `.dc.html`-skjermfiler + `DESIGN-SYSTEM.md`, `SCREEN-INDEX.md`, `PORTING.md`,
`HANDOFF.md`, `support.js`, `three-d-stage.js`. `README.md` og denne fila er repoets egne
og finnes ikke i zip-en. Zip-ens `CLAUDE.md` og `CLAUDE-CODE-IMPORT-PROMPT.md` ligger nå i
`referanse/` (se §Bevisst avvik fra import-prompten under) — **flettes IKKE inn i
rot-CLAUDE.md**, i motsetning til hva en tidligere synk-runde (28.08) gjorde. Grunn: zip-ens
CLAUDE.md er Claude Design-PROSJEKTETS tegneinstruks (bl.a. sier den «SF Pro» — feil for
dette repoet, se under), ikke repoets kode-instruks. Der de to spriker vinner alltid
repoets `.claude/rules/beslutninger.md`.

## Siste synk (01.09) — hva som endret seg

- **3 nye skjermer (6 filer med lys-par):** `PH-21 Min kurve` (+L) — spillerens egen
  til-par-kurve, ingen persentil/kullrangering på spillerflaten (bevisst). `A-19 Innsikt`
  (+L) — coachens fire spørsmål (vekstrate/tak/konkurranse/program), kullsnitt kun tillatt
  her, grått/stiplet. `DG-01 DataGolf topplister og SG-profil` (+L) — ny, større DG-01 som
  ERSTATTER (i fasit-forstand) den gamle `DG-01 DataGolf spiller.dc.html`, som forblir i
  repoet men nå står under «Uklassifisert» i SCREEN-INDEX.md, ikke i «## DG · Data Golf»
  — behandle den gamle filen som utgått referanse, ikke fasit.
- **Ny fargegrammatikk innført som fasit** (`DESIGN-SYSTEM.md` §1, `HANDOFF.md`
  30.08.2026-oppføring): `shot #B08968` = spillerens egne data (kurve/spredning/stolper),
  `target #0A84FF` = noe satt/valgt (målvindu, aktiv fane, valgt rad), `mute #8E8E93` =
  referanse/kontekst (kullsnitt, tourgjennomsnitt), `text #F5F5F5` = hierarki, aldri
  dataserie. Maks tre farger i én ramme, aldri to på samme datatype. Rullet ut på PH-21,
  A-19, DG-01 i begge moduser — **ikke ennå verifisert at eldre skjermer (TM-serien m.fl.)
  følger denne grammatikken**, se prioritert liste i revisjonsrapporten.
- **`.thumbnail` oppdatert.** Øvrige 207 filer er byte-identiske med forrige leveranse
  (verifisert med sha256 fil for fil, python zipfile mot repoets filer).
- **Ingen filer fjernet.**

## Bevisst avvik fra import-prompten (bekreftet på nytt 01.09)

Zip-ens `CLAUDE-CODE-IMPORT-PROMPT.md` sier fortsatt `design/train-lock/` som målsti —
repoet beholder `designsystem/train-lock/` (etablert kanon, CLAUDE.md invariant 2). Dette
er andre gang samme avvik dukker opp (også notert 26.08) — Claude Design-prosjektets egen
eksport-mal er ikke rettet på prosjektsiden. Neste zip-import: forvent samme avvik, ikke
flytt mappen.

## Forrige synk (28.08) — hva som endret seg

- **8 nye skjermfiler:** `AG-19 Notifikasjonssenter` (varselkjede/godkjenn-ark),
  `AO-13 Routing-hub` (AgenticOS lokal vs. sky), `EC-02 AS Compliance` (AS-frister),
  `GAP-2 Tilstander drift` (runtime nede / re-auth), `S3-03 Spiller profil bento`
  (ny landingsside for spiller — S3-01 er fortsatt arbeidsvisning), `TM-12 Okt teknikk
  og slag`, `TM-13 Progresjon maalvindu`, `TM-14 Bag mapping og DECADE` (siste tre er
  TrackMan/Analyse-huben — se §Presedens for fargeregelen: målvindu er `target #0A84FF`,
  ALDRI ok-grønn, bom er `dim`/`mute` aldri danger).
- **Global motion-token-pass i 41 filer (~95 trykkflater):** gammel trykk-easing
  (`transition: transform 180ms cubic-bezier(...)` + separat `style-active`) byttet til
  fasit-tokenet `data-press="1"` (220ms inn / 110ms release). `TRAIN LOCK.dc.html` er
  selve mønsteret — diffen der er KUN denne attributt-byttet, ingen farge-/tokenverdier
  endret (verifisert linje for linje). `DESIGN-SYSTEM.md` §4 utvidet med de faktiske
  motion-tokenene (`--ease-out`, `[data-press]`, hover-gating, reduced-motion/-transparency).
  Trykkflate-minimum presisert til 44px inkl. chips/pills; 5 filer/11 flater rettet fra
  34→44px der mønsteret var en ekte pille.
- **`HANDOFF.md` oppdatert** (49 749 → 58 055 byte): seks nye linjer for EC-02/AG-19,
  GAP-2/AO-13, S3-03 og TM-12–14, pluss motion-pass-linjen.
- **`.thumbnail` oppdatert.** De øvrige 142 uendrede filene er byte-identiske med forrige
  leveranse (verifisert med sha256 fil for fil).
- **Ingen filer fjernet** — ren tilvekst + attributt-pass, ingen erstattede/utgåtte
  skjermer denne runden.

## Forrige synk (26.08) — hva som endret seg

- **19 nye skjermfiler:** hele foreldreportalen — FO-02–FO-10 i mørk + lys, pluss
  `FO-01L Forelder les lys` (svar på bestillingen 26.08: alle flater i lys og mørk).
- **3 nye doc-filer:** `DESIGN-SYSTEM.md` (look-fasit), `SCREEN-INDEX.md` (alle filer med
  rammeantall/breakpoints/`data-screen-label`), `PORTING.md` (kode-port-kontrakt).
- **`HANDOFF.md` oppdatert** (48 263 → 49 749 byte): to nye linjer under gap-pass —
  systematiseringen 26.08 + foreldreportal-leveransen.
- **`.thumbnail` oppdatert.** Alle øvrige 177 skjermfiler + begge js-filene er
  **byte-identiske** med forrige leveranse (verifisert med sha256 fil for fil).
- **Bevisst avvik fra import-prompten:** prompten sier `design/train-lock/` — repoet
  beholder `designsystem/train-lock/` (etablert kanon; CLAUDE.md invariant 2, T-bølgens
  sesjonsrader og D2-tokens-dokumentasjonen peker alle hit). Én kanonisk mappe, ingen
  duplikater — intensjonen i prompten er oppfylt.

## Forrige synk (25.08 kveld)

Kun **én fil**: `AX-01 Skall rail og tabbar.dc.html` (2 809 → 11 431 byte). Den forrige
var avkuttet midt i en `div` og inneholdt verken rail eller tabbar.

## Holdt utenfor repoet med vilje

Zip-ens `uploads/`-mappe (Team Norway-protokoll i xlsx med levende
evalueringsskjema-lenker, fire bilder, ett skjermbilde og en referanse-HTML-mappe
`Acrispgreybox_blue/`). Repoet er offentlig, og materialet er NGF/TN-internt. Ligger i
stedet i cowork: `akgolf-hq/innkommende/train-lock-uploads-2026-08-28/`.

## Presedens ved konflikt

1. **`AX-01`** — skallet (destinasjoner, rail, tabbar). Kanon fra 25.08, se
   `docs/natt/D2-UNDERLAG-2026-08-25.md` §5.6.
2. **`TRAIN LOCK.dc.html` + `HANDOFF.md`** — tokens, geometri, type, motion.
3. **`AG-00` / `WB-00` / `TM-00`** — komponentspec.
4. **Skjermfilene** — enkeltskjermer.

Rail-en i A-/AG-skjermene (7 ikoner i 64 px) og `AG-00` K1/K2 er **utdatert** etter
AX-01-leveransen. Ikke bruk dem som skall-kilde.

## Kjente selvmotsigelser

17 stykker, kartlagt og dokumentert i `docs/natt/D2-UNDERLAG-2026-08-25.md`.
De 14 som krevde en menneskelig beslutning er avgjort av Anders 25.08 — se §5.
