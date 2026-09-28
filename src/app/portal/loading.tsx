"use client";
import { usePathname } from "next/navigation";
import { V2Laster } from "@/components/v2/laster";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { LasterTilstand } from "@/components/precision/pa";
export default function Loading() {
  return usePathname() === "/portal"
    ? <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}><div className="pa-side"><LasterTilstand text="Henter dagen din …" /></div></PlayerHQSkall>
    : <V2Laster variant="hjem" />;
}
