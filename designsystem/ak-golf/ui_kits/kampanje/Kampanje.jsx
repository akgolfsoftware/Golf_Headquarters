const NS = window.AKGolfDesignsystem_3e5c85;
const { Logo, Navnelaas, Knapp, Kort, Felt, Velger, Avkrysning, Varsel, Talleblokk, Merkelapp, Instrumentflate } = NS;

function KampanjeSide({ mobil = false }) {
  const [sendt, setSendt] = React.useState(false);
  const [alder, setAlder] = React.useState('');
  const [epost, setEpost] = React.useState('');
  const [erfaring, setErfaring] = React.useState('');
  const [gruppe, setGruppe] = React.useState('');
  const [samtykke, setSamtykke] = React.useState(false);
  const [feil, setFeil] = React.useState({});

  const send = () => {
    const f = {};
    if (!alder) f.alder = 'Skriv alderen til barnet. Vi bruker den til å finne riktig gruppe.';
    if (!epost.includes('@')) f.epost = 'Skriv e-postadressen med @ og domene.';
    setFeil(f);
    if (Object.keys(f).length === 0) setSendt(true);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: mobil ? '1fr' : '1fr 1fr', minHeight: mobil ? undefined : 900 }}>
      <div style={{ background: 'var(--ak-v-junior)', color: '#fff', padding: mobil ? 'var(--ak-r-6) var(--ak-r-4) var(--ak-r-8)' : 'var(--ak-r-8)' }}>
        <Navnelaas variant="junior-academy" paaMorkt hoyde={mobil ? 26 : 32} rot="../../assets/logo/" />
        <h1 style={{
          marginTop: mobil ? 'var(--ak-r-7)' : 'var(--ak-r-9)', color: '#fff',
          fontSize: mobil ? 'var(--ak-t-48)' : 'var(--ak-t-72)',
          lineHeight: 'var(--ak-lh-display)', letterSpacing: 'var(--ak-sp-display)'
        }}>Juniorgruppene starter 1. mai.</h1>
        <p style={{ marginTop: 'var(--ak-r-5)', fontSize: 'var(--ak-t-21)', color: 'rgba(255,255,255,.94)', maxWidth: '38ch' }}>
          Vi har plass i U10 og U14. Send alder og litt om erfaringen, så finner vi riktig gruppe.
        </p>
        <p style={{ marginTop: 'var(--ak-r-4)', fontSize: 'var(--ak-t-17)', color: 'rgba(255,255,255,.86)', maxWidth: '42ch' }}>
          Barnet ditt skal vite hva det jobber med. AK-stigen tar spilleren fra første golfskole til turneringsspill, i trinn med navn — og du ser hvilket trinn barnet står på.
        </p>
        <img src="../../assets/foto/ak-golf-35.webp" alt="Ball i gresset på et treningsfelt, lav kameravinkel mot blå himmel"
          style={{ width: '100%', height: mobil ? 200 : 280, objectFit: 'cover', borderRadius: 'var(--ak-hjorne-md)', marginTop: 'var(--ak-r-7)' }} />
        <div style={{ marginTop: 'var(--ak-r-6)', display: 'flex', gap: 'var(--ak-r-6)', flexWrap: 'wrap' }}>
          <div>
            <div className="ak-etikett" style={{ color: 'rgba(255,255,255,.78)' }}>Oppstart</div>
            <div className="ak-maalt" style={{ fontSize: 'var(--ak-t-26)', marginTop: 4 }}>01.05.2027</div>
          </div>
          <div>
            <div className="ak-etikett" style={{ color: 'rgba(255,255,255,.78)' }}>Ledige plasser</div>
            <div className="ak-maalt" style={{ fontSize: 'var(--ak-t-26)', marginTop: 4 }}>U10: 6 · U14: 4</div>
          </div>
          <div>
            <div className="ak-etikett" style={{ color: 'rgba(255,255,255,.78)' }}>Svar innen</div>
            <div className="ak-maalt" style={{ fontSize: 'var(--ak-t-26)', marginTop: 4 }}>1 virkedag</div>
          </div>
        </div>
      </div>

      <Instrumentflate som="div" tett style={{ padding: mobil ? 'var(--ak-r-7) var(--ak-r-4)' : 'var(--ak-r-8)', display: 'flex', alignItems: 'center' }}>
        <Kort tyngde={3} style={{ width: '100%', maxWidth: 520, margin: '0 auto', padding: mobil ? 'var(--ak-r-5)' : 'var(--ak-r-6)' }}>
          {sendt ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ak-r-4)' }}>
              <Varsel tilstand="ok" tittel="Vi har fått meldinga di.">
                Du får svar innen én virkedag. Vi tar en samtale før oppstart og finner riktig gruppe sammen.
              </Varsel>
              <Knapp variant="tekst" onClick={() => setSendt(false)}>Send en ny påmelding</Knapp>
            </div>
          ) : (
            <>
              <span className="ak-etikett">Meld interesse</span>
              <h2 style={{ marginTop: 'var(--ak-r-2)', fontSize: 'var(--ak-t-34)' }}>Fire felter. Ikke mer.</h2>
              <div style={{ marginTop: 'var(--ak-r-5)', display: 'flex', flexDirection: 'column', gap: 'var(--ak-r-4)' }}>
                <Felt merkelapp="Barnets alder" type="number" enhet="år" paakrevd verdi={alder} onEndre={setAlder}
                  feil={feil.alder} hjelp={feil.alder ? undefined : 'Vi bruker alderen til å finne riktig gruppe.'} />
                <Felt merkelapp="Din e-post" type="email" paakrevd verdi={epost} onEndre={setEpost} feil={feil.epost} />
                <Velger merkelapp="Ønsket gruppe" verdi={gruppe} onEndre={setGruppe} plassholder="Vi foreslår gjerne"
                  valg={[{ verdi: 'u10', tekst: 'U10 — 6 plasser' }, { verdi: 'u14', tekst: 'U14 — 4 plasser' }, { verdi: 'vet-ikke', tekst: 'Vet ikke ennå' }]} />
                <Felt merkelapp="Litt om erfaringen" flerlinje verdi={erfaring} onEndre={setErfaring}
                  plassholder="Har spilt golfskole to somrer, slår mest på rangen." />
                <Avkrysning avkrysset={samtykke} onEndre={setSamtykke}
                  merkelapp="Jeg samtykker til at bilder av barnet mitt kan brukes i AK Golfs materiell."
                  hjelp="Samtykket er skriftlig og kan trekkes tilbake når som helst." />
                <Knapp storrelse="lg" fullBredde onClick={send}>Meld interesse</Knapp>
                <p style={{ fontSize: 'var(--ak-t-13)', color: 'var(--ak-dempet)' }}>
                  Gruppene settes etter alder og erfaring, ikke etter hvem som meldte seg først.
                </p>
              </div>
            </>
          )}
        </Kort>
      </Instrumentflate>
    </div>
  );
}
Object.assign(window, { KampanjeSide });
