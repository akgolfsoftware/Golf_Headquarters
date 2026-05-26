// Extra components used across pages 03-29.
// Loaded after components.jsx — relies on Icon, FlagGlyph etc. from there.

// Histogram with highlight bucket
function Histogram({ data, highlight = -1, height = 140, valueKey = "n", labelKey = "bin" }) {
  const max = Math.max(...data.map(d => d[valueKey])) * 1.05;
  return (
    <div className="hist">
      <svg viewBox={`0 0 ${data.length * 38} ${height}`} width="100%" height={height} preserveAspectRatio="none">
        {data.map((d, i) => {
          const h = (d[valueKey] / max) * (height - 24);
          const isHi = i === highlight;
          return (
            <g key={i}>
              <rect x={i * 38 + 4} y={height - 24 - h} width={30} height={h}
                rx={2}
                fill={isHi ? "#005840" : "#E5E3DD"}
                style={{ transition: "all .4s ease", transitionDelay: `${i * 30}ms` }}
              />
              <text x={i * 38 + 19} y={height - 24 - h - 4}
                textAnchor="middle"
                fontFamily="JetBrains Mono"
                fontSize="9"
                fill={isHi ? "#005840" : "#5E5C57"}
                opacity={isHi ? 1 : 0.6}>
                {d[valueKey]}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="hist-labels">
        {data.map((d, i) => (
          <div key={i} className={`hist-label ${i === highlight ? "hi" : ""}`}>{d[labelKey]}</div>
        ))}
      </div>
    </div>
  );
}

// Heatmap — matrix of cells colored by intensity
function Heatmap({ rows, cols, data, getValue, format = (v) => v + "%" }) {
  const max = Math.max(...data.flatMap(row => row.map(c => getValue(c))));
  return (
    <div className="heatmap">
      <div className="heatmap-corner"/>
      {cols.map((c, i) => <div key={i} className="heatmap-col-h">{c}</div>)}
      {rows.map((rowLabel, ri) => (
        <React.Fragment key={ri}>
          <div className="heatmap-row-h">{rowLabel}</div>
          {data[ri].map((cell, ci) => {
            const v = getValue(cell);
            const intensity = v / max;
            return (
              <div key={ci} className="heatmap-cell"
                   style={{ background: `rgba(0, 88, 64, ${0.05 + intensity * 0.75})`,
                            color: intensity > 0.55 ? "#FAFAF7" : "#0A1F17" }}>
                <span>{format(v)}</span>
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

// Lined chart
function LineChart({ series, height = 220, width = 720, xLabels = [], yMin, yMax, inverted = false, showDots = true, showArea = true }) {
  const allValues = series.flatMap(s => s.values);
  const minVal = yMin ?? Math.min(...allValues);
  const maxVal = yMax ?? Math.max(...allValues);
  const range = maxVal - minVal || 1;
  const pad = 32;

  const xFor = (i, total) => pad + (i / (total - 1)) * (width - pad * 2);
  const yFor = (v) => {
    const norm = (v - minVal) / range;
    return pad + (inverted ? norm : 1 - norm) * (height - pad * 2);
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      {/* gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map(p => (
        <line key={p}
          x1={pad} x2={width - pad}
          y1={pad + p * (height - pad * 2)}
          y2={pad + p * (height - pad * 2)}
          stroke="#E5E3DD" strokeWidth="1" strokeDasharray="2 4"/>
      ))}
      {series.map((s, idx) => {
        const pts = s.values.map((v, i) => [xFor(i, s.values.length), yFor(v)]);
        const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
        const area = path + ` L ${pts[pts.length-1][0]},${height-pad} L ${pts[0][0]},${height-pad} Z`;
        return (
          <g key={idx}>
            {showArea && idx === 0 && (
              <path d={area} fill={s.color || "#005840"} fillOpacity="0.08"/>
            )}
            <path d={path}
              fill="none"
              stroke={s.color || "#005840"}
              strokeWidth={s.width || 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={s.dashed ? "6 4" : "none"}
              style={{
                strokeDasharray: s.dashed ? "6 4" : `${pts.length * 100}`,
                strokeDashoffset: 0,
                animation: !s.dashed ? "draw-line 1.2s cubic-bezier(.3,.7,.3,1) forwards" : "none",
              }}
            />
            {showDots && pts.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="3.5" fill={s.color || "#005840"} stroke="#FAFAF7" strokeWidth="2"/>
            ))}
          </g>
        );
      })}
      {/* x labels */}
      {xLabels.map((lbl, i) => (
        <text key={i}
          x={xFor(i, xLabels.length)}
          y={height - 8}
          textAnchor="middle"
          fontFamily="JetBrains Mono"
          fontSize="10"
          fill="#5E5C57">
          {lbl}
        </text>
      ))}
    </svg>
  );
}

// Big radar (used in 09)
function BigRadar({ axes = ["OTT", "APP", "ARG", "PUTT"], you = [0.6, 0.4, 0.55, 0.5], them = [0.85, 0.85, 0.85, 0.85], size = 380, youColor = "#005840", themColor = "#D1F843" }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 50;
  const n = axes.length;
  const pt = (val, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(a) * r * val, cy + Math.sin(a) * r * val];
  };
  const pathFrom = (vs) => vs.map((v, i) => pt(v, i)).map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ") + "Z";

  const rings = [0.25, 0.5, 0.75, 1].map((k, i) => (
    <polygon key={i}
      points={Array.from({length: n}, (_, j) => {
        const a = (Math.PI * 2 * j) / n - Math.PI / 2;
        return `${cx + Math.cos(a)*r*k},${cy + Math.sin(a)*r*k}`;
      }).join(" ")}
      fill="none" stroke="#E5E3DD" strokeWidth="1"/>
  ));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings}
      {Array.from({length: n}, (_, j) => {
        const a = (Math.PI * 2 * j) / n - Math.PI / 2;
        return <line key={j} x1={cx} y1={cy} x2={cx + Math.cos(a)*r} y2={cy + Math.sin(a)*r} stroke="#E5E3DD" strokeWidth="1"/>;
      })}
      <path d={pathFrom(them)} fill={themColor} fillOpacity="0.20" stroke={themColor} strokeOpacity="0.7" strokeWidth="2" strokeDasharray="6 4"/>
      <path d={pathFrom(you)}  fill={youColor}  fillOpacity="0.30" stroke={youColor} strokeWidth="2.5"/>
      {you.map((v, i) => {
        const [x, y] = pt(v, i);
        return <circle key={`y${i}`} cx={x} cy={y} r="5" fill={youColor} stroke="#FAFAF7" strokeWidth="2"/>;
      })}
      {them.map((v, i) => {
        const [x, y] = pt(v, i);
        return <circle key={`t${i}`} cx={x} cy={y} r="4" fill={themColor} stroke="#005840" strokeWidth="1.5"/>;
      })}
      {axes.map((label, i) => {
        const a = (Math.PI * 2 * i) / n - Math.PI / 2;
        const lx = cx + Math.cos(a) * (r + 28);
        const ly = cy + Math.sin(a) * (r + 28);
        return (
          <text key={i} x={lx} y={ly}
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="Inter Tight" fontSize="13" fontWeight="600"
            fill="#0A1F17" letterSpacing="0.08em">
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// Donut chart
function Donut({ data, size = 200, strokeWidth = 32, colors = ["#005840", "#D1F843", "#F1EEE5", "#5E5C57", "#A6E3CF"] }) {
  const total = data.reduce((s, d) => s + d.n, 0);
  const r = size / 2 - strokeWidth / 2 - 4;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${size/2} ${size/2})`}>
        {data.map((d, i) => {
          const pct = d.n / total;
          const dash = pct * c;
          const seg = (
            <circle key={i} cx={size/2} cy={size/2} r={r}
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"/>
          );
          offset += dash;
          return seg;
        })}
      </g>
      <text x={size/2} y={size/2 - 6} textAnchor="middle"
        fontFamily="JetBrains Mono" fontSize="20" fontWeight="500" fill="#0A1F17">
        {total}
      </text>
      <text x={size/2} y={size/2 + 12} textAnchor="middle"
        fontFamily="JetBrains Mono" fontSize="9" fill="#5E5C57" letterSpacing="0.14em">
        TOTALT
      </text>
    </svg>
  );
}

// Slider with live value
function RangeSlider({ value, min, max, step = 1, onChange, label, unit }) {
  return (
    <div className="range-slider">
      <input type="range" min={min} max={max} step={step} value={value}
             onChange={(e) => onChange(Number(e.target.value))}/>
      <div className="range-labels">
        <span className="mono mini-mono">{min}{unit}</span>
        <span className="mono mini-mono">{max}{unit}</span>
      </div>
    </div>
  );
}

// Tab bar
function TabBar({ tabs, active, onChange, sticky = false }) {
  return (
    <div className={`tabbar ${sticky ? "sticky" : ""}`}>
      {tabs.map(t => (
        <button key={t.id}
                className={`tab ${active === t.id ? "active" : ""}`}
                onClick={() => onChange(t.id)}>
          {t.label}
          {t.count != null && <span className="tab-count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

// Chip group (filter pills)
function ChipGroup({ options, value, onChange, label }) {
  return (
    <div className="chip-group">
      {label && <div className="chip-group-label">{label}</div>}
      <div className="chips" style={{ marginTop: 0 }}>
        {options.map(o => {
          const id = typeof o === "string" ? o : o.id;
          const lbl = typeof o === "string" ? o : o.label;
          return (
            <button key={id}
                    className={`chip ${value === id ? "active" : ""}`}
                    onClick={() => onChange(id)}>
              {lbl}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Norway map — simple stylized SVG with 5 regional zones
function NorwayMap({ activeRegion, onSelect, regions = window.AKG_DATA.regioner, height = 360 }) {
  // Stylized regional polygons (approximate)
  const paths = {
    nord: "M170,30 L240,15 L295,55 L260,135 L220,180 L160,150 L140,100 Z",
    midt: "M150,180 L220,180 L240,260 L180,275 L120,235 L110,200 Z",
    vest: "M70,250 L120,235 L180,275 L150,335 L100,380 L60,360 L40,310 Z",
    ost:  "M150,335 L240,260 L290,330 L260,400 L180,420 L150,370 Z",
    sor:  "M150,420 L180,420 L240,430 L210,470 L160,475 L130,450 Z",
  };
  const labels = {
    nord: [200, 90],   midt: [170, 230],   vest: [95, 305],   ost: [215, 360],   sor: [180, 450],
  };
  return (
    <svg width="100%" height={height} viewBox="0 0 320 500" style={{ maxWidth: 380 }}>
      {regions.map(r => {
        const isActive = activeRegion === r.slug;
        return (
          <g key={r.slug} style={{ cursor: "pointer" }} onClick={() => onSelect && onSelect(r.slug)}>
            <path d={paths[r.slug]}
              fill={isActive ? r.color : `${r.color}30`}
              stroke={r.color}
              strokeWidth={isActive ? 2 : 1}
              style={{ transition: "all .25s ease" }}/>
            <text x={labels[r.slug][0]} y={labels[r.slug][1]}
              textAnchor="middle" fontFamily="Inter Tight" fontSize="14" fontWeight="600"
              fill={isActive ? "#FAFAF7" : "#0A1F17"}
              style={{ pointerEvents: "none", transition: "fill .2s" }}>
              {r.navn.split("-")[0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Step indicator
function StepIndicator({ steps, active }) {
  return (
    <div className="step-indicator">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className={`step-dot ${i <= active ? "done" : ""} ${i === active ? "active" : ""}`}>
            <span>{i + 1}</span>
          </div>
          {i < steps.length - 1 && <div className={`step-line ${i < active ? "done" : ""}`}/>}
        </React.Fragment>
      ))}
    </div>
  );
}

// Trend arrow chip
function TrendChip({ value, suffix = "%" }) {
  const isPos = value >= 0;
  return (
    <span className={`trend-chip ${isPos ? "pos" : "neg"}`}>
      <span style={{ fontSize: 9, marginRight: 2 }}>{isPos ? "▲" : "▼"}</span>
      {Math.abs(value)}{suffix}
    </span>
  );
}

// Search box
function SearchBox({ value, onChange, placeholder = "Søk...", size = "md", autoFocus = false }) {
  return (
    <div className={`searchbox searchbox-${size}`}>
      <Icon name="Search" size={size === "lg" ? 20 : 16}/>
      <input
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <span className="searchbox-kbd">⌘K</span>
    </div>
  );
}

Object.assign(window, {
  Histogram, Heatmap, LineChart, BigRadar, Donut,
  RangeSlider, TabBar, ChipGroup, NorwayMap, StepIndicator, TrendChip, SearchBox,
});
