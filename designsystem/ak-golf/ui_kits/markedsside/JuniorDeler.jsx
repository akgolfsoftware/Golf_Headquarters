/* Junior-siden (/junior). Bruker Seksjon, Bunn-mønsteret og LENKER fra Deler.jsx.
   Tekst ordrett fra guidelines/tekstkonsept.md §Junior. Ingen bilder av barn:
   arkivet har ingen med samtykke, så siden bæres av tall og detaljer (#35, #24). */
const { Logo, Knapp, Kort, Talleblokk, Faktarad, Akkordeon, Toppnav, Mobilmeny, Merkelapp } = window.AKGolfDesignsystem_3e5c85;

function JuniorHero({ mobil }) {
  return (
    <section style={{ background: 'var(--ak-v-junior)', color: '#FFFFFF' }}>
      <div style={{ maxWidth: 'var(--ak-sidebredde)', margin: '0 auto', padding: mobil ? 'var(--ak-r-8) var(--ak-r-4) var(--ak-r-9)' : 'var(--ak-r-9) var(--ak-r-6) var(--ak-r-10)' }}>
        <span className="ak-etikett" style={{ color: 'rgba(255,255,255,.78)' }}>AK Golf Junior Academy</span>
        <h1 style={{ marginTop: 'var(--ak-r-3)', fontSize: mobil ? 'var(--ak-t-48)' : 'var(--ak-t-72)', lineHeight: 'var(--ak-lh-display)', letterSpacing: 'var(--ak-sp-display)', color: '#fff', maxWidth: '18ch' }}>
          Barnet ditt skal vite hva det jobber med.
        </h1>
        <p style={{ marginTop: 'var(--ak-r-5)', fontSize: 'var(--ak-t-21)', color: 'rgba(255,255,255,.92)', maxWidth: '52ch' }}>
          AK Golf Junior Academy tar spilleren fra første golfskole til turneringsspill, i trinn med navn. Du ser hvilket trinn barnet står på, og hva som skal til for det neste.
        </p>
        <div style={{ marginTop: 'var(--ak-r-6)' }}>
          <Knapp storrelse="lg" fullBredde={mobil} style={{ background: '#fff', color: 'var(--ak-v-junior)', '--ak-h-bg': 'var(--ak-grunn)', '--ak-h-tekst': 'var(--ak-v-junior)' }}>Meld interesse</Knapp>
        </div>
      </div>
    </section>
  );
}

function Forelderen({ mobil }) {
  return (
    <Seksjon mobil={mobil}>
      <div style={{ display: 'grid', gridTemplateColumns: mobil ? '1fr' : '1fr 1fr', gap: mobil ? 'var(--ak-r-6)' : 'var(--ak-r-8)', alignItems: 'center' }}>
        <div>
          <span className="ak-etikett">For forelderen</span>
          <h2 style={{ marginTop: 'var(--ak-r-3)', fontSize: mobil ? 'var(--ak-t-34)' : 'var(--ak-t-48)', letterSpacing: 'var(--ak-sp-display)', lineHeight: 'var(--ak-lh-display)', maxWidth: '20ch' }}>Du slipper å spørre hvordan det går.</h2>
          <p style={{ marginTop: 'var(--ak-r-5)', fontSize: 'var(--ak-t-17)', maxWidth: '54ch' }}>Foreldreportalen viser hva som er trent, hva som er målt og hva som er neste steg. Ingen ukentlige meldinger fra deg som må besvares — du ser det selv.</p>
        </div>
        <Kort tyngde={2}>
          <Talleblokk etikett="Trinn på AK-stigen" tall="5" enhet="av 9" storrelse="lg" forklaring="Basis. Neste trinn krever to turneringsrunder under 85." kilde="AK Golf HQ" dato="18.08.2026" />
          <p className="ak-maalt" style={{ marginTop: 'var(--ak-r-3)', fontSize: 'var(--ak-t-13)', color: 'var(--ak-svak)' }}>Eksempel — slik ser det ut i foreldreportalen</p>
        </Kort>
      </div>
    </Seksjon>
  );
}

