/* @ds-bundle: {"format":3,"namespace":"AKGolfHQDesignSystem_9e6e67","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Eyebrow","sourcePath":"components/core/Eyebrow.jsx"},{"name":"KpiCard","sourcePath":"components/data/KpiCard.jsx"},{"name":"KpiRing","sourcePath":"components/data/KpiRing.jsx"},{"name":"PyramidProgress","sourcePath":"components/data/PyramidProgress.jsx"},{"name":"SgBar","sourcePath":"components/data/SgBar.jsx"},{"name":"StatTable","sourcePath":"components/data/StatTable.jsx"},{"name":"EmptyState","sourcePath":"components/feedback/EmptyState.jsx"},{"name":"Skeleton","sourcePath":"components/feedback/Skeleton.jsx"},{"name":"SkeletonRow","sourcePath":"components/feedback/Skeleton.jsx"},{"name":"StatusPill","sourcePath":"components/feedback/StatusPill.jsx"},{"name":"MasteryRing","sourcePath":"components/gamification/MasteryRing.jsx"},{"name":"StreakTracker","sourcePath":"components/gamification/StreakTracker.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"d31a403b2f1c","components/core/Badge.jsx":"f83854498362","components/core/Button.jsx":"f0b58506046e","components/core/Eyebrow.jsx":"3140d2547389","components/data/KpiCard.jsx":"6f1ee8149813","components/data/KpiRing.jsx":"f8bfb58e226f","components/data/PyramidProgress.jsx":"695e5a4d64b1","components/data/SgBar.jsx":"84dc6f0fa8f1","components/data/StatTable.jsx":"96ef01c2fb24","components/feedback/EmptyState.jsx":"ea9eb30e8c1a","components/feedback/Skeleton.jsx":"aef1c60dd3f4","components/feedback/StatusPill.jsx":"ac8b3fea0024","components/gamification/MasteryRing.jsx":"7f6997b49849","components/gamification/StreakTracker.jsx":"c21fc1a6a683"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AKGolfHQDesignSystem_9e6e67 = window.AKGolfHQDesignSystem_9e6e67 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Avatar — AK Golf HQ
 * Round avatar, lime gradient ring, initials in lime mono on forest-deep.
 * Four sizes + optional presence dot.
 */
function Avatar({
  initials = '',
  src = null,
  size = 'md',
  ring = 'lime',
  presence = null,
  style = {},
  ...rest
}) {
  const dims = {
    sm: 40,
    md: 56,
    lg: 64,
    xl: 72
  };
  const d = dims[size] || dims.md;
  const rings = {
    lime: 'linear-gradient(135deg, var(--lime), var(--lime-deep))',
    forest: 'linear-gradient(135deg, var(--forest), var(--forest-deep))',
    neutral: 'var(--line)'
  };
  const presenceColors = {
    online: 'var(--lime)',
    away: 'var(--warn)',
    busy: 'var(--urgent)',
    offline: 'var(--muted-2)'
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      position: 'relative',
      display: 'inline-block',
      width: d,
      height: d,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: '100%',
      height: '100%',
      borderRadius: 'var(--r-full)',
      padding: '2.5px',
      background: rings[ring],
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: '100%',
      height: '100%',
      borderRadius: 'var(--r-full)',
      overflow: 'hidden',
      background: 'var(--forest-deep)',
      display: 'grid',
      placeItems: 'center',
      fontFamily: 'var(--font-mono)',
      fontWeight: 700,
      color: 'var(--lime)',
      fontSize: Math.round(d * 0.3),
      position: 'relative'
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: initials,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      filter: 'saturate(.7) brightness(.95)'
    }
  }) : initials)), presence && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: Math.round(d * 0.26),
      height: Math.round(d * 0.26),
      borderRadius: '50%',
      background: presenceColors[presence],
      border: '2px solid var(--surface-card)'
    },
    "aria-label": presence
  }));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Badge — AK Golf HQ
 * Small mono-caps pill for status / category marking. Six tones.
 */
