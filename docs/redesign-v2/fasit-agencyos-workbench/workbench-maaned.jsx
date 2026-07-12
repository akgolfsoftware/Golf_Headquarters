// FASIT-REFERANSE (ekstrahert fra Claude Design offline-eksport 2026-07-12)
// Original sti: ui_kits/agencyos/workbench-maaned.jsx
// KUN referanse for v2-ombygging — importeres ALDRI av appen.

try { (() => {
/* AK Golf HQ — Workbench MÅNED-zoom (planlegger-måned).
   6×7 måneds-rutenett · uke-nr drill-down · område-fargede økt-pills (uke 25 = ekte),
   andre uker = last-tetthet · turneringer (diamant) · periode-kontekst.
   Eksporterer window.WBMND. */
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
    SESSIONS
  } = D;
  const {
    Mono
  } = Z;
  const UI = 'Inter,system-ui,sans-serif',
    DISP = 'Familjen Grotesk,Inter,system-ui,sans-serif',
    MONO = 'JetBrains Mono,ui-monospace,monospace';
  const YEAR = 2026,
    MONTH = 5; // juni (0-indeksert)
  const MND_NAVN = 'Juni 2026';
  const WD = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
  const TODAY_DATE = 20; // fredag 20. juni (= TODAY i uke 25)
  const WK25 = {
    start: 16,
    end: 22,
    week: 25
  };

  /* Turneringer/tester forankret til datoer (avledet fra PERIODER + sesong) */
  const EVENTS = {
    13: {
      kind: 'turn',
      p: 'B',
      n: 'Krets'
    },
    // uke 24, lør
    27: {
      kind: 'test',
      n: 'PEI-test Q2'
    } // måling
  };

  /* Deterministisk last-tetthet for ikke-aktive uker (område-dotter, ingen fabrikerte titler) */
  const SYN = ['FYS', 'TEK', 'SLAG', 'SPILL', 'TURN'];
  function synDay(date, dow) {
    if (dow >= 5) return date % 3 === 0 ? [SYN[date % 5]] : []; // helg: 0–1
    const n = 1 + date * 7 % 3; // hverdag: 1–3
    const out = [];
    for (let i = 0; i < n; i++) out.push(SYN[(date + i) % 5]);
    return out;
  }
  /* Ekte uke 25: område + tittel pr. dag */
  function realDay(date) {
    const dayIdx = date - WK25.start; // 0=Man
    return SESSIONS.filter(s => s.day === dayIdx).sort((a, b) => a.sH - b.sH);
  }

  /* Ukenummer-anker: prosjekt-fiksjonen er uke 25 = 16.–22. juni (man–søn) — samme
     som PlayerHQ-headerne og Årsplan. Rutenettet OG ukenumrene regnes fra dette
     ankeret (ikke Date.getDay), så rad = én hel uke og P-milepæler/nå-rad treffer. */

  function MaanedZoom({
    onOpenWeek,
    onOpenUplan,
    onCreateAt
  }) {
    const [mndOff, setMndOff] = React.useState(0);
    const mIdx = MONTH + mndOff;
    const erJuni = mndOff === 0;
    const mndNavn = new Date(YEAR, mIdx, 1).toLocaleDateString('nb-NO', {
      month: 'long',
      year: 'numeric'
    });
    // Fiksjons-forankret kalendermatte: dager telles fra mandag 16. juni (uke 25)
    const anchor = new Date(YEAR, 5, WK25.start);
    const daysFrom = date => Math.round((new Date(YEAR, mIdx, date) - anchor) / 86400000);
    const wkOf = date => WK25.week + Math.floor(daysFrom(date) / 7);
    const lead = (daysFrom(1) % 7 + 7) % 7; // ukedag-kolonne for den 1. (man-først)
    const dim = new Date(YEAR, mIdx + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const date = i - lead + 1;
      cells.push(date >= 1 && date <= dim ? date : null);
    }
    const rows = [];
    for (let r = 0; r < 6; r++) rows.push(cells.slice(r * 7, r * 7 + 7));
    const lastRowHasDate = rows[5].some(d => d !== null);
    const useRows = lastRowHasDate ? rows : rows.slice(0, 5);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        background: T.base,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 18px',
        borderBottom: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setMndOff(o => o - 1),
      title: "Forrige m\xE5ned",
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
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-left",
      size: 15
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: DISP,
        fontWeight: 700,
        fontSize: 17,
        color: T.fg,
        letterSpacing: '-0.01em',
        minWidth: 128,
        textAlign: 'center',
        textTransform: 'capitalize'
      }
    }, mndNavn), /*#__PURE__*/React.createElement("button", {
      onClick: () => setMndOff(o => o + 1),
      title: "Neste m\xE5ned",
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
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-right",
      size: 15
    })), mndOff !== 0 && /*#__PURE__*/React.createElement("button", {
      onClick: () => setMndOff(0),
      title: "Til denne m\xE5neden",
      style: {
        height: 24,
        padding: '0 9px',
        borderRadius: 7,
        background: 'transparent',
        border: `1px solid ${T.border}`,
        color: T.muted,
        cursor: 'pointer',
        fontFamily: MONO,
        fontSize: 9,
        fontWeight: 700
      }
    }, "I dag")), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 24,
        padding: '0 10px',
        borderRadius: 9999,
        background: `color-mix(in srgb,${AX.SPILL} 16%,transparent)`,
        border: `1px solid color-mix(in srgb,${AX.SPILL} 40%,transparent)`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 3,
        background: AX.SPILL
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.fg
    }, "Spesialisering \xB7 uke 19\u201331")), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, ['FYS', 'TEK', 'SLAG', 'SPILL', 'TURN'].map(a => /*#__PURE__*/React.createElement("span", {
      key: a,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 2,
        background: AX[a]
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5
    }, a))), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 1,
        height: 13,
        background: T.border
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        transform: 'rotate(45deg)',
        background: T.amber,
        borderRadius: 1
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5
    }, "turnering")), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "git-branch",
      size: 11,
      style: {
        color: T.muted
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5
    }, "P-milep\xE6l")))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        display: 'flex',
        borderBottom: `1px solid ${T.border}`,
        paddingLeft: 48
      }
    }, WD.map((d, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        flex: 1,
        padding: '7px 0',
        textAlign: 'center',
        borderLeft: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: i >= 5 ? T.muted : T.fg,
      style: {
        textTransform: 'uppercase',
        letterSpacing: '0.08em'
      }
    }, d)))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto'
      }
    }, useRows.map((row, ri) => {
      const firstDate = row.find(d => d !== null);
      const wk = firstDate != null ? wkOf(firstDate) : null;
      const isCurWeek = erJuni && row.some(d => d != null && d >= WK25.start && d <= WK25.end);
      /* P-milepæler i denne uka (delt kilde m/ Årsplan + teknisk plan) */
      const ms = wk != null ? (D.UTVIKLINGSPLAN || []).filter(m => m.uke === wk) : [];
      return /*#__PURE__*/React.createElement("div", {
        key: ri,
        style: {
          display: 'flex',
          minHeight: 104,
          borderBottom: `1px solid ${T.border}`,
          background: isCurWeek ? `color-mix(in srgb,${T.lime} 3.5%,transparent)` : 'transparent',
          position: 'relative'
        }
      }, isCurWeek && /*#__PURE__*/React.createElement("span", {
        style: {
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: T.lime
        }
      }), /*#__PURE__*/React.createElement("button", {
        onClick: () => wk != null && onOpenWeek(wk),
        title: `Åpne uke ${wk} i Uke-zoom${ms.length ? ` · ${ms.map(m => m.id + ' ' + m.t).join(' · ')}` : ''}`,
        style: {
          width: 48,
          flex: 'none',
          borderRight: `1px solid ${T.border}`,
          background: 'transparent',
          cursor: wk != null ? 'pointer' : 'default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          color: isCurWeek ? T.lime : T.muted
        }
      }, wk != null && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Mono, {
        size: 8,
        color: T.muted,
        style: {
          textTransform: 'uppercase'
        }
      }, "uke"), /*#__PURE__*/React.createElement(Mono, {
        size: 14,
        weight: 700,
        color: isCurWeek ? T.lime : T.fg
      }, wk), isCurWeek && /*#__PURE__*/React.createElement(Icon, {
        name: "arrow-right",
        size: 11,
        style: {
          color: T.lime
        }
      }), ms.map(m => /*#__PURE__*/React.createElement("span", {
        key: m.id,
        onClick: e => {
          e.stopPropagation();
          if (onOpenUplan) onOpenUplan(m.id);
        },
        title: `${m.id} · ${m.t} · ${m.status} — åpne Utviklingsplan`,
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
          padding: '1px 6px',
          borderRadius: 9999,
          background: `color-mix(in srgb,${AX[m.ax]} 16%,transparent)`,
          border: `1px solid color-mix(in srgb,${AX[m.ax]} 45%,transparent)`,
          cursor: 'pointer'
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "git-branch",
        size: 9,
        style: {
          color: AX[m.ax]
        }
      }), /*#__PURE__*/React.createElement(Mono, {
        size: 8,
        weight: 700,
        color: T.fg
      }, m.id))))), row.map((date, ci) => {
        if (date == null) return /*#__PURE__*/React.createElement("div", {
          key: ci,
          style: {
            flex: 1,
            borderLeft: `1px solid ${T.border}`,
            background: `color-mix(in srgb,${T.card} 40%,transparent)`
          }
        });
        const dow = ci,
          isToday = erJuni && date === TODAY_DATE,
          weekend = dow >= 5;
        const real = erJuni && date >= WK25.start && date <= WK25.end ? realDay(date) : null;
        const dayIdx = erJuni && date >= WK25.start && date <= WK25.end ? date - WK25.start : null;
        const syn = real ? null : synDay(date, dow);
        const ev = erJuni ? EVENTS[date] : null;
        return /*#__PURE__*/React.createElement("div", {
          key: ci,
          role: "button",
          tabIndex: 0,
          onClick: () => onOpenWeek(wk),
          onKeyDown: e => {
            if (e.key === 'Enter') onOpenWeek(wk);
          },
          style: {
            flex: 1,
            minWidth: 0,
            borderLeft: `1px solid ${T.border}`,
            background: weekend ? `color-mix(in srgb,${T.card} 30%,transparent)` : 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
            padding: '6px 6px 7px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            outline: 'none',
            position: 'relative'
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 20,
            height: 20,
            borderRadius: 9999,
            background: isToday ? T.lime : 'transparent',
            color: isToday ? T.base : weekend ? T.muted : T.fg,
            fontFamily: MONO,
            fontSize: 11,
            fontWeight: 700,
            padding: '0 5px'
          }
        }, date), ev && ev.kind === 'turn' && /*#__PURE__*/React.createElement("span", {
          title: ev.n,
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            width: 9,
            height: 9,
            transform: 'rotate(45deg)',
            background: T.amber,
            borderRadius: 1
          }
        })), ev && ev.kind === 'test' && /*#__PURE__*/React.createElement("span", {
          title: ev.n,
          style: {
            fontFamily: MONO,
            fontSize: 8,
            fontWeight: 700,
            color: T.fg,
            border: `1px solid ${T.border}`,
            borderRadius: 3,
            padding: '1px 4px'
          }
        }, "TEST"), dayIdx != null && onCreateAt && /*#__PURE__*/React.createElement("button", {
          title: "Legg til \xF8kt p\xE5 denne dagen",
          onClick: e => {
            e.stopPropagation();
            onCreateAt(dayIdx, 9);
          },
          style: {
            width: 16,
            height: 16,
            flex: 'none',
            borderRadius: 5,
            background: T.raised,
            border: `1px solid ${T.border}`,
            color: T.muted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0
          }
        }, /*#__PURE__*/React.createElement(Icon, {
          name: "plus",
          size: 10
        }))), real && real.slice(0, 3).map(s => /*#__PURE__*/React.createElement("span", {
          key: s.id,
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 6px',
            borderRadius: 6,
            background: AX_SOFT[s.pyramidArea],
            border: `1px solid color-mix(in srgb,${AX[s.pyramidArea]} 38%,transparent)`,
            minWidth: 0
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            width: 3,
            height: 11,
            borderRadius: 2,
            background: AX[s.pyramidArea],
            flex: 'none'
          }
        }), /*#__PURE__*/React.createElement("span", {
          style: {
            flex: 1,
            fontFamily: UI,
            fontSize: 9.5,
            fontWeight: 600,
            color: T.fg,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }
        }, s.title))), real && real.length > 3 && /*#__PURE__*/React.createElement(Mono, {
          size: 8.5,
          color: T.muted,
          style: {
            paddingLeft: 2
          }
        }, "+", real.length - 3, " til"), ev && ev.kind === 'turn' && /*#__PURE__*/React.createElement("span", {
          style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            alignSelf: 'flex-start',
            padding: '2px 6px',
            borderRadius: 5,
            background: `color-mix(in srgb,${T.amber} 15%,transparent)`,
            border: `1px solid color-mix(in srgb,${T.amber} 38%,transparent)`
          }
        }, /*#__PURE__*/React.createElement(Mono, {
          size: 8.5,
          weight: 700,
          color: T.amber
        }, ev.n, " \xB7 ", ev.p)), syn && syn.length > 0 && /*#__PURE__*/React.createElement("div", {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            marginTop: 1
          }
        }, syn.map((a, i) => /*#__PURE__*/React.createElement("span", {
          key: i,
          title: a,
          style: {
            height: 6,
            borderRadius: 3,
            background: `color-mix(in srgb,${AX[a]} 24%,transparent)`,
            borderLeft: `3px solid ${AX[a]}`
          }
        }))));
      }));
    })));
  }
  window.WBMND = {
    MaanedZoom
  };
})();
})(); 