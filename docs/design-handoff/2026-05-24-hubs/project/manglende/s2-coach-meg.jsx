// Screen 2 — /admin/meg Coach profil-hub
// Three variants + mobile. Coach Anders profile with sticky tab-bar over 6 sections.
const { useState: useS2 } = React;

// Reusable: section tab bar
function ProfilTabs({ tabs, active, onChange, sticky = true }) {
  return (
    <div style={{
      position: sticky ? 'sticky' : 'relative', top: 0, zIndex: 10,
      background: '#fff', borderBottom: '1px solid var(--border)',
      padding: '0 32px',
      display: 'flex', gap: 0,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          background: 'transparent', border: 0,
          padding: '14px 18px',
          fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600,
          color: active === t.id ? 'var(--fg)' : 'var(--muted)',
          borderBottom: active === t.id ? '3px solid var(--accent)' : '3px solid transparent',
          marginBottom: -1, display: 'inline-flex', alignItems: 'center', gap: 8,
          cursor: 'pointer',
        }}>
          {t.label}
          {t.count != null && <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
            color: active === t.id ? 'var(--primary)' : 'var(--muted-soft)',
            background: active === t.id ? 'rgba(0,88,64,0.08)' : 'var(--bg)',
            padding: '2px 6px', borderRadius: 4,
          }}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

// Player chip used in "Aktive spillere"
function PlayerChip({ name, hcp, color = 'c2' }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid var(--border)', borderRadius: 12,
      padding: 14, display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar name={name} color={color} size="md"/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', marginTop: 2 }}>HCP {hcp}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {[...Array(7)].map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < 5 ? 'var(--primary)' : 'var(--border)' }}/>
        ))}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.04em' }}>5 / 7 økter denne uka</div>
    </div>
  );
}

// API key row
function ApiKeyRow({ name, prefix, created, lastUsed, visible }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '160px 1fr 110px 110px 88px',
      gap: 14, alignItems: 'center',
      padding: '12px 0', borderBottom: '1px solid var(--border-soft)',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600 }}>{name}</div>
      <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, background: 'var(--bg)', padding: '4px 10px', borderRadius: 6, color: visible ? 'var(--fg)' : 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {visible ? `${prefix}_a4f8c2e9d1b6f3a8c5e2d9f1b4a7c3e8` : `${prefix}_••••••••••••••••••••••••`}
      </code>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.04em' }}>{created}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.04em' }}>{lastUsed}</div>
      <button className="btn btn-outline btn-xs" style={{ justifyContent: 'center' }}>
        <Icon.Eye/> {visible ? 'Skjul' : 'Vis'}
      </button>
    </div>
  );
}

// Toggle switch
function Toggle({ on, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
      <div style={{
        width: 34, height: 20, borderRadius: 999,
        background: on ? 'var(--primary)' : 'var(--border)',
        position: 'relative', flexShrink: 0, transition: 'background 120ms',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: on ? 16 : 2,
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          boxShadow: '0 1px 3px rgba(10,31,23,0.18)', transition: 'left 120ms',
        }}/>
      </div>
      <div style={{ fontSize: 13, color: 'var(--fg)' }}>{label}</div>
    </div>
  );
}

// Integration row
function IntegrationRow({ name, status, last, color }) {
  const ok = status === 'connected';
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '40px 1fr auto auto', gap: 14, alignItems: 'center',
      padding: '14px 0', borderBottom: '1px solid var(--border-soft)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, background: color,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#fff',
      }}>{name[0]}</div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 13.5, fontWeight: 600 }}>{name}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.04em', marginTop: 2 }}>{last}</div>
      </div>
      <div style={{
        padding: '3px 9px', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700,
        letterSpacing: '0.10em', textTransform: 'uppercase',
        background: ok ? 'rgba(44,125,82,0.16)' : 'rgba(94,92,87,0.14)',
        color: ok ? 'var(--success)' : 'var(--muted)',
      }}>{ok ? 'Tilkoblet' : 'Ikke koblet'}</div>
      <button className="btn btn-outline btn-xs">{ok ? 'Konfigurer' : 'Koble til'}</button>
    </div>
  );
}