function Badge({
  children,
  tone = 'neutral',
  dot = false,
  style = {},
  ...rest
}) {
  const tones = {
    neutral: {
      background: 'var(--surface-sand)',
      color: 'var(--text-muted)'
    },
    lime: {
      background: 'var(--accent)',
      color: 'var(--accent-fg)'
    },
    forest: {
      background: 'var(--brand)',
      color: 'var(--brand-fg)'
    },
    ok: {
      background: 'rgba(26,125,86,.12)',
      color: 'var(--ok)'
    },
    warn: {
      background: 'rgba(184,133,42,.14)',
      color: 'var(--warn)'
    },
    urgent: {
      background: 'rgba(163,45,45,.12)',
      color: 'var(--urgent)'
    },
    info: {
      background: 'rgba(37,99,235,.12)',
      color: 'var(--info)'
    }
  };
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    padding: '4px 9px',
    borderRadius: 'var(--r-full)',
    whiteSpace: 'nowrap',
    ...tones[tone],
    ...style
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: base
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: 'currentColor'
    },
    "aria-hidden": "true"
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — AK Golf HQ
 * Mono-caps, pill-radius action. Lime is the primary CTA; never a dead button.
 */
function Button({
  children,
  variant = 'lime',
  size = 'md',
  icon = null,
  iconRight = null,
  disabled = false,
  fullWidth = false,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      padding: '8px 13px',
      fontSize: '11px'
    },
    md: {
      padding: '12px 18px',
      fontSize: '12px'
    },
    lg: {
      padding: '15px 24px',
      fontSize: '13px'
    }
  };
  const variants = {
    lime: {
      background: 'var(--accent)',
      color: 'var(--accent-fg)',
      border: '1px solid var(--accent)'
    },
    forest: {
      background: 'var(--brand)',
      color: 'var(--brand-fg)',
      border: '1px solid var(--brand)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-strong)',
      border: '1.5px solid var(--line)'
    },
    terminal: {
      background: 'var(--surface-card-2)',
      color: 'var(--text-strong)',
      border: '1px solid var(--line)'
    }
  };
  const base = {
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    borderRadius: 'var(--r-full)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background-color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : undefined,
    ...sizes[size],
    ...variants[variant],
    ...style
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    disabled: disabled,
    style: base
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: '1em',
      height: '1em'
    },
    "aria-hidden": "true"
  }, icon), children, iconRight && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: '1em',
      height: '1em'
    },
    "aria-hidden": "true"
  }, iconRight));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Eyebrow — AK Golf HQ
 * Small mono-caps overline. Three tones; lime for live moments.
 */
function Eyebrow({
  children,
  tone = 'default',
  style = {},
  ...rest
}) {
  const tones = {
    default: {
      color: 'var(--text-faint)'
    },
    lime: {
      color: 'var(--accent-text)'
    },
    onDark: {
      color: 'rgba(255,255,255,.7)'
    }
  };
  const base = {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    ...tones[tone],
    ...style
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: base
  }, rest), children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/data/KpiCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * KpiCard — AK Golf HQ
 * The number is the hero. Mono value, optional unit, signed delta.
 * Fill variants: plain / forest / lime.
 */
