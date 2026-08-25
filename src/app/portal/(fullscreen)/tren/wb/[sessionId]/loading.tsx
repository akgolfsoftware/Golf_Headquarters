import { T } from "@/lib/v2/tokens";

export default function Laster() {
  return (
    <div style={{ minHeight: "100dvh", background: T.bg, display: "flex", flexDirection: "column", gap: T.gap, padding: "48px 20px", maxWidth: 460, margin: "0 auto" }}>
      <div className="v2-skel" style={{ width: "60%", height: 20, borderRadius: 6 }} />
      <div className="v2-skel" style={{ width: "40%", height: 12, borderRadius: 6 }} />
      <div className="v2-skel" style={{ width: "100%", height: 96, borderRadius: T.rCard, marginTop: 12 }} />
      <div className="v2-skel" style={{ width: "100%", height: 140, borderRadius: T.rCard }} />
      <div className="v2-skel" style={{ width: "100%", height: 44, borderRadius: 9999, marginTop: 8 }} />
    </div>
  );
}
