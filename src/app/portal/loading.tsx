"use client";
import { usePathname } from "next/navigation";
import { V2Laster } from "@/components/v2/laster";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH01IDagLaster } from "@/components/portal/precision/PH01IDagLaster";
export default function Loading() {
  return usePathname() === "/portal"
    ? <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}><PH01IDagLaster /></PlayerHQSkall>
    : <V2Laster variant="hjem" />;
}
