// Workspace · Skjerm 2 — Oppgaver (Liste / Kanban / Kalender)
// /admin/workspace/oppgaver
const { useState: useWS2 } = React;

function ViewToggle({ value, onChange }) {
  const views = [
    { id: 'liste',    icon: <WIcon.List/>,    label: 'Liste' },
    { id: 'kanban',   icon: <WIcon.Grid/>,    label: 'Kanban' },
    { id: 'kalender', icon: <WIcon.CalGrid/>, label: 'Kalender' },
  ];
  return (
    <div style={{ display: 'inline-flex', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 999, padding: 3 }}>
      {views.map(v => (
        <button key={v.id} onClick={() => onChange(v.id)} style={{
          padding: '6px 12px', borderRadius: 999,
          fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600,
          color: value === v.id ? 'var(--fg)' : 'var(--muted)',
          background: value === v.id ? '#fff' : 'transparent',
          border: 0, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          boxShadow: value === v.id ? '0 1px 3px rgba(10,31,23,0.08)' : 'none',
        }}>{v.icon} {v.label}</button>
      ))}
    </div>
  );
}

function FilterBar() {
  return (
    <div style={{
      display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
      padding: '14px 32px', background: '#fff', borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, minWidth: 240 }}>
        <Icon.Search/>
        <input style={{ border: 0, background: 'transparent', outline: 'none', flex: 1, fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg)' }} placeholder="Søk i oppgaver …"/>
      </div>
      <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }}/>
      <button className="filter-pill active">Alle <span className="count">23</span></button>
      <button className="filter-pill">TODO <span className="count">12</span></button>
      <button className="filter-pill">DOING <span className="count">4</span></button>
      <button className="filter-pill">DONE <span className="count">5</span></button>
      <button className="filter-pill">BLOKKERT <span className="count">2</span></button>
      <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }}/>
      <button className="filter-pill">Prosjekt: 3 <Icon.Arrow/></button>
      <button className="filter-pill">Synlighet: Mine</button>
      <button className="filter-pill">Prioritet</button>
      <a href="#" style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', textDecoration: 'underline', textUnderlineOffset: 2 }}>Rydd filter</a>
    </div>
  );
}

