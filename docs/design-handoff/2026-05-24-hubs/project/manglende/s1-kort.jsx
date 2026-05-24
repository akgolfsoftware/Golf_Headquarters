// Screen 1 — Legg til betalingskort
// Three variants + one mobile mockup. All use existing workbench-v2.css.
const { useState: useS1 } = React;

// ── Shared bits for this screen ───────────────────────────────────────
function CardPreview({ name = 'Markus R. Pedersen', expires = '04 / 28', last4 = '4242', brand = 'visa' }) {
  return (
    <div className="card-preview">
      <div className="cp-top">
        <div className="cp-chip"/>
        <div className="cp-brand">AK GOLF · PRO</div>
      </div>
      <div className="cp-num">•••• &nbsp; •••• &nbsp; •••• &nbsp; {last4}</div>
      <div className="cp-bottom">
        <div className="cp-meta">Kortholder<strong>{name}</strong></div>
        <div className="cp-meta">Utløp<strong>{expires}</strong></div>
      </div>
    </div>
  );
}

function StripeField({ label, placeholder, focused = false, brand, value, error }) {
  return (
    <div className="field-stack">
      <div className="field-label">{label}</div>
      <div className={`stripe-iframe ${focused ? 'focused' : ''}`} style={error ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 3px rgba(163,45,45,0.10)' } : {}}>
        {value ? <span style={{ color: 'var(--fg)' }}>{value}</span> : <span className="placeholder">{placeholder}</span>}
        {brand === 'visa' && <div className="card-brands"><span className="brand visa">VISA</span></div>}
        {brand === 'multi' && (
          <div className="card-brands">
            <span className="brand visa">VISA</span>
            <span className="brand mc">M</span>
            <span className="brand" style={{color:'#006FCF', fontSize:7}}>AMEX</span>
          </div>
        )}
      </div>
      {error && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--danger)', letterSpacing: '0.04em' }}>{error}</div>}
    </div>
  );
}

function StateBanner({ state }) {
  if (state === 'LOADING') return (
    <div style={{
      padding: '11px 14px', borderRadius: 10,
      background: 'rgba(0,88,64,0.06)', border: '1px solid rgba(0,88,64,0.18)',
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--primary)', letterSpacing: '0.04em',
    }}>
      <div className="skel" style={{ width: 14, height: 14, borderRadius: '50%' }}/>
      Sender til Stripe · venter på autorisasjon …
    </div>
  );
  if (state === 'ERROR') return (
    <div style={{
      padding: '11px 14px', borderRadius: 10,
      background: 'rgba(163,45,45,0.08)', border: '1px solid rgba(163,45,45,0.28)',
      borderLeft: '3px solid var(--danger)',
      display: 'flex', alignItems: 'flex-start', gap: 10,
      fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg)', lineHeight: 1.45,
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--danger)', letterSpacing: '0.10em', textTransform: 'uppercase' }}>Avvist:</span>
      Kortet ble avvist av banken (kode <code style={{fontFamily:'var(--font-mono)'}}>card_declined</code>). Prøv et annet kort, eller kontakt banken.
    </div>
  );
  if (state === 'SUCCESS') return (
    <div style={{
      padding: '11px 14px', borderRadius: 10,
      background: 'rgba(209,248,67,0.30)', border: '1px solid rgba(209,248,67,0.55)',
      display: 'flex', alignItems: 'center', gap: 10,
      fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--fg)',
    }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--primary)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Check/></div>
      <strong>Kort lagt til.</strong>&nbsp;Sender deg tilbake til abonnement …
    </div>
  );
  return null;
}

