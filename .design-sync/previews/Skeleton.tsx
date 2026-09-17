import { Kort, Skeleton } from "akgolf-hq-komponenter";

/** Én linje: høyde og bredde settes av den som bruker den (inline style eller Tailwind-klasser). Pulserer. */
export function Linje() {
  return <Skeleton style={{ height: 12, width: 220 }} />;
}

/** Vanlige former: avatar (rounded-full), tittel, to tekstlinjer og en knappeflate. */
export function Former() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", maxWidth: 440 }}>
      <Skeleton className="rounded-full" style={{ width: 40, height: 40, flex: "none" }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton style={{ height: 14, width: "55%" }} />
        <Skeleton style={{ height: 10, width: "90%" }} />
        <Skeleton style={{ height: 10, width: "70%" }} />
        <Skeleton style={{ height: 36, width: 120, marginTop: 6 }} />
      </div>
    </div>
  );
}

/** Kort som venter på tall: eyebrow står, verdien og underteksten er skjelett. */
export function IKort() {
  return (
    <div style={{ maxWidth: 300 }}>
      <Kort eyebrow="Snittscore">
        <Skeleton style={{ height: 44, width: 120, marginBottom: 10 }} />
        <Skeleton style={{ height: 10, width: "80%" }} />
      </Kort>
    </div>
  );
}
