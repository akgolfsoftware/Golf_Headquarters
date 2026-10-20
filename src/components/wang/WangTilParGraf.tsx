/**
 * Til par per fullført turnering i år (designløftet 20.10.2026, canvas rad 9). Én serie, søyler fra par,
 * eldst til venstre. Siste turnering i vinrødt; tall står bare på beste og siste, resten ligger i hover og i
 * lista under. Over par går oppover, så lavere søyle er bedre. Brutto, aldri netto.
 */
export type WangTilParPunkt = { id: string; dato: string; navn: string; motPar: number; tekst: string };

const tegn = (n: number) => (n > 0 ? `+${n}` : n === 0 ? "par" : `−${Math.abs(n)}`);

export function WangTilParGraf({ aar, punkter }: { aar: number; punkter: WangTilParPunkt[] }) {
  if (punkter.length === 0) {
    return (
      <section className="wg-kort wg-tilpar" aria-label={`Til par per turnering, ${aar}`}>
        <div className="wg-sek-topp"><h2>Til par per turnering, {aar}</h2></div>
        <p className="wg-forklar">Ingen fullførte turneringer med score i {aar} ennå.</p>
      </section>
    );
  }
  const verdier = punkter.map((p) => p.motPar);
  const maks = Math.max(4, Math.ceil(Math.max(...verdier, 0) / 4) * 4);
  const min = Math.min(0, Math.floor(Math.min(...verdier) / 4) * 4);
  const spenn = maks - min;
  // Posisjon i prosent fra toppen av plottet; HTML i stedet for SVG så teksten ikke krymper på mobil.
  const fraTopp = (v: number) => ((maks - v) / spenn) * 100;
  const linjer: number[] = [];
  for (let v = min; v <= maks; v += 4) linjer.push(v);
  const beste = Math.min(...verdier);
  const sisteIdx = punkter.length - 1;
  const besteIdx = verdier.indexOf(beste);
  const visDato = punkter.length <= 10;

  return (
    <section className="wg-kort wg-tilpar" aria-label={`Til par per turnering, ${aar}`}>
      <div className="wg-sek-topp"><h2>Til par per turnering, {aar}</h2><span className="wg-kilde">Lavere er bedre</span></div>
      <div
        className="wg-tilpar-plott"
        role="img"
        aria-label={`Til par i ${punkter.length} fullførte turneringer i ${aar}. Beste ${tegn(beste)}, siste ${tegn(verdier[sisteIdx])}.`}
      >
        <div className="wg-tilpar-flate">
          {linjer.map((v) => (
            <span key={v} className={v === 0 ? "wg-tilpar-null" : "wg-tilpar-linje"} style={{ top: `${fraTopp(v)}%` }}>
              <em>{tegn(v)}</em>
            </span>
          ))}
          <div className="wg-tilpar-soyler">
            {punkter.map((p, i) => {
              const topp = fraTopp(Math.max(p.motPar, 0));
              const hoyde = Math.max(1, (Math.abs(p.motPar) / spenn) * 100);
              const visTall = i === sisteIdx || i === besteIdx;
              return (
                <span key={p.id} className="wg-tilpar-kol" title={p.tekst}>
                  <i
                    className={i === sisteIdx ? "wg-tilpar-siste" : "wg-tilpar-soyle"}
                    style={{ top: `${topp}%`, height: `${hoyde}%` }}
                  />
                  {visTall ? (
                    <b className="wg-tilpar-tall" style={{ top: `${topp}%` }}>{tegn(p.motPar)}</b>
                  ) : null}
                </span>
              );
            })}
          </div>
        </div>
        {visDato ? (
          <div className="wg-tilpar-datoer" aria-hidden="true">
            {punkter.map((p) => <span key={p.id}>{p.dato.replace(". ", ".")}</span>)}
          </div>
        ) : null}
      </div>
      <p className="wg-kilde wg-tilpar-tegn"><i aria-hidden="true" />Siste turnering. Brutto. Turneringer eleven ikke fullførte er ikke med.</p>
    </section>
  );
}
