/**
 * PuttPreview — Tour vs Amatør distance-distribution bars
 * Server component — pure SVG/HTML, no client state.
 */

export interface PuttRow {
  d: string;
  tour: number;
  amateur: number;
}

interface PuttPreviewProps {
  data: PuttRow[];
  height?: number;
}

export function PuttPreview({ data, height = 180 }: PuttPreviewProps) {
  const max = 100;
  const barHeight = height - 28;

  return (
    <div className="putt-preview" style={{ height }}>
      {data.map((row, i) => (
        <div key={row.d} className="putt-col">
          <div className="putt-bar-stack" style={{ height: barHeight }}>
            <div
              className="putt-bar putt-bar-tour"
              style={{
                height: `${(row.tour / max) * 100}%`,
                transitionDelay: `${i * 60}ms`,
              }}
              title={`Tour: ${row.tour}%`}
            />
            <div
              className="putt-bar putt-bar-am"
              style={{
                height: `${(row.amateur / max) * 100}%`,
                transitionDelay: `${i * 60 + 100}ms`,
              }}
              title={`Amatør: ${row.amateur}%`}
            />
          </div>
          <div className="putt-col-label">{row.d}</div>
        </div>
      ))}
    </div>
  );
}
