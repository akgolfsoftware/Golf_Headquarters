// Workspace · Skjerm 5 — Notion-tilkobling
// /admin/workspace/notion · empty-state ELLER koblet-state
const { useState: useWS5 } = React;

const NOTION_LOGO = () => (
  <svg viewBox="0 0 60 60" width="48" height="48"><rect width="60" height="60" rx="12" fill="#000"/><text x="30" y="44" textAnchor="middle" fontSize="36" fontWeight="800" fontFamily="serif" fill="#fff">N</text></svg>
);

function EmptyState() {
  return (
    <div style={{ padding: '32px 32px 64px', maxWidth: 920, margin: '0 auto' }}>
      <div className="card" style={{ padding: 36, display: 'grid', gridTemplateColumns: '160px 1fr', gap: 28, alignItems: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><NOTION_LOGO/></div>
        <div>
          <div className="label-mono" style={{ marginBottom: 8 }}>NOTION · IKKE TILKOBLET</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Koble til Notion for å synkronisere dine <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>oppgaver og prosjekter</em> automatisk
          </h2>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--muted)', marginTop: 10, lineHeight: 1.55 }}>
            CoachHQ leser oppgaver og prosjekter fra dine Notion-databaser. Endringer i Notion oppdaterer CoachHQ innen 4 min — endringer i CoachHQ skyves tilbake til Notion innen 30 sek.
          </div>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <div className="label-mono" style={{ marginBottom: 14 }}>SLIK FUNGERER DET</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { n: '1', t: 'Logg inn med Notion-konto', d: 'OAuth via Notions offisielle integrasjon. Vi får aldri ditt passord.' },
            { n: '2', t: 'Velg databaser å synke', d: 'Plukk ut akkurat de databasene CoachHQ skal lese — du har full kontroll.' },
            { n: '3', t: 'Kartlegg felter', d: 'Status, Prioritet, Synlighet, Tildelt, Forfaller — match med dine egne kolonner.' },
          ].map(s => (
            <div key={s.n} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>{s.n}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600 }}>{s.t}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.55 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 32, padding: 24, background: 'var(--fg)', color: '#fff', borderRadius: 16, display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: '#fff' }}>Klar til å koble til?</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 6, lineHeight: 1.5 }}>Du blir sendt til Notions autorisering. Tar 30 sek.</div>
        </div>
        <button className="btn btn-primary" style={{ padding: '14px 22px', fontSize: 14 }}><WIcon.External/> Koble til Notion</button>
      </div>

      <div style={{ marginTop: 24, display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px', background: 'rgba(0,88,64,0.04)', border: '1px solid rgba(0,88,64,0.18)', borderRadius: 10 }}>
        <WIcon.Lock/>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg)', lineHeight: 1.5 }}>
          <strong>Vi lagrer kun et token.</strong> Du kan koble fra når som helst — token revokes umiddelbart hos Notion, og synket data blir værende i CoachHQ.
        </div>
      </div>
    </div>
  );
}

