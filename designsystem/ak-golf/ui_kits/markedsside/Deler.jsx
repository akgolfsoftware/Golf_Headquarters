const NS = window.AKGolfDesignsystem_3e5c85;
const { Logo, Knapp, Kort, Fotokort, Talleblokk, Faktarad, Instrumentflate, Merkelapp, Akkordeon, Toppnav, Mobilmeny } = NS;

const LOGOROT = '../../assets/logo/';
const FOTO = '../../assets/foto/';

const LENKER = [
  { href: '/coaching', tekst: 'Coaching' },
  { href: '/junior', tekst: 'Junior' },
  { href: '/priser', tekst: 'Priser' },
  { href: '/om-oss', tekst: 'Om oss' },
  { href: '/kontakt', tekst: 'Kontakt' }
];

function Seksjon({ senket, children, mobil, style, ...rest }) {
  return (
    <section {...rest} style={{
      background: senket ? 'var(--ak-grunn-senk)' : 'transparent',
      padding: (mobil ? 'var(--ak-r-9)' : 'var(--ak-r-10)') + ' 0',
      ...style
    }}>
      <div style={{ maxWidth: 'var(--ak-sidebredde)', margin: '0 auto', padding: mobil ? '0 var(--ak-r-4)' : '0 var(--ak-r-6)' }}>
        {children}
      </div>
    </section>
  );
}

function Hero({ mobil }) {
  return (
    <Instrumentflate som="div" tett={mobil} style={{ borderBottom: '1px solid var(--ak-linje)' }}>
      <div style={{
        maxWidth: 'var(--ak-sidebredde)', margin: '0 auto',
        padding: mobil ? 'var(--ak-r-8) var(--ak-r-4) var(--ak-r-9)' : 'var(--ak-r-9) var(--ak-r-6) var(--ak-r-10)'
      }}>
        <h1 style={{
          fontSize: mobil ? 'var(--ak-t-72)' : 'var(--ak-t-112)',
          lineHeight: 'var(--ak-lh-display)', letterSpacing: 'var(--ak-sp-display)',
          textTransform: 'uppercase', maxWidth: mobil ? undefined : '15ch'
        }}>Uansett hvor du står, vet du hva du trener på.</h1>
        <p style={{
          fontSize: 'var(--ak-t-21)', color: 'var(--ak-tekst)',
          marginTop: mobil ? 'var(--ak-r-5)' : 'var(--ak-r-6)', maxWidth: '54ch'
        }}>
          Vi måler svingen din, tallene dine og spillet ditt. Så får du en plan som holder mellom øktene — og oppfølging som gjør at den faktisk blir fulgt.
        </p>
        <div style={{ marginTop: 'var(--ak-r-6)', display: 'flex', gap: 'var(--ak-r-4)', flexWrap: 'wrap' }}>
          <Knapp storrelse="lg" fullBredde={mobil}>Book kartleggingsøkt</Knapp>
        </div>
        <p style={{ marginTop: 'var(--ak-r-5)', fontSize: 'var(--ak-t-15)', color: 'var(--ak-dempet)', maxWidth: '52ch' }}>
          Første økt er 90 minutter, til vanlig timepris. Vi kartlegger hvor du står, og du går derfra med en skriftlig plan.
        </p>
      </div>
    </Instrumentflate>
  );
}

function Bilde({ mobil }) {
  return (
    <figure style={{ margin: 0 }}>
      <img src={FOTO + 'ak-golf-01.webp'} alt="Spiller slår, coach følger målingen på Trackman bak"
        style={{ width: '100%', height: mobil ? 260 : 480, objectFit: 'cover', display: 'block' }} />
      <figcaption style={{
        maxWidth: 'var(--ak-sidebredde)', margin: '0 auto', padding: mobil ? 'var(--ak-r-3) var(--ak-r-4)' : 'var(--ak-r-3) var(--ak-r-6)',
        fontSize: 'var(--ak-t-13)', color: 'var(--ak-dempet)', display: 'flex', gap: 'var(--ak-r-3)'
      }}>
        <span>Trackman står i hver økt. Det er der planen begynner.</span>
        <span className="ak-maalt" style={{ color: 'var(--ak-svak)' }}>Foto #1</span>
      </figcaption>
    </figure>
  );
}

