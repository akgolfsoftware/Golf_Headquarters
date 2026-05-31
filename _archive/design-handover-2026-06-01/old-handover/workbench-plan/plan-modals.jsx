/* ============================================================
   Workbench Plan · Modals + wizard banner
   ============================================================ */

const { useState, useContext, createContext, useEffect } = React;

/* ---- Global plan context for state + modal control ---- */
const PlanContext = createContext(null);

/* ============ FACILITIES default state ============ */
const WBP_FACILITIES = {
  indoor: [
    { id: 'tm-own',    nm: 'Egen Trackman',                 desc: 'Personlig launch-monitor hjemme', def: false },
    { id: 'tm-sim',    nm: 'Tilgang til Trackman-simulator', desc: 'Fri tilgang (klubb/akademi)',     def: false },
    { id: 'mat-net',   nm: 'Matte og nett',                 desc: 'Innendørs slag-stasjon',          def: true  },
    { id: 'putt-12m',  nm: 'Putt 12 m+ innendørs',          desc: 'Putte-green eller -teppe',        def: false },
    { id: 'gym',       nm: 'Styrketrening + mobilitet',     desc: 'Eget gym eller fri tilgang',      def: true  },
    { id: 'video',     nm: 'Video-analyse setup',           desc: 'Stativ + kamera + skjerm',        def: true  },
  ],
  outdoor: [
    { id: 'range-driver', nm: 'Driver på driving range',     desc: 'Mer enn 240 m utslag',           def: false },
    { id: 'range-short',  nm: 'Range under 200 m',           desc: 'Kort range (jern/wedge)',        def: true  },
    { id: 'short-game',   nm: 'Short-game-område',           desc: 'Chip/pitch/bunker',              def: true  },
    { id: 'putt-out',     nm: 'Puttgreen utendørs',          desc: '12+ meter putt',                  def: true  },
    { id: 'course',       nm: 'Egen 18-hulls bane',         desc: 'Fri tilgang for økt-runder',     def: true  },
    { id: 'links',        nm: 'Links / hard-bane tilgang',  desc: 'Reisbart i 1 t',                  def: false },
  ],
};

const WBP_INITIAL_FAC = (() => {
  const out = {};
  [...WBP_FACILITIES.indoor, ...WBP_FACILITIES.outdoor].forEach(f => out[f.id] = f.def);
  return out;
})();

/* ============ WIZARD STEPS ============ */
const WBP_WIZARD_STEPS = [
  { key: 'fac',    label: 'Fasiliteter',          modal: 'facilities', done: false },
  { key: 'period', label: 'Sett periodisering',   modal: 'period',     done: true },
  { key: 'test',   label: 'Test- og evalueringsuker', modal: 'period', done: true },
  { key: 'camp',   label: 'Treningssamlinger',    modal: 'camp',       done: false, current: true },
  { key: 'freq',   label: 'Ukentlig frekvens',    modal: 'freq',       done: false },
  { key: 'fill',   label: 'Fyll inn økter',       modal: null,         done: false },
];

function WBP_WizardBanner() {
  const { setModal } = useContext(PlanContext);
  return (
    <div className="wizard-banner">
      <div className="pad">
        <WBPIc id="ic-sparkles"/>
        Sett opp plan
      </div>
      <div className="wizard-steps">
        {WBP_WIZARD_STEPS.map((s, i) => (
          <React.Fragment key={s.key}>
            <button
              className={'wizard-step' + (s.done ? ' done' : '') + (s.current ? ' current' : '')}
              onClick={() => s.modal && setModal(s.modal)}
            >
              <span className="num">{s.done ? '' : i + 1}</span>
              {s.label}
            </button>
            {i < WBP_WIZARD_STEPS.length - 1 && <span className="sep"></span>}
          </React.Fragment>
        ))}
      </div>
      <button className="dismiss">
        Skjul guide <WBPIc id="ic-x" size={11}/>
      </button>
    </div>
  );
}

