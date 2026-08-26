/**
 * src/lib/domain/pei — scorekort- og PEI-beregningsmotoren, høstet fra
 * ak-golf-talenthq (N3, se docs/natt/N3-DONE.md).
 *
 * Tre separate motorer, aldri blandet i samme output (CLAUDE.md-invariant):
 *  - PEI:          pei-tabeller.ts, pei-beregning.ts
 *  - Broadie-SG:   broadie-sg-tabeller.ts
 *  - Poeng:        poeng-tabeller.ts
 * Orkestrert (fortsatt adskilt) av scorekort-motor.ts, som eksponerer én
 * dispatcher (`beregnCelle`) og tre separate rad-byggere
 * (`byggPeiRader` / `byggSgRader` / `byggPoengRader`).
 */
export * from "./protokoll-typer";
export * from "./protokoll-definisjoner";
export * from "./pei-beregning";
export * from "./pei-tabeller";
export * from "./broadie-sg-tabeller";
export * from "./poeng-tabeller";
export * from "./scorekort-motor";
