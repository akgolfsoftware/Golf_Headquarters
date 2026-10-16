/* Felles lastetilstand for PlayerHQ-sider uten egen loading.tsx. Ren serverkomponent: klientkode i en
   loading-grense stoppes av CSP (gotchas §Bygg og drift, vakt scripts/check-loading-server.mjs).
   I dag (/portal) har eget skjelett som Suspense-fallback i page.tsx. */
import { PlayerHQSkallLaster } from "@/components/precision/PlayerHQSkallLaster";
import { LasterTilstand } from "@/components/precision/laster-tilstand";

export default function Loading() {
  return (
    <PlayerHQSkallLaster sti="">
      <div className="pa-side">
        <LasterTilstand text="Henter …" />
      </div>
    </PlayerHQSkallLaster>
  );
}
