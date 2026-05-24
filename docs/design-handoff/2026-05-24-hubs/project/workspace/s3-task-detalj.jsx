// Workspace · Skjerm 3 — Task-detalj
// /admin/workspace/oppgaver/[id]
const { useState: useWS3 } = React;

const FEED = [
  { who: 'AK', when: '2 t siden', what: 'flyttet til ', em: 'DOING' },
  { who: 'MR', when: 'i går',     what: 'la til kommentar: «Jeg har sjekket Trackman-priser for 2026 — sender deg mail.»' },
  { who: 'AK', when: 'i går',     what: 'la til ', em: 'sub-task «Be om tilbud fra TrackMan Norge»' },
  { who: 'N',  when: 'tirsdag',   what: 'synket fra ', em: 'Notion · Backlog 2026' },
];

function S3_TaskDetalj() {
  const [view, setView] = useWS3('open');
  const t = TASKS.find(x => x.id === 3); // Avklare Trackman-leie sommer 2026
  if (view === '404') {
    return (
      <div className="ab" style={{ background: 'var(--bg)' }}>
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ maxWidth: 480, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.14em' }}>404 · INGEN TILGANG</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 12 }}>Denne <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>oppgaven</em> er privat</h2>
            <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--muted)', marginTop: 14, lineHeight: 1.55 }}>
              «Anders har merket denne som PRIVAT. Du må bli tildelt eksplisitt, eller be om å få endret synlighet.»
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 22 }}>
              <button className="btn btn-outline btn-sm" onClick={() => setView('open')}>Se task åpen (preview)</button>
              <button className="btn btn-primary btn-sm">Be om tilgang</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="ab">
      <div className="scroll">
        <MiniTopbar role="coach" crumbs={<><span>COACHHQ</span> · <span>WORKSPACE</span> · <span>OPPGAVER</span> · <strong>TRACKMAN-LEIE</strong></>}/>

        {/* Mini-hero */}
        <div style={{ padding: '20px 32px 18px', background: 'linear-gradient(180deg, #FBFAF5 0%, var(--bg) 100%)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
              <Icon.Back/> Tilbake til oppgaver
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <StateStrip states={['open','404']} value={view} onChange={setView}/>
              <button className="btn btn-outline btn-sm"><WIcon.External/> Åpne i Notion</button>
              <button className="iconbtn" style={{ width: 32, height: 32 }}><WIcon.More/></button>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 32px 64px', display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 32 }}>
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Title block */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                {t.brenner && <span style={{ color: 'var(--danger)' }}><WIcon.Fire/></span>}
                <ProjectPill company={t.project.company} name={t.project.name}/>
                <StatusPill kind={t.status}/>
                <SourceBadge kind={t.source}/>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--fg)' }}>
                {t.title}
              </h1>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--muted-soft)', letterSpacing: '0.04em', marginTop: 8 }}>OPPRETTET 22.05 · OPPDATERT FOR 4 MIN SIDEN</div>
            </div>

            {/* Description */}
            <div className="card" style={{ padding: 22 }}>
              <div className="label-mono" style={{ marginBottom: 10 }}>BESKRIVELSE</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.6, color: 'var(--fg)' }}>
                <p style={{ margin: '0 0 12px' }}>Vi må avklare Trackman-leie for sommeren 2026 før <strong>14. juni</strong>. Mulligan Studio har Trackman bay 4 reservert, men jeg er usikker på <em style={{ fontFamily: 'var(--font-serif)' }}>om leien dekker hele AK-pulja eller bare privat-coaching</em>.</p>
                <p style={{ margin: '0 0 12px' }}>Hovedspørsmål:</p>
                <ul style={{ paddingLeft: 22, margin: '0 0 12px' }}>
                  <li>Pris pr. time vs. fast leie</li>
                  <li>Tilgang for Markus + andre coaches</li>
                  <li>Data-eierskap (vil vi eksportere TrackMan-rapporter)</li>
                </ul>
                <p style={{ margin: 0, background: 'var(--bg)', borderLeft: '3px solid var(--accent)', padding: '10px 14px', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>
                  📎 Synket fra Notion · «Backlog 2026 · drift»
                </p>
              </div>
            </div>

            {/* Sub-tasks */}
            <div className="card" style={{ padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                <div className="label-mono">SUB-TASKS · 2 / 4 FULLFØRT</div>
                <div style={{ display: 'flex', gap: 4 }}>{[1,1,0,0].map((d, i) => <div key={i} style={{ width: 20, height: 4, borderRadius: 2, background: d ? 'var(--primary)' : 'var(--border)' }}/>)}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { title: 'Be om tilbud fra TrackMan Norge', done: true },
                  { title: 'Snakke med Mulligan-eier om bay-prising', done: true },
                  { title: 'Avklare data-eierskap med juridisk', done: false },
                  { title: 'Lage budsjett-forslag til Markus', done: false },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: s.done ? 'rgba(0,88,64,0.04)' : 'transparent' }}>
                    <TaskCheck done={s.done} size={16}/>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: s.done ? 'var(--muted)' : 'var(--fg)', textDecoration: s.done ? 'line-through' : 'none' }}>{s.title}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, padding: '8px 10px', borderRadius: 8, border: '1px dashed var(--border)' }}>
                <Icon.Plus/>
                <input style={{ flex: 1, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--muted)' }} placeholder="Legg til sub-task …"/>
              </div>
            </div>

            {/* Activity feed */}
            <div>
              <div className="label-mono" style={{ marginBottom: 14 }}>AKTIVITET</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingLeft: 12, borderLeft: '1px solid var(--border)' }}>
                {FEED.map((f, i) => {
                  const isNotion = f.who === 'N';
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative' }}>
                      <div style={{ position: 'absolute', left: -19, top: 4, width: 14, height: 14, borderRadius: '50%', background: isNotion ? 'var(--fg)' : '#fff', border: isNotion ? 'none' : '2px solid var(--primary)' }}/>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.5 }}>
                          <strong style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                            {isNotion ? 'Notion' : PEOPLE[f.who].name}
                          </strong>
                          {' '}<span style={{ color: 'var(--muted)' }}>{f.what}</span>
                          {f.em && (
                            isNotion
                              ? <strong style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{f.em}</strong>
                              : f.em === 'DOING'
                                ? <StatusPill kind="DOING" compact/>
                                : <strong style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{f.em}</strong>
                          )}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--muted-soft)', letterSpacing: '0.04em', marginTop: 4 }}>{f.when}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 18, padding: 12, background: '#fff', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <Avatar name="Anders Kvam" color="c2" size="sm"/>
                <textarea style={{ flex: 1, border: 0, outline: 'none', resize: 'none', minHeight: 50, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--fg)' }} placeholder="Skriv en kommentar …"/>
                <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }}>Send</button>
              </div>
            </div>
          </div>

          {/* RIGHT — Metadata */}
          <div style={{ position: 'sticky', top: 24, alignSelf: 'flex-start' }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Status / Prio */}
              <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-soft)' }}>
                <div className="label-mono" style={{ marginBottom: 8 }}>STATUS</div>
                <select style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--fg)', letterSpacing: '0.06em', background: '#fff' }} defaultValue="TODO">
                  <option>TODO</option><option>DOING</option><option>DONE</option><option>BLOKKERT</option>
                </select>
              </div>
              <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-soft)' }}>
                <div className="label-mono" style={{ marginBottom: 8 }}>PRIORITET</div>
                <div className="segmented">
                  <button>LAV</button>
                  <button>MED</button>
                  <button className="active" style={{ background: '#B8852A', color: '#fff' }}>HØY</button>
                  <button>BRENNER</button>
                </div>
              </div>
              {/* Prosjekt */}
              <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-soft)' }}>
                <div className="label-mono" style={{ marginBottom: 8 }}>PROSJEKT</div>
                <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'var(--bg)', textDecoration: 'none' }}>
                  <ProjectPill company={t.project.company} name={t.project.name}/>
                  <Icon.Arrow/>
                </a>
              </div>
              {/* Due */}
              <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-soft)' }}>
                <div className="label-mono" style={{ marginBottom: 8 }}>FORFALLER</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'var(--bg)' }}>
                  <WIcon.Clock/>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--fg)' }}>I dag · 17:00</span>
                  <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--danger)' }}>4 t igjen</span>
                </div>
              </div>
              {/* Tildelt */}
              <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-soft)' }}>
                <div className="label-mono" style={{ marginBottom: 8 }}>TILDELT</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {['AK','MR'].map(k => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px 4px 4px', borderRadius: 999, background: 'var(--bg)', border: '1px solid var(--border-soft)' }}>
                      <Avatar name={PEOPLE[k].name} color={PEOPLE[k].color} size="sm"/>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600 }}>{PEOPLE[k].name}</span>
                    </div>
                  ))}
                  <button className="iconbtn" style={{ width: 28, height: 28, border: '1px dashed var(--border)' }}><Icon.Plus/></button>
                </div>
              </div>
              {/* Visibility */}
              <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-soft)' }}>
                <div className="label-mono" style={{ marginBottom: 8 }}>SYNLIGHET</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['AK','JUNIOR','ALLE','SELSKAP','PRIVAT'].map(k => (
                    <button key={k} style={{ padding: 0, border: 0, background: 'transparent', cursor: 'pointer', opacity: k === 'AK' ? 1 : 0.45 }}>
                      <VisibilityPill kind={k}/>
                    </button>
                  ))}
                </div>
              </div>
              {/* Estimat */}
              <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-soft)' }}>
                <div className="label-mono" style={{ marginBottom: 8 }}>ESTIMAT</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <input style={{ width: 60, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600 }} defaultValue="1"/>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>timer</span>
                </div>
              </div>
              {/* Tags */}
              <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-soft)' }}>
                <div className="label-mono" style={{ marginBottom: 8 }}>TAGGER</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {['trackman','leie','sommer-2026','drift'].map(s => (
                    <span key={s} style={{ padding: '3px 8px', borderRadius: 4, background: 'var(--bg)', fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 600, color: 'var(--muted)' }}>#{s}</span>
                  ))}
                  <button style={{ padding: '3px 8px', borderRadius: 4, background: 'transparent', border: '1px dashed var(--border)', fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--muted)' }}>+</button>
                </div>
              </div>
              {/* Source */}
              <div style={{ padding: '14px 18px', background: 'var(--bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SourceBadge kind="N"/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600 }}>Synket fra Notion</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)' }}>sist 4 min siden</div>
                  </div>
                  <a href="#" style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.06em', textDecoration: 'none' }}>ÅPNE →</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.S3_TaskDetalj = S3_TaskDetalj;

// ── Mobile ────────────────────────────────────────────────────────────
function S3_TaskDetalj_Mobile() {
  const t = TASKS.find(x => x.id === 3);
  return (
    <PhoneFrame>
      <div style={{ padding: '6px 18px 12px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.10em', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon.Back/> OPPGAVER</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <ProjectPill company={t.project.company} name={t.project.name} compact/>
          <StatusPill kind={t.status} compact/>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, letterSpacing: '-0.015em', marginTop: 8, lineHeight: 1.2 }}>{t.title}</h1>
      </div>
      <div className="ph-body">
        <div className="card" style={{ padding: 14 }}>
          <div className="label-mono" style={{ marginBottom: 8 }}>METADATA</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Forfaller', 'I dag · 17:00'],
              ['Prio', 'HØY'],
              ['Tildelt', 'AK + MR'],
              ['Synlighet', 'AK GOLF'],
              ['Estimat', '1 t'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                <span className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em' }}>{k}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div className="label-mono" style={{ marginBottom: 8 }}>SUB-TASKS · 2/4</div>
          {[true, true, false, false].map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0' }}>
              <TaskCheck done={d} size={14}/>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: d ? 'var(--muted)' : 'var(--fg)', textDecoration: d ? 'line-through' : 'none' }}>{['Be om tilbud fra TrackMan','Snakke med Mulligan','Avklare data-eierskap','Budsjett-forslag'][i]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="ph-footer">
        <button className="btn btn-primary">Sett til DOING</button>
      </div>
    </PhoneFrame>
  );
}
window.S3_TaskDetalj_Mobile = S3_TaskDetalj_Mobile;
