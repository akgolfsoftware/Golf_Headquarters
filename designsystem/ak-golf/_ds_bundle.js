/* @ds-bundle: {"format":4,"namespace":"AKGolfDesignsystem_3e5c85","components":[{"name":"Akkordeon","sourcePath":"components/flate/Akkordeon.jsx"},{"name":"Fotokort","sourcePath":"components/flate/Fotokort.jsx"},{"name":"Kort","sourcePath":"components/flate/Kort.jsx"},{"name":"IkonKnapp","sourcePath":"components/handling/IkonKnapp.jsx"},{"name":"Knapp","sourcePath":"components/handling/Knapp.jsx"},{"name":"Paginering","sourcePath":"components/handling/Paginering.jsx"},{"name":"Faktarad","sourcePath":"components/maaling/Faktarad.jsx"},{"name":"Liste","sourcePath":"components/maaling/Liste.jsx"},{"name":"Tabell","sourcePath":"components/maaling/Tabell.jsx"},{"name":"Talleblokk","sourcePath":"components/maaling/Talleblokk.jsx"},{"name":"Merkelapp","sourcePath":"components/melding/Merkelapp.jsx"},{"name":"Status","sourcePath":"components/melding/Status.jsx"},{"name":"TomTilstand","sourcePath":"components/melding/TomTilstand.jsx"},{"name":"Varsel","sourcePath":"components/melding/Varsel.jsx"},{"name":"Instrumentflate","sourcePath":"components/merke/Instrumentflate.jsx"},{"name":"Logo","sourcePath":"components/merke/Logo.jsx"},{"name":"Maalestokk","sourcePath":"components/merke/Maalestokk.jsx"},{"name":"Navnelaas","sourcePath":"components/merke/Navnelaas.jsx"},{"name":"Brodsmuler","sourcePath":"components/navigasjon/Brodsmuler.jsx"},{"name":"Faner","sourcePath":"components/navigasjon/Faner.jsx"},{"name":"Mobilmeny","sourcePath":"components/navigasjon/Mobilmeny.jsx"},{"name":"Toppnav","sourcePath":"components/navigasjon/Toppnav.jsx"},{"name":"Avkrysning","sourcePath":"components/skjema/Avkrysning.jsx"},{"name":"Felt","sourcePath":"components/skjema/Felt.jsx"},{"name":"Radiogruppe","sourcePath":"components/skjema/Radiogruppe.jsx"},{"name":"Velger","sourcePath":"components/skjema/Velger.jsx"}],"sourceHashes":{"components/flate/Akkordeon.jsx":"bc381d6fde45","components/flate/Fotokort.jsx":"3e3601274006","components/flate/Kort.jsx":"df4bdf0f301b","components/handling/IkonKnapp.jsx":"4bf847a3ee2d","components/handling/Knapp.jsx":"8286b3ee9820","components/handling/Paginering.jsx":"b5a945ac735f","components/maaling/Faktarad.jsx":"d6ec8933d7b1","components/maaling/Liste.jsx":"d8e6021dd854","components/maaling/Tabell.jsx":"16451831d20b","components/maaling/Talleblokk.jsx":"f6b3e839cf26","components/melding/Merkelapp.jsx":"9a83680be544","components/melding/Status.jsx":"7a360b8c6949","components/melding/TomTilstand.jsx":"cff27677adac","components/melding/Varsel.jsx":"e9126f90610e","components/merke/Instrumentflate.jsx":"a9d36e1a23f6","components/merke/Logo.jsx":"3e85dd74186e","components/merke/Maalestokk.jsx":"f6a9f036d938","components/merke/Navnelaas.jsx":"96a2aada0ca4","components/navigasjon/Brodsmuler.jsx":"81075b8d3f62","components/navigasjon/Faner.jsx":"82411f35dae6","components/navigasjon/Mobilmeny.jsx":"767a1101bb2b","components/navigasjon/Toppnav.jsx":"58b3bbe134bf","components/skjema/Avkrysning.jsx":"11815d70c0f0","components/skjema/Felt.jsx":"35fa683758b3","components/skjema/Radiogruppe.jsx":"8e6abb5ff626","components/skjema/Velger.jsx":"0bb5f1a1b80b","ui_kits/foreldrerapport/Rapport.jsx":"f0388f9d2952","ui_kits/kampanje/Kampanje.jsx":"f1b72d4de56a","ui_kits/markedsside/Deler.jsx":"73bd9bd52d83"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AKGolfDesignsystem_3e5c85 = window.AKGolfDesignsystem_3e5c85 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/flate/Akkordeon.jsx
try { (() => {
function Akkordeon({
  poster = [],
  apenIndeks = -1,
  flerAvGangen = false,
  style
}) {
  const [apne, setApne] = React.useState(apenIndeks >= 0 ? [apenIndeks] : []);
  const veksle = i => setApne(f => f.includes(i) ? f.filter(x => x !== i) : flerAvGangen ? [...f, i] : [i]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: '1px solid var(--ak-linje-hard)',
      ...style
    }
  }, poster.map((p, i) => {
    const apen = apne.includes(i);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        borderBottom: '1px solid var(--ak-linje)'
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => veksle(i),
      "aria-expanded": apen,
      style: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--ak-r-4)',
        background: 'transparent',
        border: 0,
        cursor: 'pointer',
        textAlign: 'left',
        padding: 'var(--ak-r-4) 0',
        minHeight: 'var(--ak-treff)',
        fontFamily: 'var(--ak-sans)',
        fontSize: 'var(--ak-t-17)',
        fontWeight: 'var(--ak-v-500)',
        color: 'var(--ak-tekst)'
      }
    }, p.tittel, /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        flex: '0 0 auto',
        width: 16,
        height: 16,
        position: 'relative',
        color: apen ? 'var(--ak-signal)' : 'var(--ak-dempet)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 7,
        left: 0,
        width: 16,
        height: 2,
        background: 'currentColor'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 0,
        left: 7,
        width: 2,
        height: 16,
        background: 'currentColor',
        transform: apen ? 'scaleY(0)' : 'scaleY(1)',
        transition: 'transform var(--ak-fart-mid) var(--ak-kurve)'
      }
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateRows: apen ? '1fr' : '0fr',
        transition: 'grid-template-rows var(--ak-fart-mid) var(--ak-kurve)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        paddingBottom: 'var(--ak-r-5)',
        color: 'var(--ak-dempet)',
        fontSize: 'var(--ak-t-17)',
        maxWidth: '62ch'
      }
    }, p.innhold))));
  }));
}
Object.assign(__ds_scope, { Akkordeon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/flate/Akkordeon.jsx", error: String((e && e.message) || e) }); }

// components/flate/Fotokort.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Fotokort({
  bilde,
  alt,
  bildetekst,
  kilde,
  tekstOver,
  forhold = '3 / 2',
  hoyde,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("figure", _extends({}, rest, {
    style: {
      margin: 0,
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 'var(--ak-hjorne-md)',
      aspectRatio: hoyde ? undefined : forhold,
      height: hoyde,
      background: 'var(--ak-grunn-senk)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: bilde,
    alt: alt,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    }
  }), tekstOver && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to top, rgba(20,20,19,0.82) 0%, rgba(20,20,19,0.55) 34%, rgba(20,20,19,0) 68%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: 'var(--ak-r-5)'
    }
  }, tekstOver))), (bildetekst || kilde) && /*#__PURE__*/React.createElement("figcaption", {
    style: {
      marginTop: 'var(--ak-r-3)',
      display: 'flex',
      gap: 'var(--ak-r-3)',
      alignItems: 'baseline',
      fontSize: 'var(--ak-t-13)',
      color: 'var(--ak-dempet)',
      maxWidth: '52ch'
    }
  }, /*#__PURE__*/React.createElement("span", null, bildetekst), kilde && /*#__PURE__*/React.createElement("span", {
    className: "ak-maalt",
    style: {
      color: 'var(--ak-svak)',
      whiteSpace: 'nowrap'
    }
  }, kilde)));
}
Object.assign(__ds_scope, { Fotokort });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/flate/Fotokort.jsx", error: String((e && e.message) || e) }); }

// components/flate/Kort.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Kort i tre tyngder. Tyngden er hvor mye kortet løfter seg fra grunnen —
   ikke hvor viktig innholdet er. Hover og trykk ligger i samspill.css. */

function Kort({
  tyngde = 1,
  trykkbar = false,
  aksent,
  rutenett = false,
  som = 'div',
  onClick,
  children,
  className,
  style,
  ...rest
}) {
  const loft = {
    1: 'var(--ak-loft-1)',
    2: 'var(--ak-loft-2)',
    3: 'var(--ak-loft-3)'
  }[tyngde];
  const Tag = som;
  const rute = rutenett ? {
    backgroundImage: 'linear-gradient(var(--ak-rute-lys) 1px, transparent 1px), linear-gradient(90deg, var(--ak-rute-lys) 1px, transparent 1px)',
    backgroundSize: 'var(--ak-rute-tett) var(--ak-rute-tett)'
  } : null;
  return /*#__PURE__*/React.createElement(Tag, _extends({}, rest, {
    onClick: onClick,
    className: [trykkbar && 'ak-trykk', trykkbar && 'ak-kort-trykk', className].filter(Boolean).join(' ') || undefined,
    style: {
      background: 'var(--ak-ark)',
      border: '1px solid ' + (tyngde === 1 ? 'var(--ak-linje)' : 'transparent'),
      borderRadius: 'var(--ak-hjorne-md)',
      boxShadow: loft,
      borderTop: aksent ? '3px solid ' + aksent : undefined,
      padding: 'var(--ak-r-5)',
      cursor: trykkbar ? 'pointer' : undefined,
      ...style,
      // Etter kallerens style: en `background`-kortform utenfra ville ellers
      // nullstille background-image og fjerne rutenettet uten varsel.
      ...rute
    }
  }), children);
}
Object.assign(__ds_scope, { Kort });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/flate/Kort.jsx", error: String((e && e.message) || e) }); }

