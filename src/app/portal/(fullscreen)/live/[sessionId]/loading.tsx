import { LasterTilstand } from "@/components/precision/pa";
import "@/styles/precision-athletics.css";

export default function Loading() {
  return (
    <div className="pa-root ph05-laster" data-theme="night">
      <LasterTilstand text="Laster økt …" />
    </div>
  );
}