function ConnectedState() {
  return (
    <div style={{ padding: '24px 32px 64px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Status card */}
      <div className="card" style={{ padding: 22, display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: 16, alignItems: 'center' }}>
        <NOTION_LOGO/>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="x-pill aktiv">TILKOBLET</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.06em' }}>SINCE 14.JAN.2026</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 600 }}>Anders Kvam · workspace</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginTop: 2, letterSpacing: '0.04em' }}>Sist synket for 4 min siden · 312 sider</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm"><WIcon.Refresh/> Synk nå</button>
          <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }}>Koble fra</button>
        </div>
      </div>

      {/* Synkede databaser */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="label-mono">SYNKEDE DATABASER · 4</div>
          <button className="btn btn-outline btn-sm"><Icon.Plus/> Legg til database</button>
        </div>
        <div className="card" style={{ padding: 0 }}>
          {[
            { n: 'Tasks · 2026', sider: 312, type: 'OPPGAVER', sync: 'AUTO' },
            { n: 'Projects · Master', sider: 18, type: 'PROSJEKTER', sync: 'AUTO' },
            { n: 'Mulligan · drift', sider: 84, type: 'OPPGAVER', sync: 'MANUELL' },
            { n: 'Privat · todos', sider: 47, type: 'OPPGAVER', sync: 'AUTO' },
          ].map((db, i, arr) => (
            <div key={db.n} style={{
              display: 'grid', gridTemplateColumns: '32px 1fr 100px 100px 100px',
              gap: 14, alignItems: 'center',
              padding: '14px 20px', borderBottom: i < arr.length - 1 ? '1px solid var(--border-soft)' : 0,
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--fg)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700 }}>N</div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>{db.n}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--muted)', marginTop: 2 }}>{db.sider} sider · {db.type}</div>
              </div>
              <span className="x-pill aktiv" style={{ background: db.sync === 'AUTO' ? 'rgba(0,88,64,0.10)' : 'rgba(184,133,42,0.15)', color: db.sync === 'AUTO' ? 'var(--primary)' : '#7A5919' }}>{db.sync}</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--muted)', textAlign: 'right' }}>sist 4 min</div>
              <button className="btn btn-outline btn-xs" style={{ justifySelf: 'end' }}>Konfigurer</button>
            </div>
          ))}
        </div>
      </div>

      {/* Feltkartlegging */}
      <div>
        <div className="label-mono" style={{ marginBottom: 14 }}>FELTKARTLEGGING · Tasks · 2026 <span style={{ color: 'var(--muted-soft)' }}>(klikk for å bytte database)</span></div>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 110px', gap: 14, padding: '0 0 10px', borderBottom: '1px solid var(--border)' }}>
            <div className="label-mono">CoachHQ-felt</div>
            <div className="label-mono">Notion-property</div>
            <div className="label-mono">Type</div>
          </div>
          {[
            ['Status',     'Status',          'select',     'mapped'],
            ['Prioritet',  'Priority',        'select',     'mapped'],
            ['Synlighet',  'Visibility',      'multi-select','mapped'],
            ['Tildelt',    'Assignee',        'person',     'mapped'],
            ['Prosjekt',   'Project (relation)','relation', 'mapped'],
            ['Forfaller',  'Due',             'date',       'mapped'],
            ['Estimat',    '—',               '—',          'unmapped'],
          ].map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 110px', gap: 14, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-soft)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13.5, fontWeight: 600 }}>{row[0]}</div>
              <div>
                {row[3] === 'mapped' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <SourceBadge kind="N"/>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg)', fontWeight: 600 }}>{row[1]}</span>
                  </div>
                ) : (
                  <button className="btn btn-outline btn-xs">+ Velg property</button>
                )}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: row[3] === 'mapped' ? 'var(--muted)' : 'var(--warning)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{row[2]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Default synlighet */}
      <div>
        <div className="label-mono" style={{ marginBottom: 14 }}>DEFAULT SYNLIGHET FOR NYE OPPGAVER FRA NOTION</div>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)', marginBottom: 14, lineHeight: 1.5 }}>
            Når en ny task synkes inn, hva blir default synlighet? (Du kan overstyre per task etterpå.)
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['PRIVAT','AK','JUNIOR','SELSKAP','ALLE'].map(k => (
              <button key={k} style={{ padding: 0, border: k === 'PRIVAT' ? '2px solid var(--primary)' : '2px solid transparent', borderRadius: 999, background: 'transparent', cursor: 'pointer' }}>
                <VisibilityPill kind={k}/>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sync-historikk */}
      <div>
        <div className="label-mono" style={{ marginBottom: 14 }}>SYNC-HISTORIKK · SISTE 10</div>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 80px 100px 90px', gap: 14, padding: '0 0 10px', borderBottom: '1px solid var(--border)' }}>
            <div className="label-mono">TIDSPUNKT</div>
            <div className="label-mono">DATABASE</div>
            <div className="label-mono">ENDRINGER</div>
            <div className="label-mono">DURATION</div>
            <div className="label-mono">STATUS</div>
          </div>
          {[
            ['I dag · 13:42', 'Tasks · 2026', '+3 ↻12', '480ms', 'OK'],
            ['I dag · 13:38', 'Projects', '↻1', '210ms', 'OK'],
            ['I dag · 13:30', 'Tasks · 2026', '+1', '350ms', 'OK'],
            ['I dag · 13:18', 'Mulligan · drift', '↻4', '610ms', 'OK'],
            ['I dag · 12:51', 'Tasks · 2026', '0', '180ms', 'OK'],
            ['I dag · 12:42', 'Privat · todos', '+2', '290ms', 'OK'],
            ['I går · 23:14', 'Tasks · 2026', '0', 'TIMEOUT', 'FEIL'],
            ['I går · 23:08', 'Tasks · 2026', '+5 ↻7', '720ms', 'OK'],
          ].map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 80px 100px 90px', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--border-soft)', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
              <div style={{ color: 'var(--muted)' }}>{row[0]}</div>
              <div style={{ color: 'var(--fg)' }}>{row[1]}</div>
              <div style={{ color: row[2] === '0' ? 'var(--muted-soft)' : 'var(--fg)', fontWeight: 600 }}>{row[2]}</div>
              <div style={{ color: row[3] === 'TIMEOUT' ? 'var(--danger)' : 'var(--muted)' }}>{row[3]}</div>
              <span className={`x-pill ${row[4] === 'OK' ? 'done' : 'draft'}`} style={row[4] === 'FEIL' ? { background: 'rgba(163,45,45,0.10)', color: 'var(--danger)' } : {}}>{row[4]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function S5_NotionConfig() {
  const [state, setState] = useWS5('koblet');
  return (
    <div className="ab">
      <div className="scroll">
        <MiniTopbar role="coach" crumbs={<><span>COACHHQ</span> · <span>WORKSPACE</span> · <strong>NOTION</strong></>}/>
        <WorkspaceHero
          eyebrow="COACHHQ · WORKSPACE · INTEGRASJON"
          title="Notion"
          titleItalic={state === 'koblet' ? '· tilkoblet' : '· tilkobling'}
          sub={state === 'koblet' ? '4 DATABASER · 461 SIDER · SIST SYNKET 4 MIN SIDEN' : 'KOBLE TIL FOR Å SYNKE OPPGAVER OG PROSJEKTER'}
          actions={<StateStrip states={['empty','koblet']} value={state} onChange={setState}/>}
        />
        <WSTabs active="notion"/>
        {state === 'empty' ? <EmptyState/> : <ConnectedState/>}
      </div>
    </div>
  );
}
window.S5_NotionConfig = S5_NotionConfig;

// ── Mobile ────────────────────────────────────────────────────────────
function S5_NotionConfig_Mobile() {
  return (
    <PhoneFrame>
      <div style={{ padding: '6px 18px 12px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>WORKSPACE · NOTION</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginTop: 4 }}>Notion <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>tilkobling</em></h1>
      </div>
      <div className="ph-body">
        <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <NOTION_LOGO/>
          <div>
            <span className="x-pill aktiv">TILKOBLET</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>4 min siden · 461 sider</div>
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="label-mono" style={{ marginBottom: 8 }}>SYNKEDE DBs · 4</div>
          {['Tasks · 2026','Projects · Master','Mulligan','Privat'].map(n => (
            <div key={n} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-soft)', fontSize: 12.5 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{n}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--success)' }}>AUTO</span>
            </div>
          ))}
        </div>
        <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}><WIcon.Refresh/> Synk nå</button>
      </div>
      <div className="ph-footer">
        <button className="btn btn-primary"><WIcon.External/> Åpne i Notion</button>
      </div>
    </PhoneFrame>
  );
}
window.S5_NotionConfig_Mobile = S5_NotionConfig_Mobile;