// ── VARIANT A · By-the-book to-kolonne ───────────────────────────────
function S1_VariantA() {
  const [state, setState] = useS1('IDLE');
  return (
    <div className="ab">
      <div className="scroll">
        <MiniTopbar role="player" crumbs={<><span>PORTAL</span> · <span>MEG</span> · <span>ABONNEMENT</span> · <strong>KORT</strong></>}/>
        <div className="x-hero">
          <div className="head-row">
            <div>
              <div className="eyebrow">ABONNEMENT · BETALINGSKORT</div>
              <h1>Legg til <em>kort</em></h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <StateStrip states={['IDLE','LOADING','ERROR','SUCCESS']} value={state} onChange={setState}/>
            </div>
          </div>
        </div>

        <div style={{ padding: '28px 32px 48px', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 28 }}>
          {/* FORM */}
          <div className="card" style={{ padding: 28 }}>
            {state !== 'IDLE' && <div style={{ marginBottom: 18 }}><StateBanner state={state}/></div>}

            <div className="form-grid">
              <StripeField label="Kortnummer" placeholder="4242 4242 4242 4242" value={state !== 'IDLE' ? '4242 4242 4242 4242' : ''} brand="multi" focused={state === 'IDLE'}/>
              <div className="field-grid-2">
                <StripeField label="Utløpsdato" placeholder="MM / ÅÅ" value={state !== 'IDLE' ? '04 / 28' : ''}/>
                <StripeField label="CVC" placeholder="3 siffer" value={state !== 'IDLE' ? '•••' : ''} error={state === 'ERROR' ? 'Kortet ble avvist' : null}/>
              </div>
              <div className="field-grid-2">
                <div className="field-stack">
                  <div className="field-label">Postnummer</div>
                  <input className="field-input" defaultValue={state !== 'IDLE' ? '0264' : ''} placeholder="0000"/>
                </div>
                <div className="field-stack">
                  <div className="field-label">Land</div>
                  <select className="field-input" defaultValue="NO"><option value="NO">Norge</option></select>
                </div>
              </div>
              <div className="field-stack">
                <div className="field-label">Navn på kortet</div>
                <input className="field-input" defaultValue={state !== 'IDLE' ? 'Markus R. Pedersen' : ''} placeholder="Som det står på kortet"/>
              </div>

              <div className="checkbox-row" style={{ marginTop: 4 }}>
                <div className="check-box checked"><Icon.Check/></div>
                <div className="label">Sett som hovedkort<div className="hint">Brukes for fremtidige PRO-fakturaer (kr 249/mnd)</div></div>
              </div>

              <div className="info-card" style={{ marginTop: 8 }}>
                <Icon.Lock/>
                <div className="ic-body"><strong>Vi lagrer aldri kortdata.</strong> Betalingen håndteres av Stripe. AK Golf får kun et token — kortnummeret forlater aldri din enhet ukryptert.</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 28, paddingTop: 22, borderTop: '1px solid var(--border-soft)' }}>
              <button className="btn btn-ghost">Avbryt</button>
              <button className="btn btn-primary" disabled={state === 'LOADING'} style={state === 'LOADING' ? { opacity: 0.5 } : {}}>
                {state === 'LOADING' ? 'Verifiserer …' : state === 'SUCCESS' ? 'Lagt til ✓' : 'Legg til kort'}
              </button>
            </div>
          </div>

          {/* SIDE: card preview + summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <CardPreview/>
            <div className="card" style={{ padding: 20 }}>
              <div className="label-mono" style={{ marginBottom: 12 }}>NESTE BELASTNING</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>kr 249,–</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>01.06.2026</div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>PRO · månedlig · fornyes automatisk. Kanselleres når som helst fra abonnement-siden.</div>
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div className="label-mono" style={{ marginBottom: 10 }}>SIKKERHET</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                {['PCI-DSS Level 1', '3-D Secure 2 (Strong Customer Auth)', 'Tokens roteres ved hver belastning'].map(s => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--accent)', color: 'var(--fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Check/></div>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.S1_VariantA = S1_VariantA;

// ── VARIANT B · Card-first hero ───────────────────────────────────────
function S1_VariantB() {
  const [state, setState] = useS1('IDLE');
  return (
    <div className="ab">
      <div className="scroll">
        <MiniTopbar role="player" crumbs={<><span>PORTAL</span> · <strong>NYTT BETALINGSKORT</strong></>}/>
        <div style={{
          padding: '40px 64px 28px',
          background: 'linear-gradient(180deg, #003A2A 0%, #005840 100%)',
          color: '#fff', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -120, right: -80, width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(209,248,67,0.16), transparent 70%)' }}/>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'center', position: 'relative', zIndex: 1 }}>
            <div>
              <div className="eyebrow" style={{ color: 'rgba(209,248,67,0.7)' }}>ABONNEMENT · BETALINGSKORT</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.02, marginTop: 10, color: '#fff' }}>
                Legg til <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>kort</em>
              </h1>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'rgba(255,255,255,0.78)', marginTop: 14, maxWidth: 480, lineHeight: 1.55 }}>
                Brukes for PRO-fornyelse hver 1. i måneden. Du kan endre eller fjerne kortet når som helst — vi varsler 3 dager før neste belastning.
              </div>
              <div style={{ marginTop: 20 }}>
                <StateStrip states={['IDLE','LOADING','ERROR','SUCCESS']} value={state} onChange={setState}/>
              </div>
            </div>
            <CardPreview/>
          </div>
        </div>

        <div style={{ padding: '32px 64px 48px' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr' }}>
              <div style={{ padding: 32, borderRight: '1px solid var(--border)' }}>
                {state !== 'IDLE' && <div style={{ marginBottom: 18 }}><StateBanner state={state}/></div>}
                <div className="label-mono" style={{ marginBottom: 18 }}>KORTDETALJER</div>
                <div className="form-grid">
                  <StripeField label="Kortnummer" placeholder="1234 1234 1234 1234" value={state !== 'IDLE' ? '4242 4242 4242 4242' : ''} brand="multi" focused={state === 'IDLE'}/>
                  <div className="field-grid-2">
                    <StripeField label="Utløp" placeholder="MM / ÅÅ" value={state !== 'IDLE' ? '04 / 28' : ''}/>
                    <StripeField label="CVC" placeholder="•••" value={state !== 'IDLE' ? '•••' : ''} error={state === 'ERROR' ? 'Avvist' : null}/>
                  </div>
                  <div className="field-grid-2">
                    <div className="field-stack">
                      <div className="field-label">Postnummer</div>
                      <input className="field-input" defaultValue={state !== 'IDLE' ? '0264' : ''} placeholder="0000"/>
                    </div>
                    <div className="field-stack">
                      <div className="field-label">Navn på kortet</div>
                      <input className="field-input" defaultValue={state !== 'IDLE' ? 'Markus R. Pedersen' : ''} placeholder="Som det står på kortet"/>
                    </div>
                  </div>
                  <div className="checkbox-row">
                    <div className="check-box checked"><Icon.Check/></div>
                    <div className="label">Sett som hovedkort</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: 32, background: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <div className="label-mono">DETTE KORTET BELASTES</div>
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>PRO-abonnement</div>
                      <div className="mono" style={{ fontSize: 12 }}>kr 249/mnd</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600 }}>Neste fornyelse</div>
                      <div className="mono" style={{ fontSize: 12 }}>01.06.2026</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 12, borderTop: '1px solid var(--border-soft)' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>I dag</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700 }}>kr 0,–</div>
                    </div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.04em', lineHeight: 1.5 }}>Vi tester med en authorisasjon på kr 0 — ingen penger trekkes nå.</div>
                  </div>
                </div>
                <div className="info-card" style={{ marginTop: 'auto' }}>
                  <Icon.Lock/>
                  <div className="ic-body">Stripe håndterer kortdataene. Du blir aldri belastet uten å bli varslet 3 dager i forveien.</div>
                </div>
              </div>
            </div>
            <div style={{ padding: '18px 32px', borderTop: '1px solid var(--border)', background: '#fff', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className="btn btn-ghost">Avbryt</button>
              <button className="btn btn-primary">{state === 'LOADING' ? 'Verifiserer …' : 'Legg til kort'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.S1_VariantB = S1_VariantB;

// ── VARIANT C · Forest split med PRO-context ─────────────────────────
function S1_VariantC() {
  const [state, setState] = useS1('IDLE');
  return (
    <div className="ab">
      <div className="scroll">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', minHeight: '100%', height: 820 }}>
          {/* LEFT: dark PRO context */}
          <div style={{
            background: 'linear-gradient(160deg, #005840 0%, #003A2A 80%)',
            color: '#fff', padding: '40px 44px',
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column', gap: 28,
          }}>
            <div style={{ position: 'absolute', top: -60, left: -80, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(209,248,67,0.10), transparent 70%)' }}/>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="eyebrow" style={{ color: 'rgba(209,248,67,0.7)' }}>← TILBAKE TIL ABONNEMENT</div>
            </div>
            <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--accent)', color: 'var(--fg)', borderRadius: 999, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>PRO · AKTIV</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 18, color: '#fff' }}>
                Legg til et <em style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>nytt kort</em>
              </h1>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.78)', marginTop: 14, maxWidth: 380, lineHeight: 1.55 }}>
                Brukes for PRO-fornyelse hver 1. i måneden. Et nytt kort blir hovedkort automatisk, og det gamle flyttes til reserve.
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 1, paddingTop: 22, borderTop: '1px solid rgba(209,248,67,0.18)' }}>
              {['PCI-DSS Level 1 via Stripe','3-D Secure 2 (Strong Customer Auth)','Token-basert · kortdata lagres aldri'].map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'rgba(255,255,255,0.86)' }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(209,248,67,0.20)', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon.Check/></div>
                  {s}
                </div>
              ))}
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                «Vi rører aldri kortet. Stripe gjør den jobben — vi får bare et token og en kvittering.»
              </div>
            </div>
          </div>

          {/* RIGHT: form */}
          <div style={{ padding: '40px 56px', background: 'var(--card)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div className="label-mono">KORTDETALJER</div>
              <StateStrip states={['IDLE','LOADING','ERROR','SUCCESS']} value={state} onChange={setState}/>
            </div>

            {state !== 'IDLE' && <div style={{ marginBottom: 22 }}><StateBanner state={state}/></div>}

            <div className="form-grid">
              <StripeField label="Kortnummer" placeholder="1234 1234 1234 1234" value={state !== 'IDLE' ? '4242 4242 4242 4242' : ''} brand="multi" focused={state === 'IDLE'}/>
              <div className="field-grid-2">
                <StripeField label="Utløpsdato" placeholder="MM / ÅÅ" value={state !== 'IDLE' ? '04 / 28' : ''}/>
                <StripeField label="CVC" placeholder="•••" value={state !== 'IDLE' ? '•••' : ''} error={state === 'ERROR' ? 'Kort avvist' : null}/>
              </div>
              <div className="field-stack">
                <div className="field-label">Navn på kortet</div>
                <input className="field-input" defaultValue={state !== 'IDLE' ? 'Markus R. Pedersen' : ''} placeholder="Som det står på kortet"/>
              </div>
              <div className="field-stack">
                <div className="field-label">Postnummer</div>
                <input className="field-input" defaultValue={state !== 'IDLE' ? '0264' : ''} placeholder="0264 Oslo" style={{ maxWidth: 200 }}/>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                <div className="checkbox-row">
                  <div className="check-box checked"><Icon.Check/></div>
                  <div className="label">Sett som hovedkort</div>
                </div>
                <div className="checkbox-row">
                  <div className="check-box"><Icon.Check/></div>
                  <div className="label">Send kvittering på e-post hver måned</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: 28, borderTop: '1px solid var(--border-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', letterSpacing: '0.04em' }}>
                <Icon.Lock/> &nbsp; Verifisert via Stripe · ingen kortdata lagres
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-ghost">Avbryt</button>
                <button className="btn btn-primary">{state === 'LOADING' ? 'Verifiserer …' : 'Legg til kort'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.S1_VariantC = S1_VariantC;

// ── Mobile ────────────────────────────────────────────────────────────
function S1_Mobile() {
  return (
    <PhoneFrame>
      <div className="ph-header" style={{ paddingTop: 4 }}>
        <div className="back"><Icon.Back/> ABONNEMENT</div>
        <div className="eyebrow">BETALINGSKORT</div>
        <h1>Legg til <em>kort</em></h1>
      </div>
      <div className="ph-body">
        <CardPreview/>
        <div className="form-grid">
          <StripeField label="Kortnummer" placeholder="1234 1234 1234 1234" brand="multi" focused={true}/>
          <div className="field-grid-2" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <StripeField label="Utløp" placeholder="MM / ÅÅ"/>
            <StripeField label="CVC" placeholder="•••"/>
          </div>
          <div className="field-stack">
            <div className="field-label">Navn på kortet</div>
            <input className="field-input" placeholder="Som det står på kortet"/>
          </div>
          <div className="checkbox-row">
            <div className="check-box checked"><Icon.Check/></div>
            <div className="label">Sett som hovedkort</div>
          </div>
          <div className="info-card">
            <Icon.Lock/>
            <div className="ic-body" style={{ fontSize: 12 }}>Vi lagrer aldri kortdata. Sikret av Stripe.</div>
          </div>
        </div>
      </div>
      <div className="ph-footer">
        <button className="btn btn-primary">Legg til kort</button>
        <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Avbryt</button>
      </div>
    </PhoneFrame>
  );
}
window.S1_Mobile = S1_Mobile;
