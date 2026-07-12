// FASIT-REFERANSE (ekstrahert fra Claude Design offline-eksport 2026-07-12)
// Original sti: ui_kits/agencyos/stall-tidslinje-app.jsx
// KUN referanse for v2-ombygging — importeres ALDRI av appen.

try { (() => {
/* AK Golf HQ — Stall-tidslinje (V3, Notion-Timeline).
   Én bane per spiller i stallen: periodefaser (makro) som barer m/ full DnD
   (flytt + kant-drag), turneringer som TURN-diamanter, peak som lime-punkt
   (maks én per spiller-visning). Zoom uke/måned/kvartal via VisningsVelger-tabs?
   Nei — zoom er SegmentedTabs-fri tekst-tabs i topplinja. Eksporterer window.STALLTL. */
(function () {
  const DS = window.AKGolfHQDesignSystem_bb9b2b;
  const {
    Icon,
    Tidslinje,
    Tag
  } = DS;
  const UI = 'Inter,system-ui,sans-serif',
    DISP = 'var(--font-display)',
    MONO = 'JetBrains Mono,ui-monospace,monospace';

  /* Vakt: eldre bundle uten Tidslinje-eksporten skal ikke blanke skjermen. */
  const KLAR = !!(Tidslinje && Tidslinje.Bane);
  const TICKS = [{
    ved: 0,
    tekst: 'Jan'
  }, {
    ved: 4,
    tekst: 'Feb'
  }, {
    ved: 9,
    tekst: 'Mar'
  }, {
    ved: 13,
    tekst: 'Apr'
  }, {
    ved: 17,
    tekst: 'Mai'
  }, {
    ved: 22,
    tekst: 'Jun'
  }, {
    ved: 26,
    tekst: 'Jul'
  }, {
    ved: 30,
    tekst: 'Aug'
  }, {
    ved: 35,
    tekst: 'Sep'
  }, {
    ved: 39,
    tekst: 'Okt'
  }, {
    ved: 43,
    tekst: 'Nov'
  }, {
    ved: 48,
    tekst: 'Des'
  }];

  /* Faser bruker akse-farger kun der fasen ER akse-dominant (FYS i Base osv.) */
  const START = {
    oyvind: [{
      id: 'oy1',
      fra: 0,
      til: 9,
      akse: 'FYS',
      navn: 'Base'
    }, {
      id: 'oy2',
      fra: 9,
      til: 20,
      akse: 'TEK',
      navn: 'Forberedelse'
    }, {
      id: 'oy3',
      fra: 20,
      til: 27,
      akse: 'SLAG',
      navn: 'Spesialisering'
    }, {
      id: 'oy4',
      fra: 27,
      til: 30,
      akse: 'SPILL',
      navn: 'Nedtrapping'
    }, {
      id: 'oy5',
      fra: 30,
      til: 34,
      akse: 'TURN',
      navn: 'Peak'
    }, {
      id: 'oy6',
      fra: 34,
      til: 40,
      navn: 'Overgang'
    }],
    mia: [{
      id: 'mi1',
      fra: 2,
      til: 12,
      akse: 'FYS',
      navn: 'Base'
    }, {
      id: 'mi2',
      fra: 12,
      til: 24,
      akse: 'TEK',
      navn: 'Forberedelse'
    }, {
      id: 'mi3',
      fra: 24,
      til: 31,
      akse: 'SLAG',
      navn: 'Spesialisering'
    }, {
      id: 'mi4',
      fra: 31,
      til: 35,
      akse: 'TURN',
      navn: 'Peak'
    }],
    jonas: [{
      id: 'jo1',
      fra: 0,
      til: 14,
      akse: 'FYS',
      navn: 'Base'
    }, {
      id: 'jo2',
      fra: 14,
      til: 28,
      akse: 'TEK',
      navn: 'Forberedelse',
      utkast: true
    }]
  };
  const SPILLERE = [{
    id: 'oyvind',
    navn: 'Øyvind Rohjan',
    hcp: '+1,2',
    punkter: [{
      ved: 28,
      etikett: 'NM junior · uke 29'
    }, {
      ved: 31,
      variant: 'peak',
      etikett: 'Peak · uke 32'
    }]
  }, {
    id: 'mia',
    navn: 'Mia Solberg',
    hcp: '2,4',
    punkter: [{
      ved: 33,
      etikett: 'Kretsmesterskap · uke 34'
    }]
  }, {
    id: 'jonas',
    navn: 'Jonas Berg',
    hcp: '4,1',
    punkter: []
  }];
  function App() {
    const [faser, setFaser] = React.useState(START);
    const [sist, setSist] = React.useState(null);
    if (!KLAR) {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          width: 1280,
          height: 860,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          color: 'var(--text-muted)',
          fontFamily: UI,
          fontSize: 14,
          borderRadius: 18,
          border: '1px solid var(--border)'
        }
      }, "Tidslinje-komponenten er ikke kompilert enn\xE5 \u2014 last siden p\xE5 nytt.");
    }
    const flytt = ({
      id,
      baneId,
      fra,
      til
    }) => {
      setFaser(prev => {
        const neste = {};
        let flyttetFase = null,
          fraBane = null;
        Object.entries(prev).forEach(([bane, liste]) => {
          const f = liste.find(x => x.id === id);
          if (f) {
            flyttetFase = f;
            fraBane = bane;
          }
        });
        if (!flyttetFase) return prev;
        Object.entries(prev).forEach(([bane, liste]) => {
          neste[bane] = liste.filter(x => x.id !== id);
        });
        const målBane = baneId && neste[baneId] ? baneId : fraBane;
        neste[målBane] = [...neste[målBane], {
          ...flyttetFase,
          fra,
          til
        }].sort((a, b) => a.fra - b.fra);
        setSist({
          tekst: `${flyttetFase.navn} → ${SPILLERE.find(s => s.id === målBane).navn}, uke ${fra + 1}–${til}`,
          forrige: prev
        });
        return neste;
      });
    };
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
        padding: '14px 22px 12px',
        borderBottom: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: DISP,
        fontSize: 19,
        fontWeight: 700,
        letterSpacing: 'var(--tracking-display)'
      }
    }, "Stall-tidslinje"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: MONO,
        fontSize: 10,
        color: 'var(--text-muted)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      }
    }, "Sesong 2026 \xB7 52 uker"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Tag, {
      variant: "neutral",
      size: "sm"
    }, "Dra faser \u2014 kantene endrer varighet")), sist && /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 22px',
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
    }, "Flyttet: ", sist.tekst, " \u2014 re-validert."), /*#__PURE__*/React.createElement("button", {
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
    }, "Angre")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: '10px 22px 20px'
      }
    }, /*#__PURE__*/React.createElement(Tidslinje, {
      total: 52,
      naa: 26.6,
      ticks: TICKS,
      onFlytt: flytt
    }, SPILLERE.map(sp => /*#__PURE__*/React.createElement(Tidslinje.Bane, {
      key: sp.id,
      id: sp.id,
      etikett: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 26,
          height: 26,
          borderRadius: 9999,
          flex: 'none',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: MONO,
          fontSize: 9,
          fontWeight: 700,
          color: 'var(--text-2)'
        }
      }, sp.navn.split(' ').map(n => n[0]).join('')), /*#__PURE__*/React.createElement("span", {
        style: {
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }
      }, sp.navn, /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block',
          fontFamily: MONO,
          fontSize: 9,
          color: 'var(--text-muted)',
          fontVariantNumeric: 'tabular-nums'
        }
      }, "hcp ", sp.hcp)))
    }, faser[sp.id].map(f => /*#__PURE__*/React.createElement(Tidslinje.Bar, {
      key: f.id,
      id: f.id,
      fra: f.fra,
      til: f.til,
      akse: f.akse,
      utkast: f.utkast,
      onClick: () => {}
    }, f.navn)), sp.punkter.map((p, i) => /*#__PURE__*/React.createElement(Tidslinje.Punkt, {
      key: i,
      ved: p.ved,
      variant: p.variant,
      etikett: p.etikett,
      onClick: () => {}
    }))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 18,
        alignItems: 'center',
        marginTop: 14,
        paddingLeft: 148
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: legendTxt
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...pkt,
        background: 'var(--axis-turn)',
        borderRadius: 3,
        rotate: '45deg'
      }
    }), "Turnering"), /*#__PURE__*/React.createElement("span", {
      style: legendTxt
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        ...pkt,
        background: 'var(--signal)'
      }
    }), "Peak"), /*#__PURE__*/React.createElement("span", {
      style: legendTxt
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 14,
        height: 0,
        borderTop: '2px dashed var(--border-strong)'
      }
    }), "Utkast / AI-forslag"), /*#__PURE__*/React.createElement("span", {
      style: legendTxt
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 1.5,
        height: 12,
        background: 'var(--signal)'
      }
    }), "N\xE5 \u2014 uke 27"))));
  }
  const pkt = {
    width: 9,
    height: 9,
    borderRadius: 9999,
    display: 'inline-block',
    flex: 'none'
  };
  const legendTxt = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    fontFamily: UI,
    fontSize: 11.5,
    color: 'var(--text-muted)'
  };
  window.STALLTL = {
    App
  };
})();
})(); 