function Problemet({ mobil }) {
  return (
    <Seksjon senket mobil={mobil}>
      <h2 style={{ fontSize: mobil ? 'var(--ak-t-34)' : 'var(--ak-t-48)', letterSpacing: 'var(--ak-sp-display)', lineHeight: 'var(--ak-lh-display)', maxWidth: '24ch' }}>
        De fleste vet ikke hva de trener på.
      </h2>
      <p style={{ marginTop: mobil ? 'var(--ak-r-5)' : 'var(--ak-r-6)', fontSize: 'var(--ak-t-17)', maxWidth: '58ch' }}>
        Ikke fordi de er late. Fordi ingen har målt. Du slår en bøtte baller, det føles bedre eller verre, og neste uke starter du på nytt. Det er ikke trening — det er håp.
      </p>
      <div style={{ marginTop: 'var(--ak-r-7)', display: 'grid', gridTemplateColumns: mobil ? '1fr' : 'repeat(3, 1fr)', gap: mobil ? 'var(--ak-r-4)' : 'var(--ak-r-5)' }}>
        {[
          { t: 'Timen hos proffen', b: 'Slutter når timen slutter. Neste gang begynner på nytt, ofte med et nytt fokus.' },
          { t: 'Å lære av video', b: 'Uendelig med råd, null diagnose. Du vet ikke hvilket av tusen råd som gjelder deg.' },
          { t: 'En app uten coach', b: 'Registrerer hva du gjorde. Sier ingenting om hva du burde gjort.' }
        ].map((k) => (
          <Kort key={k.t} tyngde={1}>
            <h4 style={{ fontSize: 'var(--ak-t-21)' }}>{k.t}</h4>
            <p style={{ marginTop: 'var(--ak-r-3)', fontSize: 'var(--ak-t-15)', color: 'var(--ak-dempet)' }}>{k.b}</p>
          </Kort>
        ))}
      </div>
    </Seksjon>
  );
}

function Losningen({ mobil }) {
  return (
    <Seksjon mobil={mobil}>
      <div style={{ display: 'grid', gridTemplateColumns: mobil ? '1fr' : '1fr 1fr', gap: mobil ? 'var(--ak-r-6)' : 'var(--ak-r-8)', alignItems: 'start' }}>
        <div>
          <span className="ak-etikett">Slik jobber vi</span>
          <h2 style={{ marginTop: 'var(--ak-r-3)', fontSize: mobil ? 'var(--ak-t-34)' : 'var(--ak-t-48)', letterSpacing: 'var(--ak-sp-display)', lineHeight: 'var(--ak-lh-display)' }}>
            Vi begynner med et tall.
          </h2>
          <p style={{ marginTop: 'var(--ak-r-5)', fontSize: 'var(--ak-t-17)' }}>
            Trackman måler hva køllehodet faktisk gjør. Testbatteriet viser hvor du står i forhold til deg selv sist. Deretter legger vi planen — og den ligger i appen, så du vet hva onsdagsøkta skal inneholde.
          </p>
          <Faktarad style={{ marginTop: 'var(--ak-r-6)' }} kompakt poster={[
            { etikett: 'Testprotokoller', verdi: '20' },
            { etikett: 'Posisjoner i svingen', verdi: 'P1–P10' },
            { etikett: 'Trackman i hver økt', verdi: '100', enhet: '%' }
          ]} />
        </div>
        <Fotokort bilde={FOTO + 'ak-golf-09.webp'} alt="Coach og spiller ser på Trackman-skjermen sammen"
          bildetekst="Målingen tolkes i økta, ikke i etterkant." kilde="Foto #9" forhold="4 / 3" />
      </div>
    </Seksjon>
  );
}

function Tallet({ mobil }) {
  return (
    <Seksjon mobil={mobil} senket>
      <div style={{ display: 'grid', gridTemplateColumns: mobil ? '1fr' : '1fr 1fr', gap: mobil ? 'var(--ak-r-6)' : 'var(--ak-r-8)', alignItems: 'center' }}>
        <Talleblokk etikett="Carry, driver" tall="+12,4" enhet="m" storrelse={mobil ? 'lg' : 'xl'} fremhevet
          forklaring="Vi endret ikke svingen først. Vi målte i seks økter, fant at Attack Angle var problemet, og jobbet bare med den."
          kilde="Trackman" dato="12.05–18.08.2026" antall={38} />
        <div>
          <h3 style={{ fontSize: 'var(--ak-t-26)' }}>Slik leser du tallet</h3>
          <p style={{ marginTop: 'var(--ak-r-4)', fontSize: 'var(--ak-t-17)', color: 'var(--ak-dempet)' }}>
            Attack Angle beskriver om køllehodet går opp eller ned i treffet. Går det nedover med driver, får du høy Spin Rate og lav Launch Angle — du taper lengde uten å slå svakere.
          </p>
          <p style={{ marginTop: 'var(--ak-r-4)', fontSize: 'var(--ak-t-17)', color: 'var(--ak-dempet)' }}>
            Du kjenner det ikke. Det er derfor vi måler det.
          </p>
        </div>
      </div>
    </Seksjon>
  );
}

