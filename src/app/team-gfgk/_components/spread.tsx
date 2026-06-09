"use client";

const scores = [74.0, 74.3, 77.8, 78.8, 79.4, 83.1, 86.0, 88.4, 89.8, 104.2];
const MIN = 70;
const MAX = 112;
const ticks = [70, 80, 90, 100, 110];

function x(v: number) {
  return ((v - MIN) / (MAX - MIN)) * 100;
}

export function Spread() {
  return (
    <div className="spread">
      <div
        className="span-band"
        style={{ left: `${x(74.0)}%`, width: `${x(104.2) - x(74.0)}%` }}
      />
      <div className="axis" />
      {ticks.map((v) => (
        <div className="tick" key={v} style={{ left: `${x(v)}%` }}>
          {v}
        </div>
      ))}
      {scores.map((v, i) => (
        <div
          className="pt"
          key={i}
          style={{ left: `${x(v)}%`, animationDelay: `${i * 70 + 200}ms` }}
        />
      ))}
    </div>
  );
}
