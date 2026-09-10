/**
 * MIDLERTIDIG: forsiden i Master AK Golf, ved siden av «Reisen» på `/`.
 *
 * Runde 1-særregelen i `docs/planer/design/2026-09-04-marked-ak-golf-port.md`:
 * Anders ser begge på preview og velger. Velges denne, byttes `(marketing)/page.tsx`
 * til `ForsideAK` og denne ruta, `MarkedForsideReise` og `MarkedForside` slettes.
 * Velges «Reisen», slettes `ForsideAK` og denne ruta.
 *
 * `noindex` så lenge ruta lever: den er en dublett av forsiden.
 */

import type { Metadata } from "next";

import { ForsideAK } from "@/components/marketing/ak-sider/ForsideAK";

export const metadata: Metadata = {
  title: "Forside (Master AK Golf) — forhåndsvisning",
  robots: { index: false, follow: false },
};

export default function ForsideAkPage() {
  return <ForsideAK />;
}