function Junior({ mobil }) {
  return (
    <section style={{ background: 'var(--ak-v-junior)', color: '#FFFFFF' }}>
      <div style={{
        maxWidth: 'var(--ak-sidebredde)', margin: '0 auto',
        padding: mobil ? 'var(--ak-r-9) var(--ak-r-4)' : 'var(--ak-r-10) var(--ak-r-6)',
        display: 'grid', gridTemplateColumns: mobil ? '1fr' : '1.1fr 1fr', gap: mobil ? 'var(--ak-r-6)' : 'var(--ak-r-8)', alignItems: 'center'
      }}>
        <div>
          <span className="ak-etikett" style={{ color: 'rgba(255,255,255,.78)' }}>Junior Academy</span>
          <h2 style={{ marginTop: 'var(--ak-r-3)', fontSize: mobil ? 'var(--ak-t-34)' : 'var(--ak-t-48)', letterSpacing: 'var(--ak-sp-display)', lineHeight: 'var(--ak-lh-display)', color: '#fff' }}>
            Barnet ditt skal vite hva det jobber med.
          </h2>
          <p style={{ marginTop: 'var(--ak-r-5)', fontSize: 'var(--ak-t-17)', color: 'rgba(255,255,255,.92)' }}>
            AK Golf Junior Academy tar spilleren fra første golfskole til turneringsspill, i trinn med navn. Du ser hvilket trinn barnet står på, og hva som skal til for det neste.
          </p>
          <div style={{ marginTop: 'var(--ak-r-6)' }}>
            <Knapp variant="sekundaer" fullBredde={mobil}
              style={{ borderColor: 'rgba(255,255,255,.6)', color: '#fff', background: 'transparent' }}>Meld interesse</Knapp>
          </div>
        </div>
        <img src={FOTO + 'ak-golf-35.webp'} alt="Ball i gresset på et treningsfelt, lav kameravinkel mot blå himmel"
          style={{ width: '100%', height: mobil ? 220 : 320, objectFit: 'cover', borderRadius: 'var(--ak-hjorne-md)' }} />
      </div>
    </section>
  );
}

function Sporsmal({ mobil }) {
  return (
    <Seksjon mobil={mobil}>
      <h2 style={{ fontSize: mobil ? 'var(--ak-t-26)' : 'var(--ak-t-34)' }}>Det foreldre spør om</h2>
      <Akkordeon style={{ marginTop: 'var(--ak-r-5)', maxWidth: 760 }} apenIndeks={0} poster={[
        { tittel: 'Hva koster kartleggingsøkta?', innhold: '90 minutter til vanlig timepris. Du går derfra med en skriftlig plan. Ingen binding etterpå.' },
        { tittel: 'Må barnet ha eget utstyr?', innhold: 'Nei. Vi har køller til lån i alle gruppene til og med U12.' },
        { tittel: 'Hva koster appen?', innhold: 'Testbatteriet, statistikken og verktøyene er gratis, uten utløpsdato. Resten av appen koster 299 kr i måneden. Har du coaching-pakke, følger appen med.' },
        { tittel: 'Hvordan settes gruppene?', innhold: 'Etter alder og erfaring, ikke etter hvem som meldte seg først. Vi finner riktig gruppe i en samtale før oppstart.' }
      ]} />
    </Seksjon>
  );
}

