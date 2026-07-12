// FASIT-REFERANSE (ekstrahert fra Claude Design offline-eksport 2026-07-12)
// Original sti: ui_kits/agencyos/workbench-data.js
// KUN referanse for v2-ombygging — importeres ALDRI av appen.

try { (() => {
/* AK Golf HQ — Workbench data, tokens & CANON validation (plain JS, no JSX). */
(function () {
  /* ── Design-tokens — tema-matriser (mørk default + lys) ───
     Verdiene SPEILER tokens/colors.css + tokens/data-viz.css (kanon).
     AgencyOS-apper leser T/AX/AX_TEXT/AX_SOFT som properties ved render,
     så applyTheme() muterer disse objektene IN-PLACE → alle inline-styles
     flipper uten remount. var(--)-baserte DS-komponenter flipper via
     .light/.dark på roten (settes av applyTheme).
     Lys-kanon (rev. lime-utvidelsen 6. jul 2026): interaktivt signal arver
     forest #005840 (T.lime→forest på lys — lime-TEKST/-ikon/-outline forbudt der).
     Data-bundet lime-FYLL m/ mørk blekk er derimot tillatt i BEGGE temaer via
     T.signalFill/T.onSignalFill + obligatorisk 1px T.signalFillEdge på lys
     (transparent på mørk) — speiler --signal-fill-tokenene. SPILL beholder
     lime-FYLL som markør, men får mørk oliven TEKST #55680A (aldri lime-tekst
     på lys). Derfor er AX (markør) og AX_TEXT (etikett) skilt.
     NB: mørk-matrisen er byte-identisk med tidligere hardkodede verdier —
     standalone dsCard-visning (uten ?theme) er uendret. */
  const THEME = {
    dark: {
      T: {
        base: '#060706',
        card: '#171817',
        raised: '#1E1F1D',
        border: '#262725',
        fg: '#F0F0F0',
        muted: '#A6A8A3',
        lime: '#D1F843',
        forest: '#005840',
        amber: '#DDB870',
        red: '#F8A59B',
        redSolid: '#E5484D',
        signalFill: '#D1F843',
        onSignalFill: '#0A0B0A',
        signalFillEdge: 'transparent'
      },
      AX: {
        FYS: '#56C59A',
        TEK: '#E8A33D',
        SLAG: '#84A9FF',
        SPILL: '#D1F843',
        TURN: '#F2908C'
      },
      AX_TEXT: {
        FYS: '#74D0AC',
        TEK: '#EEB965',
        SLAG: '#9EBCFF',
        SPILL: '#D1F843',
        TURN: '#F5A8A4'
      },
      AX_SOFT: {
        FYS: 'rgba(86,197,154,.16)',
        TEK: 'rgba(232,163,61,.16)',
        SLAG: 'rgba(132,169,255,.16)',
        SPILL: 'rgba(209,248,67,.18)',
        TURN: 'rgba(242,144,140,.16)'
      }
    },
    light: {
      T: {
        base: '#F7F7F4',
        card: '#FFFFFF',
        raised: '#F1F1EF',
        border: '#E4E5E2',
        fg: '#101613',
        muted: '#6E706C',
        lime: '#005840',
        forest: '#005840',
        amber: '#855100',
        red: '#A1302B',
        redSolid: '#C0392F',
        signalFill: '#D1F843',
        onSignalFill: '#101613',
        signalFillEdge: 'rgba(0,0,0,0.14)'
      },
      AX: {
        FYS: '#005840',
        TEK: '#B8852A',
        SLAG: '#2563EB',
        SPILL: '#D1F843',
        TURN: '#A32D2D'
      },
      AX_TEXT: {
        FYS: '#005840',
        TEK: '#8A6316',
        SLAG: '#1D4FD0',
        SPILL: '#55680A',
        TURN: '#A32D2D'
      },
      AX_SOFT: {
        FYS: 'rgba(0,88,64,.13)',
        TEK: 'rgba(184,133,42,.13)',
        SLAG: 'rgba(37,99,235,.13)',
        SPILL: 'rgba(209,248,67,.22)',
        TURN: 'rgba(163,45,45,.13)'
      }
    }
  };
  /* Live, muterbare token-objekter (start mørk). applyTheme() flipper dem. */
  const T = Object.assign({}, THEME.dark.T);
  const AX = Object.assign({}, THEME.dark.AX);
  const AX_TEXT = Object.assign({}, THEME.dark.AX_TEXT);
  const AX_SOFT = Object.assign({}, THEME.dark.AX_SOFT);
  function applyTheme(theme, root) {
    var name = theme === 'light' ? 'light' : 'dark';
    var m = THEME[name];
    Object.assign(T, m.T);
    Object.assign(AX, m.AX);
    Object.assign(AX_TEXT, m.AX_TEXT);
    Object.assign(AX_SOFT, m.AX_SOFT);
    if (typeof document !== 'undefined') {
      var el = root || document.documentElement;
      el.classList.remove('light', 'dark');
      el.classList.add(name);
      el.setAttribute('data-theme', name);
      el.style.colorScheme = name;
      if (document.body) document.body.style.background = m.T.base;
    }
    return name;
  }
  /* Modul-iframes: shell legger ?theme=light/dark på iframe-src. Les den ved
     load (FØR app-render) så T er riktig når appen leser property. Uten ?theme
     (shell-siden selv, eller standalone dsCard) følges lagret valg → ingen
     m\u00f8rk-til-lys-flash ved reload; faller til m\u00f8rk hvis intet er lagret. */
  function themeFromUrl() {
    try {
      var q = new URLSearchParams(location.search).get('theme');
      if (q === 'light' || q === 'dark') return q;
      var s = localStorage.getItem('ak-agencyos-theme');
      if (s === 'light' || s === 'dark') return s;
      if (s === 'system' && window.matchMedia) return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {}
    return 'dark';
  }
  /* Guard (6. jul 2026): fila sveipes inn i _ds_bundle.js — topp-nivå DOM-side-
     effekter (tema-init: .dark på <html>, body-bakgrunn, color-scheme) skal KUN
     kjøre når fila lastes direkte som <script src>, aldri fra bundle-kopien
     (ellers males alle bundle-konsumenter mørke — jf. CLAUDE.md Bundle-hygiene). */
  if (typeof document !== 'undefined') {
    var __cur = document.currentScript;
    if (!__cur || !/_ds_bundle/.test(__cur.src || '')) applyTheme(themeFromUrl());
  }

  /* ── AK-formelen — de 6 aksene (§5) ─────────────────────── */
  const AKFORMEL = [{
    key: 'pyramidArea',
    label: 'Pyramide',
    values: ['FYS', 'TEK', 'SLAG', 'SPILL', 'TURN']
  }, {
    key: 'lFase',
    label: 'Læringstrinn',
    values: ['L_KROPP', 'L_ARM', 'L_KOLLE', 'L_BALL', 'L_AUTO']
  }, {
    key: 'miljo',
    label: 'Situasjon',
    values: ['M0', 'M1', 'M2', 'M3', 'M4', 'M5']
  }, {
    key: 'csNivaa',
    label: 'Køllehastighet',
    values: ['CS50', 'CS60', 'CS70', 'CS80', 'CS90', 'CS100']
  }, {
    key: 'pressureLevel',
    label: 'Press',
    values: ['PR1', 'PR2', 'PR3', 'PR4', 'PR5']
  }, {
    key: 'pPosisjoner',
    label: 'P-posisjon',
    values: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10'],
    multi: true
  }];

  /* ── DrillModus (kanon §7): pyramide-området avleder FYS | GOLF. ──────
     FYS-økter (fysisk) bruker FYS-treningstype (styrke/kondisjon/…), IKKE
     køllehastighet (CS = golf-svinghastighet, kun GOLF-drills). De 5 kanoniske
     FYS_TRENINGSTYPER: Styrke · Bevegelighet · Kondisjon · Mobilitet · Aktivering. */
  const FYS_TYPER = ['Styrke', 'Bevegelighet', 'Kondisjon', 'Mobilitet', 'Aktivering'];
  function drillModus(area) {
    return area === 'FYS' ? 'FYS' : 'GOLF';
  }
  /* Sekundær formel-kode for øktvisning: FYS → treningstype, GOLF → CS-nivå.
     Dette er «viser riktig på neste planlegging» — en fysisk økt viser aldri CS. */
  function formelSekundaer(s) {
    if (!s) return '';
    return s.pyramidArea === 'FYS' ? s.fysType || 'Styrke' : s.csNivaa || '';
  }

  /* ── Plan-økter (kanon: TrainingPlanSession) ────────────── */
  const SESSIONS = [{
    id: 1,
    day: 0,
    sH: 9,
    dH: 1.5,
    title: 'Styrke & mobilitet',
    axis: 'FYS',
    loc: 'Mulligan',
    done: true,
    cs: 60,
    pyramidArea: 'FYS',
    lFase: 'L_KROPP',
    miljo: 'M0',
    csNivaa: 'CS50',
    fysType: 'Styrke',
    pressureLevel: 'PR1',
    pPosisjoner: [],
    drills: ['Hip-hinge', 'Rotasjon']
  }, {
    id: 2,
    day: 0,
    sH: 16,
    dH: 1,
    title: 'Putting-drill',
    axis: 'SLAG',
    loc: 'GFGK',
    done: true,
    cs: 70,
    pyramidArea: 'SLAG',
    lFase: 'L_BALL',
    miljo: 'M2',
    csNivaa: 'CS50',
    pressureLevel: 'PR2',
    pPosisjoner: ['P8'],
    drills: ['Gate-drill']
  }, {
    id: 3,
    day: 1,
    sH: 9,
    dH: 1,
    title: 'Teknikk-drill',
    axis: 'TEK',
    loc: 'GFGK',
    done: true,
    cs: 50,
    pyramidArea: 'TEK',
    lFase: 'L_AUTO',
    miljo: 'M1',
    csNivaa: 'CS60',
    pressureLevel: 'PR1',
    pPosisjoner: ['P5', 'P6'],
    drills: ['Face-to-path']
  }, {
    id: 4,
    day: 3,
    sH: 9,
    dH: 1.5,
    title: 'Styrke',
    axis: 'FYS',
    loc: 'Mulligan',
    done: true,
    cs: 60,
    pyramidArea: 'FYS',
    lFase: 'L_KROPP',
    miljo: 'M0',
    csNivaa: 'CS50',
    fysType: 'Styrke',
    pressureLevel: 'PR1',
    pPosisjoner: [],
    drills: ['Hip-hinge']
  }, {
    id: 5,
    day: 3,
    sH: 16,
    dH: 1.5,
    title: 'Nærspill',
    axis: 'SLAG',
    loc: 'GFGK',
    done: false,
    cs: 70,
    pyramidArea: 'SLAG',
    lFase: 'L_BALL',
    miljo: 'M3',
    csNivaa: 'CS60',
    pressureLevel: 'PR3',
    pPosisjoner: ['P7', 'P8'],
    drills: ['Bunker-rake', 'Chip-ladder']
  }, {
    id: 6,
    day: 4,
    sH: 13,
    dH: 0.5,
    title: 'PEI-batteri',
    axis: 'TEK',
    loc: 'GFGK',
    done: false,
    cs: 50,
    pyramidArea: 'TEK',
    lFase: 'L_BALL',
    miljo: 'M2',
    csNivaa: 'CS90',
    pressureLevel: 'PR2',
    pPosisjoner: ['P5', 'P6'],
    drills: ['Impact bag', 'Face-to-path']
  }, {
    id: 7,
    day: 4,
    sH: 16,
    dH: 1,
    title: 'Putting-blokk',
    axis: 'SLAG',
    loc: 'GFGK',
    done: false,
    cs: 70,
    pyramidArea: 'SLAG',
    lFase: 'L_BALL',
    miljo: 'M2',
    csNivaa: 'CS50',
    pressureLevel: 'PR2',
    pPosisjoner: ['P8'],
    drills: ['Gate-drill']
  }, {
    id: 8,
    day: 5,
    sH: 9,
    dH: 4,
    title: 'Banespill — 18 hull',
    axis: 'SPILL',
    loc: 'GFGK',
    done: false,
    cs: 50,
    pyramidArea: 'SPILL',
    lFase: 'L_AUTO',
    miljo: 'M5',
    csNivaa: 'CS50',
    pressureLevel: 'PR4',
    pPosisjoner: ['P1', 'P10'],
    drills: ['18-hull scoring']
  }];
  const DAYS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
  const DATES = [16, 17, 18, 19, 20, 21, 22];
  const TODAY = 4;
  const ACWR = [.82, .84, .87, .90, .88, .85, .82, .88, .92, .95, 1.00, .98, .96, .94, .99, 1.03, 1.08, 1.12, 1.10, 1.07, 1.04, 1.09, 1.14, 1.18, 1.22, 1.20, 1.18, 1.15];
  /* ACWR forrige periode (samme vindu, 28 dager før) — stiplet sammenligning */
  const ACWR_PREV = [.78, .80, .83, .86, .84, .81, .79, .84, .88, .91, .95, .93, .90, .88, .92, .96, .99, 1.02, 1.00, .98, .96, 1.00, 1.04, 1.07, 1.10, 1.08, 1.06, 1.04];

  /* ── Strokes Gained — total mot baseline (12 uker), + sub-akser ── */
  const SG = [-1.8, -1.6, -1.5, -1.2, -1.3, -0.9, -0.6, -0.7, -0.3, 0.1, 0.4, 0.8];
  const SG_PREV = [-2.4, -2.3, -2.1, -2.0, -1.9, -1.8, -1.7, -1.5, -1.4, -1.3, -1.1, -1.0];
  /* Per-akse SG nå vs forrige (strokes gained mot egen baseline) */
  const SG_AXES = [{
    key: 'OTT',
    navn: 'Tee-slag',
    now: +0.6,
    prev: +0.2
  }, {
    key: 'APP',
    navn: 'Innspill',
    now: -0.9,
    prev: -1.4
  }, {
    key: 'ARG',
    navn: 'Nærspill',
    now: +0.3,
    prev: -0.1
  }, {
    key: 'PUTT',
    navn: 'Putting',
    now: +0.8,
    prev: +0.5
  }];

  /* ── KPI-strip — verdi + delta (retning styrer farge/pil) ─────── */
  /* dir: 'up' = forbedring (lime), 'down' = forverring (amber/rød) */
  const KPIS = [{
    key: 'okter',
    label: 'Økter · uke',
    value: '8',
    unit: null,
    delta: '+1',
    dir: 'up'
  }, {
    key: 'volum',
    label: 'Volum',
    value: '12,0',
    unit: 't',
    delta: '+1,5t',
    dir: 'down'
  }, {
    key: 'acwr',
    label: 'ACWR',
    value: '1,22',
    unit: null,
    delta: '+0,08',
    dir: 'down',
    warn: true
  }, {
    key: 'sg',
    label: 'SG · totalt',
    value: '+0,8',
    unit: null,
    delta: '+1,1',
    dir: 'up'
  }];

  /* ── Periode-inspektør (Årsplan-zoom) — per fase ──────────────── */
  /* målfordeling = pyramide-budsjett for perioden (sum 100) */
  const PERIODER = {
    Base: {
      uker: '1–8',
      ukerN: 8,
      fokus: 'Bygge fysisk fundament og bevegelseskvalitet.',
      budsjett: [{
        ax: 'FYS',
        pct: 40
      }, {
        ax: 'TEK',
        pct: 25
      }, {
        ax: 'SLAG',
        pct: 20
      }, {
        ax: 'SPILL',
        pct: 12
      }, {
        ax: 'TURN',
        pct: 3
      }],
      maal: [{
        t: 'Styrke-baseline +15%',
        ax: 'FYS'
      }, {
        t: 'Køllebane gjennom treff',
        ax: 'TEK'
      }],
      turn: [{
        w: 14,
        p: 'C',
        n: 'Sesongåpning'
      }]
    },
    Forberedelse: {
      uker: '9–18',
      ukerN: 10,
      fokus: 'Øke teknisk volum, koble slag mot bane.',
      budsjett: [{
        ax: 'FYS',
        pct: 25
      }, {
        ax: 'TEK',
        pct: 32
      }, {
        ax: 'SLAG',
        pct: 25
      }, {
        ax: 'SPILL',
        pct: 15
      }, {
        ax: 'TURN',
        pct: 3
      }],
      maal: [{
        t: 'Konsistent ballflukt — draw',
        ax: 'TEK'
      }, {
        t: 'Innspill 150–175 m',
        ax: 'SLAG'
      }],
      turn: []
    },
    Spesialisering: {
      uker: '19–31',
      ukerN: 13,
      fokus: 'Spisse banespill og konkurranseform.',
      budsjett: [{
        ax: 'FYS',
        pct: 18
      }, {
        ax: 'TEK',
        pct: 22
      }, {
        ax: 'SLAG',
        pct: 25
      }, {
        ax: 'SPILL',
        pct: 28
      }, {
        ax: 'TURN',
        pct: 7
      }],
      maal: [{
        t: 'Score-snitt under par-72',
        ax: 'SPILL'
      }, {
        t: 'Nærspill innenfor 8 m',
        ax: 'SLAG'
      }],
      turn: [{
        w: 24,
        p: 'B',
        n: 'Krets'
      }]
    },
    Nedtrapping: {
      uker: '32–36',
      ukerN: 5,
      fokus: 'Senke volum, holde skarphet før topp.',
      budsjett: [{
        ax: 'FYS',
        pct: 15
      }, {
        ax: 'TEK',
        pct: 15
      }, {
        ax: 'SLAG',
        pct: 25
      }, {
        ax: 'SPILL',
        pct: 35
      }, {
        ax: 'TURN',
        pct: 10
      }],
      maal: [{
        t: 'Automatisert sving under press',
        ax: 'TEK'
      }],
      turn: [{
        w: 32,
        p: 'B',
        n: 'Regionals'
      }]
    },
    Peak: {
      uker: '37–46',
      ukerN: 10,
      fokus: 'Toppform — konkurranse og kamprutine.',
      budsjett: [{
        ax: 'FYS',
        pct: 12
      }, {
        ax: 'TEK',
        pct: 13
      }, {
        ax: 'SLAG',
        pct: 22
      }, {
        ax: 'SPILL',
        pct: 38
      }, {
        ax: 'TURN',
        pct: 15
      }],
      maal: [{
        t: 'NM-kvalifisering',
        ax: 'TURN'
      }, {
        t: 'Toppe på A-turneringer',
        ax: 'SPILL'
      }],
      turn: [{
        w: 38,
        p: 'A',
        n: 'NM'
      }, {
        w: 44,
        p: 'C',
        n: 'Klubbmest.'
      }]
    },
    Overgang: {
      uker: '47–52',
      ukerN: 6,
      fokus: 'Aktiv hvile og evaluering av sesongen.',
      budsjett: [{
        ax: 'FYS',
        pct: 35
      }, {
        ax: 'TEK',
        pct: 20
      }, {
        ax: 'SLAG',
        pct: 20
      }, {
        ax: 'SPILL',
        pct: 20
      }, {
        ax: 'TURN',
        pct: 5
      }],
      maal: [{
        t: 'Restitusjon og skadeforebygging',
        ax: 'FYS'
      }],
      turn: []
    }
  };

  /* ── Øktbibliotek (coach-only): maler (hele-uke-strukturer) ·
     standardøkter (enkelt-økt, 45–240 min) · driller (15–45 min).
     "Anta"-tid brukes kun til visning i galleriet (dur), reell varighet ved
     innsetting styres av dH pr. stub/felt. ~38 forhåndsinnstilte enheter,
     jevnt fordelt over de 5 pyramide-aksene. */
  const TEMPLATES = [{
    id: 't1',
    title: 'Spesialisering — uke',
    meta: '4 økter · TEK-tung',
    sessions: [{
      day: 6,
      sH: 9,
      dH: 1,
      title: 'Teknikk — face-to-path',
      axis: 'TEK',
      cs: 'CS60'
    }, {
      day: 6,
      sH: 11,
      dH: 1.5,
      title: 'Innspill 100–150 m',
      axis: 'SLAG',
      cs: 'CS60'
    }, {
      day: 6,
      sH: 14,
      dH: 1,
      title: 'Putting-blokk',
      axis: 'SLAG',
      cs: 'CS50'
    }, {
      day: 2,
      sH: 18,
      dH: 1,
      title: 'Styrke — vedlikehold',
      axis: 'FYS',
      cs: 'CS60'
    }]
  }, {
    id: 't2',
    title: 'Nedtrapping — race week',
    meta: '2 økter · lavt volum',
    sessions: [{
      day: 6,
      sH: 10,
      dH: 0.75,
      title: 'Aktivering — lett',
      axis: 'FYS',
      cs: 'CS50'
    }, {
      day: 6,
      sH: 13,
      dH: 1,
      title: 'Kamprutine — pre-round',
      axis: 'TURN',
      cs: 'CS70'
    }]
  }, {
    id: 't3',
    title: 'Base — styrkeblokk',
    meta: '3 økter · FYS-fokus',
    sessions: [{
      day: 6,
      sH: 9,
      dH: 1.5,
      title: 'Styrke — underkropp',
      axis: 'FYS',
      cs: 'CS60'
    }, {
      day: 6,
      sH: 11,
      dH: 1,
      title: 'Mobilitet & aktivering',
      axis: 'FYS',
      cs: 'CS50'
    }, {
      day: 2,
      sH: 18,
      dH: 1,
      title: 'Rotasjonskraft',
      axis: 'FYS',
      cs: 'CS70'
    }]
  }, {
    id: 't4',
    title: 'Peak — turneringsuke',
    meta: '3 økter · SPILL/TURN',
    sessions: [{
      day: 6,
      sH: 9,
      dH: 2,
      title: 'Banespill 9 — scoring',
      axis: 'SPILL',
      cs: 'CS50'
    }, {
      day: 6,
      sH: 13,
      dH: 0.75,
      title: 'Press-putt — 1 forsøk',
      axis: 'TURN',
      cs: 'CS50'
    }, {
      day: 2,
      sH: 16,
      dH: 1,
      title: 'Kamprutine — pre-round',
      axis: 'TURN',
      cs: 'CS70'
    }]
  }, {
    id: 't5',
    title: 'Forberedelse — teknikkblokk',
    meta: '3 økter · TEK/SLAG',
    sessions: [{
      day: 6,
      sH: 9,
      dH: 1,
      title: 'Sving-video & analyse',
      axis: 'TEK',
      cs: 'CS50'
    }, {
      day: 6,
      sH: 11,
      dH: 1.25,
      title: 'Innspill 150–175 m',
      axis: 'SLAG',
      cs: 'CS50'
    }, {
      day: 2,
      sH: 18,
      dH: 0.75,
      title: 'Impact-serie',
      axis: 'TEK',
      cs: 'CS60'
    }]
  }, {
    id: 't6',
    title: 'Overgang — aktiv hvile',
    meta: '2 økter · lett FYS',
    sessions: [{
      day: 6,
      sH: 10,
      dH: 1,
      title: 'Mobilitet & aktivering',
      axis: 'FYS',
      cs: 'CS50'
    }, {
      day: 2,
      sH: 17,
      dH: 0.75,
      title: 'Balanse — enbeinstående',
      axis: 'FYS',
      cs: 'CS50'
    }]
  }];
  const STDOKTER = [{
    id: 's1',
    axis: 'FYS',
    title: 'Styrke — underkropp',
    cs: 60,
    dur: '60 min'
  }, {
    id: 's2',
    axis: 'FYS',
    title: 'Mobilitet & aktivering',
    cs: 50,
    dur: '30 min'
  }, {
    id: 's3',
    axis: 'FYS',
    title: 'Rotasjonskraft',
    cs: 70,
    dur: '45 min'
  }, {
    id: 's4',
    axis: 'TEK',
    title: 'Teknikk-blokk 60',
    cs: 60,
    dur: '60 min'
  }, {
    id: 's5',
    axis: 'TEK',
    title: 'Sving-video & analyse',
    cs: 50,
    dur: '45 min'
  }, {
    id: 's6',
    axis: 'TEK',
    title: 'Impact-serie',
    cs: 60,
    dur: '40 min'
  }, {
    id: 's7',
    axis: 'SLAG',
    title: 'Nærspill 90',
    cs: 50,
    dur: '90 min'
  }, {
    id: 's8',
    axis: 'SLAG',
    title: 'Innspill 100–150 m',
    cs: 60,
    dur: '75 min'
  }, {
    id: 's9',
    axis: 'SLAG',
    title: 'Bunkertrening',
    cs: 70,
    dur: '45 min'
  }, {
    id: 's10',
    axis: 'SPILL',
    title: 'Banespill 9',
    cs: 50,
    dur: '2t'
  }, {
    id: 's11',
    axis: 'SPILL',
    title: 'Banespill 18',
    cs: 50,
    dur: '4t'
  }, {
    id: 's12',
    axis: 'SPILL',
    title: 'Scoring-simulering 9 hull',
    cs: 60,
    dur: '2t'
  }, {
    id: 's13',
    axis: 'TURN',
    title: 'Turneringsforberedelse',
    cs: 50,
    dur: '90 min'
  }, {
    id: 's14',
    axis: 'TURN',
    title: 'Press-simulering putt',
    cs: 50,
    dur: '45 min'
  }, {
    id: 's15',
    axis: 'TURN',
    title: 'Kamprutine — pre-round',
    cs: 70,
    dur: '30 min'
  }];
  const DRILLS = [{
    id: 'd1',
    axis: 'FYS',
    title: 'Hip-hinge',
    cs: 60,
    dur: '15 min'
  }, {
    id: 'd2',
    axis: 'FYS',
    title: 'Rotasjon',
    cs: 60,
    dur: '15 min'
  }, {
    id: 'd3',
    axis: 'FYS',
    title: 'Balanse — enbeinstående',
    cs: 50,
    dur: '15 min'
  }, {
    id: 'd4',
    axis: 'FYS',
    title: 'Core-aktivering',
    cs: 50,
    dur: '20 min'
  }, {
    id: 'd5',
    axis: 'TEK',
    title: 'Face-to-path',
    cs: 50,
    dur: '30 min'
  }, {
    id: 'd6',
    axis: 'TEK',
    title: 'Impact bag',
    cs: 70,
    dur: '20 min'
  }, {
    id: 'd7',
    axis: 'TEK',
    title: 'Video — nedsving',
    cs: 50,
    dur: '30 min'
  }, {
    id: 'd8',
    axis: 'TEK',
    title: 'Grip-sjekk',
    cs: 60,
    dur: '15 min'
  }, {
    id: 'd9',
    axis: 'SLAG',
    title: 'Gate-drill',
    cs: 50,
    dur: '30 min'
  }, {
    id: 'd10',
    axis: 'SLAG',
    title: 'Bunker-rake',
    cs: 70,
    dur: '45 min'
  }, {
    id: 'd11',
    axis: 'SLAG',
    title: 'Chip-ladder',
    cs: 70,
    dur: '30 min'
  }, {
    id: 'd12',
    axis: 'SLAG',
    title: 'Distansekontroll wedge',
    cs: 50,
    dur: '40 min'
  }, {
    id: 'd13',
    axis: 'SPILL',
    title: '9-hull scoring',
    cs: 50,
    dur: '3t'
  }, {
    id: 'd14',
    axis: 'SPILL',
    title: 'Par 3-simulering',
    cs: 60,
    dur: '45 min'
  }, {
    id: 'd15',
    axis: 'SPILL',
    title: 'Scramble-øvelse',
    cs: 60,
    dur: '60 min'
  }, {
    id: 'd16',
    axis: 'TURN',
    title: 'Press-putt — 1 forsøk',
    cs: 50,
    dur: '20 min'
  }, {
    id: 'd17',
    axis: 'TURN',
    title: 'Pre-shot rutine',
    cs: 60,
    dur: '15 min'
  }];
  const AXIS_LIST = ['FYS', 'TEK', 'SLAG', 'SPILL', 'TURN'];

  /* ── Sesongmål + teknisk plan (foldbare paneler §6) ─────── */
  const GOALS = [{
    t: 'Kvalifisere til NM 2025',
    done: false
  }, {
    t: 'Senke handicap 4,2 → 2,0',
    done: false
  }, {
    t: 'Putting < 30 putt/runde',
    done: true
  }];
  const TEKNISK_PLAN = [{
    fase: 'L_KOLLE',
    maal: 'Stabil køllebane gjennom treff',
    uke: '14–22'
  }, {
    fase: 'L_BALL',
    maal: 'Konsistent ballflukt — draw-bias',
    uke: '23–31'
  }, {
    fase: 'L_AUTO',
    maal: 'Automatisert sving under press',
    uke: '32–38'
  }];
  /* ── Testplan — kontrollpunkter på tidsaksen (delt kilde: Årsplan-sporet
     «Tester» + Tildel test-modusen). Attestasjon: resultat teller ikke i
     utviklingsplanen før vitne har godkjent (jf. Analyse). ── */
  const TESTBIBLIOTEK = [{
    id: 'pei',
    navn: 'PEI-batteri',
    kort: 'PEI',
    omrade: 'TEK',
    dur: '90 min',
    sit: 'M2',
    press: 'PR2',
    maaler: ['Carry-presisjon', 'Dispersion', 'Wedge-matrix']
  }, {
    id: 'cs',
    navn: 'CS-profil',
    kort: 'CS',
    omrade: 'TEK',
    dur: '30 min',
    sit: 'M0',
    press: 'PR1',
    maaler: ['Køllehastighet CS50–CS100', 'Tempo 3:1'],
    tmParam: 'Tempo'
  }, {
    id: 'bane',
    navn: 'Bane-test 9 hull',
    kort: 'BANE',
    omrade: 'SPILL',
    dur: '3t',
    sit: 'M4',
    press: 'PR3',
    maaler: ['Score vs krav', 'GIR', 'Opp-og-ned']
  }, {
    id: 'fys',
    navn: 'Fysisk screening',
    kort: 'FYS',
    omrade: 'FYS',
    dur: '60 min',
    sit: 'M0',
    press: 'PR1',
    maaler: ['Rotasjonskraft', 'Mobilitet', 'Balanse']
  }];
  const TESTPLAN = [{
    id: 'tp1',
    prot: 'PEI-batteri',
    kort: 'PEI',
    q: 'Q1',
    uke: 6,
    status: 'fullført',
    sit: 'M2',
    press: 'PR2',
    resultat: {
      verdi: 74,
      enhet: 'p',
      krav: '≥ 70',
      bestatt: true,
      trend: '+6'
    },
    attestert: true,
    dato: '8. feb'
  }, {
    id: 'tp2',
    prot: 'PEI-batteri',
    kort: 'PEI',
    q: 'Q2',
    uke: 19,
    status: 'fullført',
    sit: 'M2',
    press: 'PR2',
    resultat: {
      verdi: 78,
      enhet: 'p',
      krav: '≥ 72',
      bestatt: true,
      trend: '+4'
    },
    attestert: false,
    dato: '9. mai',
    milepael: 'P4'
  }, {
    id: 'tp2b',
    prot: 'CS-profil',
    kort: 'CS',
    q: null,
    uke: 20,
    status: 'fullført',
    sit: 'M0',
    press: 'PR1',
    resultat: {
      verdi: 2.9,
      enhet: ':1',
      krav: '≥ 2,9:1',
      bestatt: true,
      trend: '−0,1'
    },
    attestert: false,
    dato: '16. mai',
    milepael: 'P4'
  }, {
    id: 'tp3',
    prot: 'PEI-batteri',
    kort: 'PEI',
    q: 'Q3',
    uke: 32,
    status: 'planlagt',
    sit: 'M2',
    press: 'PR2'
  }, {
    id: 'tp4',
    prot: 'PEI-batteri',
    kort: 'PEI',
    q: 'Q4',
    uke: 45,
    status: 'planlagt',
    sit: 'M2',
    press: 'PR2'
  }];

  /* ── Utviklingsplan (P-milepæler) — knyttet til tidsaksen (uke) ── */
  const UTVIKLINGSPLAN = [{
    id: 'P3',
    t: 'Stabil køllebane gjennom treff',
    ax: 'TEK',
    uke: 16,
    status: 'ferdig'
  }, {
    id: 'P4',
    t: 'Konsistent draw-ballflukt',
    ax: 'TEK',
    uke: 24,
    status: 'aktiv'
  }, {
    id: 'P5',
    t: 'Innspill 150–175 m · 65% GIR',
    ax: 'SLAG',
    uke: 30,
    status: 'aktiv'
  }, {
    id: 'P6',
    t: 'Nærspill innenfor 8 m (30–50 m)',
    ax: 'SLAG',
    uke: 34,
    status: 'planlagt'
  }, {
    id: 'P7',
    t: 'Score-snitt under par-72',
    ax: 'SPILL',
    uke: 41,
    status: 'planlagt'
  }, {
    id: 'P8',
    t: 'Automatisert sving under press',
    ax: 'TURN',
    uke: 45,
    status: 'planlagt'
  }];

  /* ── Neste viktige dato/mål — samler turnering/test/milepæl/sesongmål ét
     sted (§ «oversikt over viktige datoer og mål»), sortert på nærhet fra
     inneværende uke (25). ────────────────────────────────────────── */
  const NESTE_HENDELSER = [{
    icon: 'target',
    label: 'PEI-test Q3',
    meta: 'Ferdighetstest',
    uke: 32
  }, {
    icon: 'trophy',
    label: 'Regionals',
    meta: 'B-turnering',
    uke: 32
  }, {
    icon: 'git-branch',
    label: 'P5 · Innspill 150–175 m',
    meta: 'Utviklingsplan-milepæl',
    uke: 30
  }, {
    icon: 'trophy',
    label: 'NM',
    meta: 'A-turnering · hovedmål',
    uke: 38
  }, {
    icon: 'flag',
    label: 'Kvalifisere til NM 2025',
    meta: 'Sesongmål · 62% fullført',
    uke: null
  }];

  /* ── Forespørsler fra spiller (balanse-rail) ────────────── */
  const FORESPORSLER = [{
    id: 'r1',
    spiller: 'Øyvind',
    type: 'flytt',
    t: 'Kan vi flytte lørdagsøkta til søndag? Jobber lørdag.',
    when: '2t siden'
  }, {
    id: 'r2',
    spiller: 'Øyvind',
    type: 'ønske',
    t: 'Ønsker mer putting denne uka — føler det glipper.',
    when: 'i går'
  }];
  /* ── AI-medplanlegger — foreslåtte ghost-økter (mot NM) ─── */
  const AI_GHOST = [{
    day: 1,
    area: 'TEK',
    title: 'Teknikk — face-to-path',
    sH: 11,
    dH: 1,
    cs: 'CS50',
    meta: 'Tir 11:00 · 1t'
  }, {
    day: 4,
    area: 'SLAG',
    title: 'Innspill 150–175 m',
    sH: 14,
    dH: 1.5,
    cs: 'CS50',
    meta: 'Fre 14:00 · 1,5t'
  }];

  /* ── Analyse-koblinger (datagrunnlag pr. økt/spiller) ──── */
  const ANALYSE_LENKER = [{
    key: 'sg',
    label: 'SG-Hub',
    icon: 'trending-up',
    meta: 'Strokes Gained · 12 uker'
  }, {
    key: 'tm',
    label: 'TrackMan',
    icon: 'radar',
    meta: 'Launch-data · 142 baller'
  }, {
    key: 'rnd',
    label: 'Runder',
    icon: 'flag',
    meta: 'Siste 8 runder'
  }, {
    key: 'tst',
    label: 'Tester',
    icon: 'target',
    meta: 'PEI Q2 · 16. juni'
  }, {
    key: 'dg',
    label: 'DataGolf',
    icon: 'globe',
    meta: 'WAGR · skill-rating'
  }];
  /* ── Datakilde-synk (helse-signal) ─────────────────────── */
  const SYNC = {
    datagolf: {
      ok: true,
      rank: 412,
      label: 'DataGolf',
      sub: 'WAGR 412 · skill +1,2',
      when: '2t siden'
    },
    trackman: {
      ok: true,
      label: 'TrackMan',
      sub: '142 baller synket',
      when: 'i går'
    },
    arccos: {
      ok: false,
      label: 'Arccos',
      sub: 'venter på kobling',
      when: '—'
    }
  };

  /* ── Plan-livssyklus (§1) ───────────────────────────────── */
  const PLAN_STATUS = {
    DRAFT: {
      label: 'Utkast',
      color: T.muted
    },
    PENDING_PLAYER: {
      label: 'Venter på spiller',
      color: T.amber
    },
    ACTIVE: {
      label: 'Aktiv plan',
      color: T.lime
    },
    REJECTED: {
      label: 'Avvist',
      color: T.redSolid
    }
  };

  /* ── CANON — de 9 invariantene (§9) ─────────────────────── */
  const INVARIANTER = [{
    id: 'tek-min',
    navn: 'TEK-min (≥15%)',
    alv: 'hard',
    sone: 'Pyramide',
    sessionId: null,
    melding: 'TEK 13% under minstekrav 15% for fasen.',
    klar: 'Denne uka mangler teknisk trening.'
  }, {
    id: 'pyr-maks',
    navn: 'Pyramide-maks',
    alv: 'hard',
    sone: 'Pyramide',
    sessionId: null,
    melding: 'SPILL 33% over periodebudsjett 28% for Spesialisering.',
    klar: 'For mye av én type trening denne uka.'
  }, {
    id: 'cs50-ball',
    navn: 'CS80-ballkontakt',
    alv: 'hard',
    sone: 'Inspektør',
    sessionId: 8,
    chipKey: 'csNivaa',
    melding: 'CS50 < CS80 påkrevd for ballkontakt-drill.',
    klar: 'Denne økta er satt for enkel for slag-trening.'
  }, {
    id: 'cs-tak',
    navn: 'CS-tak',
    alv: 'hard',
    sone: 'Inspektør',
    sessionId: 6,
    chipKey: 'csNivaa',
    melding: 'CS90 over tak CS70 for alderstrinn U16.',
    klar: 'Hastigheten er satt for høyt for alderen.'
  }, {
    id: 'lfase-tillatt',
    navn: 'Læringstrinn-tillatt',
    alv: 'hard',
    sone: 'Inspektør',
    sessionId: 3,
    chipKey: 'lFase',
    melding: 'L_AUTO ikke tillatt i Spesialiserings-fasen.',
    klar: 'Denne treningstypen passer ikke fasen.'
  }, {
    id: 'alder',
    navn: 'Aldersregel',
    alv: 'hard',
    sone: 'Uke',
    sessionId: null,
    melding: 'Daglig volum 4t over aldersmaks 3t (U16).',
    klar: 'For lang treningsdag for alderen.'
  }, {
    id: 'volum-uke',
    navn: 'Volum-uke',
    alv: 'hard',
    sone: 'Uke',
    sessionId: null,
    melding: 'Ukevolum 12t over tak 11t.',
    klar: 'Denne uka har for mange treningstimer.'
  }, {
    id: 'maks-2-sving',
    navn: 'Maks-2-svingendringer',
    alv: 'hard',
    sone: 'Periode',
    sessionId: null,
    melding: '3 svingendringer i perioden, maks 2 tillatt.',
    klar: 'For mange tekniske endringer på kort tid.'
  }, {
    id: 'hviledag',
    navn: 'Hviledager',
    alv: 'myk',
    sone: 'Uke',
    sessionId: null,
    melding: 'Kun 1 hviledag denne uka, anbefalt 2.',
    klar: 'Du bør legge inn en hviledag til.'
  }];

  /* ── Demo-scenarier — vekslbare brudd-sett ──────────────── */
  const SCENARIOS = [{
    id: 'ren',
    label: 'Ren plan',
    aktive: []
  }, {
    id: 'myk',
    label: 'Mykt avvik',
    aktive: ['hviledag']
  }, {
    id: 'tek',
    label: 'TEK-min',
    aktive: ['tek-min', 'hviledag']
  }, {
    id: 'hard',
    label: 'Sterkt avvik',
    aktive: ['cs50-ball', 'tek-min']
  }, {
    id: 'multi',
    label: 'Flere avvik',
    aktive: ['cs50-ball', 'cs-tak', 'lfase-tillatt', 'tek-min', 'volum-uke', 'hviledag']
  }];
  function bruddFor(activeIds) {
    return INVARIANTER.filter(i => activeIds.indexOf(i.id) !== -1);
  }
  /* Fase 4.2 — layout-avledede brudd: regnes LIVE fra ukelayouten (ikke demo-scenario).
     Workbench mater inn en PREVIEW-layout under draget (dratt økt flyttet, ikke committet),
     så Plan-kvalitet reagerer mens coachen drar — ikke bare ved slipp. Dekker `hviledag`
     (myk, rådgivende — «varsle og veilede, aldri sperre»); volum-uke holdes scenario-styrt
     inntil varighet-drag + demo-baseline er forsonet. Returnerer ærlig, tellende melding. */
  const DAG_ANT = 7;
  function deriveLiveBrudd(sessions) {
    sessions = sessions || [];
    const brukte = {};
    sessions.forEach(s => {
      brukte[s.day] = true;
    });
    let hvile = 0;
    for (let d = 0; d < DAG_ANT; d++) if (!brukte[d]) hvile += 1;
    const ids = [],
      meldinger = {};
    if (hvile < 2) {
      ids.push('hviledag');
      const antall = hvile === 0 ? 'Ingen hviledager' : 'Kun 1 hviledag';
      meldinger.hviledag = {
        melding: `${antall} denne uka — anbefalt 2.`,
        klar: hvile === 0 ? 'Legg inn hviledager — kroppen trenger restitusjon.' : 'Du bør legge inn en hviledag til.'
      };
    }
    return {
      ids,
      meldinger,
      hvile
    };
  }
  function validatePlan(activeIds, overrides) {
    overrides = overrides || {};
    const brudd = bruddFor(activeIds);
    let penalty = 0;
    // Kanon: overstyring fjerner KUN blokkerende tilstand — trekket i Plan-kvalitet består.
    brudd.forEach(b => {
      penalty += b.alv === 'hard' ? 14 : 6;
    });
    return {
      score: Math.max(0, 100 - penalty),
      brudd
    };
  }
  function hardOpen(activeIds, overrides) {
    overrides = overrides || {};
    return bruddFor(activeIds).filter(b => b.alv === 'hard' && !overrides[b.id]);
  }

  /* Kanon-visningsnavn (tolags-språk): kode → navn. Koder består i data. */
  const LTRINN = {
    L_KROPP: {
      trinn: 1,
      vis: 'Trinn 1 · Kropp',
      klar: 'Kroppen lærer bevegelsen'
    },
    L_ARM: {
      trinn: 2,
      vis: 'Trinn 2 · Armer',
      klar: 'Armene kobles på bevegelsen'
    },
    L_KOLLE: {
      trinn: 3,
      vis: 'Trinn 3 · Kølle',
      klar: 'Svingtrening med kølle — uten ball'
    },
    L_BALL: {
      trinn: 4,
      vis: 'Trinn 4 · Ball',
      klar: 'Ballkontakt i kontrollert fart'
    },
    L_AUTO: {
      trinn: 5,
      vis: 'Trinn 5 · Auto',
      klar: 'Automatisert under press'
    }
  };
  /* Situasjon-aksen (M0–M5) — historisk nøkkelnavn ARENA i data; UI-navn «Situasjon» (B10). */
  const ARENA = {
    M0: {
      vis: 'M0 · Innendørs',
      klar: 'Innendørs — studio eller simulator'
    },
    M1: {
      vis: 'M1 · Range',
      klar: 'Fri trening på range'
    },
    M2: {
      vis: 'M2 · Range med mål',
      klar: 'Range-trening mot definert mål eller krav'
    },
    M3: {
      vis: 'M3 · Bane trening',
      klar: 'På banen, uten scoring'
    },
    M4: {
      vis: 'M4 · Bane test',
      klar: 'Spill med scoring — test på bane'
    },
    M5: {
      vis: 'M5 · Turnering',
      klar: 'Turneringsspill'
    }
  };
  /* Område-aksen (treningsområde — «ARENA» i kanon-tabellen) */
  const OMRAADE = {
    TEE: {
      vis: 'Tee',
      kort: 'Tee'
    },
    INNSPILL: {
      vis: 'Innspill 200–50',
      kort: 'Innspill'
    },
    PUTT: {
      vis: 'Putting',
      kort: 'Putting'
    }
  };
  /* Press-aksen (PR1–PR5) — kanon-klarspråk */
  const PRESSN = {
    PR1: {
      vis: 'PR1 · Rolig',
      navn: 'Rolig'
    },
    PR2: {
      vis: 'PR2 · Lett press',
      navn: 'Lett press'
    },
    PR3: {
      vis: 'PR3 · Skjerpet',
      navn: 'Skjerpet'
    },
    PR4: {
      vis: 'PR4 · Høyt press',
      navn: 'Høyt press'
    },
    PR5: {
      vis: 'PR5 · Turneringsnerver',
      navn: 'Turneringsnerver'
    }
  };
  window.WBDATA = {
    T,
    AX,
    AX_TEXT,
    AX_SOFT,
    THEME,
    applyTheme,
    themeFromUrl,
    AKFORMEL,
    FYS_TYPER,
    drillModus,
    formelSekundaer,
    LTRINN,
    ARENA,
    OMRAADE,
    PRESSN,
    SESSIONS,
    DAYS,
    DATES,
    TODAY,
    ACWR,
    ACWR_PREV,
    SG,
    SG_PREV,
    SG_AXES,
    KPIS,
    PERIODER,
    TEMPLATES,
    STDOKTER,
    DRILLS,
    AXIS_LIST,
    GOALS,
    TEKNISK_PLAN,
    UTVIKLINGSPLAN,
    TESTBIBLIOTEK,
    TESTPLAN,
    PLAN_STATUS,
    INVARIANTER,
    SCENARIOS,
    bruddFor,
    validatePlan,
    hardOpen,
    deriveLiveBrudd,
    FORESPORSLER,
    AI_GHOST,
    ANALYSE_LENKER,
    SYNC,
    NESTE_HENDELSER
  };
})();
})(); 