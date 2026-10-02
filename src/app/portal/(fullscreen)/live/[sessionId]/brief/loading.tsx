import { LasterTilstand } from "@/components/precision/pa";
import "@/styles/precision-athletics.css";

/** PH-04 laster: «Henter økta …» (natt-tema, som resten av Live-økt). */
export default function Loading() {
  return <div className="pa-root" data-theme="night" data-design="precision-athletics" style={{ minHeight: "100dvh", background: "var(--surface-page)", padding: "12px 16px", boxSizing: "border-box" }}>
    <div style={{ maxWidth: 600, margin: "0 auto" }}><LasterTilstand text="Henter økta …" /></div>
  </div>;
}
