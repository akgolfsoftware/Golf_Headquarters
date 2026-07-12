// FASIT-REFERANSE (ekstrahert fra Claude Design offline-eksport 2026-07-12)
// Original sti: ui_kits/agencyos/workbench-zones.jsx
// KUN referanse for v2-ombygging — importeres ALDRI av appen.

try { (() => {
/* AK Golf HQ — Workbench zones: primitives + all panels. Exports window.WBZ. */
(function () {
  const {
    Icon
  } = window.AKGolfHQDesignSystem_bb9b2b;
  const D = window.WBDATA;
  const V = window.WBVIZ;
  const {
    T,
    AX,
    AX_SOFT,
    AKFORMEL,
    DAYS,
    DATES,
    TODAY
  } = D;

  /* ════ Primitives ═══════════════════════════════════════ */
  function Mono({
    size = 11,
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
  function Chip({
    label,
    active,
    color,
    readOnly,
    onClick
  }) {
    return /*#__PURE__*/React.createElement("button", {
      onClick: readOnly ? undefined : onClick,
      disabled: readOnly,
      style: {
        height: 25,
        padding: '0 9px',
        borderRadius: 6,
        cursor: readOnly ? 'default' : 'pointer',
        background: active ? color || T.lime : T.raised,
        color: active ? T.base : readOnly ? T.muted : T.fg,
        border: `1px solid ${active ? color || T.lime : T.border}`,
        fontFamily: 'JetBrains Mono,ui-monospace,monospace',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.03em',
        opacity: readOnly && !active ? 0.55 : 1,
        transition: 'all 120ms'
      }
    }, label);
  }
  function KpiChip({
    label,
    value,
    unit,
    delta,
    dir,
    warn,
    accent,
    onClick
  }) {
    return /*#__PURE__*/React.createElement("button", {
      onClick: onClick,
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        padding: '0 11px',
        height: '100%',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        borderLeft: `1px solid ${T.border}`,
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap'
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 3
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 18,
      weight: 700,
      color: accent || (warn ? T.amber : T.fg)
    }, value), unit && /*#__PURE__*/React.createElement(Mono, {
      size: 10
    }, unit)), delta && /*#__PURE__*/React.createElement(V.DeltaChip, {
      delta: delta,
      dir: dir
    })));
  }
  function ZoomPill({
    label,
    active,
    onClick
  }) {
    return /*#__PURE__*/React.createElement("button", {
      onClick: onClick,
      style: {
        height: 28,
        padding: '0 9px',
        borderRadius: 9999,
        border: 'none',
        cursor: 'pointer',
        background: active ? T.lime : 'transparent',
        color: active ? T.base : T.muted,
        fontFamily: 'JetBrains Mono,ui-monospace,monospace',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        transition: 'all 120ms'
      }
    }, label);
  }
  function SegToggle({
    options,
    value,
    onChange,
    accent
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 2,
        background: T.raised,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: 2
      }
    }, options.map(o => {
      const on = value === o.value;
      return /*#__PURE__*/React.createElement("button", {
        key: o.value,
        onClick: () => onChange(o.value),
        style: {
          height: 24,
          padding: '0 11px',
          borderRadius: 6,
          border: 'none',
          cursor: 'pointer',
          background: on ? accent || T.lime : 'transparent',
          color: on ? T.base : T.muted,
          fontFamily: 'JetBrains Mono,monospace',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.05em',
          transition: 'all 120ms'
        }
      }, o.label);
    }));
  }
  function Panel({
    title,
    badge,
    badgeColor,
    open: initOpen = false,
    right,
    children
  }) {
    const [open, setOpen] = React.useState(initOpen);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpen(!open),
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: 34,
        padding: '0 14px',
        background: 'none',
        border: 'none',
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: open ? 'chevron-down' : 'chevron-right',
      size: 12,
      style: {
        color: T.muted
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: open ? T.fg : T.muted,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }
    }, title), badge && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 9,
        background: `color-mix(in srgb,${badgeColor || T.amber} 18%,transparent)`,
        color: badgeColor || T.amber,
        borderRadius: 4,
        padding: '1px 6px'
      }
    }, badge)), right), open && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '2px 14px 12px'
      }
    }, children));
  }

  /* ════ Palette (coach-only) — faner: Maler · Økter · Driller (Fase 3.9.5).
     Mal-klikk åpner MalDetalj (innhold + effekt) — aldri direkte skriving. */
  function Palette({
    onPickItem,
    onApplyTemplate,
    onOpenLibrary,
    extraStdokter
  }) {
    const [q, setQ] = React.useState('');
    const [fane, setFane] = React.useState('maler');
    const f = s => !q || s.title.toLowerCase().includes(q.toLowerCase());
    const allStd = (extraStdokter || []).concat(D.STDOKTER);
    const FANER = [['maler', 'Maler'], ['okter', 'Økter'], ['driller', 'Driller']];
    const mixOf = t => {
      const m = {};
      let tot = 0;
      t.sessions.forEach(s => {
        m[s.axis] = (m[s.axis] || 0) + s.dH;
        tot += s.dH;
      });
      return {
        m,
        tot
      };
    };
    const tom = /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      color: T.muted,
      style: {
        display: 'block',
        padding: '8px 4px'
      }
    }, "Ingen treff.");
    const DragRow = ({
      item,
      kind
    }) => /*#__PURE__*/React.createElement("button", {
      onClick: () => onPickItem && onPickItem(item, kind),
      draggable: true,
      onDragStart: e => {
        e.dataTransfer.setData('application/x-ak-item', JSON.stringify({
          item,
          kind
        }));
        e.dataTransfer.effectAllowed = 'copy';
      },
      title: "Klikk: bruk i ny \xF8kt \xB7 dra inn i uka",
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        textAlign: 'left',
        padding: '7px 8px',
        borderRadius: 8,
        background: T.raised,
        border: `1px solid ${T.border}`,
        marginBottom: 4,
        cursor: 'grab'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 3,
        height: 26,
        borderRadius: 2,
        flex: 'none',
        background: AX[item.axis]
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12,
        fontWeight: 500,
        color: T.fg,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, item.title), /*#__PURE__*/React.createElement(Mono, {
      size: 9
    }, item.axis, " \xB7 CS", item.cs, " \xB7 ", item.dur)));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        width: 200,
        flex: 'none',
        background: T.card,
        borderRight: `1px solid ${T.border}`,
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 12px 8px',
        borderBottom: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.12em',
        textTransform: 'uppercase'
      }
    }, "BIBLIOTEK"), /*#__PURE__*/React.createElement("button", {
      onClick: onOpenLibrary,
      title: "\xC5pne fullt bibliotek",
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        height: 20,
        padding: '0 7px',
        borderRadius: 6,
        background: 'transparent',
        border: `1px solid ${T.border}`,
        color: T.muted,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-up-right",
      size: 10
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 8,
      color: T.muted
    }, "Alle"))), /*#__PURE__*/React.createElement("input", {
      value: q,
      onChange: e => setQ(e.target.value),
      placeholder: "S\xF8k\u2026",
      style: {
        width: '100%',
        height: 28,
        background: T.raised,
        border: `1px solid ${T.border}`,
        borderRadius: 7,
        padding: '0 9px',
        color: T.fg,
        fontSize: 12,
        fontFamily: 'Inter,system-ui,sans-serif',
        outline: 'none',
        boxSizing: 'border-box',
        marginBottom: 8
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 2,
        background: T.raised,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: 2
      }
    }, FANER.map(([v, l]) => {
      const on = fane === v;
      return /*#__PURE__*/React.createElement("button", {
        key: v,
        onClick: () => setFane(v),
        style: {
          flex: 1,
          height: 22,
          borderRadius: 6,
          border: 'none',
          cursor: 'pointer',
          background: on ? T.card : 'transparent',
          boxShadow: on ? `inset 0 0 0 1px ${T.border}` : 'none',
          color: on ? T.fg : T.muted,
          fontFamily: 'JetBrains Mono,ui-monospace,monospace',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          transition: 'all 120ms'
        }
      }, l);
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '8px'
      }
    }, fane === 'maler' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        display: 'block',
        padding: '4px 4px 6px'
      }
    }, "HELE UKER \xB7 ", D.TEMPLATES.filter(t => f(t)).length), D.TEMPLATES.filter(t => f(t)).length === 0 && tom, D.TEMPLATES.filter(t => f(t)).map(t => {
      const {
        m,
        tot
      } = mixOf(t);
      return /*#__PURE__*/React.createElement("button", {
        key: t.id,
        onClick: () => onApplyTemplate && onApplyTemplate(t),
        title: "Se innhold og effekt f\xF8r malen brukes",
        style: {
          display: 'block',
          width: '100%',
          textAlign: 'left',
          padding: '8px 9px',
          borderRadius: 8,
          background: T.raised,
          border: `1px solid ${T.border}`,
          marginBottom: 4,
          cursor: 'pointer'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0,
          fontFamily: 'Inter,system-ui,sans-serif',
          fontSize: 12,
          fontWeight: 600,
          color: T.fg,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, t.title), /*#__PURE__*/React.createElement(Icon, {
        name: "arrow-right",
        size: 11,
        style: {
          color: T.muted,
          flex: 'none'
        }
      })), /*#__PURE__*/React.createElement(Mono, {
        size: 9,
        style: {
          display: 'block',
          marginTop: 3
        }
      }, t.meta), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          height: 5,
          gap: 1.5,
          borderRadius: 3,
          overflow: 'hidden',
          marginTop: 6
        }
      }, ['FYS', 'TEK', 'SLAG', 'SPILL', 'TURN'].map(ax => m[ax] ? /*#__PURE__*/React.createElement("div", {
        key: ax,
        title: `${ax} ${Math.round(m[ax] / tot * 100)}%`,
        style: {
          width: `${Math.round(m[ax] / tot * 100)}%`,
          minWidth: 3,
          background: AX[ax]
        }
      }) : null)));
    })), fane === 'okter' && (allStd.filter(f).length === 0 ? tom : allStd.filter(f).map(s => /*#__PURE__*/React.createElement(DragRow, {
      key: s.id,
      item: s,
      kind: "standard"
    }))), fane === 'driller' && (D.DRILLS.filter(f).length === 0 ? tom : D.DRILLS.filter(f).map(d => /*#__PURE__*/React.createElement(DragRow, {
      key: d.id,
      item: d,
      kind: "drill"
    })))));
  }

  /* ════ Time grid canvas ═════════════════════════════════ */
  function TimeGrid({
    sessions,
    selected,
    onSelect,
    onOpen,
    brokenIds,
    ghosts,
    onCreateAt,
    onMove,
    onDropItem,
    onDragPreview
  }) {
    const H = 38,
      START = 7,
      END = 22,
      TW = 44;
    const hours = Array.from({
      length: END - START
    }, (_, i) => START + i);
    const flateRef = React.useRef(null);
    const dragRef = React.useRef(null);
    const [drag, setDrag] = React.useState(null); // {id, dx, dy, day, sH}

    const dragStart = (e, s) => {
      if (!onMove || e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = {
        id: s.id,
        s,
        x0: e.clientX,
        y0: e.clientY,
        moved: false
      };
    };
    const dragMove = e => {
      const d = dragRef.current;
      if (!d || d.suppress) return;
      const dx = e.clientX - d.x0,
        dy = e.clientY - d.y0;
      if (!d.moved && Math.hypot(dx, dy) < 5) return;
      d.moved = true;
      const rect = flateRef.current.getBoundingClientRect();
      const dayW = (rect.width - TW) / 7;
      const day = Math.max(0, Math.min(6, Math.floor((e.clientX - rect.left - TW) / dayW)));
      const sH = Math.max(START, Math.min(END - d.s.dH, d.s.sH + Math.round(dy / H * 2) / 2));
      setDrag({
        id: d.id,
        dx,
        dy,
        day,
        sH
      });
      /* Fase 4.2 — meld målet LIVE (hver bevegelse), så Plan-kvalitet kan
         reberegnes UNDER draget, ikke bare ved slipp. */
      if (onDragPreview && (day !== d.s.day || sH !== d.s.sH)) onDragPreview(d.id, day, sH);else if (onDragPreview) onDragPreview(null);
    };
    const dragEnd = commit => {
      const d = dragRef.current;
      dragRef.current = null;
      const st = drag;
      setDrag(null);
      if (onDragPreview) onDragPreview(null);
      if (!d || !d.moved) return;
      if (commit && st && (st.day !== d.s.day || st.sH !== d.s.sH)) onMove(d.id, st.day, st.sH);
      dragRef.current = {
        suppress: true
      };
      setTimeout(() => {
        dragRef.current = null;
      }, 0);
    };
    React.useEffect(() => {
      if (!drag) return;
      const onKey = ev => {
        if (ev.key === 'Escape') {
          dragRef.current = null;
          setDrag(null);
          if (onDragPreview) onDragPreview(null);
        }
      };
      document.addEventListener('keydown', onKey, true);
      return () => document.removeEventListener('keydown', onKey, true);
    }, [!!drag]);
    const sesKey = (e, s) => {
      if (!onMove || !e.altKey) return;
      let ok = true;
      if (e.key === 'ArrowUp') onMove(s.id, s.day, Math.max(START, s.sH - 0.5));else if (e.key === 'ArrowDown') onMove(s.id, s.day, Math.min(END - s.dH, s.sH + 0.5));else if (e.key === 'ArrowLeft') onMove(s.id, Math.max(0, s.day - 1), s.sH);else if (e.key === 'ArrowRight') onMove(s.id, Math.min(6, s.day + 1), s.sH);else ok = false;
      if (ok) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        background: T.base,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        paddingLeft: TW,
        position: 'sticky',
        top: 0,
        zIndex: 3,
        background: T.base,
        borderBottom: `1px solid ${T.border}`
      }
    }, DAYS.map((d, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        flex: 1,
        padding: '8px 4px 6px',
        textAlign: 'center',
        borderLeft: `1px solid ${T.border}`,
        background: i === TODAY ? `color-mix(in srgb,${T.lime} 4%,${T.base})` : 'transparent'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: i === TODAY ? T.lime : T.muted,
      style: {
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        display: 'block'
      }
    }, d), /*#__PURE__*/React.createElement(Mono, {
      size: 15,
      weight: 700,
      color: i === TODAY ? T.fg : T.muted,
      style: {
        display: 'block',
        marginTop: 2
      }
    }, DATES[i]), i === TODAY && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        width: 5,
        height: 5,
        borderRadius: 9999,
        background: T.signalFill,
        boxShadow: `0 0 0 1px ${T.signalFillEdge}`,
        margin: '3px auto 0'
      }
    })))), /*#__PURE__*/React.createElement("div", {
      ref: flateRef,
      style: {
        position: 'relative',
        height: hours.length * H,
        userSelect: drag ? 'none' : undefined
      }
    }, drag && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 6,
        left: TW + 8,
        zIndex: 9,
        pointerEvents: 'none',
        background: T.raised,
        border: `1px solid ${T.border}`,
        borderRadius: 6,
        padding: '3px 8px',
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 10,
        fontWeight: 700,
        color: T.lime
      }
    }, DAYS[drag.day], " ", DATES[drag.day], " \xB7 ", String(Math.floor(drag.sH)).padStart(2, '0'), ":", drag.sH % 1 ? '30' : '00'), hours.map(h => /*#__PURE__*/React.createElement("div", {
      key: h,
      style: {
        position: 'absolute',
        top: (h - START) * H,
        left: 0,
        right: 0,
        display: 'flex',
        pointerEvents: 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: TW,
        flex: 'none',
        textAlign: 'right',
        paddingRight: 7,
        paddingTop: 3
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.border
    }, h, ":00")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        borderTop: `1px solid ${T.border}`,
        display: 'flex'
      }
    }, DAYS.map((_, di) => /*#__PURE__*/React.createElement("button", {
      key: di,
      onClick: () => onCreateAt && onCreateAt(di, h),
      onDragOver: e => {
        if (onDropItem && Array.from(e.dataTransfer.types).includes('application/x-ak-item')) e.preventDefault();
      },
      onDrop: e => {
        const raw = e.dataTransfer.getData('application/x-ak-item');
        if (raw && onDropItem) {
          e.preventDefault();
          const p = JSON.parse(raw);
          onDropItem(p.item, p.kind, di, h);
        }
      },
      title: "Klikk for \xE5 legge til \xF8kt her \xB7 slipp bibliotek-element",
      style: {
        flex: 1,
        height: H - 1,
        background: di === TODAY ? `color-mix(in srgb,${T.lime} 2.5%,transparent)` : 'transparent',
        border: 'none',
        borderLeft: `1px solid ${T.border}`,
        padding: 0,
        cursor: 'pointer',
        pointerEvents: 'auto'
      }
    }))))), sessions.map(s => {
      const top = (s.sH - START) * H + 1;
      const ht = s.dH * H - 3;
      const sel = selected === s.id;
      const broke = brokenIds && brokenIds.indexOf(s.id) !== -1;
      const left = `calc(${TW}px + ${s.day}/7*(100% - ${TW}px) + 2px)`;
      const width = `calc((100% - ${TW}px)/7 - 4px)`;
      const edge = broke ? T.redSolid : sel ? T.lime : AX[s.pyramidArea];
      const drar = drag && drag.id === s.id;
      return /*#__PURE__*/React.createElement("button", {
        key: s.id,
        onClick: () => {
          if (!(dragRef.current && dragRef.current.suppress)) onSelect(s.id);
        },
        onDoubleClick: () => onOpen && onOpen(s.id),
        onPointerDown: e => dragStart(e, s),
        onPointerMove: dragMove,
        onPointerUp: () => dragEnd(true),
        onPointerCancel: () => dragEnd(false),
        onKeyDown: e => sesKey(e, s),
        title: "Klikk: velg \xB7 dobbeltklikk: \xE5pne \xF8kt \xB7 dra: flytt \xB7 Alt+piltaster",
        style: {
          position: 'absolute',
          top,
          left,
          width,
          height: ht,
          borderRadius: 9,
          cursor: 'pointer',
          textAlign: 'left',
          padding: 0,
          display: 'flex',
          background: sel ? `color-mix(in srgb,${T.lime} 12%,${T.raised})` : AX_SOFT[s.pyramidArea],
          border: `1px solid ${broke ? T.redSolid : sel ? T.lime : `color-mix(in srgb,${AX[s.pyramidArea]} 50%,transparent)`}`,
          boxShadow: broke ? `0 0 0 2px color-mix(in srgb,${T.redSolid} 32%,transparent)` : sel ? `0 0 0 2px color-mix(in srgb,${T.lime} 26%,transparent), 0 6px 16px color-mix(in srgb,${T.lime} 16%,transparent)` : 'none',
          opacity: s.done ? 0.55 : 1,
          outline: 'none',
          transition: drar ? 'none' : 'box-shadow 120ms, background 120ms, opacity 120ms',
          overflow: 'hidden',
          ...(onMove ? {
            touchAction: 'none',
            cursor: drar ? 'grabbing' : 'grab'
          } : {}),
          ...(drar ? {
            transform: `translate(${drag.dx}px, ${drag.dy}px)`,
            zIndex: 8,
            boxShadow: 'var(--shadow-popover)'
          } : {})
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 3,
          flex: 'none',
          background: edge,
          opacity: s.done ? 0.8 : 1
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0,
          padding: '5px 7px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 4
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '1px 5px',
          borderRadius: 4,
          background: `color-mix(in srgb,${AX[s.pyramidArea]} 16%,transparent)`
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        size: 8.5,
        weight: 700,
        color: AX[s.pyramidArea],
        style: {
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }
      }, s.pyramidArea, "\xB7", D.formelSekundaer(s))), broke ? /*#__PURE__*/React.createElement(Icon, {
        name: "triangle-alert",
        size: 11,
        style: {
          color: T.redSolid,
          flex: 'none'
        }
      }) : s.done ? /*#__PURE__*/React.createElement(Icon, {
        name: "check",
        size: 11,
        style: {
          color: T.muted,
          flex: 'none'
        }
      }) : null), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'Familjen Grotesk,Inter,system-ui,sans-serif',
          fontWeight: 600,
          fontSize: 11,
          color: sel ? T.lime : T.fg,
          marginTop: 2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: 1.3
        }
      }, s.title), ht > 50 && /*#__PURE__*/React.createElement(Mono, {
        size: 9,
        style: {
          display: 'block',
          marginTop: 2
        }
      }, s.sH, ":00 \xB7 ", s.dH >= 1 ? `${s.dH}t` : `${s.dH * 60}m`)));
    }), (ghosts || []).map((g, gi) => {
      const top = (g.sH - START) * H + 1;
      const ht = g.dH * H - 3;
      const left = `calc(${TW}px + ${g.day}/7*(100% - ${TW}px) + 2px)`;
      const width = `calc((100% - ${TW}px)/7 - 4px)`;
      return /*#__PURE__*/React.createElement("div", {
        key: 'g' + gi,
        title: `AI-forslag · ${g.title}`,
        style: {
          position: 'absolute',
          top,
          left,
          width,
          height: ht,
          borderRadius: 9,
          overflow: 'hidden',
          background: `color-mix(in srgb,${T.lime} 9%,${T.base})`,
          border: `1px dashed color-mix(in srgb,${T.lime} 60%,transparent)`,
          boxShadow: `0 0 0 1px color-mix(in srgb,${T.lime} 14%,transparent)`,
          display: 'flex',
          zIndex: 2
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 3,
          flex: 'none',
          background: `repeating-linear-gradient(180deg, ${T.lime} 0 4px, transparent 4px 8px)`
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0,
          padding: '5px 7px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "sparkles",
        size: 11,
        style: {
          color: T.lime,
          flex: 'none'
        }
      }), /*#__PURE__*/React.createElement(Mono, {
        size: 8,
        weight: 700,
        color: T.lime,
        style: {
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }
      }, "AI \xB7 ", g.area)), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'Familjen Grotesk,Inter,system-ui,sans-serif',
          fontWeight: 600,
          fontSize: 11,
          color: T.fg,
          marginTop: 2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, g.title), ht > 50 && /*#__PURE__*/React.createElement(Mono, {
        size: 9,
        style: {
          display: 'block',
          marginTop: 2
        }
      }, g.sH, ":00 \xB7 ", g.dH >= 1 ? `${g.dH}t` : `${g.dH * 60}m`)));
    })));
  }

  /* ════ Inspector (6 AK-axes, role-gated) ════════════════ */
  function AkAxis({
    axis,
    value,
    onChange,
    readOnly,
    brudd,
    override,
    role,
    onOverride
  }) {
    const isCoach = role === 'coach';
    const isMulti = axis.multi;
    const arr = isMulti ? value || [] : null;
    const [ovOpen, setOvOpen] = React.useState(false);
    const [ovText, setOvText] = React.useState('');
    React.useEffect(() => {
      setOvOpen(false);
      setOvText('');
    }, [brudd && brudd.id]);
    const hard = brudd && brudd.alv === 'hard';
    const soft = brudd && brudd.alv === 'myk';
    const overridden = brudd && override;
    const ring = overridden ? T.lime : hard ? T.redSolid : soft ? T.amber : null;
    const ringTxt = overridden ? T.muted : hard ? T.red : soft ? T.amber : T.muted;
    const groupStyle = ring ? {
      padding: 7,
      borderRadius: 9,
      border: `1px ${overridden ? 'dashed' : 'solid'} ${overridden ? `color-mix(in srgb,${T.lime} 50%,transparent)` : ring}`,
      background: `color-mix(in srgb,${ring} ${overridden ? 5 : 7}%,transparent)`
    } : {};
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: ring && !overridden ? ringTxt : T.muted
      }
    }, axis.label), brudd && /*#__PURE__*/React.createElement(Icon, {
      name: overridden ? 'circle-check' : hard ? 'circle-x' : 'triangle-alert',
      size: 11,
      style: {
        color: overridden ? T.lime : hard ? T.red : T.amber
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), readOnly && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 8,
        color: T.muted,
        border: `1px solid ${T.border}`,
        borderRadius: 3,
        padding: '1px 5px'
      }
    }, "lese")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap',
        transition: 'all 160ms',
        ...groupStyle
      }
    }, axis.values.map(v => {
      const on = isMulti ? arr.indexOf(v) !== -1 : value === v;
      const col = axis.key === 'pyramidArea' ? AX[v] : T.lime;
      return /*#__PURE__*/React.createElement(Chip, {
        key: v,
        label: v.replace('L_', ''),
        active: on,
        color: col,
        readOnly: readOnly,
        onClick: () => {
          if (isMulti) {
            const next = arr.indexOf(v) !== -1 ? arr.filter(x => x !== v) : arr.concat(v);
            onChange(next);
          } else onChange(v);
        }
      });
    })), brudd && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 7,
        display: 'flex',
        flexDirection: 'column',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 11,
        color: overridden ? T.muted : hard ? T.red : T.amber,
        lineHeight: 1.45
      }
    }, isCoach ? brudd.melding : brudd.klar), overridden && /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, "Overstyrt \xB7 \xAB", override, "\xBB"), isCoach && hard && !overridden && (ovOpen ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("textarea", {
      value: ovText,
      onChange: e => setOvText(e.target.value),
      placeholder: "Begrunnelse (p\xE5krevd \u2014 logges)\u2026",
      rows: 2,
      style: {
        width: '100%',
        background: T.base,
        border: `1px solid ${T.redSolid}`,
        borderRadius: 7,
        padding: '7px 9px',
        color: T.fg,
        fontSize: 11,
        fontFamily: 'Inter,system-ui,sans-serif',
        resize: 'none',
        outline: 'none',
        boxSizing: 'border-box'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => {
        if (ovText.trim()) onOverride(brudd.id, ovText.trim());
      },
      disabled: !ovText.trim(),
      style: {
        height: 27,
        padding: '0 11px',
        borderRadius: 6,
        background: ovText.trim() ? T.lime : T.raised,
        border: 'none',
        color: ovText.trim() ? T.base : T.muted,
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 9,
        fontWeight: 700,
        cursor: ovText.trim() ? 'pointer' : 'default'
      }
    }, "Lagre overstyring"), /*#__PURE__*/React.createElement("button", {
      onClick: () => setOvOpen(false),
      style: {
        height: 27,
        padding: '0 11px',
        borderRadius: 6,
        background: 'transparent',
        border: `1px solid ${T.border}`,
        color: T.muted,
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 9,
        fontWeight: 600,
        cursor: 'pointer'
      }
    }, "Avbryt"))) : /*#__PURE__*/React.createElement("button", {
      onClick: () => setOvOpen(true),
      style: {
        height: 28,
        alignSelf: 'flex-start',
        padding: '0 12px',
        borderRadius: 7,
        background: 'rgba(229,72,77,.12)',
        border: `1px solid #CD6057`,
        color: T.red,
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 9,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "lock",
      size: 11
    }), "Overstyr")), !isCoach && hard && /*#__PURE__*/React.createElement(Mono, {
      size: 8,
      color: T.muted
    }, "Bare coach kan overstyre.")));
  }

  /* ══ DataFane — «data bak anbefalingen» for valgt økt (Fase 3.10 skjerm 2 / 3.9.6) ══
     Leser delt trackman-data.js (målinger m/ celle-tag) + WBDATA.SG_AXES. Faller
     pent tilbake til SG-kontekst når TrackMan-data ikke er lastet (bundle). */
  const TM_FANE = window.TRACKMANDATA || null;
  const AREA_TM = {
    TEK: ['Face to Path', 'Face Angle', 'Tempo'],
    SLAG: ['Low Point', 'Attack Angle'],
    TURN: ['Tempo'],
    SPILL: [],
    FYS: []
  };
  function fmtTmV(v, d) {
    return (v < 0 ? '−' : '') + Math.abs(v).toFixed(d).replace('.', ',');
  }
  function MiniSpark({
    trend,
    ok
  }) {
    const vs = trend.map(t => t.verdi);
    if (vs.length < 2) return null;
    const mn = Math.min.apply(null, vs),
      mx = Math.max.apply(null, vs),
      sp = mx - mn || 1,
      W = 46,
      H = 14;
    const pts = vs.map((v, i) => (i / (vs.length - 1) * W).toFixed(1) + ',' + (H - 2 - (v - mn) / sp * (H - 4)).toFixed(1)).join(' ');
    return /*#__PURE__*/React.createElement("svg", {
      width: W,
      height: H,
      "aria-hidden": "true",
      style: {
        flex: 'none',
        display: 'block'
      }
    }, /*#__PURE__*/React.createElement("polyline", {
      points: pts,
      fill: "none",
      stroke: ok ? T.lime : T.muted,
      strokeWidth: "1.5",
      strokeLinejoin: "round",
      strokeLinecap: "round"
    }));
  }
  function DataFane({
    session,
    isCoach
  }) {
    const area = session.pyramidArea;
    const params = TM_FANE ? (AREA_TM[area] || []).filter(p => TM_FANE.MAALINGER[p]) : [];
    const okt = TM_FANE && TM_FANE.OKTER[0];
    const sitVis = s => ((D.ARENA || {})[s] || {}).vis || s;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "activity",
      size: 12,
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
    }, "Data bak anbefalingen")), okt && params.length > 0 && /*#__PURE__*/React.createElement("a", {
      href: "trackman.html",
      title: "\xC5pne \xF8kta i TrackMan",
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '9px 11px',
        borderRadius: 10,
        background: T.raised,
        border: `1px solid ${T.border}`,
        textDecoration: 'none'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 30,
        height: 30,
        borderRadius: 8,
        flex: 'none',
        background: `color-mix(in srgb,${T.lime} 12%,${T.base})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "activity",
      size: 15,
      style: {
        color: T.lime
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
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      weight: 700,
      color: T.fg
    }, "Siste TrackMan"), /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-up-right",
      size: 11,
      style: {
        color: T.muted
      }
    })), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted,
      style: {
        display: 'block',
        marginTop: 3
      }
    }, okt.dato, " \xB7 ", isCoach ? okt.sit + ' · ' : '', sitVis(okt.sit).replace(/^M\d\s*·\s*/, ''), " \xB7 ", okt.totalSlag, " slag"))), params.length > 0 ? params.map(p => {
      const m = TM_FANE.MAALINGER[p],
        s = TM_FANE.siste(m),
        ok = TM_FANE.innenfor(m, s.verdi),
        st = TM_FANE.streak(m);
      return /*#__PURE__*/React.createElement("div", {
        key: p,
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          padding: '8px 10px',
          borderRadius: 9,
          background: ok ? `color-mix(in srgb,${T.lime} 6%,${T.raised})` : T.raised,
          border: `1px solid ${ok ? `color-mix(in srgb,${T.lime} 30%,transparent)` : T.border}`
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 7
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        size: 9,
        weight: 700,
        color: T.fg,
        style: {
          flex: 1,
          minWidth: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, p), /*#__PURE__*/React.createElement(MiniSpark, {
        trend: m.trend,
        ok: ok
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'baseline',
          gap: 5,
          flexWrap: 'wrap'
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        size: 8,
        color: T.muted
      }, fmtTmV(m.baseline.verdi, m.desimaler), m.enhet), /*#__PURE__*/React.createElement(Mono, {
        size: 8,
        color: T.muted
      }, "\u2192"), /*#__PURE__*/React.createElement(Mono, {
        size: 11,
        weight: 700,
        color: ok ? T.lime : T.fg
      }, fmtTmV(s.verdi, m.desimaler), m.enhet), /*#__PURE__*/React.createElement(Mono, {
        size: 8,
        color: T.muted
      }, "m\xE5l ", m.maalTekst), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1
        }
      }), ok ? /*#__PURE__*/React.createElement(Mono, {
        size: 7.5,
        color: T.lime
      }, "innenfor \xB7 ", st) : /*#__PURE__*/React.createElement(Mono, {
        size: 7.5,
        color: T.amber
      }, "utenfor")));
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 12px',
        borderRadius: 9,
        background: T.raised,
        border: `1px dashed ${T.border}`
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        lineHeight: 1.5
      }
    }, area === 'FYS' || area === 'SPILL' ? `${area}-økt bruker ikke TrackMan-parametre — se SG-kontekst under.` : 'Ingen TrackMan-data koblet.')), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: `1px solid ${T.border}`,
        paddingTop: 12
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        display: 'block',
        marginBottom: 8
      }
    }, "Strokes gained \xB7 12 uker"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 6
      }
    }, D.SG_AXES.map(a => {
      const d = a.now - a.prev;
      const fmt = v => (v > 0 ? '+' : '') + v.toFixed(1).replace('.', ',');
      return /*#__PURE__*/React.createElement("div", {
        key: a.key,
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6,
          padding: '7px 9px',
          borderRadius: 8,
          background: T.raised,
          border: `1px solid ${T.border}`
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        size: 9.5,
        weight: 700,
        color: T.fg
      }, a.key), /*#__PURE__*/React.createElement(Mono, {
        size: 7.5,
        color: T.muted,
        style: {
          display: 'block',
          marginTop: 2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: 58
        }
      }, a.navn)), /*#__PURE__*/React.createElement("div", {
        style: {
          textAlign: 'right',
          flex: 'none'
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        size: 11,
        weight: 700,
        color: a.now >= 0 ? T.lime : T.fg
      }, fmt(a.now)), /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 3,
          display: 'flex',
          justifyContent: 'flex-end'
        }
      }, /*#__PURE__*/React.createElement(V.DeltaChip, {
        delta: fmt(d),
        dir: d >= 0 ? 'up' : 'down',
        size: 8
      }))));
    })), /*#__PURE__*/React.createElement("a", {
      href: "analyse.html",
      title: "\xC5pne full SG-analyse",
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        marginTop: 9,
        textDecoration: 'none',
        color: T.muted,
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.06em'
      }
    }, "\xC5PNE ANALYSE", /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-up-right",
      size: 11
    }))));
  }
  function Inspector({
    role,
    session,
    brudd,
    override,
    onChangeFormel,
    onOverride
  }) {
    const isCoach = role === 'coach';
    const [fane, setFane] = React.useState('formel');
    if (!session) return /*#__PURE__*/React.createElement("div", {
      style: {
        width: 286,
        flex: 'none',
        background: T.card,
        borderLeft: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12,
        color: T.muted,
        lineHeight: 1.6
      }
    }, "Velg en \xF8kt", /*#__PURE__*/React.createElement("br", null), "i kalenderen."));
    const isHard = brudd && brudd.alv === 'hard';
    const isSoft = brudd && brudd.alv === 'myk';
    const overridden = brudd && override;
    const bdrCol = overridden ? T.lime : isHard ? T.redSolid : isSoft ? T.amber : T.border;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        width: 286,
        flex: 'none',
        background: T.card,
        borderLeft: `1px solid ${bdrCol}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 200ms',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 14px 10px',
        borderBottom: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.12em',
        textTransform: 'uppercase'
      }
    }, "INSPEKT\xD8R"), !isCoach && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 8,
        color: T.muted,
        border: `1px solid ${T.border}`,
        borderRadius: 3,
        padding: '2px 6px'
      }
    }, "LESE-VISNING")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'Familjen Grotesk,Inter,system-ui,sans-serif',
        fontWeight: 700,
        fontSize: 14,
        color: T.fg,
        letterSpacing: '-0.01em',
        marginTop: 5
      }
    }, session.title), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        marginTop: 5,
        flexWrap: 'wrap',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'JetBrains Mono,ui-monospace,monospace',
        fontSize: 9,
        color: AX[session.pyramidArea],
        background: `color-mix(in srgb,${AX[session.pyramidArea]} 14%,transparent)`,
        padding: '2px 7px',
        borderRadius: 4
      }
    }, session.pyramidArea), /*#__PURE__*/React.createElement(Mono, {
      size: 9
    }, session.sH, ":00 \xB7 ", session.dH, "t \xB7 ", session.loc))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        display: 'flex',
        gap: 2,
        padding: '8px 14px 0',
        borderBottom: `1px solid ${T.border}`
      }
    }, [['formel', 'AK-formel'], ['data', 'Data']].map(([v, l]) => {
      const on = fane === v;
      return /*#__PURE__*/React.createElement("button", {
        key: v,
        onClick: () => setFane(v),
        style: {
          position: 'relative',
          height: 28,
          padding: '0 11px',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          fontFamily: 'JetBrains Mono,ui-monospace,monospace',
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: on ? T.fg : T.muted
        }
      }, l, /*#__PURE__*/React.createElement("span", {
        style: {
          position: 'absolute',
          left: 6,
          right: 6,
          bottom: -1,
          height: 2,
          borderRadius: 2,
          background: on ? T.lime : 'transparent'
        }
      }));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, fane === 'data' ? /*#__PURE__*/React.createElement(DataFane, {
      session: session,
      isCoach: isCoach
    }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted,
      style: {
        letterSpacing: '0.12em',
        textTransform: 'uppercase'
      }
    }, "AK-formel"), AKFORMEL.map(ax => {
      const axisBrudd = brudd && brudd.chipKey === ax.key ? brudd : null;
      return /*#__PURE__*/React.createElement(AkAxis, {
        key: ax.key,
        axis: ax,
        value: session[ax.key],
        readOnly: !isCoach,
        brudd: axisBrudd,
        override: axisBrudd ? override : null,
        role: role,
        onOverride: onOverride,
        onChange: val => onChangeFormel(session.id, ax.key, val)
      });
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 7
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }
    }, "\xD8velser"), !isCoach && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 8,
        color: T.muted,
        border: `1px solid ${T.border}`,
        borderRadius: 3,
        padding: '1px 5px'
      }
    }, "lese")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 5
      }
    }, (session.drills || []).map((d, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '7px 9px',
        borderRadius: 7,
        background: T.raised,
        border: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12,
        color: T.fg
      }
    }, d), isCoach && /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 12,
      style: {
        color: T.muted
      }
    }))), isCoach && /*#__PURE__*/React.createElement("button", {
      style: {
        height: 30,
        borderRadius: 7,
        border: `1px dashed ${T.border}`,
        background: 'transparent',
        color: T.muted,
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 10,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 12
    }), "Legg til drill"))), isCoach && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        display: 'block',
        marginBottom: 7
      }
    }, "Coach-notat"), /*#__PURE__*/React.createElement("textarea", {
      defaultValue: "Koble til SG-app 150\u2013175 m. F\xF8lg opp ballflukt.",
      rows: 2,
      style: {
        width: '100%',
        background: T.raised,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: '8px 10px',
        color: T.fg,
        fontSize: 12,
        fontFamily: 'Inter,system-ui,sans-serif',
        resize: 'none',
        outline: 'none',
        boxSizing: 'border-box',
        lineHeight: 1.45
      }
    })), brudd && !brudd.chipKey && /*#__PURE__*/React.createElement("div", {
      style: {
        background: T.raised,
        border: `1px solid ${bdrCol}`,
        borderRadius: 10,
        padding: '10px 12px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: overridden ? 'circle-check' : isHard ? 'circle-x' : 'triangle-alert',
      size: 13,
      style: {
        color: overridden ? T.lime : isHard ? T.red : T.amber
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: overridden ? T.lime : isHard ? T.red : T.amber,
      style: {
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      }
    }, overridden ? 'Overstyrt' : isHard ? 'Hardt brudd' : 'Mykt avvik')), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 11,
        color: isHard ? T.red : isSoft ? T.amber : T.muted,
        lineHeight: 1.45
      }
    }, isCoach ? brudd.melding : brudd.klar)))));
  }

  /* ── Sammenlign-bryter + legende (solid nå / stiplet før) ───── */
  function CompareBar({
    on,
    onToggle,
    accent = T.lime
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onToggle,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 24,
        padding: '0 9px',
        borderRadius: 9999,
        cursor: 'pointer',
        background: on ? `color-mix(in srgb,${accent} 12%,transparent)` : T.raised,
        border: `1px solid ${on ? `color-mix(in srgb,${accent} 45%,transparent)` : T.border}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 14,
        height: 0,
        borderTop: `2px ${on ? 'solid' : 'dashed'} ${on ? accent : T.muted}`
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: on ? accent : T.muted,
      style: {
        letterSpacing: '0.04em'
      }
    }, "Sammenlign forrige")), on && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 14,
        borderTop: `2px solid ${accent}`
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9
    }, "N\xE5")), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 14,
        borderTop: `2px dashed ${T.muted}`
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9
    }, "Forrige"))));
  }

  /* ════ Context panels (foldable §6) ═════════════════════ */
  function ContextPanels({
    role,
    sessions,
    activeIds
  }) {
    const isCoach = role === 'coach';
    const tekActive = activeIds.indexOf('tek-min') !== -1;
    const [cmpAcwr, setCmpAcwr] = React.useState(false);
    const [cmpSg, setCmpSg] = React.useState(false);
    const fmtAcwr = v => v.toFixed(2).replace('.', ',');
    const fmtSg = v => (v > 0 ? '+' : '') + v.toFixed(1).replace('.', ',');
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        maxHeight: 186,
        overflowY: 'auto',
        background: T.card,
        borderTop: `2px solid ${T.border}`,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(Panel, {
      title: "Strokes gained",
      badge: '+0,8 ↑',
      badgeColor: T.lime,
      open: true,
      right: /*#__PURE__*/React.createElement(Mono, {
        size: 9
      }, "12 uker")
    }, /*#__PURE__*/React.createElement(CompareBar, {
      on: cmpSg,
      onToggle: () => setCmpSg(v => !v)
    }), /*#__PURE__*/React.createElement(V.AreaChart, {
      series: D.SG,
      prev: cmpSg ? D.SG_PREV : null,
      yMin: -2.6,
      yMax: 1.2,
      baseline: 0,
      guides: [{
        v: 0,
        color: 'transparent',
        label: '0',
        op: 0
      }, {
        v: -1,
        color: 'transparent',
        label: '−1',
        op: 0
      }],
      name: "SG",
      fmt: fmtSg,
      height: 86,
      compare: cmpSg
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 7,
        marginTop: 10
      }
    }, D.SG_AXES.map(a => {
      const d = a.now - a.prev;
      return /*#__PURE__*/React.createElement(V.StatTile, {
        key: a.key,
        label: a.key,
        value: fmtSg(a.now),
        accent: a.now >= 0 ? T.lime : T.fg,
        delta: fmtSg(d),
        dir: d >= 0 ? 'up' : 'down',
        sub: a.navn
      });
    }))), /*#__PURE__*/React.createElement(Panel, {
      title: "ACWR-belastning",
      badge: '1,22 ↑',
      badgeColor: T.amber,
      right: /*#__PURE__*/React.createElement(Mono, {
        size: 9
      }, "28 dager")
    }, /*#__PURE__*/React.createElement(CompareBar, {
      on: cmpAcwr,
      onToggle: () => setCmpAcwr(v => !v)
    }), /*#__PURE__*/React.createElement(V.AreaChart, {
      series: D.ACWR,
      prev: cmpAcwr ? D.ACWR_PREV : null,
      yMin: 0.6,
      yMax: 1.62,
      bands: [{
        from: 1.5,
        to: 1.62,
        fill: 'rgba(229,72,77,.09)'
      }, {
        from: 1.3,
        to: 1.5,
        fill: 'rgba(221,184,112,.09)'
      }],
      guides: [{
        v: 1.5,
        color: T.redSolid,
        label: '1.5'
      }, {
        v: 1.3,
        color: T.amber,
        label: '1.3'
      }, {
        v: 1.0,
        color: 'rgba(255,255,255,.16)',
        label: '1.0'
      }],
      name: "ACWR",
      fmt: fmtAcwr,
      height: 86,
      compare: cmpAcwr
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: 2,
        background: T.amber
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9
    }, "1,3\u20131,5 f\xF8lg")), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: 2,
        background: T.redSolid
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9
    }, "> 1,5 risiko")), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.amber
    }, "N\xE5 1,22 \xB7 f\xF8lg-sone n\xE6r"))), /*#__PURE__*/React.createElement(Panel, {
      title: "Sesongm\xE5l"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, D.GOALS.map((g, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12,
        color: g.done ? T.muted : T.fg
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: g.done ? 'circle-check' : 'circle',
      size: 13,
      style: {
        color: g.done ? T.lime : T.muted,
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        textDecoration: g.done ? 'line-through' : 'none'
      }
    }, g.t))))), /*#__PURE__*/React.createElement(Panel, {
      title: "Teknisk plan"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, D.TEKNISK_PLAN.map((p, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '6px 9px',
        borderRadius: 7,
        background: T.raised,
        border: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 9,
        fontWeight: 700,
        color: T.lime
      }
    }, p.fase.replace('L_', '')), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12,
        color: T.fg
      }
    }, p.maal), /*#__PURE__*/React.createElement(Mono, {
      size: 9
    }, "uke ", p.uke))))), isCoach && /*#__PURE__*/React.createElement(Panel, {
      title: "Signal-feed",
      badge: tekActive ? '1 ny' : null
    }, tekActive ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 9,
        background: T.raised,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: '8px 10px'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "sparkles",
      size: 13,
      style: {
        color: T.lime,
        flex: 'none',
        marginTop: 1
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12,
        color: T.fg,
        lineHeight: 1.45
      }
    }, "TEK ligger under minstekrav. AI-Caddie foresl\xE5r \xE5 bytte l\xF8rdagsspill mot teknikk-drill.")) : /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12,
        color: T.muted
      }
    }, "Ingen aktive signaler.")));
  }

  /* ════ Bunn-sone (§7) ═══════════════════════════════════ */
  function BunnSone({
    sessions,
    activeIds
  }) {
    const AXES = ['FYS', 'TEK', 'SLAG', 'SPILL', 'TURN'];
    const pyrMin = {
      FYS: 0,
      TEK: 0,
      SLAG: 0,
      SPILL: 0,
      TURN: 0
    };
    let total = 0;
    sessions.forEach(s => {
      pyrMin[s.pyramidArea] += s.dH * 60;
      total += s.dH * 60;
    });
    const volT = total / 60,
      volTak = 11;
    const over = volT > volTak;
    const tekPct = total ? Math.round(pyrMin.TEK / total * 100) : 0;
    const tekWarn = activeIds.indexOf('tek-min') !== -1 || tekPct < 15;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        height: 66,
        borderTop: `1px solid ${T.border}`,
        background: T.card,
        display: 'flex',
        alignItems: 'stretch',
        padding: '0 14px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        justifyContent: 'center',
        width: 236,
        paddingRight: 18,
        borderRight: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        textTransform: 'uppercase',
        letterSpacing: '0.08em'
      }
    }, "Ukevolum"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Mono, {
      size: 11,
      weight: 700,
      color: over ? T.redSolid : T.fg
    }, volT.toFixed(1).replace('.', ','), "t"), " ", /*#__PURE__*/React.createElement(Mono, {
      size: 9
    }, "/ ", volTak, "t"))), /*#__PURE__*/React.createElement(V.SegmentBar, {
      value: volT,
      cap: volTak,
      segs: 11,
      height: 12
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        justifyContent: 'center',
        padding: '0 18px',
        borderRight: `1px solid ${T.border}`,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        textTransform: 'uppercase',
        letterSpacing: '0.08em'
      }
    }, "Pyramide-budsjett"), tekWarn ? /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.red
    }, "TEK ", tekPct, "%"), " ", /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, "/ min 15%")) : /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, "fordeling \xB7 uke 25")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        height: 12,
        gap: 2,
        borderRadius: 4,
        overflow: 'visible'
      }
    }, AXES.map(ax => {
      const pct = total ? Math.round(pyrMin[ax] / total * 100) : 0;
      const flag = ax === 'TEK' && tekWarn;
      return /*#__PURE__*/React.createElement("div", {
        key: ax,
        title: `${ax} ${pct}%`,
        style: {
          width: `${pct}%`,
          minWidth: pct ? 6 : 0,
          borderRadius: 3,
          position: 'relative',
          background: flag ? `repeating-linear-gradient(135deg, ${T.redSolid} 0 3px, color-mix(in srgb,${T.redSolid} 30%,transparent) 3px 6px)` : AX[ax],
          boxShadow: flag ? `0 0 0 1.5px ${T.redSolid}` : 'none'
        }
      });
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap'
      }
    }, AXES.map(ax => {
      const pct = total ? Math.round(pyrMin[ax] / total * 100) : 0;
      const flag = ax === 'TEK' && tekWarn;
      return /*#__PURE__*/React.createElement("span", {
        key: ax,
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
          background: AX[ax],
          boxShadow: flag ? `0 0 0 1.5px ${T.redSolid}` : 'none'
        }
      }), /*#__PURE__*/React.createElement(Mono, {
        size: 9,
        color: flag ? T.red : T.fg
      }, ax, " ", pct, "%"));
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 18
      }
    }, tekWarn ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '6px 11px',
        borderRadius: 8,
        background: 'rgba(229,72,77,.12)',
        border: `1px solid #CD6057`
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
    }, "TEK ", tekPct, "% < 15% minstekrav")) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '6px 11px',
        borderRadius: 8,
        background: `color-mix(in srgb,${T.lime} 10%,transparent)`,
        border: `1px solid color-mix(in srgb,${T.lime} 30%,transparent)`
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-check",
      size: 13,
      style: {
        color: T.lime
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      color: T.lime
    }, "Pyramide i balanse"))));
  }

  /* ════ Plan-kvalitet → bruddliste overlay ═══════════════ */
  function BruddListe({
    role,
    score,
    brudd,
    overrides,
    onOverride,
    onJump,
    onClose
  }) {
    const isCoach = role === 'coach';
    const scoreC = score >= 85 ? T.lime : score >= 70 ? T.amber : T.red;
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        background: 'rgba(4,5,4,.7)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '70px 30px 30px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: 560,
        maxHeight: '80%',
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        boxShadow: 'var(--shadow-sheet)',
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
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'JetBrains Mono,monospace',
        fontWeight: 700,
        fontSize: 28,
        color: scoreC,
        lineHeight: 1
      }
    }, score), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'Familjen Grotesk,Inter,system-ui,sans-serif',
        fontWeight: 700,
        fontSize: 14,
        color: T.fg
      }
    }, "Plan-kvalitet"), /*#__PURE__*/React.createElement(Mono, {
      size: 10
    }, brudd.length, " ", brudd.length === 1 ? 'brudd' : 'brudd', " \xB7 ", brudd.filter(b => b.alv === 'hard').length, " harde"))), /*#__PURE__*/React.createElement("button", {
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
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8
      }
    }, brudd.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: '30px 0',
        color: T.lime
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "circle-check",
      size: 28
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 13
      }
    }, "Alle 9 invarianter OK \u2014 planen er klar.")), brudd.map(b => {
      const ov = overrides[b.id];
      const hard = b.alv === 'hard';
      const c = ov ? T.lime : hard ? T.redSolid : T.amber;
      const cTxt = ov ? T.lime : hard ? T.red : T.amber;
      return /*#__PURE__*/React.createElement("div", {
        key: b.id,
        style: {
          display: 'flex',
          gap: 11,
          padding: '11px 13px',
          borderRadius: 10,
          background: T.raised,
          border: `1px solid ${ov ? `color-mix(in srgb,${T.lime} 35%,transparent)` : hard ? 'rgba(229,72,77,.3)' : 'rgba(221,184,112,.3)'}`
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          flex: 'none',
          paddingTop: 1
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: ov ? 'circle-check' : hard ? 'circle-x' : 'triangle-alert',
        size: 15,
        style: {
          color: c
        }
      })), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          marginBottom: 3
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'Inter,system-ui,sans-serif',
          fontSize: 13,
          fontWeight: 600,
          color: T.fg
        }
      }, b.navn), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'JetBrains Mono,monospace',
          fontSize: 8,
          fontWeight: 700,
          color: cTxt,
          border: `1px solid ${c}`,
          borderRadius: 3,
          padding: '1px 5px',
          textTransform: 'uppercase'
        }
      }, ov ? 'overstyrt' : hard ? 'hard' : 'myk'), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1
        }
      }), /*#__PURE__*/React.createElement(Mono, {
        size: 8
      }, b.sone)), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'Inter,system-ui,sans-serif',
          fontSize: 11.5,
          color: T.muted,
          lineHeight: 1.45
        }
      }, isCoach ? b.melding : b.klar), ov && /*#__PURE__*/React.createElement(Mono, {
        size: 9,
        color: T.muted,
        style: {
          display: 'block',
          marginTop: 5
        }
      }, "Begrunnelse: \xAB", ov, "\xBB"), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 6,
          marginTop: 8
        }
      }, b.sessionId && /*#__PURE__*/React.createElement("button", {
        onClick: () => onJump(b.sessionId),
        style: {
          height: 24,
          padding: '0 9px',
          borderRadius: 6,
          background: 'transparent',
          border: `1px solid ${T.border}`,
          color: T.muted,
          fontFamily: 'JetBrains Mono,monospace',
          fontSize: 9,
          fontWeight: 600,
          cursor: 'pointer'
        }
      }, "G\xE5 til \xF8kt \u2192"), isCoach && hard && !ov && /*#__PURE__*/React.createElement("button", {
        onClick: () => onOverride(b.id, 'Overstyrt fra plan-kvalitet'),
        style: {
          height: 24,
          padding: '0 9px',
          borderRadius: 6,
          background: 'rgba(229,72,77,.12)',
          border: `1px solid #CD6057`,
          color: T.red,
          fontFamily: 'JetBrains Mono,monospace',
          fontSize: 9,
          fontWeight: 700,
          cursor: 'pointer'
        }
      }, "Overstyr"))));
    })), !isCoach && brudd.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 16px',
        borderTop: `1px solid ${T.border}`,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 11,
        color: T.muted,
        lineHeight: 1.5
      }
    }, "Du ser planens kvalitet i klarspr\xE5k. Coachen din l\xF8ser eller overstyrer brudd f\xF8r planen aktiveres.")));
  }

  /* ════ Periode-inspektør (Årsplan-zoom §) ═══════════════ */
  function PeriodeInspektor({
    phase,
    color,
    cur,
    role,
    P,
    milestones,
    onSave,
    onOpenWeek,
    onClose
  }) {
    const isCoach = role === 'coach';
    const [editing, setEditing] = React.useState(false);
    const [draft, setDraft] = React.useState(null);
    React.useEffect(() => {
      setEditing(false);
      setDraft(null);
    }, [phase]);
    if (!P) return /*#__PURE__*/React.createElement("div", {
      style: {
        width: 286,
        flex: 'none',
        background: T.card,
        borderLeft: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12,
        color: T.muted,
        lineHeight: 1.6
      }
    }, "Klikk en periode", /*#__PURE__*/React.createElement("br", null), "i tidslinjen."));
    const tprio = {
      A: T.redSolid,
      B: T.amber,
      C: T.muted
    };
    const AXO = ['FYS', 'TEK', 'SLAG', 'SPILL', 'TURN'];
    const maxPct = Math.max.apply(null, P.budsjett.map(b => b.pct));
    const mst = {
      ferdig: {
        c: T.lime,
        i: 'circle-check',
        l: 'ferdig'
      },
      aktiv: {
        c: T.amber,
        i: 'loader',
        l: 'aktiv'
      },
      planlagt: {
        c: T.muted,
        i: 'circle',
        l: 'planlagt'
      }
    };

    /* ── editor-helpere ── */
    const startEdit = () => {
      setDraft({
        budsjett: P.budsjett.map(b => ({
          ...b
        })),
        maal: P.maal.map(m => ({
          ...m
        })),
        uker: P.uker
      });
      setEditing(true);
    };
    const cancel = () => {
      setEditing(false);
      setDraft(null);
    };
    const sum = draft ? draft.budsjett.reduce((s, b) => s + b.pct, 0) : 100;
    const setBud = (ax, val) => setDraft(d => ({
      ...d,
      budsjett: d.budsjett.map(b => b.ax === ax ? {
        ...b,
        pct: val
      } : b)
    }));
    const setMaalT = (i, t) => setDraft(d => ({
      ...d,
      maal: d.maal.map((m, j) => j === i ? {
        ...m,
        t
      } : m)
    }));
    const cycleAx = i => setDraft(d => ({
      ...d,
      maal: d.maal.map((m, j) => j === i ? {
        ...m,
        ax: AXO[(AXO.indexOf(m.ax) + 1) % AXO.length]
      } : m)
    }));
    const addMaal = () => setDraft(d => ({
      ...d,
      maal: [...d.maal, {
        t: 'Nytt mål',
        ax: 'TEK'
      }]
    }));
    const rmMaal = i => setDraft(d => ({
      ...d,
      maal: d.maal.filter((_, j) => j !== i)
    }));
    const stepWeek = (which, delta) => setDraft(d => {
      let [a, b] = d.uker.split(/[–-]/).map(n => parseInt(n, 10));
      if (which === 'a') a = Math.max(1, Math.min(b, a + delta));else b = Math.max(a, Math.min(52, b + delta));
      return {
        ...d,
        uker: `${a}–${b}`
      };
    });
    const save = () => {
      let bud = draft.budsjett.map(b => ({
        ...b
      }));
      const s = bud.reduce((x, b) => x + b.pct, 0);
      if (s > 0 && s !== 100) {
        bud = bud.map(b => ({
          ...b,
          pct: Math.round(b.pct / s * 100)
        }));
        const s2 = bud.reduce((x, b) => x + b.pct, 0);
        bud[0] = {
          ...bud[0],
          pct: bud[0].pct + (100 - s2)
        };
      }
      const [a, b] = draft.uker.split(/[–-]/).map(n => parseInt(n, 10));
      onSave && onSave({
        budsjett: bud,
        maal: draft.maal,
        uker: draft.uker,
        ukerN: b - a + 1
      });
      setEditing(false);
      setDraft(null);
    };
    const SecLbl = ({
      children,
      right
    }) => /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 9
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase'
      }
    }, children), right);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        width: 286,
        flex: 'none',
        background: T.card,
        borderLeft: `1px solid ${T.border}`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 14px 11px',
        borderBottom: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.12em',
        textTransform: 'uppercase'
      }
    }, editing ? 'REDIGER PERIODE' : 'PERIODE-INSPEKTØR'), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6
      }
    }, isCoach && !editing && /*#__PURE__*/React.createElement("button", {
      onClick: startEdit,
      title: "Rediger periode",
      style: {
        height: 24,
        padding: '0 9px',
        borderRadius: 6,
        background: T.raised,
        border: `1px solid ${T.border}`,
        color: T.fg,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 9,
        fontWeight: 700
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "pencil",
      size: 11
    }), "Rediger"), /*#__PURE__*/React.createElement("button", {
      onClick: editing ? cancel : onClose,
      style: {
        width: 24,
        height: 24,
        borderRadius: 6,
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
      size: 13
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 11,
        height: 11,
        borderRadius: 3,
        background: color,
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'Familjen Grotesk,Inter,system-ui,sans-serif',
        fontWeight: 700,
        fontSize: 16,
        color: T.fg,
        letterSpacing: '-0.01em'
      }
    }, phase), cur && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 8,
        fontWeight: 700,
        color: T.lime,
        border: `1px solid color-mix(in srgb,${T.lime} 45%,transparent)`,
        borderRadius: 4,
        padding: '1px 5px',
        letterSpacing: '0.06em'
      }
    }, "N\xC5")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        marginTop: 7,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, "Uke ", editing ? draft.uker : P.uker), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 3,
        height: 3,
        borderRadius: 9999,
        background: T.border
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, editing ? (() => {
      const [a, b] = draft.uker.split(/[–-]/).map(n => +n);
      return b - a + 1;
    })() : P.ukerN, " uker"))), editing ?
    /*#__PURE__*/
    /* ════ EDITOR ════ */
    React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '13px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 17
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SecLbl, null, "Periode-uker"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 9
      }
    }, [['a', 'Start'], ['b', 'Slutt']].map(([k, lbl]) => {
      const [a, b] = draft.uker.split(/[–-]/).map(n => +n);
      const val = k === 'a' ? a : b;
      return /*#__PURE__*/React.createElement("div", {
        key: k,
        style: {
          flex: 1,
          background: T.raised,
          border: `1px solid ${T.border}`,
          borderRadius: 8,
          padding: '7px 9px'
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        size: 8.5,
        color: T.muted,
        style: {
          display: 'block',
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }
      }, lbl), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 6
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => stepWeek(k, -1),
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
        size: 13,
        weight: 700,
        color: T.fg
      }, val), /*#__PURE__*/React.createElement("button", {
        onClick: () => stepWeek(k, 1),
        style: {
          width: 22,
          height: 22,
          borderRadius: 6,
          background: T.card,
          border: `1px solid ${T.border}`,
          color: T.fg,
          cursor: 'pointer'
        }
      }, "+")));
    }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SecLbl, {
      right: /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'JetBrains Mono,monospace',
          fontSize: 9,
          fontWeight: 700,
          color: sum === 100 ? T.lime : T.amber,
          background: `color-mix(in srgb,${sum === 100 ? T.lime : T.amber} 14%,transparent)`,
          borderRadius: 9999,
          padding: '2px 7px'
        }
      }, "\u03A3 ", sum, "%")
    }, "Pyramide-budsjett"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        height: 13,
        gap: 2,
        marginBottom: 12,
        borderRadius: 4,
        overflow: 'hidden'
      }
    }, draft.budsjett.map(b => b.pct > 0 && /*#__PURE__*/React.createElement("div", {
      key: b.ax,
      style: {
        width: `${b.pct}%`,
        minWidth: 3,
        background: AX[b.ax],
        borderRadius: 3
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, draft.budsjett.map(b => /*#__PURE__*/React.createElement("div", {
      key: b.ax,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 2,
        background: AX[b.ax],
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      color: T.fg,
      style: {
        width: 38,
        flex: 'none'
      }
    }, b.ax), /*#__PURE__*/React.createElement("input", {
      type: "range",
      min: 0,
      max: 60,
      value: b.pct,
      onChange: e => setBud(b.ax, parseInt(e.target.value, 10)),
      style: {
        flex: 1,
        accentColor: AX[b.ax],
        height: 4,
        cursor: 'pointer'
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      weight: 700,
      color: T.fg,
      style: {
        width: 32,
        textAlign: 'right',
        flex: 'none'
      }
    }, b.pct, "%")))), sum !== 100 && /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.amber,
      style: {
        display: 'block',
        marginTop: 9
      }
    }, "Normaliseres til 100% ved lagring.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SecLbl, null, "Periodem\xE5l"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 7
      }
    }, draft.maal.map((m, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '6px 8px',
        borderRadius: 8,
        background: T.raised,
        border: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => cycleAx(i),
      title: "Bytt akse",
      style: {
        flex: 'none',
        width: 46,
        height: 24,
        borderRadius: 6,
        background: `color-mix(in srgb,${AX[m.ax]} 16%,transparent)`,
        border: `1px solid color-mix(in srgb,${AX[m.ax]} 45%,transparent)`,
        color: AX[m.ax],
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 9,
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, m.ax), /*#__PURE__*/React.createElement("input", {
      value: m.t,
      onChange: e => setMaalT(i, e.target.value),
      style: {
        flex: 1,
        minWidth: 0,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: T.fg,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12
      }
    }), /*#__PURE__*/React.createElement("button", {
      onClick: () => rmMaal(i),
      style: {
        flex: 'none',
        width: 22,
        height: 22,
        borderRadius: 6,
        background: 'transparent',
        border: `1px solid ${T.border}`,
        color: T.muted,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "x",
      size: 12
    })))), /*#__PURE__*/React.createElement("button", {
      onClick: addMaal,
      style: {
        height: 32,
        borderRadius: 8,
        border: `1px dashed ${T.border}`,
        background: 'transparent',
        color: T.muted,
        fontFamily: 'Inter,system-ui,sans-serif',
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
      size: 13
    }), "Legg til m\xE5l")))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        padding: '11px 14px',
        borderTop: `1px solid ${T.border}`,
        display: 'flex',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: save,
      style: {
        flex: 1,
        height: 36,
        borderRadius: 9,
        background: T.lime,
        border: 'none',
        color: T.base,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12.5,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 15
    }), "Lagre periode"), /*#__PURE__*/React.createElement("button", {
      onClick: cancel,
      style: {
        height: 36,
        padding: '0 14px',
        borderRadius: 9,
        background: 'transparent',
        border: `1px solid ${T.border}`,
        color: T.muted,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12.5,
        fontWeight: 600,
        cursor: 'pointer'
      }
    }, "Avbryt"))) :
    /*#__PURE__*/
    /* ════ READ-ONLY ════ */
    React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '13px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12,
        color: T.fg,
        lineHeight: 1.55
      }
    }, P.fokus), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        display: 'block',
        marginBottom: 9
      }
    }, "Pyramide-budsjett"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        height: 13,
        gap: 2,
        marginBottom: 11,
        borderRadius: 4,
        overflow: 'hidden'
      }
    }, P.budsjett.map(b => b.pct > 0 && /*#__PURE__*/React.createElement("div", {
      key: b.ax,
      title: `${b.ax} ${b.pct}%`,
      style: {
        width: `${b.pct}%`,
        minWidth: 5,
        background: AX[b.ax],
        borderRadius: 3
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, P.budsjett.map(b => /*#__PURE__*/React.createElement("div", {
      key: b.ax,
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
        background: AX[b.ax],
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      color: T.fg,
      style: {
        width: 40
      }
    }, b.ax), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 5,
        borderRadius: 3,
        background: T.raised,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: `${Math.round(b.pct / maxPct * 100)}%`,
        height: '100%',
        background: AX[b.ax],
        opacity: 0.85
      }
    })), /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      weight: 700,
      color: T.fg,
      style: {
        width: 30,
        textAlign: 'right'
      }
    }, b.pct, "%"))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        display: 'block',
        marginBottom: 8
      }
    }, "Periodem\xE5l"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, P.maal.map((m, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '8px 10px',
        borderRadius: 8,
        background: T.raised,
        border: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 3,
        alignSelf: 'stretch',
        minHeight: 18,
        borderRadius: 2,
        background: AX[m.ax],
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12,
        color: T.fg,
        lineHeight: 1.4
      }
    }, m.t), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 9,
        fontWeight: 700,
        color: AX[m.ax],
        background: `color-mix(in srgb,${AX[m.ax]} 15%,transparent)`,
        borderRadius: 4,
        padding: '2px 6px'
      }
    }, m.ax))))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        display: 'block',
        marginBottom: 8
      }
    }, "Utviklingsplan i perioden"), milestones && milestones.length ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, milestones.map(m => {
      const s = mst[m.status] || mst.planlagt;
      return /*#__PURE__*/React.createElement("div", {
        key: m.id,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '8px 10px',
          borderRadius: 8,
          background: T.raised,
          border: `1px solid ${T.border}`
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 'none',
          minWidth: 24,
          height: 20,
          borderRadius: 5,
          background: `color-mix(in srgb,${AX[m.ax]} 16%,transparent)`,
          color: AX[m.ax],
          fontFamily: 'JetBrains Mono,monospace',
          fontSize: 9,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 5px'
        }
      }, m.id), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          minWidth: 0,
          fontFamily: 'Inter,system-ui,sans-serif',
          fontSize: 11.5,
          color: T.fg,
          lineHeight: 1.35
        }
      }, m.t), /*#__PURE__*/React.createElement("span", {
        title: s.l,
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
          flex: 'none'
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: s.i,
        size: 12,
        style: {
          color: s.c
        }
      }), /*#__PURE__*/React.createElement(Mono, {
        size: 8,
        color: s.c
      }, "uke ", m.uke)));
    })) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '9px 11px',
        borderRadius: 8,
        background: T.raised,
        border: `1px dashed ${T.border}`
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      color: T.muted
    }, "Ingen milep\xE6ler i perioden"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      style: {
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        display: 'block',
        marginBottom: 8
      }
    }, "Koblede turneringer"), P.turn.length ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, P.turn.map((t, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '8px 10px',
        borderRadius: 8,
        background: T.raised,
        border: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: 9999,
        background: tprio[t.p],
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12,
        color: T.fg
      }
    }, t.n), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.muted
    }, "uke ", t.w), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 9,
        fontWeight: 700,
        color: tprio[t.p],
        border: `1px solid ${tprio[t.p]}`,
        borderRadius: 3,
        padding: '1px 5px'
      }
    }, t.p)))) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '9px 11px',
        borderRadius: 8,
        background: T.raised,
        border: `1px dashed ${T.border}`
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      color: T.muted
    }, "Ingen turneringer i perioden")))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        padding: '11px 14px',
        borderTop: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onOpenWeek,
      style: {
        width: '100%',
        height: 36,
        borderRadius: 9,
        background: T.fg,
        border: 'none',
        color: T.base,
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12.5,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "calendar",
      size: 15
    }), "\xC5pne uke i perioden"))));
  }

  /* ════ Årsplan — 52-week macro canvas ═══════════════════ */
  function Arsplan({
    onOpenWeek,
    role
  }) {
    const [selPhase, setSelPhase] = React.useState('Spesialisering');
    const [perOv, setPerOv] = React.useState({});
    /* Ytterdiven trenger position:relative for turnToast-kvitteringen. */
    const PHASES_INIT = [{
      label: 'Base',
      w0: 1,
      w1: 8,
      color: 'oklch(0.44 0.03 155)'
    }, {
      label: 'Forberedelse',
      w0: 9,
      w1: 18,
      color: 'oklch(0.46 0.055 230)'
    }, {
      label: 'Spesialisering',
      w0: 19,
      w1: 31,
      color: 'oklch(0.52 0.07 80)'
    }, {
      label: 'Nedtrapping',
      w0: 32,
      w1: 36,
      color: 'oklch(0.46 0.05 346)'
    }, {
      label: 'Peak',
      w0: 37,
      w1: 46,
      color: 'oklch(0.56 0.11 145)'
    }, {
      label: 'Overgang',
      w0: 47,
      w1: 52,
      color: 'oklch(0.40 0.02 200)'
    }];
    const [PHASES, setPhases] = React.useState(PHASES_INIT);
    const [sistJustert, setSistJustert] = React.useState(null);
    const dragRef = React.useRef(null);

    /* Kant-drag på periodiserings-sporet: fasene er en sammenhengende kjede —
       å dra en kant flytter nabogrensen. Snap = uke. Escape avbryter. */
    const startKant = (e, i, side) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();
      const flate = e.currentTarget.closest('[data-perflate]');
      if (!flate) return;
      dragRef.current = {
        i,
        side,
        x0: e.clientX,
        w: flate.getBoundingClientRect().width,
        snapshot: PHASES,
        moved: false
      };
      const move = ev => {
        const d = dragRef.current;
        if (!d) return;
        const dw = Math.round((ev.clientX - d.x0) / d.w * 52);
        if (dw === 0 && !d.moved) return;
        d.moved = true;
        setPhases(() => {
          const p = d.snapshot.map(x => ({
            ...x
          }));
          const f = p[d.i];
          if (d.side === 'v') {
            const ny = Math.min(Math.max(f.w0 + dw, p[d.i - 1] ? p[d.i - 1].w0 + 1 : 1), f.w1);
            f.w0 = ny;
            if (p[d.i - 1]) p[d.i - 1].w1 = ny - 1;
          } else {
            const ny = Math.max(Math.min(f.w1 + dw, p[d.i + 1] ? p[d.i + 1].w1 - 1 : 52), f.w0);
            f.w1 = ny;
            if (p[d.i + 1]) p[d.i + 1].w0 = ny + 1;
          }
          return p;
        });
      };
      const stopp = commit => {
        const d = dragRef.current;
        dragRef.current = null;
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        document.removeEventListener('keydown', esc, true);
        if (!d) return;
        if (!commit) setPhases(d.snapshot);else if (d.moved) setSistJustert({
          snapshot: d.snapshot
        });
      };
      const up = () => stopp(true);
      const esc = ev => {
        if (ev.key === 'Escape') stopp(false);
      };
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
      document.addEventListener('keydown', esc, true);
    };
    /* Turnerings-laget — delt kilde m/ turneringsplanleggeren (TURNDATA, lastes i
       workbench.html). Fallback når fila kjører uten turneringer-data.js (bundle). */
    const TD = window.TURNDATA || null;
    const [turnListe, setTurnListe] = React.useState(() => TD ? TD.TURNERINGER.map(t => ({
      id: t.id,
      w: t.uke,
      p: t.prio,
      n: t.navn,
      status: t.status,
      frist: t.pamelding && t.pamelding.status === 'åpen' ? t.pamelding.frist : null
    })) : [{
      id: 'x1',
      w: 14,
      p: 'C',
      n: 'Sesongåpning'
    }, {
      id: 'x2',
      w: 24,
      p: 'B',
      n: 'Krets'
    }, {
      id: 'x3',
      w: 32,
      p: 'B',
      n: 'Regionals'
    }, {
      id: 'x4',
      w: 38,
      p: 'A',
      n: 'NM'
    }, {
      id: 'x5',
      w: 44,
      p: 'C',
      n: 'Klubbmest.'
    }]);
    const [turnForslag, setTurnForslag] = React.useState(() => TD ? TD.ANBEFALINGER.map(a => ({
      ...a,
      state: 'åpen'
    })) : []);
    const [turnToast, setTurnToast] = React.useState(null);
    const visTurnToast = m => {
      setTurnToast(m);
      window.clearTimeout(visTurnToast._t);
      visTurnToast._t = window.setTimeout(() => setTurnToast(null), 3200);
    };
    const brukTurnForslag = a => {
      if (a.type === 'ny-turnering' && a.payload) {
        setTurnListe(l => l.concat({
          id: a.payload.id,
          w: a.payload.uke,
          p: a.payload.prio,
          n: a.payload.navn,
          status: a.payload.status,
          frist: a.payload.pamelding.frist
        }).sort((x, y) => x.w - y.w));
        visTurnToast('Srixon Tour #2 lagt i sesongplanen — uke 28.');
      } else if (a.type === 'meld-paa') {
        setTurnListe(l => l.map(t => t.id === a.targetId ? {
          ...t,
          status: 'påmeldt',
          frist: null
        } : t));
        visTurnToast('NM-kvalifisering — Øyvind er meldt på.');
      }
      setTurnForslag(list => list.map(x => x.id === a.id ? {
        ...x,
        state: 'brukt'
      } : x));
    };
    const TOURN = turnListe;
    const CUR = 25;
    const WEEKS = Array.from({
      length: 52
    }, (_, i) => i + 1);
    const phaseOf = w => PHASES.find(p => w >= p.w0 && w <= p.w1);
    const load = WEEKS.map(w => {
      const ph = phaseOf(w);
      let v = 45 + w / 52 * 26;
      if (ph && (ph.label === 'Spesialisering' || ph.label === 'Peak')) v += 14;
      if (ph && ph.label === 'Nedtrapping') v -= 18;
      if (ph && ph.label === 'Overgang') v -= 26;
      if (TOURN.find(t => t.w === w)) v -= 10;
      v += Math.sin(w * 1.3) * 5;
      return Math.max(14, Math.min(100, v));
    });
    const acwr = WEEKS.map((w, i) => {
      const win = load.slice(Math.max(0, i - 3), i + 1);
      return Math.max(0.7, Math.min(1.6, load[i] / (win.reduce((s, x) => s + x, 0) / win.length)));
    });
    const acwrColor = a => a > 1.4 ? T.redSolid : a > 1.2 ? T.amber : T.lime;
    const tprio = {
      A: T.redSolid,
      B: T.amber,
      C: T.muted
    };
    const MONTHS = [['Jan', 1], ['Feb', 5], ['Mar', 9], ['Apr', 14], ['Mai', 18], ['Jun', 22], ['Jul', 27], ['Aug', 31], ['Sep', 35], ['Okt', 40], ['Nov', 44], ['Des', 48]];
    const SAML = [{
      w0: 3,
      w1: 4,
      n: 'La Manga'
    }, {
      w0: 20,
      w1: 20,
      n: 'Regionsamling'
    }, {
      w0: 27,
      w1: 28,
      n: 'Sommerleir'
    }, {
      w0: 36,
      w1: 37,
      n: 'NM-camp'
    }];
    /* Test-sporet — delt kilde m/ Tildel test-modusen (WBDATA.TESTPLAN) */
    const TEST = D.TESTPLAN && D.TESTPLAN.length ? D.TESTPLAN.map(t => ({
      w: t.uke,
      q: t.q || t.kort || 'T',
      navn: t.prot,
      status: t.status
    })) : [{
      w: 6,
      q: 'Q1'
    }, {
      w: 19,
      q: 'Q2'
    }, {
      w: 32,
      q: 'Q3'
    }, {
      w: 45,
      q: 'Q4'
    }];
    const GUT = 104,
      MHH = 16,
      GAP = 9;
    const wx = w => (w - 1) / 52 * 100,
      ww = n => n / 52 * 100,
      wc = w => (w - 0.5) / 52 * 100;
    const H = {
      per: 32,
      tur: 56,
      sam: 28,
      tst: 28,
      upl: 30,
      bel: 58,
      acw: 20
    };
    const TRACKS = [{
      key: 'per',
      label: 'Periodisering',
      icon: 'layers'
    }, {
      key: 'tur',
      label: 'Turneringer',
      icon: 'trophy'
    }, {
      key: 'sam',
      label: 'Samlinger',
      icon: 'users'
    }, {
      key: 'tst',
      label: 'Tester',
      icon: 'target'
    }, {
      key: 'upl',
      label: 'Utviklingsplan',
      icon: 'git-branch'
    }, {
      key: 'bel',
      label: 'Belastning',
      icon: 'activity'
    }, {
      key: 'acw',
      label: 'ACWR',
      icon: 'gauge'
    }];
    const selColor = (PHASES.find(p => p.label === selPhase) || {}).color;
    const curPhase = 'Spesialisering';
    const Pmerged = selPhase ? {
      ...D.PERIODER[selPhase],
      ...(perOv[selPhase] || {})
    } : null;
    const perMs = (() => {
      if (!Pmerged) return [];
      const [a, b] = (Pmerged.uker || '').split(/[–-]/).map(n => parseInt(n, 10));
      return (D.UTVIKLINGSPLAN || []).filter(m => m.uke >= a && m.uke <= b);
    })();
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        minHeight: 0,
        background: T.base,
        overflow: 'hidden',
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 18px',
        borderBottom: `1px solid ${T.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'Familjen Grotesk,Inter,system-ui,sans-serif',
        fontWeight: 700,
        fontSize: 15,
        color: T.fg
      }
    }, "Sesong 2026"), /*#__PURE__*/React.createElement(Mono, {
      size: 10
    }, "52 uker \xB7 multi-spor periodisering")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
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
        background: T.redSolid,
        borderRadius: 1
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9
    }, "A-turnering")), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10,
        height: 9,
        borderRadius: 2,
        background: T.forest
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9
    }, "samling")), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: 9999,
        border: `1.5px solid ${T.muted}`
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9
    }, "test")), /*#__PURE__*/React.createElement("span", {
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
      size: 9
    }, "P-milep\xE6l")), /*#__PURE__*/React.createElement(Mono, {
      size: 8,
      color: T.muted
    }, "klikk fase \u2192 inspekt\xF8r \xB7 dra kantene \u2192 juster uker \xB7 uke \u2192 zoom"))), sistJustert && /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '6px 18px',
        borderBottom: `1px solid ${T.border}`
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
    }, "Faseuker justert \u2014 re-validert. Belastning og ACWR f\xF8lger etter."), /*#__PURE__*/React.createElement("button", {
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
        setPhases(sistJustert.snapshot);
        setSistJustert(null);
      }
    }, "ANGRE")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '15px 18px 20px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: GUT,
        flex: 'none',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: MHH
      }
    }), TRACKS.map(t => /*#__PURE__*/React.createElement("div", {
      key: t.key,
      style: {
        height: H[t.key],
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        paddingRight: 10,
        marginBottom: GAP
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: t.icon,
      size: 14,
      style: {
        color: T.muted,
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 10,
      color: T.fg,
      style: {
        letterSpacing: '0.01em'
      }
    }, t.label)))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        height: MHH
      }
    }, MONTHS.map(([m, w]) => /*#__PURE__*/React.createElement("div", {
      key: m,
      style: {
        position: 'absolute',
        left: `${wx(w)}%`,
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 9,
        color: T.muted
      }
    }, m))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative'
      }
    }, MONTHS.map(([m, w]) => w > 1 && /*#__PURE__*/React.createElement("div", {
      key: 'g' + m,
      style: {
        position: 'absolute',
        left: `${wx(w)}%`,
        top: 0,
        bottom: 0,
        width: 1,
        background: T.border,
        opacity: 0.55,
        pointerEvents: 'none'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: `${wc(CUR)}%`,
        top: 0,
        bottom: 18,
        width: 2,
        background: T.lime,
        opacity: 0.85,
        pointerEvents: 'none',
        zIndex: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: -3,
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'JetBrains Mono,monospace',
        fontSize: 8,
        fontWeight: 700,
        color: T.base,
        background: T.lime,
        borderRadius: 3,
        padding: '1px 4px',
        whiteSpace: 'nowrap'
      }
    }, "N\xC5 \xB7 25")), /*#__PURE__*/React.createElement("div", {
      "data-perflate": true,
      style: {
        position: 'relative',
        height: H.per,
        marginBottom: GAP
      }
    }, PHASES.map((p, pi) => {
      const on = selPhase === p.label;
      return /*#__PURE__*/React.createElement("button", {
        key: p.label,
        onClick: () => setSelPhase(p.label),
        title: `${p.label} · uke ${p.w0}–${p.w1} · åpne periode-inspektør`,
        style: {
          position: 'absolute',
          left: `${wx(p.w0)}%`,
          width: `calc(${ww(p.w1 - p.w0 + 1)}% - 3px)`,
          top: 0,
          height: H.per,
          background: p.color,
          border: 'none',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: 'pointer',
          outline: 'none',
          opacity: on ? 1 : 0.9,
          boxShadow: on ? `0 0 0 2px ${T.base}, 0 0 0 3.5px ${T.lime}` : 'none',
          transition: 'box-shadow 120ms,opacity 120ms',
          zIndex: on ? 3 : 1
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        size: 9,
        color: "#0C0D0C",
        weight: 700,
        style: {
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap'
        }
      }, p.label), pi > 0 && /*#__PURE__*/React.createElement("span", {
        onPointerDown: e => startKant(e, pi, 'v'),
        style: {
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 9,
          cursor: 'ew-resize',
          touchAction: 'none'
        },
        "aria-hidden": "true"
      }), pi < PHASES.length - 1 && /*#__PURE__*/React.createElement("span", {
        onPointerDown: e => startKant(e, pi, 'h'),
        style: {
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: 9,
          cursor: 'ew-resize',
          touchAction: 'none'
        },
        "aria-hidden": "true"
      }));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        height: H.tur,
        marginBottom: GAP
      }
    }, TOURN.map((t, ti) => /*#__PURE__*/React.createElement("div", {
      key: t.id || t.w,
      title: `${t.n} · prioritet ${t.p} · uke ${t.w}${t.status ? ' · ' + t.status : ''}${t.frist ? ' · påmeldingsfrist ' + t.frist : ''}`,
      style: {
        position: 'absolute',
        left: `${wc(t.w)}%`,
        top: 1,
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        whiteSpace: 'nowrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'relative',
        width: 13,
        height: 13,
        marginBottom: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        inset: 0,
        transform: 'rotate(45deg)',
        background: tprio[t.p],
        borderRadius: 2,
        border: `1.5px solid ${T.base}`
      }
    }), t.frist && /*#__PURE__*/React.createElement("span", {
      title: `Påmeldingsfrist ${t.frist}`,
      style: {
        position: 'absolute',
        top: -3,
        right: -4,
        width: 7,
        height: 7,
        borderRadius: 9999,
        background: T.amber,
        border: `1.5px solid ${T.base}`
      }
    })), ti % 2 === 1 && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 1,
        height: 13,
        background: T.border
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.fg,
      style: {
        display: 'block',
        maxWidth: 64,
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, t.n), /*#__PURE__*/React.createElement(Mono, {
      size: 8,
      color: tprio[t.p],
      weight: 700
    }, t.p))))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        height: H.sam,
        marginBottom: GAP
      }
    }, SAML.map((s, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      title: `${s.n} · uke ${s.w0}${s.w1 > s.w0 ? '–' + s.w1 : ''}`,
      style: {
        position: 'absolute',
        left: `${wx(s.w0)}%`,
        width: `calc(${ww(s.w1 - s.w0 + 1)}% - 2px)`,
        top: 3,
        height: H.sam - 6,
        background: `color-mix(in srgb,${T.forest} 60%,${T.raised})`,
        border: `1px solid ${T.forest}`,
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        padding: '0 7px',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.fg,
      style: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, s.n)))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        height: H.tst,
        marginBottom: GAP
      }
    }, TEST.map((t, i) => /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => onOpenWeek(t.w),
      title: `${t.navn || t.q + '-test'} · uke ${t.w}${t.status ? ' · ' + t.status : ''} · åpne uka`,
      style: {
        position: 'absolute',
        left: `${wc(t.w)}%`,
        top: '50%',
        transform: 'translate(-50%,-50%)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 20,
        padding: '0 8px',
        borderRadius: 9999,
        background: T.raised,
        border: `1px solid ${T.border}`,
        cursor: 'pointer',
        opacity: t.status === 'fullført' ? 1 : 0.85
      }
    }, t.status === 'fullført' ? /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 10,
      style: {
        color: T.lime
      }
    }) : /*#__PURE__*/React.createElement(Icon, {
      name: "target",
      size: 11,
      style: {
        color: T.muted
      }
    }), /*#__PURE__*/React.createElement(Mono, {
      size: 9,
      color: T.fg,
      weight: 700
    }, t.q)))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        height: H.upl,
        marginBottom: GAP
      }
    }, (D.UTVIKLINGSPLAN || []).map((m, i) => {
      const c = AX[m.ax] || T.muted;
      const ferdig = m.status === 'ferdig',
        aktiv = m.status === 'aktiv';
      return /*#__PURE__*/React.createElement("div", {
        key: m.id,
        title: `${m.id} · ${m.t} · ${m.ax} · uke ${m.uke} · ${m.status}`,
        style: {
          position: 'absolute',
          left: `${wc(m.uke)}%`,
          top: '50%',
          transform: 'translate(-50%,-50%)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          height: 20,
          padding: '0 8px',
          borderRadius: 9999,
          background: ferdig ? `color-mix(in srgb,${c} 22%,${T.raised})` : T.raised,
          border: `1px solid ${aktiv ? c : ferdig ? `color-mix(in srgb,${c} 45%,${T.border})` : T.border}`,
          opacity: m.status === 'planlagt' ? 0.75 : 1
        }
      }, ferdig ? /*#__PURE__*/React.createElement(Icon, {
        name: "check",
        size: 10,
        style: {
          color: c
        }
      }) : /*#__PURE__*/React.createElement("span", {
        style: {
          width: 6,
          height: 6,
          borderRadius: 9999,
          background: c,
          flex: 'none'
        }
      }), /*#__PURE__*/React.createElement(Mono, {
        size: 9,
        color: T.fg,
        weight: 700
      }, m.id));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        height: H.bel,
        marginBottom: GAP,
        display: 'grid',
        gridTemplateColumns: 'repeat(52,1fr)',
        alignItems: 'end',
        borderBottom: `1px solid ${T.border}`
      }
    }, WEEKS.map((w, i) => {
      const ph = phaseOf(w);
      const cur = w === CUR;
      return /*#__PURE__*/React.createElement("button", {
        key: w,
        onClick: () => onOpenWeek(w),
        title: `Uke ${w} · belastning ${Math.round(load[i])}`,
        style: {
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '0 1px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: '100%',
          maxWidth: 11,
          height: `${load[i]}%`,
          background: cur ? T.lime : ph ? ph.color : T.border,
          borderRadius: '2px 2px 0 0',
          opacity: cur ? 1 : 0.8
        }
      }));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        height: H.acw,
        marginBottom: GAP,
        display: 'grid',
        gridTemplateColumns: 'repeat(52,1fr)',
        gap: 1,
        alignItems: 'stretch'
      }
    }, WEEKS.map((w, i) => /*#__PURE__*/React.createElement("div", {
      key: w,
      title: `ACWR ${acwr[i].toFixed(2)}`,
      style: {
        background: acwrColor(acwr[i]),
        opacity: 0.35 + (acwr[i] - 0.7) / 0.9 * 0.55,
        borderRadius: 2
      }
    })))))), turnForslag.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        marginBottom: 9
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
    }, "AI-anbefalinger \xB7 turneringer"), /*#__PURE__*/React.createElement(Mono, {
      size: 8.5,
      color: T.muted
    }, "\xABBruk forslag\xBB skriver til sesongplanen \u2014 aldri sperrer")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12
      }
    }, turnForslag.map(a => {
      const brukt = a.state === 'brukt';
      return /*#__PURE__*/React.createElement("div", {
        key: a.id,
        style: {
          background: T.card,
          border: `1px solid ${brukt ? T.border : `color-mix(in srgb,${T.lime} 30%,${T.border})`}`,
          borderRadius: 12,
          padding: '12px 13px',
          display: 'flex',
          flexDirection: 'column',
          opacity: brukt ? 0.85 : 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 8
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "sparkles",
        size: 12,
        style: {
          color: T.lime
        }
      }), /*#__PURE__*/React.createElement(Mono, {
        size: 8,
        color: T.lime,
        style: {
          letterSpacing: '0.11em',
          textTransform: 'uppercase'
        }
      }, "AI-forslag"), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1
        }
      }), brukt && /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          height: 18,
          padding: '0 7px',
          borderRadius: 9999,
          background: `color-mix(in srgb,${T.lime} 14%,transparent)`,
          border: `1px solid color-mix(in srgb,${T.lime} 40%,transparent)`
        }
      }, /*#__PURE__*/React.createElement(Icon, {
        name: "check",
        size: 10,
        style: {
          color: T.lime
        }
      }), /*#__PURE__*/React.createElement(Mono, {
        size: 8,
        color: T.lime
      }, "Brukt"))), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'Familjen Grotesk,Inter,system-ui,sans-serif',
          fontWeight: 700,
          fontSize: 13,
          color: T.fg,
          lineHeight: 1.3,
          marginBottom: 9
        }
      }, a.tittel), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          marginBottom: 10
        }
      }, [['Hvorfor', a.hvorfor], ['Hva', a.hva], ['Forventet effekt', a.effekt], ['Hvorfor nå', a.naa]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
        key: k,
        style: {
          display: 'flex',
          gap: 8
        }
      }, /*#__PURE__*/React.createElement(Mono, {
        size: 7.5,
        color: T.muted,
        style: {
          width: 80,
          flex: 'none',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          paddingTop: 2,
          lineHeight: 1.35
        }
      }, k), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1,
          fontFamily: 'Inter,system-ui,sans-serif',
          fontSize: 10.5,
          lineHeight: 1.45,
          color: k === 'Forventet effekt' ? T.fg : '#C8CAC5',
          fontWeight: k === 'Forventet effekt' ? 600 : 400
        }
      }, v)))), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          gap: 7,
          marginTop: 'auto'
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => brukTurnForslag(a),
        disabled: brukt,
        style: {
          flex: 1,
          height: 28,
          borderRadius: 8,
          background: brukt ? T.raised : T.lime,
          border: brukt ? `1px solid ${T.border}` : 'none',
          color: brukt ? T.muted : T.base,
          fontFamily: 'Inter,system-ui,sans-serif',
          fontSize: 11,
          fontWeight: 700,
          cursor: brukt ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5
        }
      }, brukt ? 'Skrevet til sesongplanen' : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Icon, {
        name: "sparkles",
        size: 11
      }), "Bruk forslag")), !brukt && /*#__PURE__*/React.createElement("button", {
        onClick: () => {
          setTurnForslag(list => list.filter(x => x.id !== a.id));
          visTurnToast('Forslag avvist — planen står urørt.');
        },
        style: {
          height: 28,
          padding: '0 10px',
          borderRadius: 8,
          background: 'transparent',
          border: `1px solid ${T.border}`,
          color: T.muted,
          fontFamily: 'Inter,system-ui,sans-serif',
          fontSize: 11,
          fontWeight: 600,
          cursor: 'pointer'
        }
      }, "Avvis")));
    }))))), turnToast && /*#__PURE__*/React.createElement("div", {
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
        border: `1px solid color-mix(in srgb,${T.lime} 38%,${T.border})`,
        boxShadow: 'var(--shadow-popover)',
        zIndex: 40
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "check",
      size: 13,
      style: {
        color: T.lime,
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'Inter,system-ui,sans-serif',
        fontSize: 12,
        color: T.fg,
        whiteSpace: 'nowrap'
      }
    }, turnToast)), /*#__PURE__*/React.createElement(PeriodeInspektor, {
      phase: selPhase,
      color: selColor,
      cur: selPhase === curPhase,
      role: role,
      P: Pmerged,
      milestones: perMs,
      onSave: data => setPerOv(o => ({
        ...o,
        [selPhase]: data
      })),
      onOpenWeek: onOpenWeek,
      onClose: () => setSelPhase(null)
    }));
  }
  window.WBZ = {
    Mono,
    Chip,
    KpiChip,
    ZoomPill,
    SegToggle,
    Panel,
    Palette,
    TimeGrid,
    Inspector,
    ContextPanels,
    BunnSone,
    BruddListe,
    Arsplan
  };
})();
})(); 