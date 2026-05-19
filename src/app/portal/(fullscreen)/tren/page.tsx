// Workbench v2 (TSX-portering av /public/design/workbench-v2.html).
// Plassert i `(fullscreen)`-gruppen for å unngå dobbel sidebar/topbar
// fra `PortalShell` — denne siden har sin egen chrome (sidebar + topbar
// + sticky footer) som matcher HTML-prototypen.
//
// To moduser: STATUS (hvor er jeg?) og PLAN (hva skal jeg gjøre?)
// Plan-modus har zoom-akse: År → Måned → Uke → Dag → Økt
//
// URL: /portal/tren

import { Instrument_Serif } from "next/font/google";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { WorkbenchClient } from "./workbench-client";

// Instrument Serif lastes lokalt på denne ruta. Brukes for italic-accents
// på hero og insight-sitater. Eksponeres via CSS-variabel.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Min workbench",
};

export default async function WorkbenchPage() {
  await requirePortalUser();
  return (
    <div className={instrumentSerif.variable}>
      <WorkbenchClient />
    </div>
  );
}