function KpiCard({
  label,
  value,
  unit = null,
  delta = null,
  direction = null,
  fill = 'plain',
  style = {},
  ...rest
}) {
  const fills = {
    plain: {
      background: 'var(--surface-card-2)',
      border: '1px solid var(--line)',
      labelC: 'var(--text-faint)',
      valueC: 'var(--text-strong)'
    },
    forest: {
      background: 'var(--forest)',
      border: '1px solid var(--forest)',
      labelC: 'var(--lime)',
      valueC: '#fff'
    },
    lime: {
      background: 'var(--lime)',
      border: '1px solid var(--lime-deep)',
      labelC: 'var(--forest-deep)',
      valueC: 'var(--forest-deep)'
    }
  };
  const f = fills[fill];
  const dir = direction || (delta && String(delta).trim().startsWith('-') ? 'down' : delta ? 'up' : null);
  const deltaColor = fill === 'plain' ? dir === 'down' ? 'var(--signal-down)' : dir === 'up' ? 'var(--signal-up)' : 'var(--text-faint)' : f.labelC;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      borderRadius: 'var(--r-md)',
      padding: '14px',
      ...f,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '9.5px',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: f.labelC,
      marginBottom: '8px'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      fontSize: '28px',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1,
      color: f.valueC
    }
  }, value, unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '14px',
      color: fill === 'plain' ? 'var(--text-muted)' : f.valueC,
      opacity: fill === 'plain' ? 1 : 0.8,
      marginLeft: '4px'
    }
  }, unit)), delta != null && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      marginTop: '9px',
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      fontWeight: 600,
      color: deltaColor
    }
  }, dir === 'up' ? '▲' : dir === 'down' ? '▼' : '·', " ", delta));
}
Object.assign(__ds_scope, { KpiCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/KpiCard.jsx", error: String((e && e.message) || e) }); }

// components/data/KpiRing.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * KpiRing — AK Golf HQ
 * Circular progress ring in SVG with the percent in the middle.
 * Color shifts by value: <30 % urgent, <50 % warn, else forest (lime on dark).
 */
function KpiRing({
  value = 0,
  size = 96,
  label = null,
  color = 'auto',
  style = {},
  ...rest
}) {
  const stroke = Math.max(6, Math.round(size * 0.08));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c - pct / 100 * c;
  const auto = pct < 30 ? 'var(--urgent)' : pct < 50 ? 'var(--warn)' : 'var(--forest)';
  const ringColor = color === 'auto' ? auto : color === 'lime' ? 'var(--lime-deep)' : color;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: size,
      height: size
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    style: {
      transform: 'rotate(-90deg)',
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: "var(--line)",
    strokeWidth: stroke
  }), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: ringColor,
    strokeWidth: stroke,
    strokeDasharray: c,
    strokeDashoffset: offset,
    strokeLinecap: "round",
    style: {
      transition: 'stroke-dashoffset var(--dur-slow) var(--ease-out)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'grid',
      placeItems: 'center',
      fontFamily: 'var(--font-mono)',
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
      fontSize: Math.round(size * 0.22),
      color: 'var(--text-strong)'
    }
  }, pct, "%")), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '9.5px',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--text-faint)'
    }
  }, label));
}
Object.assign(__ds_scope, { KpiRing });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/KpiRing.jsx", error: String((e && e.message) || e) }); }

// components/data/PyramidProgress.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * PyramidProgress — AK Golf HQ
 * The development pyramid, ALWAYS bottom→top: Fysisk → Teknisk → Golfslag →
 * Spill → Turnering. Each level shows a fill percent.
 */
const LEVELS = [{
  key: 'fys',
  name: 'Fysisk',
  color: 'var(--pyr-fys)',
  fg: '#fff'
}, {
  key: 'tek',
  name: 'Teknisk',
  color: 'var(--pyr-tek)',
  fg: '#fff'
}, {
  key: 'slag',
  name: 'Golfslag',
  color: 'var(--pyr-slag)',
  fg: '#fff'
}, {
  key: 'spill',
  name: 'Spill',
  color: 'var(--pyr-spill)',
  fg: 'var(--forest-deep)'
}, {
  key: 'turn',
  name: 'Turnering',
  color: 'var(--pyr-turn)',
  fg: '#fff'
}];
function PyramidProgress({
  values = {},
  style = {},
  ...rest
}) {
  // render top→bottom visually (Turnering on top), widening downward
  const order = [...LEVELS].reverse();
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '5px',
      ...style
    }
  }, rest), order.map((lvl, i) => {
    const widthPct = 52 + i / (order.length - 1) * 48; // 52%→100%
    const pct = values[lvl.key];
    return /*#__PURE__*/React.createElement("div", {
      key: lvl.key,
      style: {
        width: widthPct + '%',
        height: '32px',
        borderRadius: '6px',
        background: lvl.color,
        color: lvl.fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: 600
      }
    }, lvl.name, pct != null && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        right: '13px',
        opacity: 0.75,
        fontSize: '10px'
      }
    }, pct, " %"));
  }));
}
Object.assign(__ds_scope, { PyramidProgress });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/PyramidProgress.jsx", error: String((e && e.message) || e) }); }