// components/handling/IkonKnapp.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function IkonKnapp({
  merkelapp,
  variant = 'stille',
  storrelse = 44,
  aktiv = false,
  deaktivert = false,
  onClick,
  children,
  className,
  style,
  ...rest
}) {
  const fyll = variant === 'fylt';
  const tone = fyll ? {
    background: 'var(--ak-signal-fyll)',
    color: 'var(--ak-signal-tekst)',
    borderColor: 'transparent',
    '--ak-h-bg': 'var(--ak-signal)',
    '--ak-h-kant': 'transparent',
    '--ak-h-tekst': 'var(--ak-signal-tekst)'
  } : {
    background: aktiv ? 'var(--ak-grunn-senk)' : 'transparent',
    color: 'var(--ak-tekst)',
    borderColor: aktiv ? 'var(--ak-linje-hard)' : 'var(--ak-linje)',
    '--ak-h-bg': 'var(--ak-grunn-senk)',
    '--ak-h-kant': 'var(--ak-linje-hard)',
    '--ak-h-tekst': 'var(--ak-tekst)'
  };
  return /*#__PURE__*/React.createElement("button", _extends({}, rest, {
    type: "button",
    "aria-label": merkelapp,
    "aria-pressed": aktiv || undefined,
    disabled: deaktivert,
    "aria-disabled": deaktivert || undefined,
    onClick: onClick,
    className: ['ak-trykk', className].filter(Boolean).join(' '),
    style: {
      width: storrelse,
      height: storrelse,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--ak-hjorne-sm)',
      cursor: deaktivert ? 'not-allowed' : 'pointer',
      border: '1px solid transparent',
      opacity: deaktivert ? 0.42 : 1,
      ...tone,
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { IkonKnapp });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/handling/IkonKnapp.jsx", error: String((e && e.message) || e) }); }

// components/handling/Knapp.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Hover, trykk og snurre ligger i tokens/samspill.css — ikke her.
   onMouseEnter utløses av et trykk på mobil og blir hengende; CSS kan
   spørre om enheten har en ekte peker, og det er den eneste riktige
   måten på et merke der mobil er viktigste visning. */

const base = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--ak-r-2)',
  fontFamily: 'var(--ak-sans)',
  fontWeight: 'var(--ak-v-500)',
  lineHeight: 1,
  border: '1px solid transparent',
  borderRadius: 'var(--ak-hjorne-sm)',
  cursor: 'pointer',
  textDecoration: 'none',
  minHeight: 'var(--ak-treff)'
};
const stoerrelser = {
  sm: {
    fontSize: 'var(--ak-t-15)',
    padding: '0 var(--ak-r-4)',
    minHeight: 36
  },
  md: {
    fontSize: 'var(--ak-t-17)',
    padding: '0 var(--ak-r-5)'
  },
  lg: {
    fontSize: 'var(--ak-t-21)',
    padding: '0 var(--ak-r-6)',
    minHeight: 56
  }
};

/* Hviletilstand inline; hover-verdiene sendes som custom properties
   samspill.css leser. Da finnes hver farge fortsatt bare ett sted. */
const toner = {
  primaer: {
    background: 'var(--ak-signal-fyll)',
    color: 'var(--ak-signal-tekst)',
    borderColor: 'transparent',
    '--ak-h-bg': 'var(--ak-signal)',
    '--ak-h-kant': 'transparent',
    '--ak-h-tekst': 'var(--ak-signal-tekst)'
  },
  sekundaer: {
    background: 'transparent',
    color: 'var(--ak-tekst)',
    borderColor: 'var(--ak-linje-hard)',
    '--ak-h-bg': 'var(--ak-grunn-senk)',
    '--ak-h-kant': 'var(--ak-linje-hard)',
    '--ak-h-tekst': 'var(--ak-tekst)'
  },
  tekst: {
    background: 'transparent',
    color: 'var(--ak-signal)',
    borderColor: 'transparent',
    padding: '0 var(--ak-r-2)',
    textDecoration: 'underline',
    textDecorationThickness: 1,
    textUnderlineOffset: 4,
    '--ak-h-bg': 'transparent',
    '--ak-h-kant': 'transparent',
    '--ak-h-tekst': 'var(--ak-tekst)'
  }
};
function Knapp({
  variant = 'primaer',
  storrelse = 'md',
  pill = false,
  fullBredde = false,
  deaktivert = false,
  laster = false,
  ikon,
  href,
  onClick,
  children,
  className,
  style,
  ...rest
}) {
  const av = deaktivert || laster;
  const s = {
    ...base,
    ...stoerrelser[storrelse],
    ...(toner[variant] || toner.primaer),
    borderRadius: pill ? 'var(--ak-hjorne-pill)' : 'var(--ak-hjorne-sm)',
    width: fullBredde ? '100%' : undefined,
    opacity: av ? 0.42 : 1,
    cursor: av ? 'not-allowed' : 'pointer',
    ...style
  };
  const Tag = href && !av ? 'a' : 'button';
  return /*#__PURE__*/React.createElement(Tag, _extends({}, rest, {
    href: href,
    style: s,
    className: ['ak-trykk', className].filter(Boolean).join(' '),
    "data-ak-variant": variant,
    disabled: Tag === 'button' ? av : undefined,
    "aria-disabled": av || undefined,
    "aria-busy": laster || undefined,
    onClick: av ? undefined : onClick
  }), laster ? /*#__PURE__*/React.createElement("span", {
    className: "ak-snurre",
    "aria-hidden": "true"
  }) : ikon, children);
}
Object.assign(__ds_scope, { Knapp });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/handling/Knapp.jsx", error: String((e && e.message) || e) }); }

// components/handling/Paginering.jsx
try { (() => {
const Pil = ({
  vei
}) => /*#__PURE__*/React.createElement("svg", {
  width: "18",
  height: "18",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "square",
  "aria-hidden": "true",
  style: {
    transform: vei === 'venstre' ? 'scaleX(-1)' : undefined
  }
}, /*#__PURE__*/React.createElement("path", {
  d: "M9 6l6 6-6 6"
}));
function Paginering({
  side = 1,
  antallSider = 1,
  onBytt,
  style
}) {
  const sider = Array.from({
    length: antallSider
  }, (_, i) => i + 1);
  return /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Paginering",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--ak-r-2)',
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.IkonKnapp, {
    merkelapp: "Forrige side",
    deaktivert: side <= 1,
    onClick: () => onBytt && onBytt(side - 1)
  }, /*#__PURE__*/React.createElement(Pil, {
    vei: "venstre"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--ak-r-1)'
    }
  }, sider.map(n => {
    const her = n === side;
    return /*#__PURE__*/React.createElement("button", {
      key: n,
      type: "button",
      onClick: () => onBytt && onBytt(n),
      "aria-current": her ? 'page' : undefined,
      style: {
        minWidth: 40,
        height: 40,
        cursor: 'pointer',
        fontFamily: 'var(--ak-mono)',
        fontSize: 'var(--ak-t-15)',
        fontVariantNumeric: 'tabular-nums',
        borderRadius: 'var(--ak-hjorne-sm)',
        border: '1px solid ' + (her ? 'transparent' : 'var(--ak-linje)'),
        background: her ? 'var(--ak-tekst)' : 'transparent',
        color: her ? 'var(--ak-grunn)' : 'var(--ak-tekst)'
      }
    }, n);
  })), /*#__PURE__*/React.createElement(__ds_scope.IkonKnapp, {
    merkelapp: "Neste side",
    deaktivert: side >= antallSider,
    onClick: () => onBytt && onBytt(side + 1)
  }, /*#__PURE__*/React.createElement(Pil, {
    vei: "hoyre"
  })), /*#__PURE__*/React.createElement("span", {
    className: "ak-etikett",
    style: {
      marginLeft: 'var(--ak-r-3)'
    }
  }, "Side ", side, " av ", antallSider));
}
Object.assign(__ds_scope, { Paginering });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/handling/Paginering.jsx", error: String((e && e.message) || e) }); }

// components/maaling/Faktarad.jsx
try { (() => {
function Faktarad({
  poster = [],
  kolonner,
  kompakt = false,
  style
}) {
  const n = kolonner || Math.min(poster.length, 4);
  return /*#__PURE__*/React.createElement("dl", {
    style: {
      margin: 0,
      display: 'grid',
      gridTemplateColumns: 'repeat(' + n + ', minmax(0, 1fr))',
      borderTop: '1px solid var(--ak-linje-hard)',
      ...style
    }
  }, poster.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      padding: kompakt ? 'var(--ak-r-3) var(--ak-r-4) var(--ak-r-3) 0' : 'var(--ak-r-5) var(--ak-r-5) var(--ak-r-5) 0',
      borderRight: i < poster.length - 1 ? '1px solid var(--ak-linje)' : 'none',
      paddingLeft: i === 0 ? 0 : 'var(--ak-r-5)'
    }
  }, /*#__PURE__*/React.createElement("dt", {
    className: "ak-etikett",
    style: {
      marginBottom: 'var(--ak-r-2)'
    }
  }, p.etikett), /*#__PURE__*/React.createElement("dd", {
    className: "ak-maalt",
    style: {
      margin: 0,
      fontSize: kompakt ? 'var(--ak-t-21)' : 'var(--ak-t-34)',
      fontWeight: 'var(--ak-v-500)',
      letterSpacing: '-0.02em',
      color: p.fremhevet ? 'var(--ak-signal)' : 'var(--ak-tekst)'
    }
  }, p.verdi, p.enhet && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.55em',
      color: 'var(--ak-dempet)',
      marginLeft: 4
    }
  }, p.enhet)), p.note && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--ak-r-2)',
      fontSize: 'var(--ak-t-13)',
      color: 'var(--ak-dempet)'
    }
  }, p.note))));
}
Object.assign(__ds_scope, { Faktarad });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/maaling/Faktarad.jsx", error: String((e && e.message) || e) }); }

// components/maaling/Liste.jsx
try { (() => {
function Liste({
  poster = [],
  onVelg,
  tom = 'Ingenting her ennå.',
  style
}) {
  if (poster.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 'var(--ak-r-6)',
        textAlign: 'center',
        color: 'var(--ak-dempet)',
        border: '1px solid var(--ak-linje)',
        borderRadius: 'var(--ak-hjorne-md)',
        background: 'var(--ak-ark)',
        ...style
      }
    }, tom);
  }
  const klikkbar = !!onVelg;
  return /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      borderTop: '1px solid var(--ak-linje-hard)',
      ...style
    }
  }, poster.map((p, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    className: klikkbar ? 'ak-trykk ak-rad-trykk' : undefined,
    onClick: klikkbar ? () => onVelg(p, i) : undefined,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--ak-r-4)',
      padding: 'var(--ak-r-4) var(--ak-r-3)',
      minHeight: 'var(--ak-treff)',
      borderBottom: '1px solid var(--ak-linje)',
      background: 'transparent',
      cursor: klikkbar ? 'pointer' : 'default'
    }
  }, p.merke && /*#__PURE__*/React.createElement("span", {
    className: "ak-etikett",
    style: {
      width: 64,
      flex: '0 0 auto'
    }
  }, p.merke), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--ak-t-17)',
      fontWeight: 'var(--ak-v-500)'
    }
  }, p.tittel), p.note && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--ak-t-13)',
      color: 'var(--ak-dempet)'
    }
  }, p.note)), p.verdi && /*#__PURE__*/React.createElement("span", {
    className: "ak-maalt",
    style: {
      fontSize: 'var(--ak-t-17)',
      color: 'var(--ak-tekst)'
    }
  }, p.verdi), klikkbar && /*#__PURE__*/React.createElement("svg", {
    "aria-hidden": "true",
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "square",
    style: {
      color: 'var(--ak-svak)'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9 6l6 6-6 6"
  })))));
}
Object.assign(__ds_scope, { Liste });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/maaling/Liste.jsx", error: String((e && e.message) || e) }); }

