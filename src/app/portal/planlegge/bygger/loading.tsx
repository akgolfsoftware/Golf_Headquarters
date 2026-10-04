/* PH-12: laster-tilstand i Precision Athletics. Ren serverkomponent
   (loading.tsx importerer aldri en "use client"-modul — gotchas §Bygg og drift). */
import "@/styles/precision-komponenter.css";
import "@/styles/precision-athletics.css";

export default function Loading() {
  return (
    <div className="pa-root" data-design="precision-athletics">
      <div className="pa-side">
        <div className="pa-state pa-state--loading" role="status" aria-live="polite">
          <span className="pa-state__mono">Henter maler og testresultater …</span>
        </div>
      </div>
    </div>
  );
}
