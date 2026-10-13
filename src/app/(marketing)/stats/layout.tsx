import type { ReactNode } from "react";
import "@/styles/precision-athletics.css";
import "@/styles/precision-support-upgrade.css";

/** Presentasjon alene: kilde-/DataGolf-vaktene ligger på serveren i hver leser. */
export default function StatsLayout({ children }: { children: ReactNode }) { return <div className="pa-root support-stats">{children}</div>; }
