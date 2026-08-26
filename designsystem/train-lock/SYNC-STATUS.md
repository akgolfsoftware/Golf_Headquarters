# Train-lock — synkstatus

**Sist synket: 26.08.2026 fra «Player HQ Train lock (6).zip» (ny leveranse 26.08, 211 filer)
— import styrt av zip-ens `CLAUDE-CODE-IMPORT-PROMPT.md` (arkivert i cowork
`innkommende/train-lock-uploads-2026-08-25/`).**

## Innhold

196 `.dc.html`-skjermfiler + `DESIGN-SYSTEM.md`, `SCREEN-INDEX.md`, `PORTING.md`,
`HANDOFF.md`, `support.js`, `three-d-stage.js`. `README.md` og denne fila er repoets egne
og finnes ikke i zip-en. Zip-ens `CLAUDE.md` er flettet inn i rot-`CLAUDE.md`
(§Train-lock designfasit) per import-instruksen — ikke lagt her som andre CLAUDE.md.

## Siste synk (26.08) — hva som endret seg

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
evalueringsskjema-lenker, fire inspirasjonsbilder, en promptfil og en bildemappe).
Repoet er offentlig, og materialet er NGF/TN-internt. Ligger i stedet i cowork:
`akgolf-hq/innkommende/train-lock-uploads-2026-08-25/`. Uendret siden forrige leveranse
bortsett fra én ny bildemappe.

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
