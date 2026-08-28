# DEPRECATED — Claude Paper

Denne mappen er **arkiv**. Den er ikke designfasit, ikke tokenkilde, og ikke few-shot
for nye skjermer i PlayerHQ, AgencyOS eller Forelder.

**Gjeldende system:** `../train-lock/` — start med `DESIGN-SYSTEM.md`, deretter
`SCREEN-INDEX.md` og `PORTING.md`.

I kode:
- Ny skjerm: `--tl-*` / `TL` (`src/styles/train-lock-tokens.css`, `src/lib/v2/train-lock.ts`)
- Utgående Paper-bro: `--p-*` / `T` — røres bare når en usportet rest skal bort
- Marketing (`src/components/marketing/paper/`) får beholde Paper-look. Ikke kopier den inn i `/portal` eller `/admin`.

Forbudt å ta herfra inn i produktflater: cream `#FAF9F5`, `#F0EEE6`, clay-CTA `#D97757`
som generell knapp, «varmt papir», Paper-radius 8/12, `akhq-tokens.css`.

Beslutning: Anders 25.08.2026, CLAUDE.md invariant 2.
