import { LasterTilstand } from "@/components/precision/pa";
import "@/styles/precision-athletics.css";

/** PH-07 laster: «Regner ut oppsummeringen …» i nattflaten (Claude Design 7d7c2994). */
export default function Loading() {
  return <div className="pa-root" data-theme="night" data-design="precision-athletics" style={{ minHeight: "100dvh", background: "var(--surface-page)", padding: 16 }}>
    <div style={{ maxWidth: 720, margin: "0 auto" }}><LasterTilstand text="Regner ut oppsummeringen …" /></div>
  </div>;
}
