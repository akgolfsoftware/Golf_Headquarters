/** Prøvefil for PH-RD-02 til PH-RD-05 Slag for slag (oppsett, slag, putt, SG hittil). Syntetiske data. Alltid lyst. */
import type { ReactNode } from "react";
import { PH08RundeLive } from "@/components/portal/precision/PH08RundeLive";
import Loading from "@/app/portal/(fullscreen)/runde/live/loading";
import type { Ph0809Data } from "@/lib/portal-runder/load-ph08-09";

export const sti = "/portal/runde/live";

const data: Ph0809Data = {
  baner: [{ id: "b1", navn: "Fredrikstad GK", par: 72 }, { id: "b2", navn: "Borre GK", par: 72 }],
  sisteBaneId: "b1", sisteRunder: [], ulesteVarsler: 0, feil: false,
};
const rot = (n: ReactNode) => <div className="pa-root" data-design="precision-athletics" data-theme="light">{n}</div>;

export const tilstander = {
  oppsett: rot(<PH08RundeLive data={data} />),
  slag: rot(<PH08RundeLive data={data} visning="slag" />),
  putt: rot(<PH08RundeLive data={data} visning="putt" />),
  sg: rot(<PH08RundeLive data={data} visning="sg" />),
  tom: rot(<PH08RundeLive data={{ ...data, baner: [] }} />),
  laster: <Loading />,
  feil: rot(<PH08RundeLive data={{ ...data, baner: [], feil: true }} />),
};
