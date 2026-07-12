// FASIT-REFERANSE (ekstrahert fra Claude Design offline-eksport 2026-07-12)
// Original sti: ui_kits/agencyos/workbench-diff.jsx
// KUN referanse for v2-ombygging — importeres ALDRI av appen.

try { (() => {
/* AK Golf HQ — Workbench · Plan-diff overlay. AI-foreslått endring, før/etter. */
(function () {
  const {
    Icon
  } = window.AKGolfHQDesignSystem_bb9b2b;
  const AX = {
    FYS: "oklch(0.83 0.135 78)",
    TEK: "oklch(0.74 0.12 346)",
    SLAG: "oklch(0.80 0.105 205)",
    SPILL: "oklch(0.63 0.14 244)"
  };
  const T = {
    base: '#060706',
    card: '#171817',
    raised: '#1E1F1D',
    border: '#262725',
    fg: '#F0F0F0',
    muted: '#A6A8A3',
    lime: '#D1F843',
    amber: '#DDB870',
    red: '#F8A59B',
    redSolid: '#E5484D'
  };
  const __wbDiffPalette = true;
  function Mono({
    size = 10,
    color = T.muted,
    weight = 600,
    children,
    style
  }) {
    return /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'JetBrains Mono,ui-monospace,monospace',
        fontSize: size,
        fontWeight: weight,
        color,
        letterSpacing: '0.04em',
        lineHeight: 1,
        ...style
      }
    }, children);
  }
  const CURRENT = [{
    time: "Fre 13:00",
    title: "PEI-batteri",
    axis: "TEK",
    dur: "90 min",
    st: "keep"
  }, {
    time: "Fre 16:00",
    title: "Putting-blokk",
    axis: "SLAG",
    dur: "60 min",
    st: "keep"
  }, {
    time: "Lør 09:00",
    title: "Banespill — 18 hull",
    axis: "SPILL",
    dur: "4t",
    st: "remove"
  }];
  const PROPOSED = [{
    time: "Fre 13:00",
    title: "PEI-batteri",
    axis: "TEK",
    dur: "90 min",
    st: "keep"
  }, {
    time: "Fre 16:00",
    title: "Putting-blokk",
    axis: "SLAG",
    dur: "60 min",
    st: "keep"
  }, {
    time: "Lør 09:00",
    title: "Teknikk · innspill 150–175 m",
    axis: "TEK",
    dur: "90 min",
    st: "add"
  }, {
    time: "Lør 14:00",
    title: "Nærspill-blokk",
    axis: "SLAG",
    dur: "60 min",
    st: "add"
  }];
  const IMPACT = [{
    label: "ACWR",
    from: "1,22",
    to: "1,08",
    good: true
  }, {
    label: "TEK-andel",
    from: "13%",
    to: "17%",
    good: true
  }, {
    label: "Plan-score",
    from: "72",
    to: "87",
    good: true
  }];
  function Row({
    s,
    T
  }) {
    const col = s.st === "remove" ? T.redSolid : s.st === "add" ? T.lime : T.border;
    const dim = s.st === "remove";
    const badge = s.st === "remove" ? "FJERNET" : s.st === "add" ? "NY" : null;
    const badgeC = s.st === "remove" ? T.red : T.lime;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "8px 10px",
        marginBottom: 6,
        borderRadius: 8,
        background: T.raised,
        borderLeft: `2.5px solid ${col}`,
        border: `1px solid ${s.st === "keep" ? T.border : col}`,
        borderLeftWidth: 2.5,
        opacity: dim ? 0.62 : 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 3,
        height: 26,
        borderRadius: 2,
        background: AX[s.axis] || T.muted,
        flex: "none"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "Inter,system-ui,sans-serif",
        fontSize: 12,
        fontWeight: 600,
        color: T.fg,
        textDecoration: dim ? "line-through" : "none",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, s.title), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "JetBrains Mono,monospace",
        fontSize: 9,
        color: T.muted
      }
    }, s.time, " \xB7 ", s.axis, " \xB7 ", s.dur)), badge && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "JetBrains Mono,monospace",
        fontSize: 8,
        fontWeight: 700,
        color: badgeC,
        background: `color-mix(in srgb, ${badgeC} 16%, transparent)`,
        borderRadius: 4,
        padding: "2px 6px",
        flex: "none"
      }
    }, badge));
  }
  function Col({
    title,
    mono,
    list,
    T
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "JetBrains Mono,monospace",
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: mono,
        marginBottom: 8
      }
    }, title), list.map((s, i) => /*#__PURE__*/React.createElement(Row, {
      key: i,
      s: s,
      T: T
    })));
  }
  function DiffOverlay({
    onClose
  }) {
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: "absolute",
        inset: 0,
        zIndex: 50,
        background: "rgba(4,5,6,.66)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: 760,
        maxHeight: 720,
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        boxShadow: "0 24px 70px rgba(0,0,0,.6)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 11
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 34,
        height: 34,
        borderRadius: 9,
        flex: "none",
        background: `color-mix(in srgb, ${T.lime} 16%, ${T.raised})`,
        border: `1px solid ${T.lime}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "sparkles",
      size: 16,
      style: {
        color: T.lime
      }
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "Familjen Grotesk,Inter,system-ui,sans-serif",
        fontWeight: 700,
        fontSize: 16,
        color: T.fg,
        letterSpacing: "-0.01em"
      }
    }, "AI-Caddie foresl\xE5r en endring"), /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      style: {
        marginTop: 2,
        display: "block"
      }
    }, "Uke 25 \xB7 \xD8yvind Rohjan \xB7 Spesialisering"))), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      style: {
        width: 30,
        height: 30,
        borderRadius: 8,
        background: T.raised,
        border: `1px solid ${T.border}`,
        color: T.muted,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 16
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "12px 20px",
        borderBottom: `1px solid ${T.border}`,
        display: "flex",
        gap: 9,
        color: T.muted,
        fontFamily: "Inter,system-ui,sans-serif",
        fontSize: 12.5,
        lineHeight: 1.5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      size: 14,
      style: {
        flex: "none",
        marginTop: 2,
        color: T.amber
      }
    }), /*#__PURE__*/React.createElement("span", null, "\xD8yvind taper mest p\xE5 innspill 150\u2013175 m. L\xF8rdagens banespill erstattes med m\xE5lrettet teknikk + n\xE6rspill \u2014 hever TEK-andelen over minstekravet og senker ukens ACWR.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        padding: "12px 20px",
        gap: 0,
        borderBottom: `1px solid ${T.border}`
      }
    }, IMPACT.map((m, i) => /*#__PURE__*/React.createElement("div", {
      key: m.label,
      style: {
        flex: 1,
        paddingLeft: i ? 16 : 0,
        borderLeft: i ? `1px solid ${T.border}` : "none"
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        display: "block",
        marginBottom: 4
      }
    }, m.label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 13,
      color: T.muted
    }, m.from), /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 12,
      style: {
        color: T.muted
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 15,
      weight: 700,
      color: m.good ? T.lime : T.red
    }, m.to))))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: "auto",
        padding: "16px 20px",
        display: "flex",
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Col, {
      title: "N\xE5",
      mono: T.muted,
      list: CURRENT,
      T: T
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        flex: "none"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 18,
      style: {
        color: T.lime
      }
    })), /*#__PURE__*/React.createElement(Col, {
      title: "Foresl\xE5tt",
      mono: T.lime,
      list: PROPOSED,
      T: T
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 10,
        padding: "14px 20px",
        borderTop: `1px solid ${T.border}`,
        background: T.base
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      style: {
        height: 36,
        padding: "0 16px",
        borderRadius: 9,
        background: "transparent",
        border: `1px solid ${T.border}`,
        color: T.muted,
        fontFamily: "Inter,system-ui,sans-serif",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer"
      }
    }, "Avvis"), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      style: {
        height: 36,
        padding: "0 18px",
        borderRadius: 9,
        background: T.lime,
        border: "none",
        color: T.base,
        fontFamily: "Inter,system-ui,sans-serif",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 7
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 15
    }), " Godta endring"))));
  }
  window.WB = Object.assign(window.WB || {}, {
    DiffOverlay
  });
})();
})(); 