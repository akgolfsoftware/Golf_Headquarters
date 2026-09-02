import React from 'react';

/* Hint — en kort forklaring som kommer når pekeren eller fokuset står på
   noe. Til et ord, aldri til en setning; til det som tåler å ikke bli lest.
   Innhold som MÅ leses hører hjemme i teksten, ikke i et hint. Barnet får
   aria-describedby, så skjermleser får det samme som pekeren. */

export function Hint({ tekst, plassering = 'over', children, style }) {
  const [vis, setVis] = React.useState(false);
  const id = React.useId();
  React.useEffect(() => {
    if (!vis) return;
    const tast = (e) => e.key === 'Escape' && setVis(false);
    document.addEventListener('keydown', tast);
    return () => document.removeEventListener('keydown', tast);
  }, [vis]);
  const barn = React.Children.only(children);
  const klon = React.cloneElement(barn, {
    'aria-describedby': id,
    onMouseEnter: (e) => { setVis(true); barn.props.onMouseEnter && barn.props.onMouseEnter(e); },
    onMouseLeave: (e) => { setVis(false); barn.props.onMouseLeave && barn.props.onMouseLeave(e); },
    onFocus: (e) => { setVis(true); barn.props.onFocus && barn.props.onFocus(e); },
    onBlur: (e) => { setVis(false); barn.props.onBlur && barn.props.onBlur(e); }
  });
  const over = plassering === 'over';
  return (
    <span style={{ position: 'relative', display: 'inline-block', ...style }}>
      {klon}
      <span role="tooltip" id={id} className={vis ? 'ak-kommer' : undefined} data-ak-fra={over ? undefined : 'bunn'} style={{
        position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        [over ? 'bottom' : 'top']: 'calc(100% + var(--ak-r-2))',
        display: vis ? 'block' : 'none', zIndex: 90, pointerEvents: 'none',
        background: 'var(--ak-tekst)', color: 'var(--ak-grunn)', fontSize: 'var(--ak-t-13)', lineHeight: 1.4,
        padding: 'var(--ak-r-2) var(--ak-r-3)', borderRadius: 'var(--ak-hjorne-sm)', whiteSpace: 'nowrap', maxWidth: 280
      }}>{tekst}</span>
    </span>
  );
}