// components/data/SgBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * SgBar — AK Golf HQ
 * Strokes-gained bar: a centered zero-axis, positive fills right (green→lime),
 * negative fills left (red). The signature data-viz primitive.
 */
function SgBar({
  name,
  category = null,
  value = 0,
  max = 1.5,
  style = {},
  ...rest
}) {
  const v = value;
  const pos = v >= 0;
  const pct = Math.min(100, Math.abs(v) / max * 50); // half-track each side
  const fmt = n => (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(1).replace('.', ',');
  return /*#__PURE__*/React.createElement("div", _extends({
    style: style
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '6px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '12.5px',
      fontWeight: 600,
      color: 'var(--text-strong)'
    }
  }, name, category && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '9.5px',
      color: 'var(--text-faint)',
      marginLeft: '6px'
    }
  }, category)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '12.5px',
      fontWeight: 600,
      color: pos ? 'var(--signal-up)' : 'var(--signal-down)'
    }
  }, fmt(v))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: '11px',
      background: 'var(--surface-sand)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-full)',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: '50%',
      top: '-2px',
      bottom: '-2px',
      width: '1.5px',
      background: 'var(--text-faint)',
      opacity: 0.35,
      zIndex: 2
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: '1px',
      bottom: '1px',
      borderRadius: 'var(--r-full)',
      transition: 'width var(--dur-slow) var(--ease-out)',
      width: pct + '%',
      ...(pos ? {
        left: '50%',
        background: 'linear-gradient(90deg, var(--forest), var(--up))'
      } : {
        right: '50%',
        background: 'linear-gradient(90deg, #d98f8f, var(--urgent))'
      })
    }
  })));
}
Object.assign(__ds_scope, { SgBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/SgBar.jsx", error: String((e && e.message) || e) }); }

// components/data/StatTable.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * StatTable — AK Golf HQ
 * Dense data table. Right-aligns numeric columns in mono, highlights the
 * "me" row in lime, supports a leading avatar/name cell.
 */
function StatTable({
  columns = [],
  rows = [],
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("table", _extends({
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '12.5px',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(col => /*#__PURE__*/React.createElement("th", {
    key: col.key,
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '9.5px',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--text-faint)',
      textAlign: col.numeric ? 'right' : 'left',
      padding: '0 10px 10px',
      borderBottom: '1px solid var(--line)',
      fontWeight: 600,
      whiteSpace: 'nowrap'
    }
  }, col.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((row, ri) => /*#__PURE__*/React.createElement("tr", {
    key: ri,
    style: row.me ? {
      background: 'var(--accent-soft-bg)'
    } : undefined
  }, columns.map((col, ci) => {
    const val = row[col.key];
    const isName = ci === 0 && (row.initials || row.avatar);
    return /*#__PURE__*/React.createElement("td", {
      key: col.key,
      style: {
        padding: '10px',
        borderBottom: ri === rows.length - 1 ? 'none' : '1px solid var(--line-soft)',
        textAlign: col.numeric ? 'right' : 'left',
        fontFamily: col.numeric ? 'var(--font-mono)' : 'var(--font-sans)',
        fontVariantNumeric: col.numeric ? 'tabular-nums' : undefined,
        fontWeight: col.numeric || ci === 0 ? 600 : 400,
        color: col.tone === 'up' ? 'var(--signal-up)' : col.tone === 'down' ? 'var(--signal-down)' : 'var(--text-body)'
      }
    }, isName ? /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
      initials: row.initials,
      size: "sm",
      style: {
        width: 26,
        height: 26
      }
    }), val) : val);
  })))));
}
Object.assign(__ds_scope, { StatTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatTable.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * EmptyState — AK Golf HQ
 * Calm empty state that always points to the next action. Never a dead end.
 */
function EmptyState({
  icon = null,
  title,
  body = null,
  action = null,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      textAlign: 'center',
      padding: '28px 16px',
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: '50px',
      height: '50px',
      borderRadius: 'var(--r-md)',
      background: 'var(--surface-card-2)',
      display: 'grid',
      placeItems: 'center',
      margin: '0 auto 14px',
      color: 'var(--text-faint)'
    }
  }, icon), /*#__PURE__*/React.createElement("h5", {
    style: {
      fontFamily: 'var(--font-disp)',
      fontSize: '16px',
      fontWeight: 700,
      margin: '0 0 5px',
      color: 'var(--text-strong)'
    }
  }, title), body && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '12.5px',
      color: 'var(--text-muted)',
      maxWidth: '240px',
      margin: '0 auto 14px'
    }
  }, body), action);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Skeleton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Skeleton — AK Golf HQ
 * Loading placeholder with a shimmer pulse. Never a spinner.
 */
