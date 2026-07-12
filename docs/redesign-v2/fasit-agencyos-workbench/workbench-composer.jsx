// FASIT-REFERANSE (ekstrahert fra Claude Design offline-eksport 2026-07-12)
// Original sti: ui_kits/agencyos/workbench-composer.jsx
// KUN referanse for v2-ombygging — importeres ALDRI av appen.

try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* AK Golf HQ — Workbench øktbibliotek + økt-komponist.
   SessionComposer (ny/dupliser/gjenta) + LibraryGallery (søkbart bibliotek:
   maler · standardøkter · driller) + MalDetalj (mal-innhold + effekt før
   planen endres — Fase 3.9.5). Eksporterer window.WBCOMP. */
(function () {
  const {
    Icon
  } = window.AKGolfHQDesignSystem_bb9b2b;
  const D = window.WBDATA;
  const Z = window.WBZ;
  const {
    T,
    AX,
    AX_SOFT,
    AKFORMEL,
    FYS_TYPER,
    DAYS,
    AXIS_LIST
  } = D;
  const {
    Mono,
    Chip
  } = Z;
  const UI = 'Inter,system-ui,sans-serif',
    DISP = 'Familjen Grotesk,Inter,system-ui,sans-serif',
    MONO = 'JetBrains Mono,ui-monospace,monospace';
  const CS_VALUES = (AKFORMEL.find(a => a.key === 'csNivaa') || {}).values || ['CS50', 'CS60', 'CS70', 'CS80', 'CS90', 'CS100'];
  const DUR_OPTS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];
  const fmtDur = h => h < 1 ? Math.round(h * 60) + ' min' : h % 1 === 0 ? h + 't' : h.toFixed(2).replace(/0+$/, '').replace(/\.$/, '') + 't';
  function ModalShell({
    title,
    icon,
    sub,
    onClose,
    width = 460,
    children,
    footer
  }) {
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 60,
        background: 'rgba(4,5,4,.72)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 26
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width,
        maxWidth: '100%',
        maxHeight: '88%',
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        boxShadow: '0 24px 60px rgba(0,0,0,.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '15px 18px',
        borderBottom: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, icon && /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 16,
      style: {
        color: T.lime
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: DISP,
        fontWeight: 700,
        fontSize: 15,
        color: T.fg
      }
    }, title), sub && /*#__PURE__*/React.createElement(Mono, {
      size: 9.5,
      style: {
        display: 'block',
        marginTop: 3
      }
    }, sub))), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      style: {
        width: 28,
        height: 28,
        borderRadius: 8,
        background: T.raised,
        border: `1px solid ${T.border}`,
        color: T.muted,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 14
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px 18px'
      }
    }, children), footer && /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 8,
        padding: '13px 18px',
        borderTop: `1px solid ${T.border}`
      }
    }, footer)));
  }
  function FieldLbl({
    children,
    right
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }
    }, children), right);
  }
  function TextInput(props) {
    return /*#__PURE__*/React.createElement("input", _extends({}, props, {
      style: {
        width: '100%',
        height: 34,
        background: T.raised,
        border: `1px solid ${T.border}`,
        borderRadius: 9,
        padding: '0 11px',
        color: T.fg,
        fontFamily: UI,
        fontSize: 13,
        outline: 'none',
        boxSizing: 'border-box',
        ...(props.style || {})
      }
    }));
  }
  function Stepper({
    value,
    onChange,
    min = 1,
    max = 12,
    suffix
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        background: T.raised,
        border: `1px solid ${T.border}`,
        borderRadius: 9,
        padding: '4px 6px'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onChange(Math.max(min, value - 1)),
      style: {
        width: 22,
        height: 22,
        borderRadius: 6,
        background: T.card,
        border: `1px solid ${T.border}`,
        color: T.fg,
        cursor: 'pointer'
      }
    }, "\u2212"), /*#__PURE__*/React.createElement(Mono, {
      size: 12,
      weight: 700,
      color: T.fg,
      style: {
        minWidth: 14,
        textAlign: 'center'
      }
    }, value), /*#__PURE__*/React.createElement("button", {
      onClick: () => onChange(Math.min(max, value + 1)),
      style: {
        width: 22,
        height: 22,
        borderRadius: 6,
        background: T.card,
        border: `1px solid ${T.border}`,
        color: T.fg,
        cursor: 'pointer'
      }
    }, "+"), suffix && /*#__PURE__*/React.createElement(Mono, {
      size: 9.5,
      color: T.muted
    }, suffix));
  }

  /* ════ SessionComposer — ny / dupliser / gjenta ═════════ */
  function SessionComposer({
    mode = 'new',
    initial,
    weekNo,
    onClose,
    onSave,
    onOpenLibrary
  }) {
    const lockContent = mode === 'repeat';
    const [title, setTitle] = React.useState(initial.title || 'Ny økt');
    const [day, setDay] = React.useState(initial.day ?? 0);
    const [sH, setSH] = React.useState(initial.sH ?? 9);
    const [dH, setDH] = React.useState(initial.dH ?? 1);
    const [loc, setLoc] = React.useState(initial.loc || 'GFGK');
    const [pyramidArea, setPA] = React.useState(initial.pyramidArea || 'TEK');
    const [csNivaa, setCS] = React.useState(initial.csNivaa || 'CS50');
    const [fysType, setFysType] = React.useState(initial.fysType || 'Styrke');
    const isFys = pyramidArea === 'FYS';
    const [drills, setDrills] = React.useState(initial.drills || []);
    const [drillInput, setDrillInput] = React.useState('');
    const [saveLib, setSaveLib] = React.useState(false);
    const [repeatOn, setRepeatOn] = React.useState(mode === 'repeat');
    const [repDays, setRepDays] = React.useState([initial.day ?? 0]);
    const [every, setEvery] = React.useState(1);
    const [endType, setEndType] = React.useState('count');
    const [count, setCount] = React.useState(8);
    const [untilWeek, setUntilWeek] = React.useState((weekNo || 25) + 12);
    React.useEffect(() => {
      /* re-seed if a library item is picked into the same open composer */
      setTitle(initial.title || title);
      setPA(initial.pyramidArea || pyramidArea);
      setCS(initial.csNivaa || csNivaa);
      if (initial.dH) setDH(initial.dH);
      if (initial.drills) setDrills(initial.drills);
      // eslint-disable-next-line
    }, [initial._seed]);
    const toggleRepDay = d => setRepDays(prev => prev.indexOf(d) !== -1 ? prev.filter(x => x !== d) : prev.concat(d).sort());
    const addDrill = () => {
      const v = drillInput.trim();
      if (v) {
        setDrills(prev => prev.concat(v));
        setDrillInput('');
      }
    };
    const rmDrill = i => setDrills(prev => prev.filter((_, j) => j !== i));

    /* ── Drill-forslag fra TrackMan-effekt (Fase 3.10 trinn 7) ────────
       For TEK/SLAG: foreslå drillen i biblioteket m/ størst målt effekt
       på en parameter som IKKE holder mål akkurat nå — aldri auto, kun forslag. */
    const AREA_TM_SUGG = {
      TEK: ['Face to Path', 'Face Angle', 'Tempo'],
      SLAG: ['Low Point', 'Attack Angle']
    };
    const suggestion = React.useMemo(() => {
      const TM = window.TRACKMANDATA;
      const params = AREA_TM_SUGG[pyramidArea];
      if (!TM || !params) return null;
      let best = null;
      Object.keys(TM.DRILL_EFFEKT).forEach(title => {
        const e = TM.DRILL_EFFEKT[title];
        if (params.indexOf(e.param) === -1) return;
        if (drills.indexOf(title) !== -1) return;
        const d = D.DRILLS.find(x => x.title === title);
        if (!d || d.axis !== pyramidArea) return;
        const m = TM.MAALINGER[e.param];
        if (!m) return;
        const s = TM.siste(m);
        if (TM.innenfor(m, s.verdi)) return;
        if (!best || Math.abs(e.delta) > Math.abs(best.e.delta)) best = {
          title,
          e
        };
      });
      return best;
    }, [pyramidArea, drills]);
    const repeatSummary = () => {
      const dayLbls = repDays.slice().sort().map(d => DAYS[d]).join('/');
      const everyTxt = every === 1 ? 'hver uke' : `hver ${every}. uke`;
      const endTxt = endType === 'count' ? `${count} ganger` : `t.o.m. uke ${untilWeek}`;
      return `${dayLbls || '—'} · ${everyTxt} · ${endTxt}`;
    };
    const save = () => {
      const base = {
        title,
        day,
        sH,
        dH,
        loc,
        pyramidArea,
        csNivaa,
        fysType,
        drills
      };
      const repeat = repeatOn ? {
        days: repDays.length ? repDays : [day],
        every,
        endType,
        count,
        untilWeek,
        summary: repeatSummary()
      } : null;
      onSave({
        base,
        saveLib,
        repeat,
        mode
      });
    };
    const titles = {
      new: 'Ny økt',
      duplicate: 'Dupliser økt',
      repeat: 'Gjenta økt'
    };
    const subs = {
      new: 'Bygg en økt fra bunnen, eller hent en fra biblioteket',
      duplicate: 'Kopier innholdet til en annen dag/uke',
      repeat: 'Sett opp automatisk gjentagelse for denne økta'
    };
    return /*#__PURE__*/React.createElement(ModalShell, {
      title: titles[mode],
      icon: mode === 'repeat' ? 'repeat' : mode === 'duplicate' ? 'copy' : 'plus',
      sub: subs[mode],
      onClose: onClose,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        onClick: onClose,
        style: {
          height: 36,
          padding: '0 15px',
          borderRadius: 9,
          background: 'transparent',
          border: `1px solid ${T.border}`,
          color: T.muted,
          fontFamily: UI,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer'
        }
      }, "Avbryt"), /*#__PURE__*/React.createElement("button", {
        onClick: save,
        style: {
          height: 36,
          padding: '0 17px',
          borderRadius: 9,
          background: T.lime,
          border: 'none',
          color: T.base,
          fontFamily: UI,
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 7
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "check",
        size: 15
      }), "Lagre \xF8kt"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }
    }, mode === 'new' && /*#__PURE__*/React.createElement("button", {
      onClick: onOpenLibrary,
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: 36,
        borderRadius: 9,
        background: `color-mix(in srgb,${T.lime} 9%,${T.raised})`,
        border: `1px solid color-mix(in srgb,${T.lime} 35%,transparent)`,
        color: T.lime,
        fontFamily: UI,
        fontSize: 12.5,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "layers",
      size: 15
    }), "Hent fra biblioteket"), !lockContent && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLbl, null, "Tittel"), /*#__PURE__*/React.createElement(TextInput, {
      value: title,
      onChange: e => setTitle(e.target.value),
      placeholder: "F.eks. Innspill 100\u2013150 m"
    })), lockContent && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '10px 12px',
        borderRadius: 10,
        background: T.raised,
        border: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 9
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: 2,
        background: AX[pyramidArea],
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: DISP,
        fontWeight: 600,
        fontSize: 13,
        color: T.fg
      }
    }, title), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        marginTop: 3
      }
    }, pyramidArea, " \xB7 ", pyramidArea === 'FYS' ? fysType : csNivaa, " \xB7 ", fmtDur(dH))), /*#__PURE__*/React.createElement(Icon, {
      name: "lock",
      size: 13,
      style: {
        color: T.muted
      }
    })), !lockContent && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLbl, null, "Dag"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5
      }
    }, DAYS.map((d, i) => /*#__PURE__*/React.createElement(Chip, {
      key: i,
      label: d,
      active: day === i,
      onClick: () => setDay(i)
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(FieldLbl, null, "Starttid"), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("select", {
      value: sH,
      onChange: e => setSH(parseInt(e.target.value, 10)),
      style: {
        width: '100%',
        appearance: 'none',
        WebkitAppearance: 'none',
        height: 34,
        padding: '0 26px 0 11px',
        borderRadius: 9,
        background: T.raised,
        border: `1px solid ${T.border}`,
        color: T.fg,
        fontFamily: MONO,
        fontSize: 12.5,
        fontWeight: 600,
        cursor: 'pointer',
        outline: 'none'
      }
    }, Array.from({
      length: 16
    }, (_, i) => i + 6).map(h => /*#__PURE__*/React.createElement("option", {
      key: h,
      value: h,
      style: {
        background: T.card
      }
    }, h, ":00"))), /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-down",
      size: 12,
      style: {
        position: 'absolute',
        right: 9,
        top: 11,
        color: T.muted,
        pointerEvents: 'none'
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(FieldLbl, null, "Varighet"), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("select", {
      value: dH,
      onChange: e => setDH(parseFloat(e.target.value)),
      style: {
        width: '100%',
        appearance: 'none',
        WebkitAppearance: 'none',
        height: 34,
        padding: '0 26px 0 11px',
        borderRadius: 9,
        background: T.raised,
        border: `1px solid ${T.border}`,
        color: T.fg,
        fontFamily: MONO,
        fontSize: 12.5,
        fontWeight: 600,
        cursor: 'pointer',
        outline: 'none'
      }
    }, DUR_OPTS.map(h => /*#__PURE__*/React.createElement("option", {
      key: h,
      value: h,
      style: {
        background: T.card
      }
    }, fmtDur(h)))), /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-down",
      size: 12,
      style: {
        position: 'absolute',
        right: 9,
        top: 11,
        color: T.muted,
        pointerEvents: 'none'
      }
    }))))), !lockContent && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLbl, null, "Pyramide-akse"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        flexWrap: 'wrap'
      }
    }, AXIS_LIST.map(a => /*#__PURE__*/React.createElement(Chip, {
      key: a,
      label: a,
      active: pyramidArea === a,
      color: AX[a],
      onClick: () => setPA(a)
    })))), /*#__PURE__*/React.createElement("div", null, isFys ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FieldLbl, {
      right: /*#__PURE__*/React.createElement(Mono, {
        size: 8,
        color: T.muted
      }, "fysisk trening")
    }, "Treningstype"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        flexWrap: 'wrap'
      }
    }, FYS_TYPER.map(f => /*#__PURE__*/React.createElement(Chip, {
      key: f,
      label: f,
      active: fysType === f,
      onClick: () => setFysType(f)
    })))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FieldLbl, null, "K\xF8llehastighet"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        flexWrap: 'wrap'
      }
    }, CS_VALUES.map(c => /*#__PURE__*/React.createElement(Chip, {
      key: c,
      label: c,
      active: csNivaa === c,
      onClick: () => setCS(c)
    }))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLbl, null, "Sted"), /*#__PURE__*/React.createElement(TextInput, {
      value: loc,
      onChange: e => setLoc(e.target.value)
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLbl, null, "\xD8velser"), suggestion && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '8px 10px',
        borderRadius: 9,
        marginBottom: 9,
        background: `color-mix(in srgb,${T.lime} 8%,transparent)`,
        border: `1px solid color-mix(in srgb,${T.lime} 30%,transparent)`
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "sparkles",
      size: 13,
      style: {
        color: T.lime,
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 10.5,
      weight: 700,
      color: T.fg
    }, suggestion.title), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.lime,
      style: {
        display: 'block',
        marginTop: 2
      }
    }, "M\xE5lt effekt: ", window.TRACKMANDATA.effektTekst(suggestion.title))), /*#__PURE__*/React.createElement("button", {
      onClick: () => setDrills(prev => prev.concat(suggestion.title)),
      style: {
        flex: 'none',
        height: 26,
        padding: '0 10px',
        borderRadius: 7,
        background: T.lime,
        border: 'none',
        color: T.base,
        fontFamily: UI,
        fontSize: 11,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, "Bruk forslag")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        marginBottom: 7
      }
    }, drills.map((d, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 9px',
        borderRadius: 7,
        background: T.raised,
        border: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: UI,
        fontSize: 12,
        color: T.fg
      }
    }, d), /*#__PURE__*/React.createElement("button", {
      onClick: () => rmDrill(i),
      style: {
        background: 'none',
        border: 'none',
        color: T.muted,
        cursor: 'pointer',
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 12
    }))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement(TextInput, {
      value: drillInput,
      onChange: e => setDrillInput(e.target.value),
      onKeyDown: e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addDrill();
        }
      },
      placeholder: "Legg til \xF8velse\u2026"
    }), /*#__PURE__*/React.createElement("button", {
      onClick: addDrill,
      style: {
        flex: 'none',
        width: 34,
        height: 34,
        borderRadius: 9,
        background: T.raised,
        border: `1px solid ${T.border}`,
        color: T.fg,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 15
    })))), /*#__PURE__*/React.createElement("label", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: saveLib,
      onChange: e => setSaveLib(e.target.checked),
      style: {
        width: 16,
        height: 16,
        accentColor: T.lime,
        cursor: 'pointer'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: UI,
        fontSize: 12.5,
        color: T.fg
      }
    }, "Lagre som standard\xF8kt i biblioteket"))), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: `1px solid ${T.border}`,
        paddingTop: 14
      }
    }, mode !== 'repeat' ? /*#__PURE__*/React.createElement("label", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        cursor: 'pointer',
        marginBottom: repeatOn ? 12 : 0
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: repeatOn,
      onChange: e => {
        const on = e.target.checked;
        setRepeatOn(on);
        if (on) setRepDays(prev => prev.indexOf(day) !== -1 ? prev : [day]);
      },
      style: {
        width: 16,
        height: 16,
        accentColor: T.lime,
        cursor: 'pointer'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: UI,
        fontSize: 12.5,
        fontWeight: 600,
        color: T.fg,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "repeat",
      size: 14,
      style: {
        color: T.lime
      }
    }), "Gjenta denne \xF8kta")) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "repeat",
      size: 14,
      style: {
        color: T.lime
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }
    }, "Gjentagelse")), repeatOn && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 13,
        padding: '12px 13px',
        borderRadius: 11,
        background: T.raised,
        border: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLbl, null, "Ukedager"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5
      }
    }, DAYS.map((d, i) => /*#__PURE__*/React.createElement(Chip, {
      key: i,
      label: d,
      active: repDays.indexOf(i) !== -1,
      onClick: () => toggleRepDay(i)
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      color: T.fg
    }, "Frekvens"), /*#__PURE__*/React.createElement(Stepper, {
      value: every,
      onChange: setEvery,
      min: 1,
      max: 8,
      suffix: every === 1 ? 'uke' : 'uker'
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLbl, null, "Slutt"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("label", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      checked: endType === 'count',
      onChange: () => setEndType('count'),
      style: {
        accentColor: T.lime,
        cursor: 'pointer'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: UI,
        fontSize: 12,
        color: T.fg
      }
    }, "Etter"), /*#__PURE__*/React.createElement(Stepper, {
      value: count,
      onChange: setCount,
      min: 1,
      max: 52,
      suffix: "ganger"
    })), /*#__PURE__*/React.createElement("label", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      checked: endType === 'date',
      onChange: () => setEndType('date'),
      style: {
        accentColor: T.lime,
        cursor: 'pointer'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: UI,
        fontSize: 12,
        color: T.fg
      }
    }, "Til uke"), /*#__PURE__*/React.createElement(TextInput, {
      type: "number",
      value: untilWeek,
      onChange: e => setUntilWeek(parseInt(e.target.value, 10) || untilWeek),
      style: {
        width: 70,
        height: 28
      }
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        padding: '9px 10px',
        borderRadius: 8,
        background: T.card,
        border: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      size: 13,
      style: {
        color: T.muted,
        flex: 'none',
        marginTop: 1
      }
    }), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontFamily: UI,
        fontSize: 11,
        color: T.muted,
        lineHeight: 1.5
      }
    }, "Legger inn \xF8kter p\xE5 valgte dager i uke ", weekNo || 25, " n\xE5 \u2014 ", /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, repeatSummary()), ". Fremtidige uker fylles automatisk etter hvert som planen rulles videre."))))));
  }

  /* ════ LibraryGallery — søkbart øktbibliotek ════════════ */
  function LibCard({
    kind,
    item,
    onPick,
    onApply
  }) {
    const isMal = kind === 'mal';
    const color = isMal ? T.lime : AX[item.axis];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 9,
        padding: '12px 13px',
        borderRadius: 12,
        background: T.raised,
        border: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 2,
        background: color,
        flex: 'none',
        marginTop: 4
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: DISP,
        fontWeight: 600,
        fontSize: 13,
        color: T.fg,
        lineHeight: 1.3
      }
    }, item.title), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        display: 'block',
        marginTop: 4
      }
    }, isMal ? item.meta : `${item.axis} · CS${item.cs} · ${item.dur}`)), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 'none',
        fontFamily: MONO,
        fontSize: 8,
        fontWeight: 700,
        color,
        background: `color-mix(in srgb,${color} 16%,transparent)`,
        borderRadius: 4,
        padding: '2px 6px',
        textTransform: 'uppercase'
      }
    }, kind)), isMal ? /*#__PURE__*/React.createElement("button", {
      onClick: () => onApply(item),
      style: {
        height: 30,
        borderRadius: 8,
        background: `color-mix(in srgb,${T.lime} 12%,transparent)`,
        border: `1px solid color-mix(in srgb,${T.lime} 40%,transparent)`,
        color: T.lime,
        fontFamily: UI,
        fontSize: 12,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar",
      size: 14
    }), "Se og bruk malen") : /*#__PURE__*/React.createElement("button", {
      onClick: () => onPick(item, kind),
      style: {
        height: 30,
        borderRadius: 8,
        background: 'transparent',
        border: `1px solid ${T.border}`,
        color: T.fg,
        fontFamily: UI,
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 14
    }), "Bruk i ny \xF8kt"));
  }
  function LibraryGallery({
    onClose,
    onPickItem,
    onApplyTemplate,
    extraStdokter
  }) {
    const [tab, setTab] = React.useState('alle');
    const [axis, setAxis] = React.useState('ALLE');
    const [q, setQ] = React.useState('');
    const allStd = (extraStdokter || []).concat(D.STDOKTER);
    const TABS = [['alle', 'Alle'], ['mal', 'Maler'], ['standard', 'Standardøkter'], ['drill', 'Driller']];
    const matches = title => !q || title.toLowerCase().indexOf(q.toLowerCase()) !== -1;
    const groups = [];
    if (tab === 'alle' || tab === 'mal') groups.push({
      kind: 'mal',
      items: D.TEMPLATES.filter(t => matches(t.title))
    });
    if (tab === 'alle' || tab === 'standard') groups.push({
      kind: 'standard',
      items: allStd.filter(s => matches(s.title) && (axis === 'ALLE' || s.axis === axis))
    });
    if (tab === 'alle' || tab === 'drill') groups.push({
      kind: 'drill',
      items: D.DRILLS.filter(d => matches(d.title) && (axis === 'ALLE' || d.axis === axis))
    });
    const total = groups.reduce((n, g) => n + g.items.length, 0);
    const GROUP_LABEL = {
      mal: 'MALER · HELE UKER',
      standard: 'STANDARDØKTER',
      drill: 'DRILLER'
    };
    return /*#__PURE__*/React.createElement(ModalShell, {
      title: "\xD8ktbibliotek",
      icon: "layers",
      sub: `${total} treff`,
      width: 640,
      onClose: onClose
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 13
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        flex: 1,
        minWidth: 180
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 14,
      style: {
        position: 'absolute',
        left: 10,
        top: 10,
        color: T.muted
      }
    }), /*#__PURE__*/React.createElement(TextInput, {
      value: q,
      onChange: e => setQ(e.target.value),
      placeholder: "S\xF8k\u2026",
      style: {
        paddingLeft: 32
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5
      }
    }, TABS.map(([v, l]) => /*#__PURE__*/React.createElement(Chip, {
      key: v,
      label: l,
      active: tab === v,
      onClick: () => setTab(v)
    })))), tab !== 'mal' && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement(Chip, {
      label: "ALLE",
      active: axis === 'ALLE',
      onClick: () => setAxis('ALLE')
    }), AXIS_LIST.map(a => /*#__PURE__*/React.createElement(Chip, {
      key: a,
      label: a,
      active: axis === a,
      color: AX[a],
      onClick: () => setAxis(a)
    }))), groups.map(g => g.items.length > 0 && /*#__PURE__*/React.createElement("div", {
      key: g.kind
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        display: 'block',
        marginBottom: 9
      }
    }, GROUP_LABEL[g.kind], " \xB7 ", g.items.length), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 9
      }
    }, g.items.map(item => /*#__PURE__*/React.createElement(LibCard, {
      key: item.id,
      kind: g.kind,
      item: item,
      onPick: onPickItem,
      onApply: onApplyTemplate
    }))))), total === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '30px 0',
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 11,
      color: T.muted
    }, "Ingen treff."))));
  }

  /* ════ MalDetalj — innhold + effekt før malen brukes (Fase 3.9.5) ═
     Erstatter window.confirm: coachen ser mini-uka malen legger inn og
     effekten på pyramide-fordeling (mot periodens mål) + ukevolum (mot tak)
     FØR planen endres. Avvik = myk «Avviker fra anbefaling» — aldri sperre. */
  function MalDetalj({
    tpl,
    sessions,
    weekNo = 25,
    onApply,
    onClose
  }) {
    const fmt1 = v => (Math.round(v * 10) / 10).toFixed(1).replace('.', ',');
    const MAAL = {};
    (((D.PERIODER || {}).Spesialisering || {}).budsjett || []).forEach(b => {
      MAAL[b.ax] = b.pct;
    });
    const min0 = {
      FYS: 0,
      TEK: 0,
      SLAG: 0,
      SPILL: 0,
      TURN: 0
    };
    let tot0 = 0;
    (sessions || []).forEach(s => {
      min0[s.pyramidArea] += s.dH * 60;
      tot0 += s.dH * 60;
    });
    const min1 = {
      ...min0
    };
    let tot1 = tot0;
    tpl.sessions.forEach(s => {
      min1[s.axis] += s.dH * 60;
      tot1 += s.dH * 60;
    });
    const pct = (m, t) => t ? Math.round(m / t * 100) : 0;
    const TAK = 11,
      vol0 = tot0 / 60,
      vol1 = tot1 / 60,
      addT = (tot1 - tot0) / 60;
    const tekEtter = pct(min1.TEK, tot1);
    const avvik = [];
    if (vol1 > TAK) avvik.push(`Ukevolumet går til ${fmt1(vol1)} t — over anbefalt tak på ${TAK} t.`);
    if (tekEtter < 15) avvik.push(`TEK lander på ${tekEtter} % — under anbefalt minimum 15 %.`);
    const perDay = DAYS.map((_, i) => tpl.sessions.filter(s => s.day === i).slice().sort((a, b) => a.sH - b.sH));
    return /*#__PURE__*/React.createElement(ModalShell, {
      title: tpl.title,
      icon: "layers",
      sub: `Mal · ${tpl.meta} — planen endres først når du bruker malen`,
      width: 640,
      onClose: onClose,
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        onClick: onClose,
        style: {
          height: 36,
          padding: '0 15px',
          borderRadius: 9,
          background: 'transparent',
          border: `1px solid ${T.border}`,
          color: T.muted,
          fontFamily: UI,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer'
        }
      }, "Avbryt"), /*#__PURE__*/React.createElement("button", {
        onClick: onApply,
        style: {
          height: 36,
          padding: '0 17px',
          borderRadius: 9,
          background: T.lime,
          border: 'none',
          color: T.base,
          fontFamily: UI,
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 7
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "calendar",
        size: 15
      }), "Bruk mal \u2014 legg ", tpl.sessions.length, " \xF8kter i uke ", weekNo))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLbl, {
      right: /*#__PURE__*/React.createElement(Mono, {
        size: 8.5,
        color: T.muted
      }, tpl.sessions.length, " \xF8kter \xB7 +", fmt1(addT), " t")
    }, "Innhold"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7,minmax(0,1fr))',
        gap: 5
      }
    }, DAYS.map((d, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        minHeight: 78,
        minWidth: 0,
        padding: '6px 5px',
        borderRadius: 8,
        background: T.raised,
        border: `1px solid ${T.border}`,
        opacity: perDay[i].length ? 1 : 0.45
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      style: {
        textTransform: 'uppercase',
        letterSpacing: '0.06em'
      }
    }, d), perDay[i].map((s, j) => /*#__PURE__*/React.createElement("div", {
      key: j,
      title: `${s.title} · ${s.axis}·${s.cs} · ${s.sH}:00 · ${fmtDur(s.dH)}`,
      style: {
        display: 'flex',
        gap: 5,
        padding: '4px 5px',
        borderRadius: 6,
        background: AX_SOFT[s.axis],
        border: `1px solid color-mix(in srgb,${AX[s.axis]} 40%,transparent)`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 3,
        borderRadius: 2,
        background: AX[s.axis],
        flex: 'none',
        alignSelf: 'stretch'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 0,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: UI,
        fontSize: 9.5,
        fontWeight: 600,
        color: T.fg,
        lineHeight: 1.25,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, s.title), /*#__PURE__*/React.createElement(Mono, {
      size: 7.5,
      style: {
        display: 'block',
        marginTop: 2
      }
    }, s.sH, ":00 \xB7 ", fmtDur(s.dH))))))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FieldLbl, {
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
        size: 8.5
      }, "m\xE5l \xB7 Spesialisering"))
    }, "Effekt p\xE5 uke ", weekNo), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, AXIS_LIST.map(ax => {
      const p0 = pct(min0[ax], tot0),
        p1 = pct(min1[ax], tot1),
        m = MAAL[ax] || 0;
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
        color: T.fg,
        style: {
          width: 34,
          flex: 'none'
        }
      }, ax), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          position: 'relative',
          height: 13,
          borderRadius: 4,
          background: T.raised,
          overflow: 'hidden'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          inset: '0 auto 0 0',
          width: `${Math.min(100, p1)}%`,
          borderRadius: 4,
          background: AX[ax],
          opacity: 0.9
        }
      }), /*#__PURE__*/React.createElement("div", {
        title: `mål ${m}%`,
        style: {
          position: 'absolute',
          left: `calc(${Math.min(100, m)}% - 1px)`,
          top: -1,
          bottom: -1,
          width: 2,
          background: T.fg,
          boxShadow: `0 0 0 1px ${T.card}`
        }
      })), /*#__PURE__*/React.createElement("span", {
        style: {
          width: 76,
          textAlign: 'right',
          flex: 'none',
          whiteSpace: 'nowrap'
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        size: 9
      }, p0, "% \u2192 "), /*#__PURE__*/React.createElement(Mono, {
        size: 9.5,
        weight: 700,
        color: T.fg
      }, p1, "%")), /*#__PURE__*/React.createElement(Mono, {
        size: 8.5,
        style: {
          width: 26,
          flex: 'none'
        }
      }, "/", m));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 11
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.fg,
      style: {
        width: 58,
        flex: 'none'
      }
    }, "Volum"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        position: 'relative',
        height: 13,
        borderRadius: 4,
        background: T.raised,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: '0 auto 0 0',
        width: `${Math.min(100, vol1 / TAK * 100)}%`,
        borderRadius: 4,
        background: vol1 > TAK ? T.amber : `color-mix(in srgb,${T.fg} 45%,transparent)`
      }
    }), /*#__PURE__*/React.createElement("div", {
      title: `før · ${fmt1(vol0)} t`,
      style: {
        position: 'absolute',
        left: `calc(${Math.min(100, vol0 / TAK * 100)}% - 1px)`,
        top: -1,
        bottom: -1,
        width: 2,
        background: T.fg,
        boxShadow: `0 0 0 1px ${T.card}`
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 'none',
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9
    }, fmt1(vol0), " \u2192 "), /*#__PURE__*/React.createElement(Mono, {
      size: 9.5,
      weight: 700,
      color: vol1 > TAK ? T.amber : T.fg
    }, fmt1(vol1), " t"), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5
    }, " / ", TAK, " t")))), avvik.length ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 9,
        padding: '10px 12px',
        borderRadius: 10,
        background: `color-mix(in srgb,${T.amber} 8%,${T.raised})`,
        border: `1px solid color-mix(in srgb,${T.amber} 40%,${T.border})`
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "triangle-alert",
      size: 14,
      style: {
        color: T.amber,
        flex: 'none',
        marginTop: 1
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.amber,
      style: {
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        display: 'block',
        marginBottom: 4
      }
    }, "Avviker fra anbefaling"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: UI,
        fontSize: 11.5,
        color: T.fg,
        lineHeight: 1.5
      }
    }, avvik.join(' '), " Ingenting blokkeres \u2014 avviket vises i Plan-kvalitet som informasjon."))) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-check",
      size: 13,
      style: {
        color: T.muted,
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: UI,
        fontSize: 11.5,
        color: T.muted
      }
    }, "Innenfor anbefaling \u2014 malen holder ukens ramme."))));
  }
  window.WBCOMP = {
    SessionComposer,
    LibraryGallery,
    MalDetalj,
    fmtDur
  };
})();
})(); 