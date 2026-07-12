"use client";

/**
 * Klient-limet for gruppe-årsplanen: PeriodePalett (venstre) + samme
 * WorkbenchAarsplan-canvas som spiller-varianten. Gruppens perioder
 * lagres i group_period_blocks via bind-te server actions.
 */

import { useRouter } from "next/navigation";
import { T, Caps, Kort } from "@/components/v2";
import { WorkbenchAarsplan, PeriodePalett } from "@/components/portal/v2/WorkbenchAarsplan";
import type { WorkbenchData } from "@/lib/workbench/load-workbench";
import type { PeriodeInput } from "@/lib/workbench/perioder";

export function GruppeAarsplanKlient({ gruppeNavn, medlemmer, seasonBlocks, onLagre, onSlett }: {
  gruppeNavn: string;
  medlemmer: number;
  seasonBlocks: NonNullable<WorkbenchData["seasonBlocks"]>;
  onLagre: (input: PeriodeInput, periodeId?: string) => Promise<{ ok: boolean; periodeId?: string; error?: string }>;
  onSlett: (periodeId: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const router = useRouter();
  const data: WorkbenchData = { seasonBlocks, weekStartISO: undefined };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>Gruppe-workbench</Caps>
        <h1 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 24, letterSpacing: "-0.02em", color: T.fg, margin: "6px 0 0" }}>{gruppeNavn}</h1>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>{medlemmer} medlemmer · gruppens egen årsplan — spillerne beholder individuelle planer</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[206px_1fr]" style={{ gap: T.gap, alignItems: "start" }}>
        <Kort pad="14px 14px">
          <PeriodePalett />
        </Kort>
        <WorkbenchAarsplan
          data={data}
          handlers={{ lagre: onLagre, slett: onSlett }}
          onEndret={() => router.refresh()}
        />
      </div>
    </div>
  );
}
