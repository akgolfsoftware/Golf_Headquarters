// FASIT-REFERANSE (ekstrahert fra Claude Design offline-eksport 2026-07-12)
// Original sti: ui_kits/agencyos/workbench-mobile.jsx
// KUN referanse for v2-ombygging — importeres ALDRI av appen.

try { (() => {
/* AK Golf HQ — Workbench MOBIL (AgencyOS uke-zoom, coach-primær).
   Statusbar TEK-varsel · day-strip + agenda (IMG_4475-vokabular) ·
   inspektør som bunn-ark · validerings-tilstander · skjelett/feil/tom.
   Gjenbruker WBDATA (tokens, økter, CANON-validering) + WBVIZ. Eksporterer window.WBM. */
(function () {
  const DS = window.AKGolfHQDesignSystem_bb9b2b;
  const {
    Icon
  } = DS;
  const D = window.WBDATA;
  const V = window.WBVIZ;
  const {
    T,
    AX,
    AX_SOFT,
    AKFORMEL,
    DAYS,
    DATES,
    TODAY,
    KPIS,
    SESSIONS,
    SCENARIOS,
    PLAN_STATUS,
    validatePlan,
    hardOpen
  } = D;
  const MONO = 'JetBrains Mono,ui-monospace,monospace',
    UI = 'Inter,system-ui,sans-serif',
    DISP = 'Familjen Grotesk,Inter,system-ui,sans-serif';
  const W = 393;
  function Mono({
    size = 11,
    color = T.muted,
    weight = 600,
    children,
    style
  }) {
    return /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: size,
        fontWeight: weight,
        color,
        letterSpacing: '0.04em',
        lineHeight: 1,
        ...style
      }
    }, children);
  }
  function Chip({
    label,
    active,
    color,
    readOnly,
    onClick
  }) {
    return /*#__PURE__*/React.createElement("button", {
      onClick: readOnly ? undefined : onClick,
      disabled: readOnly,
      style: {
        height: 26,
        padding: '0 10px',
        borderRadius: 7,
        cursor: readOnly ? 'default' : 'pointer',
        background: active ? color || T.lime : T.raised,
        color: active ? T.base : readOnly ? T.muted : T.fg,
        border: `1px solid ${active ? color || T.lime : T.border}`,
        fontFamily: MONO,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.03em',
        opacity: readOnly && !active ? 0.55 : 1
      }
    }, label);
  }

  /* ── OS-statusbar ─────────────────────────────────────── */
  function StatusBar() {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '11px 24px 5px',
        flex: 'none'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 13,
        fontWeight: 700,
        color: T.fg
      }
    }, "9:41"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: T.fg
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "activity",
      size: 14
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        fontWeight: 600
      }
    }, "5G"), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 22,
        height: 11,
        borderRadius: 3,
        border: `1px solid ${T.muted}`,
        position: 'relative',
        display: 'inline-block'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        inset: 1.5,
        right: 7,
        background: T.lime,
        borderRadius: 1
      }
    }))));
  }

  /* ── Statusbar TEK-varsel (system-bånd) ──────────────────── */
  function TekVarselStrip({
    role,
    tekShown,
    onOpen
  }) {
    const txt = role === 'coach' ? `TEK ${tekShown}% under minstekrav 15% denne uka` : 'Denne uka mangler teknisk trening';
    return /*#__PURE__*/React.createElement("button", {
      onClick: onOpen,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: `calc(100% - 24px)`,
        margin: '3px 12px 0',
        padding: '7px 11px',
        borderRadius: 9,
        cursor: 'pointer',
        background: 'rgba(229,72,77,.12)',
        border: '1px solid #CD6057',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "triangle-alert",
      size: 14,
      style: {
        color: T.red,
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontFamily: UI,
        fontSize: 12,
        color: T.red,
        lineHeight: 1.35
      }
    }, txt), /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14,
      style: {
        color: T.red,
        flex: 'none'
      }
    }));
  }

  /* ── App-header ───────────────────────────────────────── */
  function Header({
    role,
    setRole,
    score,
    brudd,
    overrides,
    onOpenBrudd,
    status
  }) {
    const scoreC = score >= 85 ? T.lime : score >= 70 ? T.amber : T.red;
    const hard = brudd.filter(b => b.alv === 'hard' && !overrides[b.id]).length;
    const soft = brudd.filter(b => b.alv === 'myk' && !overrides[b.id]).length;
    const s = PLAN_STATUS[status];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '9px 16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 11,
        flex: 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.16em',
        textTransform: 'uppercase'
      }
    }, "WORKBENCH \xB7 UKE 25"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: DISP,
        fontWeight: 700,
        fontSize: 20,
        color: T.fg,
        letterSpacing: '-0.01em',
        margin: '4px 0 7px'
      }
    }, "\xD8yvind Rohjan"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 24,
        padding: '0 10px',
        borderRadius: 9999,
        background: `color-mix(in srgb,${s.color} 14%,transparent)`,
        border: `1px solid color-mix(in srgb,${s.color} 45%,transparent)`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: 9999,
        background: s.color
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: s.color,
      style: {
        letterSpacing: '0.06em',
        textTransform: 'uppercase'
      }
    }, s.label))), /*#__PURE__*/React.createElement("button", {
      onClick: onOpenBrudd,
      title: "\xC5pne bruddliste",
      style: {
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        height: 60,
        padding: '0 13px',
        borderRadius: 14,
        cursor: 'pointer',
        background: `color-mix(in srgb,${scoreC} 9%,${T.raised})`,
        border: `1px solid color-mix(in srgb,${scoreC} 38%,transparent)`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 30,
        letterSpacing: '-0.02em',
        color: scoreC,
        lineHeight: 1
      }
    }, score), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8,
      style: {
        textTransform: 'uppercase',
        letterSpacing: '0.09em',
        display: 'block',
        lineHeight: 1.25
      }
    }, "Plan-", /*#__PURE__*/React.createElement("br", null), "kvalitet"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 3,
        marginTop: 5
      }
    }, hard > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        height: 15,
        padding: '0 5px',
        borderRadius: 9999,
        background: `color-mix(in srgb,${T.redSolid} 16%,transparent)`
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      weight: 700,
      color: T.red
    }, hard, " hard")), soft > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        height: 15,
        padding: '0 5px',
        borderRadius: 9999,
        background: `color-mix(in srgb,${T.amber} 16%,transparent)`
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      weight: 700,
      color: T.amber
    }, soft, " myk")), hard === 0 && soft === 0 && /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      weight: 700,
      color: T.lime
    }, "9 OK"))), /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 15,
      style: {
        color: T.muted
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 2,
        background: T.raised,
        border: `1px solid ${T.border}`,
        borderRadius: 9,
        padding: 2,
        alignSelf: 'flex-start'
      }
    }, [{
      v: 'coach',
      l: 'COACH'
    }, {
      v: 'spiller',
      l: 'SPILLER'
    }].map(o => {
      const on = role === o.v;
      return /*#__PURE__*/React.createElement("button", {
        key: o.v,
        onClick: () => setRole(o.v),
        style: {
          height: 26,
          padding: '0 15px',
          borderRadius: 7,
          border: 'none',
          cursor: 'pointer',
          background: on ? T.lime : 'transparent',
          color: on ? T.base : T.muted,
          fontFamily: MONO,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.05em'
        }
      }, o.l);
    })));
  }

  /* ── KPI-strip (delta-chips) ──────────────────────────── */
  function KpiStrip({
    onOpen
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        padding: '0 16px 12px',
        overflowX: 'auto',
        flex: 'none'
      }
    }, KPIS.map(k => /*#__PURE__*/React.createElement("button", {
      key: k.key,
      onClick: onOpen,
      title: "\xC5pne Balanse",
      style: {
        flex: '1 0 auto',
        minWidth: 88,
        textAlign: 'left',
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        padding: '9px 11px',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      style: {
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap'
      }
    }, k.label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 3,
        marginTop: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 18,
        fontWeight: 700,
        color: k.warn ? T.amber : T.fg,
        lineHeight: 1
      }
    }, k.value), k.unit && /*#__PURE__*/React.createElement(Mono, {
      size: 10
    }, k.unit)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 7
      }
    }, /*#__PURE__*/React.createElement(V.DeltaChip, {
      delta: k.delta,
      dir: k.dir,
      size: 9
    })))));
  }

  /* ── Balanse-ark (mobil paritet m/ desktop-rail) ──────── */
  function BalanseSheet({
    role,
    sessions,
    activeIds,
    onClose
  }) {
    const fmtSg = v => (v > 0 ? '+' : '') + v.toFixed(1).replace('.', ',');
    const fmtAcwr = v => v.toFixed(2).replace('.', ',');
    const MAAL = (() => {
      const o = {};
      (D.PERIODER.Spesialisering.budsjett || []).forEach(b => o[b.ax] = b.pct);
      return o;
    })();
    const AXES = ['FYS', 'TEK', 'SLAG', 'SPILL', 'TURN'];
    const min = {
      FYS: 0,
      TEK: 0,
      SLAG: 0,
      SPILL: 0,
      TURN: 0
    };
    let total = 0;
    sessions.forEach(s => {
      min[s.pyramidArea] += s.dH * 60;
      total += s.dH * 60;
    });
    const pct = ax => total ? Math.round(min[ax] / total * 100) : 0;
    const volT = total / 60,
      volTak = 11;
    const tekWarn = activeIds.indexOf('tek-min') !== -1;
    const acwrKpi = (KPIS.find(k => k.key === 'acwr') || {}).value || '1,22';
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 54,
        background: 'rgba(4,5,4,.62)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: '100%',
        maxHeight: '88%',
        background: T.card,
        borderRadius: '22px 22px 0 0',
        boxShadow: '0 -16px 40px rgba(0,0,0,.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'wbsheet .26s cubic-bezier(0.2,0,0,1)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        padding: '9px 0 4px',
        display: 'flex',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      style: {
        width: 42,
        height: 5,
        borderRadius: 9999,
        background: T.border,
        border: 'none',
        cursor: 'pointer'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 16px 12px',
        borderBottom: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "activity",
      size: 15,
      style: {
        color: T.lime
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: DISP,
        fontWeight: 700,
        fontSize: 15,
        color: T.fg
      }
    }, "Balanse"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted
    }, "uke 25")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '14px 16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 9
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }
    }, "Belastning \xB7 ACWR"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        fontWeight: 700,
        color: T.amber,
        background: `color-mix(in srgb,${T.amber} 14%,transparent)`,
        borderRadius: 9999,
        padding: '2px 7px'
      }
    }, acwrKpi)), /*#__PURE__*/React.createElement(V.AreaChart, {
      series: D.ACWR,
      yMin: 0.6,
      yMax: 1.62,
      bands: [{
        from: 1.5,
        to: 1.62,
        fill: 'rgba(229,72,77,.10)'
      }, {
        from: 1.3,
        to: 1.5,
        fill: 'rgba(221,184,112,.10)'
      }],
      guides: [{
        v: 1.5,
        color: T.redSolid,
        label: '1.5'
      }, {
        v: 1.3,
        color: T.amber,
        label: '1.3'
      }, {
        v: 1.0,
        color: 'rgba(255,255,255,.16)',
        label: '1.0'
      }],
      name: "ACWR",
      fmt: fmtAcwr,
      height: 76
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 9
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }
    }, "Strokes Gained"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        fontWeight: 700,
        color: T.lime,
        background: `color-mix(in srgb,${T.lime} 14%,transparent)`,
        borderRadius: 9999,
        padding: '2px 7px'
      }
    }, fmtSg(D.SG[D.SG.length - 1]))), /*#__PURE__*/React.createElement(V.AreaChart, {
      series: D.SG,
      prev: D.SG_PREV,
      compare: true,
      yMin: -2.6,
      yMax: 1.2,
      baseline: 0,
      name: "SG",
      fmt: fmtSg,
      height: 72,
      compareLabels: {
        now: 'Nå',
        prev: '12u før'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 7,
        marginTop: 10
      }
    }, D.SG_AXES.map(a => {
      const d = a.now - a.prev;
      return /*#__PURE__*/React.createElement("div", {
        key: a.key,
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6,
          padding: '8px 10px',
          borderRadius: 9,
          background: T.raised,
          border: `1px solid ${T.border}`
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        size: 9.5,
        color: T.fg,
        weight: 700
      }, a.key), /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        size: 12,
        weight: 700,
        color: a.now >= 0 ? T.lime : T.fg
      }, fmtSg(a.now)), /*#__PURE__*/React.createElement(V.DeltaChip, {
        delta: fmtSg(d),
        dir: d >= 0 ? 'up' : 'down',
        size: 8
      })));
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }
    }, "Pyramide-balanse"), tekWarn ? /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.red
    }, "TEK lav") : /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.lime
    }, "i balanse")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 9
      }
    }, AXES.map(ax => {
      const actual = pct(ax),
        target = MAAL[ax] || 0,
        flag = ax === 'TEK' && tekWarn;
      return /*#__PURE__*/React.createElement("div", {
        key: ax,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 8,
          height: 8,
          borderRadius: 2,
          background: AX[ax],
          flex: 'none'
        }
      }), /*#__PURE__*/React.createElement(Mono, {
        size: 9.5,
        color: flag ? T.red : T.fg,
        style: {
          width: 34,
          flex: 'none'
        }
      }, ax), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          position: 'relative',
          height: 14,
          borderRadius: 4,
          background: T.raised,
          overflow: 'hidden'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          inset: '0 auto 0 0',
          width: `${Math.min(100, actual)}%`,
          borderRadius: 4,
          background: flag ? `repeating-linear-gradient(135deg, ${T.redSolid} 0 3px, color-mix(in srgb,${T.redSolid} 32%,transparent) 3px 6px)` : AX[ax]
        }
      }), /*#__PURE__*/React.createElement("div", {
        title: `mål ${target}%`,
        style: {
          position: 'absolute',
          left: `calc(${Math.min(100, target)}% - 1px)`,
          top: -1,
          bottom: -1,
          width: 2,
          background: T.fg
        }
      })), /*#__PURE__*/React.createElement(Mono, {
        size: 9.5,
        weight: 700,
        color: flag ? T.red : T.fg,
        style: {
          width: 26,
          textAlign: 'right',
          flex: 'none'
        }
      }, actual, "%"), /*#__PURE__*/React.createElement(Mono, {
        size: 8.5,
        color: T.muted,
        style: {
          width: 22,
          flex: 'none'
        }
      }, "/", target));
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 9
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }
    }, "Ukevolum"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      weight: 700,
      color: volT > volTak ? T.redSolid : T.fg
    }, volT.toFixed(1).replace('.', ','), "t"), " ", /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted
    }, "/ ", volTak, "t"))), /*#__PURE__*/React.createElement(V.SegmentBar, {
      value: volT,
      cap: volTak,
      segs: 11,
      height: 12
    })))));
  }

  /* ── Day-strip ────────────────────────────────────────── */
  function DayStrip({
    sel,
    onSel,
    brokenIds
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        padding: '0 12px 12px',
        flex: 'none'
      }
    }, DAYS.map((d, i) => {
      const on = sel === i,
        today = i === TODAY;
      const cnt = SESSIONS.filter(s => s.day === i).length;
      const dayBroken = SESSIONS.some(s => s.day === i && brokenIds.indexOf(s.id) !== -1);
      return /*#__PURE__*/React.createElement("button", {
        key: i,
        onClick: () => onSel(i),
        style: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 5,
          padding: '8px 0 6px',
          borderRadius: 11,
          cursor: 'pointer',
          background: on ? T.lime : T.card,
          border: `1px solid ${on ? T.lime : today ? `color-mix(in srgb,${T.lime} 35%,${T.border})` : T.border}`
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        size: 8,
        color: on ? T.base : today ? T.lime : T.muted,
        style: {
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }
      }, d), /*#__PURE__*/React.createElement(Mono, {
        size: 14,
        weight: 700,
        color: on ? T.base : T.fg
      }, DATES[i]), /*#__PURE__*/React.createElement("span", {
        style: {
          height: 5,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }
      }, cnt > 0 && /*#__PURE__*/React.createElement("span", {
        style: {
          width: 4,
          height: 4,
          borderRadius: 9999,
          background: on ? T.base : dayBroken ? T.redSolid : T.muted
        }
      })));
    }));
  }

  /* ── Agenda-kort (økt) ────────────────────────────────── */
  function SessionCard({
    s,
    broken,
    onTap
  }) {
    const edge = broken ? T.redSolid : AX[s.pyramidArea];
    return /*#__PURE__*/React.createElement("button", {
      onClick: onTap,
      style: {
        display: 'flex',
        width: '100%',
        textAlign: 'left',
        padding: 0,
        borderRadius: 13,
        overflow: 'hidden',
        cursor: 'pointer',
        background: AX_SOFT[s.pyramidArea],
        border: `1px solid ${broken ? T.redSolid : `color-mix(in srgb,${AX[s.pyramidArea]} 45%,transparent)`}`,
        boxShadow: broken ? `0 0 0 2px color-mix(in srgb,${T.redSolid} 26%,transparent)` : 'none',
        opacity: s.done ? 0.62 : 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 3,
        flex: 'none',
        background: edge,
        alignSelf: 'stretch'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        padding: '11px 13px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '2px 7px',
        borderRadius: 5,
        background: `color-mix(in srgb,${AX[s.pyramidArea]} 16%,transparent)`
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      weight: 700,
      color: AX[s.pyramidArea],
      style: {
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
      }
    }, s.pyramidArea, "\xB7", D.formelSekundaer(s))), broken ? /*#__PURE__*/React.createElement(Icon, {
      name: "triangle-alert",
      size: 14,
      style: {
        color: T.redSolid
      }
    }) : s.done ? /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 14,
      style: {
        color: T.muted
      }
    }) : /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14,
      style: {
        color: T.muted
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: DISP,
        fontWeight: 600,
        fontSize: 14.5,
        color: T.fg,
        marginTop: 6
      }
    }, s.title), /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      style: {
        marginTop: 5,
        display: 'block'
      }
    }, s.sH, ":00 \xB7 ", s.dH >= 1 ? s.dH + 't' : s.dH * 60 + 'm', " \xB7 ", s.loc)));
  }
  function Agenda({
    day,
    brokenIds,
    onTap
  }) {
    const list = SESSIONS.filter(s => s.day === day).sort((a, b) => a.sH - b.sH);
    if (!list.length) return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        height: 54,
        padding: '0 14px',
        borderRadius: 13,
        border: `1px dashed ${T.border}`,
        color: T.muted
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle",
      size: 15
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: UI,
        fontSize: 13
      }
    }, "Hviledag \u2014 ingen \xF8kter planlagt"));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 9
      }
    }, list.map(s => /*#__PURE__*/React.createElement(SessionCard, {
      key: s.id,
      s: s,
      broken: brokenIds.indexOf(s.id) !== -1,
      onTap: () => onTap(s.id)
    })));
  }

  /* ── Bunn-bar: pyramide-balanse + volum + handling ────── */
  function BottomBar({
    role,
    sessions,
    activeIds,
    openHard,
    onPublish,
    status,
    tekShown
  }) {
    const AXES = ['FYS', 'TEK', 'SLAG', 'SPILL', 'TURN'];
    const min = {
      FYS: 0,
      TEK: 0,
      SLAG: 0,
      SPILL: 0,
      TURN: 0
    };
    let total = 0;
    sessions.forEach(s => {
      min[s.pyramidArea] += s.dH * 60;
      total += s.dH * 60;
    });
    const volT = total / 60,
      volTak = 11,
      over = volT > volTak;
    const tekPct = total ? Math.round(min.TEK / total * 100) : 0;
    const tekWarn = activeIds.indexOf('tek-min') !== -1;
    const isCoach = role === 'coach';
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        borderTop: `1px solid ${T.border}`,
        background: T.card,
        padding: '11px 16px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 11
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        width: 104
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      style: {
        textTransform: 'uppercase',
        letterSpacing: '0.07em'
      }
    }, "Volum"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      weight: 700,
      color: over ? T.redSolid : T.fg
    }, volT.toFixed(1).replace('.', ','), "t"))), /*#__PURE__*/React.createElement(V.SegmentBar, {
      value: volT,
      cap: volTak,
      segs: 11,
      height: 11
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      style: {
        textTransform: 'uppercase',
        letterSpacing: '0.07em'
      }
    }, "Pyramide"), tekWarn ? /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.red
    }, "TEK ", tekShown, "% / min 15%") : /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.lime
    }, "i balanse")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        height: 11,
        gap: 2
      }
    }, AXES.map(ax => {
      const pct = total ? Math.round(min[ax] / total * 100) : 0;
      const flag = ax === 'TEK' && tekWarn;
      return /*#__PURE__*/React.createElement("div", {
        key: ax,
        title: `${ax} ${pct}%`,
        style: {
          width: `${pct}%`,
          minWidth: pct ? 5 : 0,
          borderRadius: 3,
          background: flag ? `repeating-linear-gradient(135deg, ${T.redSolid} 0 3px, color-mix(in srgb,${T.redSolid} 30%,transparent) 3px 6px)` : AX[ax],
          boxShadow: flag ? `0 0 0 1.5px ${T.redSolid}` : 'none'
        }
      });
    })))), isCoach && (status === 'DRAFT' || status === 'REJECTED') ? /*#__PURE__*/React.createElement("button", {
      onClick: onPublish,
      disabled: openHard > 0,
      title: openHard > 0 ? `Løs eller overstyr ${openHard} hardt brudd først` : 'Publiser til spiller',
      style: {
        height: 42,
        borderRadius: 10,
        border: 'none',
        cursor: openHard > 0 ? 'not-allowed' : 'pointer',
        background: openHard > 0 ? T.raised : T.lime,
        color: openHard > 0 ? T.muted : T.base,
        fontFamily: UI,
        fontSize: 13.5,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        opacity: openHard > 0 ? 0.7 : 1
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: openHard > 0 ? 'lock' : 'send',
      size: 16
    }), openHard > 0 ? `${openHard} hardt brudd må løses` : 'Publiser til spiller') : /*#__PURE__*/React.createElement("div", {
      style: {
        height: 42,
        borderRadius: 10,
        border: `1px solid ${T.border}`,
        background: T.raised,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-user",
      size: 15,
      style: {
        color: T.lime
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 11,
      color: T.fg
    }, "Lese-visning \xB7 ", role === 'coach' ? 'aktiv plan' : 'spiller')));
  }

  /* ── AK-akse i bunn-arket (validerings-tilstand) ──────── */
  function SheetAxis({
    axis,
    value,
    readOnly,
    brudd,
    override,
    role,
    onChange,
    onOverride
  }) {
    const isCoach = role === 'coach',
      isMulti = axis.multi,
      arr = isMulti ? value || [] : null;
    const [ovOpen, setOvOpen] = React.useState(false);
    const [ovText, setOvText] = React.useState('');
    React.useEffect(() => {
      setOvOpen(false);
      setOvText('');
    }, [brudd && brudd.id]);
    const hard = brudd && brudd.alv === 'hard',
      soft = brudd && brudd.alv === 'myk',
      overridden = brudd && override;
    const ring = overridden ? T.lime : hard ? T.redSolid : soft ? T.amber : null;
    const grp = ring ? {
      padding: 8,
      borderRadius: 9,
      border: `1px ${overridden ? 'dashed' : 'solid'} ${overridden ? `color-mix(in srgb,${T.lime} 50%,transparent)` : ring}`,
      background: `color-mix(in srgb,${ring} ${overridden ? 5 : 7}%,transparent)`
    } : {};
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: ring && !overridden ? hard ? T.red : T.amber : T.muted
      }
    }, axis.label), brudd && /*#__PURE__*/React.createElement(Icon, {
      name: overridden ? 'circle-check' : hard ? 'circle-x' : 'triangle-alert',
      size: 11,
      style: {
        color: overridden ? T.lime : hard ? T.red : T.amber
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        flexWrap: 'wrap',
        ...grp
      }
    }, axis.values.map(v => {
      const on = isMulti ? arr.indexOf(v) !== -1 : value === v;
      const col = axis.key === 'pyramidArea' ? AX[v] : T.lime;
      return /*#__PURE__*/React.createElement(Chip, {
        key: v,
        label: v.replace('L_', ''),
        active: on,
        color: col,
        readOnly: readOnly,
        onClick: () => {
          if (isMulti) {
            const nx = arr.indexOf(v) !== -1 ? arr.filter(x => x !== v) : arr.concat(v);
            onChange(nx);
          } else onChange(v);
        }
      });
    })), brudd && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 7,
        display: 'flex',
        flexDirection: 'column',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: UI,
        fontSize: 11.5,
        color: overridden ? T.muted : hard ? T.red : T.amber,
        lineHeight: 1.45
      }
    }, isCoach ? brudd.melding : brudd.klar), overridden && /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, "Overstyrt \xB7 \xAB", override, "\xBB"), isCoach && hard && !overridden && (ovOpen ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("textarea", {
      value: ovText,
      onChange: e => setOvText(e.target.value),
      placeholder: "Begrunnelse (p\xE5krevd \u2014 logges)\u2026",
      rows: 2,
      style: {
        width: '100%',
        background: T.base,
        border: `1px solid ${T.redSolid}`,
        borderRadius: 8,
        padding: '8px 10px',
        color: T.fg,
        fontSize: 12,
        fontFamily: UI,
        resize: 'none',
        outline: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        if (ovText.trim()) onOverride(brudd.id, ovText.trim());
      },
      disabled: !ovText.trim(),
      style: {
        height: 30,
        padding: '0 13px',
        borderRadius: 7,
        background: ovText.trim() ? T.lime : T.raised,
        border: 'none',
        color: ovText.trim() ? T.base : T.muted,
        fontFamily: MONO,
        fontSize: 10,
        fontWeight: 700,
        cursor: ovText.trim() ? 'pointer' : 'default'
      }
    }, "Lagre overstyring"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setOvOpen(false),
      style: {
        height: 30,
        padding: '0 13px',
        borderRadius: 7,
        background: 'transparent',
        border: `1px solid ${T.border}`,
        color: T.muted,
        fontFamily: MONO,
        fontSize: 10,
        fontWeight: 600,
        cursor: 'pointer'
      }
    }, "Avbryt"))) : /*#__PURE__*/React.createElement("button", {
      onClick: () => setOvOpen(true),
      style: {
        height: 32,
        alignSelf: 'flex-start',
        padding: '0 14px',
        borderRadius: 8,
        background: 'rgba(229,72,77,.12)',
        border: '1px solid #CD6057',
        color: T.red,
        fontFamily: MONO,
        fontSize: 10,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "lock",
      size: 12
    }), "Overstyr")), !isCoach && hard && /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted
    }, "Bare coach kan overstyre.")));
  }

  /* ── Bunn-ark = inspektør ─────────────────────────────── */
  function Sheet({
    role,
    session,
    brudd,
    override,
    onChangeFormel,
    onOverride,
    onClose
  }) {
    const isCoach = role === 'coach';
    const isHard = brudd && brudd.alv === 'hard',
      isSoft = brudd && brudd.alv === 'myk',
      overridden = brudd && override;
    const bdr = overridden ? T.lime : isHard ? T.redSolid : isSoft ? T.amber : T.border;
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        background: 'rgba(4,5,4,.62)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: '100%',
        maxHeight: '78%',
        background: T.card,
        borderTop: `2px solid ${bdr}`,
        borderRadius: '22px 22px 0 0',
        boxShadow: '0 -16px 40px rgba(0,0,0,.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'wbsheet .26s cubic-bezier(0.2,0,0,1)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        padding: '9px 0 4px',
        display: 'flex',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      style: {
        width: 42,
        height: 5,
        borderRadius: 9999,
        background: T.border,
        border: 'none',
        cursor: 'pointer'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        padding: '4px 16px 12px',
        borderBottom: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.12em',
        textTransform: 'uppercase'
      }
    }, "INSPEKT\xD8R"), !isCoach && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 8,
        color: T.muted,
        border: `1px solid ${T.border}`,
        borderRadius: 3,
        padding: '2px 6px'
      }
    }, "LESE-VISNING")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: DISP,
        fontWeight: 700,
        fontSize: 17,
        color: T.fg,
        letterSpacing: '-0.01em',
        marginTop: 6
      }
    }, session.title), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        marginTop: 6,
        alignItems: 'center',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        color: AX[session.pyramidArea],
        background: `color-mix(in srgb,${AX[session.pyramidArea]} 14%,transparent)`,
        padding: '2px 7px',
        borderRadius: 4
      }
    }, session.pyramidArea), /*#__PURE__*/React.createElement(Mono, {
      size: 9
    }, session.sH, ":00 \xB7 ", session.dH, "t \xB7 ", session.loc))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '13px 16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 15
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        letterSpacing: '0.12em',
        textTransform: 'uppercase'
      }
    }, "AK-formel"), AKFORMEL.map(ax => {
      const ab = brudd && brudd.chipKey === ax.key ? brudd : null;
      return /*#__PURE__*/React.createElement(SheetAxis, {
        key: ax.key,
        axis: ax,
        value: session[ax.key],
        readOnly: !isCoach,
        brudd: ab,
        override: ab ? override : null,
        role: role,
        onOverride: onOverride,
        onChange: val => onChangeFormel(session.id, ax.key, val)
      });
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        display: 'block',
        marginBottom: 7
      }
    }, "\xD8velser"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 5
      }
    }, (session.drills || []).map((d, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 11px',
        borderRadius: 8,
        background: T.raised,
        border: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: UI,
        fontSize: 12.5,
        color: T.fg
      }
    }, d), isCoach && /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 13,
      style: {
        color: T.muted
      }
    }))))), brudd && !brudd.chipKey && /*#__PURE__*/React.createElement("div", {
      style: {
        background: T.raised,
        border: `1px solid ${bdr}`,
        borderRadius: 10,
        padding: '11px 13px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: overridden ? 'circle-check' : isHard ? 'circle-x' : 'triangle-alert',
      size: 13,
      style: {
        color: overridden ? T.lime : isHard ? T.red : T.amber
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: overridden ? T.lime : isHard ? T.red : T.amber,
      style: {
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      }
    }, overridden ? 'Overstyrt' : isHard ? 'Hardt brudd' : 'Mykt avvik')), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: UI,
        fontSize: 11.5,
        color: isHard ? T.red : isSoft ? T.amber : T.muted,
        lineHeight: 1.45
      }
    }, isCoach ? brudd.melding : brudd.klar)))));
  }

  /* ── Bruddliste-ark (plan-kvalitet) ───────────────────── */
  function BruddSheet({
    role,
    score,
    brudd,
    overrides,
    onOverride,
    onJump,
    onClose
  }) {
    const isCoach = role === 'coach';
    const scoreC = score >= 85 ? T.lime : score >= 70 ? T.amber : T.red;
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 55,
        background: 'rgba(4,5,4,.62)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: '100%',
        maxHeight: '82%',
        background: T.card,
        borderRadius: '22px 22px 0 0',
        boxShadow: '0 -16px 40px rgba(0,0,0,.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'wbsheet .26s cubic-bezier(0.2,0,0,1)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        padding: '9px 0 4px',
        display: 'flex',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      style: {
        width: 42,
        height: 5,
        borderRadius: 9999,
        background: T.border,
        border: 'none',
        cursor: 'pointer'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '4px 16px 13px',
        borderBottom: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 28,
        color: scoreC,
        lineHeight: 1
      }
    }, score), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: DISP,
        fontWeight: 700,
        fontSize: 14,
        color: T.fg
      }
    }, "Plan-kvalitet"), /*#__PURE__*/React.createElement(Mono, {
      size: 10
    }, brudd.length, " brudd \xB7 ", brudd.filter(b => b.alv === 'hard').length, " harde"))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, brudd.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: '26px 0',
        color: T.lime
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-check",
      size: 26
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: UI,
        fontSize: 13
      }
    }, "Alle 9 invarianter OK \u2014 planen er klar.")), brudd.map(b => {
      const ov = overrides[b.id],
        hard = b.alv === 'hard';
      const c = ov ? T.lime : hard ? T.redSolid : T.amber,
        cTxt = ov ? T.lime : hard ? T.red : T.amber;
      return /*#__PURE__*/React.createElement("div", {
        key: b.id,
        style: {
          display: 'flex',
          gap: 11,
          padding: '11px 13px',
          borderRadius: 10,
          background: T.raised,
          border: `1px solid ${ov ? `color-mix(in srgb,${T.lime} 35%,transparent)` : hard ? 'rgba(229,72,77,.3)' : 'rgba(221,184,112,.3)'}`
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: ov ? 'circle-check' : hard ? 'circle-x' : 'triangle-alert',
        size: 15,
        style: {
          color: c,
          flex: 'none',
          marginTop: 1
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          marginBottom: 3
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: UI,
          fontSize: 13,
          fontWeight: 600,
          color: T.fg
        }
      }, b.navn), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: MONO,
          fontSize: 8,
          fontWeight: 700,
          color: cTxt,
          border: `1px solid ${c}`,
          borderRadius: 3,
          padding: '1px 5px',
          textTransform: 'uppercase'
        }
      }, ov ? 'overstyrt' : hard ? 'hard' : 'myk')), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: UI,
          fontSize: 11.5,
          color: T.muted,
          lineHeight: 1.45
        }
      }, isCoach ? b.melding : b.klar), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 6,
          marginTop: 8
        }
      }, b.sessionId && /*#__PURE__*/React.createElement("button", {
        onClick: () => onJump(b.sessionId),
        style: {
          height: 26,
          padding: '0 10px',
          borderRadius: 6,
          background: 'transparent',
          border: `1px solid ${T.border}`,
          color: T.muted,
          fontFamily: MONO,
          fontSize: 9,
          fontWeight: 600,
          cursor: 'pointer'
        }
      }, "G\xE5 til \xF8kt \u2192"), isCoach && hard && !ov && /*#__PURE__*/React.createElement("button", {
        onClick: () => onOverride(b.id, 'Overstyrt fra plan-kvalitet'),
        style: {
          height: 26,
          padding: '0 10px',
          borderRadius: 6,
          background: 'rgba(229,72,77,.12)',
          border: '1px solid #CD6057',
          color: T.red,
          fontFamily: MONO,
          fontSize: 9,
          fontWeight: 700,
          cursor: 'pointer'
        }
      }, "Overstyr"))));
    }))));
  }

  /* ── Skjelett / feil ──────────────────────────────────── */
  function Shimmer({
    h = 44,
    w = '100%',
    r = 12,
    style
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        width: w,
        height: h,
        borderRadius: r,
        flex: 'none',
        background: `linear-gradient(90deg, ${T.raised} 25%, color-mix(in srgb,${T.fg} 8%,${T.raised}) 37%, ${T.raised} 63%)`,
        backgroundSize: '400% 100%',
        animation: 'wbshimmer 1.5s ease infinite',
        ...style
      }
    });
  }

  /* ════ App ════ */
  function App() {
    const [role, setRole] = React.useState('coach');
    const [day, setDay] = React.useState(5);
    const [scenarioId, setScen] = React.useState('hard');
    const [status, setStatus] = React.useState('DRAFT');
    const [overrides, setOver] = React.useState({});
    const [sessions, setSessions] = React.useState(SESSIONS.map(s => ({
      ...s
    })));
    const [sel, setSel] = React.useState(null);
    const [bruddOpen, setBrudd] = React.useState(false);
    const [balanseOpen, setBalanse] = React.useState(false);
    const [pageState, setPage] = React.useState('filled');
    const activeIds = (SCENARIOS.find(s => s.id === scenarioId) || SCENARIOS[0]).aktive;
    const {
      score,
      brudd
    } = validatePlan(activeIds, overrides);
    const openHard = hardOpen(activeIds, overrides).length;
    const brokenIds = brudd.filter(b => b.alv === 'hard' && !overrides[b.id] && b.sessionId).map(b => b.sessionId);
    const tekPct = (() => {
      let m = 0,
        t = 0;
      sessions.forEach(s => {
        t += s.dH * 60;
        if (s.pyramidArea === 'TEK') m += s.dH * 60;
      });
      return t ? Math.round(m / t * 100) : 0;
    })();
    const tekWarn = activeIds.indexOf('tek-min') !== -1;
    const tekShown = tekPct;
    const selSes = sessions.find(s => s.id === sel);
    const selBrudd = brudd.find(b => b.sessionId === sel) || null;
    const changeFormel = (id, key, val) => setSessions(prev => prev.map(s => s.id === id ? {
      ...s,
      [key]: val,
      ...(key === 'pyramidArea' ? {
        axis: val
      } : {})
    } : s));
    const doOverride = (id, text) => setOver(prev => ({
      ...prev,
      [id]: text
    }));
    const changeScen = id => {
      setScen(id);
      setOver({});
    };
    const frame = {
      width: W,
      height: 852,
      background: T.base,
      borderRadius: 46,
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      border: `1px solid ${T.border}`,
      boxShadow: '0 30px 80px rgba(0,0,0,.55)'
    };
    let body;
    if (pageState === 'loading') {
      body = /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          overflow: 'hidden',
          padding: '2px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 9
        }
      }, Array.from({
        length: 5
      }).map((_, i) => /*#__PURE__*/React.createElement(Shimmer, {
        key: i,
        h: i % 2 ? 78 : 62
      })));
    } else if (pageState === 'error') {
      body = /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 11,
          textAlign: 'center'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '9px 14px',
          borderRadius: 10,
          background: 'rgba(229,72,77,.1)',
          border: '1px solid rgba(229,72,77,.32)'
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "triangle-alert",
        size: 15,
        style: {
          color: T.red
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: UI,
          fontSize: 12.5,
          color: T.red
        }
      }, "Kunne ikke laste uke-canvas")), /*#__PURE__*/React.createElement("button", {
        onClick: () => setPage('filled'),
        style: {
          height: 30,
          padding: '0 13px',
          borderRadius: 8,
          background: 'transparent',
          border: `1px solid ${T.border}`,
          color: T.muted,
          fontFamily: MONO,
          fontSize: 10,
          fontWeight: 700,
          cursor: 'pointer'
        }
      }, "Pr\xF8v igjen")));
    } else {
      body = /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          overflowY: 'auto',
          padding: '2px 16px 16px'
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        size: 9,
        style: {
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: 10
        }
      }, DAYS[day], " ", DATES[day], ". \xB7 ", SESSIONS.filter(s => s.day === day).length, " \xF8kter"), pageState === 'empty' ? /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 13,
          textAlign: 'center',
          padding: '34px 16px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 50,
          height: 50,
          borderRadius: 14,
          background: T.raised,
          border: `1px dashed ${T.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "calendar",
        size: 22,
        style: {
          color: T.muted
        }
      })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: DISP,
          fontWeight: 700,
          fontSize: 17,
          color: T.fg
        }
      }, "Ingen \xF8kter denne uka"), /*#__PURE__*/React.createElement("p", {
        style: {
          fontFamily: UI,
          fontSize: 12.5,
          color: T.muted,
          lineHeight: 1.6,
          margin: '7px 0 0'
        }
      }, "Bygg uka med AI-Caddie eller dra inn \xF8kter fra biblioteket.")), /*#__PURE__*/React.createElement("button", {
        style: {
          height: 40,
          padding: '0 18px',
          borderRadius: 10,
          background: T.lime,
          border: 'none',
          color: T.base,
          fontFamily: UI,
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "sparkles",
        size: 16
      }), "Bygg uka")) : /*#__PURE__*/React.createElement(Agenda, {
        day: day,
        brokenIds: brokenIds,
        onTap: setSel
      }));
    }
    const STATES = [{
      v: 'filled',
      i: 'circle-check',
      t: 'Fylt'
    }, {
      v: 'empty',
      i: 'circle',
      t: 'Tom'
    }, {
      v: 'loading',
      i: 'activity',
      t: 'Laster'
    }, {
      v: 'error',
      i: 'triangle-alert',
      t: 'Feil'
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: frame
    }, /*#__PURE__*/React.createElement(StatusBar, null), tekWarn && pageState !== 'loading' && pageState !== 'error' && /*#__PURE__*/React.createElement(TekVarselStrip, {
      role: role,
      tekShown: tekShown,
      onOpen: () => setBrudd(true)
    }), /*#__PURE__*/React.createElement(Header, {
      role: role,
      setRole: setRole,
      score: score,
      brudd: brudd,
      overrides: overrides,
      onOpenBrudd: () => setBrudd(true),
      status: status
    }), pageState !== 'loading' && pageState !== 'error' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(KpiStrip, {
      onOpen: () => setBalanse(true)
    }), /*#__PURE__*/React.createElement(DayStrip, {
      sel: day,
      onSel: setDay,
      brokenIds: brokenIds
    })), body, /*#__PURE__*/React.createElement(BottomBar, {
      role: role,
      sessions: sessions,
      activeIds: activeIds,
      openHard: openHard,
      status: status,
      tekShown: tekShown,
      onPublish: () => setStatus('PENDING_PLAYER')
    }), sel != null && selSes && /*#__PURE__*/React.createElement(Sheet, {
      role: role,
      session: selSes,
      brudd: selBrudd,
      override: selBrudd ? overrides[selBrudd.id] : null,
      onChangeFormel: changeFormel,
      onOverride: doOverride,
      onClose: () => setSel(null)
    }), bruddOpen && /*#__PURE__*/React.createElement(BruddSheet, {
      role: role,
      score: score,
      brudd: brudd,
      overrides: overrides,
      onOverride: doOverride,
      onJump: id => {
        const s = SESSIONS.find(x => x.id === id);
        if (s) setDay(s.day);
        setSel(id);
        setBrudd(false);
      },
      onClose: () => setBrudd(false)
    }), balanseOpen && /*#__PURE__*/React.createElement(BalanseSheet, {
      role: role,
      sessions: sessions,
      activeIds: activeIds,
      onClose: () => setBalanse(false)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        width: W,
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '10px 12px',
        borderRadius: 12,
        background: T.card,
        border: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8,
      style: {
        letterSpacing: '0.12em',
        textTransform: 'uppercase'
      }
    }, "Demo"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 2,
        background: T.raised,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: 2
      }
    }, STATES.map(o => {
      const on = pageState === o.v;
      return /*#__PURE__*/React.createElement("button", {
        key: o.v,
        title: o.t,
        onClick: () => setPage(o.v),
        style: {
          width: 27,
          height: 22,
          borderRadius: 6,
          border: 'none',
          cursor: 'pointer',
          background: on ? T.fg : 'transparent',
          color: on ? T.base : T.muted,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: o.i,
        size: 12
      }));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("select", {
      value: scenarioId,
      onChange: e => changeScen(e.target.value),
      style: {
        appearance: 'none',
        WebkitAppearance: 'none',
        width: '100%',
        height: 25,
        padding: '0 24px 0 9px',
        borderRadius: 7,
        background: T.raised,
        border: `1px solid ${T.border}`,
        color: T.amber,
        fontFamily: MONO,
        fontSize: 10,
        fontWeight: 700,
        cursor: 'pointer',
        outline: 'none'
      }
    }, SCENARIOS.map(s => /*#__PURE__*/React.createElement("option", {
      key: s.id,
      value: s.id,
      style: {
        background: T.card,
        color: T.fg
      }
    }, s.label))), /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-down",
      size: 11,
      style: {
        position: 'absolute',
        right: 8,
        color: T.muted,
        pointerEvents: 'none'
      }
    }))));
  }
  window.WBM = {
    App
  };
})();
})(); 