function Skeleton({
  width = '100%',
  height = 12,
  radius = 'var(--r-sm)',
  circle = false,
  style = {},
  ...rest
}) {
  const d = circle ? typeof height === 'number' ? height : 42 : null;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'block',
      width: circle ? d : width,
      height: circle ? d : typeof height === 'number' ? height + 'px' : height,
      borderRadius: circle ? '50%' : radius,
      background: 'linear-gradient(90deg, var(--surface-sand) 25%, var(--surface-card-2) 50%, var(--surface-sand) 75%)',
      backgroundSize: '200% 100%',
      animation: 'ak-shimmer 1.4s infinite',
      ...style
    },
    "aria-hidden": "true"
  }, rest));
}

/** A ready-made avatar + two-line row skeleton. */
function SkeletonRow({
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(Skeleton, {
    circle: true,
    height: 42
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(Skeleton, {
    width: "60%",
    height: 11,
    style: {
      marginBottom: '8px'
    }
  }), /*#__PURE__*/React.createElement(Skeleton, {
    width: "90%",
    height: 11
  })));
}
Object.assign(__ds_scope, { Skeleton, SkeletonRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Skeleton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StatusPill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * StatusPill — AK Golf HQ
 * Rounded status pill with a leading LED dot. Six tones for live/active states.
 */
function StatusPill({
  children,
  tone = 'active',
  pulse = false,
  style = {},
  ...rest
}) {
  const tones = {
    active: {
      dot: 'var(--up)',
      bg: 'rgba(26,125,86,.10)',
      fg: 'var(--up)'
    },
    behind: {
      dot: 'var(--urgent)',
      bg: 'rgba(163,45,45,.10)',
      fg: 'var(--urgent)'
    },
    inactive: {
      dot: 'var(--muted-2)',
      bg: 'var(--surface-sand)',
      fg: 'var(--text-muted)'
    },
    guide: {
      dot: 'var(--lime-deep)',
      bg: 'var(--accent-soft-bg-2)',
      fg: 'var(--accent-text)'
    },
    warn: {
      dot: 'var(--warn)',
      bg: 'rgba(184,133,42,.12)',
      fg: 'var(--warn)'
    },
    live: {
      dot: 'var(--lime-deep)',
      bg: 'var(--lime)',
      fg: 'var(--forest-deep)'
    }
  };
  const t = tones[tone];
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontFamily: 'var(--font-mono)',
      fontSize: '10px',
      fontWeight: 600,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      padding: '5px 10px',
      borderRadius: 'var(--r-full)',
      background: t.bg,
      color: t.fg,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: '7px',
      height: '7px',
      borderRadius: '50%',
      background: t.dot,
      boxShadow: pulse ? `0 0 0 3px ${tone === 'live' ? 'rgba(185,224,34,.4)' : 'var(--accent-soft-bg)'}` : 'none',
      animation: pulse ? 'ak-pulse 1.6s infinite' : 'none'
    }
  }), children);
}
Object.assign(__ds_scope, { StatusPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StatusPill.jsx", error: String((e && e.message) || e) }); }

// components/gamification/MasteryRing.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * MasteryRing — AK Golf HQ
 * XP-style mastery ring: fills as you progress, pulses lime on level-up.
 * Elite gamification — the number is the reward, never confetti.
 */
function MasteryRing({
  level = 1,
  progress = 0,
  title = '',
  detail = '',
  size = 132,
  style = {},
  ...rest
}) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, progress));
  const offset = c - pct / 100 * c;
  const levelUp = pct >= 100;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '22px',
      flexWrap: 'wrap',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: size,
      height: size,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    style: {
      transform: 'rotate(-90deg)',
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: "var(--line)",
    strokeWidth: stroke
  }), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    fill: "none",
    stroke: levelUp ? 'var(--lime)' : 'var(--forest)',
    strokeWidth: stroke,
    strokeDasharray: c,
    strokeDashoffset: offset,
    strokeLinecap: "round",
    style: {
      transition: 'stroke-dashoffset var(--dur-slow) var(--ease-out)',
      filter: levelUp ? 'drop-shadow(0 0 6px var(--lime))' : 'none'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'grid',
      placeItems: 'center',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '9px',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--text-faint)'
    }
  }, "Niv\xE5"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontWeight: 600,
      fontSize: Math.round(size * 0.26),
      lineHeight: 1,
      color: 'var(--text-strong)'
    }
  }, level), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      fontWeight: 600,
      color: levelUp ? 'var(--accent-text)' : 'var(--text-muted)'
    }
  }, pct, " %")))), (title || detail) && /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-disp)',
      fontSize: '18px',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: 'var(--text-strong)'
    }
  }, title), detail && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: '12.5px',
      color: 'var(--text-muted)',
      marginTop: '4px',
      lineHeight: 1.5
    }
  }, detail)));
}
Object.assign(__ds_scope, { MasteryRing });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/gamification/MasteryRing.jsx", error: String((e && e.message) || e) }); }