// Section heading
function SH({ children, sub }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.015em' }}>{children}</h2>
      {sub && <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

const PLAYERS = [
  { n: 'Markus R. Pedersen', h: '+3,5', c: 'c1' },
  { n: 'Sofie Lindberg', h: '+1,2', c: 'c2' },
  { n: 'Henrik Tønnesen', h: '0,4', c: 'c3' },
  { n: 'Ada Nilsen-Bjørke', h: '2,1', c: 'c4' },
  { n: 'Vetle Halvorsen', h: '+0,8', c: 'c5' },
  { n: 'Tora Mikkelsen', h: '3,7', c: 'c6' },
  { n: 'Iver Solheim', h: '5,2', c: 'c7' },
  { n: 'Emilia Kvam-Strand', h: '+2,1', c: 'c8' },
];

// ── VARIANT A · Sticky tab-bar by-the-book ───────────────────────────
function S2_VariantA() {
  const [tab, setTab] = useS2('profil');
  const tabs = [
    { id: 'profil', label: 'Profil' },
    { id: 'spillere', label: 'Spillere', count: 38 },
    { id: 'stripe', label: 'Stripe' },
    { id: 'nokler', label: 'Nøkler', count: 4 },
    { id: 'varsler', label: 'Varsler' },
    { id: 'tilkoblinger', label: 'Tilkoblinger', count: 5 },
  ];
  return (
    <div className="ab">
      <div className="scroll">
        <MiniTopbar role="coach" crumbs={<><span>COACHHQ</span> · <strong>MIN PROFIL</strong></>}/>
        <div style={{ padding: '28px 32px 18px', background: 'linear-gradient(180deg, #FBFAF5 0%, var(--bg) 100%)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <div className="p-avatar lg c2" style={{ width: 88, height: 88, fontSize: 28 }}>AK</div>
            <div style={{ flex: 1 }}>
              <div className="eyebrow">COACHHQ · MIN PROFIL</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 6 }}>
                Anders <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>Kvam</em>
              </h1>
              <div className="mono" style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8, letterSpacing: '0.04em' }}>HEAD COACH · 38 SPILLERE · KOLBOTN GK</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline"><Icon.Edit/> Rediger profil</button>
              <button className="btn btn-forest">Vis offentlig profil</button>
            </div>
          </div>
        </div>

        <ProfilTabs tabs={tabs} active={tab} onChange={setTab}/>

        <div style={{ padding: '32px 32px 64px', display: 'flex', flexDirection: 'column', gap: 36 }}>
          {tab === 'profil' && (
            <>
              <div>
                <SH sub="Synlig for spillere som booker med deg">Personalia</SH>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    ['Fullt navn', 'Anders Kvam'],
                    ['E-post', 'anders@akgolf.no'],
                    ['Telefon', '+47 928 14 372'],
                    ['Klubb-tilhørighet', 'Kolbotn GK · Wang Toppidrett'],
                    ['Sertifiseringer', 'PGA Class A · TPI Level 3'],
                    ['Coach siden', '2018'],
                  ].map(([k, v]) => (
                    <div key={k} className="card" style={{ padding: 16 }}>
                      <div className="label-mono">{k}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14.5, fontWeight: 600, marginTop: 4 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <SH sub="8 av 38 — vises i din bookingside">Aktive spillere</SH>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {PLAYERS.map(p => <PlayerChip key={p.n} name={p.n} hcp={p.h} color={p.c}/>)}
                </div>
              </div>
            </>
          )}

          {tab === 'spillere' && (
            <div>
              <SH sub="38 totalt · 8 aktive denne uka">Alle spillere</SH>
              <div className="filter-strip" style={{ position: 'static', marginBottom: 18 }}>
                <button className="filter-pill active">Alle <span className="count">38</span></button>
                <button className="filter-pill">Aktive <span className="count">8</span></button>
                <button className="filter-pill">Inaktive <span className="count">12</span></button>
                <button className="filter-pill">Talent <span className="count">6</span></button>
                <div className="divider"/>
                <div className="search-mini">
                  <Icon.Search/>
                  <input placeholder="Søk spiller …"/>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[...PLAYERS, ...PLAYERS].slice(0,12).map((p, i) => <PlayerChip key={i} name={p.n} hcp={p.h} color={p.c}/>)}
              </div>
            </div>
          )}

          {tab === 'stripe' && (
            <div>
              <SH sub="Payouts og fakturaer går via tilkoblet Stripe-konto">Stripe-konto</SH>
              <div className="card" style={{ padding: 22 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginBottom: 22, paddingBottom: 22, borderBottom: '1px solid var(--border-soft)' }}>
                  <div>
                    <div className="label-mono">STATUS</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <div className="x-pill aktiv"><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}/> AKTIV</div>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)' }}>acct_1Q8K…</div>
                    </div>
                  </div>
                  <div>
                    <div className="label-mono">NESTE UTBETALING</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginTop: 4 }}>kr 18 420,–</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)' }}>27.05.2026</div>
                  </div>
                  <div>
                    <div className="label-mono">DENNE MÅNEDEN</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginTop: 4 }}>kr 54 280,–</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--success)' }}>+12% vs. forrige</div>
                  </div>
                </div>
                <div className="label-mono" style={{ marginBottom: 12 }}>SISTE 5 FAKTURAER</div>
                {[
                  ['Markus R. Pedersen', 'Privattime · 60 min', 'kr 1 200', 'BETALT'],
                  ['Sofie Lindberg', '5-pack juniorer', 'kr 4 500', 'BETALT'],
                  ['Henrik Tønnesen', 'TrackMan-økt', 'kr 1 800', 'VENTER'],
                  ['Ada Nilsen-Bjørke', 'Helgsamling', 'kr 3 200', 'BETALT'],
                  ['Vetle Halvorsen', 'Privattime · 60 min', 'kr 1 200', 'BETALT'],
                ].map(([n, t, amt, s], i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 100px 80px', gap: 14, padding: '11px 0', borderBottom: '1px solid var(--border-soft)', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600 }}>{n}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>{t}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600, textAlign: 'right' }}>{amt}</div>
                    <div className={`x-pill ${s === 'BETALT' ? 'done' : 'draft'}`} style={{ justifySelf: 'end' }}>{s}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'nokler' && (
            <div>
              <SH sub="Brukes av integrasjoner (Trackman, Notion, egne dashboards)">API-nøkler</SH>
              <div className="card" style={{ padding: 22 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 110px 110px 88px', gap: 14, padding: '0 0 10px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                  <div className="label-mono">NAVN</div>
                  <div className="label-mono">NØKKEL</div>
                  <div className="label-mono">OPPRETTET</div>
                  <div className="label-mono">SIST BRUKT</div>
                  <div/>
                </div>
                <ApiKeyRow name="Trackman bridge" prefix="ak_live_tm" created="12 jan 2026" lastUsed="i dag, 09:14" visible={true}/>
                <ApiKeyRow name="Notion sync" prefix="ak_live_nt" created="03 nov 2025" lastUsed="i går"/>
                <ApiKeyRow name="Resend e-post" prefix="ak_live_rs" created="22 sep 2025" lastUsed="14 dager siden"/>
                <ApiKeyRow name="Personal CLI" prefix="ak_live_cl" created="08 mar 2026" lastUsed="3 timer siden"/>
                <div style={{ paddingTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary"><Icon.Plus/> Generer ny nøkkel</button>
                </div>
              </div>
            </div>
          )}

          {tab === 'varsler' && (
            <div>
              <SH sub="Velg hvordan du vil bli varslet per event-type">Notifikasjons-preferanser</SH>
              <div className="card" style={{ padding: 22 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', gap: 14, padding: '0 0 10px', borderBottom: '1px solid var(--border)', alignItems: 'center', marginBottom: 10 }}>
                  <div className="label-mono">EVENT</div>
                  <div className="label-mono" style={{ textAlign: 'center' }}>E-POST</div>
                  <div className="label-mono" style={{ textAlign: 'center' }}>PUSH</div>
                  <div className="label-mono" style={{ textAlign: 'center' }}>SMS</div>
                </div>
                {[
                  ['Ny booking', true, true, false],
                  ['Avbestilling', true, true, true],
                  ['Reschedule-forespørsel', true, true, false],
                  ['Ny spillermelding', false, true, false],
                  ['Stripe-payout', true, false, false],
                  ['AI-generert plan klar', false, true, false],
                  ['Spiller registrerer ny runde', false, false, false],
                ].map((row, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', gap: 14, padding: '10px 0', borderBottom: '1px solid var(--border-soft)', alignItems: 'center' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{row[0]}</div>
                    {[1,2,3].map(j => (
                      <div key={j} style={{ display: 'flex', justifyContent: 'center' }}>
                        <Toggle on={row[j]} label=""/>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'tilkoblinger' && (
            <div>
              <SH sub="Eksterne tjenester knyttet til din coach-konto">Tilkoblede tjenester</SH>
              <div className="card" style={{ padding: 22 }}>
                <IntegrationRow name="Google Calendar" status="connected" last="Synket for 4 min siden · 47 bookinger" color="#1A73E8"/>
                <IntegrationRow name="Notion" status="connected" last="Synket i dag 06:00 · Drill-bibliotek + planer" color="#000"/>
                <IntegrationRow name="Trackman Live" status="connected" last="3 økter denne uka · Mulligan Studio" color="#FF6B00"/>
                <IntegrationRow name="Resend" status="connected" last="14 e-poster sendt siste uke" color="#000"/>
                <IntegrationRow name="Stripe" status="connected" last="Neste payout: 27.05 · kr 18 420" color="#635BFF"/>
                <IntegrationRow name="Garmin Connect" status="disconnected" last="Krever spiller-OAuth per spiller" color="#007CC3"/>
              </div>
            </div>
          )}

          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.06em' }}>SESJON: SAFARI · MAC · OSLO · IP 188.42.•••</div>
            <button className="btn btn-outline" style={{ color: 'var(--danger)' }}>Logg ut alle enheter</button>
          </div>
        </div>
      </div>
    </div>
  );
}
window.S2_VariantA = S2_VariantA;

// ── VARIANT B · Dashboard grid med stats-hero ────────────────────────
function S2_VariantB() {
  return (
    <div className="ab">
      <div className="scroll">
        <MiniTopbar role="coach" crumbs={<><span>COACHHQ</span> · <strong>MIN PROFIL</strong></>}/>
        <div style={{ padding: '24px 28px 28px' }}>
          <div className="dark-hero" style={{ padding: 28 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 22, alignItems: 'center' }}>
              <div className="p-avatar lg" style={{ width: 78, height: 78, fontSize: 24, background: 'var(--accent)', color: 'var(--primary)' }}>AK</div>
              <div>
                <div className="eyebrow">COACHHQ · MIN PROFIL</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, letterSpacing: '-0.01em', marginTop: 4, color: '#fff' }}>
                  Anders <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>Kvam</em>
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <div className="x-pill" style={{ background: 'rgba(209,248,67,0.20)', color: 'var(--accent)' }}>HEAD COACH</div>
                  <div className="x-pill" style={{ background: 'rgba(255,255,255,0.10)', color: '#fff' }}>PGA CLASS A</div>
                  <div className="x-pill" style={{ background: 'rgba(255,255,255,0.10)', color: '#fff' }}>TPI L3</div>
                  <div className="x-pill" style={{ background: 'rgba(255,255,255,0.10)', color: '#fff' }}>SIDEN 2018</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline" style={{ background: 'rgba(255,255,255,0.10)', borderColor: 'transparent', color: '#fff' }}>Rediger</button>
                <button className="btn btn-primary">Offentlig profil</button>
              </div>
            </div>
            <div className="status-stats-row" style={{ marginTop: 32 }}>
              <div className="stat"><div className="lbl">SPILLERE</div><div className="val">38</div><div className="delta up">+3 i mai</div></div>
              <div className="stat"><div className="lbl">ØKTER / UKE</div><div className="val">42</div><div className="delta flat">stabil</div></div>
              <div className="stat"><div className="lbl">SNITT-HCP</div><div className="val">2,8</div><div className="delta up">↓ 0,4</div></div>
              <div className="stat"><div className="lbl">PAYOUT / MND</div><div className="val">54k</div><div className="delta up">+12%</div></div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginTop: 24 }}>
            <div className="card" style={{ padding: 22 }}>
              <div className="card-head"><div className="title">Aktive spillere</div><button className="btn btn-outline btn-xs">Se alle 38 →</button></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {PLAYERS.map(p => <PlayerChip key={p.n} name={p.n} hcp={p.h} color={p.c}/>)}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: 20 }}>
                <div className="card-head"><div className="title">Stripe</div><div className="x-pill aktiv">AKTIV</div></div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>kr 18 420</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Neste payout 27.05.2026</div>
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-soft)', display: 'flex', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--success)' }}>
                  +12% vs. forrige måned
                </div>
              </div>
              <div className="card" style={{ padding: 20 }}>
                <div className="card-head"><div className="title">Tilkoblinger</div><div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>5/6</div></div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    ['G', '#1A73E8'], ['N', '#000'], ['T', '#FF6B00'],
                    ['R', '#000'], ['S', '#635BFF'], ['?', 'var(--muted-soft)'],
                  ].map(([l, c], i) => (
                    <div key={i} style={{ width: 34, height: 34, borderRadius: 8, background: c, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, opacity: i === 5 ? 0.45 : 1 }}>{l}</div>
                  ))}
                </div>
              </div>
              <div className="card" style={{ padding: 20 }}>
                <div className="card-head"><div className="title">API-nøkler</div><div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>4 aktive</div></div>
                {['Trackman bridge', 'Notion sync', 'Resend e-post', 'Personal CLI'].map(n => (
                  <div key={n} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-soft)', fontSize: 12.5 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{n}</span>
                    <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--muted)' }}>ak_•••</code>
                  </div>
                ))}
                <button className="btn btn-outline btn-xs" style={{ marginTop: 12 }}><Icon.Plus/> Ny nøkkel</button>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 22, marginTop: 20 }}>
            <div className="card-head"><div className="title">Varsler & tilkoblinger</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              <div>
                <div className="label-mono" style={{ marginBottom: 10 }}>VARSLER · push</div>
                <Toggle on={true} label="Ny booking"/>
                <Toggle on={true} label="Avbestilling"/>
                <Toggle on={false} label="Ny spillermelding"/>
                <Toggle on={true} label="Stripe-payout"/>
              </div>
              <div>
                <div className="label-mono" style={{ marginBottom: 10 }}>TILKOBLINGER</div>
                <IntegrationRow name="Google Calendar" status="connected" last="Synket 4 min siden" color="#1A73E8"/>
                <IntegrationRow name="Notion" status="connected" last="I dag 06:00" color="#000"/>
                <IntegrationRow name="Trackman" status="connected" last="3 økter denne uka" color="#FF6B00"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.S2_VariantB = S2_VariantB;

