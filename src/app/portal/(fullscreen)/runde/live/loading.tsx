/* Fullscreen-lasting for /portal/runde/live — ingen V2Shell/rail her (ruten er
   chrome-fri, jf. page.tsx-kommentaren). Skjelett i kortgeometri, INGEN
   spinner (Train-lock §MAT/B1-regelen).
   Fasit: designsystem/train-lock/GAP-1 Tilstander.dc.html · RU-01 Runde laster (PX-7). */

import { TL } from "@/lib/v2/train-lock";

function Bar({ w, h = 12 }: { w: string; h?: number }) {
  return <div className="v2-skel" style={{ width: w, height: h, borderRadius: 6 }} />;
}

export default function Loading() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: TL.scene, colorScheme: "dark", display: "flex", flexDirection: "column", padding: "24px 20px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, background: TL.elev, borderRadius: TL.radius.card, padding: 20 }}>
        <Bar w="70%" />
        <Bar w="50%" />
        <Bar w="85%" />
        <Bar w="40%" />
      </div>
    </div>
  );
}
