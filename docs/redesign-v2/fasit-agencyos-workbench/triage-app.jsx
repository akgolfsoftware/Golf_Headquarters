// FASIT-REFERANSE (ekstrahert fra Claude Design offline-eksport 2026-07-12)
// Original sti: ui_kits/agencyos/triage-app.jsx
// KUN referanse for v2-ombygging — importeres ALDRI av appen.

try { (() => {
/* AK Golf HQ — Triage-cockpit (100 spillere). Unntaksdrevet: køer venstre,
   dagens fysiske timer høyre m/ forbered-peek (Drawer). Tom kø = grønn stall.
   Eksporterer window.TRIAGE. */
(function () {
  const DS = window.AKGolfHQDesignSystem_bb9b2b;
  const {
    Icon,
    Tag,
    Drawer
  } = DS;
  const TD = window.TRIAGEDATA;
  const UI = 'Inter,system-ui,sans-serif',
    DISP = 'var(--font-display)',
    MONO = 'JetBrains Mono,ui-monospace,monospace';
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
        fontVariantNumeric: 'tabular-nums',
        ...style
      }
    }, children);
  }

  /* Dataliv: hero-tallet teller opp 0→verdi ved innlasting (mount-only),
     respekterer prefers-reduced-motion; senere endringer (kvittering) følger live uten re-animasjon. */
  function useMountCountUp(target, duration = 800) {
    const reduce = React.useRef(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const [val, setVal] = React.useState(reduce.current ? target : 0);
    const mounted = React.useRef(false);
    React.useEffect(() => {
      if (mounted.current) {
        setVal(target);
        return undefined;
      }
      mounted.current = true;
      if (reduce.current) {
        setVal(target);
        return undefined;
      }
      let raf,
        start = null,
        done = false;
      const finish = () => {
        if (!done) {
          done = true;
          setVal(target);
        }
      };
      const tick = t => {
        if (start === null) start = t;
        const p = Math.min(1, (t - start) / duration);
        if (p >= 1) {
          finish();
          return;
        }
        setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      const fb = setTimeout(finish, duration + 400);
      return () => {
        raf && cancelAnimationFrame(raf);
        clearTimeout(fb);
      };
    }, [target]);
    return val;
  }
  function Avatar({
    ini,
    size = 30
  }) {
    return /*#__PURE__*/React.createElement("span", {
      style: {
        width: size,
        height: size,
        flex: 'none',
        borderRadius: 9999,
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: MONO,
        fontSize: size * 0.32,
        fontWeight: 700,
        color: 'var(--text-2)'
      }
    }, ini);
  }

  /* ── Én rad i en kø ─────────────────────────────────────── */
  function TriageRad({
    item,
    onDone
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 11,
        alignItems: 'flex-start',
        padding: '11px 14px',
        borderTop: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      ini: item.ini
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: UI,
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--text)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, item.hva), item.prio === 'høy' && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: 9999,
        background: 'var(--error-solid)',
        flex: 'none'
      },
      title: "H\xF8y prioritet"
    }), item.forfalt && /*#__PURE__*/React.createElement(Tag, {
      variant: "warning",
      size: "sm"
    }, "forfalt")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: UI,
        fontSize: 12,
        color: 'var(--text-muted)',
        lineHeight: 1.45,
        marginTop: 3
      }
    }, item.detalj), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        marginTop: 6
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9
    }, item.spiller), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 3,
        height: 3,
        borderRadius: 9999,
        background: 'var(--border-strong)'
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9
    }, item.gruppe), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 3,
        height: 3,
        borderRadius: 9999,
        background: 'var(--border-strong)'
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: item.prio === 'høy' ? 'var(--warning)' : 'var(--text-muted)'
    }, item.alder))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        alignItems: 'flex-end',
        flex: 'none'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onDone,
      style: {
        height: 26,
        padding: '0 11px',
        borderRadius: 8,
        border: '1px solid var(--border-strong)',
        background: 'transparent',
        color: 'var(--text)',
        fontFamily: UI,
        fontSize: 11.5,
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap'
      }
    }, item.handling)));
  }

  /* ── Kø-seksjon ─────────────────────────────────────────── */
  function Ko({
    def,
    items,
    onDone
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '11px 14px'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: def.ikon,
      size: 14,
      style: {
        color: items.length ? 'var(--text-2)' : 'var(--text-faint)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: UI,
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--text)'
      }
    }, def.tittel), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), items.length > 0 ? /*#__PURE__*/React.createElement(Mono, {
      size: 11,
      weight: 700,
      color: "var(--text)"
    }, items.length) : /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 12,
      style: {
        color: 'var(--success)'
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: "var(--success)"
    }, "tom"))), items.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '4px 14px 13px',
        fontFamily: UI,
        fontSize: 12,
        color: 'var(--text-faint)'
      }
    }, def.tom) : items.map(it => /*#__PURE__*/React.createElement(TriageRad, {
      key: it.id,
      item: it,
      onDone: onDone(it)
    })));
  }

  /* ── Dagens time-rad + forbered-peek. `next` = neste fysiske time — får nå-prikk
     i --signal-fill (lime-utvidelsen: data-bundet nå-markør, 1px kant på lys). ── */
  function TimeRad({
    t,
    next,
    onForbered
  }) {
    return /*#__PURE__*/React.createElement("button", {
      onClick: onForbered,
      style: {
        display: 'flex',
        gap: 11,
        width: '100%',
        textAlign: 'left',
        alignItems: 'center',
        padding: '11px 13px',
        borderRadius: 12,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        position: 'relative'
      }
    }, next && /*#__PURE__*/React.createElement("span", {
      title: "Neste time",
      style: {
        position: 'absolute',
        left: 5,
        top: 14,
        width: 5,
        height: 5,
        borderRadius: 9999,
        background: 'var(--signal-fill)',
        boxShadow: '0 0 0 1px var(--signal-fill-edge)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        textAlign: 'right',
        width: 40
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 12,
      weight: 700,
      color: "var(--text)",
      style: {
        display: 'block'
      }
    }, t.kl), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      style: {
        display: 'block',
        marginTop: 3
      }
    }, t.varighet)), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 1,
        alignSelf: 'stretch',
        background: 'var(--border)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: UI,
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--text)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, t.spiller), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: UI,
        fontSize: 11.5,
        color: 'var(--text-muted)',
        marginTop: 2,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, t.type, " \xB7 ", t.arena)), /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 15,
      style: {
        color: 'var(--text-muted)',
        flex: 'none'
      }
    }));
  }
  function ForberedPeek({
    time,
    onClose
  }) {
    if (!time) return null;
    const K = time.kontekst;
    const rader = [{
      lbl: 'Sist jobbet med',
      txt: K.sist,
      ikon: 'target'
    }, {
      lbl: 'Video',
      txt: K.video,
      ikon: 'play'
    }, {
      lbl: 'SG-status',
      txt: K.sg,
      ikon: 'trending-up'
    }, {
      lbl: 'Oppgave',
      txt: K.oppgave,
      ikon: 'circle-check'
    }];
    return /*#__PURE__*/React.createElement(Drawer, {
      open: !!time,
      title: `${time.kl} · ${time.spiller}`,
      onClose: onClose,
      footer: /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 8,
          justifyContent: 'flex-end'
        }
      }, /*#__PURE__*/React.createElement("button", {
        style: {
          height: 32,
          padding: '0 12px',
          borderRadius: 10,
          background: 'transparent',
          border: '1px solid var(--border-strong)',
          color: 'var(--text-2)',
          fontFamily: UI,
          fontSize: 12.5,
          fontWeight: 500,
          cursor: 'pointer'
        }
      }, "\xC5pne spiller"), /*#__PURE__*/React.createElement("button", {
        style: {
          height: 32,
          padding: '0 14px',
          borderRadius: 10,
          border: 'none',
          background: 'var(--signal)',
          color: 'var(--on-signal)',
          fontFamily: UI,
          fontSize: 12.5,
          fontWeight: 700,
          cursor: 'pointer'
        }
      }, "Start \xF8kta"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: UI,
        fontSize: 13,
        color: 'var(--text-2)'
      }
    }, time.type, " \xB7 ", time.sted), /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      color: "var(--text-2)"
    }, time.arena), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: 'var(--border)'
      }
    }), rader.map(r => /*#__PURE__*/React.createElement("div", {
      key: r.lbl,
      style: {
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: r.ikon,
      size: 14,
      style: {
        color: 'var(--text-muted)',
        flex: 'none',
        marginTop: 1
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      style: {
        display: 'block',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        marginBottom: 3
      }
    }, r.lbl), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: UI,
        fontSize: 12.5,
        color: r.txt.startsWith('SE FØR') ? 'var(--warning)' : 'var(--text)',
        lineHeight: 1.45
      }
    }, r.txt))))));
  }

  /* ── App ────────────────────────────────────────────────── */
  function App() {
    const [gjort, setGjort] = React.useState({});
    const [peek, setPeek] = React.useState(null);
    const [filter, setFilter] = React.useState('alle');
    const GRUPPER = ['alle', 'Elite', 'Junior', 'Utvikling'];
    const synlig = TD.ITEMS.filter(i => !gjort[i.id] && (filter === 'alle' || i.gruppe === filter || i.gruppe.includes('spillere')));
    const antall = synlig.length;
    const antallVist = useMountCountUp(antall);
    const marker = it => () => setGjort(p => ({
      ...p,
      [it.id]: true
    }));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        width: 1280,
        height: 860,
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: UI,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 18,
        overflow: 'hidden',
        border: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 22px',
        borderBottom: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: DISP,
        fontSize: 19,
        fontWeight: 700,
        letterSpacing: 'var(--tracking-display)',
        display: 'block'
      }
    }, "Cockpit"), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        display: 'block',
        marginTop: 3,
        textTransform: 'uppercase',
        letterSpacing: '0.1em'
      }
    }, "Onsdag 17. juni \xB7 stall: 100 spillere")), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 2
      }
    }, GRUPPER.map(g => /*#__PURE__*/React.createElement("button", {
      key: g,
      onClick: () => setFilter(g),
      style: {
        height: 27,
        padding: '0 11px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        background: filter === g ? 'var(--surface-hover)' : 'transparent',
        color: filter === g ? 'var(--text)' : 'var(--text-muted)',
        fontFamily: UI,
        fontSize: 12,
        fontWeight: filter === g ? 600 : 500
      }
    }, g === 'alle' ? 'Alle' : g))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 7,
        paddingLeft: 14,
        borderLeft: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 26,
        fontWeight: 700,
        color: antall ? 'var(--text)' : 'var(--success)',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1
      }
    }, antallVist), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        textTransform: 'uppercase',
        letterSpacing: '0.1em'
      }
    }, "i k\xF8"))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minHeight: 0,
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        overflowY: 'auto',
        padding: '16px 18px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }
    }, antall === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: '48px 0 10px'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 28,
      style: {
        color: 'var(--success)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: DISP,
        fontSize: 16,
        fontWeight: 600
      }
    }, "K\xF8en er tom \u2014 stallen er gr\xF8nn."), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: UI,
        fontSize: 12.5,
        color: 'var(--text-muted)'
      }
    }, "Neste fysiske time kl. ", TD.TIMER[0].kl, ". God tid til \xE5 se video i forkant.")), TD.KOER.map(def => /*#__PURE__*/React.createElement(Ko, {
      key: def.id,
      def: def,
      items: synlig.filter(i => i.ko === def.id),
      onDone: marker
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 316,
        flex: 'none',
        borderLeft: '1px solid var(--border)',
        overflowY: 'auto',
        padding: '16px 16px 22px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        textTransform: 'uppercase',
        letterSpacing: '0.12em'
      }
    }, "Dagens fysiske timer"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9
    }, TD.TIMER.length)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, TD.TIMER.map((t, idx) => /*#__PURE__*/React.createElement(TimeRad, {
      key: t.id,
      t: t,
      next: idx === 0,
      onForbered: () => setPeek(t)
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14,
        padding: '11px 13px',
        borderRadius: 12,
        border: '1px dashed var(--border-strong)',
        fontFamily: UI,
        fontSize: 11.5,
        color: 'var(--text-muted)',
        lineHeight: 1.5
      }
    }, "Klikk en time for \xE5 forberede deg: siste arbeid, video i k\xF8, SG-status og oppgaver \u2014 samlet p\xE5 ett sted."))), /*#__PURE__*/React.createElement(ForberedPeek, {
      time: peek,
      onClose: () => setPeek(null)
    }));
  }
  window.TRIAGE = {
    App
  };
})();
})(); 