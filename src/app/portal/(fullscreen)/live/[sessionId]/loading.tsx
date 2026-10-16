import { LasterTilstand } from "@/components/precision/laster-tilstand";
import "@/styles/precision-athletics.css";

export default function Loading() {
  return (
    <div className="pa-root ph05-laster" data-theme="light">
      <LasterTilstand text="Laster økt …" />
    </div>
  );
}