// components/gamification/StreakTracker.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * StreakTracker — AK Golf HQ
 * "Don't break the chain." Big mono count + a row of day cells; trained days
 * fill forest/lime, today is ringed, missed days stay empty.
 */
function StreakTracker({
  count = 0,
  unit = 'dager på rad',
  days = [],
  best = null,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: style
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '40px',
      fontWeight: 700,
      lineHeight: 1,
      color: 'var(--text-strong)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, count), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '13px',
      color: 'var(--text-muted)'
    }
  }, unit)), best != null && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '10px',
      color: 'var(--text-faint)',
      marginTop: '3px'
    }
  }, "beste: ", best), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '4px',
      marginTop: '14px',
      flexWrap: 'wrap'
    }
  }, days.map((state, i) => {
    const styles = {
      done: {
        background: 'var(--forest)'
      },
      today: {
        background: 'var(--surface-card)',
        border: '2px solid var(--lime)'
      },
      missed: {
        background: 'var(--surface-sand)',
        border: '1px solid var(--line)'
      }
    };
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      "aria-label": state,
      style: {
        flex: '1 0 18px',
        height: '34px',
        borderRadius: '5px',
        minWidth: '18px',
        ...styles[state]
      }
    });
  })));
}
Object.assign(__ds_scope, { StreakTracker });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/gamification/StreakTracker.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.KpiCard = __ds_scope.KpiCard;

__ds_ns.KpiRing = __ds_scope.KpiRing;

__ds_ns.PyramidProgress = __ds_scope.PyramidProgress;

__ds_ns.SgBar = __ds_scope.SgBar;

__ds_ns.StatTable = __ds_scope.StatTable;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Skeleton = __ds_scope.Skeleton;

__ds_ns.SkeletonRow = __ds_scope.SkeletonRow;

__ds_ns.StatusPill = __ds_scope.StatusPill;

__ds_ns.MasteryRing = __ds_scope.MasteryRing;

__ds_ns.StreakTracker = __ds_scope.StreakTracker;

})();
