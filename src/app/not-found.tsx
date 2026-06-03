/**
 * Appens ekte «ikke funnet»-side (404) — v10-design.
 *
 * Rendrer <IkkeFunnet> (v10-fasit fra mx-404.png) som selvstendig systemside
 * uten app-sidebar. Rent presentasjonelt: ingen Prisma/DB/auth — 404-siden
 * trenger ingen data. Bruker komponentens defaults (tittel/beskrivelse/CTA);
 * hjemHref peker på marketing-forsiden.
 *
 * Byttet fra inline-404 (gammelt design) til v10-komponenten 3. juni.
 */

import type { Metadata } from "next";
import { IkkeFunnet } from "@/components/system/ikke-funnet";

export const metadata: Metadata = {
  title: "Side ikke funnet — AK Golf Academy",
};

export default function NotFound() {
  return <IkkeFunnet hjemHref="/" />;
}
