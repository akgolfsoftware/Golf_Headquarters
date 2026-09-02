const NS = window.AKGolfDesignsystem_3e5c85;
const { Logo, Navnelaas, Talleblokk, Faktarad, Tabell, Liste, Kort, Status, Merkelapp, Knapp, TomTilstand, Maalestokk, Brodsmuler } = NS;

function Rapport({ tom = false }) {
  return (
    <div style={{ background: 'var(--ak-ark)', maxWidth: 820, margin: '0 auto', padding: 'var(--ak-r-8)', boxShadow: 'var(--ak-loft-2)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--ak-r-5)', borderBottom: '1px solid var(--ak-linje-hard)', paddingBottom: 'var(--ak-r-5)' }}>
        <div>
          <Navnelaas variant="junior-academy" hoyde={30} rot="../../assets/logo/" />
          <h1 style={{ marginTop: 'var(--ak-r-5)', fontSize: 'var(--ak-t-34)' }}>Fremgang, Emil — sesong 2026</h1>
          <p style={{ marginTop: 'var(--ak-r-3)', fontSize: 'var(--ak-t-15)', color: 'var(--ak-dempet)' }}>
            Alt i denne rapporten er målt. Står det ikke dato og kilde ved et tall, hører det ikke hjemme her.
          </p>
        </div>
        <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
          <div className="ak-etikett">Skrevet</div>
          <div className="ak-maalt" style={{ fontSize: 'var(--ak-t-17)', marginTop: 4 }}>01.09.2026</div>
          <div style={{ marginTop: 'var(--ak-r-3)' }}><Merkelapp variant="junior">U14</Merkelapp></div>
        </div>
      </header>

      {tom ? (
        <div style={{ marginTop: 'var(--ak-r-7)' }}>
          <TomTilstand tittel="Ingen målinger på Emil ennå"
            forklaring="Første kartleggingsøkt gir det første tallet. Fra da av har rapporten noe å sammenligne mot, og du ser fremgangen uten å spørre."
            handling={<Knapp>Book kartleggingsøkt</Knapp>} />
        </div>
      ) : (
        <>
          <div style={{ marginTop: 'var(--ak-r-7)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ak-r-7)', alignItems: 'start' }}>
            <Talleblokk etikett="Dispersion, 7-jern" tall="6,8" enhet="m" storrelse="xl" fremhevet
              forklaring="Hvor mye ballene spres sideveis. Lavere er bedre — Emil traff et 14,2 m bredt vindu i april."
              kilde="Trackman" dato="18.08.2026" antall={22} />
            <div>
              <span className="ak-etikett">Slik leser du tallet</span>
              <p style={{ marginTop: 'var(--ak-r-3)', fontSize: 'var(--ak-t-17)' }}>
                Vi har ikke jobbet med å slå hardere. Vi har jobbet med Face to Path — forholdet mellom hvor køllebladet peker og hvor køllehodet går. Da samler ballene seg.
              </p>
              <p style={{ marginTop: 'var(--ak-r-4)', fontSize: 'var(--ak-t-17)', color: 'var(--ak-dempet)' }}>
                Begge målingene er gjort med samme oppsett, samme kølle og samme ball. Ellers er sammenligningen verdiløs.
              </p>
            </div>
          </div>

          <Faktarad style={{ marginTop: 'var(--ak-r-7)' }} kompakt poster={[
            { etikett: 'Økter denne sesongen', verdi: '22', note: 'Registrert i AK Golf HQ' },
            { etikett: 'Målinger', verdi: '86', note: 'Trackman' },
            { etikett: 'Trinn på AK-stigen', verdi: '5 av 9', note: 'Vurdert 18.08.2026' }
          ]} />

          <h2 style={{ marginTop: 'var(--ak-r-8)', fontSize: 'var(--ak-t-26)' }}>Målingene</h2>
          <Tabell style={{ marginTop: 'var(--ak-r-4)' }} tekst="Trackman · samme oppsett, kølle og ball i begge måleseriene"
            kolonner={[
              { noekkel: 'hva', tittel: 'Måling' },
              { noekkel: 'april', tittel: 'April', maalt: true },
              { noekkel: 'august', tittel: 'August', maalt: true },
              { noekkel: 'status', tittel: 'Vurdering' }
            ]}
            rader={[
              { hva: 'Dispersion, 7-jern (m)', april: '14,2', august: '6,8', status: <Status tilstand="ok">Som planlagt</Status> },
              { hva: 'Carry, 7-jern (m)', april: '118,6', august: '124,1', status: <Status tilstand="ok">Som planlagt</Status> },
              { hva: 'Face to Path, 7-jern (°)', april: '+4,1', august: '+1,3', status: <Status tilstand="ok">Som planlagt</Status> },
              { hva: 'Attack Angle, driver (°)', april: '−3,2', august: '−2,9', status: <Status tilstand="varsel">Følges videre</Status> },
              { hva: 'Putting, 2 m (treff av 20)', april: '11', august: '13', status: <Status tilstand="varsel">Neste periode</Status> }
            ]} />

          <h2 style={{ marginTop: 'var(--ak-r-8)', fontSize: 'var(--ak-t-26)' }}>Neste steg</h2>
          <Liste style={{ marginTop: 'var(--ak-r-4)' }} poster={[
            { merke: 'Periode 3', tittel: 'Attack Angle med driver', note: 'Målet er −1,0° eller høyere. Måles i hver økt fram til 15.10.' },
            { merke: 'Ukentlig', tittel: 'Putting innenfor to meter', note: '20 forsøk, samme sted, hver onsdag. Emil registrerer selv.' },
            { merke: 'Trinn 6', tittel: 'Turneringsspill, to runder under 85', note: 'Kravet for neste trinn på AK-stigen.' }
          ]} />

          <Kort tyngde={1} rutenett style={{ marginTop: 'var(--ak-r-7)' }}>
            <span className="ak-etikett">Slik er tallene laget</span>
            <p style={{ marginTop: 'var(--ak-r-3)', fontSize: 'var(--ak-t-15)', color: 'var(--ak-dempet)' }}>
              Hvert tall i rapporten er et snitt av minst ti slag, målt med Trackman i økt, med dato lagret i AK Golf HQ. Tall som er anslag, står merket ESTIMAT. Vi runder aldri oppover.
            </p>
          </Kort>

          <footer style={{ marginTop: 'var(--ak-r-7)', borderTop: '1px solid var(--ak-linje)', paddingTop: 'var(--ak-r-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 'var(--ak-r-5)' }}>
            <div>
              <p style={{ fontSize: 'var(--ak-t-15)' }}>Spørsmål om rapporten? Svar på e-posten den kom med.</p>
              <p className="ak-maalt" style={{ fontSize: 'var(--ak-t-13)', color: 'var(--ak-dempet)', marginTop: 6 }}>Anders Kristiansen · post@akgolf.no · Neste måling 15.10.2026</p>
            </div>
            <Logo rot="../../assets/logo/" hoyde={28} />
          </footer>
        </>
      )}
    </div>
  );
}
Object.assign(window, { Rapport });
