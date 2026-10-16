/* Lastetilstand for Én målsetning (nytt design). Ren serverkomponent: ingen import fra "use client"-moduler
   (gotchas §Bygg og drift, vakt scripts/check-loading-server.mjs). */
import { PlayerHQSkallLaster } from "@/components/precision/PlayerHQSkallLaster";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-maal.css";

export default function Loading() {
  return (
    <PlayerHQSkallLaster sti="/portal/mal/goal">
      <div className="phn phn-m" aria-busy="true">
        <span className="phn-skjelett" style={{ height: 64 }} />
        <div className="phn-m-grid">
          <div>
            <span className="phn-skjelett" style={{ height: 200 }} />
            <span className="phn-skjelett" style={{ height: 180 }} />
          </div>
          <aside><span className="phn-skjelett" style={{ height: 160 }} /></aside>
        </div>
        <p className="phn-kilde">Henter målsetningen …</p>
      </div>
    </PlayerHQSkallLaster>
  );
}