// components/maaling/Tabell.jsx
try { (() => {
function Tabell({
  kolonner = [],
  rader = [],
  tekst,
  tom = 'Ingen rader ennå.',
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      ...style
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 'var(--ak-t-15)'
    }
  }, tekst && /*#__PURE__*/React.createElement("caption", {
    style: {
      textAlign: 'left',
      paddingBottom: 'var(--ak-r-3)',
      color: 'var(--ak-dempet)',
      fontSize: 'var(--ak-t-13)'
    }
  }, tekst), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, kolonner.map(k => /*#__PURE__*/React.createElement("th", {
    key: k.noekkel,
    scope: "col",
    className: "ak-etikett",
    style: {
      textAlign: k.maalt ? 'right' : 'left',
      padding: '0 var(--ak-r-4) var(--ak-r-3) 0',
      borderBottom: '1px solid var(--ak-linje-hard)',
      whiteSpace: 'nowrap'
    }
  }, k.tittel)))), /*#__PURE__*/React.createElement("tbody", null, rader.length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: kolonner.length,
    style: {
      padding: 'var(--ak-r-6) 0',
      color: 'var(--ak-dempet)',
      textAlign: 'center'
    }
  }, tom)), rader.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: i
  }, kolonner.map(k => /*#__PURE__*/React.createElement("td", {
    key: k.noekkel,
    className: k.maalt ? 'ak-maalt' : undefined,
    style: {
      textAlign: k.maalt ? 'right' : 'left',
      padding: 'var(--ak-r-3) var(--ak-r-4) var(--ak-r-3) 0',
      borderBottom: '1px solid var(--ak-linje)',
      color: k.dempet ? 'var(--ak-dempet)' : 'var(--ak-tekst)',
      fontWeight: k.noekkel === kolonner[0].noekkel ? 'var(--ak-v-500)' : 'var(--ak-v-400)'
    }
  }, r[k.noekkel])))))));
}
Object.assign(__ds_scope, { Tabell });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/maaling/Tabell.jsx", error: String((e && e.message) || e) }); }

// components/maaling/Talleblokk.jsx
try { (() => {
/* Merkets signatur. Et målt tall som står alene, med dato og kilde båret av en
   målestokk under tallet — ikke av en fotnote under teksten. Målestokken er det
   som gjør at kilden leses: streken sier «dette kommer fra et instrument», og
   linja under den er hva instrumentet var. */

const grader = {
  sm: {
    tall: 'var(--ak-t-34)',
    enhet: 'var(--ak-t-17)'
  },
  md: {
    tall: 'var(--ak-t-48)',
    enhet: 'var(--ak-t-21)'
  },
  lg: {
    tall: 'var(--ak-t-72)',
    enhet: 'var(--ak-t-26)'
  },
  xl: {
    tall: 'var(--ak-t-112)',
    enhet: 'var(--ak-t-34)'
  }
};
function Talleblokk({
  tall,
  enhet,
  etikett,
  forklaring,
  kilde,
  dato,
  antall,
  estimat = false,
  storrelse = 'lg',
  fremhevet = false,
  maalestokk = true,
  style
}) {
  const g = grader[storrelse] || grader.lg;
  const kildedeler = [kilde, dato, antall != null ? antall + ' målinger' : null].filter(Boolean);
  return /*#__PURE__*/React.createElement("figure", {
    style: {
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--ak-r-3)',
      ...style
    }
  }, etikett && /*#__PURE__*/React.createElement("span", {
    className: "ak-etikett"
  }, etikett), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 'var(--ak-r-2)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ak-maalt",
    style: {
      fontSize: g.tall,
      fontWeight: 'var(--ak-v-500)',
      lineHeight: 0.9,
      letterSpacing: '-0.03em',
      color: fremhevet ? 'var(--ak-signal)' : 'var(--ak-tekst)'
    }
  }, tall), enhet && /*#__PURE__*/React.createElement("span", {
    className: "ak-maalt",
    style: {
      fontSize: g.enhet,
      color: 'var(--ak-dempet)',
      lineHeight: 1
    }
  }, enhet)), maalestokk && /*#__PURE__*/React.createElement("span", {
    className: "ak-maalestokk",
    "aria-hidden": "true",
    style: {
      display: 'block',
      color: 'var(--ak-tekst)',
      maxWidth: 240
    }
  }), forklaring && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--ak-t-17)',
      color: 'var(--ak-tekst)',
      maxWidth: '46ch'
    }
  }, forklaring), (kildedeler.length > 0 || estimat) && /*#__PURE__*/React.createElement("figcaption", {
    className: "ak-maalt",
    style: {
      fontSize: 'var(--ak-t-13)',
      color: 'var(--ak-dempet)',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0 var(--ak-r-2)',
      alignItems: 'center'
    }
  }, estimat && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ak-varsel)',
      fontWeight: 'var(--ak-v-500)'
    }
  }, "ESTIMAT"), kildedeler.join(' · ')));
}
Object.assign(__ds_scope, { Talleblokk });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/maaling/Talleblokk.jsx", error: String((e && e.message) || e) }); }

// components/melding/Merkelapp.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const variantfarger = {
  junior: 'var(--ak-v-junior)',
  academy: 'var(--ak-signal)',
  hq: 'var(--ak-v-hq)',
  organisasjon: 'var(--ak-v-org)',
  produkt: 'var(--ak-v-produkt)',
  fag: 'var(--ak-fag)',
  noytral: 'var(--ak-dempet)'
};
function Merkelapp({
  variant = 'noytral',
  fylt = false,
  children,
  style,
  ...rest
}) {
  const farge = variantfarger[variant] || variantfarger.noytral;
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    className: "ak-maalt",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      height: 22,
      padding: '0 var(--ak-r-2)',
      fontSize: 'var(--ak-t-11)',
      fontWeight: 'var(--ak-v-500)',
      letterSpacing: 'var(--ak-sp-vid)',
      textTransform: 'uppercase',
      borderRadius: 'var(--ak-hjorne-sm)',
      border: '1px solid ' + (fylt ? 'transparent' : farge),
      background: fylt ? farge : 'transparent',
      color: fylt ? '#FFFFFF' : farge,
      ...style
    }
  }), children);
}
Object.assign(__ds_scope, { Merkelapp });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/melding/Merkelapp.jsx", error: String((e && e.message) || e) }); }

// components/melding/Status.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const toner = {
  ok: {
    farge: 'var(--ak-ok)',
    ord: 'I orden'
  },
  varsel: {
    farge: 'var(--ak-varsel)',
    ord: 'Følg med'
  },
  feil: {
    farge: 'var(--ak-feil)',
    ord: 'Feil'
  },
  noytral: {
    farge: 'var(--ak-dempet)',
    ord: 'Ikke satt'
  }
};
function Status({
  tilstand = 'noytral',
  children,
  style,
  ...rest
}) {
  const t = toner[tilstand] || toner.noytral;
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--ak-r-2)',
      fontSize: 'var(--ak-t-15)',
      color: 'var(--ak-tekst)',
      ...style
    }
  }), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 8,
      height: 8,
      flex: '0 0 auto',
      background: t.farge,
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("span", null, children || t.ord));
}
Object.assign(__ds_scope, { Status });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/melding/Status.jsx", error: String((e && e.message) || e) }); }

// components/melding/TomTilstand.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TomTilstand({
  tittel,
  forklaring,
  handling,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    style: {
      border: '1px dashed var(--ak-linje-hard)',
      borderRadius: 'var(--ak-hjorne-md)',
      background: 'transparent',
      padding: 'var(--ak-r-7) var(--ak-r-5)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--ak-r-3)',
      textAlign: 'center',
      ...style
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "ak-maalestokk",
    "aria-hidden": "true",
    style: {
      display: 'block',
      width: 96,
      color: 'var(--ak-svak)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--ak-display)',
      fontWeight: 'var(--ak-v-600)',
      fontSize: 'var(--ak-t-21)',
      letterSpacing: 'var(--ak-sp-titt)'
    }
  }, tittel), forklaring && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--ak-t-15)',
      color: 'var(--ak-dempet)',
      maxWidth: '42ch'
    }
  }, forklaring), handling);
}
Object.assign(__ds_scope, { TomTilstand });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/melding/TomTilstand.jsx", error: String((e && e.message) || e) }); }

// components/melding/Varsel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const toner = {
  info: {
    kant: 'var(--ak-linje-hard)',
    merke: 'var(--ak-tekst)'
  },
  ok: {
    kant: 'var(--ak-ok)',
    merke: 'var(--ak-ok)'
  },
  varsel: {
    kant: 'var(--ak-varsel)',
    merke: 'var(--ak-varsel)'
  },
  feil: {
    kant: 'var(--ak-feil)',
    merke: 'var(--ak-feil)'
  }
};
function Varsel({
  tilstand = 'info',
  tittel,
  handling,
  onLukk,
  children,
  style,
  ...rest
}) {
  const t = toner[tilstand] || toner.info;
  return /*#__PURE__*/React.createElement("div", _extends({}, rest, {
    role: tilstand === 'feil' ? 'alert' : 'status',
    className: "ak-kommer",
    "data-ak-fra": "bunn",
    style: {
      display: 'flex',
      gap: 'var(--ak-r-4)',
      alignItems: 'flex-start',
      background: 'var(--ak-ark)',
      border: '1px solid var(--ak-linje)',
      borderLeft: '3px solid ' + t.merke,
      borderRadius: 'var(--ak-hjorne-sm)',
      padding: 'var(--ak-r-4)',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, tittel && /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 'var(--ak-v-500)',
      fontSize: 'var(--ak-t-17)',
      marginBottom: children ? 'var(--ak-r-1)' : 0
    }
  }, tittel), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--ak-t-15)',
      color: 'var(--ak-dempet)',
      maxWidth: '58ch'
    }
  }, children), handling && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--ak-r-3)'
    }
  }, handling)), onLukk && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onLukk,
    "aria-label": "Lukk melding",
    style: {
      flex: '0 0 auto',
      width: 32,
      height: 32,
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      color: 'var(--ak-dempet)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "square"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 5l14 14M19 5L5 19"
  }))));
}
Object.assign(__ds_scope, { Varsel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/melding/Varsel.jsx", error: String((e && e.message) || e) }); }

// components/merke/Instrumentflate.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Rutenettet som tekstur. Ett instrumentelement per flate — er det rutenett
   her, skal det ikke være målestokk og kryss i samme visning. */

function Instrumentflate({
  tett = false,
  mork = false,
  kryss = false,
  styrke,
  som = 'div',
  children,
  style,
  ...rest
}) {
  const rute = tett ? 'var(--ak-rute-tett)' : 'var(--ak-rute)';
  const linje = mork ? 'var(--ak-rute-mork)' : 'var(--ak-rute-lys)';
  const Tag = som;
  return /*#__PURE__*/React.createElement(Tag, _extends({}, rest, {
    style: {
      position: 'relative',
      opacity: styrke,
      ...style,
      // Rutenettet settes ETTER kallerens style: en `background`-kortform utenfra
      // ville ellers nullstille background-image og slå av instrumentlaget stille.
      backgroundImage: 'linear-gradient(' + linje + ' var(--ak-rute-linje), transparent var(--ak-rute-linje)),' + 'linear-gradient(90deg, ' + linje + ' var(--ak-rute-linje), transparent var(--ak-rute-linje))',
      backgroundSize: rute + ' ' + rute
    }
  }), kryss && /*#__PURE__*/React.createElement(Kryss, {
    hjorne: "tv",
    mork: mork
  }), kryss && /*#__PURE__*/React.createElement(Kryss, {
    hjorne: "nh",
    mork: mork
  }), children);
}
function Kryss({
  hjorne,
  mork
}) {
  const pos = hjorne === 'tv' ? {
    top: 24,
    left: 24
  } : {
    bottom: 24,
    right: 24
  };
  return /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      width: 'var(--ak-kryss)',
      height: 'var(--ak-kryss)',
      ...pos,
      color: mork ? 'var(--ak-dempet)' : 'var(--ak-linje-hard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 0,
      top: '50%',
      width: '100%',
      height: 1,
      background: 'currentColor'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 0,
      left: '50%',
      height: '100%',
      width: 1,
      background: 'currentColor'
    }
  }));
}
Object.assign(__ds_scope, { Instrumentflate });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/merke/Instrumentflate.jsx", error: String((e && e.message) || e) }); }

