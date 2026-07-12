// FASIT-REFERANSE (ekstrahert fra Claude Design offline-eksport 2026-07-12)
// Original sti: ui_kits/agencyos/agencyos-shell.jsx
// KUN referanse for v2-ombygging — importeres ALDRI av appen.

try { (() => {
/* AK Golf HQ — AgencyOS samlet shell. Sidebar-nav + Cockpit + iframe-moduler.
   Hver modul kjører isolert i iframe (ingen global-kollisjon). Eksporterer window.AGENCYOS. */
(function () {
  const {
    Icon,
    ThemeToggle
  } = window.AKGolfHQDesignSystem_bb9b2b;
  const D = window.WBDATA;
  const {
    T,
    AX,
    AX_TEXT,
    AX_SOFT,
    DAYS,
    DATES,
    TODAY,
    SESSIONS
  } = D;
  const UI = 'Inter,system-ui,sans-serif',
    DISP = 'Familjen Grotesk,Inter,system-ui,sans-serif',
    MONO = 'JetBrains Mono,ui-monospace,monospace';

  /* Logo-varianter (Fase 2). Markøren er ~1:1; ordmerket «AgencyOS» står ved siden.
     Sti er relativ til ui_kits/agencyos/index.html → prosjekt-rot /assets/logos/.
     Mørk flate = white-on-dark (hvit mark + lime ball). Lys flate = primary-on-light. */
  const LOGO = {
    dark: '../../assets/logos/ak-golf-logo-white-on-dark.svg',
    light: '../../assets/logos/ak-golf-logo-primary-on-light.svg'
  };

  /* Nav manifest is shared with the ⌘K command palette (agencyos-nav-data.js) so
     sidebar and search never drift apart. */
  const {
    NAV,
    ALL,
    CADDIE
  } = window.AGENCYOSNAV;
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

  /* ── Rail ─────────────────────────────────────────────── */
  function NavBtn({
    n,
    on,
    onClick
  }) {
    return /*#__PURE__*/React.createElement("button", {
      onClick: onClick,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        width: '100%',
        height: n.sub ? 44 : 40,
        padding: '0 11px',
        borderRadius: 10,
        cursor: 'pointer',
        textAlign: 'left',
        background: on ? `color-mix(in srgb,${T.lime} 13%,transparent)` : 'transparent',
        border: `1px solid ${on ? `color-mix(in srgb,${T.lime} 32%,transparent)` : 'transparent'}`
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: n.icon,
      size: 18,
      style: {
        color: on ? T.lime : T.muted,
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: UI,
        fontSize: 13.5,
        fontWeight: on ? 700 : 500,
        color: on ? T.fg : '#C8CAC5',
        lineHeight: 1.1
      }
    }, n.label), n.sub && /*#__PURE__*/React.createElement(Mono, {
      size: 8,
      color: T.muted,
      style: {
        display: 'block',
        marginTop: 3,
        letterSpacing: '0.03em'
      }
    }, n.sub)), n.badge && /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 'none',
        minWidth: 18,
        height: 18,
        padding: '0 5px',
        borderRadius: 9999,
        background: T.lime,
        color: T.base,
        fontFamily: MONO,
        fontSize: 10,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, n.badge), on && !n.badge && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 5,
        height: 5,
        borderRadius: 9999,
        background: T.lime,
        flex: 'none'
      }
    }));
  }
  function Rail({
    active,
    go,
    theme,
    onTheme
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        width: 232,
        flex: 'none',
        background: T.card,
        borderRight: `1px solid ${T.border}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        padding: '17px 16px 15px'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: theme === 'light' ? LOGO.light : LOGO.dark,
      alt: "AK Golf",
      style: {
        height: 30,
        width: 'auto',
        flex: 'none',
        display: 'block'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: DISP,
        fontWeight: 700,
        fontSize: 15,
        color: T.fg,
        letterSpacing: '-0.01em',
        lineHeight: 1
      }
    }, "AgencyOS"), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted,
      style: {
        display: 'block',
        marginTop: 4
      }
    }, "AK Golf Academy"))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '4px 12px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 13
      }
    }, NAV.map(g => /*#__PURE__*/React.createElement("div", {
      key: g.grp
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8,
      color: T.muted,
      style: {
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        display: 'block',
        padding: '0 4px 7px'
      }
    }, g.grp), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }
    }, g.items.map(n => /*#__PURE__*/React.createElement(NavBtn, {
      key: n.id,
      n: n,
      on: active === n.id,
      onClick: () => go(n.id)
    })))))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        padding: '10px 12px 12px',
        borderTop: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '0 2px 10px'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8,
      color: T.muted,
      style: {
        letterSpacing: '0.14em',
        textTransform: 'uppercase'
      }
    }, "Utseende"), /*#__PURE__*/React.createElement(ThemeToggle, {
      size: "sm",
      visEtiketter: false,
      defaultValue: theme,
      storageKey: "ak-agencyos-theme",
      onChange: (id, resolved) => onTheme(resolved)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement(NavBtn, {
      n: CADDIE,
      on: active === CADDIE.id,
      onClick: () => go(CADDIE.id)
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 10px',
        borderRadius: 11,
        background: T.raised,
        border: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 32,
        height: 32,
        flex: 'none',
        borderRadius: 9999,
        background: T.base,
        border: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: MONO,
        fontSize: 11,
        fontWeight: 700,
        color: T.lime
      }
    }, "AK"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: UI,
        fontSize: 12.5,
        fontWeight: 600,
        color: T.fg
      }
    }, "Anders Kristiansen"), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted,
      style: {
        display: 'block',
        marginTop: 3
      }
    }, "Hovedtrener")), /*#__PURE__*/React.createElement(Icon, {
      name: "settings",
      size: 15,
      style: {
        color: T.muted
      }
    }))));
  }

  /* ── Cockpit (landing) ────────────────────────────────── */
  function Card({
    children,
    style,
    pad = 16
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        boxShadow: 'var(--sheen-top)',
        padding: pad,
        ...style
      }
    }, children);
  }
  function Cockpit({
    go
  }) {
    /* Coach-overblikk (Mac-paritet): deler TRIAGEDATA med triage-modulen — én kilde. */
    const TRI = window.TRIAGEDATA;
    const TIMER = TRI.TIMER;
    const AKUTT = TRI.ITEMS.filter(x => x.ko === 'akutt');
    const KOTALL = TRI.KOER.filter(k => k.id !== 'akutt').map(k => ({
      ...k,
      n: TRI.ITEMS.filter(x => x.ko === k.id).length
    }));
    const PLANER = TRI.ITEMS.filter(x => x.ko === 'planer').length;
    const NOW = 10.5; // demo-klokke — mandag formiddag
    const nesteIdx = TIMER.findIndex(t => parseInt(t.kl, 10) >= NOW);
    const [openTime, setTime] = React.useState(null); // inline-utvidet time (forbered-kontekst)
    /* Bygges ved render (ikke modul-load) så tema-bytte flipper fargene. */
    const KPI = [{
      l: 'Aktive spillere',
      v: '9',
      u: 'i stall',
      c: T.fg,
      go: 'stall'
    }, {
      l: 'Timer i dag',
      v: String(TIMER.length),
      u: 'neste ' + (TIMER[nesteIdx] ? TIMER[nesteIdx].kl : '—'),
      c: T.fg,
      go: 'kalender'
    }, {
      l: 'Trenger deg nå',
      v: String(AKUTT.length),
      u: 'i triage',
      c: T.red,
      go: 'triage'
    }, {
      l: 'Plan-kvalitet',
      v: '82',
      u: 'snitt',
      c: T.lime,
      go: 'workbench'
    }, {
      l: 'MRR',
      v: '14 352',
      u: 'kr',
      c: T.fg,
      go: 'okonomi'
    }];
    const ALERTS = [{
      ic: 'triangle-alert',
      c: T.red,
      t: 'Sterkt avvik i Øyvinds uke 25',
      s: 'CS-nivå under anbefaling på ballkontakt-drill (lør)',
      go: 'workbench'
    }, {
      ic: 'activity',
      c: T.amber,
      t: 'Sofie nær ACWR-grense (1,46)',
      s: 'Vurder lettere uke neste mikrosyklus',
      go: 'analyse'
    }, {
      ic: 'trophy',
      c: T.lime,
      t: 'Mathias kvalifisert til NM Junior',
      s: 'Bekreft påmelding innen 3 dager',
      go: 'turneringer'
    }];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: T.base
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 24px',
        borderBottom: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: DISP,
        fontWeight: 700,
        fontSize: 21,
        color: T.fg,
        letterSpacing: '-0.01em',
        whiteSpace: 'nowrap'
      }
    }, "God morgen, Anders"), /*#__PURE__*/React.createElement(Mono, {
      size: 9.5,
      color: T.muted,
      style: {
        display: 'block',
        marginTop: 6
      }
    }, "Mandag 16. juni 2026 \xB7 Uke 25")), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        height: 30,
        padding: '0 13px',
        borderRadius: 9999,
        background: 'rgba(229,72,77,.1)',
        border: '1px solid rgba(229,72,77,.3)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "bell",
      size: 14,
      style: {
        color: T.red
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      color: T.red
    }, "3 varsler krever handling")), /*#__PURE__*/React.createElement("button", {
      onClick: () => go('workbench'),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 38,
        padding: '0 16px',
        borderRadius: 10,
        background: T.lime,
        border: 'none',
        color: T.base,
        fontFamily: UI,
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar",
      size: 16
    }), "\xC5pne Workbench")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '18px 24px 26px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5,1fr)',
        gap: 13
      }
    }, KPI.map((k, i) => /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => go(k.go),
      style: {
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        boxShadow: 'var(--sheen-top)',
        padding: 15,
        cursor: 'pointer',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      }
    }, k.l), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 5,
        marginTop: 11
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 25,
        fontWeight: 700,
        color: k.c,
        lineHeight: 1,
        letterSpacing: '-0.02em'
      }
    }, k.v), /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      style: {
        whiteSpace: 'nowrap'
      }
    }, k.u))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1.35fr 1fr',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Card, {
      pad: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 17px',
        borderBottom: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        letterSpacing: '0.12em',
        textTransform: 'uppercase'
      }
    }, "Varsler"), /*#__PURE__*/React.createElement("button", {
      onClick: () => go('innboks'),
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, "Innboks"), /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 13,
      style: {
        color: T.muted
      }
    }))), ALERTS.map((a, i) => /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => go(a.go),
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 11,
        width: '100%',
        textAlign: 'left',
        padding: '13px 17px',
        borderWidth: 0,
        borderStyle: 'solid',
        borderColor: T.border,
        borderBottomWidth: i < ALERTS.length - 1 ? 1 : 0,
        background: 'none',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: a.ic,
      size: 16,
      style: {
        color: a.c,
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
        fontFamily: UI,
        fontSize: 13.5,
        fontWeight: 600,
        color: T.fg,
        lineHeight: 1.35
      }
    }, a.t), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        display: 'block',
        marginTop: 5,
        lineHeight: 1.4
      }
    }, a.s)), /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 15,
      style: {
        color: T.muted,
        flex: 'none'
      }
    })))), /*#__PURE__*/React.createElement(Card, {
      pad: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 17px',
        borderBottom: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        letterSpacing: '0.12em',
        textTransform: 'uppercase'
      }
    }, "Dagens timer \xB7 ", TIMER.length), /*#__PURE__*/React.createElement("button", {
      onClick: () => go('kalender'),
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, "Kalender"), /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 13,
      style: {
        color: T.muted
      }
    }))), TIMER.map((t, i) => {
      const open = openTime === t.id;
      const past = i < nesteIdx,
        neste = i === nesteIdx;
      return /*#__PURE__*/React.createElement("div", {
        key: t.id,
        style: {
          borderBottom: i < TIMER.length - 1 ? `1px solid ${T.border}` : 'none'
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => setTime(open ? null : t.id),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          width: '100%',
          textAlign: 'left',
          padding: '12px 17px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          opacity: past ? 0.62 : 1
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        size: 11,
        weight: 700,
        color: T.fg,
        style: {
          width: 42,
          flex: 'none'
        }
      }, t.kl), /*#__PURE__*/React.createElement("span", {
        style: {
          width: 16,
          flex: 'none',
          display: 'flex',
          justifyContent: 'center'
        }
      }, past ? /*#__PURE__*/React.createElement(Icon, {
        name: "check",
        size: 13,
        style: {
          color: T.muted
        }
      }) : neste ? /*#__PURE__*/React.createElement("span", {
        style: {
          width: 7,
          height: 7,
          borderRadius: 9999,
          background: T.lime
        }
      }) : /*#__PURE__*/React.createElement("span", {
        style: {
          width: 5,
          height: 5,
          borderRadius: 9999,
          background: T.border
        }
      })), /*#__PURE__*/React.createElement("span", {
        style: {
          width: 30,
          height: 30,
          flex: 'none',
          borderRadius: 9999,
          background: T.raised,
          border: `1px solid ${T.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: MONO,
          fontSize: 9.5,
          fontWeight: 700,
          color: T.muted
        }
      }, t.ini), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: DISP,
          fontWeight: 600,
          fontSize: 13.5,
          color: T.fg,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, t.spiller, " \u2014 ", t.type), /*#__PURE__*/React.createElement(Mono, {
        size: 9,
        color: T.muted,
        style: {
          display: 'block',
          marginTop: 4
        }
      }, t.varighet, " \xB7 ", t.sted)), neste && /*#__PURE__*/React.createElement(Mono, {
        size: 8.5,
        color: T.lime,
        style: {
          flex: 'none',
          letterSpacing: '0.08em'
        }
      }, "NESTE"), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          height: 20,
          padding: '0 8px',
          borderRadius: 6,
          background: T.raised,
          border: `1px solid ${T.border}`,
          fontFamily: MONO,
          fontSize: 9,
          fontWeight: 700,
          color: T.muted,
          whiteSpace: 'nowrap'
        }
      }, t.arena), /*#__PURE__*/React.createElement(Icon, {
        name: open ? 'chevron-up' : 'chevron-down',
        size: 15,
        style: {
          color: T.muted,
          flex: 'none'
        }
      })), open && /*#__PURE__*/React.createElement("div", {
        style: {
          padding: '0 17px 14px 70px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }
      }, [['Sist', t.kontekst.sist], ['Video', t.kontekst.video], ['SG', t.kontekst.sg], ['Oppgave', t.kontekst.oppgave]].map(([k, v], j) => /*#__PURE__*/React.createElement("div", {
        key: j,
        style: {
          display: 'flex',
          gap: 9
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        size: 8.5,
        color: T.muted,
        style: {
          width: 52,
          flex: 'none',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          paddingTop: 1
        }
      }, k), /*#__PURE__*/React.createElement(Mono, {
        size: 10,
        color: T.fg,
        style: {
          lineHeight: 1.5,
          letterSpacing: '0.02em'
        }
      }, v))), /*#__PURE__*/React.createElement("button", {
        onClick: () => go('triage'),
        style: {
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          height: 28,
          padding: '0 11px',
          borderRadius: 8,
          background: T.raised,
          border: `1px solid ${T.border}`,
          color: T.fg,
          fontFamily: UI,
          fontSize: 11.5,
          fontWeight: 600,
          cursor: 'pointer',
          marginTop: 2
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "clipboard-check",
        size: 12
      }), "Forbered i Triage")));
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Card, {
      className: "dark",
      style: {
        background: 'linear-gradient(160deg, color-mix(in srgb,#005840 60%,#060706), #060706)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 13
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "trophy",
      size: 15,
      style: {
        color: '#D1F843'
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: "#D1F843",
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }
    }, "Hovedm\xE5l")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: DISP,
        fontWeight: 700,
        fontSize: 18,
        color: '#F0F0F0'
      }
    }, "NM Junior 2026"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        marginTop: 13
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 34,
        fontWeight: 700,
        color: '#D1F843',
        letterSpacing: '-0.02em',
        lineHeight: 0.9
      }
    }, "13"), /*#__PURE__*/React.createElement(Mono, {
      size: 11,
      color: "#C8CAC5"
    }, "uker igjen \xB7 topper uke 38")), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 6,
        borderRadius: 9999,
        background: 'rgba(0,0,0,.35)',
        marginTop: 15,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: '62%',
        height: '100%',
        background: '#D1F843'
      }
    })), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: "#C8CAC5",
      style: {
        display: 'block',
        marginTop: 9
      }
    }, "Periodisering 62% gjennomf\xF8rt"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 7,
        marginTop: 14,
        paddingTop: 13,
        borderTop: '1px solid rgba(255,255,255,.1)'
      }
    }, [['Spilleren bekreftet', true], ['Reise booket for begge', true], ['Bane-recon planlagt', false], ['Mental brief 5 dager før', false]].map(([l, done], i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: done ? 'circle-check' : 'circle',
      size: 14,
      style: {
        color: done ? '#D1F843' : 'rgba(255,255,255,.35)',
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: UI,
        fontSize: 12,
        fontWeight: 500,
        color: done ? '#C8CAC5' : '#F0F0F0',
        textDecoration: done ? 'line-through' : 'none',
        textDecorationColor: 'rgba(255,255,255,.3)'
      }
    }, l))))), /*#__PURE__*/React.createElement(Card, {
      pad: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 17px',
        borderBottom: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        letterSpacing: '0.12em',
        textTransform: 'uppercase'
      }
    }, "Trenger deg n\xE5 \xB7 ", AKUTT.length), /*#__PURE__*/React.createElement("button", {
      onClick: () => go('triage'),
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, "Triage"), /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 13,
      style: {
        color: T.muted
      }
    }))), AKUTT.slice(0, 3).map((a, i) => /*#__PURE__*/React.createElement("button", {
      key: a.id,
      onClick: () => go(a.til === 'kalender' ? 'kalender' : 'triage'),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        width: '100%',
        textAlign: 'left',
        padding: '11px 17px',
        borderWidth: 0,
        borderStyle: 'solid',
        borderColor: T.border,
        borderBottomWidth: 1,
        background: 'none',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 30,
        height: 30,
        flex: 'none',
        borderRadius: 9999,
        background: T.raised,
        border: `1px solid ${a.prio === 'høy' ? T.red : T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: MONO,
        fontSize: 9.5,
        fontWeight: 700,
        color: a.prio === 'høy' ? T.red : T.muted
      }
    }, a.ini), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: UI,
        fontSize: 12.5,
        fontWeight: 600,
        color: T.fg,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, a.spiller), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        display: 'block',
        marginTop: 3,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, a.hva)), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted,
      style: {
        flex: 'none'
      }
    }, a.alder))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '11px 17px'
      }
    }, KOTALL.map(k => /*#__PURE__*/React.createElement("button", {
      key: k.id,
      onClick: () => go('triage'),
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 12,
        fontWeight: 700,
        color: T.fg
      }
    }, k.n), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, k.tittel.toLowerCase()))))), /*#__PURE__*/React.createElement(Card, {
      pad: 15,
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        display: 'block',
        marginBottom: 13
      }
    }, "Hurtighandlinger"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 9
      }
    }, [{
      ic: 'plus',
      l: 'Ny økt for spiller',
      go: 'workbench'
    }, {
      ic: 'circle-check',
      l: 'Godkjenn ventende',
      go: 'godkjenninger',
      badge: PLANER
    }, {
      ic: 'message-circle',
      l: 'Send melding',
      go: 'innboks'
    }, {
      ic: 'target',
      l: 'Lag plan',
      go: 'plans'
    }, {
      ic: 'play',
      l: 'Start live-økt',
      go: 'live'
    }, {
      ic: 'clipboard-check',
      l: 'Tildel test',
      go: 'analyse'
    }].map((n, i) => /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => go(n.go),
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '13px 12px',
        borderRadius: 12,
        background: T.raised,
        border: `1px solid ${T.border}`,
        cursor: 'pointer',
        textAlign: 'left',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: n.ic,
      size: 18,
      style: {
        color: T.lime
      }
    }), n.badge ? /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 10,
        right: 10,
        minWidth: 18,
        height: 18,
        padding: '0 5px',
        borderRadius: 9999,
        background: T.lime,
        color: T.base,
        fontFamily: MONO,
        fontSize: 10,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, n.badge) : null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: UI,
        fontSize: 12.5,
        fontWeight: 600,
        color: T.fg
      }
    }, n.l))))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1.35fr 1fr',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement(Card, {
      pad: 0
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 17px',
        borderBottom: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        letterSpacing: '0.12em',
        textTransform: 'uppercase'
      }
    }, "Stall-uka \xB7 timer per akse"), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, "41 \xF8kter \xB7 8 runder \xB7 96 drills \xB7 6 tester")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '15px 17px 17px',
        display: 'flex',
        flexDirection: 'column',
        gap: 11
      }
    }, [['TURN', 10, 5], ['SPILL', 22, 25], ['SLAG', 18, 20], ['TEK', 28, 30], ['FYS', 22, 20]].map(([ax, act, mal]) => /*#__PURE__*/React.createElement("div", {
      key: ax,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9.5,
      weight: 700,
      color: AX_TEXT[ax],
      style: {
        width: 38,
        flex: 'none'
      }
    }, ax), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 10,
        borderRadius: 9999,
        background: T.raised,
        position: 'relative',
        overflow: 'visible'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${act / 32 * 100}%`,
        height: '100%',
        borderRadius: 9999,
        background: AX[ax]
      }
    }), /*#__PURE__*/React.createElement("span", {
      title: `Mål ${mal} t`,
      style: {
        position: 'absolute',
        left: `${mal / 32 * 100}%`,
        top: -3,
        width: 2,
        height: 16,
        borderRadius: 2,
        background: T.fg,
        opacity: 0.55
      }
    })), /*#__PURE__*/React.createElement(Mono, {
      size: 9.5,
      color: T.muted,
      style: {
        width: 92,
        flex: 'none',
        textAlign: 'right',
        whiteSpace: 'nowrap'
      }
    }, act, " t \xB7 m\xE5l ", mal))), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted,
      style: {
        marginTop: 3
      }
    }, "Fordelt tid p\xE5 tvers av stallen siste 7 dager \xB7 strek = ukens m\xE5l"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }
    }, [{
      t: 'Øyvinds sving-tempo glir',
      b: 'TrackMan viser tempo 3,0 → 2,7 siste tre økter. Bytt fokus fra fart til rytme på dagens teknikk-time kl 09:00.',
      cta: 'Se TrackMan',
      go: 'trackman'
    }, {
      t: 'Stall-snittet er på sitt beste',
      b: 'Snitt-HCP i stallen har gått fra 4,8 til 3,9 — best på seks måneder. Sofie og Mathias har bidratt mest; vurder dem til sommer-campen.',
      cta: 'Åpne stall',
      go: 'stall'
    }].map((a, i) => /*#__PURE__*/React.createElement(Card, {
      key: i,
      pad: 15
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        marginBottom: 9
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
        letterSpacing: '0.12em',
        textTransform: 'uppercase'
      }
    }, "AI-innsikt")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: DISP,
        fontWeight: 700,
        fontSize: 14.5,
        color: T.fg
      }
    }, a.t), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '7px 0 11px',
        fontFamily: UI,
        fontSize: 12,
        lineHeight: 1.55,
        color: '#C8CAC5'
      }
    }, a.b), /*#__PURE__*/React.createElement("button", {
      onClick: () => go(a.go),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 28,
        padding: '0 11px',
        borderRadius: 8,
        background: T.raised,
        border: `1px solid ${T.border}`,
        color: T.fg,
        fontFamily: UI,
        fontSize: 11.5,
        fontWeight: 600,
        cursor: 'pointer'
      }
    }, a.cta, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 12
    }))))))));
  }

  /* ── App ──────────────────────────────────────────────── */
  /* Init-tema: leser ThemeToggle-lageret (én kilde) og resolver system → lys/mørk. */
  function initTheme() {
    try {
      var s = localStorage.getItem('ak-agencyos-theme');
      if (s === 'light' || s === 'dark') return s;
      if (s === 'system' && window.matchMedia) return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {}
    return 'dark';
  }
  function App() {
    const [active, setActive] = React.useState('cockpit');
    const [theme, setTheme] = React.useState(initTheme);
    const screen = ALL.find(n => n.id === active);

    /* Tema-bytte: muter JS-token-matrisen (T/AX/… in-place) + sett rot-klasse,
       og re-render (setTheme) så Cockpit leser nye T-verdier. Iframe-moduler får
       tema via ?theme på src + remount (key). */
    const handleTheme = React.useCallback(resolved => {
      D.applyTheme(resolved);
      setTheme(resolved);
    }, []);
    React.useEffect(() => {
      D.applyTheme(theme);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* H · Global søk / ⌘K — moduler kjører i egne iframes, så et modul-mountet
       palette-instans postMessage'r hit for å bytte aktiv fane i tillegg til å
       navigere sin egen iframe. */
    React.useEffect(() => {
      function onMsg(e) {
        if (e && e.data && (e.data.akCmdK || e.data.akNav) && e.data.go) setActive(e.data.go);
      }
      window.addEventListener('message', onMsg);
      return () => window.removeEventListener('message', onMsg);
    }, []);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        width: 1520,
        height: 880,
        background: T.base,
        color: T.fg,
        display: 'flex',
        overflow: 'hidden',
        fontFamily: UI
      }
    }, /*#__PURE__*/React.createElement(Rail, {
      active: active,
      go: setActive,
      theme: theme,
      onTheme: handleTheme
    }), active === 'cockpit' ? /*#__PURE__*/React.createElement(Cockpit, {
      go: setActive
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        position: 'relative',
        background: T.base
      }
    }, /*#__PURE__*/React.createElement("iframe", {
      key: active + '·' + theme,
      src: screen.file + '?akhost=1&theme=' + theme,
      title: screen.label,
      style: {
        width: '100%',
        height: '100%'
      }
    })), React.createElement(window.CommandPalette.Palette, {
      currentId: active,
      onSelect: item => setActive(item.id)
    }));
  }
  window.AGENCYOS = {
    App
  };
})();
})(); 