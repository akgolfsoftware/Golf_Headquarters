// Workspace · Skjerm 4 — Prosjekter (grid)
// /admin/workspace/prosjekter
const { useState: useWS4 } = React;

function ProjectCard({ p }) {
  const c = COMPANY[p.company];
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)', borderRadius: 16,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      transition: 'transform 100ms, box-shadow 100ms',
      cursor: 'pointer',
    }}>
      {/* Cover-strip */}
      <div style={{ height: 8, background: c.bar }}/>
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {c.name} · <span style={{ color: p.status === 'AKTIV' ? 'var(--success)' : p.status === 'PAUSE' ? 'var(--warning)' : 'var(--muted-soft)' }}>{p.status}</span>
          </div>
          <VisibilityIcon kind={p.vis}/>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2 }}>{p.title}</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.desc}</div>
        </div>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.04em' }}>
          <div><strong style={{ display: 'block', fontSize: 14, color: 'var(--fg)', fontWeight: 700 }}>{p.open}</strong>open</div>
          <div><strong style={{ display: 'block', fontSize: 14, color: 'var(--fg)', fontWeight: 700 }}>{p.doing}</strong>doing</div>
          <div><strong style={{ display: 'block', fontSize: 14, color: 'var(--success)', fontWeight: 700 }}>{p.done}</strong>done</div>
          <div><strong style={{ display: 'block', fontSize: 14, color: 'var(--muted)', fontWeight: 700 }}>{p.total}</strong>total</div>
        </div>
        {/* Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.10em' }}>FREMDRIFT</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--fg)' }}>{p.pct}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${p.pct}%`, background: 'var(--accent)', borderRadius: 3 }}/>
          </div>
        </div>
        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border-soft)', marginTop: 'auto' }}>
          <AvatarStack items={p.assigned.map(k => PEOPLE[k])} size={22}/>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.04em' }}>FRIST {p.due}</div>
          <Icon.Arrow/>
        </div>
      </div>
    </div>
  );
}

function S4_Prosjekter() {
  const [filter, setFilter] = useWS4('alle');
  return (
    <div className="ab">
      <div className="scroll">
        <MiniTopbar role="coach" crumbs={<><span>COACHHQ</span> · <span>WORKSPACE</span> · <strong>PROSJEKTER</strong></>}/>
        <WorkspaceHero
          eyebrow="COACHHQ · WORKSPACE"
          title="Prosjekter"
          sub={`${PROJECTS.length} TOTALT · ${PROJECTS.filter(p => p.status === 'AKTIV').length} AKTIVE · 1 PÅ PAUSE`}
          actions={<>
            <button className="btn btn-outline btn-sm"><WIcon.External/> Notion</button>
            <button className="btn btn-primary btn-sm"><Icon.Plus/> Nytt prosjekt</button>
          </>}
        />
        <WSTabs active="prosjekter"/>

        {/* Filter strip */}
        <div style={{ padding: '14px 32px', background: '#fff', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className={`filter-pill ${filter === 'alle' ? 'active' : ''}`} onClick={() => setFilter('alle')}>Alle <span className="count">{PROJECTS.length}</span></button>
          <button className={`filter-pill ${filter === 'aktive' ? 'active' : ''}`} onClick={() => setFilter('aktive')}>Aktive <span className="count">{PROJECTS.filter(p => p.status === 'AKTIV').length}</span></button>
          <button className={`filter-pill ${filter === 'pause' ? 'active' : ''}`} onClick={() => setFilter('pause')}>Pause <span className="count">1</span></button>
          <button className={`filter-pill ${filter === 'arkiv' ? 'active' : ''}`} onClick={() => setFilter('arkiv')}>Arkivert <span className="count">1</span></button>
          <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }}/>
          <button className="filter-pill">Selskap</button>
          <button className="filter-pill">Eier: Meg</button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon.Search/>
            <input style={{ border: 0, background: 'transparent', outline: 'none', fontFamily: 'var(--font-body)', fontSize: 12.5, width: 200 }} placeholder="Søk prosjekt …"/>
          </div>
        </div>

        {/* Grid */}
        <div style={{ padding: '24px 32px 64px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {PROJECTS.map(p => <ProjectCard key={p.id} p={p}/>)}
          {/* Empty-state-styled "new" card */}
          <div style={{ background: 'var(--bg)', border: '1.5px dashed var(--border)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 260, color: 'var(--muted)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Plus/></div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>Nytt prosjekt</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.04em', textAlign: 'center', lineHeight: 1.5 }}>Sync med Notion eller<br/>opprett manuelt</div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.S4_Prosjekter = S4_Prosjekter;

// ── Mobile ────────────────────────────────────────────────────────────
function S4_Prosjekter_Mobile() {
  return (
    <PhoneFrame>
      <div style={{ padding: '6px 18px 12px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>WORKSPACE</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginTop: 4 }}>Prosjekter</h1>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--muted)', marginTop: 4, letterSpacing: '0.06em' }}>{PROJECTS.length} TOTALT · {PROJECTS.filter(p => p.status === 'AKTIV').length} AKTIVE</div>
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '10px 14px', overflowX: 'auto', background: '#fff', borderBottom: '1px solid var(--border-soft)' }}>
        {['Alle 9','Aktive 7','Pause','AK','MULLIGAN','WANG'].map((s, i) => (
          <span key={s} style={{ padding: '4px 10px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, background: i === 0 ? 'var(--fg)' : 'var(--bg)', color: i === 0 ? 'var(--accent)' : 'var(--muted)', whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>{s}</span>
        ))}
      </div>
      <div className="ph-body">
        {PROJECTS.slice(0, 4).map(p => <ProjectCard key={p.id} p={p}/>)}
      </div>
      <div className="ph-footer">
        <button className="btn btn-primary"><Icon.Plus/> Nytt prosjekt</button>
      </div>
    </PhoneFrame>
  );
}
window.S4_Prosjekter_Mobile = S4_Prosjekter_Mobile;
