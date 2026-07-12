"use client";

/**
 * Klient-limet for gruppe-årsplanen: PeriodePalett (venstre) + samme
 * WorkbenchAarsplan-canvas som spiller-varianten. Gruppens perioder
 * lagres i group_period_blocks via bind-te server actions.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import { T, Caps, Kort, Knapp, Icon } from "@/components/v2";
import { WorkbenchAarsplan, PeriodePalett } from "@/components/portal/v2/WorkbenchAarsplan";
import type { WorkbenchData } from "@/lib/workbench/load-workbench";
import type { PeriodeInput } from "@/lib/workbench/perioder";

export function GruppeAarsplanKlient({ gruppeNavn, medlemmer, seasonBlocks, onLagre, onSlett, onRullUt }: {
  gruppeNavn: string;
  medlemmer: number;
  seasonBlocks: NonNullable<WorkbenchData["seasonBlocks"]>;
  onLagre: (input: PeriodeInput, periodeId?: string) => Promise<{ ok: boolean; periodeId?: string; error?: string }>;
  onSlett: (periodeId: string) => Promise<{ ok: boolean; error?: string }>;
  /** Å1: kopier gruppens perioder til medlemmenes individuelle årsplaner. */
  onRullUt?: () => Promise<{ ok: boolean; spillere?: number; perioderLagt?: number; hoppet?: string[]; error?: string }>;
}) {
  const router = useRouter();
  const data: WorkbenchData = { seasonBlocks, weekStartISO: undefined };
  const [rullBekreft, setRullBekreft] = useState(false);
  const [ruller, setRuller] = useState(false);
  const [rullResultat, setRullResultat] = useState<string | null>(null);
  const rullUt = async () => {
    if (!onRullUt || ruller) return;
    setRuller(true);
    const res = await onRullUt();
    setRuller(false);
    setRullBekreft(false);
    setRullResultat(
      res.ok
        ? `Rullet ut til ${res.spillere} spillere (${res.perioderLagt} perioder).${res.hoppet && res.hoppet.length > 0 ? ` Hoppet over (hadde alt): ${res.hoppet.join(", ")}.` : ""}`
        : res.error ?? "Utrulling feilet.",
    );
    router.refresh();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>Gruppe-workbench</Caps>
        <h1 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 24, letterSpacing: "-0.02em", color: T.fg, margin: "6px 0 0" }}>{gruppeNavn}</h1>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>{medlemmer} medlemmer · gruppens egen årsplan — spillerne beholder individuelle planer</span>
      </div>
      {rullResultat && (
        <Kort pad="10px 14px"><span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg }} data-wb-rullresultat>{rullResultat}</span></Kort>
      )}
      {onRullUt && seasonBlocks.length > 0 && (
        <div>
          <Knapp icon="users" onClick={() => setRullBekreft(true)} disabled={ruller}>
            Rull ut til {medlemmer} spillere
          </Knapp>
        </div>
      )}
      {rullBekreft && (
        <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={ruller ? undefined : () => setRullBekreft(false)} style={{ position: "absolute", inset: 0, background: "rgba(6,7,6,0.62)", backdropFilter: "blur(2px)" }} />
          <div role="dialog" aria-label="Bekreft utrulling" style={{ position: "relative", width: "min(420px, 100%)", background: T.panel, border: `1px solid ${T.borderS}`, borderRadius: 20, padding: "20px 22px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="users" size={16} style={{ color: T.lime }} />
              <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: T.fg, margin: 0 }}>Rull ut årsplanen</h2>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, margin: "12px 0 0", lineHeight: 1.55 }}>
              {seasonBlocks.length} perioder kopieres til {medlemmer} spilleres individuelle årsplaner.
              Spillere som allerede har en overlappende periode av samme type hoppes over — ingenting overskrives.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <Knapp ghost onClick={() => setRullBekreft(false)} disabled={ruller}>Avbryt</Knapp>
              <Knapp icon="check" onClick={rullUt} disabled={ruller}>{ruller ? "Ruller ut…" : "Bekreft utrulling"}</Knapp>
            </div>
          </div>
        </div>
      )}
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