// ── VARIANT C · Cover-photo magazine layout ──────────────────────────
function S2_VariantC() {
  return (
    <div className="ab">
      <div className="scroll">
        <MiniTopbar role="coach" crumbs={<><span>COACHHQ</span> · <strong>MIN PROFIL</strong></>}/>
        {/* Cover banner */}
        <div style={{
          height: 180, position: 'relative',
          background: 'linear-gradient(135deg, #003A2A 0%, #005840 50%, #2C7D52 100%)',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, transparent, transparent 14px, rgba(209,248,67,0.05) 14px, rgba(209,248,67,0.05) 28px)' }}/>
          <div style={{ position: 'absolute', top: 24, right: 32, display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm" style={{ background: 'rgba(255,255,255,0.10)', borderColor: 'rgba(255,255,255,0.20)', color: '#fff' }}>Endre cover</button>
            <button className="btn btn-primary btn-sm">Vis offentlig</button>
          </div>
        </div>
        <div style={{ padding: '0 32px 48px', marginTop: -56, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 28 }}>
            <div className="p-avatar lg c2" style={{ width: 112, height: 112, fontSize: 36, border: '4px solid #fff', boxShadow: '0 4px 16px rgba(10,31,23,0.18)' }}>AK</div>
            <div style={{ flex: 1, paddingBottom: 6 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
                Anders <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>Kvam</em>
              </h1>
              <div className="mono" style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8, letterSpacing: '0.04em' }}>
                HEAD COACH · 38 SPILLERE · KOLBOTN GK · COACH SIDEN 2018
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.10em' }}>NESTE PAYOUT</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>kr 18 420</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--success)' }}>27.05 · +12%</div>
            </div>
          </div>

          {/* Anchor nav */}
          <div style={{ display: 'flex', gap: 16, padding: '14px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 32, position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10 }}>
            {['Profil', 'Spillere · 38', 'Stripe', 'Nøkler · 4', 'Varsler', 'Tilkoblinger · 5'].map((s, i) => (
              <a key={s} href="#" style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                color: i === 0 ? 'var(--fg)' : 'var(--muted)', letterSpacing: '0.10em',
                textTransform: 'uppercase', textDecoration: 'none',
                paddingBottom: 4, borderBottom: i === 0 ? '2px solid var(--accent)' : '2px solid transparent',
              }}>{s}</a>
            ))}
          </div>

          {/* Editorial 2-col */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36 }}>
            <div>
              <div className="label-mono" style={{ marginBottom: 12 }}>OM</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 17, lineHeight: 1.55, color: 'var(--fg)' }}>
                «Putting og short game er der lavt single-handicap blir til scratch. Jeg bygger planer med data først, intuisjon andre.»
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 14, letterSpacing: '0.04em' }}>— Anders, fra coach-profilen din</div>
              <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['E-post', 'anders@akgolf.no'],
                  ['Telefon', '+47 928 14 372'],
                  ['Klubb', 'Kolbotn GK · Wang Toppidrett'],
                  ['Sertifiseringer', 'PGA Class A · TPI Level 3'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 14, paddingBottom: 10, borderBottom: '1px solid var(--border-soft)' }}>
                    <div className="label-mono">{k}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="label-mono" style={{ marginBottom: 12 }}>SPILLERE · 8 AV 38</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {PLAYERS.map(p => <PlayerChip key={p.n} name={p.n} hcp={p.h} color={p.c}/>)}
              </div>
              <button className="btn btn-outline btn-sm" style={{ marginTop: 14 }}>Se alle 38 →</button>
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 32 }}>
            <div className="card" style={{ padding: 20 }}>
              <div className="label-mono" style={{ marginBottom: 12 }}>STRIPE-KONTO</div>
              <div className="x-pill aktiv">AKTIV</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginTop: 12 }}>kr 54 280</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>Mai 2026 · brutto</div>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div className="label-mono" style={{ marginBottom: 12 }}>API-NØKLER</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {['Trackman', 'Notion', 'Resend', 'Personal CLI'].map(n => (
                  <div key={n} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                    <span>{n}</span><span style={{ color: 'var(--success)' }}>●</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div className="label-mono" style={{ marginBottom: 12 }}>TILKOBLINGER</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[
                  ['Google Cal', '#1A73E8'], ['Notion', '#000'], ['Trackman', '#FF6B00'],
                  ['Resend', '#000'], ['Stripe', '#635BFF'],
                ].map(([n, c]) => (
                  <span key={n} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: '#fff', background: c, padding: '3px 8px', borderRadius: 999, letterSpacing: '0.04em' }}>{n}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.S2_VariantC = S2_VariantC;

// ── Mobile ────────────────────────────────────────────────────────────
function S2_Mobile() {
  const [tab, setTab] = useS2('profil');
  return (
    <PhoneFrame>
      <div style={{ padding: '4px 18px 14px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="p-avatar c2" style={{ width: 52, height: 52, fontSize: 18 }}>AK</div>
          <div style={{ flex: 1 }}>
            <div className="eyebrow" style={{ fontSize: 9.5 }}>COACHHQ · MIN PROFIL</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, letterSpacing: '-0.01em', marginTop: 2 }}>Anders <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--primary)' }}>Kvam</em></div>
            <div className="mono" style={{ fontSize: 9.5, color: 'var(--muted)', letterSpacing: '0.06em' }}>HEAD COACH · 38 SPILLERE</div>
          </div>
        </div>
      </div>
      {/* Scroll tabs */}
      <div style={{ display: 'flex', gap: 0, background: '#fff', borderBottom: '1px solid var(--border)', overflowX: 'auto', flexShrink: 0 }}>
        {[
          { id: 'profil', l: 'Profil' },
          { id: 'spillere', l: 'Spillere · 38' },
          { id: 'stripe', l: 'Stripe' },
          { id: 'nokler', l: 'Nøkler' },
          { id: 'varsler', l: 'Varsler' },
          { id: 'tilkoblinger', l: 'Koblinger' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '12px 14px', flexShrink: 0,
            fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 600,
            color: tab === t.id ? 'var(--fg)' : 'var(--muted)',
            background: 'transparent', border: 0,
            borderBottom: tab === t.id ? '3px solid var(--accent)' : '3px solid transparent',
            marginBottom: -1, whiteSpace: 'nowrap',
          }}>{t.l}</button>
        ))}
      </div>
      <div className="ph-body">
        {tab === 'profil' && (
          <>
            {[
              ['E-post', 'anders@akgolf.no'],
              ['Telefon', '+47 928 14 372'],
              ['Klubb', 'Kolbotn GK'],
              ['Sertifiseringer', 'PGA Class A · TPI L3'],
            ].map(([k, v]) => (
              <div key={k} className="card" style={{ padding: 14 }}>
                <div className="label-mono">{k}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, marginTop: 4 }}>{v}</div>
              </div>
            ))}
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}><Icon.Edit/> Rediger profil</button>
          </>
        )}
        {tab === 'spillere' && PLAYERS.slice(0,6).map(p => (
          <div key={p.n} className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={p.n} color={p.c} size="md"/>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13.5, fontWeight: 600 }}>{p.n}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>HCP {p.h}</div>
            </div>
            <Icon.Arrow/>
          </div>
        ))}
        {tab === 'stripe' && (
          <>
            <div className="card" style={{ padding: 18 }}>
              <div className="label-mono">NESTE PAYOUT</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginTop: 4 }}>kr 18 420</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>27.05.2026</div>
            </div>
            <div className="card" style={{ padding: 18 }}>
              <div className="label-mono">DENNE MÅNEDEN</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginTop: 4 }}>kr 54 280</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--success)' }}>+12% vs. forrige</div>
            </div>
          </>
        )}
        {tab === 'nokler' && ['Trackman', 'Notion', 'Resend', 'Personal CLI'].map(n => (
          <div key={n} className="card" style={{ padding: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600 }}>{n}</div>
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', display: 'block', marginTop: 6 }}>ak_live_•••••••</code>
          </div>
        ))}
        {tab === 'varsler' && (
          <div className="card" style={{ padding: 16 }}>
            <Toggle on={true} label="Ny booking"/>
            <Toggle on={true} label="Avbestilling"/>
            <Toggle on={false} label="Ny spillermelding"/>
            <Toggle on={true} label="Stripe-payout"/>
          </div>
        )}
        {tab === 'tilkoblinger' && (
          <div className="card" style={{ padding: 16 }}>
            <IntegrationRow name="Google Cal" status="connected" last="4 min siden" color="#1A73E8"/>
            <IntegrationRow name="Notion" status="connected" last="I dag" color="#000"/>
            <IntegrationRow name="Trackman" status="connected" last="3 økter" color="#FF6B00"/>
          </div>
        )}
      </div>
    </PhoneFrame>
  );
}
window.S2_Mobile = S2_Mobile;
