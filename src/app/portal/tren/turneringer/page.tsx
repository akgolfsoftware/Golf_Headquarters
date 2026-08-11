/**
 * PlayerHQ · Turneringer (/portal/tren/turneringer) — Paper-port W1 (fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-turneringer.html.
 * Planen din + katalogen · brutto score. Påmelding skjer ALDRI fra lista —
 * dobbel bekreftelse bor på detaljsiden (spilleransvar).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import {
  loadPlanleggerKatalog,
  loadMinTurneringsplan,
} from "@/lib/portal-turnering/planlegger-data";
import { TurneringPlanleggerV2 } from "@/components/portal/v2/TurneringPlanleggerV2";

export const dynamic = "force-dynamic";

export default async function TurneringerPage() {
  const user = await requirePortalUser();
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const [katalog, minPlan] = await Promise.all([
    loadPlanleggerKatalog(user.id),
    loadMinTurneringsplan(user.id),
  ]);

  return (
    <V2Shell
      bredde="kolonne"
      aktiv="plan"
      nav={PLAYERHQ_NAV}
      navn={user.name}
      avatarUrl={user.avatarUrl}
    >
      <TilbakeLenke href="/portal/tren">Tren</TilbakeLenke>
      <div style={{ maxWidth: 720, margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: T.gap }}>
        {/* Topp — fasit: Turneringer / Planen din + katalogen · brutto score */}
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>
            Turneringer
          </h1>
          <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
            Planen din + katalogen · brutto score
          </span>
        </div>
        <TurneringPlanleggerV2
          katalog={katalog}
          minPlan={minPlan}
          spillerNavn={user.name}
        />
      </div>
    </V2Shell>
  );
}
