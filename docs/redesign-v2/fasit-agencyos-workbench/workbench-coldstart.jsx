// FASIT-REFERANSE (ekstrahert fra Claude Design offline-eksport 2026-07-12)
// Original sti: ui_kits/agencyos/workbench-coldstart.jsx
// KUN referanse for v2-ombygging — importeres ALDRI av appen.

try { (() => {
/* AK Golf HQ — Workbench · Kaldstart. Empty state: generer første plan. */
(function () {
  const {
    Icon
  } = window.AKGolfHQDesignSystem_bb9b2b;
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
  const MAL = [{
    v: "hcp",
    label: "Senke handicap",
    sub: "Score-fokus over sesong"
  }, {
    v: "form",
    label: "Turneringsform",
    sub: "Toppe mot A-turnering"
  }, {
    v: "teknikk",
    label: "Teknikk-fundament",
    sub: "Bygge svingmekanikk"
  }, {
    v: "comeback",
    label: "Comeback fra skade",
    sub: "Gradvis opptrapping"
  }];
  const HORISONT = ["12 uker", "24 uker", "52 uker"];
  const TURNERING = ["NM · uke 38", "Regionals · uke 32", "Ingen"];
  const DAGER = [3, 4, 5, 6];
  function ChipRow({
    options,
    value,
    onChange,
    T,
    render
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 7,
        flexWrap: "wrap"
      }
    }, options.map(o => {
      const v = render ? render(o).v : o;
      const label = render ? render(o).label : o;
      const on = value === v;
      return /*#__PURE__*/React.createElement("button", {
        key: String(v),
        onClick: () => onChange(v),
        style: {
          height: 32,
          padding: "0 13px",
          borderRadius: 9,
          background: on ? `color-mix(in srgb, ${T.lime} 14%, ${T.raised})` : T.raised,
          border: `1px solid ${on ? T.lime : T.border}`,
          color: on ? T.lime : T.muted,
          fontFamily: "Inter,system-ui,sans-serif",
          fontSize: 13,
          fontWeight: on ? 600 : 500,
          cursor: "pointer",
          transition: "all 120ms"
        }
      }, label);
    }));
  }
  function Field({
    label,
    T,
    children
  }) {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "JetBrains Mono,monospace",
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: T.muted,
        marginBottom: 9
      }
    }, label), children);
  }
  function ColdStart({
    spiller,
    onGenerate
  }) {
    const [mal, setMal] = React.useState("form");
    const [hor, setHor] = React.useState("24 uker");
    const [tur, setTur] = React.useState("NM · uke 38");
    const [dag, setDag] = React.useState(5);
    const [busy, setBusy] = React.useState(false);
    const run = () => {
      setBusy(true);
      setTimeout(() => onGenerate && onGenerate(), 1100);
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: "auto",
        background: T.base,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "40px 24px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 540,
        maxWidth: "100%"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 12,
        marginBottom: 28
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 58,
        height: 58,
        borderRadius: 15,
        background: `color-mix(in srgb, ${T.lime} 14%, ${T.card})`,
        border: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar",
      size: 26,
      style: {
        color: T.lime
      }
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "Familjen Grotesk,Inter,system-ui,sans-serif",
        fontWeight: 700,
        fontSize: 22,
        letterSpacing: "-0.02em",
        color: T.fg
      }
    }, "Ingen plan for ", spiller, " enn\xE5"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: "Inter,system-ui,sans-serif",
        fontSize: 13.5,
        color: T.muted,
        lineHeight: 1.55,
        margin: "7px auto 0",
        maxWidth: 380
      }
    }, "Sett m\xE5l og horisont, s\xE5 bygger AI-Caddie et periodisert utgangspunkt du kan finjustere p\xE5 canvaset."))), /*#__PURE__*/React.createElement("div", {
      style: {
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 20
      }
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Hovedm\xE5l",
      T: T
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8
      }
    }, MAL.map(m => {
      const on = mal === m.v;
      return /*#__PURE__*/React.createElement("button", {
        key: m.v,
        onClick: () => setMal(m.v),
        style: {
          textAlign: "left",
          padding: "10px 12px",
          borderRadius: 10,
          cursor: "pointer",
          background: on ? `color-mix(in srgb, ${T.lime} 12%, ${T.raised})` : T.raised,
          border: `1px solid ${on ? T.lime : T.border}`,
          transition: "all 120ms"
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: "Inter,system-ui,sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: on ? T.lime : T.fg
        }
      }, m.label), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: "Inter,system-ui,sans-serif",
          fontSize: 11,
          color: T.muted,
          marginTop: 2
        }
      }, m.sub));
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20
      }
    }, /*#__PURE__*/React.createElement(Field, {
      label: "Horisont",
      T: T
    }, /*#__PURE__*/React.createElement(ChipRow, {
      options: HORISONT,
      value: hor,
      onChange: setHor,
      T: T
    })), /*#__PURE__*/React.createElement(Field, {
      label: "Treningsdager / uke",
      T: T
    }, /*#__PURE__*/React.createElement(ChipRow, {
      options: DAGER,
      value: dag,
      onChange: setDag,
      T: T
    }))), /*#__PURE__*/React.createElement(Field, {
      label: "Hovedturnering",
      T: T
    }, /*#__PURE__*/React.createElement(ChipRow, {
      options: TURNERING,
      value: tur,
      onChange: setTur,
      T: T
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 10,
        background: T.raised,
        border: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "sparkles",
      size: 14,
      style: {
        color: T.lime,
        flex: "none"
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      color: T.muted,
      style: {
        lineHeight: 1.5
      }
    }, hor, " \xB7 ", dag, " dager/uke \xB7 topper mot ", tur.split(" · ")[0])), /*#__PURE__*/React.createElement("button", {
      onClick: run,
      disabled: busy,
      style: {
        height: 44,
        borderRadius: 11,
        border: "none",
        cursor: busy ? "default" : "pointer",
        background: T.lime,
        color: T.base,
        fontFamily: "Inter,system-ui,sans-serif",
        fontSize: 14,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        opacity: busy ? 0.8 : 1
      }
    }, busy ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Spinner, {
      color: T.base
    }), " Genererer plan\u2026") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Icon, {
      name: "sparkles",
      size: 16
    }), " Generer plan med AI-Caddie")), /*#__PURE__*/React.createElement("button", {
      style: {
        height: 32,
        borderRadius: 9,
        background: "transparent",
        border: "none",
        color: T.muted,
        fontFamily: "Inter,system-ui,sans-serif",
        fontSize: 12.5,
        cursor: "pointer",
        textDecoration: "underline",
        textUnderlineOffset: 3
      }
    }, "Importer fra eksisterende mal"))));
  }
  function Spinner({
    color
  }) {
    return /*#__PURE__*/React.createElement("span", {
      style: {
        width: 15,
        height: 15,
        borderRadius: 9999,
        border: `2px solid ${color}`,
        borderTopColor: "transparent",
        display: "inline-block",
        animation: "wbspin 0.7s linear infinite"
      }
    }, /*#__PURE__*/React.createElement("style", null, `@keyframes wbspin{to{transform:rotate(360deg)}}`));
  }
  window.WB = Object.assign(window.WB || {}, {
    ColdStart
  });
})();
})(); 