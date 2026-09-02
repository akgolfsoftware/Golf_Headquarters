import React from 'react';

/* Merkets signatur. Et målt tall som står alene, med dato og kilde båret av en
   målestokk under tallet — ikke av en fotnote under teksten. Målestokken er det
   som gjør at kilden leses: streken sier «dette kommer fra et instrument», og
   linja under den er hva instrumentet var. */

const grader = {
  sm: { tall: 'var(--ak-t-34)', enhet: 'var(--ak-t-17)' },
  md: { tall: 'var(--ak-t-48)', enhet: 'var(--ak-t-21)' },
  lg: { tall: 'var(--ak-t-72)', enhet: 'var(--ak-t-26)' },
  xl: { tall: 'var(--ak-t-112)', enhet: 'var(--ak-t-34)' }
};

export function Talleblokk({
  tall, enhet, etikett, forklaring, kilde, dato, antall, estimat = false,
  storrelse = 'lg', fremhevet = false, maalestokk = true, style
}) {
  const g = grader[storrelse] || grader.lg;
  const kildedeler = [kilde, dato, antall != null ? antall + ' målinger' : null].filter(Boolean);
  return (
    <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ak-r-3)', ...style }}>
      {etikett && <span className="ak-etikett">{etikett}</span>}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--ak-r-2)' }}>
        <span className="ak-maalt" style={{
          fontSize: g.tall, fontWeight: 'var(--ak-v-500)', lineHeight: 0.9,
          letterSpacing: '-0.03em', color: fremhevet ? 'var(--ak-signal)' : 'var(--ak-tekst)'
        }}>{tall}</span>
        {enhet && <span className="ak-maalt" style={{ fontSize: g.enhet, color: 'var(--ak-dempet)', lineHeight: 1 }}>{enhet}</span>}
      </div>
      {maalestokk && <span className="ak-maalestokk" aria-hidden="true" style={{ display: 'block', color: 'var(--ak-tekst)', maxWidth: 240 }} />}
      {forklaring && <p style={{ fontSize: 'var(--ak-t-17)', color: 'var(--ak-tekst)', maxWidth: '46ch' }}>{forklaring}</p>}
      {(kildedeler.length > 0 || estimat) && (
        <figcaption className="ak-maalt" style={{
          fontSize: 'var(--ak-t-13)', color: 'var(--ak-dempet)', display: 'flex', flexWrap: 'wrap',
          gap: '0 var(--ak-r-2)', alignItems: 'center'
        }}>
          {estimat && <span style={{ color: 'var(--ak-varsel)', fontWeight: 'var(--ak-v-500)' }}>ESTIMAT</span>}
          {kildedeler.join(' · ')}
        </figcaption>
      )}
    </figure>
  );
}
