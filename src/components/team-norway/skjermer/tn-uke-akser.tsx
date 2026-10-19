import { TN } from "@/lib/v2/team-norway";
import { MAANED_AKSER, sumAkser } from "@/lib/workbench/maaned-visning";
import type { AxisMinutes } from "@/lib/workbench/perioder";

/** «1,5» timer fra minutter, uten enhet. */
export const timer = (min: number) => (Math.round((min / 60) * 10) / 10).toLocaleString("nb-NO");

/** Timer per akse for uka, i aksefargene. «—» når uka ikke er fordelt. */
export function UkeAkser({ minutter }: { minutter: AxisMinutes | null | undefined }) {
  if (minutter === undefined) return null;
  const sum = sumAkser(minutter);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 10px", padding: "6px 10px", borderBottom: `1px solid ${TN.ink200}`, fontSize: 12, color: TN.textSecondary }}>
      {minutter ? (
        <>
          <span style={{ fontFamily: TN.font.mono, color: TN.navy900, fontWeight: 500 }}>Fordelt {timer(sum)} t</span>
          {MAANED_AKSER.filter((a) => (minutter[a] ?? 0) > 0).map((a) => (
            <span key={a} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: TN.font.mono }}>
              <i aria-hidden="true" style={{ width: 10, height: 10, background: TN.akse[a].fyll, flex: "none" }} />
              {a} {timer(minutter[a]!)}
            </span>
          ))}
        </>
      ) : (
        <span style={{ fontFamily: TN.font.mono }}>— Ikke fordelt</span>
      )}
    </div>
  );
}
