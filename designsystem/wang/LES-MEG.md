# `designsystem/wang/` — lokalt speil

Speil av Claude Design-prosjektet **«WANG Toppidrett Fredrikstad — golf»**.
Alle 35 skjermer i flaten `/team-wang` ligger her, i to bredder og med minst to tilstander hver.

**Dette er IKKE kilden.** Samme regel som for `designsystem/train-lock/`: Claude Design-prosjektet
er fasiten, dette speilet ligger her for rask lesing og for at designet skal være synlig i PR-en.
Det oppdateres ikke automatisk og kan henge etter.

---

## Hva som ble slettet 08.09.2026

Det forrige speilet pekte på **to Claude Design-prosjekter som ikke finnes lenger**:

| Slettet referanse | Hva den pekte på | Erstattet av |
|---|---|---|
| `6061a53c` «WANG årsplan redesign» (15.08.2026) | `fasit/` | Samme filer, men eid av det gjeldende prosjektet. Ingen filer slettet. |
| `3935e216` «WANG Golf — Årsplan (redesign 2026)» (10.08.2026) | `skjermer/`, `komponenter/`, `grunnlag/`, `tokens/` | Samme filer, samme sted, nytt eierskap. Ingen filer slettet. |

Ingen `.html`-fil er slettet i denne oppdateringen. Det som er borte er **prosjekt-ID-ene og
konfliktregelen mellom dem** — det finnes ikke lenger to prosjekter som kan være uenige om en
skjerm, så «ved konflikt vinner `6061a53c`» er fjernet.

### Det som er nytt eller endret

- `skjermer-batch1/`, `skjermer-batch2/`, `skjermer-batch3/` — 30 nye skjermer (b1–b9, c1–c9,
  d1–d12). Alle i mobil 390 **og** desktop 1280.
- `skjermkart.html` — dekker nå alle 35 skjermer, ikke 23.
- `PORTING.md`, `SKJERMREGISTER.md`, `DATAMODELL.md`, `TILGANGSMATRISE.md`,
  `APNE-BESLUTNINGER.md` — nye. Dette er porteringspakken.
- `tokens/wang-tokens.css` — rettet til å være **byte-eksakt** mot `src/styles/wang-tokens.css`.
  Speilet manglet seks tokens og ett keyframe (`--text-on-dark-78/-85`,
  `--overlay-on-dark-06/-12`, `--surface-header`, `--wang-navy-deep-text`,
  `@keyframes wangArsplanFadeUp` med `.wang-arsplan-fade` og reduced-motion-blokken).
  `diff` skal nå være tom.
- **Fasiten er rettet på to punkter** (begge var design-feil, ikke kode-feil):
  farget topplinje fjernet fra hvite kort tre steder (merkevareregelen er «aldri ramme på kort»),
  og hendelsestypene skilt i fem: `konkurranse` er tatt i bruk med oransje, `prove` er lilla,
  og `hendelse` er rosa som i designsystemet.

---

## Mappene

| Mappe | Innhold |
|---|---|
| `fasit/` | Gjeldende fasit for årsplanen: elev og trener, kalender, samlinger, Skole, foreldre, økt-detalj og IUP-samtalen. Se `fasit/SYNC-STATUS.md`. |
| `skjermer/` | Skallet og fellessiden — `a1-skall`, `a2-hjem`, `a3-arsplan`, `a4-periode`, `a6-uke`. |
| `skjermer-batch1/` | b1–b9: testdag-føring, protokoller, resultater, ukessammendrag, dokumenter, statistikk-skinn, turneringer, elev-ark, samlinger. `skjerm.css` er delt av alle tre batchene. |
| `skjermer-batch2/` | c1–c9: elevliste, samling med uttak, økt-detalj, turnering-detalj, IUP med kildelinje, trenerflate, logg inn, systemtilstander, skole på 390. |
| `skjermer-batch3/` | d1–d12: rekruttering, plasser, koordinering mellom skoler, timeplan-føring, prøveplan, foreldremøte, gruppeposter, post til én elev, periodeplan, månedsplan, trenere og roller, inviter elev. |
| `komponenter/` | Gjenbrukbare byggeklosser: knapper og chips, økt-kort i alle fire tilstander. |
| `grunnlag/` | Farger, typografi, flater og bevegelse — merkevaregrunnlaget. |
| `tokens/` | Byte-eksakt kopi av `src/styles/wang-tokens.css`. Sammenlign med `diff`. |
| `docs/` | Vurderingen 02.09.2026 og andre notater. |

Åpne en `.html`-fil direkte i nettleseren. Hver fil viser mobil 390 først med sine tilstander,
deretter `Desktop 1280`, og avsluttes med designnotat og en navngitt liste over datamodell-hullet
skjermen forutsetter.

---

## Porteringspakken

Les i denne rekkefølgen:

1. **`SKJERMREGISTER.md`** — alle 35 skjermer med rute, roller, tilstander, bredder og status.
   Det som kan bygges nå står øverst.
2. **`TILGANGSMATRISE.md`** — hvem ser hva, per skjerm. Pakkens viktigste dokument: elevene er
   mindreårige, og fellessiden er navnefri med vilje.
3. **`PORTING.md`** — server mot klient, token-broen, komponentene, tom/laster/feil.
4. **`DATAMODELL.md`** — hullene gruppert etter modell, i rekkefølgen som låser opp flest skjermer.
5. **`APNE-BESLUTNINGER.md`** — det som venter på Anders, med hvilke skjermer hver enkelt blokkerer.

---

**Endrer du en token her, endre den i `src/styles/wang-tokens.css` i samme PR.** Det er
mottiltaket mot at redesignet og produksjonskoden divergerer (se
`docs/port/plan-design-wang-arsplan.md` §3).
