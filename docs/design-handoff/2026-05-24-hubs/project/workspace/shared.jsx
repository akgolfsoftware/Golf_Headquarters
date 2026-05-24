// Workspace · shared primitives
// Loaded BEFORE any sN-workspace-*.jsx file.
// Reuses Icon + MiniTopbar + Avatar + PhoneFrame from manglende/shared.jsx — make
// sure that file loads first if you import workspace stand-alone.

// ── Extra icons ──────────────────────────────────────────────────────
const WIcon = {
  Lock: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>,
  Users: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11"/></svg>,
  Globe: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a14 14 0 0 1 0 20M12 2a14 14 0 0 0 0 20"/></svg>,
  Cap: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 3 3 6 3s6-1.34 6-3v-5"/></svg>,
  Briefcase: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  Filter: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54z"/></svg>,
  Fire: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c0 4-3 5-3 9a3 3 0 0 0 6 0c0-2-1-2-1-4 3 1 5 4 5 8a7 7 0 0 1-14 0c0-5 3-7 7-13z"/></svg>,
  External: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>,
  More: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>,
  Clock: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  Pin: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17v5M9 10.76V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4.76l3 3.24H6z"/></svg>,
  Snooze: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12L6 20h12"/></svg>,
  Grid: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  List: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>,
  CalGrid: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>,
  Refresh: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></svg>,
  Block: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
};
window.WIcon = WIcon;

// ── Visibility primitives ────────────────────────────────────────────
// 🔒 PRIVAT / 👥 AK GOLF / 🎓 JUNIOR COACH / 💼 ANDRE SELSKAP / 🌐 ALLE
const VIS = {
  PRIVAT:     { icon: <WIcon.Lock/>,      label: 'PRIVAT',       bg: 'rgba(94,92,87,0.14)',    fg: 'var(--muted)' },
  AK:         { icon: <WIcon.Users/>,     label: 'AK GOLF',      bg: 'rgba(0,88,64,0.10)',     fg: 'var(--primary)' },
  JUNIOR:     { icon: <WIcon.Cap/>,       label: 'JR COACH',     bg: 'rgba(209,248,67,0.42)',  fg: '#3B4310' },
  SELSKAP:    { icon: <WIcon.Briefcase/>, label: 'MULLIGAN',     bg: 'rgba(184,133,42,0.15)',  fg: '#7A5919' },
  ALLE:       { icon: <WIcon.Globe/>,     label: 'ALLE COACHES', bg: 'rgba(44,125,82,0.16)',   fg: 'var(--success)' },
};
window.VIS = VIS;

function VisibilityPill({ kind, label, compact }) {
  const v = VIS[kind] || VIS.PRIVAT;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: compact ? '2px 6px' : '3px 8px',
      borderRadius: 999, background: v.bg, color: v.fg,
      fontFamily: 'var(--font-mono)', fontSize: compact ? 9 : 9.5, fontWeight: 700,
      letterSpacing: '0.08em', textTransform: 'uppercase',
    }}>
      {v.icon}
      {!compact && (label || v.label)}
    </span>
  );
}
window.VisibilityPill = VisibilityPill;

function VisibilityIcon({ kind }) {
  const v = VIS[kind] || VIS.PRIVAT;
  return (
    <span style={{ width: 16, height: 16, borderRadius: 4, background: v.bg, color: v.fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} title={v.label}>{v.icon}</span>
  );
}
window.VisibilityIcon = VisibilityIcon;

// ── Source badge (Notion / Manual) ───────────────────────────────────
function SourceBadge({ kind }) {
  if (kind === 'N') return (
    <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--fg)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, flexShrink: 0 }} title="Synket fra Notion">N</span>
  );
  return (
    <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--bg)', color: 'var(--muted)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, flexShrink: 0 }} title="Manuell">M</span>
  );
}
window.SourceBadge = SourceBadge;