// components/merke/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Logoen rendres ALLTID fra fil. Aldri gjenskapt i markup, aldri farget om.
   Filene ligger i assets/logo/ — komponenten peker bare på dem. */

const filer = {
  'primaer-lys': 'ak-golf-logo-primary-on-light.svg',
  'primaer-mork': 'ak-golf-logo-primary-on-dark.svg',
  'hvit-mork': 'ak-golf-logo-white-on-dark.svg',
  'hvit-mono': 'ak-golf-logo-white-mono.svg',
  'sort-mono': 'ak-golf-logo-black-mono.svg',
  'signal-mono': 'ak-golf-logo-primary-mono.svg',
  'kvadrat': 'ak-golf-merke-kvadrat.svg',
  'favicon': 'ak-golf-favicon.svg'
};
function Logo({
  variant = 'primaer-lys',
  hoyde = 40,
  klaring = false,
  rot = '/assets/logo/',
  style,
  ...rest
}) {
  const fil = filer[variant] || filer['primaer-lys'];
  const h = Math.max(hoyde, 24);
  return /*#__PURE__*/React.createElement("img", _extends({}, rest, {
    src: rot + fil,
    alt: "AK Golf",
    style: {
      height: h,
      width: 'auto',
      display: 'block',
      alignSelf: 'flex-start',
      flex: '0 0 auto',
      maxWidth: '100%',
      objectFit: 'contain',
      padding: klaring ? h / 2 : 0,
      ...style
    }
  }));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/merke/Logo.jsx", error: String((e && e.message) || e) }); }

// components/merke/Maalestokk.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Maalestokk({
  retning = 'vannrett',
  lengde = 200,
  style,
  ...rest
}) {
  const staaende = retning === 'staaende';
  return /*#__PURE__*/React.createElement("span", _extends({}, rest, {
    "aria-hidden": "true",
    style: {
      display: 'block',
      color: 'currentColor',
      opacity: 0.42,
      width: staaende ? 'var(--ak-maal-hel)' : lengde,
      height: staaende ? lengde : 'var(--ak-maal-hel)',
      backgroundImage: 'repeating-linear-gradient(' + (staaende ? '180deg' : '90deg') + ', currentColor 0, currentColor var(--ak-maal-tykk), transparent var(--ak-maal-tykk), transparent var(--ak-maal-steg))',
      backgroundSize: staaende ? 'var(--ak-maal-merke) 100%' : '100% var(--ak-maal-merke)',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: staaende ? '100% 0' : '0 100%',
      ...style
    }
  }));
}
Object.assign(__ds_scope, { Maalestokk });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/merke/Maalestokk.jsx", error: String((e && e.message) || e) }); }

// components/merke/Navnelaas.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Ferdige låsefiler. Bygg ALDRI en lås for hånd — teksten i filene er
   konvertert til former, så de ikke er avhengige av at Poppins er installert. */

const varianter = {
  academy: 'ak-golf-laas-academy',
  'junior-academy': 'ak-golf-laas-junior-academy',
  hq: 'ak-golf-laas-hq',
  organisasjon: 'ak-golf-laas-organisasjon',
  products: 'ak-golf-laas-products'
};
function Navnelaas({
  variant = 'academy',
  paaMorkt = false,
  hoyde = 40,
  rot = '/assets/logo/',
  style,
  ...rest
}) {
  const stamme = varianter[variant] || varianter.academy;
  const fil = stamme + (paaMorkt ? '-pa-morkt' : '') + '.svg';
  const navn = {
    academy: 'AK Golf Academy',
    'junior-academy': 'AK Golf Junior Academy',
    hq: 'AK Golf HQ',
    organisasjon: 'WANG Toppidrett Fredrikstad — coaching ved AK Golf',
    products: 'Skarpnord Golf Products'
  }[variant];
  return /*#__PURE__*/React.createElement("img", _extends({}, rest, {
    src: rot + fil,
    alt: navn,
    style: {
      height: Math.max(hoyde, 24),
      width: 'auto',
      display: 'block',
      alignSelf: 'flex-start',
      flex: '0 0 auto',
      maxWidth: '100%',
      objectFit: 'contain',
      ...style
    }
  }));
}
Object.assign(__ds_scope, { Navnelaas });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/merke/Navnelaas.jsx", error: String((e && e.message) || e) }); }

// components/navigasjon/Brodsmuler.jsx
try { (() => {
function Brodsmuler({
  smuler = [],
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Br\xF8dsmuler",
    style: {
      ...style
    }
  }, /*#__PURE__*/React.createElement("ol", {
    style: {
      listStyle: 'none',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--ak-r-2)',
      margin: 0,
      padding: 0,
      alignItems: 'center'
    }
  }, smuler.map((s, i) => {
    const siste = i === smuler.length - 1;
    return /*#__PURE__*/React.createElement("li", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ak-r-2)'
      }
    }, i > 0 && /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      className: "ak-maalt",
      style: {
        color: 'var(--ak-svak)',
        fontSize: 'var(--ak-t-13)'
      }
    }, "/"), siste || !s.href ? /*#__PURE__*/React.createElement("span", {
      "aria-current": siste ? 'page' : undefined,
      className: "ak-etikett",
      style: {
        color: 'var(--ak-tekst)'
      }
    }, s.tekst) : /*#__PURE__*/React.createElement("a", {
      href: s.href,
      className: "ak-etikett",
      style: {
        color: 'var(--ak-dempet)',
        textDecoration: 'none'
      }
    }, s.tekst));
  })));
}
Object.assign(__ds_scope, { Brodsmuler });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigasjon/Brodsmuler.jsx", error: String((e && e.message) || e) }); }

// components/navigasjon/Faner.jsx
try { (() => {
function Faner({
  faner = [],
  aktiv,
  onBytt,
  aksent = 'var(--ak-signal)',
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: 'flex',
      gap: 'var(--ak-r-5)',
      borderBottom: '1px solid var(--ak-linje-hard)',
      ...style
    }
  }, faner.map(f => {
    const her = f.noekkel === aktiv;
    return /*#__PURE__*/React.createElement("button", {
      key: f.noekkel,
      role: "tab",
      type: "button",
      "aria-selected": her,
      onClick: () => onBytt && onBytt(f.noekkel),
      style: {
        position: 'relative',
        background: 'transparent',
        border: 0,
        cursor: 'pointer',
        padding: 'var(--ak-r-3) 0',
        minHeight: 'var(--ak-treff)',
        fontFamily: 'var(--ak-sans)',
        fontSize: 'var(--ak-t-17)',
        fontWeight: 'var(--ak-v-500)',
        color: her ? 'var(--ak-tekst)' : 'var(--ak-dempet)'
      }
    }, f.tekst, f.antall != null && /*#__PURE__*/React.createElement("span", {
      className: "ak-maalt",
      style: {
        marginLeft: 8,
        fontSize: 'var(--ak-t-13)',
        color: 'var(--ak-svak)'
      }
    }, f.antall), her && /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: -1,
        height: 2,
        background: aksent
      }
    }));
  }));
}
Object.assign(__ds_scope, { Faner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigasjon/Faner.jsx", error: String((e && e.message) || e) }); }

// components/navigasjon/Mobilmeny.jsx
try { (() => {
function Mobilmeny({
  apen = false,
  lenker = [],
  aktiv,
  handling,
  onLukk,
  logoRot = '/assets/logo/',
  style
}) {
  if (!apen) return null;
  return /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Meny",
    className: "ak-kommer",
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 40,
      background: 'var(--ak-grunn)',
      display: 'flex',
      flexDirection: 'column',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 64,
      padding: '0 var(--ak-r-4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--ak-linje)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Logo, {
    hoyde: 26,
    rot: logoRot
  }), /*#__PURE__*/React.createElement(__ds_scope.IkonKnapp, {
    merkelapp: "Lukk meny",
    onClick: onLukk
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "square"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 5l14 14M19 5L5 19"
  })))), /*#__PURE__*/React.createElement("nav", {
    style: {
      flex: 1,
      padding: 'var(--ak-r-4) 0',
      display: 'flex',
      flexDirection: 'column'
    }
  }, lenker.map(l => {
    const her = l.href === aktiv;
    return /*#__PURE__*/React.createElement("a", {
      key: l.href,
      href: l.href,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--ak-r-3)',
        minHeight: 56,
        padding: '0 var(--ak-r-4)',
        textDecoration: 'none',
        borderBottom: '1px solid var(--ak-linje)',
        fontFamily: 'var(--ak-display)',
        fontWeight: 'var(--ak-v-600)',
        fontSize: 'var(--ak-t-26)',
        letterSpacing: 'var(--ak-sp-titt)',
        color: 'var(--ak-tekst)'
      }
    }, her && /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        width: 3,
        height: 24,
        background: 'var(--ak-signal)'
      }
    }), l.tekst);
  })), handling && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--ak-r-4)'
    }
  }, handling));
}
Object.assign(__ds_scope, { Mobilmeny });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigasjon/Mobilmeny.jsx", error: String((e && e.message) || e) }); }

// components/navigasjon/Toppnav.jsx
try { (() => {
function Toppnav({
  lenker = [],
  aktiv,
  handling,
  variant,
  mork = false,
  logoRot = '/assets/logo/',
  onMeny,
  mobil = false,
  style
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'relative',
      background: mork ? 'var(--ak-grunn)' : 'var(--ak-grunn)',
      borderBottom: '1px solid var(--ak-linje)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--ak-sidebredde)',
      margin: '0 auto',
      height: mobil ? 64 : 80,
      padding: mobil ? '0 var(--ak-r-4)' : '0 var(--ak-r-6)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--ak-r-6)'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "/",
    style: {
      display: 'block',
      textDecoration: 'none',
      flex: '0 0 auto'
    },
    "aria-label": "AK Golf, til forsiden"
  }, variant ? /*#__PURE__*/React.createElement(__ds_scope.Navnelaas, {
    variant: variant,
    paaMorkt: mork,
    hoyde: mobil ? 26 : 32,
    rot: logoRot
  }) : /*#__PURE__*/React.createElement(__ds_scope.Logo, {
    variant: mork ? 'hvit-mork' : 'primaer-lys',
    hoyde: mobil ? 26 : 32,
    rot: logoRot
  })), !mobil && /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 'var(--ak-r-5)',
      flex: 1
    }
  }, lenker.map(l => {
    const her = l.href === aktiv;
    return /*#__PURE__*/React.createElement("a", {
      key: l.href,
      href: l.href,
      style: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        height: 80,
        fontSize: 'var(--ak-t-15)',
        fontWeight: 'var(--ak-v-500)',
        color: her ? 'var(--ak-tekst)' : 'var(--ak-dempet)',
        textDecoration: 'none'
      }
    }, l.tekst, her && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: -1,
        height: 2,
        background: 'var(--ak-signal)'
      }
    }));
  })), mobil && /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), !mobil && handling, mobil && /*#__PURE__*/React.createElement(__ds_scope.IkonKnapp, {
    merkelapp: "\xC5pne meny",
    onClick: onMeny
  }, /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "square"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 6h18M3 12h18M3 18h18"
  })))));
}
Object.assign(__ds_scope, { Toppnav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigasjon/Toppnav.jsx", error: String((e && e.message) || e) }); }

// components/skjema/Avkrysning.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Avkrysning({
  merkelapp,
  hjelp,
  avkrysset = false,
  onEndre,
  deaktivert = false,
  feil,
  id,
  style,
  ...rest
}) {
  const feltId = id || React.useId();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--ak-r-1)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: feltId,
    style: {
      display: 'flex',
      gap: 'var(--ak-r-3)',
      alignItems: 'flex-start',
      cursor: deaktivert ? 'not-allowed' : 'pointer',
      minHeight: 'var(--ak-treff)',
      paddingTop: 10,
      opacity: deaktivert ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: '0 0 auto',
      width: 22,
      height: 22,
      marginTop: 1,
      borderRadius: 4,
      border: '1px solid ' + (feil ? 'var(--ak-feil)' : avkrysset ? 'transparent' : 'var(--ak-linje-hard)'),
      background: avkrysset ? 'var(--ak-tekst)' : 'var(--ak-ark)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color var(--ak-fart-rask) var(--ak-kurve)'
    }
  }, avkrysset && /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--ak-grunn)",
    strokeWidth: "3",
    strokeLinecap: "square"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 13l4 4L19 7"
  }))), /*#__PURE__*/React.createElement("input", _extends({}, rest, {
    id: feltId,
    type: "checkbox",
    checked: avkrysset,
    disabled: deaktivert,
    onChange: e => onEndre && onEndre(e.target.checked),
    style: {
      position: 'absolute',
      opacity: 0,
      width: 1,
      height: 1
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--ak-t-15)',
      lineHeight: 1.45
    }
  }, merkelapp)), (feil || hjelp) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--ak-t-13)',
      color: feil ? 'var(--ak-feil)' : 'var(--ak-dempet)',
      paddingLeft: 34
    }
  }, feil || hjelp));
}
Object.assign(__ds_scope, { Avkrysning });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/skjema/Avkrysning.jsx", error: String((e && e.message) || e) }); }

