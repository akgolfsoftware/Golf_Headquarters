import { LasterTilstand } from "@/components/precision/pa";
import "@/styles/precision-athletics.css";
import "@/styles/precision-komponenter.css";

export default function Loading() {
  return <div className="pa-root" data-design="precision-athletics" style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}><LasterTilstand text="Henter booking …" /></div>;
}