// ── Priority dot ─────────────────────────────────────────────────────
const PRIO = {
  BRENNER: { c: 'var(--danger)', l: 'BRENNER' },
  HOY:     { c: '#B8852A',       l: 'HØY' },
  MED:     { c: '#2E63A8',       l: 'MED' },
  LAV:     { c: 'var(--muted-soft)', l: 'LAV' },
};
function PrioDot({ kind, withLabel }) {
  const p = PRIO[kind] || PRIO.MED;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }} title={p.l}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.c, flexShrink: 0 }}/>
      {withLabel && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, color: p.c, letterSpacing: '0.08em' }}>{p.l}</span>}
    </span>
  );
}
window.PrioDot = PrioDot;

// ── Project pill (color by company) ──────────────────────────────────
const COMPANY = {
  AK:       { bg: 'rgba(0,88,64,0.10)',     fg: 'var(--primary)', bar: '#005840', name: 'AK GOLF' },
  MULLIGAN: { bg: 'rgba(184,133,42,0.15)',  fg: '#7A5919',        bar: '#B8852A', name: 'MULLIGAN' },
  WANG:     { bg: 'rgba(64,40,90,0.14)',    fg: '#4A2E66',        bar: '#624483', name: 'WANG TOPP' },
  SKARP:    { bg: 'rgba(44,125,82,0.14)',   fg: 'var(--success)', bar: '#2C7D52', name: 'SKARPNORD' },
  PRIVAT:   { bg: 'rgba(94,92,87,0.10)',    fg: 'var(--muted)',   bar: '#9C9990', name: 'PRIVAT' },
};
window.COMPANY = COMPANY;

function ProjectPill({ company, name, compact }) {
  const c = COMPANY[company] || COMPANY.AK;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: compact ? '2px 7px' : '3px 9px', borderRadius: 999,
      background: c.bg, color: c.fg,
      fontFamily: 'var(--font-mono)', fontSize: compact ? 9 : 9.5, fontWeight: 700,
      letterSpacing: '0.06em', textTransform: 'uppercase',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.bar, flexShrink: 0 }}/>
      {name || c.name}
    </span>
  );
}
window.ProjectPill = ProjectPill;

// ── Round checkbox ───────────────────────────────────────────────────
function TaskCheck({ done, onClick, size = 18 }) {
  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: '50%',
      border: done ? 'none' : '1.5px solid var(--border)',
      background: done ? 'var(--primary)' : '#fff',
      color: 'var(--accent)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', flexShrink: 0, padding: 0,
      transition: 'background 80ms, border 80ms',
    }}>
      {done && <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
    </button>
  );
}
window.TaskCheck = TaskCheck;

// ── Avatar stack ─────────────────────────────────────────────────────
function AvatarStack({ items, max = 3, size = 22 }) {
  const visible = items.slice(0, max);
  const overflow = items.length - max;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      {visible.map((p, i) => (
        <div key={i} className={`p-avatar ${p.color}`} style={{ width: size, height: size, fontSize: size * 0.42, marginLeft: i === 0 ? 0 : -6, border: '2px solid #fff', position: 'relative', zIndex: 10 - i }}>
          {p.initials || p.name.split(' ').map(n => n[0]).slice(0,2).join('')}
        </div>
      ))}
      {overflow > 0 && (
        <div style={{ width: size, height: size, marginLeft: -6, background: 'var(--bg)', color: 'var(--muted)', border: '2px solid #fff', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: size * 0.38, fontWeight: 700 }}>+{overflow}</div>
      )}
    </div>
  );
}
window.AvatarStack = AvatarStack;

// ── Due-date formatter ───────────────────────────────────────────────
function DueDate({ value, today, overdue }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 10.5,
      color: overdue ? 'var(--danger)' : today ? 'var(--fg)' : 'var(--muted)',
      letterSpacing: '0.04em', fontStyle: today ? 'normal' : 'normal',
      fontWeight: today ? 700 : 500,
    }}>
      {today ? 'I DAG' : value}
    </span>
  );
}
window.DueDate = DueDate;

