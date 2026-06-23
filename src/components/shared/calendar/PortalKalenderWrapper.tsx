"use client";

// PortalKalenderWrapper — kobler ViewModeContext til KalenderRoot for PlayerHQ.
//
// Server-komponenten (kalender/page.tsx) sender data og lockedSpillerId hit.
// Denne klient-wrapperen leser viewMode fra context og videresender til KalenderRoot.

import { useViewMode } from "@/components/shared/ViewModeContext";
import {
  KalenderRoot,
  type KalenderRootProps,
} from "./KalenderRoot";

type Props = Omit<KalenderRootProps, "viewMode">;

export function PortalKalenderWrapper(props: Props) {
  const { mode } = useViewMode();
  return <KalenderRoot {...props} viewMode={mode} />;
}
