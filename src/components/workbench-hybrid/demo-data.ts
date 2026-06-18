/**
 * Standardøkt-bibliotek for Workbench-paletten.
 *
 * Dette er den eneste legitime "demo"-kilden som er igjen: et lite startsett av
 * standardøkter (maler) brukeren kan dra inn i uka. Det er en plukkbar mal-liste,
 * ikke oppdiktet bruker-data presentert som ekte. Alle de andre fasit-demo-
 * verdiene (sesong-perioder, årsbelastning, måned-aggregater, adherence/SG,
 * turnerings-tidslinje, demo-uke) er fjernet — flatene viser ærlige tomtilstander
 * når det ikke finnes en ekte Prisma-kilde.
 */

import type { PaletteItem } from "./types";

export const PALETTE_LIBRARY: PaletteItem[] = [
  { pid: "p1", title: "Putting-grunntrening", dur: 30, cat: "SPILL", omr: "PUTT0_3", m: "M2", pr: "PR2", cs: "CS80", lfase: "L_BALL", praksis: "BLOKK" },
  { pid: "p2", title: "Teknisk — driver", dur: 60, cat: "TEK", omr: "TEE", m: "M1", pr: "PR1", cs: "CS70", lfase: "L_KOLLE", praksis: "BLOKK" },
  { pid: "p3", title: "Fysisk styrke", dur: 45, cat: "FYS", fysType: "STYRKE", sone: "SONE_3", pr: "PR2", praksis: "BLOKK" },
  { pid: "p4", title: "Banespill 9 hull", dur: 120, cat: "SLAG", omr: "SPILL", m: "M3", pr: "PR3", cs: "CS90", lfase: "L_AUTO", praksis: "RANDOM" },
  { pid: "p5", title: "Approach 50–100 m", dur: 60, cat: "TEK", omr: "INN100", m: "M2", pr: "PR2", cs: "CS80", lfase: "L_BALL", praksis: "RANDOM" },
  { pid: "p6", title: "Restitusjon", dur: 30, cat: "FYS", fysType: "MOBILITET", sone: "SONE_1", pr: "PR1", praksis: "BLOKK" },
];
