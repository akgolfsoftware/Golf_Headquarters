/** Prøvefil for PH-RD-06 Rask score (pakke 5). Syntetiske data. */
import type { ReactNode } from "react";
import { PH09RegistrerRunde } from "@/components/portal/precision/PH09RegistrerRunde";
import Loading from "@/app/portal/(fullscreen)/runde/logg/loading";
import type { Ph0809Data } from "@/lib/portal-runder/load-ph08-09";

export const sti = "/portal/runde/logg";

const data: Ph0809Data = {
  baner: [{ id: "b1", navn: "Fredrikstad GK", par: 72 }],
  sisteBaneId: "b1", sisteRunder: [], ulesteVarsler: 0, feil: false,
};
const rot = (n: ReactNode) => <div className="pa-root" data-design="precision-athletics" data-theme="light">{n}</div>;

export const tilstander = {
  data: rot(<PH09RegistrerRunde data={data} fullskjerm />),
  tom: rot(<PH09RegistrerRunde fullskjerm data={{ ...data, baner: [] }} />),
  laster: <Loading />,
  feil: rot(<PH09RegistrerRunde fullskjerm data={{ ...data, baner: [], feil: true }} />),
};
