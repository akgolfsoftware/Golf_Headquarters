# Intelligence-lån — komponenter fra AK Golf Intelligence DS

Kopiert 2026-07-06 (design-bølgeplan D0) fra «AK Golf Intelligence Design System»-eksporten
(Claude Design, 2. juli 2026). Intelligence er et EGET produkt, men designsystemet bruker
identisk token-kjede (forest/lime, samme semantiske aliaser, JetBrains Mono) — komponentene
fungerer derfor uten re-skinning.

**Ikke del av det manifest-verifiserte v13-settet.** Egen mappe for tydelig proveniens.
Tas i bruk just-in-time av design-bølgene:

| Komponent | Bruk | Bølge |
|---|---|---|
| ProtocolScorecard (+ protocol-definitions.js) | Testprotokoll-scorekort, entry/compact/print | D3 |
| SGRadarChart | 5-akse SG-radar m/ PGA-benchmark | D2 |
| TeeStrategyPlanner | 18-hulls tee-strategi m/ SG-effekt | D2/D3 |
| StatBox | KPI-tile m/ delta-chip — sammenlign mot kit-KpiTile før bruk | D1 |
| SessionHistoryList | Rundehistorikk-liste | D2 |
| TournamentCard | Turneringskort | D2 |

Kontrakter (prompt.md) og typer (d.ts) fulgte med fra kilden.
