import { TL } from "@/lib/v2/train-lock";


export default function Laster() {
  return (
    <div style={{ minHeight: "100dvh", background: TL.scene, display: "flex", flexDirection: "column", gap: 10, padding: "48px 20px", maxWidth: 460, margin: "0 auto" }}>
      <div className="v2-skel" style={{ width: "40%", height: 18, borderRadius: 6 }} />
      <div className="v2-skel" style={{ width: "100%", height: 200, borderRadius: TL.radius.card, marginTop: 12 }} />
    </div>
  );
}
