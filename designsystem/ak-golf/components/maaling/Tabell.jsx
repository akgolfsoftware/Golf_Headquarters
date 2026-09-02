import React from 'react';

/* Tabell — målte kolonner (`maalt`) settes i mono og høyrestilles. Med
   `sorterbar` blir kolonnehodene knapper: klikk sorterer, klikk igjen snur.
   Målte kolonner sorteres som tall (norsk desimalkomma og tusenskille
   forstås), de andre som tekst. aria-sort forteller skjermleser retningen.
   Lagt til sortering 02.09.2026. */

const tall = (v) => {
  if (typeof v === 'number') return v;
  const s = String(v ?? '').replace(/\s| /g, '').replace(',', '.').replace(/[^\d.+\-]/g, '');
  const n = parseFloat(s);
  return Number.isNaN(n) ? null : n;
};

export function Tabell({ kolonner = [], rader = [], tekst, tom = 'Ingen rader ennå.', sorterbar = false, standardSortering, style }) {
  const [sort, setSort] = React.useState(standardSortering || null);
  const sorterte = React.useMemo(() => {
    if (!sorterbar || !sort) return rader;
    const k = kolonner.find((c) => c.noekkel === sort.noekkel);
    const r = [...rader];
    r.sort((a, b) => {
      let x = a[sort.noekkel], y = b[sort.noekkel];
      if (k && k.maalt) { x = tall(x); y = tall(y); if (x == null) return 1; if (y == null) return -1; return x - y; }
      return String(x ?? '').localeCompare(String(y ?? ''), 'nb');
    });
    return sort.retning === 'ned' ? r.reverse() : r;
  }, [rader, kolonner, sort, sorterbar]);
  const klikk = (noekkel) => setSort((s) => (s && s.noekkel === noekkel ? { noekkel, retning: s.retning === 'opp' ? 'ned' : 'opp' } : { noekkel, retning: 'opp' }));

  return (
    <div style={{ ...style }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--ak-t-15)' }}>
        {tekst && <caption style={{ textAlign: 'left', paddingBottom: 'var(--ak-r-3)', color: 'var(--ak-dempet)', fontSize: 'var(--ak-t-13)' }}>{tekst}</caption>}
        <thead>
          <tr>
            {kolonner.map((k) => {
              const aktiv = sorterbar && sort && sort.noekkel === k.noekkel;
              return (
                <th key={k.noekkel} scope="col" aria-sort={aktiv ? (sort.retning === 'opp' ? 'ascending' : 'descending') : undefined} style={{
                  textAlign: k.maalt ? 'right' : 'left', padding: '0 var(--ak-r-4) var(--ak-r-3) 0',
                  borderBottom: '1px solid var(--ak-linje-hard)', whiteSpace: 'nowrap'
                }}>
                  {sorterbar ? (
                    <button type="button" onClick={() => klikk(k.noekkel)} className="ak-etikett ak-trykk" style={{
                      border: 0, background: 'transparent', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: 'var(--ak-r-1)',
                      color: aktiv ? 'var(--ak-tekst)' : 'var(--ak-dempet)', '--ak-h-tekst': 'var(--ak-tekst)'
                    }}>
                      {k.tittel}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" style={{ opacity: aktiv ? 1 : 0.35 }}>
                        {aktiv && sort.retning === 'ned' ? <path d="m6 9 6 6 6-6" /> : <path d="m18 15-6-6-6 6" />}
                      </svg>
                    </button>
                  ) : <span className="ak-etikett">{k.tittel}</span>}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorterte.length === 0 && (
            <tr><td colSpan={kolonner.length} style={{ padding: 'var(--ak-r-6) 0', color: 'var(--ak-dempet)', textAlign: 'center' }}>{tom}</td></tr>
          )}
          {sorterte.map((r, i) => (
            <tr key={r.id ?? i}>
              {kolonner.map((k) => (
                <td key={k.noekkel} className={k.maalt ? 'ak-maalt' : undefined} style={{
                  textAlign: k.maalt ? 'right' : 'left', padding: 'var(--ak-r-3) var(--ak-r-4) var(--ak-r-3) 0',
                  borderBottom: '1px solid var(--ak-linje)', color: k.dempet ? 'var(--ak-dempet)' : 'var(--ak-tekst)',
                  fontWeight: k.noekkel === kolonner[0].noekkel ? 'var(--ak-v-500)' : 'var(--ak-v-400)'
                }}>{r[k.noekkel]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
