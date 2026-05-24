// Workspace · Skjerm 1 — Min uke
// /admin/workspace · default for Anders
// 3-kol: I dag / Denne uka / Senere · brenner-strip sticky øverst
const { useState: useWS1 } = React;

function BrennerStrip({ tasks }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(163,45,45,0.06) 0%, rgba(163,45,45,0.02) 100%)',
      border: '1px solid rgba(163,45,45,0.20)',
      borderLeft: '4px solid var(--danger)',
      borderRadius: 14, padding: 18,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
        <span style={{ color: 'var(--danger)' }}><WIcon.Fire/></span>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--danger)', letterSpacing: '-0.005em' }}>{tasks.length} brenner</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.04em' }}>må håndteres i dag</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.map(t => (
          <div key={t.id} style={{
            display: 'grid', gridTemplateColumns: '20px 1fr auto auto auto auto auto',
            gap: 12, alignItems: 'center',
            padding: '10px 12px', background: '#fff',
            border: '1px solid rgba(163,45,45,0.18)', borderRadius: 10,
          }}>
            <TaskCheck done={t.done}/>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600 }}>{t.title}</div>
            <ProjectPill company={t.project.company} name={t.project.name} compact/>
            <DueDate value={t.due} today={t.today}/>
            <VisibilityIcon kind={t.vis}/>
            <SourceBadge kind={t.source}/>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="btn btn-outline btn-xs" title="Snooze 4 timer"><WIcon.Snooze/></button>
              <button className="btn btn-primary btn-xs">Fullfør</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ColumnHeader({ title, sub, count, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: accent ? 'var(--primary)' : 'var(--muted)', background: accent ? 'rgba(0,88,64,0.08)' : 'var(--bg)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>{count}</div>
      {sub && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.04em', marginLeft: 'auto' }}>{sub}</div>}
    </div>
  );
}

function S1_MinUke() {
  const [tab, setTab] = useWS1('uke');
  const today = TASKS.filter(t => t.today);
  const brenner = TASKS.filter(t => t.prio === 'BRENNER' && !t.done);
  const week = TASKS.filter(t => !t.today && !t.done).slice(0, 5);
  const later = TASKS.slice(10);

  // Group week by day
  const days = ['Onsdag 29','Torsdag 30','Fredag 31','Lørdag 01.06','Søndag 02.06'];

  return (
    <div className="ab">
      <div className="scroll">
        <MiniTopbar role="coach" crumbs={<><span>COACHHQ</span> · <strong>WORKSPACE</strong></>}/>
        <WorkspaceHero
          eyebrow="COACHHQ · WORKSPACE"
          title="Min"
          titleItalic="uke"
          sub="23 OPPGAVER · 5 FORFALLER I DAG · 3 BRENNER"
          actions={<>
            <button className="btn btn-outline btn-sm"><WIcon.Filter/> Filter</button>
            <button className="btn btn-outline btn-sm"><WIcon.External/> Åpne Notion</button>
            <button className="btn btn-primary btn-sm"><Icon.Plus/> Ny oppgave</button>
          </>}
          kpis={[
            { label: 'I DAG', value: today.length, delta: `${today.filter(t => t.done).length} fullført`, deltaColor: 'success' },
            { label: 'DENNE UKA', value: 12, delta: '4 doing · 8 todo', deltaColor: 'muted' },
            { label: 'BLOKKERT', value: 2, delta: 'venter på spiller', deltaColor: 'warning' },
            { label: 'DELT MED MARKUS', value: 4, delta: '1 ny i dag', deltaColor: 'primary' },
          ]}
        />
        <WSTabs active={tab} onChange={setTab}/>

        <div style={{ padding: '24px 32px 64px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Brenner-strip */}
          <BrennerStrip tasks={brenner}/>

          {/* 3-kol */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 0.95fr', gap: 24 }}>
            {/* Kol 1: I dag */}
            <div>
              <ColumnHeader title="I dag" sub="TIR 27.05" count={today.length} accent/>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {today.map(t => <TaskRow key={t.id} t={t}/>)}
              </div>
              <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 8, border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em', cursor: 'pointer' }}>
                <Icon.Plus/> Legg til oppgave for i dag …
              </div>
            </div>

            {/* Kol 2: Denne uka */}
            <div>
              <ColumnHeader title="Denne uka" count={week.length}/>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {days.slice(0, 4).map((d, i) => {
                  const dayTasks = week.filter((_, idx) => idx % 4 === i).slice(0, i === 0 ? 2 : 1);
                  if (dayTasks.length === 0) return null;
                  return (
                    <div key={d}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 6 }}>{d}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {dayTasks.map(t => <TaskRow key={t.id} t={t} dense/>)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Kol 3: Senere / Backlog */}
            <div>
              <ColumnHeader title="Senere" sub="JUNI →" count={later.length}/>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {later.map(t => <TaskRow key={t.id} t={t} dense/>)}
              </div>
              <a href="#" style={{ display: 'inline-block', marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--primary)', letterSpacing: '0.04em', textDecoration: 'none', fontWeight: 700 }}>VIS ALLE 38 →</a>

              {/* Empty-state preview */}
              <div style={{ marginTop: 28, padding: 18, borderRadius: 12, background: '#fff', border: '1px solid var(--border-soft)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>EMPTY-STATE · NY COACH</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13.5, color: 'var(--fg)', marginTop: 8, lineHeight: 1.5 }}>
                  «Du har ingen oppgaver tildelt deg ennå. Anders får varsel når du har ledig kapasitet.»
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.S1_MinUke = S1_MinUke;

// ── Mobile ────────────────────────────────────────────────────────────
function S1_MinUke_Mobile() {
  const today = TASKS.filter(t => t.today);
  const brenner = TASKS.filter(t => t.prio === 'BRENNER' && !t.done);
  return (
    <PhoneFrame>
      <div style={{ padding: '6px 18px 12px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>COACHHQ · WORKSPACE</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 4 }}>Min <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>uke</em></h1>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.06em', marginTop: 4 }}>23 OPPGAVER · 5 I DAG · 3 BRENNER</div>
      </div>
      <div style={{ display: 'flex', gap: 0, background: '#fff', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
        {['Min uke','Oppgaver','Prosjekter','Tildelt','Notion'].map((t, i) => (
          <button key={t} style={{ padding: '10px 12px', flexShrink: 0, fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: i === 0 ? 'var(--fg)' : 'var(--muted)', background: 'transparent', border: 0, borderBottom: i === 0 ? '3px solid var(--accent)' : '3px solid transparent', marginBottom: -1, whiteSpace: 'nowrap' }}>{t}</button>
        ))}
      </div>
      <div className="ph-body">
        {brenner.length > 0 && (
          <div style={{ padding: 12, borderRadius: 10, background: 'rgba(163,45,45,0.05)', border: '1px solid rgba(163,45,45,0.20)', borderLeft: '3px solid var(--danger)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, color: 'var(--danger)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}><WIcon.Fire/> {brenner.length} BRENNER</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13.5, fontWeight: 600, marginTop: 6 }}>{brenner[0].title}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <button className="btn btn-primary btn-xs" style={{ flex: 1, justifyContent: 'center' }}>Fullfør</button>
              <button className="btn btn-outline btn-xs">Snooze</button>
            </div>
          </div>
        )}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.10em', textTransform: 'uppercase', marginTop: 4 }}>I DAG · TIR 27.05</div>
        {today.map(t => (
          <div key={t.id} style={{ padding: 12, background: '#fff', border: '1px solid var(--border-soft)', borderRadius: 10, display: 'grid', gridTemplateColumns: '20px 1fr auto', gap: 10, alignItems: 'center' }}>
            <TaskCheck done={t.done}/>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, textDecoration: t.done ? 'line-through' : 'none', color: t.done ? 'var(--muted)' : 'var(--fg)' }}>{t.title}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
                <ProjectPill company={t.project.company} name={t.project.name} compact/>
                <PrioDot kind={t.prio}/>
                <DueDate value={t.due} today={t.today}/>
              </div>
            </div>
            <SourceBadge kind={t.source}/>
          </div>
        ))}
      </div>
      <div className="ph-footer">
        <button className="btn btn-primary"><Icon.Plus/> Ny oppgave</button>
      </div>
    </PhoneFrame>
  );
}
window.S1_MinUke_Mobile = S1_MinUke_Mobile;