// ── Task row (compact, reusable) ─────────────────────────────────────
function TaskRow({ t, dense, draggable }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '20px 1fr auto auto auto auto auto',
      gap: 10, alignItems: 'center',
      padding: dense ? '7px 10px' : '10px 12px',
      borderRadius: 8,
      background: t.brenner ? 'rgba(163,45,45,0.04)' : '#fff',
      border: '1px solid ' + (t.brenner ? 'rgba(163,45,45,0.20)' : 'var(--border-soft)'),
      cursor: draggable ? 'grab' : 'pointer',
      opacity: t.done ? 0.55 : 1,
    }}>
      <TaskCheck done={t.done}/>
      <div style={{
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
        color: 'var(--fg)', textDecoration: t.done ? 'line-through' : 'none',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{t.title}</div>
      {t.project && <ProjectPill company={t.project.company} name={t.project.name} compact/>}
      <PrioDot kind={t.prio}/>
      <DueDate value={t.due} today={t.today} overdue={t.overdue}/>
      <VisibilityIcon kind={t.vis}/>
      <SourceBadge kind={t.source}/>
    </div>
  );
}
window.TaskRow = TaskRow;

// ── KPI cell ─────────────────────────────────────────────────────────
function KPI({ label, value, delta, deltaColor }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginTop: 4, letterSpacing: '-0.015em' }}>{value}</div>
      {delta && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: `var(--${deltaColor || 'muted'})`, marginTop: 2, letterSpacing: '0.04em' }}>{delta}</div>}
    </div>
  );
}
window.KPI = KPI;

