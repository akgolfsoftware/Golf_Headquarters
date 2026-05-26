/* ============================================================
   Workbench Plan · Inspector (right panel) — interactive
   Bruker WBP_Pyramid-komponenten (FYS bunn → TURN topp)
   ============================================================ */

function WBP_Inspector() {
  const { setModal, setToast } = useContext(PlanContext);

  // Periode 3 weights (ideal) — note: pyramid component takes raw axis values
  const weights = { fys: 15, tek: 18, slag: 27, spill: 30, turn: 10 };
  const actuals = { fys: 18, tek: 22, slag: 24, spill: 26, turn: 10 };

  const addTest = (testId) => {
    const t = WBP_TESTS.find(x => x.id === testId);
    setToast({ test: t });
  };

  return (
    <aside className="inspector">
      <div className="insp-section">
        <div className="eyebrow-row">
          <span className="eyebrow">Valgt · Økt</span>
          <button className="x"><WBPIc id="ic-x" size={12}/></button>
        </div>
        <div className="insp-title">
          Wedge-spinn <em>40–80m</em>
        </div>
        <div className="insp-sub">SLAG · Tirs 23/5 · 14:00–15:30</div>

        <div className="insp-meta-grid">
          <div>
            <div className="ml">Varighet</div>
            <div className="mv">90<span className="u">min</span></div>
          </div>
          <div>
            <div className="ml">Sted</div>
            <div className="mv" style={{ fontSize: 12 }}>GFGK · TM bay 3</div>
          </div>
          <div>
            <div className="ml">Drills</div>
            <div className="mv">5<span className="u">stk</span></div>
          </div>
          <div>
            <div className="ml">Intensitet</div>
            <div className="mv" style={{ fontSize: 12 }}><span className="pill pill-warn">middels</span></div>
          </div>
        </div>
      </div>

      <div className="insp-section">
        <div className="insp-section-ttl">
          Periode-pyramide
          <span className="right">Uke 19–24</span>
        </div>
        <WBP_Pyramid
          weights={weights}
          actuals={actuals}
          period="Periode 3 · Bygging"
          anchor={true}
        />
      </div>

      <div className="insp-section">
        <div className="insp-section-ttl">
          Snarveier · Tester
          <span className="right">Ett klikk · linket</span>
        </div>
        <WBP_TestShortcuts
          onShowAll={() => setModal('testpicker')}
          onAddTest={addTest}
        />
      </div>

      <div className="insp-section">
        <div className="insp-section-ttl">Neste handlinger</div>
        <div className="insp-actions">
          <button className="a" onClick={() => setModal('freq')}>
            <span className="ic"><WBPIc id="ic-bar" size={12}/></span>
            <span className="lbl">Sett ukentlig frekvens
              <span className="desc">Hvor mange FYS/TEK/SLAG-økter</span>
            </span>
            <span className="kbd-chip">⌘F</span>
          </button>
          <button className="a" onClick={() => setModal('camp')}>
            <span className="ic"><WBPIc id="ic-users" size={12}/></span>
            <span className="lbl">Legg til treningssamling
              <span className="desc">WANG · Klubb · Team Norge · Privat</span>
            </span>
            <span className="kbd-chip">⌘S</span>
          </button>
          <button className="a">
            <span className="ic"><WBPIc id="ic-sparkles" size={12}/></span>
            <span className="lbl">Auto-balansér uke 21
              <span className="desc">+ SLAG, − TEK · 1 klikk</span>
            </span>
            <span className="kbd-chip">⌘B</span>
          </button>
          <button className="a">
            <span className="ic"><WBPIc id="ic-check" size={12}/></span>
            <span className="lbl">Be coach godkjenne endringer
              <span className="desc">3 endringer venter</span>
            </span>
            <span className="kbd-chip">⏎</span>
          </button>
        </div>
      </div>

      <div className="insp-section">
        <div className="insp-section-ttl">
          Ankret mot
          <span className="right">21 dager</span>
        </div>
        <div className="insp-trn">
          <div className="eb">Neste turnering</div>
          <div className="nm">Sørlandsåpent</div>
          <div className="meta">28.–30. mai · Kristiansand GK · A-finale</div>
          <div className="count">
            <span className="num">21</span>
            <span className="unit">dager igjen</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

Object.assign(window, { WBP_Inspector });
