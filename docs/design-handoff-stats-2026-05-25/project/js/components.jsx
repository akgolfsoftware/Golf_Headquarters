// Shared components for AK Golf Stats prototype.
// All visual primitives live here so pages stay readable.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ─────────────────────────────────────────────────────────────
// Iconography — minimal stroked SVG (Lucide-inspired, original)
// ─────────────────────────────────────────────────────────────
function Icon({ name, size = 20, stroke = 1.5, className = "", style = {} }) {
  const s = stroke;
  const common = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: s,
    strokeLinecap: "round", strokeLinejoin: "round",
    className, style,
  };
  switch (name) {
    case "Flag":      return <svg {...common}><path d="M4 21V4"/><path d="M4 4h13l-2 4 2 4H4"/></svg>;
    case "Trophy":    return <svg {...common}><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5a3 3 0 0 0 3 3"/><path d="M16 6h3a3 3 0 0 1-3 3"/><path d="M10 17h4"/><path d="M12 13v4"/><path d="M9 21h6"/></svg>;
    case "Target":    return <svg {...common}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/></svg>;
    case "Zap":       return <svg {...common}><path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z"/></svg>;
    case "Sparkles":  return <svg {...common}><path d="M12 4v4M12 16v4M4 12h4M16 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>;
    case "LineChart": return <svg {...common}><path d="M3 3v18h18"/><path d="m7 15 4-6 4 3 5-7"/></svg>;
    case "Gauge":     return <svg {...common}><path d="M12 13 18 7"/><circle cx="12" cy="13" r="9"/><path d="M3 13a9 9 0 0 1 18 0"/></svg>;
    case "Crosshair": return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>;
    case "Users":     return <svg {...common}><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 4a3.5 3.5 0 0 1 0 7"/><path d="M21 20c0-2.6-1.7-4.9-4-5.7"/></svg>;
    case "MapPin":    return <svg {...common}><path d="M12 22s7-7.6 7-13a7 7 0 1 0-14 0c0 5.4 7 13 7 13Z"/><circle cx="12" cy="9" r="2.5"/></svg>;
    case "ArrowRight":return <svg {...common}><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
    case "ArrowDown": return <svg {...common}><path d="M12 5v14M5 13l7 7 7-7"/></svg>;
    case "ChevronRight": return <svg {...common}><path d="m9 6 6 6-6 6"/></svg>;
    case "ChevronLeft":  return <svg {...common}><path d="m15 6-6 6 6 6"/></svg>;
    case "ExternalLink": return <svg {...common}><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>;
    case "Circle":    return <svg {...common}><circle cx="12" cy="12" r="9"/></svg>;
    case "Dot":       return <svg {...common}><circle cx="12" cy="12" r="2.5" fill="currentColor"/></svg>;
    case "Wrench":    return <svg {...common}><path d="M14.7 6.3a4 4 0 0 1 5.4 5.4l-1.4-1.4-2.1 2.1-2-2 2.1-2.1-2-2Z"/><path d="m13 9-8 8a2.1 2.1 0 0 0 3 3l8-8"/></svg>;
    case "Activity":  return <svg {...common}><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>;
    case "Search":    return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case "Menu":      return <svg {...common}><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
    case "Sun":       return <svg {...common}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9 6.3 6.3M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1 6.3 17.7M17.7 6.3l1.4-1.4"/></svg>;
    case "Play":      return <svg {...common}><path d="M6 4v16l14-8Z"/></svg>;
    default: return <svg {...common}><circle cx="12" cy="12" r="9"/></svg>;
  }
}