function Avslutning({ mobil }) {
  return (
    <section style={{ position: 'relative' }}>
      <img src={FOTO + 'ak-golf-28.webp'} alt="Spiller på green mot mørk bakgrunn"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <span aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,20,19,.9) 0%, rgba(20,20,19,.66) 44%, rgba(20,20,19,.34) 100%)' }} />
      <div style={{
        position: 'relative', maxWidth: 'var(--ak-sidebredde)', margin: '0 auto',
        padding: mobil ? 'var(--ak-r-9) var(--ak-r-4)' : 'var(--ak-r-10) var(--ak-r-6)'
      }}>
        <h2 style={{ fontSize: mobil ? 'var(--ak-t-34)' : 'var(--ak-t-48)', letterSpacing: 'var(--ak-sp-display)', lineHeight: 'var(--ak-lh-display)', color: '#fff', maxWidth: '22ch' }}>
          Klar for å finne ut hvor du faktisk står?
        </h2>
        <p style={{ marginTop: 'var(--ak-r-4)', fontSize: 'var(--ak-t-21)', color: 'rgba(255,255,255,.92)' }}>
          90 minutter, vanlig timepris. Du går derfra med en plan.
        </p>
        <div style={{ marginTop: 'var(--ak-r-6)' }}>
          <Knapp storrelse="lg" fullBredde={mobil}>Book kartleggingsøkt</Knapp>
        </div>
      </div>
    </section>
  );
}

function Bunn({ mobil }) {
  return (
    <footer style={{ borderTop: '1px solid var(--ak-linje)', background: 'var(--ak-grunn)' }}>
      <div style={{
        maxWidth: 'var(--ak-sidebredde)', margin: '0 auto',
        padding: mobil ? 'var(--ak-r-6) var(--ak-r-4)' : 'var(--ak-r-7) var(--ak-r-6)',
        display: 'grid', gridTemplateColumns: mobil ? '1fr' : '1.4fr 1fr 1fr', gap: 'var(--ak-r-6)'
      }}>
        <div>
          <Logo rot={LOGOROT} hoyde={32} />
          <p style={{ marginTop: 'var(--ak-r-4)', fontSize: 'var(--ak-t-15)', color: 'var(--ak-dempet)', maxWidth: '34ch' }}>
            AK Golf Academy drives av Anders Kristiansen — golfcoach, sportssjef i Gamle Fredrikstad Golfklubb og coach ved WANG Toppidrett Fredrikstad.
          </p>
          <div style={{ marginTop: 'var(--ak-r-4)', display: 'flex', gap: 'var(--ak-r-2)', flexWrap: 'wrap' }}>
            <Merkelapp variant="junior">Junior Academy</Merkelapp>
            <Merkelapp variant="hq">AK Golf HQ</Merkelapp>
            <Merkelapp variant="produkt">Skarpnord</Merkelapp>
          </div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ak-r-3)' }}>
          <span className="ak-etikett">Tilbud</span>
          {['Coaching', 'Junior Academy', 'Priser', 'Kontakt'].map((t) => (
            <a key={t} href="#" style={{ fontSize: 'var(--ak-t-15)', color: 'var(--ak-tekst)', textDecoration: 'none' }}>{t}</a>
          ))}
        </nav>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ak-r-3)' }}>
          <span className="ak-etikett">Kontakt</span>
          <span className="ak-maalt" style={{ fontSize: 'var(--ak-t-15)' }}>post@akgolf.no</span>
          <span style={{ fontSize: 'var(--ak-t-15)', color: 'var(--ak-dempet)' }}>Vi svarer innen én virkedag.</span>
          <span style={{ fontSize: 'var(--ak-t-13)', color: 'var(--ak-svak)' }}>Gamle Fredrikstad GK, Fredrikstad</span>
        </div>
      </div>
    </footer>
  );
}

function Markedsside({ mobil = false }) {
  const [meny, setMeny] = React.useState(false);
  return (
    <div style={{ position: 'relative', background: 'var(--ak-grunn)', minHeight: '100%' }}>
      <Toppnav mobil={mobil} logoRot={LOGOROT} aktiv="/" lenker={LENKER} onMeny={() => setMeny(true)}
        handling={<Knapp storrelse="sm">Book kartleggingsøkt</Knapp>} />
      <Hero mobil={mobil} />
      <Bilde mobil={mobil} />
      <Problemet mobil={mobil} />
      <Losningen mobil={mobil} />
      <Tallet mobil={mobil} />
      <Junior mobil={mobil} />
      <Sporsmal mobil={mobil} />
      <Avslutning mobil={mobil} />
      <Bunn mobil={mobil} />
      <Mobilmeny apen={meny} onLukk={() => setMeny(false)} aktiv="/" lenker={LENKER} logoRot={LOGOROT}
        handling={<Knapp fullBredde storrelse="lg">Book kartleggingsøkt</Knapp>} />
    </div>
  );
}

Object.assign(window, { Markedsside, Seksjon, LENKER, LOGOROT, FOTO });
