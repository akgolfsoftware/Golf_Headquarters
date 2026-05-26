/**
 * StatsHeatmap — matrix visualization with color-coded cells
 * Server component — pure HTML, no client state needed for rendering.
 */

interface StatsHeatmapProps {
  rows: string[];
  cols: string[];
  data: number[][];
}

function getHeatColor(value: number): string {
  // value is 0-100 (percentage)
  if (value >= 90) return "rgba(0, 88, 64, 0.85)";
  if (value >= 70) return "rgba(0, 88, 64, 0.60)";
  if (value >= 50) return "rgba(0, 88, 64, 0.40)";
  if (value >= 30) return "rgba(0, 88, 64, 0.20)";
  if (value >= 10) return "rgba(0, 88, 64, 0.10)";
  return "rgba(0, 88, 64, 0.05)";
}

function getTextColor(value: number): string {
  return value >= 50 ? "hsl(var(--background))" : "var(--foreground)";
}

export function StatsHeatmap({ rows, cols, data }: StatsHeatmapProps) {
  const colCount = cols.length;
  const gridTemplateColumns = `auto repeat(${colCount}, 1fr)`;

  return (
    <div className="putt-heatmap-outer">
      <div
        className="putt-heatmap"
        style={{ gridTemplateColumns }}
      >
        {/* Corner */}
        <div className="putt-heatmap-corner" style={{ padding: "8px 12px" }} />
        {/* Column headers */}
        {cols.map((col) => (
          <div key={col} className="putt-heatmap-col-h">
            {col}
          </div>
        ))}
        {/* Rows */}
        {rows.map((rowLabel, ri) => (
          <>
            <div key={`row-${ri}`} className="putt-heatmap-row-h">
              {rowLabel}
            </div>
            {cols.map((_, ci) => {
              const val = data[ri]?.[ci] ?? 0;
              return (
                <div
                  key={`cell-${ri}-${ci}`}
                  className="putt-heatmap-cell"
                  style={{
                    background: getHeatColor(val),
                    color: getTextColor(val),
                  }}
                  title={`${rowLabel} fra ${cols[ci]}: ${val}%`}
                >
                  {val}%
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}
