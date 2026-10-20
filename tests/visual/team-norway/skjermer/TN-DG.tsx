/** Prøvefil for Data Golf (bare ADMIN) i retning «Skrå» (canvaset, tavlene F1–F2). Syntetiske proffnavn. */
import { Oversikt as TnDgOversiktVisning, Proff as TnDgProffVisning } from "@/components/team-norway/skjermer/tn-datagolf-visning";
import type { ReactNode } from "react";
import { TnShell } from "@/components/team-norway/tn-shell";
import type { WangDgProff } from "@/app/team-wang/_data/wang-datagolf-visning";

export const sti = "/team-norway/datagolf";

const d = new Date(Date.UTC(2026, 9, 19));
const proff = (dgId: number, navn: string, tour: string, sgTotal: number, dgRang: number): WangDgProff => ({ dgId, navn, land: "NOR", tour, sgTotal, dgRang, owgr: dgRang + 6, norsk: true });
const norske = [proff(1, "Proff A", "pga", 1.42, 12), proff(2, "Proff B", "pga", 0.96, 38), proff(3, "Proff C", "euro", 0.71, 61), proff(4, "Proff D", "euro", 0.38, 104), proff(5, "Proff E", "kft", -0.05, 188)];

const ramme = (barn: ReactNode) => (
  <TnShell aktiv="datagolf" brukerNavn="Anders" rolle="Administrator" groupId="g1" visTrenerflater kanAdministrere visDataGolf>{barn}</TnShell>
);

export const tilstander = {
  oversikt: ramme(<TnDgOversiktVisning d={{ side: "oversikt", antallProffer: 2184, kildedato: d, sistSynk: d, feiletSynk: 0, endepunkter: 9, forsinket: false, norske }} />),
  "oversikt-tom": ramme(<TnDgOversiktVisning d={{ side: "oversikt", antallProffer: 0, kildedato: null, sistSynk: null, feiletSynk: 0, endepunkter: 9, forsinket: false, norske: [] }} />),
  proff: ramme(<TnDgProffVisning d={{ side: "proff", proff: {
    navn: "Proff A", land: "NOR", tour: "pga", asOf: d, sgTotal: 1.42, sgOtt: 0.62, sgApp: 0.48, sgArg: -0.12, sgPutt: 0.44, driverYards: 312, driverTreff: 58, dgRang: 12, owgr: 18,
    innspill: [{ band: "100-150", lie: "fairway", meter: 7.4, gir: 71, slag: 2.9 }],
    sesonger: [{ tour: "pga", aar: 2026, runder: 78, snitt: 69.8, fairway: 58, gir: 69, putter: 28.6, sgTotal: 1.42 }],
  } }} />),
};
