"use client";
import { usePathname } from "next/navigation";
import { V2Laster } from "@/components/v2/laster";
import { PH01Loading } from "@/components/portal/v2/idag/IDagSelected";
export default function Loading() {
  return usePathname() === "/portal" ? <PH01Loading /> : <V2Laster variant="hjem" />;
}