// components/skjema/Felt.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Felt({
  merkelapp,
  hjelp,
  feil,
  enhet,
  verdi,
  onEndre,
  type = 'text',
  plassholder,
  flerlinje = false,
  paakrevd = false,
  deaktivert = false,
  maalt = false,
  id,
  style,
  ...rest
}) {
  const [fokus, setFokus] = React.useState(false);
  const feltId = id || React.useId();
  const kant = feil ? 'var(--ak-feil)' : fokus ? 'var(--ak-tekst)' : 'var(--ak-linje-hard)';
  const felles = {
    width: '100%',
    appearance: 'none',
    background: 'var(--ak-ark)',
    border: '1px solid ' + kant,
    borderRadius: 'var(--ak-hjorne-sm)',
    color: 'var(--ak-tekst)',
    fontFamily: maalt ? 'var(--ak-mono)' : 'var(--ak-sans)',
    fontSize: 'var(--ak-t-17)',
    lineHeight: 1.4,
    padding: flerlinje ? 'var(--ak-r-3) var(--ak-r-3)' : '0 var(--ak-r-3)',
    height: flerlinje ? undefined : 'var(--ak-treff)',
    minHeight: flerlinje ? 120 : undefined,
    paddingRight: enhet ? 'var(--ak-r-8)' : undefined,
    opacity: deaktivert ? 0.5 : 1,
    outline: 'none',
    transition: 'border-color var(--ak-fart-rask) var(--ak-kurve)'
  };
  const felt = flerlinje ? /*#__PURE__*/React.createElement("textarea", _extends({}, rest, {
    id: feltId,
    value: verdi,
    placeholder: plassholder,
    disabled: deaktivert,
    onChange: e => onEndre && onEndre(e.target.value),
    onFocus: () => setFokus(true),
    onBlur: () => setFokus(false),
    "aria-invalid": !!feil,
    "aria-describedby": feil || hjelp ? feltId + '-note' : undefined,
    style: felles
  })) : /*#__PURE__*/React.createElement("input", _extends({}, rest, {
    id: feltId,
    type: type,
    value: verdi,
    placeholder: plassholder,
    disabled: deaktivert,
    onChange: e => onEndre && onEndre(e.target.value),
    onFocus: () => setFokus(true),
    onBlur: () => setFokus(false),
    "aria-invalid": !!feil,
    "aria-describedby": feil || hjelp ? feltId + '-note' : undefined,
    style: felles
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--ak-r-2)',
      ...style
    }
  }, merkelapp && /*#__PURE__*/React.createElement("label", {
    htmlFor: feltId,
    style: {
      fontSize: 'var(--ak-t-15)',
      fontWeight: 'var(--ak-v-500)',
      color: 'var(--ak-tekst)'
    }
  }, merkelapp, paakrevd && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      color: 'var(--ak-signal)'
    }
  }, " *")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, felt, enhet && /*#__PURE__*/React.createElement("span", {
    className: "ak-maalt",
    style: {
      position: 'absolute',
      right: 'var(--ak-r-3)',
      top: 0,
      height: 'var(--ak-treff)',
      display: 'flex',
      alignItems: 'center',
      color: 'var(--ak-svak)',
      fontSize: 'var(--ak-t-15)'
    }
  }, enhet)), (feil || hjelp) && /*#__PURE__*/React.createElement("span", {
    id: feltId + '-note',
    style: {
      fontSize: 'var(--ak-t-13)',
      color: feil ? 'var(--ak-feil)' : 'var(--ak-dempet)'
    }
  }, feil || hjelp));
}
Object.assign(__ds_scope, { Felt });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/skjema/Felt.jsx", error: String((e && e.message) || e) }); }

// components/skjema/Radiogruppe.jsx
try { (() => {
function Radiogruppe({
  merkelapp,
  valg = [],
  verdi,
  onEndre,
  feil,
  hjelp,
  navn,
  style
}) {
  const gruppeNavn = navn || React.useId();
  return /*#__PURE__*/React.createElement("fieldset", {
    style: {
      border: 0,
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--ak-r-2)',
      ...style
    }
  }, merkelapp && /*#__PURE__*/React.createElement("legend", {
    style: {
      padding: 0,
      fontSize: 'var(--ak-t-15)',
      fontWeight: 'var(--ak-v-500)',
      marginBottom: 'var(--ak-r-1)'
    }
  }, merkelapp), valg.map(v => {
    const valgt = verdi === v.verdi;
    return /*#__PURE__*/React.createElement("label", {
      key: v.verdi,
      style: {
        display: 'flex',
        gap: 'var(--ak-r-3)',
        alignItems: 'flex-start',
        cursor: 'pointer',
        minHeight: 'var(--ak-treff)',
        paddingTop: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: '0 0 auto',
        width: 22,
        height: 22,
        borderRadius: '50%',
        marginTop: 1,
        border: '1px solid ' + (valgt ? 'var(--ak-tekst)' : 'var(--ak-linje-hard)'),
        background: 'var(--ak-ark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, valgt && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 11,
        height: 11,
        borderRadius: '50%',
        background: 'var(--ak-tekst)'
      }
    })), /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: gruppeNavn,
      checked: valgt,
      onChange: () => onEndre && onEndre(v.verdi),
      style: {
        position: 'absolute',
        opacity: 0,
        width: 1,
        height: 1
      }
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 'var(--ak-t-17)'
      }
    }, v.tekst), v.note && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 'var(--ak-t-13)',
        color: 'var(--ak-dempet)'
      }
    }, v.note)));
  }), (feil || hjelp) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--ak-t-13)',
      color: feil ? 'var(--ak-feil)' : 'var(--ak-dempet)'
    }
  }, feil || hjelp));
}
Object.assign(__ds_scope, { Radiogruppe });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/skjema/Radiogruppe.jsx", error: String((e && e.message) || e) }); }

// components/skjema/Velger.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Velger({
  merkelapp,
  hjelp,
  feil,
  verdi,
  onEndre,
  valg = [],
  plassholder = 'Velg',
  deaktivert = false,
  id,
  style,
  ...rest
}) {
  const feltId = id || React.useId();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--ak-r-2)',
      ...style
    }
  }, merkelapp && /*#__PURE__*/React.createElement("label", {
    htmlFor: feltId,
    style: {
      fontSize: 'var(--ak-t-15)',
      fontWeight: 'var(--ak-v-500)'
    }
  }, merkelapp), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({}, rest, {
    id: feltId,
    value: verdi,
    disabled: deaktivert,
    onChange: e => onEndre && onEndre(e.target.value),
    "aria-invalid": !!feil,
    style: {
      width: '100%',
      appearance: 'none',
      height: 'var(--ak-treff)',
      padding: '0 var(--ak-r-7) 0 var(--ak-r-3)',
      background: 'var(--ak-ark)',
      border: '1px solid ' + (feil ? 'var(--ak-feil)' : 'var(--ak-linje-hard)'),
      borderRadius: 'var(--ak-hjorne-sm)',
      color: verdi ? 'var(--ak-tekst)' : 'var(--ak-svak)',
      fontFamily: 'var(--ak-sans)',
      fontSize: 'var(--ak-t-17)',
      opacity: deaktivert ? 0.5 : 1
    }
  }), /*#__PURE__*/React.createElement("option", {
    value: ""
  }, plassholder), valg.map(v => /*#__PURE__*/React.createElement("option", {
    key: v.verdi,
    value: v.verdi
  }, v.tekst))), /*#__PURE__*/React.createElement("svg", {
    "aria-hidden": "true",
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "square",
    style: {
      position: 'absolute',
      right: 'var(--ak-r-3)',
      top: 13,
      color: 'var(--ak-dempet)',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 9l6 6 6-6"
  }))), (feil || hjelp) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--ak-t-13)',
      color: feil ? 'var(--ak-feil)' : 'var(--ak-dempet)'
    }
  }, feil || hjelp));
}
Object.assign(__ds_scope, { Velger });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/skjema/Velger.jsx", error: String((e && e.message) || e) }); }

