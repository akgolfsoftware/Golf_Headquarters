/** Hydrert komponentprøve med syntetiske data og simulerte lagringshandlinger. */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SessionSummary, type SessionSummaryProps } from "@/components/portal/live/SessionSummary";
import { LiveSessionShell } from "@/components/portal/live/LiveSessionShell";
import { TOM_OKT, DELVIS_OKT, FULLFORT_OKT, LANGT_INNHOLD_OKT, ELDRE_OKT_UTEN_COMPLETED_IDS, EKSISTERENDE_VURDERING, NESTE_OKT } from "./fixtures";

type Stored = { ord?: string; vurdering?: SessionSummaryProps["spillerVurdering"] };
type SaveMode = "ok" | "error" | "throw" | "pending";
declare global {
  interface Window {
    summaryHarness: {
      mode: SaveMode;
      calls: Array<{ kind: string; id: string; value: unknown }>;
      release: () => void;
      save: (kind: "ord" | "vurdering", id: string, value: unknown) => Promise<{ ok: boolean; error?: string }>;
    };
  }
}
const params = new URLSearchParams(location.search);
const name = params.get("state") ?? "fullfort";
const dark = params.get("theme") === "mork";
if (dark) document.documentElement.dataset.v2Tema = "dark";
const cases: Record<string, SessionSummaryProps> = {
  tom: { data: TOM_OKT },
  delvis: { data: DELVIS_OKT, nesteOkt: NESTE_OKT },
  fullfort: { data: FULLFORT_OKT, nesteOkt: NESTE_OKT },
  lagret: { data: FULLFORT_OKT, nesteOkt: NESTE_OKT, lagredeOrd: "Fin økt med jevnt treffvindu på begge avstander.", spillerVurdering: EKSISTERENDE_VURDERING },
  vurdert: { data: FULLFORT_OKT, spillerVurdering: EKSISTERENDE_VURDERING },
  langt: { data: LANGT_INNHOLD_OKT, nesteOkt: NESTE_OKT },
  eldre: { data: ELDRE_OKT_UTEN_COMPLETED_IDS },
  tapper: { data: { ...FULLFORT_OKT, logSource: "tapper", durationSec: 0, drillsCompleted: 0, existingLogs: [] }, lagredeOrd: "Økt gjennomført." },
};
const props = cases[name];
if (!props) throw new Error(`Ukjent syntetisk tilstand: ${name}`);
const key = `ph06-simulert-${name}`;
function stored(): Stored { try { return JSON.parse(sessionStorage.getItem(key) ?? "{}"); } catch { return {}; } }
window.summaryHarness = {
  mode: "ok", calls: [], release: () => {},
  async save(kind, id, value) {
    this.calls.push({ kind, id, value });
    if (this.mode === "throw") throw new Error("Simulert nettfeil");
    if (this.mode === "error") return { ok: false, error: "Simulert lagringsfeil. Prøv igjen." };
    if (this.mode === "pending") await new Promise<void>((done) => { this.release = done; });
    sessionStorage.setItem(key, JSON.stringify({ ...stored(), [kind]: value }));
    return { ok: true };
  },
};
const saved = stored();
createRoot(document.getElementById("root")!).render(<StrictMode>
  <LiveSessionShell title="Etter økta" subtitle={props.data.title} backHref="/portal" closeHref="/portal">
    <SessionSummary {...props} lagredeOrd={saved.ord ?? props.lagredeOrd} spillerVurdering={saved.vurdering ?? props.spillerVurdering} />
  </LiveSessionShell>
</StrictMode>);
