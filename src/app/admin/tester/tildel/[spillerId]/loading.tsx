import { LasterTilstand } from "@/components/precision/pa";
import "@/styles/precision-athletics.css";

export default function Loading() {
  return <div className="pa-side"><LasterTilstand text="Henter testene …" /></div>;
}