function Gruppene({ mobil }) {
  const trinn = [
    { n: 'Mini', a: '6–8 år', b: 'Første møte med ballen. Lek, køller til lån, ingen tall ennå.' },
    { n: 'Knøtt', a: '8–10 år', b: 'Grunnslag og korte hull. Første måling: hvor langt går 7-jernet.' },
    { n: 'Basis', a: '10–13 år', b: 'Teknikk med Trackman, egen plan i appen, første turnering.' },
    { n: 'Utvikling', a: '13 år og opp', b: 'Turneringsspill, testbatteri, periodisert plan. Veien til Elite.' }
  ];
  return (
    <Seksjon senket mobil={mobil}>
      <span className="ak-etikett">Gruppene</span>
      <h2 style={{ marginTop: 'var(--ak-r-3)', fontSize: mobil ? 'var(--ak-t-34)' : 'var(--ak-t-48)', letterSpacing: 'var(--ak-sp-display)', lineHeight: 'var(--ak-lh-display)' }}>Fire veier inn.</h2>
      <p style={{ marginTop: 'var(--ak-r-5)', fontSize: 'var(--ak-t-17)', maxWidth: '58ch' }}>Gruppene er satt etter alder og erfaring, ikke etter hvem som meldte seg først. Vi finner riktig gruppe i en samtale før oppstart.</p>
      <div style={{ marginTop: 'var(--ak-r-7)', display: 'grid', gridTemplateColumns: mobil ? '1fr' : 'repeat(4, 1fr)', gap: mobil ? 'var(--ak-r-4)' : 'var(--ak-r-5)' }}>
        {trinn.map((t, i) => (
          <Kort key={t.n} tyngde={1} style={{ borderTop: '3px solid var(--ak-v-junior)' }}>
            <span className="ak-etikett">Trinn {i + 1} · {t.a}</span>
            <h4 style={{ marginTop: 'var(--ak-r-2)', fontSize: 'var(--ak-t-26)' }}>{t.n}</h4>
            <p style={{ marginTop: 'var(--ak-r-3)', fontSize: 'var(--ak-t-15)', color: 'var(--ak-dempet)' }}>{t.b}</p>
          </Kort>
        ))}
      </div>
      <Faktarad style={{ marginTop: 'var(--ak-r-7)' }} kompakt poster={[
        { etikett: 'Køller til lån', verdi: 't.o.m. U12' },
        { etikett: 'Plasser per gruppe', verdi: '8' },
        { etikett: 'Trenere per gruppe', verdi: '2' }
      ]} />
    </Seksjon>
  );
}

function JuniorSporsmal({ mobil }) {
  return (
    <Seksjon mobil={mobil}>
      <h2 style={{ fontSize: mobil ? 'var(--ak-t-26)' : 'var(--ak-t-34)' }}>Det foreldre spør om</h2>
      <Akkordeon style={{ marginTop: 'var(--ak-r-5)', maxWidth: 760 }} apenIndeks={0} poster={[
        { tittel: 'Må barnet ha eget utstyr?', innhold: 'Nei. Vi har køller til lån i alle gruppene til og med U12.' },
        { tittel: 'Hva koster det?', innhold: 'Gruppeplass betales per semester. Prisen står i bookingen, ikke her — den hentes fra samme sted som fakturaen.' },
        { tittel: 'Kan jeg se hva barnet trener på?', innhold: 'Ja. Foreldreportalen viser øktene, målingene og neste steg. Du får en kort rapport etter hver periode.' },
        { tittel: 'Hva hvis barnet ikke vil konkurrere?', innhold: 'Da konkurrerer det ikke. Trinnene handler om hva spilleren kan, ikke om turneringer. Turneringsspill kommer når spilleren vil.' }
      ]} />
    </Seksjon>
  );
}

function JuniorAvslutning({ mobil }) {
  return (
    <section style={{ background: 'var(--ak-tekst)', color: 'var(--ak-grunn)' }}>
      <div style={{ maxWidth: 'var(--ak-sidebredde)', margin: '0 auto', padding: mobil ? 'var(--ak-r-9) var(--ak-r-4)' : 'var(--ak-r-10) var(--ak-r-6)', display: 'grid', gridTemplateColumns: mobil ? '1fr' : '1fr 1fr', gap: 'var(--ak-r-8)', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: mobil ? 'var(--ak-t-34)' : 'var(--ak-t-48)', letterSpacing: 'var(--ak-sp-display)', lineHeight: 'var(--ak-lh-display)', color: 'var(--ak-grunn)', maxWidth: '20ch' }}>Lurer du på hvilken gruppe som passer?</h2>
          <p style={{ marginTop: 'var(--ak-r-4)', fontSize: 'var(--ak-t-21)', color: 'var(--ak-grunn)', opacity: 0.9 }}>Send oss alder og litt om erfaringen, så tar vi kontakt innen én virkedag.</p>
          <div style={{ marginTop: 'var(--ak-r-6)' }}><Knapp storrelse="lg" fullBredde={mobil}>Meld interesse</Knapp></div>
        </div>
        <img src={FOTO + 'ak-golf-24.webp'} alt="Ball i luften like etter en chip, gress i forgrunnen" style={{ width: '100%', height: mobil ? 220 : 340, objectFit: 'cover', borderRadius: 'var(--ak-hjorne-md)' }} />
      </div>
    </section>
  );
}

function Juniorside({ mobil = false }) {
  const [meny, setMeny] = React.useState(false);
  return (
    <div style={{ position: 'relative', background: 'var(--ak-grunn)', minHeight: '100%' }}>
      <Toppnav mobil={mobil} logoRot={LOGOROT} aktiv="/junior" lenker={LENKER} onMeny={() => setMeny(true)} handling={<Knapp storrelse="sm">Meld interesse</Knapp>} />
      <JuniorHero mobil={mobil} />
      <Forelderen mobil={mobil} />
      <Gruppene mobil={mobil} />
      <JuniorSporsmal mobil={mobil} />
      <JuniorAvslutning mobil={mobil} />
      <Bunn mobil={mobil} />
      <Mobilmeny apen={meny} onLukk={() => setMeny(false)} aktiv="/junior" lenker={LENKER} logoRot={LOGOROT} handling={<Knapp fullBredde storrelse="lg">Meld interesse</Knapp>} />
    </div>
  );
}
Object.assign(window, { Juniorside });