// ─────────────────────────────────────────────────────────────
// Flag glyph — tiny stylized 3-stripe SVG
// ─────────────────────────────────────────────────────────────
function FlagGlyph({ code = "no", size = 14 }) {
  const palettes = {
    no: ["#BA0C2F", "#FFFFFF", "#00205B"],
    se: ["#006AA7", "#FECC00", "#006AA7"],
    dk: ["#C8102E", "#FFFFFF", "#C8102E"],
    is: ["#02529C", "#FFFFFF", "#DC1E35"],
    fi: ["#FFFFFF", "#003580", "#FFFFFF"],
    us: ["#B22234", "#FFFFFF", "#3C3B6E"],
    ie: ["#169B62", "#FFFFFF", "#FF883E"],
    jp: ["#FFFFFF", "#BC002D", "#FFFFFF"],
    za: ["#007749", "#FFB81C", "#001489"],
  };
  const c = palettes[code] || palettes.no;
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 20 14" style={{ display: "inline-block", flexShrink: 0, borderRadius: 2, overflow: "hidden" }}>
      <rect x="0" y="0"  width="20" height="14" fill={c[0]}/>
      {code === "no" || code === "is" ? (
        <>
          <rect x="6" y="0" width="2.5" height="14" fill={c[1]}/>
          <rect x="0" y="5.5" width="20" height="3" fill={c[1]}/>
          <rect x="7" y="0" width="1" height="14" fill={c[2]}/>
          <rect x="0" y="6.5" width="20" height="1" fill={c[2]}/>
        </>
      ) : (
        <>
          <rect x="0" y="4.5" width="20" height="5"  fill={c[1]}/>
          <rect x="0" y="9.5" width="20" height="4.5" fill={c[2]}/>
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// AthleticEyebrow — mono caps with optional lime dot
// ─────────────────────────────────────────────────────────────
function Eyebrow({ children, dot = true, tone = "forest", className = "" }) {
  const color = tone === "lime" ? "#D1F843" : tone === "muted" ? "#5E5C57" : "#005840";
  return (
    <div className={`eyebrow ${className}`} style={{ color }}>
      {dot && <span className="eyebrow-dot" style={{ background: tone === "lime" ? "#005840" : "#D1F843" }}/>}
      <span>{children}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CountUp — count from 0 → value when in view
// ─────────────────────────────────────────────────────────────
function CountUp({ value, duration = 700, decimals = 0, prefix = "", suffix = "", className = "", style = {} }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (t) => {
          const p = Math.min(1, (t - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setN(value * eased);
          if (p < 1) requestAnimationFrame(tick);
          else setN(value);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.4 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [value, duration]);

  const display = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString("nb-NO");
  return <span ref={ref} className={className} style={style}>{prefix}{display}{suffix}</span>;
}

// ─────────────────────────────────────────────────────────────
// Reveal — fade + slide up on first intersection
// ─────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 12, className = "", as = "div" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const Tag = as;
  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity .65s cubic-bezier(.2,.7,.2,1) ${delay}ms, transform .65s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

// ─────────────────────────────────────────────────────────────
// Button — primary / secondary / ghost variants
// ─────────────────────────────────────────────────────────────
function Btn({ variant = "primary", children, icon = "ArrowRight", iconAfter = true, onClick, size = "md" }) {
  const cls = `btn btn-${variant} btn-${size}`;
  return (
    <button className={cls} onClick={onClick}>
      {!iconAfter && icon && <Icon name={icon} size={16}/>}
      <span>{children}</span>
      {iconAfter && icon && <Icon name={icon} size={16} className="btn-icon"/>}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Sparkline — bars or line
// ─────────────────────────────────────────────────────────────
function SparkBars({ values, height = 56, accent = "#005840", highlight }) {
  const max = Math.max(...values) * 1.05;
  return (
    <svg viewBox={`0 0 ${values.length * 14} ${height}`} width="100%" height={height} preserveAspectRatio="none" style={{ display: "block" }}>
      {values.map((v, i) => {
        const h = (v / max) * height;
        const isHi = i === (highlight ?? -1);
        return (
          <rect key={i}
            x={i * 14 + 2} y={height - h}
            width={10} height={h}
            rx={1.5}
            fill={isHi ? "#D1F843" : accent}
            opacity={isHi ? 1 : 0.85}
          />
        );
      })}
    </svg>
  );
}

function SparkLine({ values, height = 36, color = "#005840" }) {
  const w = 120;
  const max = Math.max(...values), min = Math.min(...values);
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = height - ((v - min) / (max - min || 1)) * (height - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Mini radar — 5-axis hexish polygon preview
function MiniRadar({ values = [0.7, 0.5, 0.6, 0.8, 0.4], values2 = [0.4, 0.6, 0.4, 0.5, 0.7], size = 120 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 8;
  const axes = values.length;
  const pt = (val, i) => {
    const a = (Math.PI * 2 * i) / axes - Math.PI / 2;
    return [cx + Math.cos(a) * r * val, cy + Math.sin(a) * r * val];
  };
  const path = (vs) => vs.map((v, i) => pt(v, i)).map(([x,y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ") + "Z";
  const rings = [0.33, 0.66, 1].map((k, i) => (
    <polygon key={i}
      points={Array.from({length: axes}, (_, j) => {
        const a = (Math.PI * 2 * j) / axes - Math.PI / 2;
        return `${cx + Math.cos(a)*r*k},${cy + Math.sin(a)*r*k}`;
      }).join(" ")}
      fill="none" stroke="#E5E3DD" strokeWidth="1"
    />
  ));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings}
      {Array.from({length: axes}, (_, j) => {
        const a = (Math.PI * 2 * j) / axes - Math.PI / 2;
        return <line key={j} x1={cx} y1={cy} x2={cx + Math.cos(a)*r} y2={cy + Math.sin(a)*r} stroke="#E5E3DD" strokeWidth="1"/>;
      })}
      <path d={path(values2)} fill="#005840" fillOpacity="0.08" stroke="#005840" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="2 2"/>
      <path d={path(values)} fill="#D1F843" fillOpacity="0.45" stroke="#005840" strokeWidth="1.5"/>
      {values.map((v, i) => {
        const [x,y] = pt(v, i);
        return <circle key={i} cx={x} cy={y} r="2.5" fill="#005840"/>;
      })}
    </svg>
  );
}

// Distance-distribution preview (Tour vs Amateur bars)
function PuttPreview({ data, height = 180 }) {
  const max = 100;
  return (
    <div className="putt-preview" style={{ height }}>
      {data.map((row, i) => (
        <div key={row.d} className="putt-col">
          <div className="putt-bar-stack" style={{ height: height - 28 }}>
            <div className="putt-bar putt-bar-tour"
              style={{ height: `${(row.tour / max) * 100}%`, transitionDelay: `${i * 60}ms` }}
              title={`Tour: ${row.tour}%`}
            />
            <div className="putt-bar putt-bar-am"
              style={{ height: `${(row.amateur / max) * 100}%`, transitionDelay: `${i * 60 + 100}ms` }}
              title={`Amatør: ${row.amateur}%`}
            />
          </div>
          <div className="putt-col-label">{row.d}</div>
        </div>
      ))}
    </div>
  );
}

// Make available globally to other Babel scripts
Object.assign(window, {
  Icon, FlagGlyph, Eyebrow, CountUp, Reveal, Btn,
  SparkBars, SparkLine, MiniRadar, PuttPreview,
});
