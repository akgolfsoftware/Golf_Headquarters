// AK Agency OS — personlig kommandosenter. Eget rom, ADMIN-gated, alltid mørkt
// terminal-tema (.dark på wrapperen — ingen toggle i Etappe 1).

import { redirect } from "next/navigation";
import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { KommandoRail } from "@/components/kommando/rail";

export default async function KommandoLayout({ children }: { children: React.ReactNode }) {
  const user = await canAccessMissionControl();
  if (!user) redirect("/");

  const dato = new Intl.DateTimeFormat("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
    .format(new Date())
    .toUpperCase();

  const fornavn = user.name.split(" ")[0];

  return (
    <div className="dark">
      <div className="flex min-h-screen bg-background font-sans text-foreground">
        <KommandoRail />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="font-display text-[15px] font-semibold tracking-[0.07em] text-foreground">
                AK · AGENCY OS
              </span>
            </div>
            <div className="text-right">
              <div className="text-[13px] text-foreground">God dag, {fornavn}</div>
              <div className="font-mono text-[11px] text-muted-foreground">{dato}</div>
            </div>
          </header>
          <main className="flex-1 p-5">{children}</main>
        </div>
      </div>
    </div>
  );
}
