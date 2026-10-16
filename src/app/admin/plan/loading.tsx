/* AG-14 Plan-hub: laster-tilstand i Precision Athletics. Ren serverkomponent
   (loading.tsx importerer aldri en "use client"-modul — gotchas §Bygg og drift). */
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";
import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  return (
    <div className="pa-root" data-design="precision-athletics" style={{ minHeight: "100dvh", background: "var(--surface-page)" }}>
      <div className="pa-side">
        <LasterTilstand text="Henter maler og øvelser …" />
      </div>
    </div>
  );
}
