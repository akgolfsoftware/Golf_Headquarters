/* AG-A03: laster-tilstand for /admin/analyse i Precision Athletics. Ren serverkomponent
   (loading.tsx importerer aldri en "use client"-modul, gotchas §Bygg og drift; CSP-vakt:
   tests/e2e/csp-konsoll.spec.ts). Skallet kommer fra layouten. */
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";
import { LasterTilstand } from "@/components/precision/pa";
import { AnalyseTopp } from "@/components/admin/precision/AGA03Analyse";

export default function Loading() {
  return (
    <div className="pa-root" data-design="precision-athletics" style={{ minHeight: "100dvh", background: "var(--surface-page)" }}>
      <div className="pa-side">
        <AnalyseTopp fane={null} />
        <LasterTilstand text="Henter grupper …" />
      </div>
    </div>
  );
}
