// FASIT-REFERANSE (ekstrahert fra Claude Design offline-eksport 2026-07-12)
// Original sti: ui_kits/agencyos/workbench-rail.jsx
// KUN referanse for v2-ombygging — importeres ALDRI av appen.

try { (() => {
/* AK Golf HQ — Workbench BALANSE-RAIL (persistent, alle zoom-nivåer).
   Belastning/ACWR · pyramide m/ MÅL-strek · ukevolum · AI-medplanlegger ·
   plan-mål · spiller-forespørsler. Eksporterer window.WBRAIL. */
(function () {
  const {
    Icon
  } = window.AKGolfHQDesignSystem_bb9b2b;
  const D = window.WBDATA;
  const V = window.WBVIZ;
  const Z = window.WBZ;
  const {
    T,
    AX,
    AX_SOFT,
    PERIODER,
    FORESPORSLER,
    AI_GHOST,
    GOALS
  } = D;
  const {
    Mono
  } = Z;
  const UI = 'Inter,system-ui,sans-serif',
    DISP = 'Familjen Grotesk,Inter,system-ui,sans-serif',
    MONO = 'JetBrains Mono,ui-monospace,monospace';
  const AXES = ['FYS', 'TEK', 'SLAG', 'SPILL', 'TURN'];

  /* Nåværende periode = Spesialisering → MÅL-budsjett pr. akse */
  const MAAL = (() => {
    const o = {};
    (PERIODER.Spesialisering.budsjett || []).forEach(b => o[b.ax] = b.pct);
    return o;
  })();
  /* Plan-mål med progresjon (presentasjon) */
  const GOAL_PROG = {
    'Kvalifisere til NM 2025': 62,
    'Senke handicap 4,2 → 2,0': 45,
    'Putting < 30 putt/runde': 100
  };
  function Section({
    title,
    badge,
    badgeColor,
    right,
    children,
    first
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '13px 14px',
        borderTop: first ? 'none' : `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        marginBottom: 11
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.11em',
        textTransform: 'uppercase'
      }
    }, title), badge && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        fontWeight: 700,
        color: badgeColor || T.lime,
        background: `color-mix(in srgb,${badgeColor || T.lime} 14%,transparent)`,
        borderRadius: 9999,
        padding: '2px 7px'
      }
    }, badge), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), right), children);
  }

  /* ── Pyramide-rad med MÅL-strek (presis tick inni track) ── */
  function PyrTrack({
    ax,
    actual,
    target,
    flag
  }) {
    return /*#__PURE__*/React.createElement("div", {
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
        flex: 'none',
        boxShadow: flag ? `0 0 0 1.5px ${T.redSolid}` : 'none'
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9.5,
      color: flag ? T.red : T.fg,
      style: {
        width: 36,
        flex: 'none'
      }
    }, ax), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        position: 'relative',
        height: 15,
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
        background: T.fg,
        boxShadow: `0 0 0 1px ${T.card}`
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: `calc(${Math.min(100, target)}% - 3px)`,
        top: -3,
        width: 0,
        height: 0,
        borderLeft: '3px solid transparent',
        borderRight: '3px solid transparent',
        borderTop: `3px solid ${T.fg}`
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
        width: 26,
        flex: 'none'
      }
    }, "/", target));
  }

  /* ── AI-medplanlegger (state machine) ─────────────────── */
  function AiPlanner({
    isCoach,
    phase,
    onBuild,
    onAccept,
    onDiscard
  }) {
    if (!isCoach) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 9,
          background: T.raised,
          border: `1px solid ${T.border}`,
          borderRadius: 9,
          padding: '9px 11px'
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "sparkles",
        size: 13,
        style: {
          color: T.lime,
          flex: 'none',
          marginTop: 1
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          fontFamily: UI,
          fontSize: 11.5,
          color: T.muted,
          lineHeight: 1.45
        }
      }, "Coachen din bruker AI-Caddie til \xE5 bygge uka."));
    }
    if (phase === 'loading') return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: T.raised,
        border: `1px solid ${T.border}`,
        borderRadius: 9,
        padding: '12px 12px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 15,
        height: 15,
        border: `2px solid ${T.lime}`,
        borderTopColor: 'transparent',
        borderRadius: 9999,
        display: 'inline-block',
        animation: 'wbspin .7s linear infinite',
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      color: T.fg
    }, "Bygger mot NM\u2026"), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        display: 'block',
        marginTop: 3
      }
    }, "balanserer pyramide + belastning")));
    if (phase === 'done') return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, AI_GHOST.length, " foresl\xE5tte \xF8kter"), AI_GHOST.map((g, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '8px 10px',
        borderRadius: 8,
        background: AX_SOFT[g.area],
        border: `1px dashed color-mix(in srgb,${AX[g.area]} 55%,transparent)`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 3,
        alignSelf: 'stretch',
        minHeight: 24,
        borderRadius: 2,
        background: AX[g.area],
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: UI,
        fontSize: 12,
        fontWeight: 600,
        color: T.fg,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, g.title), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        display: 'block',
        marginTop: 3
      }
    }, g.meta, " \xB7 ", g.area, "\xB7", g.cs)), /*#__PURE__*/React.createElement(Icon, {
      name: "sparkles",
      size: 12,
      style: {
        color: T.lime,
        flex: 'none'
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 7,
        marginTop: 2
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onAccept,
      style: {
        flex: 1,
        height: 32,
        borderRadius: 8,
        background: T.lime,
        border: 'none',
        color: T.base,
        fontFamily: UI,
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 13
    }), "Godta alle"), /*#__PURE__*/React.createElement("button", {
      onClick: onDiscard,
      style: {
        height: 32,
        padding: '0 12px',
        borderRadius: 8,
        background: 'transparent',
        border: `1px solid ${T.border}`,
        color: T.muted,
        fontFamily: UI,
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer'
      }
    }, "Forkast")));
    return /*#__PURE__*/React.createElement("button", {
      onClick: onBuild,
      style: {
        width: '100%',
        height: 38,
        borderRadius: 9,
        background: `color-mix(in srgb,${T.lime} 10%,${T.raised})`,
        border: `1px solid color-mix(in srgb,${T.lime} 38%,transparent)`,
        color: T.lime,
        fontFamily: UI,
        fontSize: 12.5,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "sparkles",
      size: 15
    }), "Bygg uke mot NM");
  }

  /* ── Forespørsel-kort ─────────────────────────────────── */
  function ReqCard({
    r,
    isCoach
  }) {
    const [done, setDone] = React.useState(null); // null | 'ok' | 'no'
    const typeC = r.type === 'flytt' ? T.amber : T.lime;
    if (done) return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 11px',
        borderRadius: 9,
        background: T.raised,
        border: `1px solid ${T.border}`,
        opacity: 0.7
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: done === 'ok' ? 'circle-check' : 'circle-x',
      size: 13,
      style: {
        color: done === 'ok' ? T.lime : T.muted
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      color: T.muted
    }, done === 'ok' ? 'Godkjent' : 'Avslått', " \xB7 ", r.spiller));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '10px 11px',
        borderRadius: 9,
        background: T.raised,
        border: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 8,
        fontWeight: 700,
        color: typeC,
        border: `1px solid color-mix(in srgb,${typeC} 45%,transparent)`,
        borderRadius: 4,
        padding: '1px 6px',
        textTransform: 'uppercase'
      }
    }, r.type), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.fg
    }, r.spiller), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted
    }, r.when)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: UI,
        fontSize: 12,
        color: T.fg,
        lineHeight: 1.45
      }
    }, r.t), isCoach && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        marginTop: 9
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setDone('ok'),
      style: {
        flex: 1,
        height: 28,
        borderRadius: 7,
        background: `color-mix(in srgb,${T.lime} 12%,transparent)`,
        border: `1px solid color-mix(in srgb,${T.lime} 40%,transparent)`,
        color: T.lime,
        fontFamily: MONO,
        fontSize: 9.5,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, "Godkjenn"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setDone('no'),
      style: {
        flex: 1,
        height: 28,
        borderRadius: 7,
        background: 'transparent',
        border: `1px solid ${T.border}`,
        color: T.muted,
        fontFamily: MONO,
        fontSize: 9.5,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, "Avsl\xE5")));
  }

  /* ════ BALANSE-RAIL ═══════════════════════════════════ */
  function BalanseRail({
    role,
    sessions,
    activeIds,
    selSes,
    showSelected,
    onOpenSession,
    aiPhase,
    onAiBuild,
    onAiAccept,
    onAiDiscard
  }) {
    const isCoach = role === 'coach';
    const fmtAcwr = v => v.toFixed(2).replace('.', ',');
    const fmtSg = v => (v > 0 ? '+' : '') + v.toFixed(1).replace('.', ',');
    const pyrMin = {
      FYS: 0,
      TEK: 0,
      SLAG: 0,
      SPILL: 0,
      TURN: 0
    };
    let total = 0;
    sessions.forEach(s => {
      pyrMin[s.pyramidArea] += s.dH * 60;
      total += s.dH * 60;
    });
    const volT = total / 60,
      volTak = 11,
      over = volT > volTak;
    const tekPct = total ? Math.round(pyrMin.TEK / total * 100) : 0;
    const tekWarn = activeIds.indexOf('tek-min') !== -1;
    const pct = ax => total ? Math.round(pyrMin[ax] / total * 100) : 0;
    const acwrKpi = (D.KPIS.find(k => k.key === 'acwr') || {}).value || D.ACWR[D.ACWR.length - 1].toFixed(2).replace('.', ',');
    return /*#__PURE__*/React.createElement("div", {
      style: {
        width: 300,
        flex: 'none',
        background: T.card,
        borderLeft: `1px solid ${T.border}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        padding: '11px 14px',
        borderBottom: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 8
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
        fontSize: 13.5,
        color: T.fg,
        letterSpacing: '-0.01em'
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
        overflowY: 'auto'
      }
    }, /*#__PURE__*/React.createElement(Section, {
      title: "Neste viktig",
      first: true
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 7
      }
    }, D.NESTE_HENDELSER.slice(0, 4).map((h, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '8px 10px',
        borderRadius: 9,
        background: T.raised,
        border: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: h.icon,
      size: 14,
      style: {
        color: T.lime,
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: UI,
        fontSize: 11.5,
        fontWeight: 600,
        color: T.fg,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, h.label), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted,
      style: {
        display: 'block',
        marginTop: 3
      }
    }, h.meta)), h.uke != null ? /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      weight: 700,
      color: T.fg,
      style: {
        flex: 'none'
      }
    }, "uke ", h.uke) : /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted,
      style: {
        flex: 'none'
      }
    }, "l\xF8pende"))))), showSelected && selSes && /*#__PURE__*/React.createElement(Section, {
      title: "Valgt \xF8kt"
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onOpenSession && onOpenSession(selSes.id),
      style: {
        width: '100%',
        textAlign: 'left',
        display: 'flex',
        gap: 0,
        padding: 0,
        borderRadius: 10,
        overflow: 'hidden',
        cursor: 'pointer',
        background: AX_SOFT[selSes.pyramidArea],
        border: `1px solid color-mix(in srgb,${AX[selSes.pyramidArea]} 45%,transparent)`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 3,
        flex: 'none',
        background: AX[selSes.pyramidArea],
        alignSelf: 'stretch'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0,
        padding: '9px 11px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        fontWeight: 700,
        color: AX[selSes.pyramidArea]
      }
    }, selSes.pyramidArea, "\xB7", selSes.csNivaa), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        color: T.muted
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9
    }, "\xC5pne"), /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 12
    }))), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: DISP,
        fontWeight: 600,
        fontSize: 13.5,
        color: T.fg,
        marginTop: 5
      }
    }, selSes.title), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: MONO,
        fontSize: 9,
        color: T.muted,
        marginTop: 4
      }
    }, D.DAYS[selSes.day], " ", selSes.sH, ":00 \xB7 ", selSes.dH >= 1 ? selSes.dH + 't' : selSes.dH * 60 + 'm', " \xB7 ", selSes.loc)))), /*#__PURE__*/React.createElement(Section, {
      title: "Belastning \xB7 ACWR",
      badge: acwrKpi,
      badgeColor: T.amber,
      right: /*#__PURE__*/React.createElement(Mono, {
        size: 8.5,
        color: T.muted
      }, "28 d")
    }, /*#__PURE__*/React.createElement(V.AreaChart, {
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
      height: 72
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        marginTop: 9
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 2,
        background: T.amber
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5
    }, "1,3\u20131,5 f\xF8lg")), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 2,
        background: T.redSolid
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5
    }, ">1,5 risiko")), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.amber
    }, "f\xF8lg-sone n\xE6r"))), /*#__PURE__*/React.createElement(Section, {
      title: "Strokes Gained",
      badge: fmtSg(D.SG[D.SG.length - 1]),
      badgeColor: T.lime,
      right: /*#__PURE__*/React.createElement(Mono, {
        size: 8.5,
        color: T.muted
      }, "12 uker")
    }, /*#__PURE__*/React.createElement(V.AreaChart, {
      series: D.SG,
      prev: D.SG_PREV,
      compare: true,
      yMin: -2.6,
      yMax: 1.2,
      baseline: 0,
      name: "SG",
      fmt: fmtSg,
      height: 68,
      compareLabels: {
        now: 'Nå',
        prev: '12u før'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginTop: 8,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 11,
        height: 2,
        background: T.lime
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5
    }, "n\xE5")), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 11,
        height: 0,
        borderTop: `1.5px dashed ${T.muted}`
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5
    }, "12 uker f\xF8r")), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.lime
    }, "+1,1 mot baseline")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 6
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
          padding: '7px 9px',
          borderRadius: 8,
          background: T.raised,
          border: `1px solid ${T.border}`
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        size: 9.5,
        color: T.fg,
        weight: 700
      }, a.key), /*#__PURE__*/React.createElement(Mono, {
        size: 8,
        color: T.muted,
        style: {
          display: 'block',
          marginTop: 3,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 62
        }
      }, a.navn)), /*#__PURE__*/React.createElement("div", {
        style: {
          textAlign: 'right',
          flex: 'none'
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        size: 12,
        weight: 700,
        color: a.now >= 0 ? T.lime : T.fg
      }, fmtSg(a.now)), /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 4,
          display: 'flex',
          justifyContent: 'flex-end'
        }
      }, /*#__PURE__*/React.createElement(V.DeltaChip, {
        delta: fmtSg(d),
        dir: d >= 0 ? 'up' : 'down',
        size: 8.5
      }))));
    }))), /*#__PURE__*/React.createElement(Section, {
      title: "Pyramide-balanse",
      badge: tekWarn ? 'TEK lav' : null,
      badgeColor: T.red,
      right: /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 10,
          height: 2,
          background: T.fg
        }
      }), /*#__PURE__*/React.createElement(Mono, {
        size: 8.5,
        color: T.muted
      }, "m\xE5l"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 9
      }
    }, AXES.map(ax => /*#__PURE__*/React.createElement(PyrTrack, {
      key: ax,
      ax: ax,
      actual: pct(ax),
      target: MAAL[ax] || 0,
      flag: ax === 'TEK' && tekWarn
    })))), /*#__PURE__*/React.createElement(Section, {
      title: "Ukevolum",
      right: /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Mono, {
        size: 10,
        weight: 700,
        color: over ? T.redSolid : T.fg
      }, volT.toFixed(1).replace('.', ','), "t"), " ", /*#__PURE__*/React.createElement(Mono, {
        size: 8.5,
        color: T.muted
      }, "/ ", volTak, "t"))
    }, /*#__PURE__*/React.createElement(V.SegmentBar, {
      value: volT,
      cap: volTak,
      segs: 11,
      height: 12
    })), /*#__PURE__*/React.createElement(Section, {
      title: "AI-medplanlegger",
      badge: isCoach ? 'Caddie' : null
    }, /*#__PURE__*/React.createElement(AiPlanner, {
      isCoach: isCoach,
      phase: aiPhase,
      onBuild: onAiBuild,
      onAccept: onAiAccept,
      onDiscard: onAiDiscard
    })), /*#__PURE__*/React.createElement(Section, {
      title: "Plan-m\xE5l"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 11
      }
    }, GOALS.map((g, i) => {
      const p = GOAL_PROG[g.t] || 0;
      const c = g.done ? T.lime : p >= 50 ? T.lime : T.amber;
      return /*#__PURE__*/React.createElement("div", {
        key: i
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          marginBottom: 5
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: g.done ? 'circle-check' : 'circle',
        size: 12,
        style: {
          color: g.done ? T.lime : T.muted,
          flex: 'none'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          fontFamily: UI,
          fontSize: 11.5,
          color: g.done ? T.muted : T.fg,
          textDecoration: g.done ? 'line-through' : 'none',
          lineHeight: 1.35
        }
      }, g.t), /*#__PURE__*/React.createElement(Mono, {
        size: 9,
        weight: 700,
        color: c
      }, p, "%")), /*#__PURE__*/React.createElement("div", {
        style: {
          height: 4,
          borderRadius: 3,
          background: T.raised,
          overflow: 'hidden'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: `${p}%`,
          height: '100%',
          background: c,
          opacity: 0.85
        }
      })));
    }))), /*#__PURE__*/React.createElement(Section, {
      title: "Foresp\xF8rsler",
      badge: isCoach && FORESPORSLER.length ? String(FORESPORSLER.length) : null,
      badgeColor: T.amber
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, FORESPORSLER.map(r => /*#__PURE__*/React.createElement(ReqCard, {
      key: r.id,
      r: r,
      isCoach: isCoach
    })))), /*#__PURE__*/React.createElement(Section, {
      title: "Datakilder",
      right: /*#__PURE__*/React.createElement(Mono, {
        size: 8.5,
        color: T.lime
      }, "2 av 3 aktive")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 7
      }
    }, Object.keys(D.SYNC).map(k => {
      const s = D.SYNC[k];
      return /*#__PURE__*/React.createElement("div", {
        key: k,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '8px 10px',
          borderRadius: 8,
          background: T.raised,
          border: `1px solid ${s.ok ? T.border : `color-mix(in srgb,${T.amber} 35%,${T.border})`}`
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 7,
          height: 7,
          borderRadius: 9999,
          background: s.ok ? T.lime : T.amber,
          flex: 'none',
          boxShadow: s.ok ? `0 0 5px ${T.lime}` : 'none'
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
          gap: 6
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        size: 9.5,
        color: T.fg,
        weight: 700
      }, s.label), !s.ok && /*#__PURE__*/React.createElement(Mono, {
        size: 8,
        color: T.amber
      }, "ikke koblet")), /*#__PURE__*/React.createElement(Mono, {
        size: 8.5,
        color: T.muted,
        style: {
          display: 'block',
          marginTop: 3,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, s.sub)), /*#__PURE__*/React.createElement(Mono, {
        size: 8,
        color: T.muted,
        style: {
          flex: 'none'
        }
      }, s.when));
    })))));
  }
  window.WBRAIL = {
    BalanseRail
  };
})();
})(); 