/* ============ Generic modal wrapper ============ */
function WBP_Modal({ icon, eyebrow, title, sub, children, foot, wide, onClose, leftMeta }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={'modal' + (wide ? ' wide' : '')} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div className="left">
            {icon && <div className="head-ic"><WBPIc id={icon} size={18}/></div>}
            <div>
              {eyebrow && <span className="eyebrow">{eyebrow}</span>}
              <div className="ttl">{title}</div>
              {sub && <div className="sub">{sub}</div>}
            </div>
          </div>
          <button className="x" onClick={onClose}><WBPIc id="ic-x" size={14}/></button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {foot && (
          <div className="modal-foot">
            <div className="left-meta">
              {leftMeta || <span><WBPIc id="ic-sparkles" size={12}/> Caddie kan foreslå utfylling — trykk ⌘K</span>}
            </div>
            <div className="actions">{foot}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ MODAL · Ny periode ============ */
function WBP_ModalPeriod({ onClose }) {
  const [type, setType] = useState('grunn');
  const types = [
    { id: 'grunn',  nm: 'Grunnperiode',           desc: 'Bygg fundament',         ic: 'ic-anchor' },
    { id: 'spes',   nm: 'Spesialiseringsperiode', desc: 'Tekn. + slag-volum',     ic: 'ic-trending' },
    { id: 'turn',   nm: 'Turneringsperiode',      desc: 'Peaking-form + taper',   ic: 'ic-flame' },
    { id: 'eval',   nm: 'Evalueringsperiode',     desc: 'Måling + retning',       ic: 'ic-bar' },
    { id: 'test',   nm: 'Testperiode',            desc: '1 uke fri-status',       ic: 'ic-beaker' },
  ];
  return (
    <WBP_Modal
      icon="ic-calendar-plus"
      eyebrow={<span className="eyebrow">Steg 2 av 6</span>}
      title={<>Ny periode i <em>sesongen</em></>}
      sub="Type, varighet og fokus — datoer kan justeres etterpå"
      onClose={onClose}
      foot={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Avbryt</button>
          <button className="btn btn-primary" onClick={onClose}>Lagre periode <WBPIc id="ic-arrow-right" size={12}/></button>
        </>
      }
    >
      <div className="field">
        <label className="field-label">Periode-type</label>
        <div className="chip-grid">
          {types.map(t => (
            <button key={t.id} className={'chip' + (type === t.id ? ' on' : '')} onClick={() => setType(t.id)}>
              <span className="ic"><WBPIc id={t.ic} size={12}/></span>
              <span className="lbl">{t.nm}<span className="desc">{t.desc}</span></span>
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="field-label">Navn på periode</label>
        <input className="input" defaultValue="Bygging mot turnering" placeholder="f.eks. Bygging mot Sør.åpent"/>
      </div>

      <div className="field-row">
        <div>
          <label className="field-label">Fra dato</label>
          <div className="input-with-ic">
            <span className="ic"><WBPIc id="ic-calendar" size={14}/></span>
            <input className="input mono" defaultValue="08.05.2026"/>
          </div>
        </div>
        <div>
          <label className="field-label">Til dato</label>
          <div className="input-with-ic">
            <span className="ic"><WBPIc id="ic-calendar" size={14}/></span>
            <input className="input mono" defaultValue="18.06.2026"/>
          </div>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Hovedfokus (pyramide-akser)</label>
        <div className="chip-grid">
          {[
            { k: 'fys', nm: 'FYS', desc: 'Fysisk', ic: 'ic-flame' },
            { k: 'tek', nm: 'TEK', desc: 'Teknikk', ic: 'ic-target' },
            { k: 'slag', nm: 'SLAG', desc: 'Golfslag', ic: 'ic-trending', on: true },
            { k: 'spill', nm: 'SPILL', desc: 'Spill', ic: 'ic-flag', on: true },
            { k: 'turn', nm: 'TURN', desc: 'Turnering', ic: 'ic-trophy' },
          ].map(a => (
            <button key={a.k} className={'chip axis-' + a.k + (a.on ? ' on' : '')}>
              <span className="ic"><WBPIc id={a.ic} size={12}/></span>
              <span className="lbl">{a.nm}<span className="desc">{a.desc}</span></span>
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="field-label">Ankret mot turnering</label>
        <select className="input" defaultValue="sor">
          <option value="">— Ingen direkte anker —</option>
          <option value="sor">Sørlandsåpent · 28.–30. mai (A-finale)</option>
          <option value="oslo">Osloåpent · 15.–16. juni (B)</option>
          <option value="nm">NM-kvalifisering · 25.–27. juli (A)</option>
        </select>
      </div>
    </WBP_Modal>
  );
}

/* ============ MODAL · Ny treningssamling ============ */
function WBP_ModalCamp({ onClose }) {
  const [reg, setReg] = useState('privat');
  const regis = [
    { id: 'vang',  nm: 'WANG Toppidrett', desc: 'Akademi-samling',     ic: 'ic-users' },
    { id: 'klubb', nm: 'Klubb',           desc: 'GFGK / hjemmeklubb',  ic: 'ic-flag' },
    { id: 'team',  nm: 'Team Norge',      desc: 'NGF-samling',         ic: 'ic-trophy' },
    { id: 'privat',nm: 'Privat',          desc: 'Egen / m/ coach',     ic: 'ic-user' },
  ];
  return (
    <WBP_Modal
      icon="ic-users"
      eyebrow={<span className="eyebrow">Steg 4 av 6</span>}
      title={<>Ny <em>treningssamling</em></>}
      sub="Dato, sted, regi — samlingen vises som hendelse på tvers av aksene"
      onClose={onClose}
      foot={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Avbryt</button>
          <button className="btn btn-primary" onClick={onClose}>Legg til <WBPIc id="ic-arrow-right" size={12}/></button>
        </>
      }
    >
      <div className="field">
        <label className="field-label">I regi av</label>
        <div className="chip-grid">
          {regis.map(r => (
            <button key={r.id} className={'chip' + (reg === r.id ? ' on' : '')} onClick={() => setReg(r.id)}>
              <span className="ic"><WBPIc id={r.ic} size={12}/></span>
              <span className="lbl">{r.nm}<span className="desc">{r.desc}</span></span>
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="field-label">Navn på samling</label>
        <input className="input" defaultValue="WANG-samling · juni" placeholder="f.eks. WANG-samling — uke 24"/>
      </div>

      <div className="field-row">
        <div>
          <label className="field-label">Fra dato</label>
          <div className="input-with-ic">
            <span className="ic"><WBPIc id="ic-calendar" size={14}/></span>
            <input className="input mono" defaultValue="13.06.2026"/>
          </div>
        </div>
        <div>
          <label className="field-label">Til dato</label>
          <div className="input-with-ic">
            <span className="ic"><WBPIc id="ic-calendar" size={14}/></span>
            <input className="input mono" defaultValue="16.06.2026"/>
          </div>
        </div>
      </div>

      <div className="field-row">
        <div>
          <label className="field-label">Sted</label>
          <div className="input-with-ic">
            <span className="ic"><WBPIc id="ic-pin" size={14}/></span>
            <input className="input" defaultValue="WANG Toppidrett · Oslo"/>
          </div>
        </div>
        <div>
          <label className="field-label">Antall deltakere</label>
          <input className="input mono" defaultValue="12 spillere"/>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Hovedinnhold</label>
        <div className="chip-grid">
          <button className="chip axis-tek on"><span className="ic"><WBPIc id="ic-target" size={12}/></span><span className="lbl">TEK<span className="desc">Video + analyse</span></span></button>
          <button className="chip axis-slag on"><span className="ic"><WBPIc id="ic-trending" size={12}/></span><span className="lbl">SLAG<span className="desc">Range-arbeid</span></span></button>
          <button className="chip axis-spill"><span className="ic"><WBPIc id="ic-flag" size={12}/></span><span className="lbl">SPILL<span className="desc">9/18 hull</span></span></button>
          <button className="chip axis-fys"><span className="ic"><WBPIc id="ic-flame" size={12}/></span><span className="lbl">FYS<span className="desc">Trening</span></span></button>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Notat</label>
        <textarea className="input" rows="2" defaultValue="Fokus på taper inn mot NM-kvalifisering."></textarea>
      </div>
    </WBP_Modal>
  );
}

/* ============ MODAL · Ukentlig frekvens (per period) ============ */
function WBP_ModalFreq({ onClose }) {
  const [freq, setFreq] = useState({ fys: 3, tek: 4, slag: 3, spill: 2, turn: 0 });
  const setN = (k, delta) => setFreq(f => ({ ...f, [k]: Math.max(0, f[k] + delta) }));
  const total = Object.values(freq).reduce((a, b) => a + b, 0);

  const axes = [
    { k: 'fys',   nm: 'FYS',   sub: 'Fysisk · mobilitet, styrke, restitusjon', color: '#005840' },
    { k: 'tek',   nm: 'TEK',   sub: 'Teknikk · video, drills, swing-arbeid',    color: '#B8852A' },
    { k: 'slag',  nm: 'SLAG',  sub: 'Golfslag · range, TrackMan, drills',       color: '#2563EB' },
    { k: 'spill', nm: 'SPILL', sub: 'Spill · 9/18 hull, scoring',               color: '#D1F843' },
    { k: 'turn',  nm: 'TURN',  sub: 'Turnering — kun ankret mot dato',          color: '#A32D2D' },
  ];

  return (
    <WBP_Modal
      icon="ic-bar"
      eyebrow={<span className="eyebrow">Steg 5 av 6 · Periode 3 · Bygging</span>}
      title={<>Ukentlig <em>frekvens</em></>}
      sub="Hvor mange økter per uke i denne perioden? Caddie genererer plassholdere — du fyller inn detaljer etterpå."
      onClose={onClose}
      wide
      foot={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Avbryt</button>
          <button className="btn btn-primary" onClick={onClose}>Generér uker <WBPIc id="ic-sparkles" size={12}/></button>
        </>
      }
      leftMeta={
        <span>
          <strong style={{ color: 'var(--fg)', fontWeight: 700 }}>{total}</strong> økter/uke · ca <strong style={{ color: 'var(--fg)', fontWeight: 700 }}>{(total * 1.5).toFixed(1)}</strong> t
        </span>
      }
    >
      <div style={{ marginBottom: 14 }}>
        {axes.map(ax => (
          <div key={ax.k} className="freq-row">
            <div className="axis-tag">
              <span className="axis-dot" style={{ background: ax.color }}></span>
              <div className="axis-name">{ax.nm}<span className="sub">{ax.sub}</span></div>
            </div>
            <div className="freq-stepper">
              <button onClick={() => setN(ax.k, -1)}>−</button>
              <div className="val">{freq[ax.k]}<span className="u">økt/uke</span></div>
              <button onClick={() => setN(ax.k, +1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: 12, background: 'rgba(209,248,67,0.16)', borderRadius: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: '#3A4514', letterSpacing: '0.02em' }}>
        <strong style={{ color: '#2C361B' }}>Caddie · forslag:</strong> for Bygging mot turnering (peaking-fase) anbefales 3 SLAG + 3 SPILL + 2 TEK + 2 FYS = 10 økter/uke.
      </div>
    </WBP_Modal>
  );
}

/* ============ MODAL · Fasiliteter ============ */
function WBP_ModalFacilities({ onClose }) {
  const { facilities, setFacilities } = useContext(PlanContext);
  const toggle = (id) => setFacilities(f => ({ ...f, [id]: !f[id] }));

  const renderGroup = (group, label, icon) => {
    const yesCount = group.filter(f => facilities[f.id]).length;
    return (
      <div className="fac-group">
        <div className="fac-group-head">
          <div className="ttl"><WBPIc id={icon} size={14}/>{label}</div>
          <span className="count">{yesCount} av {group.length} tilgjengelig</span>
        </div>
        {group.map(f => {
          const yes = facilities[f.id];
          return (
            <div key={f.id} className={'fac-row' + (yes ? ' yes' : '')} onClick={() => toggle(f.id)}>
              <div className="nm">{f.nm}<span className="desc">{f.desc}</span></div>
              <div className={'yn-toggle ' + (yes ? 'yes' : 'no')}>
                <span className="opt y">JA</span>
                <span className="opt n">NEI</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <WBP_Modal
      icon="ic-pin"
      eyebrow={<span className="eyebrow">Steg 1 av 6</span>}
      title={<>Hva har du <em>tilgang til?</em></>}
      sub="Caddie tilpasser øktene til fasilitetene dine — TrackMan-drills foreslås kun hvis tilgjengelig."
      onClose={onClose}
      wide
      foot={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Hopp over</button>
          <button className="btn btn-primary" onClick={onClose}>Lagre & fortsett <WBPIc id="ic-arrow-right" size={12}/></button>
        </>
      }
      leftMeta={
        <span><WBPIc id="ic-sparkles" size={12}/> Caddie velger drills basert på dette</span>
      }
    >
      {renderGroup(WBP_FACILITIES.indoor, 'Innendørs', 'ic-home')}
      {renderGroup(WBP_FACILITIES.outdoor, 'Utendørs', 'ic-leaf')}
    </WBP_Modal>
  );
}

/* ============ Quick-pop (when empty cell clicked) ============ */
function WBP_QuickPop({ pos, axis, week, day, onClose, onAddSession }) {
  if (!pos) return null;
  return (
    <div className="quickpop" style={{ left: pos.x, top: pos.y }} onClick={e => e.stopPropagation()}>
      <div className="qp-head">
        <div>
          <div className="ttl">Legg til {axis?.toUpperCase()}-økt</div>
          <span className="sub">Uke {week} · dag {day + 1}</span>
        </div>
      </div>
      <div className="qp-opt" onClick={onAddSession}>
        <span className="ic"><WBPIc id="ic-plus" size={12}/></span>
        <span>Tom økt</span>
        <span className="kbd-chip">⏎</span>
      </div>
      <div className="qp-opt" onClick={onAddSession}>
        <span className="ic"><WBPIc id="ic-sparkles" size={12}/></span>
        <span>Caddie · foreslå</span>
        <span className="kbd-chip">⌘K</span>
      </div>
      <div className="qp-opt" onClick={onAddSession}>
        <span className="ic"><WBPIc id="ic-copy" size={12}/></span>
        <span>Dupliser forrige uke</span>
      </div>
    </div>
  );
}

Object.assign(window, {
  PlanContext,
  WBP_FACILITIES, WBP_INITIAL_FAC,
  WBP_WIZARD_STEPS, WBP_WizardBanner,
  WBP_Modal, WBP_ModalPeriod, WBP_ModalCamp, WBP_ModalFreq, WBP_ModalFacilities,
  WBP_QuickPop,
});
