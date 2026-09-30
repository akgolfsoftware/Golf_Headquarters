import { LasterTilstand } from "@/components/precision/pa";

export default function Loading() {
  return (
    <div className="pa-side">
      <LasterTilstand text="Henter TrackMan-økter …" />
    </div>
  );
}
