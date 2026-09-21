import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import "@/styles/workbench-selected.css";

/** Valgt Workbench-master 20.09.2026. Avgrenset til denne brukerreisen. */
export function WorkbenchShell({ children, coachName, playerId, surface = "light" }: { children: ReactNode; coachName: string; playerId: string; surface?: "light" | "live" }) {
  const targets = [
    ["Hjem", "/admin/agencyos"], ["Innboks", "/admin/kommunikasjon"], ["Kalender", "/admin/kalender"],
    ["Stall", "/admin/spillere"], ["Workbench", `/admin/workbench/${playerId}`], ["Godkjenninger", "/admin/ko"],
  ];
  return <div className="wb-app" data-surface={surface}>
    <header className="wb-top">
      <Link href="/admin/agencyos" aria-label="AK Golf HQ – hjem"><Image src={surface === "live" ? "/logos/logo-ak-golf-hq-negative.svg" : "/logos/logo-ak-golf-hq.svg"} alt="AK Golf HQ" width={134} height={30} /></Link>
      <nav aria-label="Hovedmeny">{targets.map(([label, href]) => <Link key={label} href={href} aria-current={label === "Workbench" ? "page" : undefined}>{label}</Link>)}</nav>
      <span className="wb-who"><span>coach ·</span><b>{coachName}</b></span>
      <details className="wb-mobile-menu"><summary aria-label="Åpne hovedmenyen"><span>coach · </span><b>{coachName.split(" ")[0]} {coachName.split(" ").length > 1 ? `${coachName.split(" ").at(-1)![0]}.` : ""}</b></summary><nav aria-label="Hovedmeny på mobil">{targets.map(([label, href]) => <Link key={label} href={href} aria-current={label === "Workbench" ? "page" : undefined}>{label}</Link>)}</nav></details>
    </header>
    {children}
  </div>;
}
