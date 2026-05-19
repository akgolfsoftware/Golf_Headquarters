// Unified Workbench (TSX-portering av /public/design/workbench/index.html).
// Plassert i `(fullscreen)`-gruppen for å unngå dobbel sidebar/topbar
// fra `PortalShell` — denne siden har sin egen chrome (sidebar + topbar
// + sticky footer) som matcher HTML-prototypen.
//
// URL: /portal/workbench

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
    <div className={`${instrumentSerif.variable} min-h-screen bg-[#FAFAF7]`}>
      <WorkbenchClient />
    </div>
  );
}
