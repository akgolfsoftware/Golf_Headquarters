// FASIT-REFERANSE (ekstrahert fra Claude Design offline-eksport 2026-07-12)
// Original sti: ui_kits/agencyos/workbench-arsplan.jsx
// KUN referanse for v2-ombygging — importeres ALDRI av appen.

try { (() => {
/* AK Golf HQ — Workbench · Årsplan-zoom: periodisering på Tidslinje (DnD:
   flytt + kant-drag justerer faseukene), turneringer som punkter, last-kurve,
   pyramide-budsjett per valgt fase. Tokens — ingen hardkodede hexer. */
(function () {
  const DS = window.AKGolfHQDesignSystem_bb9b2b;
  const {
    Icon,
    Tidslinje,
    Tag
  } = DS;
  const KLAR = !!(Tidslinje && Tidslinje.Bane);
  const AXV = {
    FYS: 'var(--axis-fys)',
    TEK: 'var(--axis-tek)',
    SLAG: 'var(--axis-slag)',
    SPILL: 'var(--axis-spill)',
    TURN: 'var(--axis-turn)'
  };
  const MONO = 'JetBrains Mono,ui-monospace,monospace';
  const UI = 'Inter,system-ui,sans-serif';

  /* fra/til = 0-baserte uke-enheter (til eksklusiv). Akse = fasens dominante disiplin. */
  const START_FASER = [{
    id: 'base',
    label: 'Base',
    fra: 0,
    til: 8,
    akse: 'FYS',
    pyr: {
      FYS: 40,
      TEK: 25,
      SLAG: 20,
      SPILL: 10,
      TURN: 5
    }
  }, {
    id: 'forb',
    label: 'Forberedelse',
    fra: 8,
    til: 18,
    akse: 'TEK',
    pyr: {
      FYS: 25,
      TEK: 30,
      SLAG: 25,
      SPILL: 15,
      TURN: 5
    }
  }, {
    id: 'spes',
    label: 'Spesialisering',
    fra: 18,
    til: 30,
    akse: 'SLAG',
    pyr: {
      FYS: 15,
      TEK: 25,
      SLAG: 30,
      SPILL: 20,
      TURN: 10
    }
  }, {
    id: 'taper',
    label: 'Nedtrapping',
    fra: 30,
    til: 34,
    akse: 'SPILL',
    pyr: {
      FYS: 10,
      TEK: 15,
      SLAG: 25,
      SPILL: 30,
      TURN: 20
    }
  }, {
    id: 'peak',
    label: 'Peak',
    fra: 34,
    til: 52,
    akse: 'TURN',
    pyr: {
      FYS: 10,
      TEK: 10,
      SLAG: 20,
      SPILL: 30,
      TURN: 30
    }
  }];
  const TOURS = [{
    name: 'Krets · B',
    ved: 23
  }, {
    name: 'Regionals · B',
    ved: 31
  }, {
    name: 'NM · A',
    ved: 37,
    peak: true
  }, {
    name: 'Tour Final · C',
    ved: 43
  }];
  const TICKS = [0, 4, 9, 13, 17, 22, 26, 30, 35, 39, 43, 48].map((ved, i) => ({
    ved,
    tekst: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'][i]
  }));
  const NOW_WEEK = 25;
  const LOAD = Array.from({
    length: 52
  }, (_, i) => {
    const w = i + 1;
    let v;
    if (w <= 8) v = 0.70 + w / 8 * 0.25;else if (w <= 18) v = 0.95 + (w - 8) / 10 * 0.15;else if (w <= 30) v = 1.10 + (w - 18) / 12 * 0.15;else if (w <= 34) v = 1.25 - (w - 30) / 4 * 0.40;else v = 0.92 + Math.sin((w - 34) / 2.4) * 0.16 + (w - 34) / 18 * 0.10;
    return Math.round(v * 100) / 100;
  });
  function Mono({
    size = 10,
    color = 'var(--text-muted)',
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
  function PyramidBudget({
    fase
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }
    }, "Pyramide-budsjett \xB7 ", fase.label, " \xB7 uke ", fase.fra + 1, "\u2013", fase.til), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        alignItems: 'flex-end',
        height: 64
      }
    }, Object.entries(fase.pyr).map(([ax, v]) => {
      const low = ax === 'TEK' && v < 15;
      const c = low ? 'var(--warning)' : AXV[ax];
      return /*#__PURE__*/React.createElement("div", {
        key: ax,
        style: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        size: 11,
        weight: 700,
        color: c
      }, v, "%"), /*#__PURE__*/React.createElement("div", {
        style: {
          width: '100%',
          height: Math.max(4, v * 1.1),
          background: c,
          borderRadius: '3px 3px 0 0',
          maxHeight: 44
        }
      }), /*#__PURE__*/React.createElement(Mono, {
        size: 8
      }, ax));
    })));
  }
  function LoadCurve() {
    const W = 900,
      H = 84,
      PL = 26,
      PR = 8,
      PT = 8,
      PB = 14;
    const cW = W - PL - PR,
      cH = H - PT - PB,
      yMin = 0.6,
      yMax = 1.4;
    const xp = w => (w - 1) / 51 * cW;
    const yp = v => cH - (v - yMin) / (yMax - yMin) * cH;
    const line = LOAD.map((v, i) => `${xp(i + 1)},${yp(v)}`).join(' ');
    return /*#__PURE__*/React.createElement("svg", {
      viewBox: `0 0 ${W} ${H}`,
      style: {
        width: '100%',
        height: H,
        display: 'block',
        overflow: 'visible'
      }
    }, /*#__PURE__*/React.createElement("g", {
      transform: `translate(${PL},${PT})`
    }, [0.8, 1.0, 1.3].map(v => /*#__PURE__*/React.createElement(React.Fragment, {
      key: v
    }, /*#__PURE__*/React.createElement("line", {
      x1: 0,
      y1: yp(v),
      x2: cW,
      y2: yp(v),
      stroke: v === 1.3 ? 'var(--warning)' : 'var(--border)',
      strokeWidth: 1,
      strokeDasharray: v === 1.3 ? '4 3' : undefined
    }), /*#__PURE__*/React.createElement("text", {
      x: -4,
      y: yp(v) + 3,
      textAnchor: "end",
      fontFamily: MONO,
      fontSize: 8,
      fill: "var(--text-muted)"
    }, v.toFixed(1)))), /*#__PURE__*/React.createElement("polyline", {
      points: line,
      fill: "none",
      stroke: "var(--signal)",
      strokeWidth: 1.5,
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("line", {
      x1: xp(NOW_WEEK),
      y1: 0,
      x2: xp(NOW_WEEK),
      y2: cH,
      stroke: "var(--text)",
      strokeWidth: 1,
      strokeDasharray: "2 2",
      opacity: .4
    })));
  }
  function Arsplan() {
    const [faser, setFaser] = React.useState(START_FASER);
    const [selId, setSelId] = React.useState('spes');
    const [sist, setSist] = React.useState(null);
    const fase = faser.find(f => f.id === selId);
    if (!KLAR) return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 40,
        fontFamily: UI,
        fontSize: 13,
        color: 'var(--text-muted)'
      }
    }, "Tidslinje-komponenten er ikke kompilert enn\xE5 \u2014 last siden p\xE5 nytt.");

    /* Kant-drag/flytt: fasene skal forbli en sammenhengende kjede — naboene justeres. */
    const flytt = ({
      id,
      fra,
      til
    }) => {
      setFaser(prev => {
        const i = prev.findIndex(f => f.id === id);
        if (i < 0) return prev;
        const neste = prev.map(f => ({
          ...f
        }));
        const f = neste[i];
        setSist({
          tekst: `${f.label} → uke ${fra + 1}–${til}`,
          forrige: prev
        });
        f.fra = fra;
        f.til = til;
        if (neste[i - 1]) neste[i - 1].til = Math.max(f.fra, neste[i - 1].fra + 1);
        if (neste[i + 1]) neste[i + 1].fra = Math.min(f.til, neste[i + 1].til - 1);
        return neste;
      });
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflow: 'auto',
        background: 'var(--bg)',
        padding: '18px 22px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 760,
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        display: 'block',
        marginBottom: 4
      }
    }, "SESONG 2026 \xB7 PERIODISERING"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 18,
        color: 'var(--text)',
        letterSpacing: 'var(--tracking-display)'
      }
    }, "52 ukers makrosyklus")), /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      color: "var(--signal)"
    }, "N\xC5 \xB7 UKE ", NOW_WEEK)), sist && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '7px 0',
        borderBottom: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 13,
      style: {
        color: 'var(--signal)',
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: UI,
        fontSize: 12,
        color: 'var(--text-2)'
      }
    }, "Justert: ", sist.tekst, " \u2014 naboer fulgte etter, re-validert."), /*#__PURE__*/React.createElement("button", {
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        fontFamily: UI,
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--text-2)',
        textDecoration: 'underline',
        textUnderlineOffset: 3
      },
      onClick: () => {
        setFaser(sist.forrige);
        setSist(null);
      }
    }, "Angre")), /*#__PURE__*/React.createElement(Tidslinje, {
      total: 52,
      naa: NOW_WEEK - 0.5,
      ticks: TICKS,
      onFlytt: flytt
    }, /*#__PURE__*/React.createElement(Tidslinje.Bane, {
      id: "faser",
      etikett: /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: UI,
          fontSize: 12.5,
          fontWeight: 600
        }
      }, "Faser", /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block',
          fontFamily: MONO,
          fontSize: 9,
          color: 'var(--text-muted)',
          fontWeight: 600
        }
      }, "dra kantene"))
    }, faser.map(f => /*#__PURE__*/React.createElement(Tidslinje.Bar, {
      key: f.id,
      id: f.id,
      fra: f.fra,
      til: f.til,
      akse: f.akse,
      onClick: () => setSelId(f.id)
    }, selId === f.id ? '● ' : '', f.label))), /*#__PURE__*/React.createElement(Tidslinje.Bane, {
      id: "turneringer",
      etikett: /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: UI,
          fontSize: 12.5,
          fontWeight: 600
        }
      }, "Turneringer")
    }, TOURS.map(t => /*#__PURE__*/React.createElement(Tidslinje.Punkt, {
      key: t.name,
      ved: t.ved,
      variant: t.peak ? 'peak' : 'turnering',
      etikett: t.name,
      onClick: () => {}
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '12px 14px'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        display: 'block',
        marginBottom: 6
      }
    }, "Planlagt belastning (ACWR-m\xE5l)"), /*#__PURE__*/React.createElement(LoadCurve, null)), /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '14px 16px'
      }
    }, /*#__PURE__*/React.createElement(PyramidBudget, {
      fase: fase
    }))));
  }
  window.WB = Object.assign(window.WB || {}, {
    Arsplan
  });
})();
})(); 