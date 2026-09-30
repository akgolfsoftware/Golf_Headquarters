"use client";

/* PH-20 lasting for /portal/gameplan/[baneId] i Precision Athletics-skallet. */

import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  return <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}><div className="pa-side"><LasterTilstand text="Henter banen …" /></div></PlayerHQSkall>;
}
