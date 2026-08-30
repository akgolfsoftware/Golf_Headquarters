/* @ds-bundle: {"format":4,"namespace":"ClawDesignTeamNorwayGolf_a03bf9","components":[{"name":"Hero","sourcePath":"components/brand/Hero.jsx"},{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"PyramidDiagram","sourcePath":"components/brand/PyramidDiagram.jsx"},{"name":"SectionHeader","sourcePath":"components/brand/SectionHeader.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Select","sourcePath":"components/core/Select.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"MetricTile","sourcePath":"components/data/MetricTile.jsx"},{"name":"ScaleRating","sourcePath":"components/data/ScaleRating.jsx"},{"name":"StatBar","sourcePath":"components/data/StatBar.jsx"}],"sourceHashes":{"components/brand/Hero.jsx":"71e3db941531","components/brand/Logo.jsx":"bf1e0fd533c4","components/brand/PyramidDiagram.jsx":"9c3f28ffa810","components/brand/SectionHeader.jsx":"5a9b55b1ecd1","components/core/Badge.jsx":"85b1e9229568","components/core/Button.jsx":"73e5fe6c580e","components/core/Card.jsx":"4108bf7e36a4","components/core/Input.jsx":"a7331c543d6a","components/core/Select.jsx":"8ee1314ed9ea","components/data/DataTable.jsx":"44eb5823f418","components/data/MetricTile.jsx":"b5a751c1a79f","components/data/ScaleRating.jsx":"2466dec8c105","components/data/StatBar.jsx":"d8e1726406b7"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ClawDesignTeamNorwayGolf_a03bf9 = window.ClawDesignTeamNorwayGolf_a03bf9 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Hero.jsx
try { (() => {
function Hero({
  eyebrow,
  title,
  description,
  actions,
  meta,
  height = 380,
  align = 'left'
}) {
  return React.createElement('div', {
    style: {
      position: 'relative',
      minHeight: height + 'px',
      overflow: 'hidden',
      background: 'var(--dark-900)',
      borderRadius: 'var(--radius-xl)',
      fontFamily: 'var(--font-body)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  }, React.createElement('div', {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(115deg,var(--navy-900) 0%,var(--dark-900) 58%,var(--dark-800) 100%)'
    }
  }), React.createElement('div', {
    style: {
      position: 'absolute',
      right: '-8%',
      top: '-20%',
      width: '46%',
      height: '140%',
      background: 'var(--navy-800)',
      transform: 'skewX(-9deg)',
      opacity: .55
    }
  }), React.createElement('div', {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '10px',
      background: 'var(--red-600)',
      clipPath: 'polygon(0 100%,100% 0,100% 100%)'
    }
  }), React.createElement('div', {
    style: {
      position: 'relative',
      padding: '48px 52px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      maxWidth: '720px',
      alignItems: align === 'center' ? 'center' : 'flex-start',
      textAlign: align
    }
  }, eyebrow ? React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, React.createElement('div', {
    style: {
      width: '28px',
      height: '2px',
      background: 'var(--red-600)',
      flexShrink: 0
    }
  }), React.createElement('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      letterSpacing: '.18em',
      color: 'var(--navy-300)'
    }
  }, String(eyebrow).toUpperCase())) : null, title ? React.createElement('h1', {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(38px,5vw,60px)',
      fontWeight: 800,
      letterSpacing: '-.04em',
      lineHeight: 1.02,
      margin: 0,
      color: '#fff'
    }
  }, title) : null, description ? React.createElement('p', {
    style: {
      margin: 0,
      fontSize: '16.5px',
      lineHeight: 1.6,
      color: '#A9C0DA',
      maxWidth: '520px',
      textWrap: 'pretty'
    }
  }, description) : null, actions ? React.createElement('div', {
    style: {
      display: 'flex',
      gap: '12px',
      marginTop: '8px',
      flexWrap: 'wrap'
    }
  }, actions) : null, meta ? React.createElement('div', {
    style: {
      display: 'flex',
      gap: '40px',
      marginTop: '16px',
      flexWrap: 'wrap'
    }
  }, meta.map((m, i) => React.createElement('div', {
    key: i,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    }
  }, React.createElement('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '10.5px',
      letterSpacing: '.16em',
      color: 'var(--navy-300)'
    }
  }, String(m.label).toUpperCase()), React.createElement('span', {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: '22px',
      fontWeight: 700,
      letterSpacing: '-.02em',
      color: '#fff'
    }
  }, m.value)))) : null));
}
Object.assign(__ds_scope, { Hero });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Hero.jsx", error: String((e && e.message) || e) }); }

// components/brand/Logo.jsx
try { (() => {
const SRC = '/assets/logo/team-norway-golf.png';
function Logo({
  height = 40,
  onDark = false,
  src,
  plate = 'auto'
}) {
  const file = src || SRC;
  const img = React.createElement('img', {
    src: file,
    alt: 'Team Norway Golf',
    style: {
      height: height + 'px',
      width: 'auto',
      display: 'block'
    }
  });
  const needsPlate = onDark && plate !== 'never';
  if (!needsPlate) return img;
  const pad = Math.round(height * 0.34);
  return React.createElement('div', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      borderRadius: 'var(--radius-md)',
      padding: pad + 'px ' + Math.round(pad * 1.2) + 'px',
      boxShadow: 'var(--shadow-sm)'
    }
  }, img);
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/brand/PyramidDiagram.jsx
try { (() => {
// Kanoniske kortformer fra AK Golf HQ (grunnlag-funn.md): FYS/TEK/SLAG/SPILL/TURN.
// Toppen først.
const DEFAULT = [{
  name: 'TURN',
  caption: 'Turnering — konkurransen'
}, {
  name: 'SPILL',
  caption: 'Spill — strategi og valg'
}, {
  name: 'SLAG',
  caption: 'Golfslag — slaget som helhet'
}, {
  name: 'TEK',
  caption: 'Teknikk — svingbevegelsen'
}, {
  name: 'FYS',
  caption: 'Fysikk — grunnmuren'
}];
function PyramidDiagram({
  levels = DEFAULT,
  active,
  onSelect,
  width = 420,
  showCaptions = true
}) {
  const n = levels.length;
  const h = Math.round(width * 0.62);
  const gap = 4;
  const rowH = (h - gap * (n - 1)) / n;
  const ramp = ['var(--data-1)', 'var(--data-2)', 'var(--data-3)', 'var(--data-4)', 'var(--data-5)'];
  return React.createElement('div', {
    style: {
      display: 'flex',
      gap: '28px',
      alignItems: 'center',
      fontFamily: 'var(--font-body)'
    }
  }, React.createElement('svg', {
    width,
    height: h,
    viewBox: '0 0 ' + width + ' ' + h,
    style: {
      flexShrink: 0,
      overflow: 'visible'
    }
  }, levels.map((lv, i) => {
    const y = i * (rowH + gap);
    const topW = i / n * width;
    const botW = (i + 1) / n * width;
    const isActive = active === i;
    const fill = isActive ? 'var(--red-600)' : ramp[Math.min(i, ramp.length - 1)];
    const pts = [(width - topW) / 2 + ',' + y, (width + topW) / 2 + ',' + y, (width + botW) / 2 + ',' + (y + rowH), (width - botW) / 2 + ',' + (y + rowH)].join(' ');
    return React.createElement('polygon', {
      key: i,
      points: pts,
      fill,
      onClick: () => onSelect && onSelect(i),
      style: {
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'fill var(--duration-base) var(--ease-out),filter var(--duration-base) var(--ease-out)',
        filter: isActive ? 'drop-shadow(0 6px 16px rgba(215,2,50,.35))' : 'none'
      }
    });
  })), React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: h + 'px',
      paddingTop: '2px',
      paddingBottom: '2px'
    }
  }, levels.map((lv, i) => {
    const isActive = active === i;
    return React.createElement('div', {
      key: i,
      onClick: () => onSelect && onSelect(i),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        cursor: onSelect ? 'pointer' : 'default',
        flex: 1
      }
    }, React.createElement('span', {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: '10.5px',
        color: isActive ? 'var(--red-600)' : 'var(--ink-300)',
        width: '18px'
      }
    }, String(n - i).padStart(2, '0')), React.createElement('div', {
      style: {
        display: 'flex',
        flexDirection: 'column'
      }
    }, React.createElement('span', {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: '14px',
        fontWeight: isActive ? 700 : 600,
        letterSpacing: '.04em',
        color: isActive ? 'var(--red-600)' : 'var(--ink-900)',
        transition: 'color var(--duration-base) var(--ease-out)'
      }
    }, lv.name), showCaptions && lv.caption ? React.createElement('span', {
      style: {
        fontSize: '12px',
        color: 'var(--ink-400)'
      }
    }, lv.caption) : null));
  })));
}
Object.assign(__ds_scope, { PyramidDiagram });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/PyramidDiagram.jsx", error: String((e && e.message) || e) }); }

// components/brand/SectionHeader.jsx
try { (() => {
function SectionHeader({
  eyebrow,
  title,
  description,
  index,
  action,
  onDark = false
}) {
  const muted = onDark ? 'var(--text-on-dark-muted)' : 'var(--ink-500)';
  return React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: '32px',
      fontFamily: 'var(--font-body)',
      paddingBottom: '20px',
      borderBottom: '1px solid ' + (onDark ? 'var(--border-dark)' : 'var(--border-subtle)')
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      maxWidth: '640px'
    }
  }, eyebrow || index ? React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      letterSpacing: '.18em',
      color: onDark ? 'var(--navy-300)' : 'var(--ink-400)'
    }
  }, index ? React.createElement('span', {
    style: {
      color: 'var(--red-600)'
    }
  }, '(' + index + ')') : null, eyebrow ? React.createElement('span', null, String(eyebrow).toUpperCase()) : null) : null, title ? React.createElement('h2', {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: '32px',
      fontWeight: 800,
      letterSpacing: '-.035em',
      lineHeight: 1.08,
      margin: 0,
      color: onDark ? '#fff' : 'var(--ink-900)'
    }
  }, title) : null, description ? React.createElement('p', {
    style: {
      margin: 0,
      fontSize: '15px',
      lineHeight: 1.55,
      color: muted,
      textWrap: 'pretty'
    }
  }, description) : null), action || null);
}
Object.assign(__ds_scope, { SectionHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/SectionHeader.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function Badge({
  children,
  tone = 'neutral',
  solid = false,
  dot = false
}) {
  const tones = {
    neutral: {
      bg: 'var(--ink-100)',
      fg: 'var(--ink-700)',
      solid: 'var(--ink-700)'
    },
    navy: {
      bg: 'var(--navy-100)',
      fg: 'var(--navy-800)',
      solid: 'var(--navy-900)'
    },
    accent: {
      bg: 'var(--red-100)',
      fg: 'var(--red-700)',
      solid: 'var(--red-600)'
    },
    green: {
      bg: 'var(--status-green-bg)',
      fg: 'var(--status-green-text)',
      solid: 'var(--status-green)'
    },
    amber: {
      bg: 'var(--status-amber-bg)',
      fg: 'var(--status-amber-text)',
      solid: 'var(--status-amber)'
    },
    red: {
      bg: 'var(--status-red-bg)',
      fg: 'var(--status-red-text)',
      solid: 'var(--status-red)'
    },
    info: {
      bg: 'var(--status-info-bg)',
      fg: 'var(--status-info-text)',
      solid: 'var(--status-info)'
    }
  };
  const t = tones[tone] || tones.neutral;
  return React.createElement('span', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '5px 11px',
      borderRadius: 'var(--radius-full)',
      background: solid ? t.solid : t.bg,
      color: solid ? '#fff' : t.fg,
      fontFamily: 'var(--font-body)',
      fontSize: '12.5px',
      fontWeight: 600,
      letterSpacing: '-0.005em',
      whiteSpace: 'nowrap'
    }
  }, dot ? React.createElement('span', {
    style: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: solid ? '#fff' : t.solid,
      flexShrink: 0
    }
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled,
  icon,
  fullWidth,
  onClick
}) {
  const sizes = {
    sm: {
      padding: '8px 14px',
      fontSize: '13px',
      height: '34px'
    },
    md: {
      padding: '11px 20px',
      fontSize: '14px',
      height: '42px'
    },
    lg: {
      padding: '14px 28px',
      fontSize: '16px',
      height: '52px'
    }
  };
  const variants = {
    primary: {
      background: 'var(--navy-900)',
      color: '#fff',
      border: '1px solid transparent',
      boxShadow: 'var(--shadow-sm)'
    },
    accent: {
      background: 'var(--red-600)',
      color: '#fff',
      border: '1px solid transparent',
      boxShadow: 'var(--shadow-sm)'
    },
    secondary: {
      background: 'var(--white)',
      color: 'var(--navy-900)',
      border: '1px solid var(--border-default)',
      boxShadow: 'var(--shadow-sm)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--navy-700)',
      border: '1px solid transparent'
    },
    onDark: {
      background: 'rgba(255,255,255,.1)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,.24)'
    }
  };
  const hoverBg = {
    primary: 'var(--navy-700)',
    accent: 'var(--red-700)',
    secondary: 'var(--ink-50)',
    ghost: 'var(--navy-100)',
    onDark: 'rgba(255,255,255,.2)'
  };
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const finePointer = React.useRef(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches);
  const reduced = React.useRef(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches);
  const v = variants[variant] || variants.primary;
  const active = press && !disabled;
  return React.createElement('button', {
    onClick,
    disabled,
    onPointerEnter: () => finePointer.current && setHover(true),
    onPointerLeave: () => {
      setHover(false);
      setPress(false);
    },
    onPointerDown: () => setPress(true),
    onPointerUp: () => setPress(false),
    onPointerCancel: () => setPress(false),
    style: {
      ...sizes[size],
      ...v,
      background: hover && !disabled ? hoverBg[variant] : v.background,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      width: fullWidth ? '100%' : 'auto',
      fontFamily: 'var(--font-body)',
      fontWeight: 600,
      letterSpacing: '-0.005em',
      borderRadius: 'var(--radius-full)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .45 : active && reduced.current ? .75 : 1,
      transform: active && !reduced.current ? 'scale(0.97)' : 'scale(1)',
      transition: 'transform var(--duration-press) var(--ease-out),background-color var(--duration-fast) var(--ease-hover),opacity var(--duration-fast) var(--ease-hover),box-shadow var(--duration-base) var(--ease-out)'
    }
  }, icon, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function Card({
  children,
  title,
  eyebrow,
  action,
  elevation = 'md',
  accent,
  padding = '28px',
  dark = false
}) {
  const shadows = {
    flat: 'none',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)'
  };
  return React.createElement('div', {
    style: {
      position: 'relative',
      overflow: 'hidden',
      background: dark ? 'var(--surface-dark-card)' : 'var(--surface-card)',
      border: dark ? '1px solid var(--border-dark)' : '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: dark ? 'var(--shadow-dark)' : shadows[elevation],
      transition: 'box-shadow var(--duration-base) var(--ease-out),transform var(--duration-base) var(--ease-out)',
      padding,
      fontFamily: 'var(--font-body)',
      color: dark ? 'var(--text-on-dark)' : 'var(--text-primary)'
    }
  }, accent ? React.createElement('div', {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '4px',
      background: accent === 'red' ? 'var(--red-600)' : 'var(--navy-900)'
    }
  }) : null, eyebrow || title || action ? React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '16px',
      marginBottom: '20px'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }
  }, eyebrow ? React.createElement('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
      letterSpacing: '.18em',
      color: dark ? 'var(--text-on-dark-muted)' : 'var(--ink-400)'
    }
  }, eyebrow) : null, title ? React.createElement('h3', {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: '21px',
      fontWeight: 700,
      letterSpacing: '-.02em',
      margin: 0,
      lineHeight: 1.25
    }
  }, title) : null), action || null) : null, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function Input({
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  type = 'text',
  suffix,
  disabled
}) {
  const [focus, setFocus] = React.useState(false);
  const border = error ? 'var(--status-red)' : focus ? 'var(--navy-600)' : 'var(--border-subtle)';
  return React.createElement('label', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '7px',
      fontFamily: 'var(--font-body)'
    }
  }, label ? React.createElement('span', {
    style: {
      fontSize: '13px',
      fontWeight: 600,
      color: 'var(--ink-700)'
    }
  }, label) : null, React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: disabled ? 'var(--ink-50)' : 'var(--white)',
      border: '1px solid ' + border,
      borderRadius: 'var(--radius-sm)',
      padding: '0 14px',
      height: '46px',
      boxShadow: focus ? 'var(--focus-ring)' : 'var(--shadow-sm)',
      transition: 'border-color var(--duration-fast) var(--ease-out),box-shadow var(--duration-base) var(--ease-out)'
    }
  }, React.createElement('input', {
    type,
    value,
    placeholder,
    disabled,
    onChange: e => onChange && onChange(e.target.value),
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: type === 'number' ? 'var(--font-mono)' : 'var(--font-body)',
      fontSize: '15px',
      color: 'var(--ink-900)',
      minWidth: 0
    }
  }), suffix ? React.createElement('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '12px',
      color: 'var(--ink-400)'
    }
  }, suffix) : null), error ? React.createElement('span', {
    style: {
      fontSize: '12px',
      color: 'var(--status-red-text)'
    }
  }, error) : hint ? React.createElement('span', {
    style: {
      fontSize: '12px',
      color: 'var(--ink-400)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Select.jsx
try { (() => {
function Select({
  label,
  value,
  onChange,
  options = [],
  hint,
  disabled
}) {
  const [focus, setFocus] = React.useState(false);
  return React.createElement('label', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '7px',
      fontFamily: 'var(--font-body)'
    }
  }, label ? React.createElement('span', {
    style: {
      fontSize: '13px',
      fontWeight: 600,
      color: 'var(--ink-700)'
    }
  }, label) : null, React.createElement('div', {
    style: {
      position: 'relative'
    }
  }, React.createElement('select', {
    value,
    disabled,
    onChange: e => onChange && onChange(e.target.value),
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: '100%',
      height: '46px',
      padding: '0 40px 0 14px',
      appearance: 'none',
      WebkitAppearance: 'none',
      background: disabled ? 'var(--ink-50)' : 'var(--white)',
      border: '1px solid ' + (focus ? 'var(--navy-600)' : 'var(--border-subtle)'),
      borderRadius: 'var(--radius-sm)',
      boxShadow: focus ? 'var(--focus-ring)' : 'var(--shadow-sm)',
      fontFamily: 'var(--font-body)',
      fontSize: '15px',
      color: 'var(--ink-900)',
      outline: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'border-color var(--duration-fast) var(--ease-out),box-shadow var(--duration-base) var(--ease-out)'
    }
  }, options.map((o, i) => {
    const val = typeof o === 'string' ? o : o.value;
    const lab = typeof o === 'string' ? o : o.label;
    return React.createElement('option', {
      key: i,
      value: val
    }, lab);
  })), React.createElement('span', {
    style: {
      position: 'absolute',
      right: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: 'var(--ink-400)',
      fontSize: '11px'
    }
  }, '▼')), hint ? React.createElement('span', {
    style: {
      fontSize: '12px',
      color: 'var(--ink-400)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Select.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
function DataTable({
  columns = [],
  rows = [],
  highlightRow,
  dense = false
}) {
  const pad = dense ? '10px 14px' : '14px 18px';
  return React.createElement('div', {
    style: {
      overflow: 'hidden',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-subtle)',
      background: 'var(--white)',
      boxShadow: 'var(--shadow-sm)'
    }
  }, React.createElement('table', {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontFamily: 'var(--font-body)',
      fontSize: dense ? '13px' : '14px'
    }
  }, React.createElement('thead', null, React.createElement('tr', null, columns.map((c, i) => {
    const num = c.align === 'right';
    return React.createElement('th', {
      key: i,
      style: {
        textAlign: num ? 'right' : 'left',
        padding: pad,
        background: 'var(--ink-50)',
        fontFamily: 'var(--font-mono)',
        fontSize: '10.5px',
        letterSpacing: '.14em',
        fontWeight: 500,
        color: 'var(--ink-500)',
        borderBottom: '1px solid var(--border-subtle)',
        whiteSpace: 'nowrap'
      }
    }, String(c.label || c).toUpperCase());
  }))), React.createElement('tbody', null, rows.map((r, ri) => {
    const hl = highlightRow === ri;
    return React.createElement('tr', {
      key: ri,
      style: {
        background: hl ? 'var(--navy-50)' : 'transparent',
        boxShadow: hl ? 'inset 3px 0 0 var(--red-600)' : 'none'
      }
    }, columns.map((c, ci) => {
      const key = c.key || c;
      const num = c.align === 'right';
      return React.createElement('td', {
        key: ci,
        style: {
          padding: pad,
          textAlign: num ? 'right' : 'left',
          fontFamily: num ? 'var(--font-mono)' : 'var(--font-body)',
          fontWeight: hl ? 600 : num ? 500 : 400,
          color: 'var(--ink-900)',
          borderBottom: ri === rows.length - 1 ? 'none' : '1px solid var(--ink-100)'
        }
      }, r[key]);
    }));
  }))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/MetricTile.jsx
try { (() => {
function MetricTile({
  label,
  value,
  unit,
  delta,
  deltaTone,
  caption,
  dark = false
}) {
  const tones = {
    up: 'var(--status-green)',
    down: 'var(--status-red)',
    flat: 'var(--ink-400)'
  };
  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      background: dark ? 'var(--surface-dark-card)' : 'var(--white)',
      border: '1px solid ' + (dark ? 'var(--border-dark)' : 'var(--border-subtle)'),
      borderRadius: 'var(--radius-lg)',
      boxShadow: dark ? 'none' : 'var(--shadow-sm)',
      padding: '22px 24px',
      fontFamily: 'var(--font-body)'
    }
  }, React.createElement('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '10.5px',
      letterSpacing: '.16em',
      color: dark ? 'var(--text-on-dark-muted)' : 'var(--ink-400)'
    }
  }, String(label).toUpperCase()), React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: '8px'
    }
  }, React.createElement('span', {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: '40px',
      fontWeight: 800,
      letterSpacing: '-.035em',
      lineHeight: 1,
      color: dark ? '#fff' : 'var(--ink-900)'
    }
  }, value), unit ? React.createElement('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '14px',
      color: dark ? 'var(--text-on-dark-muted)' : 'var(--ink-400)'
    }
  }, unit) : null, delta ? React.createElement('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '13px',
      fontWeight: 600,
      color: tones[deltaTone] || tones.flat,
      marginLeft: '2px'
    }
  }, delta) : null), caption ? React.createElement('span', {
    style: {
      fontSize: '12.5px',
      color: dark ? 'var(--text-on-dark-muted)' : 'var(--ink-500)',
      lineHeight: 1.45
    }
  }, caption) : null);
}
Object.assign(__ds_scope, { MetricTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/MetricTile.jsx", error: String((e && e.message) || e) }); }

// components/data/ScaleRating.jsx
try { (() => {
function ScaleRating({
  value,
  max = 5,
  onChange,
  labels,
  size = 'md',
  readOnly = false
}) {
  const [hover, setHover] = React.useState(null);
  const [press, setPress] = React.useState(null);
  const finePointer = React.useRef(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches);
  const dim = size === 'sm' ? 32 : size === 'lg' ? 52 : 42;
  const items = [];
  for (let i = 1; i <= max; i++) {
    const active = i <= (hover ?? value);
    const isCur = i === value;
    const isPress = press === i;
    items.push(React.createElement('button', {
      key: i,
      type: 'button',
      disabled: readOnly,
      onClick: () => !readOnly && onChange && onChange(i),
      onPointerEnter: () => !readOnly && finePointer.current && setHover(i),
      onPointerLeave: () => {
        if (!readOnly) {
          setHover(null);
          setPress(null);
        }
      },
      onPointerDown: () => !readOnly && setPress(i),
      onPointerUp: () => setPress(null),
      onPointerCancel: () => setPress(null),
      style: {
        width: dim + 'px',
        height: dim + 'px',
        flexShrink: 0,
        borderRadius: 'var(--radius-sm)',
        border: '1px solid ' + (isCur ? 'var(--navy-900)' : active ? 'transparent' : 'var(--border-subtle)'),
        background: active ? 'var(--navy-900)' : 'var(--white)',
        color: active ? '#fff' : 'var(--ink-400)',
        fontFamily: 'var(--font-mono)',
        fontSize: size === 'sm' ? '12px' : '14px',
        fontWeight: 600,
        boxShadow: isCur ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        cursor: readOnly ? 'default' : 'pointer',
        transform: isPress ? 'scale(0.94)' : isCur ? 'translateY(-2px)' : 'none',
        transition: 'transform var(--duration-press) var(--ease-out),background-color var(--duration-fast) var(--ease-hover),border-color var(--duration-fast) var(--ease-hover),color var(--duration-fast) var(--ease-hover),box-shadow var(--duration-base) var(--ease-out)'
      }
    }, i));
  }
  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      fontFamily: 'var(--font-body)'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      gap: '8px'
    }
  }, items), labels ? React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '11.5px',
      color: 'var(--ink-400)'
    }
  }, React.createElement('span', null, labels[0]), React.createElement('span', null, labels[1])) : null);
}
Object.assign(__ds_scope, { ScaleRating });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ScaleRating.jsx", error: String((e && e.message) || e) }); }

// components/data/StatBar.jsx
try { (() => {
function StatBar({
  label,
  value,
  max = 100,
  unit = '',
  tone = 'navy',
  target,
  compact = false
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const tones = {
    navy: 'var(--navy-900)',
    accent: 'var(--red-600)',
    green: 'var(--status-green)',
    amber: 'var(--status-amber)',
    red: 'var(--status-red)'
  };
  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      fontFamily: 'var(--font-body)'
    }
  }, React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: '12px'
    }
  }, React.createElement('span', {
    style: {
      fontSize: '13.5px',
      fontWeight: 500,
      color: 'var(--ink-700)'
    }
  }, label), React.createElement('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: compact ? '13px' : '15px',
      fontWeight: 600,
      color: 'var(--ink-900)'
    }
  }, value, unit)), React.createElement('div', {
    style: {
      position: 'relative',
      height: compact ? '8px' : '12px',
      background: 'var(--ink-100)',
      borderRadius: 'var(--radius-full)',
      overflow: 'hidden'
    }
  }, React.createElement('div', {
    style: {
      width: pct + '%',
      height: '100%',
      background: tones[tone] || tones.navy,
      borderRadius: 'var(--radius-full)',
      transition: 'width var(--duration-slow) var(--ease-out)'
    }
  }), target != null ? React.createElement('div', {
    style: {
      position: 'absolute',
      left: Math.min(100, target / max * 100) + '%',
      top: '-3px',
      bottom: '-3px',
      width: '2px',
      background: 'var(--ink-900)',
      borderRadius: '1px'
    }
  }) : null));
}
Object.assign(__ds_scope, { StatBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatBar.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Hero = __ds_scope.Hero;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.PyramidDiagram = __ds_scope.PyramidDiagram;

__ds_ns.SectionHeader = __ds_scope.SectionHeader;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.MetricTile = __ds_scope.MetricTile;

__ds_ns.ScaleRating = __ds_scope.ScaleRating;

__ds_ns.StatBar = __ds_scope.StatBar;

})();
