"use client";

/**
 * Velger skall for sidene under src/app/admin/(legacy). En side som er portert
 * til Precision Athletics (oppført i src/lib/agencyos/precision-portert/) legger
 * selv innholdet i AgencyOSSkall og får ingen V2Shell rundt. Alle andre sider
 * beholder V2Shell til de er portert.
 */
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { erPortert } from "@/lib/agencyos/precision-portert";

export function AdminSkallVelger({ children, navn, avatarUrl }: { children: ReactNode; navn: string; avatarUrl?: string | null }) {
  const path = usePathname() ?? "";
  if (erPortert(path)) return <>{children}</>;
  return <V2Shell bredde="full" nav={AGENCYOS_NAV} navn={navn} avatarUrl={avatarUrl}>{children}</V2Shell>;
}