// ui_kits/foreldrerapport/Rapport.jsx
try { (() => {
const NS = window.AKGolfDesignsystem_3e5c85;
const {
  Logo,
  Navnelaas,
  Talleblokk,
  Faktarad,
  Tabell,
  Liste,
  Kort,
  Status,
  Merkelapp,
  Knapp,
  TomTilstand,
  Maalestokk,
  Brodsmuler
} = NS;
function Rapport({
  tom = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--ak-ark)',
      maxWidth: 820,
      margin: '0 auto',
      padding: 'var(--ak-r-8)',
      boxShadow: 'var(--ak-loft-2)'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 'var(--ak-r-5)',
      borderBottom: '1px solid var(--ak-linje-hard)',
      paddingBottom: 'var(--ak-r-5)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Navnelaas, {
    variant: "junior-academy",
    hoyde: 30,
    rot: "../../assets/logo/"
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      marginTop: 'var(--ak-r-5)',
      fontSize: 'var(--ak-t-34)'
    }
  }, "Fremgang, Emil \u2014 sesong 2026"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 'var(--ak-r-3)',
      fontSize: 'var(--ak-t-15)',
      color: 'var(--ak-dempet)'
    }
  }, "Alt i denne rapporten er m\xE5lt. St\xE5r det ikke dato og kilde ved et tall, h\xF8rer det ikke hjemme her.")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ak-etikett"
  }, "Skrevet"), /*#__PURE__*/React.createElement("div", {
    className: "ak-maalt",
    style: {
      fontSize: 'var(--ak-t-17)',
      marginTop: 4
    }
  }, "01.09.2026"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--ak-r-3)'
    }
  }, /*#__PURE__*/React.createElement(Merkelapp, {
    variant: "junior"
  }, "U14")))), tom ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--ak-r-7)'
    }
  }, /*#__PURE__*/React.createElement(TomTilstand, {
    tittel: "Ingen m\xE5linger p\xE5 Emil enn\xE5",
    forklaring: "F\xF8rste kartleggings\xF8kt gir det f\xF8rste tallet. Fra da av har rapporten noe \xE5 sammenligne mot, og du ser fremgangen uten \xE5 sp\xF8rre.",
    handling: /*#__PURE__*/React.createElement(Knapp, null, "Book kartleggings\xF8kt")
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--ak-r-7)',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--ak-r-7)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Talleblokk, {
    etikett: "Dispersion, 7-jern",
    tall: "6,8",
    enhet: "m",
    storrelse: "xl",
    fremhevet: true,
    forklaring: "Hvor mye ballene spres sideveis. Lavere er bedre \u2014 Emil traff et 14,2 m bredt vindu i april.",
    kilde: "Trackman",
    dato: "18.08.2026",
    antall: 22
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ak-etikett"
  }, "Slik leser du tallet"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 'var(--ak-r-3)',
      fontSize: 'var(--ak-t-17)'
    }
  }, "Vi har ikke jobbet med \xE5 sl\xE5 hardere. Vi har jobbet med Face to Path \u2014 forholdet mellom hvor k\xF8llebladet peker og hvor k\xF8llehodet g\xE5r. Da samler ballene seg."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 'var(--ak-r-4)',
      fontSize: 'var(--ak-t-17)',
      color: 'var(--ak-dempet)'
    }
  }, "Begge m\xE5lingene er gjort med samme oppsett, samme k\xF8lle og samme ball. Ellers er sammenligningen verdil\xF8s."))), /*#__PURE__*/React.createElement(Faktarad, {
    style: {
      marginTop: 'var(--ak-r-7)'
    },
    kompakt: true,
    poster: [{
      etikett: 'Økter denne sesongen',
      verdi: '22',
      note: 'Registrert i AK Golf HQ'
    }, {
      etikett: 'Målinger',
      verdi: '86',
      note: 'Trackman'
    }, {
      etikett: 'Trinn på AK-stigen',
      verdi: '5 av 9',
      note: 'Vurdert 18.08.2026'
    }]
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      marginTop: 'var(--ak-r-8)',
      fontSize: 'var(--ak-t-26)'
    }
  }, "M\xE5lingene"), /*#__PURE__*/React.createElement(Tabell, {
    style: {
      marginTop: 'var(--ak-r-4)'
    },
    tekst: "Trackman \xB7 samme oppsett, k\xF8lle og ball i begge m\xE5leseriene",
    kolonner: [{
      noekkel: 'hva',
      tittel: 'Måling'
    }, {
      noekkel: 'april',
      tittel: 'April',
      maalt: true
    }, {
      noekkel: 'august',
      tittel: 'August',
      maalt: true
    }, {
      noekkel: 'status',
      tittel: 'Vurdering'
    }],
    rader: [{
      hva: 'Dispersion, 7-jern (m)',
      april: '14,2',
      august: '6,8',
      status: /*#__PURE__*/React.createElement(Status, {
        tilstand: "ok"
      }, "Som planlagt")
    }, {
      hva: 'Carry, 7-jern (m)',
      april: '118,6',
      august: '124,1',
      status: /*#__PURE__*/React.createElement(Status, {
        tilstand: "ok"
      }, "Som planlagt")
    }, {
      hva: 'Face to Path, 7-jern (°)',
      april: '+4,1',
      august: '+1,3',
      status: /*#__PURE__*/React.createElement(Status, {
        tilstand: "ok"
      }, "Som planlagt")
    }, {
      hva: 'Attack Angle, driver (°)',
      april: '−3,2',
      august: '−2,9',
      status: /*#__PURE__*/React.createElement(Status, {
        tilstand: "varsel"
      }, "F\xF8lges videre")
    }, {
      hva: 'Putting, 2 m (treff av 20)',
      april: '11',
      august: '13',
      status: /*#__PURE__*/React.createElement(Status, {
        tilstand: "varsel"
      }, "Neste periode")
    }]
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      marginTop: 'var(--ak-r-8)',
      fontSize: 'var(--ak-t-26)'
    }
  }, "Neste steg"), /*#__PURE__*/React.createElement(Liste, {
    style: {
      marginTop: 'var(--ak-r-4)'
    },
    poster: [{
      merke: 'Periode 3',
      tittel: 'Attack Angle med driver',
      note: 'Målet er −1,0° eller høyere. Måles i hver økt fram til 15.10.'
    }, {
      merke: 'Ukentlig',
      tittel: 'Putting innenfor to meter',
      note: '20 forsøk, samme sted, hver onsdag. Emil registrerer selv.'
    }, {
      merke: 'Trinn 6',
      tittel: 'Turneringsspill, to runder under 85',
      note: 'Kravet for neste trinn på AK-stigen.'
    }]
  }), /*#__PURE__*/React.createElement(Kort, {
    tyngde: 1,
    rutenett: true,
    style: {
      marginTop: 'var(--ak-r-7)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ak-etikett"
  }, "Slik er tallene laget"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 'var(--ak-r-3)',
      fontSize: 'var(--ak-t-15)',
      color: 'var(--ak-dempet)'
    }
  }, "Hvert tall i rapporten er et snitt av minst ti slag, m\xE5lt med Trackman i \xF8kt, med dato lagret i AK Golf HQ. Tall som er anslag, st\xE5r merket ESTIMAT. Vi runder aldri oppover.")), /*#__PURE__*/React.createElement("footer", {
    style: {
      marginTop: 'var(--ak-r-7)',
      borderTop: '1px solid var(--ak-linje)',
      paddingTop: 'var(--ak-r-5)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: 'var(--ak-r-5)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--ak-t-15)'
    }
  }, "Sp\xF8rsm\xE5l om rapporten? Svar p\xE5 e-posten den kom med."), /*#__PURE__*/React.createElement("p", {
    className: "ak-maalt",
    style: {
      fontSize: 'var(--ak-t-13)',
      color: 'var(--ak-dempet)',
      marginTop: 6
    }
  }, "Anders Kristiansen \xB7 post@akgolf.no \xB7 Neste m\xE5ling 15.10.2026")), /*#__PURE__*/React.createElement(Logo, {
    rot: "../../assets/logo/",
    hoyde: 28
  }))));
}
Object.assign(window, {
  Rapport
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/foreldrerapport/Rapport.jsx", error: String((e && e.message) || e) }); }

// ui_kits/kampanje/Kampanje.jsx
try { (() => {
const NS = window.AKGolfDesignsystem_3e5c85;
const {
  Logo,
  Navnelaas,
  Knapp,
  Kort,
  Felt,
  Velger,
  Avkrysning,
  Varsel,
  Talleblokk,
  Merkelapp,
  Instrumentflate
} = NS;
function KampanjeSide({
  mobil = false
}) {
  const [sendt, setSendt] = React.useState(false);
  const [alder, setAlder] = React.useState('');
  const [epost, setEpost] = React.useState('');
  const [erfaring, setErfaring] = React.useState('');
  const [gruppe, setGruppe] = React.useState('');
  const [samtykke, setSamtykke] = React.useState(false);
  const [feil, setFeil] = React.useState({});
  const send = () => {
    const f = {};
    if (!alder) f.alder = 'Skriv alderen til barnet. Vi bruker den til å finne riktig gruppe.';
    if (!epost.includes('@')) f.epost = 'Skriv e-postadressen med @ og domene.';
    setFeil(f);
    if (Object.keys(f).length === 0) setSendt(true);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: mobil ? '1fr' : '1fr 1fr',
      minHeight: mobil ? undefined : 900
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--ak-v-junior)',
      color: '#fff',
      padding: mobil ? 'var(--ak-r-6) var(--ak-r-4) var(--ak-r-8)' : 'var(--ak-r-8)'
    }
  }, /*#__PURE__*/React.createElement(Navnelaas, {
    variant: "junior-academy",
    paaMorkt: true,
    hoyde: mobil ? 26 : 32,
    rot: "../../assets/logo/"
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      marginTop: mobil ? 'var(--ak-r-7)' : 'var(--ak-r-9)',
      color: '#fff',
      fontSize: mobil ? 'var(--ak-t-48)' : 'var(--ak-t-72)',
      lineHeight: 'var(--ak-lh-display)',
      letterSpacing: 'var(--ak-sp-display)'
    }
  }, "Juniorgruppene starter 1. mai."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 'var(--ak-r-5)',
      fontSize: 'var(--ak-t-21)',
      color: 'rgba(255,255,255,.94)',
      maxWidth: '38ch'
    }
  }, "Vi har plass i U10 og U14. Send alder og litt om erfaringen, s\xE5 finner vi riktig gruppe."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 'var(--ak-r-4)',
      fontSize: 'var(--ak-t-17)',
      color: 'rgba(255,255,255,.86)',
      maxWidth: '42ch'
    }
  }, "Barnet ditt skal vite hva det jobber med. AK-stigen tar spilleren fra f\xF8rste golfskole til turneringsspill, i trinn med navn \u2014 og du ser hvilket trinn barnet st\xE5r p\xE5."), /*#__PURE__*/React.createElement("img", {
    src: "../../assets/foto/ak-golf-35.webp",
    alt: "Ball i gresset p\xE5 et treningsfelt, lav kameravinkel mot bl\xE5 himmel",
    style: {
      width: '100%',
      height: mobil ? 200 : 280,
      objectFit: 'cover',
      borderRadius: 'var(--ak-hjorne-md)',
      marginTop: 'var(--ak-r-7)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--ak-r-6)',
      display: 'flex',
      gap: 'var(--ak-r-6)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ak-etikett",
    style: {
      color: 'rgba(255,255,255,.78)'
    }
  }, "Oppstart"), /*#__PURE__*/React.createElement("div", {
    className: "ak-maalt",
    style: {
      fontSize: 'var(--ak-t-26)',
      marginTop: 4
    }
  }, "01.05.2027")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ak-etikett",
    style: {
      color: 'rgba(255,255,255,.78)'
    }
  }, "Ledige plasser"), /*#__PURE__*/React.createElement("div", {
    className: "ak-maalt",
    style: {
      fontSize: 'var(--ak-t-26)',
      marginTop: 4
    }
  }, "U10: 6 \xB7 U14: 4")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "ak-etikett",
    style: {
      color: 'rgba(255,255,255,.78)'
    }
  }, "Svar innen"), /*#__PURE__*/React.createElement("div", {
    className: "ak-maalt",
    style: {
      fontSize: 'var(--ak-t-26)',
      marginTop: 4
    }
  }, "1 virkedag")))), /*#__PURE__*/React.createElement(Instrumentflate, {
    som: "div",
    tett: true,
    style: {
      padding: mobil ? 'var(--ak-r-7) var(--ak-r-4)' : 'var(--ak-r-8)',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Kort, {
    tyngde: 3,
    style: {
      width: '100%',
      maxWidth: 520,
      margin: '0 auto',
      padding: mobil ? 'var(--ak-r-5)' : 'var(--ak-r-6)'
    }
  }, sendt ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--ak-r-4)'
    }
  }, /*#__PURE__*/React.createElement(Varsel, {
    tilstand: "ok",
    tittel: "Vi har f\xE5tt meldinga di."
  }, "Du f\xE5r svar innen \xE9n virkedag. Vi tar en samtale f\xF8r oppstart og finner riktig gruppe sammen."), /*#__PURE__*/React.createElement(Knapp, {
    variant: "tekst",
    onClick: () => setSendt(false)
  }, "Send en ny p\xE5melding")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    className: "ak-etikett"
  }, "Meld interesse"), /*#__PURE__*/React.createElement("h2", {
    style: {
      marginTop: 'var(--ak-r-2)',
      fontSize: 'var(--ak-t-34)'
    }
  }, "Fire felter. Ikke mer."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--ak-r-5)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--ak-r-4)'
    }
  }, /*#__PURE__*/React.createElement(Felt, {
    merkelapp: "Barnets alder",
    type: "number",
    enhet: "\xE5r",
    paakrevd: true,
    verdi: alder,
    onEndre: setAlder,
    feil: feil.alder,
    hjelp: feil.alder ? undefined : 'Vi bruker alderen til å finne riktig gruppe.'
  }), /*#__PURE__*/React.createElement(Felt, {
    merkelapp: "Din e-post",
    type: "email",
    paakrevd: true,
    verdi: epost,
    onEndre: setEpost,
    feil: feil.epost
  }), /*#__PURE__*/React.createElement(Velger, {
    merkelapp: "\xD8nsket gruppe",
    verdi: gruppe,
    onEndre: setGruppe,
    plassholder: "Vi foresl\xE5r gjerne",
    valg: [{
      verdi: 'u10',
      tekst: 'U10 — 6 plasser'
    }, {
      verdi: 'u14',
      tekst: 'U14 — 4 plasser'
    }, {
      verdi: 'vet-ikke',
      tekst: 'Vet ikke ennå'
    }]
  }), /*#__PURE__*/React.createElement(Felt, {
    merkelapp: "Litt om erfaringen",
    flerlinje: true,
    verdi: erfaring,
    onEndre: setErfaring,
    plassholder: "Har spilt golfskole to somrer, sl\xE5r mest p\xE5 rangen."
  }), /*#__PURE__*/React.createElement(Avkrysning, {
    avkrysset: samtykke,
    onEndre: setSamtykke,
    merkelapp: "Jeg samtykker til at bilder av barnet mitt kan brukes i AK Golfs materiell.",
    hjelp: "Samtykket er skriftlig og kan trekkes tilbake n\xE5r som helst."
  }), /*#__PURE__*/React.createElement(Knapp, {
    storrelse: "lg",
    fullBredde: true,
    onClick: send
  }, "Meld interesse"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--ak-t-13)',
      color: 'var(--ak-dempet)'
    }
  }, "Gruppene settes etter alder og erfaring, ikke etter hvem som meldte seg f\xF8rst."))))));
}
Object.assign(window, {
  KampanjeSide
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/kampanje/Kampanje.jsx", error: String((e && e.message) || e) }); }

// ui_kits/markedsside/Deler.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const NS = window.AKGolfDesignsystem_3e5c85;
const {
  Logo,
  Knapp,
  Kort,
  Fotokort,
  Talleblokk,
  Faktarad,
  Instrumentflate,
  Merkelapp,
  Akkordeon,
  Toppnav,
  Mobilmeny
} = NS;
const LOGOROT = '../../assets/logo/';
const FOTO = '../../assets/foto/';
const LENKER = [{
  href: '/coaching',
  tekst: 'Coaching'
}, {
  href: '/junior',
  tekst: 'Junior'
}, {
  href: '/priser',
  tekst: 'Priser'
}, {
  href: '/om-oss',
  tekst: 'Om oss'
}, {
  href: '/kontakt',
  tekst: 'Kontakt'
}];
function Seksjon({
  senket,
  children,
  mobil,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("section", _extends({}, rest, {
    style: {
      background: senket ? 'var(--ak-grunn-senk)' : 'transparent',
      padding: (mobil ? 'var(--ak-r-9)' : 'var(--ak-r-10)') + ' 0',
      ...style
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--ak-sidebredde)',
      margin: '0 auto',
      padding: mobil ? '0 var(--ak-r-4)' : '0 var(--ak-r-6)'
    }
  }, children));
}
function Hero({
  mobil
}) {
  return /*#__PURE__*/React.createElement(Instrumentflate, {
    som: "div",
    tett: mobil,
    style: {
      borderBottom: '1px solid var(--ak-linje)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--ak-sidebredde)',
      margin: '0 auto',
      padding: mobil ? 'var(--ak-r-8) var(--ak-r-4) var(--ak-r-9)' : 'var(--ak-r-9) var(--ak-r-6) var(--ak-r-10)'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: mobil ? 'var(--ak-t-72)' : 'var(--ak-t-112)',
      lineHeight: 'var(--ak-lh-display)',
      letterSpacing: 'var(--ak-sp-display)',
      textTransform: 'uppercase',
      maxWidth: mobil ? undefined : '15ch'
    }
  }, "Uansett hvor du st\xE5r, vet du hva du trener p\xE5."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--ak-t-21)',
      color: 'var(--ak-tekst)',
      marginTop: mobil ? 'var(--ak-r-5)' : 'var(--ak-r-6)',
      maxWidth: '54ch'
    }
  }, "Vi m\xE5ler svingen din, tallene dine og spillet ditt. S\xE5 f\xE5r du en plan som holder mellom \xF8ktene \u2014 og oppf\xF8lging som gj\xF8r at den faktisk blir fulgt."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--ak-r-6)',
      display: 'flex',
      gap: 'var(--ak-r-4)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Knapp, {
    storrelse: "lg",
    fullBredde: mobil
  }, "Book kartleggings\xF8kt")), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 'var(--ak-r-5)',
      fontSize: 'var(--ak-t-15)',
      color: 'var(--ak-dempet)',
      maxWidth: '52ch'
    }
  }, "F\xF8rste \xF8kt er 90 minutter, til vanlig timepris. Vi kartlegger hvor du st\xE5r, og du g\xE5r derfra med en skriftlig plan.")));
}
function Bilde({
  mobil
}) {
  return /*#__PURE__*/React.createElement("figure", {
    style: {
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: FOTO + 'ak-golf-01.webp',
    alt: "Spiller sl\xE5r, coach f\xF8lger m\xE5lingen p\xE5 Trackman bak",
    style: {
      width: '100%',
      height: mobil ? 260 : 480,
      objectFit: 'cover',
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("figcaption", {
    style: {
      maxWidth: 'var(--ak-sidebredde)',
      margin: '0 auto',
      padding: mobil ? 'var(--ak-r-3) var(--ak-r-4)' : 'var(--ak-r-3) var(--ak-r-6)',
      fontSize: 'var(--ak-t-13)',
      color: 'var(--ak-dempet)',
      display: 'flex',
      gap: 'var(--ak-r-3)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Trackman st\xE5r i hver \xF8kt. Det er der planen begynner."), /*#__PURE__*/React.createElement("span", {
    className: "ak-maalt",
    style: {
      color: 'var(--ak-svak)'
    }
  }, "Foto #1")));
}
function Problemet({
  mobil
}) {
  return /*#__PURE__*/React.createElement(Seksjon, {
    senket: true,
    mobil: mobil
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: mobil ? 'var(--ak-t-34)' : 'var(--ak-t-48)',
      letterSpacing: 'var(--ak-sp-display)',
      lineHeight: 'var(--ak-lh-display)',
      maxWidth: '24ch'
    }
  }, "De fleste vet ikke hva de trener p\xE5."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: mobil ? 'var(--ak-r-5)' : 'var(--ak-r-6)',
      fontSize: 'var(--ak-t-17)',
      maxWidth: '58ch'
    }
  }, "Ikke fordi de er late. Fordi ingen har m\xE5lt. Du sl\xE5r en b\xF8tte baller, det f\xF8les bedre eller verre, og neste uke starter du p\xE5 nytt. Det er ikke trening \u2014 det er h\xE5p."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--ak-r-7)',
      display: 'grid',
      gridTemplateColumns: mobil ? '1fr' : 'repeat(3, 1fr)',
      gap: mobil ? 'var(--ak-r-4)' : 'var(--ak-r-5)'
    }
  }, [{
    t: 'Timen hos proffen',
    b: 'Slutter når timen slutter. Neste gang begynner på nytt, ofte med et nytt fokus.'
  }, {
    t: 'Å lære av video',
    b: 'Uendelig med råd, null diagnose. Du vet ikke hvilket av tusen råd som gjelder deg.'
  }, {
    t: 'En app uten coach',
    b: 'Registrerer hva du gjorde. Sier ingenting om hva du burde gjort.'
  }].map(k => /*#__PURE__*/React.createElement(Kort, {
    key: k.t,
    tyngde: 1
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: 'var(--ak-t-21)'
    }
  }, k.t), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 'var(--ak-r-3)',
      fontSize: 'var(--ak-t-15)',
      color: 'var(--ak-dempet)'
    }
  }, k.b)))));
}
function Losningen({
  mobil
}) {
  return /*#__PURE__*/React.createElement(Seksjon, {
    mobil: mobil
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: mobil ? '1fr' : '1fr 1fr',
      gap: mobil ? 'var(--ak-r-6)' : 'var(--ak-r-8)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ak-etikett"
  }, "Slik jobber vi"), /*#__PURE__*/React.createElement("h2", {
    style: {
      marginTop: 'var(--ak-r-3)',
      fontSize: mobil ? 'var(--ak-t-34)' : 'var(--ak-t-48)',
      letterSpacing: 'var(--ak-sp-display)',
      lineHeight: 'var(--ak-lh-display)'
    }
  }, "Vi begynner med et tall."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 'var(--ak-r-5)',
      fontSize: 'var(--ak-t-17)'
    }
  }, "Trackman m\xE5ler hva k\xF8llehodet faktisk gj\xF8r. Testbatteriet viser hvor du st\xE5r i forhold til deg selv sist. Deretter legger vi planen \u2014 og den ligger i appen, s\xE5 du vet hva onsdags\xF8kta skal inneholde."), /*#__PURE__*/React.createElement(Faktarad, {
    style: {
      marginTop: 'var(--ak-r-6)'
    },
    kompakt: true,
    poster: [{
      etikett: 'Testprotokoller',
      verdi: '20'
    }, {
      etikett: 'Posisjoner i svingen',
      verdi: 'P1–P10'
    }, {
      etikett: 'Trackman i hver økt',
      verdi: '100',
      enhet: '%'
    }]
  })), /*#__PURE__*/React.createElement(Fotokort, {
    bilde: FOTO + 'ak-golf-09.webp',
    alt: "Coach og spiller ser p\xE5 Trackman-skjermen sammen",
    bildetekst: "M\xE5lingen tolkes i \xF8kta, ikke i etterkant.",
    kilde: "Foto #9",
    forhold: "4 / 3"
  })));
}
function Tallet({
  mobil
}) {
  return /*#__PURE__*/React.createElement(Seksjon, {
    mobil: mobil,
    senket: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: mobil ? '1fr' : '1fr 1fr',
      gap: mobil ? 'var(--ak-r-6)' : 'var(--ak-r-8)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Talleblokk, {
    etikett: "Carry, driver",
    tall: "+12,4",
    enhet: "m",
    storrelse: mobil ? 'lg' : 'xl',
    fremhevet: true,
    forklaring: "Vi endret ikke svingen f\xF8rst. Vi m\xE5lte i seks \xF8kter, fant at Attack Angle var problemet, og jobbet bare med den.",
    kilde: "Trackman",
    dato: "12.05\u201318.08.2026",
    antall: 38
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--ak-t-26)'
    }
  }, "Slik leser du tallet"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 'var(--ak-r-4)',
      fontSize: 'var(--ak-t-17)',
      color: 'var(--ak-dempet)'
    }
  }, "Attack Angle beskriver om k\xF8llehodet g\xE5r opp eller ned i treffet. G\xE5r det nedover med driver, f\xE5r du h\xF8y Spin Rate og lav Launch Angle \u2014 du taper lengde uten \xE5 sl\xE5 svakere."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 'var(--ak-r-4)',
      fontSize: 'var(--ak-t-17)',
      color: 'var(--ak-dempet)'
    }
  }, "Du kjenner det ikke. Det er derfor vi m\xE5ler det."))));
}
function Junior({
  mobil
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--ak-v-junior)',
      color: '#FFFFFF'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--ak-sidebredde)',
      margin: '0 auto',
      padding: mobil ? 'var(--ak-r-9) var(--ak-r-4)' : 'var(--ak-r-10) var(--ak-r-6)',
      display: 'grid',
      gridTemplateColumns: mobil ? '1fr' : '1.1fr 1fr',
      gap: mobil ? 'var(--ak-r-6)' : 'var(--ak-r-8)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    className: "ak-etikett",
    style: {
      color: 'rgba(255,255,255,.78)'
    }
  }, "Junior Academy"), /*#__PURE__*/React.createElement("h2", {
    style: {
      marginTop: 'var(--ak-r-3)',
      fontSize: mobil ? 'var(--ak-t-34)' : 'var(--ak-t-48)',
      letterSpacing: 'var(--ak-sp-display)',
      lineHeight: 'var(--ak-lh-display)',
      color: '#fff'
    }
  }, "Barnet ditt skal vite hva det jobber med."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 'var(--ak-r-5)',
      fontSize: 'var(--ak-t-17)',
      color: 'rgba(255,255,255,.92)'
    }
  }, "AK Golf Junior Academy tar spilleren fra f\xF8rste golfskole til turneringsspill, i trinn med navn. Du ser hvilket trinn barnet st\xE5r p\xE5, og hva som skal til for det neste."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--ak-r-6)'
    }
  }, /*#__PURE__*/React.createElement(Knapp, {
    variant: "sekundaer",
    fullBredde: mobil,
    style: {
      borderColor: 'rgba(255,255,255,.6)',
      color: '#fff',
      background: 'transparent'
    }
  }, "Meld interesse"))), /*#__PURE__*/React.createElement("img", {
    src: FOTO + 'ak-golf-35.webp',
    alt: "Ball i gresset p\xE5 et treningsfelt, lav kameravinkel mot bl\xE5 himmel",
    style: {
      width: '100%',
      height: mobil ? 220 : 320,
      objectFit: 'cover',
      borderRadius: 'var(--ak-hjorne-md)'
    }
  })));
}
function Sporsmal({
  mobil
}) {
  return /*#__PURE__*/React.createElement(Seksjon, {
    mobil: mobil
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: mobil ? 'var(--ak-t-26)' : 'var(--ak-t-34)'
    }
  }, "Det foreldre sp\xF8r om"), /*#__PURE__*/React.createElement(Akkordeon, {
    style: {
      marginTop: 'var(--ak-r-5)',
      maxWidth: 760
    },
    apenIndeks: 0,
    poster: [{
      tittel: 'Hva koster kartleggingsøkta?',
      innhold: '90 minutter til vanlig timepris. Du går derfra med en skriftlig plan. Ingen binding etterpå.'
    }, {
      tittel: 'Må barnet ha eget utstyr?',
      innhold: 'Nei. Vi har køller til lån i alle gruppene til og med U12.'
    }, {
      tittel: 'Hva koster appen?',
      innhold: 'Testbatteriet, statistikken og verktøyene er gratis, uten utløpsdato. Resten av appen koster 299 kr i måneden. Har du coaching-pakke, følger appen med.'
    }, {
      tittel: 'Hvordan settes gruppene?',
      innhold: 'Etter alder og erfaring, ikke etter hvem som meldte seg først. Vi finner riktig gruppe i en samtale før oppstart.'
    }]
  }));
}
function Avslutning({
  mobil
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: FOTO + 'ak-golf-28.webp',
    alt: "Spiller p\xE5 green mot m\xF8rk bakgrunn",
    style: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(to top, rgba(20,20,19,.9) 0%, rgba(20,20,19,.66) 44%, rgba(20,20,19,.34) 100%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxWidth: 'var(--ak-sidebredde)',
      margin: '0 auto',
      padding: mobil ? 'var(--ak-r-9) var(--ak-r-4)' : 'var(--ak-r-10) var(--ak-r-6)'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: mobil ? 'var(--ak-t-34)' : 'var(--ak-t-48)',
      letterSpacing: 'var(--ak-sp-display)',
      lineHeight: 'var(--ak-lh-display)',
      color: '#fff',
      maxWidth: '22ch'
    }
  }, "Klar for \xE5 finne ut hvor du faktisk st\xE5r?"), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 'var(--ak-r-4)',
      fontSize: 'var(--ak-t-21)',
      color: 'rgba(255,255,255,.92)'
    }
  }, "90 minutter, vanlig timepris. Du g\xE5r derfra med en plan."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--ak-r-6)'
    }
  }, /*#__PURE__*/React.createElement(Knapp, {
    storrelse: "lg",
    fullBredde: mobil
  }, "Book kartleggings\xF8kt"))));
}
function Bunn({
  mobil
}) {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: '1px solid var(--ak-linje)',
      background: 'var(--ak-grunn)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--ak-sidebredde)',
      margin: '0 auto',
      padding: mobil ? 'var(--ak-r-6) var(--ak-r-4)' : 'var(--ak-r-7) var(--ak-r-6)',
      display: 'grid',
      gridTemplateColumns: mobil ? '1fr' : '1.4fr 1fr 1fr',
      gap: 'var(--ak-r-6)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Logo, {
    rot: LOGOROT,
    hoyde: 32
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 'var(--ak-r-4)',
      fontSize: 'var(--ak-t-15)',
      color: 'var(--ak-dempet)',
      maxWidth: '34ch'
    }
  }, "AK Golf Academy drives av Anders Kristiansen \u2014 golfcoach, sportssjef i Gamle Fredrikstad Golfklubb og coach ved WANG Toppidrett Fredrikstad."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--ak-r-4)',
      display: 'flex',
      gap: 'var(--ak-r-2)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Merkelapp, {
    variant: "junior"
  }, "Junior Academy"), /*#__PURE__*/React.createElement(Merkelapp, {
    variant: "hq"
  }, "AK Golf HQ"), /*#__PURE__*/React.createElement(Merkelapp, {
    variant: "produkt"
  }, "Skarpnord"))), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--ak-r-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ak-etikett"
  }, "Tilbud"), ['Coaching', 'Junior Academy', 'Priser', 'Kontakt'].map(t => /*#__PURE__*/React.createElement("a", {
    key: t,
    href: "#",
    style: {
      fontSize: 'var(--ak-t-15)',
      color: 'var(--ak-tekst)',
      textDecoration: 'none'
    }
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--ak-r-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ak-etikett"
  }, "Kontakt"), /*#__PURE__*/React.createElement("span", {
    className: "ak-maalt",
    style: {
      fontSize: 'var(--ak-t-15)'
    }
  }, "post@akgolf.no"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--ak-t-15)',
      color: 'var(--ak-dempet)'
    }
  }, "Vi svarer innen \xE9n virkedag."), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--ak-t-13)',
      color: 'var(--ak-svak)'
    }
  }, "Gamle Fredrikstad GK, Fredrikstad"))));
}
function Markedsside({
  mobil = false
}) {
  const [meny, setMeny] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      background: 'var(--ak-grunn)',
      minHeight: '100%'
    }
  }, /*#__PURE__*/React.createElement(Toppnav, {
    mobil: mobil,
    logoRot: LOGOROT,
    aktiv: "/",
    lenker: LENKER,
    onMeny: () => setMeny(true),
    handling: /*#__PURE__*/React.createElement(Knapp, {
      storrelse: "sm"
    }, "Book kartleggings\xF8kt")
  }), /*#__PURE__*/React.createElement(Hero, {
    mobil: mobil
  }), /*#__PURE__*/React.createElement(Bilde, {
    mobil: mobil
  }), /*#__PURE__*/React.createElement(Problemet, {
    mobil: mobil
  }), /*#__PURE__*/React.createElement(Losningen, {
    mobil: mobil
  }), /*#__PURE__*/React.createElement(Tallet, {
    mobil: mobil
  }), /*#__PURE__*/React.createElement(Junior, {
    mobil: mobil
  }), /*#__PURE__*/React.createElement(Sporsmal, {
    mobil: mobil
  }), /*#__PURE__*/React.createElement(Avslutning, {
    mobil: mobil
  }), /*#__PURE__*/React.createElement(Bunn, {
    mobil: mobil
  }), /*#__PURE__*/React.createElement(Mobilmeny, {
    apen: meny,
    onLukk: () => setMeny(false),
    aktiv: "/",
    lenker: LENKER,
    logoRot: LOGOROT,
    handling: /*#__PURE__*/React.createElement(Knapp, {
      fullBredde: true,
      storrelse: "lg"
    }, "Book kartleggings\xF8kt")
  }));
}
Object.assign(window, {
  Markedsside,
  Seksjon,
  LENKER,
  LOGOROT,
  FOTO
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/markedsside/Deler.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Akkordeon = __ds_scope.Akkordeon;

__ds_ns.Fotokort = __ds_scope.Fotokort;

__ds_ns.Kort = __ds_scope.Kort;

__ds_ns.IkonKnapp = __ds_scope.IkonKnapp;

__ds_ns.Knapp = __ds_scope.Knapp;

__ds_ns.Paginering = __ds_scope.Paginering;

__ds_ns.Faktarad = __ds_scope.Faktarad;

__ds_ns.Liste = __ds_scope.Liste;

__ds_ns.Tabell = __ds_scope.Tabell;

__ds_ns.Talleblokk = __ds_scope.Talleblokk;

__ds_ns.Merkelapp = __ds_scope.Merkelapp;

__ds_ns.Status = __ds_scope.Status;

__ds_ns.TomTilstand = __ds_scope.TomTilstand;

__ds_ns.Varsel = __ds_scope.Varsel;

__ds_ns.Instrumentflate = __ds_scope.Instrumentflate;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Maalestokk = __ds_scope.Maalestokk;

__ds_ns.Navnelaas = __ds_scope.Navnelaas;

__ds_ns.Brodsmuler = __ds_scope.Brodsmuler;

__ds_ns.Faner = __ds_scope.Faner;

__ds_ns.Mobilmeny = __ds_scope.Mobilmeny;

__ds_ns.Toppnav = __ds_scope.Toppnav;

__ds_ns.Avkrysning = __ds_scope.Avkrysning;

__ds_ns.Felt = __ds_scope.Felt;

__ds_ns.Radiogruppe = __ds_scope.Radiogruppe;

__ds_ns.Velger = __ds_scope.Velger;

})();
