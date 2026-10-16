/* Lastetilstand for Målsetninger (nytt design). Ren serverkomponent: ingen import fra "use client"-moduler
   (gotchas §Bygg og drift, vakt scripts/check-loading-server.mjs). Uten sidetittel, fordi den også
   gjelder undersidene uten egen loading.tsx (bygger, leaderboard, sg-hub, trackman). */
import { PlayerHQSkallLaster } from "@/components/precision/PlayerHQSkallLaster";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-maal.css";

export default function Loading() {
  return (
    <PlayerHQSkallLaster sti="/portal/mal">
      <div className="phn phn-m" aria-busy="true">
        <span className="phn-skjelett" style={{ height: 64 }} />
        <span className="phn-skjelett" style={{ height: 120 }} />
        <div className="phn-m-liste">
          <span className="phn-skjelett" style={{ height: 180 }} />
          <span className="phn-skjelett" style={{ height: 180 }} />
        </div>
        <p className="phn-kilde">Henter …</p>
      </div>
    </PlayerHQSkallLaster>
  );
}