function ListView() {
  const grouped = {
    DOING: TASKS.filter(t => t.status === 'DOING'),
    TODO: TASKS.filter(t => t.status === 'TODO' && !t.done),
    BLOKKERT: TASKS.filter(t => t.status === 'BLOKKERT'),
    DONE: TASKS.filter(t => t.done),
  };
  return (
    <div style={{ padding: '20px 32px 48px' }}>
      {Object.entries(grouped).map(([status, tasks]) => tasks.length > 0 && (
        <div key={status} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <StatusPill kind={status}/>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}>{tasks.length}</span>
          </div>
          {/* Column headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: '20px 1fr 140px 88px 80px 100px 80px 60px',
            gap: 12, alignItems: 'center',
            padding: '8px 14px', background: 'var(--bg)', borderRadius: 8,
            fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.10em', textTransform: 'uppercase',
          }}>
            <div/>
            <div>Oppgave</div>
            <div>Prosjekt</div>
            <div>Prio</div>
            <div>Forfaller</div>
            <div>Tildelt</div>
            <div>Synlighet</div>
            <div>Kilde</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {tasks.map(t => (
              <div key={t.id} style={{
                display: 'grid', gridTemplateColumns: '20px 1fr 140px 88px 80px 100px 80px 60px',
                gap: 12, alignItems: 'center',
                padding: '12px 14px', borderBottom: '1px solid var(--border-soft)',
                background: '#fff', opacity: t.done ? 0.55 : 1,
              }}>
                <TaskCheck done={t.done}/>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {t.brenner && <span style={{ color: 'var(--danger)' }}><WIcon.Fire/></span>}
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</span>
                </div>
                <ProjectPill company={t.project.company} name={t.project.name} compact/>
                <PrioDot kind={t.prio} withLabel/>
                <DueDate value={t.due} today={t.today}/>
                <AvatarStack items={t.assigned.map(k => PEOPLE[k])} size={20}/>
                <VisibilityPill kind={t.vis} compact/>
                <SourceBadge kind={t.source}/>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function KanbanCard({ t }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)', borderLeft: t.brenner ? '3px solid var(--danger)' : '1px solid var(--border)',
      borderRadius: 10, padding: 12, cursor: 'grab',
      display: 'flex', flexDirection: 'column', gap: 8,
      boxShadow: '0 1px 2px rgba(10,31,23,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        {t.brenner && <span style={{ color: 'var(--danger)', marginTop: 2 }}><WIcon.Fire/></span>}
        <div style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: 13.5, fontWeight: 600, lineHeight: 1.3 }}>{t.title}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <ProjectPill company={t.project.company} name={t.project.name} compact/>
        <PrioDot kind={t.prio}/>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, paddingTop: 8, borderTop: '1px solid var(--border-soft)' }}>
        <DueDate value={t.due} today={t.today}/>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <VisibilityIcon kind={t.vis}/>
          <SourceBadge kind={t.source}/>
          <AvatarStack items={t.assigned.map(k => PEOPLE[k])} size={18} max={2}/>
        </div>
      </div>
    </div>
  );
}

function KanbanCol({ status, title, accent }) {
  const tasks = TASKS.filter(t => status === 'DONE' ? t.done : (t.status === status && !t.done));
  const s = STATUS[status];
  return (
    <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 540 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 4px 6px', borderBottom: accent ? '2px solid var(--accent)' : '1px solid var(--border)' }}>
        <StatusPill kind={status}/>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700, color: 'var(--muted)' }}>{tasks.length}</span>
        <button style={{ marginLeft: 'auto', background: 'transparent', border: 0, color: 'var(--muted)', cursor: 'pointer' }}><Icon.Plus/></button>
      </div>
      {tasks.map(t => <KanbanCard key={t.id} t={t}/>)}
      <button style={{ padding: 12, border: '1px dashed var(--border)', borderRadius: 10, color: 'var(--muted)', background: 'transparent', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer' }}>+ NY</button>
    </div>
  );
}

function KanbanView() {
  return (
    <div style={{ padding: '20px 32px 48px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <KanbanCol status="TODO" title="Todo"/>
        <KanbanCol status="DOING" title="Doing" accent/>
        <KanbanCol status="DONE" title="Done"/>
      </div>
    </div>
  );
}

function CalView() {
  // Minimal calendar mockup — placeholder week with tasks on days
  const days = ['MAN','TIR','ONS','TOR','FRE','LØR','SØN'];
  const dates = ['26','27','28','29','30','31','01'];
  const taskOnDay = (i) => TASKS.filter((_, idx) => idx % 7 === i).slice(0, 2 + (i % 2));
  return (
    <div style={{ padding: '20px 32px 48px' }}>
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
          {days.map((d, i) => (
            <div key={d} style={{ padding: '14px 16px', borderRight: i < 6 ? '1px solid var(--border)' : 0, display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.12em' }}>{d}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: i === 1 ? 'var(--primary)' : 'var(--fg)' }}>{dates[i]}</span>
              {i === 1 && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', alignSelf: 'center' }}/>}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: 400 }}>
          {days.map((d, i) => (
            <div key={d} style={{ padding: 10, borderRight: i < 6 ? '1px solid var(--border-soft)' : 0, display: 'flex', flexDirection: 'column', gap: 6, background: i === 1 ? 'rgba(209,248,67,0.06)' : '#fff' }}>
              {taskOnDay(i).map(t => (
                <div key={t.id} style={{
                  padding: '6px 8px', borderRadius: 6,
                  background: COMPANY[t.project.company].bg,
                  borderLeft: `2px solid ${COMPANY[t.project.company].bar}`,
                  fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600,
                  color: COMPANY[t.project.company].fg, lineHeight: 1.3,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <PrioDot kind={t.prio}/>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function S2_Oppgaver() {
  const [view, setView] = useWS2('liste');
  return (
    <div className="ab">
      <div className="scroll">
        <MiniTopbar role="coach" crumbs={<><span>COACHHQ</span> · <span>WORKSPACE</span> · <strong>OPPGAVER</strong></>}/>
        <WorkspaceHero
          eyebrow="COACHHQ · WORKSPACE"
          title="Alle"
          titleItalic="oppgaver"
          sub="23 OPPGAVER · 4 DOING · 2 BLOKKERT"
          actions={<>
            <ViewToggle value={view} onChange={setView}/>
            <button className="btn btn-outline btn-sm"><WIcon.External/> Notion</button>
            <button className="btn btn-primary btn-sm"><Icon.Plus/> Ny oppgave</button>
          </>}
        />
        <WSTabs active="oppgaver"/>
        <FilterBar/>
        {view === 'liste' && <ListView/>}
        {view === 'kanban' && <KanbanView/>}
        {view === 'kalender' && <CalView/>}
      </div>
    </div>
  );
}
window.S2_Oppgaver = S2_Oppgaver;

// ── Mobile ────────────────────────────────────────────────────────────
function S2_Oppgaver_Mobile() {
  return (
    <PhoneFrame>
      <div style={{ padding: '6px 18px 12px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>WORKSPACE · OPPGAVER</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginTop: 4 }}>Alle <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>oppgaver</em></h1>
      </div>
      {/* Tabs (scrollable) */}
      <div style={{ display: 'flex', gap: 0, background: '#fff', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
        {['Min uke','Oppgaver','Prosjekter','Tildelt','Notion'].map((t, i) => (
          <button key={t} style={{ padding: '10px 12px', flexShrink: 0, fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600, color: i === 1 ? 'var(--fg)' : 'var(--muted)', background: 'transparent', border: 0, borderBottom: i === 1 ? '3px solid var(--accent)' : '3px solid transparent', marginBottom: -1, whiteSpace: 'nowrap' }}>{t}</button>
        ))}
      </div>
      {/* Filter strip */}
      <div style={{ display: 'flex', gap: 6, padding: '10px 14px', overflowX: 'auto', background: '#fff', borderBottom: '1px solid var(--border-soft)' }}>
        {['ALLE 23','TODO 12','DOING 4','DONE 5','BLOKK 2'].map((s, i) => (
          <span key={s} style={{ padding: '4px 10px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', background: i === 0 ? 'var(--fg)' : 'var(--bg)', color: i === 0 ? 'var(--accent)' : 'var(--muted)', whiteSpace: 'nowrap' }}>{s}</span>
        ))}
      </div>
      <div className="ph-body">
        {TASKS.slice(0, 6).map(t => (
          <div key={t.id} style={{ padding: 12, background: '#fff', border: '1px solid var(--border-soft)', borderRadius: 10, display: 'grid', gridTemplateColumns: '20px 1fr', gap: 10, alignItems: 'flex-start' }}>
            <TaskCheck done={t.done}/>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, alignItems: 'center' }}>
                <ProjectPill company={t.project.company} compact/>
                <StatusPill kind={t.status} compact/>
                <PrioDot kind={t.prio}/>
                <DueDate value={t.due} today={t.today}/>
                <SourceBadge kind={t.source}/>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="ph-footer">
        <button className="btn btn-primary"><Icon.Plus/> Ny oppgave</button>
      </div>
    </PhoneFrame>
  );
}
window.S2_Oppgaver_Mobile = S2_Oppgaver_Mobile;
