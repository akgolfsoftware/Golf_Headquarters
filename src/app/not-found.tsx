/**
 * Appens ekte «ikke funnet»-side (404) — Paper. Fasit: designsystem/paper/
 * fase2/system/system-tilstander.html (§404), via delt <IkkeFunnet>.
 *
 * Rendrer <IkkeFunnet> som selvstendig systemside uten app-sidebar. Rent
 * presentasjonelt: ingen Prisma/DB/auth — 404-siden trenger ingen data.
 * Bruker komponentens defaults (tittel/beskrivelse/CTA); hjemHref peker på
 * marketing-forsiden.
 */

import type { Metadata } from "next";
import { IkkeFunnet } from "@/components/system/ikke-funnet";

export const metadata: Metadata = {
  title: "Side ikke funnet — AK Golf Academy",
};

export default function NotFound() {
  return <IkkeFunnet hjemHref="/" />;
}
