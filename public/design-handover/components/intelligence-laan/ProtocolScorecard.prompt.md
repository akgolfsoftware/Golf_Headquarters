Data-driven scorecard for the 16 Team Norway test protocols (from the treningsprotokoll Excel): 9 Golfslag tests (8-ball variation/blocked, Golfslag bane, Driver basic, Inspill Basis, Wedge Variation, 18-hull, Putt 1–3 m, 9 hull lengde) and 7 Teknikk gates (Nærspill/Wedge/Driver/Putt Gate, VISA Express, Putt Speed 1×5 / 3×3).

```jsx
<ProtocolScorecard protocolId="naerspill-gate" variant="entry" player="Sigrid Berge" date="2. mai 2026" />
<ProtocolScorecard protocolId="8-ball-variation" variant="compact" maxRows={8} />
<ProtocolScorecard protocolId="putt-gate" variant="print" player="" date="" />
```

Variants: `entry` (card-per-slag, 44px touch targets — player/tablet live entry), `compact` (dense table — coach desktop), `print` (paper-like ruled table with blank cells). Input cells keep the Excel "green cell" convention as a soft brand tint. Computed cells use the REAL Excel formulas via `sg-reference.js` (generated from the Referens sheet): PEI = resultat/lengde, Til mål = √((mål−carry)²+side²), PGA putts + SG fra lengde via strokes-gained-tabellene per lie, SG per hull = (SG fra lengde − 1) − PGA putts, poeng via oppslagstabeller. Dispersion-tester viser Hovland-referanse-PEI. `gender="jenter"` bytter banelengder/mål der protokollen har begge. Protocol definitions live in `protocol-definitions.js` — import `TEST_PROTOCOLS` / `getProtocol(id)`. Ukontrollert som default; `values` + `onChange` for kontrollert. **Lagring:** `sessionKey="min-økt"` autolagrer utkast i localStorage og viser fullfør-linje (vitne-felt + «Fullfør test») som skriver økten til `session-store.js`; `SessionHistoryList` viser de lagrede øktene. `completable` gir fullfør-linjen uten autolagring; `onComplete(session)` for egen håndtering.
