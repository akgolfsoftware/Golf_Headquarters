// FASIT-REFERANSE (ekstrahert fra Claude Design offline-eksport 2026-07-12)
// Original sti: ui_kits/agencyos/workbench-app.jsx
// KUN referanse for v2-ombygging — importeres ALDRI av appen.

try { (() => {
/* AK Golf HQ — Workbench app: top band, role logic, lifecycle, wiring. */
(function () {
  const {
    Icon,
    AnbefalingsKort
  } = window.AKGolfHQDesignSystem_bb9b2b;
  const D = window.WBDATA;
  const Z = window.WBZ;
  const {
    T,
    AX,
    SCENARIOS,
    PLAN_STATUS,
    validatePlan,
    hardOpen
  } = D;
  const {
    Mono,
    KpiChip,
    ZoomPill,
    SegToggle,
    Palette,
    TimeGrid,
    Inspector,
    ContextPanels,
    BunnSone,
    BruddListe,
    Arsplan
  } = Z;
  const {
    SessionZoom
  } = window.WBOKT;
  const {
    BalanseRail
  } = window.WBRAIL;
  const {
    MaanedZoom
  } = window.WBMND;
  const {
    SessionComposer,
    LibraryGallery,
    MalDetalj
  } = window.WBCOMP;
  const parseDurStr = s => {
    if (!s) return 1;
    const m = /([\d.]+)\s*min/.exec(s);
    if (m) return parseFloat(m[1]) / 60;
    const t = /([\d.]+)\s*t/.exec(s);
    if (t) return parseFloat(t[1]);
    return 1;
  };

  /* ── Small action button ────────────────────────────────── */
  function BtnSm({
    icon,
    children,
    variant,
    onClick,
    disabled,
    title
  }) {
    const lime = variant === 'lime',
      red = variant === 'red';
    return /*#__PURE__*/React.createElement("button", {
      onClick: onClick,
      disabled: disabled,
      title: title,
      style: {
        height: 30,
        padding: '0 12px',
        borderRadius: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
        background: disabled ? T.raised : lime ? T.lime : 'transparent',
        color: disabled ? T.muted : lime ? T.base : red ? T.red : T.fg,
        border: `1px solid ${disabled ? T.border : lime ? T.lime : red ? '#CD6057' : T.border}`,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12,
        fontWeight: 600,
        opacity: disabled ? 0.6 : 1,
        transition: 'all 120ms'
      }
    }, icon && /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 14
    }), children);
  }

  /* ── Diff overlay (AI-foreslått endring) ────────────────── */
  function DiffCol({
    title,
    tone,
    rows
  }) {
    const cTxt = tone === 'red' ? T.red : T.lime;
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: tone === 'red' ? 'minus' : 'plus',
      size: 13,
      style: {
        color: cTxt
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: cTxt,
      style: {
        letterSpacing: '0.1em'
      }
    }, title)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        gap: 9,
        padding: '9px 11px',
        borderRadius: 9,
        background: tone === 'red' ? 'rgba(229,72,77,.07)' : `color-mix(in srgb,${T.lime} 7%,transparent)`,
        border: `1px solid ${tone === 'red' ? 'rgba(229,72,77,.3)' : `color-mix(in srgb,${T.lime} 30%,transparent)`}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 3,
        borderRadius: 2,
        background: AX[r.ax],
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 13,
        fontWeight: 600,
        color: T.fg,
        textDecoration: tone === 'red' ? 'line-through' : 'none',
        opacity: tone === 'red' ? 0.7 : 1
      }
    }, r.t), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        marginTop: 2
      }
    }, r.ax, " \xB7 ", r.meta))))));
  }
  function DiffOverlay({
    role,
    onClose,
    onAccept
  }) {
    const removed = [{
      t: 'Banespill — 18 hull',
      ax: 'SPILL',
      meta: 'Lør 09:00 · 4t · CS50'
    }];
    const added = [{
      t: 'Innspill 150–175 m',
      ax: 'SLAG',
      meta: 'Lør 09:00 · 1,5t · CS50'
    }, {
      t: 'Teknikk — face-to-path',
      ax: 'TEK',
      meta: 'Lør 11:00 · 1t · CS50'
    }];
    const impact = [{
      k: 'ACWR',
      a: '1,22',
      b: '1,14',
      good: true
    }, {
      k: 'TEK-andel',
      a: '13%',
      b: '17%',
      good: true
    }, {
      k: 'Plan-kvalitet',
      a: '72',
      b: '87',
      good: true
    }, {
      k: 'Volum',
      a: '12t',
      b: '10,5t',
      good: false
    }];
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        background: 'rgba(4,5,4,.7)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: 680,
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
        padding: '16px 20px',
        borderBottom: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "sparkles",
      size: 16,
      style: {
        color: T.lime
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'Familjen Grotesk,Inter,system-ui,sans-serif',
        fontWeight: 700,
        fontSize: 15,
        color: T.fg
      }
    }, role === 'coach' ? 'AI-foreslått endring' : 'AI-periodisering — forslag'), /*#__PURE__*/React.createElement(Mono, {
      size: 10
    }, "L\xF8rdag \xB7 uke 25 \xB7 \xD8yvind Rohjan"))), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      style: {
        width: 30,
        height: 30,
        borderRadius: 8,
        background: T.raised,
        border: `1px solid ${T.border}`,
        color: T.muted,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 15
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 20px',
        borderBottom: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement(AnbefalingsKort, {
      kompakt: true,
      hvorfor: /*#__PURE__*/React.createElement("span", null, "\xD8yvind taper ", /*#__PURE__*/React.createElement("b", {
        style: {
          color: T.fg
        }
      }, "\u22121,4 SG"), " p\xE5 innspill 150\u2013175 m og ligger under pyramide-minstekrav for TEK."),
      hva: "Bytt l\xF8rdagens fulle runde med m\xE5lrettet innspills- og teknikkarbeid (CS50).",
      effekt: "Plan-kvalitet 72 \u2192 87 \xB7 TEK-andel 13 % \u2192 17 % \xB7 ACWR 1,22 \u2192 1,14.",
      hvorforNaa: "Siste uke f\xF8r kretsspill \u2014 endringen rekker \xE5 virke f\xF8r turnering."
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(DiffCol, {
      title: "FJERNES",
      tone: "red",
      rows: removed
    }), /*#__PURE__*/React.createElement(DiffCol, {
      title: "LEGGES TIL",
      tone: "lime",
      rows: added
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 20px',
        borderTop: `1px solid ${T.border}`,
        display: 'flex'
      }
    }, impact.map((m, i) => /*#__PURE__*/React.createElement("div", {
      key: m.k,
      style: {
        flex: 1,
        paddingLeft: i ? 14 : 0,
        borderLeft: i ? `1px solid ${T.border}` : 'none'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        display: 'block',
        marginBottom: 4
      }
    }, m.k), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 12,
      color: T.muted
    }, m.a), /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 11,
      style: {
        color: T.muted
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 13,
      weight: 700,
      color: m.good ? T.lime : T.amber
    }, m.b))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 8,
        padding: '14px 20px',
        borderTop: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      style: {
        height: 34,
        padding: '0 16px',
        borderRadius: 8,
        background: 'transparent',
        border: `1px solid ${T.border}`,
        color: T.muted,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer'
      }
    }, role === 'coach' ? 'Avvis' : 'Lukk'), role === 'coach' && /*#__PURE__*/React.createElement("button", {
      onClick: onAccept,
      style: {
        height: 34,
        padding: '0 16px',
        borderRadius: 8,
        background: T.lime,
        border: 'none',
        color: T.base,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 14
    }), "Bruk forslag"))));
  }

  /* ── Cold-start (coach) ─────────────────────────────────── */
  /* Publiser-bekreftelse (coach → spiller) */
  function PubliserDialog({
    spiller,
    surname,
    week,
    sessions,
    score,
    brudd,
    overrides,
    onConfirm,
    onClose
  }) {
    const okter = sessions.length;
    let total = 0,
      tekMin = 0;
    sessions.forEach(s => {
      const m = (s.dH || 0) * 60;
      total += m;
      if (s.pyramidArea === 'TEK') tekMin += m;
    });
    const volT = (total / 60).toFixed(1).replace('.', ',');
    const tekPct = total ? Math.round(tekMin / total * 100) : 0;
    const overridden = brudd.filter(b => overrides[b.id]);
    const scoreC = score >= 85 ? T.lime : score >= 70 ? T.amber : T.red;
    const Stat = ({
      label,
      value,
      color
    }) => /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        padding: '11px 13px',
        background: T.raised,
        border: `1px solid ${T.border}`,
        borderRadius: 11
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      style: {
        textTransform: 'uppercase',
        letterSpacing: '0.07em'
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 18,
        fontWeight: 700,
        color: color || T.fg,
        marginTop: 7,
        letterSpacing: '-0.02em'
      }
    }, value));
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 45,
        background: 'rgba(4,5,4,.72)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: 540,
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
        padding: '16px 20px',
        borderBottom: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 34,
        height: 34,
        borderRadius: 10,
        background: `color-mix(in srgb,${T.lime} 16%,${T.raised})`,
        border: `1px solid color-mix(in srgb,${T.lime} 38%,transparent)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "send",
      size: 16,
      style: {
        color: T.lime
      }
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'Familjen Grotesk,Inter,system-ui,sans-serif',
        fontWeight: 700,
        fontSize: 15,
        color: T.fg
      }
    }, "Publiser uke til spiller"), /*#__PURE__*/React.createElement(Mono, {
      size: 10
    }, spiller, " ", surname, " \xB7 Uke ", week))), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      style: {
        width: 30,
        height: 30,
        borderRadius: 8,
        background: T.raised,
        border: `1px solid ${T.border}`,
        color: T.muted,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 15
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '13px 20px',
        borderBottom: `1px solid ${T.border}`,
        background: `color-mix(in srgb,${T.amber} 5%,${T.card})`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 24,
        padding: '0 10px',
        borderRadius: 9999,
        background: `color-mix(in srgb,${T.muted} 14%,transparent)`,
        border: `1px solid color-mix(in srgb,${T.muted} 40%,transparent)`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: 9999,
        background: T.muted
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        textTransform: 'uppercase'
      }
    }, "Utkast")), /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 14,
      style: {
        color: T.muted
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 24,
        padding: '0 10px',
        borderRadius: 9999,
        background: `color-mix(in srgb,${T.amber} 14%,transparent)`,
        border: `1px solid color-mix(in srgb,${T.amber} 45%,transparent)`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: 9999,
        background: T.amber
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.amber,
      style: {
        textTransform: 'uppercase'
      }
    }, "Venter p\xE5 spiller"))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 9
      }
    }, /*#__PURE__*/React.createElement(Stat, {
      label: "\xD8kter",
      value: okter
    }), /*#__PURE__*/React.createElement(Stat, {
      label: "Ukevolum",
      value: volT + 't'
    }), /*#__PURE__*/React.createElement(Stat, {
      label: "Plan-kvalitet",
      value: score,
      color: scoreC
    }), /*#__PURE__*/React.createElement(Stat, {
      label: "TEK-andel",
      value: tekPct + '%',
      color: tekPct < 15 ? T.red : T.fg
    })), overridden.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        borderRadius: 12,
        border: `1px solid color-mix(in srgb,${T.lime} 30%,${T.border})`,
        background: `color-mix(in srgb,${T.lime} 6%,transparent)`,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 13px'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "shield",
      size: 13,
      style: {
        color: T.lime
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.lime,
      style: {
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      }
    }, overridden.length, " overstyring", overridden.length > 1 ? 'er' : '', " logges med planen")), overridden.map(b => /*#__PURE__*/React.createElement("div", {
      key: b.id,
      style: {
        padding: '10px 13px',
        borderTop: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12.5,
        fontWeight: 600,
        color: T.fg
      }
    }, b.navn), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        display: 'block',
        marginTop: 5
      }
    }, "Begrunnelse: \xAB", overrides[b.id], "\xBB")))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 10,
        padding: '12px 14px',
        borderRadius: 11,
        background: T.raised,
        border: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      size: 15,
      style: {
        color: T.muted,
        flex: 'none',
        marginTop: 1
      }
    }), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12.5,
        color: T.muted,
        lineHeight: 1.55
      }
    }, spiller, " f\xE5r varsel og kan godkjenne eller avvise uka. Du ser status i Workbench og Innboks."))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 8,
        padding: '14px 20px',
        borderTop: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      style: {
        height: 36,
        padding: '0 16px',
        borderRadius: 9,
        background: 'transparent',
        border: `1px solid ${T.border}`,
        color: T.muted,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer'
      }
    }, "Avbryt"), /*#__PURE__*/React.createElement("button", {
      onClick: onConfirm,
      style: {
        height: 36,
        padding: '0 18px',
        borderRadius: 9,
        background: T.lime,
        border: 'none',
        color: T.base,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "send",
      size: 15
    }), "Publiser til spiller"))));
  }

  /* Fase 5.1 — forhåndsutfylt, redigerbart AI-utkast (ikke tomt lerret, ikke config-form).
     AK-formel-baserte forslag fra kategori + siste test + fase, presentert som redigerbare
     kort med ett-klikk godta/forkast per blokk. To-talls-regelen (Plan-kvalitet + Gjennomføring)
     dominerer. CANON-validering synlig UNDER bygging: forkast teknikk-blokka → TEK under
     minstekrav → hardt brudd + Plan-kvalitet faller live. */
  function ColdStart({
    player,
    onGenerate
  }) {
    const SUGGEST = [{
      id: 's1',
      axis: 'FYS',
      trinn: 'Trinn 1 · Kropp',
      arena: 'M0 · Innendørs',
      cs: 'CS50',
      dur: '1,5t',
      title: 'Styrke & mobilitet',
      why: 'Fundament i en rolig uke — holder ACWR i trygg sone før kretsspill.'
    }, {
      id: 's2',
      axis: 'TEK',
      trinn: 'Trinn 4 · Ball',
      arena: 'M2 · Range med mål',
      cs: 'CS60',
      dur: '1t',
      title: 'Teknikk — face-to-path',
      why: 'Hever TEK over pyramide-minstekravet 15 % for Spesialisering.',
      req: true
    }, {
      id: 's3',
      axis: 'SLAG',
      trinn: 'Trinn 4 · Ball',
      arena: 'M2 · Range med mål',
      cs: 'CS60',
      dur: '1t',
      title: 'Innspill 150–175 m',
      why: 'Størst SG-tap akkurat nå — APP −1,4 mot benchmark.'
    }, {
      id: 's4',
      axis: 'SLAG',
      trinn: 'Trinn 5 · Auto',
      arena: 'M2 · Range med mål',
      cs: 'CS50',
      dur: '45 min',
      title: 'Putting innenfor 6 ft',
      why: 'Låser en styrke (PUTT +1,8) under press.'
    }, {
      id: 's5',
      axis: 'SPILL',
      trinn: 'Trinn 5 · Auto',
      arena: 'M4 · Bane test',
      cs: 'CS90',
      dur: '2t',
      title: 'Banespill — 9 hull',
      why: 'Bane test med scoring, 13 uker før NM Junior.'
    }];
    const [keep, setKeep] = React.useState(() => {
      const o = {};
      SUGGEST.forEach(s => {
        o[s.id] = true;
      });
      return o;
    });
    const [busy, setBusy] = React.useState(false);
    const toggle = id => setKeep(p => ({
      ...p,
      [id]: !p[id]
    }));
    const accepted = SUGGEST.filter(s => keep[s.id]);
    const tekKept = accepted.some(s => s.axis === 'TEK');
    const hardBrudd = !tekKept; // forkastet teknikk → TEK-min hardt brudd
    const score = Math.max(0, 100 - (hardBrudd ? 14 : 0) - (accepted.length < 3 ? 6 : 0));
    const scoreC = score >= 85 ? T.lime : score >= 70 ? T.amber : T.red;
    const run = () => {
      setBusy(true);
      setTimeout(() => onGenerate && onGenerate(), 900);
    };
    const Chip = ({
      children,
      color
    }) => /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        height: 20,
        padding: '0 8px',
        borderRadius: 6,
        background: T.raised,
        border: `1px solid ${T.border}`,
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 9,
        fontWeight: 700,
        color: color || T.muted,
        letterSpacing: '0.03em'
      }
    }, children);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        background: T.base,
        padding: '26px 30px 40px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 920,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 18,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 280
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        height: 24,
        padding: '0 10px',
        borderRadius: 9999,
        background: `color-mix(in srgb,${T.lime} 14%,transparent)`,
        border: `1px solid color-mix(in srgb,${T.lime} 40%,transparent)`,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "sparkles",
      size: 13,
      style: {
        color: T.lime
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.lime,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }
    }, "AI-forslag \xB7 utkast")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'Familjen Grotesk,Inter,system-ui,sans-serif',
        fontWeight: 700,
        fontSize: 23,
        letterSpacing: '-0.02em',
        color: T.fg
      }
    }, "Utkast til uke 25 for ", player), /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      color: T.muted,
      style: {
        display: 'block',
        marginTop: 9,
        lineHeight: 1.7
      }
    }, "Basert p\xE5 Kategori A \xB7 siste PEI-batteri (78/100) \xB7 Spesialiserings-fase \xB7 NM Junior om 13 uker.", /*#__PURE__*/React.createElement("br", null), "Alt er redigerbart \u2014 godta, forkast eller juster hver blokk f\xF8r du bygger uka.")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        display: 'flex',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 134,
        padding: '13px 15px',
        borderRadius: 14,
        background: `color-mix(in srgb,${scoreC} 9%,${T.card})`,
        border: `1px solid color-mix(in srgb,${scoreC} 38%,transparent)`
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      style: {
        textTransform: 'uppercase',
        letterSpacing: '0.1em'
      }
    }, "Plan-kvalitet"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 40,
        fontWeight: 700,
        color: scoreC,
        letterSpacing: '-0.03em',
        lineHeight: 1,
        marginTop: 8
      }
    }, score), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: hardBrudd ? T.red : T.muted,
      style: {
        display: 'block',
        marginTop: 8
      }
    }, hardBrudd ? '1 sterkt avvik' : 'innenfor anbefaling')), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 134,
        padding: '13px 15px',
        borderRadius: 14,
        background: T.card,
        border: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      style: {
        textTransform: 'uppercase',
        letterSpacing: '0.1em'
      }
    }, "Gjennomf\xF8ring"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 40,
        fontWeight: 700,
        color: T.muted,
        letterSpacing: '-0.03em',
        lineHeight: 1,
        marginTop: 8
      }
    }, "0", /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16
      }
    }, "%")), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        display: 'block',
        marginTop: 8
      }
    }, "0 av ", accepted.length, " \xF8kter")))), hardBrudd && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '10px 13px',
        borderRadius: 11,
        background: 'rgba(229,72,77,.08)',
        border: `1px solid rgba(229,72,77,.32)`
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-x",
      size: 15,
      style: {
        color: T.red,
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12.5,
        color: T.fg,
        lineHeight: 1.45
      }
    }, "TEK 8 % under minstekravet 15 % \u2014 sterkt avvik. Legg tilbake en teknikk-blokk, eller publiser som det er (trekket i Plan-kvalitet best\xE5r, coach varsles automatisk).")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 9
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        letterSpacing: '0.12em',
        textTransform: 'uppercase'
      }
    }, "Foresl\xE5tte \xF8kter \xB7 ", accepted.length, " av ", SUGGEST.length, " godtatt"), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, "+ 2 hviledager anbefalt")), SUGGEST.map(s => {
      const on = keep[s.id];
      return /*#__PURE__*/React.createElement("div", {
        key: s.id,
        style: {
          display: 'flex',
          alignItems: 'stretch',
          borderRadius: 12,
          overflow: 'hidden',
          background: T.card,
          border: `1px solid ${on ? T.border : 'transparent'}`,
          opacity: on ? 1 : 0.5,
          transition: 'opacity 160ms var(--ease-standard, ease)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 3,
          background: AX[s.axis],
          flex: 'none'
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0,
          padding: '12px 14px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          flexWrap: 'wrap',
          marginBottom: 8
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'Inter,system-ui,sans-serif',
          fontSize: 14,
          fontWeight: 600,
          color: T.fg,
          textDecoration: on ? 'none' : 'line-through'
        }
      }, s.title), s.req && /*#__PURE__*/React.createElement(Mono, {
        size: 8,
        color: T.amber,
        style: {
          letterSpacing: '0.06em'
        }
      }, "KANON-KRITISK")), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          marginBottom: 8
        }
      }, /*#__PURE__*/React.createElement(Chip, {
        color: AX[s.axis]
      }, s.axis), /*#__PURE__*/React.createElement(Chip, null, s.trinn), /*#__PURE__*/React.createElement(Chip, null, s.arena), /*#__PURE__*/React.createElement(Chip, null, s.cs), /*#__PURE__*/React.createElement(Chip, null, s.dur)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 7,
          color: T.muted
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "sparkles",
        size: 12,
        style: {
          color: T.lime,
          flex: 'none',
          marginTop: 1
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'Inter,system-ui,sans-serif',
          fontSize: 12,
          lineHeight: 1.5
        }
      }, s.why))), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          borderLeft: `1px solid ${T.border}`
        }
      }, on ? /*#__PURE__*/React.createElement("button", {
        onClick: () => toggle(s.id),
        title: "Forkast forslag",
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          height: 30,
          padding: '0 12px',
          borderRadius: 8,
          cursor: 'pointer',
          background: `color-mix(in srgb,${T.lime} 13%,transparent)`,
          border: `1px solid color-mix(in srgb,${T.lime} 38%,transparent)`,
          color: T.lime,
          fontFamily: 'Inter,system-ui,sans-serif',
          fontSize: 12,
          fontWeight: 600
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "check",
        size: 14
      }), "Godtatt") : /*#__PURE__*/React.createElement("button", {
        onClick: () => toggle(s.id),
        title: "Legg tilbake",
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          height: 30,
          padding: '0 12px',
          borderRadius: 8,
          cursor: 'pointer',
          background: 'transparent',
          border: `1px solid ${T.border}`,
          color: T.muted,
          fontFamily: 'Inter,system-ui,sans-serif',
          fontSize: 12,
          fontWeight: 600
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "rotate-ccw",
        size: 13
      }), "Angre")));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
        paddingTop: 2
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: run,
      disabled: busy || accepted.length === 0,
      style: {
        height: 44,
        padding: '0 20px',
        borderRadius: 11,
        border: 'none',
        cursor: busy || !accepted.length ? 'default' : 'pointer',
        background: accepted.length ? T.lime : T.raised,
        color: accepted.length ? T.base : T.muted,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 14,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        opacity: busy ? 0.8 : 1
      }
    }, busy ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 15,
        height: 15,
        border: `2px solid ${T.base}`,
        borderTopColor: 'transparent',
        borderRadius: 9999,
        display: 'inline-block',
        animation: 'wbspin .7s linear infinite'
      }
    }), "Bygger uke\u2026") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar-plus",
      size: 16
    }), "Bygg uke fra ", accepted.length, " forslag")), /*#__PURE__*/React.createElement("button", {
      onClick: run,
      style: {
        height: 44,
        padding: '0 16px',
        borderRadius: 11,
        background: 'transparent',
        border: `1px solid ${T.border}`,
        color: T.fg,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer'
      }
    }, "Start med tom uke"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, "Utkastet lagres ikke f\xF8r du bygger uka"))));
  }

  /* ── Plan-status pill ───────────────────────────────────── */
  function StatusPill({
    status
  }) {
    const s = PLAN_STATUS[status];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 26,
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
    }, s.label));
  }

  /* ── Plan-kvalitetskort (topp) — stort mono-tall + brudd-sammendrag ── */
  function QPill({
    n,
    label,
    color
  }) {
    return /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 18,
        padding: '0 7px',
        borderRadius: 9999,
        background: `color-mix(in srgb,${color} 15%,transparent)`,
        border: `1px solid color-mix(in srgb,${color} 42%,transparent)`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 9,
        fontWeight: 700,
        color
      }
    }, n), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 8.5,
        color
      }
    }, label));
  }
  function PlanKvalitetCard({
    score,
    brudd,
    overrides,
    onOpen
  }) {
    const scoreC = score >= 85 ? T.lime : score >= 70 ? T.amber : T.red;
    const hard = brudd.filter(b => b.alv === 'hard' && !(overrides && overrides[b.id])).length;
    const soft = brudd.filter(b => b.alv === 'myk' && !(overrides && overrides[b.id])).length;
    const ov = brudd.filter(b => overrides && overrides[b.id]).length;
    return /*#__PURE__*/React.createElement("button", {
      onClick: onOpen,
      title: "\xC5pne bruddliste",
      style: {
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        height: 62,
        padding: '0 14px 0 13px',
        marginLeft: 10,
        borderRadius: 13,
        cursor: 'pointer',
        background: `color-mix(in srgb,${scoreC} 9%,${T.raised})`,
        border: `1px solid color-mix(in srgb,${scoreC} 38%,transparent)`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'JetBrains Mono,monospace',
        fontWeight: 700,
        fontSize: 32,
        letterSpacing: '-0.02em',
        color: scoreC,
        lineHeight: 1
      }
    }, score), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        display: 'block'
      }
    }, "Plan-kvalitet"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        marginTop: 6
      }
    }, hard > 0 && /*#__PURE__*/React.createElement(QPill, {
      n: hard,
      label: hard === 1 ? 'sterkt avvik' : 'sterke avvik',
      color: T.redSolid
    }), soft > 0 && /*#__PURE__*/React.createElement(QPill, {
      n: soft,
      label: "avvik",
      color: T.amber
    }), ov > 0 && /*#__PURE__*/React.createElement(QPill, {
      n: ov,
      label: "beholdt",
      color: T.lime
    }), hard === 0 && soft === 0 && ov === 0 && /*#__PURE__*/React.createElement(QPill, {
      n: 9,
      label: "OK",
      color: T.lime
    }), /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 13,
      style: {
        color: T.muted
      }
    }))));
  }

  /* ── Gjennomføring-hero — kanons ANDRE tall, aldri blandet med Plan-kvalitet.
     Lime-utvidelsen (6. jul 2026): dette er skjermens ENE lime hero-tall-chip —
     T.signalFill m/ mørk blekk i begge temaer, 1px kant på lys. ── */
  function navTo(go) {
    try {
      if (window.parent && window.parent !== window) window.parent.postMessage({
        akNav: true,
        go
      }, '*');
    } catch (e) {}
  }
  function GjennomforingCard({
    sessions
  }) {
    const tot = sessions.length;
    const done = sessions.filter(s => s.done).length;
    const pct = tot ? Math.round(done / tot * 100) : 0;
    return /*#__PURE__*/React.createElement("button", {
      onClick: () => navTo('analyse'),
      title: "\xC5pne Analyse \u2014 gjennomf\xF8ring over tid",
      style: {
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        height: 62,
        padding: '0 14px 0 13px',
        marginLeft: 8,
        borderRadius: 13,
        cursor: 'pointer',
        textAlign: 'left',
        background: T.signalFill,
        border: `1px solid ${T.signalFillEdge}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'JetBrains Mono,monospace',
        fontWeight: 700,
        fontSize: 32,
        letterSpacing: '-0.02em',
        color: T.onSignalFill,
        lineHeight: 1
      }
    }, pct, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        opacity: 0.62,
        marginLeft: 2
      }
    }, "%")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.onSignalFill,
      style: {
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        display: 'block',
        opacity: 0.72
      }
    }, "Gjennomf\xF8ring"), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.onSignalFill,
      style: {
        display: 'block',
        marginTop: 6,
        opacity: 0.62
      }
    }, done, " av ", tot, " \xF8kter")));
  }

  /* ── Skjelett / feil / tom — per-skjerm tilstander ──────────────── */
  function Shimmer({
    w = '100%',
    h = 40,
    r = 8,
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
  function SkeletonBody({
    isCoach
  }) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        minHeight: 0
      }
    }, isCoach && /*#__PURE__*/React.createElement("div", {
      style: {
        width: 200,
        flex: 'none',
        background: T.card,
        borderRight: `1px solid ${T.border}`,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Shimmer, {
      h: 28,
      style: {
        width: '60%'
      }
    }), Array.from({
      length: 6
    }).map((_, i) => /*#__PURE__*/React.createElement(Shimmer, {
      key: i,
      h: 38
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, Array.from({
      length: 7
    }).map((_, i) => /*#__PURE__*/React.createElement(Shimmer, {
      key: i,
      h: 30
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        gap: 8
      }
    }, Array.from({
      length: 7
    }).map((_, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Shimmer, {
      h: 58 + i * 17 % 34
    }), /*#__PURE__*/React.createElement(Shimmer, {
      h: 44 + i * 11 % 30,
      style: {
        marginTop: i % 3 * 18
      }
    }))))), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 286,
        flex: 'none',
        background: T.card,
        borderLeft: `1px solid ${T.border}`,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Shimmer, {
      h: 20,
      style: {
        width: '45%'
      }
    }), Array.from({
      length: 5
    }).map((_, i) => /*#__PURE__*/React.createElement(Shimmer, {
      key: i,
      h: i % 2 ? 52 : 34
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 66,
        borderTop: `1px solid ${T.border}`,
        background: T.card,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '0 14px'
      }
    }, /*#__PURE__*/React.createElement(Shimmer, {
      w: 210,
      h: 30
    }), /*#__PURE__*/React.createElement(Shimmer, {
      w: 320,
      h: 30
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Shimmer, {
      w: 190,
      h: 28
    })));
  }
  function ZoneError({
    children,
    onRetry
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
        padding: 20,
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 13px',
        borderRadius: 9,
        background: 'rgba(229,72,77,.09)',
        border: `1px solid rgba(229,72,77,.32)`
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "triangle-alert",
      size: 14,
      style: {
        color: T.red
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12,
        color: T.red
      }
    }, children)), onRetry && /*#__PURE__*/React.createElement("button", {
      onClick: onRetry,
      style: {
        height: 26,
        padding: '0 11px',
        borderRadius: 7,
        background: 'transparent',
        border: `1px solid ${T.border}`,
        color: T.muted,
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 9,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, "Pr\xF8v igjen"));
  }
  function ErrorBody({
    isCoach,
    onRetry
  }) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        minHeight: 0
      }
    }, isCoach && /*#__PURE__*/React.createElement("div", {
      style: {
        width: 200,
        flex: 'none',
        background: T.card,
        borderRight: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(ZoneError, null, "Bibliotek utilgjengelig")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: T.base
      }
    }, /*#__PURE__*/React.createElement(ZoneError, {
      onRetry: onRetry
    }, "Kunne ikke laste uke-canvas")), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 286,
        flex: 'none',
        background: T.card,
        borderLeft: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(ZoneError, null, "Inspekt\xF8r utilgjengelig"))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        background: T.card,
        borderTop: `2px solid ${T.border}`,
        padding: '10px 14px'
      }
    }, /*#__PURE__*/React.createElement(ZoneError, null, "Kontekst-paneler kunne ikke lastes")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        height: 48,
        borderTop: `1px solid ${T.border}`,
        background: T.card,
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "triangle-alert",
      size: 13,
      style: {
        color: T.red
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      color: T.red
    }, "Belastnings-sone offline"))));
  }
  function EmptyBody({
    isCoach,
    onStart
  }) {
    return /*#__PURE__*/React.createElement("div", {
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
        width: 420,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 54,
        height: 54,
        borderRadius: 15,
        background: T.raised,
        border: `1px dashed ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar",
      size: 24,
      style: {
        color: T.muted
      }
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'Familjen Grotesk,Inter,system-ui,sans-serif',
        fontWeight: 700,
        fontSize: 19,
        color: T.fg
      }
    }, "Ingen \xF8kter denne uka"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 13,
        color: T.muted,
        lineHeight: 1.6,
        margin: '7px 0 0'
      }
    }, isCoach ? 'Dra inn økter fra biblioteket, eller la AI-Caddie bygge uka fra sesongplanen.' : 'Coachen din har ikke lagt en plan for denne uka ennå. Du får varsel når den er klar.')), isCoach && /*#__PURE__*/React.createElement("button", {
      onClick: onStart,
      style: {
        height: 40,
        padding: '0 18px',
        borderRadius: 10,
        background: T.lime,
        border: 'none',
        color: T.base,
        fontFamily: 'Inter,system-ui,sans-serif',
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
    }), "Bygg uka med AI-Caddie")));
  }

  /* ── Breadcrumb (Sesong › Uke › Økt) ────────────────────── */
  function Crumb({
    label,
    icon,
    active,
    onClick
  }) {
    return /*#__PURE__*/React.createElement("button", {
      onClick: active ? undefined : onClick,
      disabled: active,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 24,
        padding: '0 10px',
        borderRadius: 7,
        background: active ? T.raised : 'transparent',
        border: `1px solid ${active ? T.border : 'transparent'}`,
        color: active ? T.fg : T.muted,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12,
        fontWeight: active ? 600 : 500,
        cursor: active ? 'default' : 'pointer',
        whiteSpace: 'nowrap',
        maxWidth: 220,
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, icon && /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 13,
      style: {
        color: active ? T.lime : T.muted,
        flex: 'none'
      }
    }), label);
  }
  function Breadcrumb({
    zoom,
    isYear,
    isMonth,
    isSession,
    week,
    sessionTitle,
    onCrumb,
    nav
  }) {
    const Sep = () => /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 13,
      style: {
        color: T.border,
        flex: 'none'
      }
    });
    const navBtn = {
      width: 26,
      height: 24,
      borderRadius: 7,
      background: T.raised,
      border: `1px solid ${T.border}`,
      color: T.fg,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center'
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        height: 34,
        flex: 'none',
        background: T.card,
        borderBottom: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        padding: '0 14px'
      }
    }, /*#__PURE__*/React.createElement(Crumb, {
      label: "Sesong 2026",
      icon: "calendar-range",
      active: isYear,
      onClick: () => onCrumb('Årsplan')
    }), /*#__PURE__*/React.createElement(Sep, null), /*#__PURE__*/React.createElement(Crumb, {
      label: "Juni",
      icon: "calendar-days",
      active: isMonth,
      onClick: () => onCrumb('Måned')
    }), /*#__PURE__*/React.createElement(Sep, null), /*#__PURE__*/React.createElement(Crumb, {
      label: `Uke ${week}`,
      icon: "calendar",
      active: zoom === 'Uke',
      onClick: () => onCrumb('Uke')
    }), isSession && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Sep, null), /*#__PURE__*/React.createElement(Crumb, {
      label: sessionTitle || 'Økt',
      icon: "target",
      active: true
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), isSession && nav && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: nav.prev,
      title: "Forrige \xF8kt",
      style: navBtn
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-left",
      size: 14
    })), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, nav.idx, " / ", nav.total), /*#__PURE__*/React.createElement("button", {
      onClick: nav.next,
      title: "Neste \xF8kt",
      style: navBtn
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 14
    })), /*#__PURE__*/React.createElement("button", {
      onClick: () => onCrumb('Uke'),
      style: {
        height: 24,
        padding: '0 10px',
        borderRadius: 7,
        background: 'transparent',
        border: `1px solid ${T.border}`,
        color: T.muted,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 11.5,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar",
      size: 13
    }), "Tilbake til uke")));
  }

  /* ── Økt-zoom skjelett / feil ───────────────────────────── */
  function SessionSkeleton() {
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
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Shimmer, {
      h: 72
    }), /*#__PURE__*/React.createElement(Shimmer, {
      h: 18,
      style: {
        width: '28%'
      }
    }), Array.from({
      length: 4
    }).map((_, i) => /*#__PURE__*/React.createElement(Shimmer, {
      key: i,
      h: 70
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 286,
        flex: 'none',
        background: T.card,
        borderLeft: `1px solid ${T.border}`,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Shimmer, {
      h: 20,
      style: {
        width: '45%'
      }
    }), Array.from({
      length: 6
    }).map((_, i) => /*#__PURE__*/React.createElement(Shimmer, {
      key: i,
      h: i % 2 ? 52 : 34
    }))));
  }
  function SessionError({
    onRetry
  }) {
    return /*#__PURE__*/React.createElement("div", {
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
        background: T.base
      }
    }, /*#__PURE__*/React.createElement(ZoneError, {
      onRetry: onRetry
    }, "Kunne ikke laste \xF8kt-editoren")), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 286,
        flex: 'none',
        background: T.card,
        borderLeft: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(ZoneError, null, "Inspekt\xF8r utilgjengelig")));
  }

  /* ── Verktøy-velger — Workbench-paritet (6. jul 2026) ───────
     ALT plattformen har skal være endringsbart herfra: årsplan/periodisering,
     månedsplan, ukeplan og økt-editor er zoom-nivåer I Workbench; resten er
     søster-moduler som åpnes 1:1 (samme filer som sidemenyen — kanonisk
     mapping i agencyos-nav-data.js). Spilleren har de samme verktøyene i sin
     flate, rollestyrt — anbefalinger, aldri sperrer. */
  function VerktoyVelger({
    zoom,
    onZoom
  }) {
    const [open, setOpen] = React.useState(false);
    const INTERNE = [{
      label: 'Årsplan · periodisering',
      icon: 'calendar',
      zoom: 'Årsplan'
    }, {
      label: 'Månedsplan',
      icon: 'calendar-days',
      zoom: 'Måned'
    }, {
      label: 'Ukeplan',
      icon: 'calendar',
      zoom: 'Uke'
    }, {
      label: 'Økt-editor',
      icon: 'target',
      zoom: 'Økt'
    }, {
      label: 'Fysisk program',
      icon: 'dumbbell',
      zoom: 'Fysisk'
    }, {
      label: 'Utviklingsplan · teknisk',
      icon: 'git-branch',
      zoom: 'Utviklingsplan'
    }, {
      label: 'Tester · tildel',
      icon: 'target',
      zoom: 'Tester'
    }];
    const MODULER = [{
      label: 'Drill-bibliotek',
      icon: 'layers',
      file: 'drills.html'
    }, {
      label: 'Turneringer · anbefalinger',
      icon: 'trophy',
      file: 'turneringer.html'
    }, {
      label: 'Kalender',
      icon: 'calendar',
      file: 'kalender.html'
    }, {
      label: 'Plans · kanban',
      icon: 'layout-dashboard',
      file: 'plans.html'
    }];
    const rowStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      width: '100%',
      padding: '7px 10px',
      borderRadius: 8,
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left'
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        padding: '0 10px',
        borderRight: `1px solid ${T.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }
    }, "Verkt\xF8y"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpen(o => !o),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 24,
        padding: '0 10px',
        borderRadius: 9999,
        background: open ? T.fg : T.raised,
        border: `1px solid ${open ? T.fg : T.border}`,
        color: open ? T.base : T.fg,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 11.5,
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "layers",
      size: 12
    }), "Alle", /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-down",
      size: 11,
      style: {
        opacity: 0.7
      }
    })), open && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      onClick: () => setOpen(false),
      style: {
        position: 'fixed',
        inset: 0,
        zIndex: 88
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: '100%',
        left: 4,
        marginTop: 7,
        width: 262,
        zIndex: 89,
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        boxShadow: 'var(--shadow-popover)',
        padding: 7,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 7.5,
      color: T.muted,
      style: {
        letterSpacing: '0.11em',
        textTransform: 'uppercase',
        padding: '5px 10px 3px'
      }
    }, "I Workbench"), INTERNE.map(v => {
      const on = zoom === v.zoom;
      return /*#__PURE__*/React.createElement("button", {
        key: v.zoom,
        style: rowStyle,
        onClick: () => {
          onZoom(v.zoom);
          setOpen(false);
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: v.icon,
        size: 13,
        style: {
          color: on ? T.lime : T.muted,
          flex: 'none'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          fontFamily: 'Inter,system-ui,sans-serif',
          fontSize: 12,
          fontWeight: on ? 700 : 500,
          color: T.fg,
          whiteSpace: 'nowrap'
        }
      }, v.label), on && /*#__PURE__*/React.createElement("span", {
        style: {
          width: 6,
          height: 6,
          borderRadius: 9999,
          background: T.lime,
          flex: 'none'
        }
      }));
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: T.border,
        margin: '5px 4px'
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 7.5,
      color: T.muted,
      style: {
        letterSpacing: '0.11em',
        textTransform: 'uppercase',
        padding: '5px 10px 3px'
      }
    }, "Plattform-moduler \xB7 1:1"), MODULER.map(m => /*#__PURE__*/React.createElement("button", {
      key: m.file,
      style: rowStyle,
      onClick: () => {
        window.location.href = m.file;
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: m.icon,
      size: 13,
      style: {
        color: T.muted,
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12,
        fontWeight: 500,
        color: T.fg,
        whiteSpace: 'nowrap'
      }
    }, m.label), /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 11,
      style: {
        color: T.muted,
        flex: 'none'
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        margin: '5px 4px 3px',
        padding: '7px 9px',
        borderRadius: 8,
        background: T.raised,
        border: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8,
      color: T.muted,
      style: {
        lineHeight: 1.6
      }
    }, "Spilleren har de samme verkt\xF8yene i sin flate \u2014 rollestyrt. Anbefalinger, aldri sperrer.")))));
  }

  /* ════ App ══════════════════════════════════════════════ */
  function App() {
    const [role, setRole] = React.useState('coach');
    const [spiller, setSpiller] = React.useState('Øyvind');
    const [zoom, setZoom] = React.useState('Uke');
    const [sel, setSel] = React.useState(8);
    const [scenarioId, setScen] = React.useState('hard');
    const [planStatus, setStatus] = React.useState('DRAFT');
    const [overrides, setOver] = React.useState({});
    const [sessions, setSessions] = React.useState(D.SESSIONS.map(s => ({
      ...s
    })));
    const [aiPhase, setAiPhase] = React.useState('idle');
    const aiBuild = () => {
      setAiPhase('loading');
      setTimeout(() => setAiPhase('done'), 1100);
    };
    const aiAccept = () => {
      setSessions(prev => {
        const maxId = prev.reduce((m, s) => Math.max(m, s.id), 0);
        return prev.concat(D.AI_GHOST.map((g, i) => ({
          id: maxId + 1 + i,
          day: g.day,
          sH: g.sH,
          dH: g.dH,
          title: g.title,
          axis: g.area,
          loc: 'GFGK',
          done: false,
          cs: 50,
          pyramidArea: g.area,
          lFase: 'L_BALL',
          miljo: 'M2',
          csNivaa: g.cs,
          pressureLevel: 'PR2',
          pPosisjoner: [],
          drills: [g.title]
        })));
      });
      setAiPhase('idle');
    };
    const aiDiscard = () => setAiPhase('idle');
    const [bruddOpen, setBrudd] = React.useState(false);
    const [diff, setDiff] = React.useState(false);
    const [cold, setCold] = React.useState(false);
    const [pageState, setPageState] = React.useState('filled');
    const [pubOpen, setPubOpen] = React.useState(false);
    const [toast, setToast] = React.useState(null);

    /* Fase 3.9.7 — dypkobling fra Godkjenninger «Åpne i Workbench»: ?spiller=&zoom=&fra=.
       Kun for de tre spillerne Workbench-demoen faktisk modellerer (SPILLERE under) —
       treffer ikke fornavnet, åpnes ønsket zoom uendret i stedet for en feilaktig visning. */
    React.useEffect(() => {
      try {
        const q = new URLSearchParams(window.location.search);
        const qSpiller = q.get('spiller'),
          qZoom = q.get('zoom'),
          qFra = q.get('fra');
        if (qSpiller && ['Øyvind', 'Joachim', 'Emma'].includes(qSpiller)) setSpiller(qSpiller);
        if (qZoom && ['Årsplan', 'Måned', 'Uke', 'Økt'].includes(qZoom)) setZoom(qZoom);
        if (qFra) {
          setToast('Åpnet fra Godkjenninger: «' + qFra + '»');
          setTimeout(() => setToast(null), 4200);
        }
      } catch (e) {}
    }, []);

    /* ── Øktbibliotek + komponist (ny/dupliser/gjenta) ────── */
    const [composer, setComposer] = React.useState(null); // {mode, initial, anchorId}
    const [galleryOpen, setGalleryOpen] = React.useState(false);
    const [malDetalj, setMalDetalj] = React.useState(null); // mal → detalj/effekt før bruk (3.9.5)
    const [customStdokter, setCustomStd] = React.useState([]);
    const flash = msg => {
      setToast(msg);
      setTimeout(() => setToast(null), 3600);
    };
    const closeComposer = () => setComposer(null);
    const [sistFlytt, setSistFlytt] = React.useState(null);
    /* Fase 4.2 — forhåndsvisning under drag: {id,day,sH} mens en økt dras, null ellers.
       Score reberegnes fra denne preview-layouten UNDER draget (se `live` nedenfor). */
    const [dragPrev, setDragPrev] = React.useState(null);
    const onDragPreview = React.useCallback((id, day, sH) => {
      setDragPrev(id == null ? null : {
        id,
        day,
        sH
      });
    }, []);
    const moveSession = (id, day, sH) => {
      setSessions(prev => {
        const s = prev.find(x => x.id === id);
        if (!s) return prev;
        setSistFlytt({
          tekst: `${s.title} → ${D.DAYS[day]} ${D.DATES[day]} kl. ${String(Math.floor(sH)).padStart(2, '0')}:${sH % 1 ? '30' : '00'}`,
          forrige: prev
        });
        return prev.map(x => x.id === id ? {
          ...x,
          day,
          sH
        } : x);
      });
    };
    const dropFromLibrary = (item, kind, day, hour) => {
      const dH = parseDurStr(item.dur);
      setComposer({
        mode: 'new',
        initial: {
          day,
          sH: hour,
          dH,
          title: item.title,
          pyramidArea: item.axis,
          csNivaa: 'CS' + item.cs,
          loc: 'GFGK',
          drills: kind === 'drill' ? [item.title] : [],
          _seed: Date.now()
        }
      });
    };
    const newFromSlot = (day, hour) => setComposer({
      mode: 'new',
      initial: {
        day,
        sH: hour,
        dH: 1,
        pyramidArea: 'TEK',
        csNivaa: 'CS50',
        loc: 'GFGK',
        drills: [],
        _seed: Date.now()
      }
    });
    const pickFromLibrary = (item, kind) => {
      const dH = parseDurStr(item.dur);
      const fields = {
        title: item.title,
        pyramidArea: item.axis,
        csNivaa: 'CS' + item.cs,
        dH,
        drills: kind === 'drill' ? [item.title] : []
      };
      setComposer(prev => prev ? {
        ...prev,
        initial: {
          ...prev.initial,
          ...fields,
          _seed: Date.now()
        }
      } : {
        mode: 'new',
        initial: {
          day: D.TODAY,
          sH: 9,
          loc: 'GFGK',
          ...fields,
          _seed: Date.now()
        }
      });
      setGalleryOpen(false);
    };
    const applyTemplate = tpl => {
      setSessions(prev => {
        let id = prev.reduce((m, s) => Math.max(m, s.id), 0);
        const added = tpl.sessions.map(st => {
          id += 1;
          const cs = parseInt(String(st.cs).replace(/\D/g, ''), 10) || 50;
          return {
            id,
            day: st.day,
            sH: st.sH,
            dH: st.dH,
            title: st.title,
            axis: st.axis,
            loc: 'GFGK',
            done: false,
            cs,
            pyramidArea: st.axis,
            lFase: 'L_BALL',
            miljo: 'M2',
            csNivaa: st.cs,
            pressureLevel: 'PR2',
            pPosisjoner: [],
            drills: [st.title]
          };
        });
        return prev.concat(added);
      });
      setGalleryOpen(false);
      setComposer(null);
      setMalDetalj(null);
      flash(`${tpl.sessions.length} økter fra «${tpl.title}» lagt til i uke 25`);
    };
    const duplicateSession = s => setComposer({
      mode: 'duplicate',
      initial: {
        title: s.title,
        day: s.day,
        sH: s.sH,
        dH: s.dH,
        loc: s.loc,
        pyramidArea: s.pyramidArea,
        csNivaa: s.csNivaa,
        drills: (s.drills || []).slice(),
        _seed: Date.now()
      }
    });
    const repeatSession = s => setComposer({
      mode: 'repeat',
      anchorId: s.id,
      initial: {
        title: s.title,
        day: s.day,
        sH: s.sH,
        dH: s.dH,
        loc: s.loc,
        pyramidArea: s.pyramidArea,
        csNivaa: s.csNivaa,
        drills: (s.drills || []).slice(),
        _seed: Date.now()
      }
    });
    const saveAsStdokt = s => {
      setCustomStd(prev => prev.concat({
        id: 'u' + Date.now(),
        axis: s.pyramidArea,
        title: s.title,
        cs: parseInt(String(s.csNivaa).replace(/\D/g, ''), 10) || 50,
        dur: s.dH >= 1 ? s.dH + 't' : Math.round(s.dH * 60) + ' min'
      }));
      flash(`«${s.title}» lagret som standardøkt i biblioteket`);
    };
    const handleComposerSave = ({
      base,
      saveLib,
      repeat,
      mode
    }) => {
      const csNum = parseInt(String(base.csNivaa).replace(/\D/g, ''), 10) || 50;
      const makeSession = (id, day) => ({
        id,
        day,
        sH: base.sH,
        dH: base.dH,
        title: base.title,
        axis: base.pyramidArea,
        loc: base.loc,
        done: false,
        cs: csNum,
        pyramidArea: base.pyramidArea,
        lFase: 'L_BALL',
        miljo: 'M2',
        csNivaa: base.csNivaa,
        pressureLevel: 'PR2',
        pPosisjoner: [],
        drills: base.drills || []
      });
      setSessions(prev => {
        let id = prev.reduce((m, s) => Math.max(m, s.id), 0);
        let next = prev.slice();
        const recurTag = repeat ? {
          summary: repeat.summary
        } : null;
        if (mode === 'repeat' && composer && composer.anchorId != null) {
          next = next.map(s => s.id === composer.anchorId ? {
            ...s,
            recur: recurTag
          } : s);
          (repeat.days || []).filter(d => d !== base.day).forEach(d => {
            id += 1;
            next.push({
              ...makeSession(id, d),
              recur: recurTag
            });
          });
        } else {
          id += 1;
          next.push({
            ...makeSession(id, base.day),
            ...(recurTag ? {
              recur: recurTag
            } : {})
          });
          if (repeat) (repeat.days || []).filter(d => d !== base.day).forEach(d => {
            id += 1;
            next.push({
              ...makeSession(id, d),
              recur: recurTag
            });
          });
        }
        return next;
      });
      if (saveLib) saveAsStdokt(base);
      setComposer(null);
      flash(mode === 'repeat' ? `Gjentagelse satt opp — ${repeat.summary}` : 'Økt lagret i uke 25');
    };
    const isCoach = role === 'coach';
    /* Fase 4.2 — Plan-kvalitet LIVE: legg-lag-avledet `hviledag` beregnes fra
       gjeldende `sessions` (drag → setSessions → recompute), resten fra demo-scenario.
       hviledag fjernes fra scenario-kontroll så live-layouten er eneste kilde. */
    const scenarioIds = (SCENARIOS.find(s => s.id === scenarioId) || SCENARIOS[0]).aktive.filter(id => id !== 'hviledag');
    const live = D.deriveLiveBrudd(dragPrev ? sessions.map(s => s.id === dragPrev.id ? {
      ...s,
      day: dragPrev.day,
      sH: dragPrev.sH
    } : s) : sessions);
    const activeIds = Array.from(new Set(scenarioIds.concat(live.ids)));
    const vp = validatePlan(activeIds, overrides);
    const score = vp.score;
    const brudd = vp.brudd.map(b => live.meldinger[b.id] ? {
      ...b,
      ...live.meldinger[b.id]
    } : b);
    const openHard = hardOpen(activeIds, overrides);
    const brokenIds = brudd.filter(b => b.alv === 'hard' && !overrides[b.id] && b.sessionId).map(b => b.sessionId);
    const selSes = sessions.find(s => s.id === sel);
    const selBrudd = brudd.find(b => b.sessionId === sel) || null;
    const isYear = zoom === 'Årsplan' || zoom === 'År';
    const isSession = zoom === 'Økt' || zoom === 'Dag';
    const isMonth = zoom === 'Måned';
    /* Workbench-moduser (3.9-punkt 2): embeddbar kjerne fra søster-modulene,
       samme spillerkontekst og rolle — lest lazily (bundle-trygt). */
    const isFysisk = zoom === 'Fysisk';
    const isUplan = zoom === 'Utviklingsplan';
    const isTester = zoom === 'Tester';
    const FysInnhold = window.FYS_APP && window.FYS_APP.Innhold;
    const UplanInnhold = window.UPLAN_APP && window.UPLAN_APP.Innhold;
    const TestInnhold = window.WBTEST && window.WBTEST.Innhold;
    const ordered = [...sessions].sort((a, b) => a.day - b.day || a.sH - b.sH);
    const curIdx = ordered.findIndex(s => s.id === sel);
    const sessionNav = isSession && curIdx !== -1 ? {
      idx: curIdx + 1,
      total: ordered.length,
      prev: () => setSel(ordered[(curIdx - 1 + ordered.length) % ordered.length].id),
      next: () => setSel(ordered[(curIdx + 1) % ordered.length].id)
    } : null;
    const changeFormel = (id, key, val) => setSessions(prev => prev.map(s => s.id === id ? {
      ...s,
      [key]: val,
      ...(key === 'pyramidArea' ? {
        axis: val
      } : {})
    } : s));
    const doOverride = (invId, text) => setOver(prev => ({
      ...prev,
      [invId]: text
    }));
    const changeScenario = id => {
      setScen(id);
      setOver({});
    };
    const publish = () => setStatus('PENDING_PLAYER');
    const approve = () => setStatus('ACTIVE');
    const reject = () => setStatus('REJECTED');
    const SPILLERE = ['Øyvind', 'Joachim', 'Emma'];
    const SURNAME = {
      Øyvind: 'Rohjan',
      Joachim: 'Five',
      Emma: 'Lund'
    };
    const scoreC = score >= 85 ? T.lime : score >= 70 ? T.amber : T.red;
    const confirmPublish = () => {
      setStatus('PENDING_PLAYER');
      setPubOpen(false);
      setToast('Uke 25 publisert til ' + spiller + ' ' + SURNAME[spiller] + ' · venter på godkjenning');
      setTimeout(() => setToast(null), 3600);
    };

    // Action cluster by role + status
    let action = null;
    if (isCoach && (planStatus === 'DRAFT' || planStatus === 'REJECTED')) {
      /* CANON: aldri sperrer — publisering er alltid mulig; sterke avvik varsler coach automatisk. */
      const sterke = openHard.length;
      action = /*#__PURE__*/React.createElement(BtnSm, {
        icon: "send",
        variant: "lime",
        onClick: () => setPubOpen(true),
        title: sterke > 0 ? `Publiser — ${sterke} sterk${sterke === 1 ? 't' : 'e'} avvik varsles automatisk` : 'Publiser til spiller'
      }, "Publiser");
    } else if (!isCoach && planStatus === 'PENDING_PLAYER') {
      action = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(BtnSm, {
        icon: "x",
        variant: "red",
        onClick: reject
      }, "Avvis"), /*#__PURE__*/React.createElement(BtnSm, {
        icon: "check",
        variant: "lime",
        onClick: approve
      }, "Godkjenn"));
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        width: 1280,
        height: 900,
        background: T.base,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter,system-ui,sans-serif',
        overflow: 'hidden',
        color: T.fg,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 82,
        flex: 'none',
        background: T.card,
        borderBottom: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        paddingRight: 14,
        borderRight: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        display: 'block'
      }
    }, "WORKBENCH"), /*#__PURE__*/React.createElement("button", {
      onClick: () => navTo('stall'),
      title: "\xC5pne spillerprofil i Stall",
      style: {
        display: 'block',
        background: 'none',
        border: 'none',
        padding: 0,
        margin: '3px 0 3px',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'Familjen Grotesk,Inter,system-ui,sans-serif',
        fontWeight: 700,
        fontSize: 15,
        letterSpacing: '-0.01em',
        color: T.fg
      }
    }, spiller, " ", SURNAME[spiller]), /*#__PURE__*/React.createElement(StatusPill, {
      status: planStatus
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        padding: '0 12px',
        borderRight: `1px solid ${T.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }
    }, "Rolle"), /*#__PURE__*/React.createElement(SegToggle, {
      options: [{
        value: 'coach',
        label: 'COACH'
      }, {
        value: 'spiller',
        label: 'SPILLER'
      }],
      value: role,
      onChange: setRole
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        padding: '0 12px',
        borderRight: `1px solid ${T.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }
    }, "Spiller"), isCoach ? /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("select", {
      value: spiller,
      onChange: e => setSpiller(e.target.value),
      style: {
        appearance: 'none',
        WebkitAppearance: 'none',
        height: 26,
        padding: '0 26px 0 11px',
        borderRadius: 9999,
        background: T.raised,
        border: `1px solid ${T.border}`,
        color: T.fg,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12,
        fontWeight: 600,
        cursor: 'pointer',
        outline: 'none'
      }
    }, SPILLERE.map(s => /*#__PURE__*/React.createElement("option", {
      key: s,
      value: s,
      style: {
        background: T.card,
        color: T.fg
      }
    }, s, " ", SURNAME[s]))), /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-down",
      size: 13,
      style: {
        position: 'absolute',
        right: 9,
        color: T.muted,
        pointerEvents: 'none'
      }
    })) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 24,
        padding: '0 10px',
        borderRadius: 9999,
        background: T.raised,
        border: `1px solid ${T.border}`,
        alignSelf: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-user",
      size: 13,
      style: {
        color: T.lime
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      color: T.fg
    }, spiller, " \xB7 deg"))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        padding: '0 10px',
        borderRight: `1px solid ${T.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }
    }, "Zoom"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 1
      }
    }, ['Årsplan', 'Måned', 'Uke', 'Økt'].map(z => /*#__PURE__*/React.createElement(ZoomPill, {
      key: z,
      label: z,
      active: z === 'Økt' && isSession || zoom === z,
      onClick: () => setZoom(z)
    })))), /*#__PURE__*/React.createElement(VerktoyVelger, {
      zoom: zoom,
      onZoom: setZoom
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement(PlanKvalitetCard, {
      score: score,
      brudd: brudd,
      overrides: overrides,
      onOpen: () => setBrudd(true)
    }), /*#__PURE__*/React.createElement(GjennomforingCard, {
      sessions: sessions
    }), D.KPIS.filter(k => ['acwr', 'sg'].indexOf(k.key) !== -1).map(k => /*#__PURE__*/React.createElement(KpiChip, {
      key: k.key,
      label: k.label,
      value: k.value,
      unit: k.unit,
      delta: k.delta,
      dir: k.dir,
      warn: k.warn
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        paddingLeft: 12,
        paddingRight: 10,
        borderLeft: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement(BtnSm, {
      icon: "plus",
      onClick: () => newFromSlot(D.TODAY, 9)
    }, "Ny \xF8kt"), /*#__PURE__*/React.createElement(BtnSm, {
      icon: "sparkles",
      title: isCoach ? 'Generer plan med AI-Caddie' : 'AI-periodiser',
      onClick: () => setDiff(true)
    }), action), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        paddingLeft: 10,
        borderLeft: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8,
      color: T.muted,
      style: {
        letterSpacing: '0.12em',
        textTransform: 'uppercase'
      }
    }, "Demo"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 2,
        background: T.raised,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: 2
      }
    }, [{
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
    }].map(o => {
      const on = pageState === o.v;
      return /*#__PURE__*/React.createElement("button", {
        key: o.v,
        title: o.t,
        onClick: () => setPageState(o.v),
        style: {
          width: 25,
          height: 21,
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
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("select", {
      value: scenarioId,
      onChange: e => changeScenario(e.target.value),
      title: "Brudd-scenario",
      style: {
        appearance: 'none',
        WebkitAppearance: 'none',
        height: 23,
        padding: '0 22px 0 9px',
        borderRadius: 7,
        background: T.raised,
        border: `1px solid ${T.border}`,
        color: T.amber,
        fontFamily: 'JetBrains Mono,monospace',
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
        right: 7,
        color: T.muted,
        pointerEvents: 'none'
      }
    }))))), !cold && !isFysisk && !isUplan && !isTester && /*#__PURE__*/React.createElement(Breadcrumb, {
      zoom: zoom,
      isYear: isYear,
      isMonth: isMonth,
      isSession: isSession,
      week: 25,
      sessionTitle: selSes && selSes.title,
      onCrumb: setZoom,
      nav: sessionNav
    }), !cold && sistFlytt && /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '6px 18px',
        borderBottom: `1px solid ${T.border}`,
        background: T.card
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 12,
      style: {
        color: T.lime,
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, "Flyttet: ", sistFlytt.tekst, " \u2014 re-validert."), /*#__PURE__*/React.createElement("button", {
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 9,
        fontWeight: 700,
        color: T.fg,
        textDecoration: 'underline',
        textUnderlineOffset: 3
      },
      onClick: () => {
        setSessions(sistFlytt.forrige);
        setSistFlytt(null);
      }
    }, "ANGRE"), /*#__PURE__*/React.createElement("button", {
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        marginLeft: 'auto',
        color: T.muted,
        display: 'flex'
      },
      "aria-label": "Lukk",
      onClick: () => setSistFlytt(null)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 11
    }))), cold ? /*#__PURE__*/React.createElement(ColdStart, {
      player: spiller,
      onGenerate: () => {
        setCold(false);
        setStatus('DRAFT');
      }
    }) : isYear ? /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        minHeight: 0
      }
    }, /*#__PURE__*/React.createElement(Arsplan, {
      onOpenWeek: () => setZoom('Uke'),
      role: role
    }), /*#__PURE__*/React.createElement(BalanseRail, {
      role: role,
      sessions: sessions,
      activeIds: activeIds,
      selSes: selSes,
      showSelected: false,
      aiPhase: aiPhase,
      onAiBuild: aiBuild,
      onAiAccept: aiAccept,
      onAiDiscard: aiDiscard
    })) : isFysisk ? /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        minHeight: 0
      }
    }, FysInnhold ? /*#__PURE__*/React.createElement(FysInnhold, {
      role: role,
      embedded: true
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      color: T.muted
    }, "Fysisk program er ikke lastet \u2014 ", /*#__PURE__*/React.createElement("a", {
      href: "fysisk.html",
      style: {
        color: T.fg
      }
    }, "\xE5pne som egen side"), "."))) : isUplan ? /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        minHeight: 0
      }
    }, UplanInnhold ? /*#__PURE__*/React.createElement(UplanInnhold, {
      role: role,
      embedded: true
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      color: T.muted
    }, "Utviklingsplanen er ikke lastet \u2014 ", /*#__PURE__*/React.createElement("a", {
      href: "utviklingsplan.html",
      style: {
        color: T.fg
      }
    }, "\xE5pne som egen side"), "."))) : isTester ? /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        minHeight: 0
      }
    }, TestInnhold ? /*#__PURE__*/React.createElement(TestInnhold, {
      role: role,
      embedded: true
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      color: T.muted
    }, "Tester-modusen er ikke lastet"))) : isMonth ? /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        minHeight: 0
      }
    }, /*#__PURE__*/React.createElement(MaanedZoom, {
      onOpenWeek: () => setZoom('Uke'),
      onOpenUplan: () => setZoom('Utviklingsplan'),
      onCreateAt: isCoach ? (day, hour) => {
        newFromSlot(day, hour);
        setZoom('Uke');
      } : undefined
    }), /*#__PURE__*/React.createElement(BalanseRail, {
      role: role,
      sessions: sessions,
      activeIds: activeIds,
      selSes: selSes,
      showSelected: false,
      aiPhase: aiPhase,
      onAiBuild: aiBuild,
      onAiAccept: aiAccept,
      onAiDiscard: aiDiscard
    })) : isSession ? pageState === 'loading' ? /*#__PURE__*/React.createElement(SessionSkeleton, null) : pageState === 'error' ? /*#__PURE__*/React.createElement(SessionError, {
      onRetry: () => setPageState('filled')
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        minHeight: 0
      }
    }, /*#__PURE__*/React.createElement(SessionZoom, {
      role: role,
      session: pageState === 'empty' ? null : selSes,
      brudd: selBrudd,
      override: selBrudd ? overrides[selBrudd.id] : null,
      onChangeFormel: changeFormel,
      onOverride: doOverride,
      onBack: () => setZoom('Uke'),
      onRemove: () => {
        setSessions(prev => prev.filter(s => s.id !== sel));
        setZoom('Uke');
      },
      onDuplicate: duplicateSession,
      onSaveTemplate: saveAsStdokt,
      onRepeat: repeatSession
    }), /*#__PURE__*/React.createElement(BalanseRail, {
      role: role,
      sessions: sessions,
      activeIds: activeIds,
      selSes: selSes,
      showSelected: false,
      aiPhase: aiPhase,
      onAiBuild: aiBuild,
      onAiAccept: aiAccept,
      onAiDiscard: aiDiscard
    })) : pageState === 'loading' ? /*#__PURE__*/React.createElement(SkeletonBody, {
      isCoach: isCoach
    }) : pageState === 'error' ? /*#__PURE__*/React.createElement(ErrorBody, {
      isCoach: isCoach,
      onRetry: () => setPageState('filled')
    }) : pageState === 'empty' ? /*#__PURE__*/React.createElement(EmptyBody, {
      isCoach: isCoach,
      onStart: () => {
        if (isCoach) setCold(true);
        setPageState('filled');
      }
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        minHeight: 0
      }
    }, isCoach && /*#__PURE__*/React.createElement(Palette, {
      onPickItem: pickFromLibrary,
      onApplyTemplate: setMalDetalj,
      onOpenLibrary: () => setGalleryOpen(true),
      extraStdokter: customStdokter
    }), /*#__PURE__*/React.createElement(TimeGrid, {
      sessions: sessions,
      selected: sel,
      onSelect: setSel,
      onOpen: id => {
        setSel(id);
        setZoom('Økt');
      },
      onCreateAt: newFromSlot,
      onMove: isCoach ? moveSession : undefined,
      onDragPreview: isCoach ? onDragPreview : undefined,
      onDropItem: isCoach ? dropFromLibrary : undefined,
      brokenIds: brokenIds,
      ghosts: aiPhase === 'done' ? D.AI_GHOST : null
    }), /*#__PURE__*/React.createElement(BalanseRail, {
      role: role,
      sessions: sessions,
      activeIds: activeIds,
      selSes: selSes,
      showSelected: true,
      onOpenSession: id => {
        setSel(id);
        setZoom('Økt');
      },
      aiPhase: aiPhase,
      onAiBuild: aiBuild,
      onAiAccept: aiAccept,
      onAiDiscard: aiDiscard
    })), bruddOpen && /*#__PURE__*/React.createElement(BruddListe, {
      role: role,
      score: score,
      brudd: brudd,
      overrides: overrides,
      onOverride: doOverride,
      onJump: id => {
        setSel(id);
        setBrudd(false);
        setZoom('Uke');
      },
      onClose: () => setBrudd(false)
    }), diff && /*#__PURE__*/React.createElement(DiffOverlay, {
      role: role,
      onClose: () => setDiff(false),
      onAccept: () => {
        setDiff(false);
        changeScenario('ren');
      }
    }), pubOpen && /*#__PURE__*/React.createElement(PubliserDialog, {
      spiller: spiller,
      surname: SURNAME[spiller],
      week: 25,
      sessions: sessions,
      score: score,
      brudd: brudd,
      overrides: overrides,
      onConfirm: confirmPublish,
      onClose: () => setPubOpen(false)
    }), composer && /*#__PURE__*/React.createElement(SessionComposer, {
      mode: composer.mode,
      initial: composer.initial,
      weekNo: 25,
      onClose: closeComposer,
      onSave: handleComposerSave,
      onOpenLibrary: () => setGalleryOpen(true)
    }), galleryOpen && /*#__PURE__*/React.createElement(LibraryGallery, {
      onClose: () => setGalleryOpen(false),
      onPickItem: pickFromLibrary,
      onApplyTemplate: setMalDetalj,
      extraStdokter: customStdokter
    }), malDetalj && /*#__PURE__*/React.createElement(MalDetalj, {
      tpl: malDetalj,
      sessions: sessions,
      weekNo: 25,
      onApply: () => applyTemplate(malDetalj),
      onClose: () => setMalDetalj(null)
    }), isCoach && !cold && !isYear && pageState === 'filled' && /*#__PURE__*/React.createElement("button", {
      onClick: () => setCold(true),
      title: "Kaldstart \u2014 tom plan",
      style: {
        position: 'absolute',
        left: 12,
        bottom: 62,
        zIndex: 20,
        height: 24,
        padding: '0 9px',
        borderRadius: 6,
        background: T.raised,
        border: `1px dashed ${T.border}`,
        color: T.muted,
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        cursor: 'pointer'
      }
    }, "+ tom plan"), toast && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: '50%',
        bottom: 24,
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '11px 16px',
        borderRadius: 11,
        background: T.card,
        border: `1px solid color-mix(in srgb,${T.lime} 42%,${T.border})`,
        boxShadow: '0 14px 40px rgba(0,0,0,.5)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-check",
      size: 16,
      style: {
        color: T.lime
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 13,
        color: T.fg
      }
    }, toast)));
  }
  window.WB = {
    App
  };
})();
})(); 