// ── Workspace hero (shared across screens) ───────────────────────────
function WorkspaceHero({ eyebrow, title, titleItalic, sub, actions, kpis }) {
  return (
    <div style={{ padding: '28px 32px 22px', background: 'linear-gradient(180deg, #FBFAF5 0%, var(--bg) 100%)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{eyebrow}</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 8 }}>
            {title} {titleItalic && <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>{titleItalic}</em>}
          </h1>
          {sub && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--muted)', letterSpacing: '0.04em', marginTop: 10 }}>{sub}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>{actions}</div>
      </div>
      {kpis && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${kpis.length}, 1fr)`, gap: 24, marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border)' }}>
          {kpis.map((k, i) => <KPI key={i} {...k}/>)}
        </div>
      )}
    </div>
  );
}
window.WorkspaceHero = WorkspaceHero;

// ── Workspace tab bar ────────────────────────────────────────────────
function WSTabs({ active, onChange }) {
  const tabs = [
    { id: 'uke',       l: 'Min uke' },
    { id: 'oppgaver',  l: 'Oppgaver' },
    { id: 'prosjekter',l: 'Prosjekter' },
    { id: 'tildelt',   l: 'Tildelt meg', count: 4 },
    { id: 'notion',    l: 'Notion' },
  ];
  return (
    <div style={{ display: 'flex', gap: 0, background: '#fff', borderBottom: '1px solid var(--border)', padding: '0 32px' }}>
      {tabs.map(t => (
        <a key={t.id} href="#" onClick={(e) => { e.preventDefault(); onChange && onChange(t.id); }} style={{
          padding: '14px 18px', background: 'transparent', border: 0,
          fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600,
          color: active === t.id ? 'var(--fg)' : 'var(--muted)',
          borderBottom: active === t.id ? '3px solid var(--accent)' : '3px solid transparent',
          marginBottom: -1, cursor: 'pointer', textDecoration: 'none',
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          {t.l}
          {t.count && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: active === t.id ? 'var(--primary)' : 'var(--muted-soft)', background: active === t.id ? 'rgba(0,88,64,0.08)' : 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>{t.count}</span>}
        </a>
      ))}
    </div>
  );
}
window.WSTabs = WSTabs;

// ── Status pill ──────────────────────────────────────────────────────
const STATUS = {
  TODO:     { bg: 'rgba(94,92,87,0.14)',   fg: 'var(--muted)',   l: 'TODO' },
  DOING:    { bg: 'rgba(209,248,67,0.45)', fg: '#3B4310',        l: 'DOING' },
  DONE:     { bg: 'rgba(44,125,82,0.16)',  fg: 'var(--success)', l: 'DONE' },
  BLOKKERT: { bg: 'rgba(163,45,45,0.10)',  fg: 'var(--danger)',  l: 'BLOKKERT' },
};
window.STATUS = STATUS;

function StatusPill({ kind, compact }) {
  const s = STATUS[kind] || STATUS.TODO;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: compact ? '2px 7px' : '3px 9px', borderRadius: 999,
      background: s.bg, color: s.fg,
      fontFamily: 'var(--font-mono)', fontSize: compact ? 9 : 9.5, fontWeight: 700,
      letterSpacing: '0.10em',
    }}>{s.l}</span>
  );
}
window.StatusPill = StatusPill;

// ── Sample data (shared across screens) ──────────────────────────────
const PEOPLE = {
  AK: { name: 'Anders Kvam', initials: 'AK', color: 'c2' },
  MR: { name: 'Markus R.P.', initials: 'MR', color: 'c1' },
  SL: { name: 'Sofie L.', initials: 'SL', color: 'c3' },
  HT: { name: 'Henrik T.', initials: 'HT', color: 'c4' },
  IB: { name: 'Ingrid B.', initials: 'IB', color: 'c5' },
};
window.PEOPLE = PEOPLE;

const TASKS = [
  // I dag
  { id: 1, title: 'Forberede Markus\' økt 14:00 — putt-fokus', project: { company: 'AK', name: 'AK COACHING' }, prio: 'BRENNER', due: 'I dag 13:30', today: true, vis: 'AK', source: 'N', brenner: true, done: false, status: 'DOING', assigned: ['AK'], est: '0,5t' },
  { id: 2, title: 'Sende faktura Mulligan · mai', project: { company: 'MULLIGAN', name: 'MULLIGAN' }, prio: 'BRENNER', due: 'I dag', today: true, vis: 'SELSKAP', source: 'N', brenner: true, done: false, status: 'TODO', assigned: ['AK'], est: '1t' },
  { id: 3, title: 'Avklare Trackman-leie sommer 2026', project: { company: 'AK', name: 'AK COACHING' }, prio: 'HOY', due: 'I dag 17:00', today: true, vis: 'AK', source: 'M', done: false, status: 'TODO', assigned: ['AK', 'MR'], est: '1t' },
  { id: 4, title: 'Svare Olyo Tour om sponsorpakke', project: { company: 'AK', name: 'OLYO 2026' }, prio: 'HOY', due: 'I dag', today: true, vis: 'AK', source: 'N', done: false, status: 'TODO', assigned: ['AK'], est: '0,5t' },
  { id: 5, title: 'Junior NM · registrering Ada N-B.', project: { company: 'AK', name: 'AK COACHING' }, prio: 'MED', due: 'I dag', today: true, vis: 'JUNIOR', source: 'N', done: true, status: 'DONE', assigned: ['MR'], est: '0,5t' },

  // Denne uka
  { id: 6, title: 'Onboarde Sofie i Trackman-konto', project: { company: 'AK', name: 'AK COACHING' }, prio: 'MED', due: 'Ons 29.05', vis: 'JUNIOR', source: 'N', done: false, status: 'TODO', assigned: ['MR'], est: '1t' },
  { id: 7, title: 'Booke Mulligan-bay 4 til Wang-camp', project: { company: 'WANG', name: 'WANG SAMLING' }, prio: 'HOY', due: 'Tor 30.05', vis: 'SELSKAP', source: 'N', done: false, status: 'TODO', assigned: ['AK'], est: '0,5t' },
  { id: 8, title: 'Skrive sommerplan for talent-spillere', project: { company: 'AK', name: 'AK COACHING' }, prio: 'MED', due: 'Fre 31.05', vis: 'AK', source: 'M', done: false, status: 'DOING', assigned: ['AK'], est: '3t' },
  { id: 9, title: 'Oppdatere Skarpnord års-strategi', project: { company: 'SKARP', name: 'SKARPNORD' }, prio: 'MED', due: 'Lør 01.06', vis: 'SELSKAP', source: 'N', done: false, status: 'TODO', assigned: ['AK'], est: '2t' },
  { id: 10, title: 'Privat: bestille båt-sjekk · Bjøllerud', project: { company: 'PRIVAT', name: 'PRIVAT' }, prio: 'LAV', due: 'Søn 02.06', vis: 'PRIVAT', source: 'M', done: false, status: 'TODO', assigned: ['AK'], est: '0,5t' },

  // Senere
  { id: 11, title: 'Lese gjennom Wang sommer-CV', project: { company: 'WANG', name: 'WANG TOPP' }, prio: 'LAV', due: '04.06', vis: 'SELSKAP', source: 'N', done: false, status: 'TODO', assigned: ['AK'], est: '1,5t' },
  { id: 12, title: 'Lufte ny pricing for privattimer', project: { company: 'AK', name: 'AK COACHING' }, prio: 'MED', due: '06.06', vis: 'AK', source: 'M', done: false, status: 'TODO', assigned: ['AK'], est: '2t' },
  { id: 13, title: 'Innspilling: short-game-serie ep. 3', project: { company: 'AK', name: 'AK CONTENT' }, prio: 'MED', due: '08.06', vis: 'ALLE', source: 'N', done: false, status: 'TODO', assigned: ['AK', 'MR'], est: '4t' },
  { id: 14, title: 'Lese ut Capto-data fra mai', project: { company: 'AK', name: 'AK COACHING' }, prio: 'LAV', due: '10.06', vis: 'AK', source: 'M', done: false, status: 'TODO', assigned: ['AK'], est: '1,5t' },
];
window.TASKS = TASKS;

const PROJECTS = [
  { id: 'p1', company: 'AK',       title: 'AK Coaching · Sesong 2026',       desc: 'Daglig drift, økt-planlegging, spiller-utvikling. Hovedmotoren.', open: 14, doing: 6, done: 42, total: 62, pct: 68, assigned: ['AK','MR'], vis: 'AK', status: 'AKTIV', due: 'AUG 2026' },
  { id: 'p2', company: 'MULLIGAN', title: 'Mulligan Studio · drift',         desc: 'Bay-bookinger, vedlikehold, Trackman-konfig. Co-eier med AK.', open: 8, doing: 2, done: 24, total: 34, pct: 76, assigned: ['AK'], vis: 'SELSKAP', status: 'AKTIV', due: 'KONT.' },
  { id: 'p3', company: 'WANG',     title: 'Wang Toppidrett · samarbeid',     desc: 'Coach-pool, sommer-camp, evaluering av talent.', open: 5, doing: 1, done: 12, total: 18, pct: 72, assigned: ['AK'], vis: 'SELSKAP', status: 'AKTIV', due: 'JUN 2026' },
  { id: 'p4', company: 'AK',       title: 'Olyo Tour · norske spillere',     desc: 'Påmelding, reiselogistikk og resultatoppfølging.', open: 9, doing: 3, done: 8, total: 20, pct: 55, assigned: ['AK','MR'], vis: 'AK', status: 'AKTIV', due: 'OKT 2026' },
  { id: 'p5', company: 'SKARP',    title: 'Skarpnord · års-strategi',        desc: 'Investerings-thesis og pipeline-oppdatering 2026.', open: 4, doing: 0, done: 6, total: 10, pct: 60, assigned: ['AK'], vis: 'SELSKAP', status: 'PAUSE', due: 'DES 2026' },
  { id: 'p6', company: 'AK',       title: 'AK Content · short-game serie',   desc: '10 episoder · YouTube + Instagram. Filming Q2–Q3.', open: 6, doing: 2, done: 4, total: 12, pct: 50, assigned: ['AK','MR'], vis: 'ALLE', status: 'AKTIV', due: 'SEP 2026' },
  { id: 'p7', company: 'PRIVAT',   title: 'Bjøllerud · oppussing',           desc: 'Personlig prosjekt. Bad og kjøkken sommeren 2026.', open: 3, doing: 1, done: 7, total: 11, pct: 73, assigned: ['AK'], vis: 'PRIVAT', status: 'AKTIV', due: 'AUG 2026' },
  { id: 'p8', company: 'AK',       title: 'AK Foreldre-portal v2',           desc: 'Re-design og tekniske endringer for foreldre-onboarding.', open: 2, doing: 0, done: 18, total: 20, pct: 90, assigned: ['AK'], vis: 'AK', status: 'ARKIVERT', due: 'MAR 2026' },
  { id: 'p9', company: 'AK',       title: 'AK Talent · scout 2026/27',       desc: 'Identifisere juniorer for neste-års pulje.', open: 7, doing: 1, done: 3, total: 11, pct: 36, assigned: ['MR'], vis: 'JUNIOR', status: 'AKTIV', due: 'NOV 2026' },
];
window.PROJECTS = PROJECTS;
