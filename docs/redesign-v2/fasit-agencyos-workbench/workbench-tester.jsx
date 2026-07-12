// FASIT-REFERANSE (ekstrahert fra Claude Design offline-eksport 2026-07-12)
// Original sti: ui_kits/agencyos/workbench-tester.jsx
// KUN referanse for v2-ombygging — importeres ALDRI av appen.

try { (() => {
/* AK Golf HQ — Workbench-modus «Tester · tildel» (3.9-punkt 4, nybygg).
   Tester er kontrollpunkter i periodiseringen: bibliotek → uke-velger m/
   fase-/konflikt-kontekst → tildel (skriver til WBDATA.TESTPLAN — delt kilde
   m/ Årsplan-sporet). AI-anbefaling m/ full kontrakt. Resultater attesteres
   av vitne før de teller i utviklingsplanen (jf. Analyse).
   Koder (M2/PR2) kun i coach-rollen; spiller ser klarspråk.
   Eksporterer window.WBTEST. */
(function () {
  const NS = window.AKGolfHQDesignSystem_bb9b2b;
  const {
    Icon,
    TestResultatKort
  } = NS;
  const D = window.WBDATA;
  const {
    T,
    AX,
    ARENA,
    PRESSN
  } = D;
  const {
    Mono
  } = window.WBZ;
  const UI = 'Inter,system-ui,sans-serif',
    DISP = 'Familjen Grotesk,Inter,system-ui,sans-serif',
    MONO = 'JetBrains Mono,ui-monospace,monospace';
  const BIB = D.TESTBIBLIOTEK || [];
  const TM = window.TRACKMANDATA || null; /* delt kilde (Fase 3.10 trinn 8) — test-attestasjon kan skrive kontrollpunkt-målinger hit */
  const CUR = 25;
  const UKER = Array.from({
    length: 21
  }, (_, i) => 26 + i); // uke 26–46
  /* Fase per uke — parses PERIODER-ukestrengene ('19–31') */
  const FASER = Object.keys(D.PERIODER || {}).map(label => {
    const [a, b] = (D.PERIODER[label].uker || '').split(/[–-]/).map(n => parseInt(n, 10));
    return {
      label,
      a,
      b
    };
  });
  const faseFor = w => FASER.find(f => w >= f.a && w <= f.b) || null;
  const turnFor = w => {
    const td = window.TURNDATA;
    const l = td ? td.TURNERINGER : [{
      uke: 32,
      prio: 'B',
      navn: 'Regionals'
    }, {
      uke: 38,
      prio: 'A',
      navn: 'NM'
    }];
    return l.find(t => t.uke === w) || null;
  };
  const FORSLAG = {
    protId: 'cs',
    uke: 29,
    hvorfor: 'CS-utviklingen er umålt siden mars — treningen i Spesialisering har hatt fart som hovedvekt.',
    hva: 'CS-profil i uke 29, rett etter sommerleiren (uke 27–28).',
    effekt: 'Fersk fartskurve før Nedtrapping — viser om CS-målet mot NM holder.',
    naa: 'Siste rolige treningsuke: uke 30+ er NM-forberedelse, og Q3-batteriet i uke 32 måler ferdighet, ikke fart.'
  };
  const sitVis = (sit, role) => {
    const v = (ARENA[sit] || {}).vis || sit;
    return role === 'coach' ? v : v.split(' · ')[1] || v;
  };
  const pressVis = (p, role) => role === 'coach' ? p : (PRESSN[p] || {}).navn || p;
  function Innhold({
    role = 'coach',
    embedded = true
  }) {
    const [protId, setProtId] = React.useState('pei');
    const [uke, setUke] = React.useState(32);
    const [plan, setPlan] = React.useState(() => (D.TESTPLAN || []).slice());
    const [nye, setNye] = React.useState([]);
    const [forslagBrukt, setForslagBrukt] = React.useState(false);
    const [toast, setToast] = React.useState(null);
    const [milepaelForslag, setMilepaelForslag] = React.useState(null); // { testId, mil }
    const [avvistMilepael, setAvvistMilepael] = React.useState([]);
    const prot = BIB.find(p => p.id === protId) || BIB[0];
    const fase = faseFor(uke);
    const turn = turnFor(uke);
    const iPlan = w => plan.filter(t => t.uke === w);
    const ms = w => (D.UTVIKLINGSPLAN || []).filter(m => m.uke === w);
    const visToast = m => {
      setToast(m);
      window.clearTimeout(visToast._t);
      visToast._t = window.setTimeout(() => setToast(null), 3400);
    };
    const brukForslag = () => {
      setProtId(FORSLAG.protId);
      setUke(FORSLAG.uke);
      setForslagBrukt(true);
    };
    const tildel = () => {
      const item = {
        id: 't' + Date.now(),
        prot: prot.navn,
        kort: prot.kort,
        q: null,
        uke,
        status: 'planlagt',
        sit: prot.sit,
        press: prot.press
      };
      setPlan(p => p.concat(item).sort((a, b) => a.uke - b.uke));
      setNye(n => n.concat(item.id));
      if (D.TESTPLAN) D.TESTPLAN.push(item); // delt kilde — Årsplan-sporet plukker den opp
      visToast(`${prot.navn} tildelt — uke ${uke}. Synlig i test-sporet på Årsplan.`);
    };

    /* ── Attester (vitne) — trinn 8: skriver kontrollpunkt-måling til
       trackman-data.js (om protokollen har tmParam) og *foreslår* (aldri auto)
       å fullføre en tilknyttet P-milepæl når resultatet er bestått. ── */
    const attester = t => {
      setPlan(p => p.map(x => x.id === t.id ? {
        ...x,
        attestert: true
      } : x));
      const src = (D.TESTPLAN || []).find(x => x.id === t.id);
      if (src) src.attestert = true;
      const prot = BIB.find(b => b.kort === t.kort);
      let tmMsg = '';
      if (TM && prot && prot.tmParam && t.resultat) {
        const m = TM.MAALINGER[prot.tmParam];
        if (m) {
          const punkt = {
            uke: t.uke,
            verdi: t.resultat.verdi,
            cs: 'CS70',
            sit: t.sit,
            press: t.press
          };
          const idx = m.trend.findIndex(p => p.uke > punkt.uke);
          if (idx === -1) m.trend.push(punkt);else m.trend.splice(idx, 0, punkt);
          tmMsg = ` · ${prot.tmParam}-måling lagt i utviklingsplanen`;
        }
      }
      visToast(`${t.prot}${t.q ? ' ' + t.q : ''} attestert${tmMsg}.`);
      if (t.milepael && t.resultat && t.resultat.bestatt && avvistMilepael.indexOf(t.milepael) === -1) {
        const mil = (D.UTVIKLINGSPLAN || []).find(m => m.id === t.milepael);
        if (mil && mil.status !== 'ferdig') setMilepaelForslag({
          testId: t.id,
          mil
        });
      }
    };
    const brukMilepaelForslag = () => {
      if (!milepaelForslag) return;
      milepaelForslag.mil.status = 'ferdig';
      visToast(`${milepaelForslag.mil.id} markert fullført i utviklingsplanen.`);
      setMilepaelForslag(null);
    };
    const avvisMilepaelForslag = () => {
      if (milepaelForslag) setAvvistMilepael(a => a.concat(milepaelForslag.mil.id));
      setMilepaelForslag(null);
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        background: T.base,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 18px',
        borderBottom: `1px solid ${T.border}`,
        background: T.card
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "target",
      size: 14,
      style: {
        color: T.lime
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: DISP,
        fontWeight: 700,
        fontSize: 13,
        color: T.fg,
        whiteSpace: 'nowrap'
      }
    }, "Tester \xB7 tildel"), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted,
      style: {
        whiteSpace: 'nowrap'
      }
    }, "kontrollpunkter i periodiseringen \xB7 \xD8yvind Rohjan"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("a", {
      href: "analyse.html",
      title: "Resultater og attestasjon leses i Analyse",
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        textDecoration: 'none',
        color: T.muted,
        fontFamily: MONO,
        fontSize: 9,
        fontWeight: 700
      }
    }, "RESULTATER I ANALYSE", /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 11
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        minHeight: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 264,
        flex: 'none',
        borderRight: `1px solid ${T.border}`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        padding: '12px 14px 8px'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted,
      style: {
        letterSpacing: '0.11em',
        textTransform: 'uppercase'
      }
    }, "Testbibliotek")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '0 10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 7
      }
    }, BIB.map(p => {
      const on = protId === p.id;
      return /*#__PURE__*/React.createElement("button", {
        key: p.id,
        onClick: () => setProtId(p.id),
        style: {
          textAlign: 'left',
          padding: '10px 11px',
          borderRadius: 10,
          background: on ? T.raised : 'transparent',
          border: `1px solid ${on ? `color-mix(in srgb,${T.lime} 45%,${T.border})` : T.border}`,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: 6
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 7
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 3,
          height: 14,
          borderRadius: 2,
          background: AX[p.omrade],
          flex: 'none'
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          fontFamily: UI,
          fontSize: 12.5,
          fontWeight: 700,
          color: T.fg
        }
      }, p.navn), on && /*#__PURE__*/React.createElement(Icon, {
        name: "check",
        size: 12,
        style: {
          color: T.lime
        }
      })), /*#__PURE__*/React.createElement(Mono, {
        size: 8.5,
        color: T.muted
      }, p.dur + ' · ' + sitVis(p.sit, role) + ' · ' + pressVis(p.press, role)), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap'
        }
      }, p.maaler.map(m => /*#__PURE__*/React.createElement("span", {
        key: m,
        style: {
          fontFamily: MONO,
          fontSize: 8,
          color: T.muted,
          border: `1px solid ${T.border}`,
          borderRadius: 4,
          padding: '1px 5px'
        }
      }, m))));
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        overflowY: 'auto',
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 9,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted,
      style: {
        letterSpacing: '0.11em',
        textTransform: 'uppercase'
      }
    }, "Velg uke"), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted
    }, "uke 26\u201346 \xB7 mark\xF8rer: test \xB7 turnering \xB7 P-milep\xE6l")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: `repeat(${UKER.length},1fr)`,
        gap: 3
      }
    }, UKER.map(w => {
      const on = uke === w,
        anb = w === FORSLAG.uke,
        f = faseFor(w),
        tu = turnFor(w),
        tests = iPlan(w),
        mils = ms(w);
      return /*#__PURE__*/React.createElement("button", {
        key: w,
        onClick: () => setUke(w),
        title: `Uke ${w}${f ? ' · ' + f.label : ''}${tu ? ' · ' + tu.navn + ' (' + tu.prio + ')' : ''}${tests.length ? ' · ' + tests.map(t => t.prot).join(', ') : ''}${mils.length ? ' · ' + mils.map(m => m.id).join(', ') : ''}${anb ? ' · AI-anbefalt' : ''}`,
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          padding: '7px 0 6px',
          borderRadius: 8,
          background: on ? T.raised : 'transparent',
          border: on ? `1.5px solid ${T.lime}` : anb ? `1.5px dashed color-mix(in srgb,${T.lime} 55%,${T.border})` : `1px solid ${T.border}`,
          cursor: 'pointer'
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        size: 9.5,
        weight: 700,
        color: on ? T.fg : T.muted
      }, w), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 2,
          height: 8,
          alignItems: 'center'
        }
      }, tests.length > 0 && /*#__PURE__*/React.createElement(Icon, {
        name: "target",
        size: 8,
        style: {
          color: tests.some(t => t.status === 'fullført') ? T.lime : T.muted
        }
      }), tu && /*#__PURE__*/React.createElement("span", {
        style: {
          width: 6,
          height: 6,
          transform: 'rotate(45deg)',
          borderRadius: 1,
          background: tu.prio === 'A' ? T.redSolid : T.amber
        }
      }), mils.length > 0 && /*#__PURE__*/React.createElement(Icon, {
        name: "git-branch",
        size: 8,
        style: {
          color: AX[mils[0].ax]
        }
      })));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.fg,
      weight: 700
    }, "Uke ", uke), fase && /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, fase.label, " \xB7 uke ", fase.a, "\u2013", fase.b), turn && /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: turn.prio === 'A' ? T.redSolid : T.amber
    }, turn.navn, " \xB7 ", turn.prio, "-turnering samme uke"))), turn && turn.prio === 'A' && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 9,
        padding: '10px 12px',
        borderRadius: 10,
        background: `color-mix(in srgb,${T.amber} 7%,${T.card})`,
        border: `1px solid color-mix(in srgb,${T.amber} 32%,${T.border})`
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      size: 13,
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
      weight: 700,
      color: T.amber,
      style: {
        letterSpacing: '0.07em',
        textTransform: 'uppercase'
      }
    }, "Avviker fra anbefaling"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: UI,
        fontSize: 12,
        color: T.fg,
        marginTop: 3,
        lineHeight: 1.5
      }
    }, "Test samme uke som ", turn.navn, " (A-turnering). Uka f\xF8r gir renere m\xE5ling \u2014 men ingenting blokkeres."))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 11,
        background: T.card,
        border: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 3,
        height: 30,
        borderRadius: 2,
        background: AX[prot.omrade],
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
        fontSize: 13,
        fontWeight: 700,
        color: T.fg
      }
    }, prot.navn, " \xB7 uke ", uke), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, sitVis(prot.sit, role) + ' · ' + pressVis(prot.press, role) + ' · ' + prot.dur + (fase ? ' · ' + fase.label : ''))), /*#__PURE__*/React.createElement("button", {
      onClick: tildel,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        height: 34,
        padding: '0 16px',
        borderRadius: 9999,
        background: T.forest,
        border: 'none',
        color: T.lime,
        fontFamily: UI,
        fontSize: 12.5,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "target",
      size: 13
    }), "Tildel test")), !forslagBrukt && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '13px 14px',
        borderRadius: 11,
        background: T.card,
        border: `1px solid color-mix(in srgb,${T.lime} 26%,${T.border})`,
        display: 'flex',
        flexDirection: 'column',
        gap: 9
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "sparkles",
      size: 12,
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
    }, "AI-anbefaling \xB7 test"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted
    }, "aldri sperrer")), [['Hvorfor', FORSLAG.hvorfor], ['Hva', FORSLAG.hva], ['Forventet effekt', FORSLAG.effekt], ['Hvorfor nå', FORSLAG.naa]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        display: 'flex',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8,
      color: T.muted,
      style: {
        width: 96,
        flex: 'none',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        paddingTop: 2
      }
    }, k), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontFamily: UI,
        fontSize: 12,
        color: T.fg,
        lineHeight: 1.5
      }
    }, v))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        marginTop: 2
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: brukForslag,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 28,
        padding: '0 13px',
        borderRadius: 9999,
        background: T.fg,
        border: 'none',
        color: T.base,
        fontFamily: UI,
        fontSize: 11.5,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, "Bruk forslag"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setForslagBrukt(true),
      style: {
        height: 28,
        padding: '0 12px',
        borderRadius: 9999,
        background: 'transparent',
        border: `1px solid ${T.border}`,
        color: T.muted,
        fontFamily: UI,
        fontSize: 11.5,
        fontWeight: 600,
        cursor: 'pointer'
      }
    }, "Avvis")))), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 316,
        flex: 'none',
        borderLeft: `1px solid ${T.border}`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        padding: '12px 14px 8px',
        display: 'flex',
        alignItems: 'baseline',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted,
      style: {
        letterSpacing: '0.11em',
        textTransform: 'uppercase'
      }
    }, "Testplan 2026"), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted
    }, plan.length, " tester")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '0 12px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, milepaelForslag && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '11px 12px',
        borderRadius: 11,
        background: T.card,
        border: `1px solid color-mix(in srgb,${T.lime} 30%,${T.border})`,
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "sparkles",
      size: 11,
      style: {
        color: T.lime
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 8,
      color: T.lime,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }
    }, "AI-forslag \xB7 milep\xE6l"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 7.5,
      color: T.muted
    }, "aldri sperrer")), [['Hvorfor', 'Attestert resultat teller nå som bevis på utviklingsplanen.'], ['Hva', `Marker «${milepaelForslag.mil.t}» (${milepaelForslag.mil.id}) som fullført.`], ['Effekt', 'Milepælen flyttes til ferdig på Årsplan-sporet.']].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        display: 'flex',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 7,
      color: T.muted,
      style: {
        width: 52,
        flex: 'none',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        paddingTop: 1.5,
        lineHeight: 1.35
      }
    }, k), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontFamily: UI,
        fontSize: 10.5,
        lineHeight: 1.45,
        color: T.fg
      }
    }, v))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        marginTop: 2
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: brukMilepaelForslag,
      style: {
        flex: 1,
        height: 26,
        borderRadius: 7,
        background: T.lime,
        border: 'none',
        color: T.base,
        fontFamily: UI,
        fontSize: 11,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, "Bruk forslag"), /*#__PURE__*/React.createElement("button", {
      onClick: avvisMilepaelForslag,
      style: {
        height: 26,
        padding: '0 10px',
        borderRadius: 7,
        background: 'transparent',
        border: `1px solid ${T.border}`,
        color: T.muted,
        fontFamily: UI,
        fontSize: 11,
        fontWeight: 600,
        cursor: 'pointer'
      }
    }, "Avvis"))), plan.map(t => t.status === 'fullført' && t.resultat ? /*#__PURE__*/React.createElement("div", {
      key: t.id,
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(TestResultatKort, {
      navn: t.prot + (t.q ? ' · ' + t.q : ''),
      protokoll: undefined,
      omrade: BIB.find(b => b.kort === t.kort)?.omrade || 'TEK',
      verdi: t.resultat.verdi,
      enhet: t.resultat.enhet,
      krav: t.resultat.krav,
      bestatt: t.resultat.bestatt,
      trend: t.resultat.trend,
      arena: sitVis(t.sit, role),
      press: pressVis(t.press, role),
      dato: t.dato
    }), t.attestert ? /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        paddingLeft: 2
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 11,
      style: {
        color: T.lime
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted
    }, "Attestert \u2014 teller i utviklingsplanen")) : /*#__PURE__*/React.createElement("button", {
      onClick: () => attester(t),
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        alignSelf: 'flex-start',
        height: 22,
        padding: '0 9px',
        borderRadius: 9999,
        background: 'transparent',
        border: `1px solid color-mix(in srgb,${T.amber} 45%,${T.border})`,
        color: T.amber,
        fontFamily: MONO,
        fontSize: 8.5,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "shield",
      size: 11
    }), "Attester (vitne)")) : /*#__PURE__*/React.createElement("div", {
      key: t.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '9px 11px',
        borderRadius: 10,
        background: T.card,
        border: `1px solid ${nye.indexOf(t.id) !== -1 ? `color-mix(in srgb,${T.lime} 45%,${T.border})` : T.border}`
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "target",
      size: 12,
      style: {
        color: T.muted,
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
    }, t.prot, t.q ? ' · ' + t.q : ''), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted
    }, 'uke ' + t.uke + ' · ' + sitVis(t.sit, role))), nye.indexOf(t.id) !== -1 && /*#__PURE__*/React.createElement(Mono, {
      size: 8,
      weight: 700,
      color: T.lime
    }, "NY"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 7,
        padding: '9px 11px',
        borderRadius: 9,
        background: T.raised,
        border: `1px solid ${T.border}`,
        marginTop: 2
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "info",
      size: 11,
      style: {
        color: T.muted,
        flex: 'none',
        marginTop: 1
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted,
      style: {
        lineHeight: 1.6
      }
    }, "Husregel: resultater attesteres av vitne f\xF8r de teller i utviklingsplanen."))))), toast && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '9px 14px',
        borderRadius: 10,
        background: T.raised,
        border: `1px solid ${T.border}`,
        boxShadow: 'var(--shadow-popover)',
        zIndex: 40
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 13,
      style: {
        color: T.lime
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: UI,
        fontSize: 12,
        color: T.fg,
        whiteSpace: 'nowrap'
      }
    }, toast)));
  }
  window.WBTEST = {
    Innhold
  };
})();
})(); 