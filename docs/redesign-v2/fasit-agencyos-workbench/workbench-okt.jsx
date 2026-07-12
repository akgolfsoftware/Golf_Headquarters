// FASIT-REFERANSE (ekstrahert fra Claude Design offline-eksport 2026-07-12)
// Original sti: ui_kits/agencyos/workbench-okt.jsx
// KUN referanse for v2-ombygging — importeres ALDRI av appen.

try { (() => {
/* AK Golf HQ — Workbench ØKT-zoom (session-niveau).
   Drill-tidslinje (tid · drill · område) + integrert AK-formel/CANON-inspektør
   (gjenbruker window.WBZ.Inspector). Eksporterer window.WBOKT. */
(function () {
  const {
    Icon
  } = window.AKGolfHQDesignSystem_bb9b2b;
  const D = window.WBDATA;
  const Z = window.WBZ;
  const {
    T,
    AX,
    AX_SOFT
  } = D;
  const {
    Mono,
    Chip,
    Inspector
  } = Z;
  const UI = 'Inter,system-ui,sans-serif',
    DISP = 'Familjen Grotesk,Inter,system-ui,sans-serif',
    MONO = 'JetBrains Mono,ui-monospace,monospace';
  const hhmm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.round(m % 60)).padStart(2, '0');
  const csNum = cs => parseInt(String(cs).replace(/\D/g, ''), 10) || 50;

  /* Presentasjons-fokus pr. kjent drill (merker eksisterende driller — ikke ny data) */
  const DRILL_FOCUS = {
    'Hip-hinge': 'Hofteledd-mobilitet og rotasjonskraft',
    'Rotasjon': 'Sekvensering hofte → torso',
    'Gate-drill': 'Startlinje og ansiktskontroll på putt',
    'Face-to-path': 'Ansikt-til-bane gjennom treff',
    'Impact bag': 'Treffposisjon og håndleddsvinkel',
    'Bunker-rake': 'Sandkontakt og utløpshastighet',
    'Chip-ladder': 'Distansekontroll i chip',
    '18-hull scoring': 'Scoring, strategi og beslutninger',
    '9-hull scoring': 'Scoring, strategi og beslutninger'
  };
  const AREA_FOCUS = {
    FYS: 'Fysisk kapasitet og bevegelse',
    TEK: 'Teknisk slagkvalitet',
    SLAG: 'Slag- og distansekontroll',
    SPILL: 'Banespill og scoring',
    TURN: 'Turnerings- og kamprutine'
  };
  const focusFor = (name, area) => DRILL_FOCUS[name] || AREA_FOCUS[area] || 'Fokusert økt-arbeid';
  function MetaPill({
    icon,
    children,
    color
  }) {
    return /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        height: 24,
        padding: '0 9px',
        borderRadius: 9999,
        background: T.raised,
        border: `1px solid ${T.border}`
      }
    }, icon && /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 12,
      style: {
        color: color || T.muted
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10,
        fontWeight: 600,
        color: color || T.fg
      }
    }, children));
  }

  /* ── Ett drill-blokk på tidslinjen ────────────────────── */
  function DrillBlock({
    block,
    area,
    cs,
    readOnly,
    broken,
    last
  }) {
    const edge = broken ? T.redSolid : AX[area];
    const intensity = csNum(cs);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 13,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 46,
        flex: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        paddingTop: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 12,
        fontWeight: 700,
        color: T.fg
      }
    }, hhmm(block.start)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        color: T.muted,
        marginTop: 3
      }
    }, Math.round(block.min), "m")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        width: 14,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 11,
        height: 11,
        borderRadius: 9999,
        background: edge,
        border: `2px solid ${T.base}`,
        boxShadow: `0 0 0 1px ${edge}`,
        flex: 'none',
        marginTop: 3
      }
    }), !last && /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        width: 2,
        background: T.border,
        marginTop: 2
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        marginBottom: 10,
        borderRadius: 12,
        overflow: 'hidden',
        background: AX_SOFT[area],
        border: `1px solid ${broken ? T.redSolid : `color-mix(in srgb,${AX[area]} 42%,transparent)`}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex'
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
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0,
        fontFamily: DISP,
        fontWeight: 600,
        fontSize: 15,
        color: T.fg,
        lineHeight: 1.25,
        textWrap: 'pretty'
      }
    }, block.name), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        paddingTop: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        fontWeight: 700,
        color: AX[area],
        background: `color-mix(in srgb,${AX[area]} 15%,transparent)`,
        padding: '2px 6px',
        borderRadius: 4
      }
    }, area), readOnly ? /*#__PURE__*/React.createElement(Icon, {
      name: "lock",
      size: 12,
      style: {
        color: T.muted
      }
    }) : /*#__PURE__*/React.createElement(Icon, {
      name: "grip-vertical",
      size: 13,
      style: {
        color: T.muted
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: UI,
        fontSize: 12,
        color: T.muted,
        lineHeight: 1.45,
        marginTop: 5
      }
    }, focusFor(block.name, area)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        marginTop: 9
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        color: T.muted
      }
    }, "Intensitet"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        maxWidth: 120,
        height: 5,
        borderRadius: 3,
        background: T.raised,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        width: `${intensity}%`,
        height: '100%',
        background: edge
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 9,
        fontWeight: 700,
        color: T.fg
      }
    }, cs), broken && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "triangle-alert",
      size: 12,
      style: {
        color: T.redSolid
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.red
    }, "brudd")))))));
  }

  /* ── Økt-zoom canvas (senter) + Inspector (høyre) ─────── */
  function SessionZoom({
    role,
    session,
    brudd,
    override,
    onChangeFormel,
    onOverride,
    onBack,
    onRemove,
    onDuplicate,
    onSaveTemplate,
    onRepeat
  }) {
    const isCoach = role === 'coach';
    if (!session) return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        minHeight: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: T.base,
        padding: 30
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 360,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 52,
        height: 52,
        borderRadius: 14,
        background: T.raised,
        border: `1px dashed ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "target",
      size: 23,
      style: {
        color: T.muted
      }
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: DISP,
        fontWeight: 700,
        fontSize: 18,
        color: T.fg
      }
    }, "Ingen \xF8kt valgt"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: UI,
        fontSize: 13,
        color: T.muted,
        lineHeight: 1.6,
        margin: '7px 0 0'
      }
    }, "G\xE5 til Uke og velg en \xF8kt for \xE5 \xE5pne \xF8kt-editoren.")), /*#__PURE__*/React.createElement("button", {
      onClick: onBack,
      style: {
        height: 36,
        padding: '0 16px',
        borderRadius: 9,
        background: T.raised,
        border: `1px solid ${T.border}`,
        color: T.fg,
        fontFamily: UI,
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar",
      size: 15
    }), "\xC5pne Uke"))));
    const drills = session.drills || [];
    const totalMin = session.dH * 60;
    const per = drills.length ? totalMin / drills.length : totalMin;
    let cur = session.sH * 60;
    const blocks = drills.map(d => {
      const start = cur;
      cur += per;
      return {
        name: d,
        start,
        end: cur,
        min: per
      };
    });
    const broken = brudd && brudd.alv === 'hard' && !override;
    const dayName = D.DAYS[session.day],
      dayDate = D.DATES[session.day];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        minHeight: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        background: T.base,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        padding: '15px 20px 14px',
        borderBottom: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 11,
        height: 11,
        borderRadius: 3,
        background: AX[session.pyramidArea],
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }
    }, dayName, " ", dayDate, ". juni \xB7 ", hhmm(session.sH * 60), "\u2013", hhmm((session.sH + session.dH) * 60))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: DISP,
        fontWeight: 700,
        fontSize: 22,
        color: T.fg,
        letterSpacing: '-0.01em',
        margin: '7px 0 9px'
      }
    }, session.title), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 7,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement(MetaPill, {
      icon: "map-pin"
    }, session.loc), /*#__PURE__*/React.createElement(MetaPill, {
      icon: "clock"
    }, session.dH >= 1 ? session.dH + 't' : session.dH * 60 + 'm'), /*#__PURE__*/React.createElement(MetaPill, {
      icon: "gauge",
      color: AX[session.pyramidArea]
    }, session.csNivaa), /*#__PURE__*/React.createElement(MetaPill, {
      icon: "layers"
    }, session.miljo), session.done ? /*#__PURE__*/React.createElement(MetaPill, {
      icon: "circle-check",
      color: T.lime
    }, "Gjennomf\xF8rt") : /*#__PURE__*/React.createElement(MetaPill, {
      icon: "circle",
      color: T.muted
    }, "Planlagt"), session.recur && /*#__PURE__*/React.createElement(MetaPill, {
      icon: "repeat",
      color: T.lime
    }, "Gjentar \xB7 ", session.recur.summary))), isCoach && /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onDuplicate && onDuplicate(session),
      title: "Dupliser til annen dag/uke",
      style: {
        height: 32,
        padding: '0 12px',
        borderRadius: 8,
        background: 'transparent',
        border: `1px solid ${T.border}`,
        color: T.fg,
        fontFamily: UI,
        fontSize: 12.5,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "copy",
      size: 13
    }), "Dupliser"), /*#__PURE__*/React.createElement("button", {
      onClick: () => onSaveTemplate && onSaveTemplate(session),
      title: "Lagre som standard\xF8kt i biblioteket",
      style: {
        height: 32,
        padding: '0 12px',
        borderRadius: 8,
        background: 'transparent',
        border: `1px solid ${T.border}`,
        color: T.fg,
        fontFamily: UI,
        fontSize: 12.5,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "download",
      size: 13
    }), "Lagre"), /*#__PURE__*/React.createElement("button", {
      onClick: () => onRepeat && onRepeat(session),
      title: "Sett opp gjentagelse",
      style: {
        height: 32,
        padding: '0 12px',
        borderRadius: 8,
        background: 'transparent',
        border: `1px solid ${T.border}`,
        color: T.fg,
        fontFamily: UI,
        fontSize: 12.5,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "repeat",
      size: 13
    }), "Gjenta"), /*#__PURE__*/React.createElement("button", {
      onClick: onRemove,
      title: "Fjern \xF8kt fra plan",
      style: {
        height: 32,
        padding: '0 12px',
        borderRadius: 8,
        background: 'transparent',
        border: `1px solid #CD6057`,
        color: T.red,
        fontFamily: UI,
        fontSize: 12.5,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "trash-2",
      size: 14
    }), "Fjern")))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px 18px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 13
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        letterSpacing: '0.12em',
        textTransform: 'uppercase'
      }
    }, "Drill-tidslinje"), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, blocks.length, " ", blocks.length === 1 ? 'drill' : 'driller', " \xB7 ", session.dH >= 1 ? session.dH + 't' : totalMin + 'm')), blocks.length ? /*#__PURE__*/React.createElement(React.Fragment, null, blocks.map((b, i) => /*#__PURE__*/React.createElement(DrillBlock, {
      key: i,
      block: b,
      area: session.pyramidArea,
      cs: session.csNivaa,
      readOnly: !isCoach,
      broken: broken && i === 0,
      last: i === blocks.length - 1 && !isCoach
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 13
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 46,
        flex: 'none',
        textAlign: 'right'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 11,
        fontWeight: 700,
        color: T.muted
      }
    }, hhmm((session.sH + session.dH) * 60))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        width: 14,
        display: 'flex',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: 9999,
        background: T.border,
        marginTop: 3
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, "Slutt")))) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        height: 54,
        padding: '0 14px',
        borderRadius: 12,
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
    }, "Ingen driller lagt til enn\xE5.")), isCoach && /*#__PURE__*/React.createElement("button", {
      style: {
        width: '100%',
        marginTop: 6,
        height: 40,
        borderRadius: 10,
        border: `1px dashed ${T.border}`,
        background: 'transparent',
        color: T.muted,
        fontFamily: UI,
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 15
    }), "Legg til drill fra bibliotek"), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 18,
        paddingTop: 16,
        borderTop: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 11
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        letterSpacing: '0.12em',
        textTransform: 'uppercase'
      }
    }, "Analyse \xB7 datagrunnlag"), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted
    }, "\xE5pner i Analyse-flaten")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8
      }
    }, D.ANALYSE_LENKER.map(l => /*#__PURE__*/React.createElement("button", {
      key: l.key,
      title: `Åpne ${l.label}`,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '9px 11px',
        borderRadius: 10,
        background: T.raised,
        border: `1px solid ${T.border}`,
        cursor: 'pointer',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 30,
        height: 30,
        borderRadius: 8,
        flex: 'none',
        background: `color-mix(in srgb,${AX[session.pyramidArea]} 13%,${T.base})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: l.icon,
      size: 15,
      style: {
        color: T.fg
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: DISP,
        fontWeight: 600,
        fontSize: 13,
        color: T.fg
      }
    }, l.label), /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-up-right",
      size: 12,
      style: {
        color: T.muted
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: MONO,
        fontSize: 8.5,
        color: T.muted,
        marginTop: 3,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, l.meta)))))))), /*#__PURE__*/React.createElement(Inspector, {
      role: role,
      session: session,
      brudd: brudd,
      override: override,
      onChangeFormel: onChangeFormel,
      onOverride: onOverride
    }));
  }
  window.WBOKT = {
    SessionZoom
  };
})();
})(); 