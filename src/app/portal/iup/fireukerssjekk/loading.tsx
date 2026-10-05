import { LasterTilstand } from "@/components/precision/pa";
import "@/styles/precision-athletics.css";

export default function LasterFireukerssjekk() {
  return <div className="pa-root pa-side"><LasterTilstand text="Henter fireukerssjekken …" /></div>;
}
