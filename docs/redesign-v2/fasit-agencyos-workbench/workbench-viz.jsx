// FASIT-REFERANSE (ekstrahert fra Claude Design offline-eksport 2026-07-12)
// Original sti: ui_kits/agencyos/workbench-viz.jsx
// KUN referanse for v2-ombygging — importeres ALDRI av appen.

try { (() => {
/* AK Golf HQ — Workbench data-viz primitives (lifted to reference level).
   Exports window.WBVIZ. Lime area graphs w/ glowing endpoint + scrubber tooltip,
   compare-periods overlay, segmented capacity bar, delta chips, mono stat tiles. */
(function () {
  const D = window.WBDATA;
  const {
    T
  } = D;
  const MONO = 'JetBrains Mono,ui-monospace,monospace';

  /* ── Delta-chip — ▲/▼ tett på et mono-tall ───────────────────── */
  /* dir: 'up' = forbedring (lime) · 'down' = forverring (amber). Pilen følger tallets fortegn. */
  function DeltaChip({
    delta,
    dir,
    size = 10
  }) {
    if (!delta) return null;
    const neg = /^[−-]/.test(delta);
    const col = dir === 'up' ? T.lime : T.amber;
    return /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        lineHeight: 1,
        color: col,
        fontFamily: MONO,
        fontSize: size,
        fontWeight: 700,
        background: `color-mix(in srgb,${col} 13%,transparent)`,
        borderRadius: 5,
        padding: '2px 5px 2px 4px'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: col,
      strokeWidth: 2.4,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      style: {
        display: 'block',
        transform: neg ? 'none' : 'none'
      }
    }, neg ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
      points: "22 17 13.5 8.5 8.5 13.5 2 7"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "16 17 22 17 22 11"
    })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
      points: "22 7 13.5 15.5 8.5 10.5 2 17"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "16 7 22 7 22 13"
    }))), delta.replace(/^[+]/, ''));
  }

  /* ── Mono stat-flis — tett tall + etikett (PaceFuel-vokabular) ── */
  function StatTile({
    label,
    value,
    unit,
    accent,
    delta,
    dir,
    sub
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        background: T.raised,
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        padding: '9px 11px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: T.muted,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 4,
        marginTop: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 19,
        fontWeight: 700,
        color: accent || T.fg,
        lineHeight: 1
      }
    }, value), unit && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10,
        color: T.muted
      }
    }, unit), delta && /*#__PURE__*/React.createElement(DeltaChip, {
      delta: delta,
      dir: dir,
      size: 9
    })), sub && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        color: T.muted,
        marginTop: 5
      }
    }, sub));
  }

  /* ── Segmentert kapasitetsbar (fylt · skravert-over · tom) ────── */
  /* STRIVO-vokabular: diskrete segmenter i stedet for flat bar. */
  function SegmentBar({
    value,
    cap,
    segs = 11,
    height = 12,
    over
  }) {
    const overflow = value > cap;
    const filledExact = value / cap * segs; // segmenter dekket av faktisk volum
    const capSeg = segs;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 3,
        height,
        alignItems: 'stretch'
      }
    }, Array.from({
      length: Math.max(segs, Math.ceil(filledExact))
    }, (_, i) => {
      const fillFrac = Math.max(0, Math.min(1, filledExact - i));
      const beyondCap = i >= capSeg; // over taket
      const fillCol = beyondCap ? over || T.redSolid : T.lime;
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          flex: 1,
          minWidth: 5,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          background: beyondCap ? 'transparent' : T.raised,
          border: beyondCap ? `1px solid ${over || T.redSolid}` : `1px solid ${T.border}`
        }
      }, fillFrac > 0 && /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          inset: 0,
          width: `${fillFrac * 100}%`,
          background: beyondCap ? `repeating-linear-gradient(135deg, ${over || T.redSolid} 0 3px, transparent 3px 6px)` : fillCol,
          borderRadius: 2
        }
      }));
    }));
  }

  /* ════ Areal-graf — lime areal + glødende endepunkt + scrubber ══
     Gjenbrukbar for ACWR (band/guides) og SG (baseline/compare).
     props:
       series   number[]                  «nå»-linja
       prev     number[]?                  stiplet sammenligning («før»)
       yMin,yMax                           verdiskala
       guides   [{v,color,dash,label}]?    vannrette referanselinjer
       bands    [{from,to,fill}]?          fargede soner (verdirom)
       baseline number?                    nullinje (stiplet)
       fmt      v=>string                  formatering for tooltip/akse
       name     string                     etikett i tooltip
       height   number
       accent   color                      linje/areal (default lime)
       compareLabels {now,prev}            navn i compare-tooltip
  ──────────────────────────────────────────────────────────────── */
  function AreaChart({
    series,
    prev,
    yMin,
    yMax,
    guides = [],
    bands = [],
    baseline,
    fmt = v => v.toFixed(2),
    name = '',
    height = 92,
    accent = T.lime,
    compare = false,
    compareLabels = {
      now: 'Nå',
      prev: 'Før'
    }
  }) {
    const [hov, setHov] = React.useState(null);
    const uid = React.useId().replace(/:/g, '');
    const W = 480,
      H = height,
      PL = 30,
      PR = 10,
      PT = 10,
      PB = 18;
    const cW = W - PL - PR,
      cH = H - PT - PB;
    const n = series.length;
    const xp = i => i / (n - 1) * cW;
    const yp = v => cH - (v - yMin) / (yMax - yMin) * cH;
    const linePts = series.map((v, i) => `${xp(i)},${yp(v)}`).join(' ');
    const areaPts = `${xp(0)},${cH} ` + linePts + ` ${xp(n - 1)},${cH}`;
    const prevPts = prev ? prev.map((v, i) => `${xp(i)},${yp(v)}`).join(' ') : null;
    const lastX = xp(n - 1),
      lastY = yp(series[n - 1]);
    const onMove = e => {
      const r = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - r.left) * (W / r.width) - PL;
      const i = Math.round(Math.max(0, Math.min(n - 1, x / cW * (n - 1))));
      setHov(i);
    };
    return /*#__PURE__*/React.createElement("svg", {
      viewBox: `0 0 ${W} ${H}`,
      style: {
        width: '100%',
        height: H,
        overflow: 'visible',
        display: 'block',
        touchAction: 'none'
      },
      onPointerMove: onMove,
      onPointerLeave: () => setHov(null)
    }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
      id: `area${uid}`,
      x1: "0",
      y1: "0",
      x2: "0",
      y2: "1"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: accent,
      stopOpacity: "0.34"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "55%",
      stopColor: accent,
      stopOpacity: "0.10"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: accent,
      stopOpacity: "0"
    })), /*#__PURE__*/React.createElement("radialGradient", {
      id: `glow${uid}`,
      cx: "50%",
      cy: "50%",
      r: "50%"
    }, /*#__PURE__*/React.createElement("stop", {
      offset: "0%",
      stopColor: accent,
      stopOpacity: "0.55"
    }), /*#__PURE__*/React.createElement("stop", {
      offset: "100%",
      stopColor: accent,
      stopOpacity: "0"
    }))), /*#__PURE__*/React.createElement("g", {
      transform: `translate(${PL},${PT})`
    }, bands.map((b, i) => /*#__PURE__*/React.createElement("rect", {
      key: i,
      x: 0,
      y: yp(b.to),
      width: cW,
      height: Math.max(0, yp(b.from) - yp(b.to)),
      fill: b.fill
    })), guides.map((g, i) => /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, /*#__PURE__*/React.createElement("line", {
      x1: 0,
      y1: yp(g.v),
      x2: cW,
      y2: yp(g.v),
      stroke: g.color,
      strokeWidth: 1,
      strokeDasharray: g.dash === false ? undefined : '4 3',
      opacity: g.op != null ? g.op : 0.5
    }), /*#__PURE__*/React.createElement("text", {
      x: -4,
      y: yp(g.v) + 3,
      textAnchor: "end",
      fontFamily: MONO,
      fontSize: 8,
      fill: T.muted
    }, g.label))), baseline != null && /*#__PURE__*/React.createElement("line", {
      x1: 0,
      y1: yp(baseline),
      x2: cW,
      y2: yp(baseline),
      stroke: "rgba(255,255,255,.22)",
      strokeWidth: 1,
      strokeDasharray: "2 3"
    }), /*#__PURE__*/React.createElement("polygon", {
      points: areaPts,
      fill: `url(#area${uid})`
    }), prevPts && /*#__PURE__*/React.createElement("polyline", {
      points: prevPts,
      fill: "none",
      stroke: T.muted,
      strokeWidth: 1.3,
      strokeDasharray: "4 4",
      strokeLinejoin: "round",
      opacity: 0.7
    }), /*#__PURE__*/React.createElement("polyline", {
      points: linePts,
      fill: "none",
      stroke: accent,
      strokeWidth: 1.75,
      strokeLinejoin: "round",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: lastX,
      cy: lastY,
      r: 11,
      fill: `url(#glow${uid})`
    }), /*#__PURE__*/React.createElement("circle", {
      cx: lastX,
      cy: lastY,
      r: 4.4,
      fill: accent,
      stroke: T.base,
      strokeWidth: 1.6
    }), /*#__PURE__*/React.createElement("circle", {
      cx: lastX,
      cy: lastY,
      r: 6.5,
      fill: "none",
      stroke: accent,
      strokeWidth: 1,
      opacity: 0.5
    }), hov !== null && (() => {
      const hx = xp(hov),
        hy = yp(series[hov]);
      const twoLine = compare && prev;
      const boxW = twoLine ? 92 : 64,
        boxH = twoLine ? 30 : 17;
      const bx = Math.max(0, Math.min(cW - boxW, hx - boxW / 2));
      const by = Math.max(-2, hy - boxH - 9);
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
        x1: hx,
        y1: 0,
        x2: hx,
        y2: cH,
        stroke: accent,
        strokeWidth: 1,
        strokeDasharray: "3 3",
        opacity: 0.7
      }), prev && /*#__PURE__*/React.createElement("circle", {
        cx: hx,
        cy: yp(prev[hov]),
        r: 3,
        fill: T.base,
        stroke: T.muted,
        strokeWidth: 1.4
      }), /*#__PURE__*/React.createElement("circle", {
        cx: hx,
        cy: hy,
        r: 4,
        fill: accent,
        stroke: T.base,
        strokeWidth: 1.6
      }), /*#__PURE__*/React.createElement("rect", {
        x: bx,
        y: by,
        width: boxW,
        height: boxH,
        rx: 5,
        fill: "#0C0D0C",
        stroke: T.border
      }), twoLine ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("text", {
        x: bx + 8,
        y: by + 12,
        fontFamily: MONO,
        fontSize: 9,
        fontWeight: 700,
        fill: accent
      }, compareLabels.now, " ", fmt(series[hov])), /*#__PURE__*/React.createElement("text", {
        x: bx + 8,
        y: by + 24,
        fontFamily: MONO,
        fontSize: 9,
        fontWeight: 600,
        fill: T.muted
      }, compareLabels.prev, " ", fmt(prev[hov]))) : /*#__PURE__*/React.createElement("text", {
        x: bx + boxW / 2,
        y: by + 12,
        textAnchor: "middle",
        fontFamily: MONO,
        fontSize: 9.5,
        fontWeight: 700,
        fill: accent
      }, name ? name + ' ' : '', fmt(series[hov])));
    })()));
  }

  /* ── Liten sparkline (ingen akser) — for tette flis-kontekster ── */
  function Spark({
    series,
    accent = T.lime,
    height = 30,
    width = 84
  }) {
    const n = series.length,
      mn = Math.min(...series),
      mx = Math.max(...series),
      pad = 2;
    const xp = i => i / (n - 1) * (width - pad * 2) + pad,
      yp = v => height - pad - (v - mn) / (mx - mn || 1) * (height - pad * 2);
    const pts = series.map((v, i) => `${xp(i)},${yp(v)}`).join(' ');
    const lx = xp(n - 1),
      ly = yp(series[n - 1]);
    return /*#__PURE__*/React.createElement("svg", {
      width: width,
      height: height,
      viewBox: `0 0 ${width} ${height}`,
      style: {
        display: 'block',
        overflow: 'visible'
      }
    }, /*#__PURE__*/React.createElement("polyline", {
      points: pts,
      fill: "none",
      stroke: accent,
      strokeWidth: 1.5,
      strokeLinejoin: "round",
      strokeLinecap: "round"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: lx,
      cy: ly,
      r: 2.6,
      fill: accent,
      stroke: T.base,
      strokeWidth: 1.2
    }));
  }
  window.WBVIZ = {
    DeltaChip,
    StatTile,
    SegmentBar,
    AreaChart,
    Spark
  };
})();
})(); 