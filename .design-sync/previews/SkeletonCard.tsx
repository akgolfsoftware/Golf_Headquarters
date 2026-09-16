import { SkeletonCard } from "akgolf-hq-komponenter";

/** Plassholder for et kort med ikon, tittel, undertittel og to tekstlinjer. Ingen props utover className. */
export function Standard() {
  return (
    <div style={{ maxWidth: 440 }}>
      <SkeletonCard />
    </div>
  );
}

/** Liste som laster: to kort under hverandre, slik Stall ser ut før spillerne er hentet. */
export function Liste() {
  return (
    <div style={{ maxWidth: 440, display: "flex", flexDirection: "column", gap: 12 }}>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

/** To i bredden på Mac. */
export function ToKolonner() {
  return (
    <div style={{ maxWidth: 600, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
