import React from 'react';

export function Radiogruppe({ merkelapp, valg = [], verdi, onEndre, feil, hjelp, navn, style }) {
  const gruppeNavn = navn || React.useId();
  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ak-r-2)', ...style }}>
      {merkelapp && <legend style={{ padding: 0, fontSize: 'var(--ak-t-15)', fontWeight: 'var(--ak-v-500)', marginBottom: 'var(--ak-r-1)' }}>{merkelapp}</legend>}
      {valg.map((v) => {
        const valgt = verdi === v.verdi;
        return (
          <label key={v.verdi} style={{
            display: 'flex', gap: 'var(--ak-r-3)', alignItems: 'flex-start', cursor: 'pointer',
            minHeight: 'var(--ak-treff)', paddingTop: 8
          }}>
            <span style={{
              flex: '0 0 auto', width: 22, height: 22, borderRadius: '50%', marginTop: 1,
              border: '1px solid ' + (valgt ? 'var(--ak-tekst)' : 'var(--ak-linje-hard)'),
              background: 'var(--ak-ark)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {valgt && <span style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--ak-tekst)' }} />}
            </span>
            <input type="radio" name={gruppeNavn} checked={valgt} onChange={() => onEndre && onEndre(v.verdi)}
              style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} />
            <span>
              <span style={{ display: 'block', fontSize: 'var(--ak-t-17)' }}>{v.tekst}</span>
              {v.note && <span style={{ display: 'block', fontSize: 'var(--ak-t-13)', color: 'var(--ak-dempet)' }}>{v.note}</span>}
            </span>
          </label>
        );
      })}
      {(feil || hjelp) && <span style={{ fontSize: 'var(--ak-t-13)', color: feil ? 'var(--ak-feil)' : 'var(--ak-dempet)' }}>{feil || hjelp}</span>}
    </fieldset>
  );
}
