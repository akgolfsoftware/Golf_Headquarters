import type { Metadata } from "next";
import { Bell } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AthleticEyebrow } from "@/components/athletic";
import { loadVarsler } from "@/lib/admin/load-varsler";
import { VarslerClient } from "./varsler-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Varsler · AgencyOS",
};

/**
 * Coach-varsler-senter — agent-forslag, signaler og uleste meldinger samlet.
 * Fase 1 #1 (docs/agencyos-fase1-byggebestilling-2026-06-28.md). COACH + ADMIN.
 */
export default async function VarslerPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const data = await loadVarsler(user.id);
  const total = data.counts.actions + data.counts.notifications;

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 md:py-8 lg:px-12">
      <section className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Bell className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <div>
          <AthleticEyebrow>AGENCYOS · VARSLER</AthleticEyebrow>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Varsler
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {total > 0
              ? `${total} ting krever oppmerksomhet`
              : "Alt er ajour"}
          </p>
        </div>
      </section>

      <VarslerClient data={data} />
    </div>
  );
}
