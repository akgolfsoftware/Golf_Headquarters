import React from 'react';

export function Maalestokk({ retning = 'vannrett', lengde = 200, style, ...rest }) {
  const staaende = retning === 'staaende';
  return (
    <span {...rest} aria-hidden="true" style={{
      display: 'block', color: 'currentColor', opacity: 0.42,
      width: staaende ? 'var(--ak-maal-hel)' : lengde,
      height: staaende ? lengde : 'var(--ak-maal-hel)',
      backgroundImage: 'repeating-linear-gradient(' + (staaende ? '180deg' : '90deg') + ', currentColor 0, currentColor var(--ak-maal-tykk), transparent var(--ak-maal-tykk), transparent var(--ak-maal-steg))',
      backgroundSize: staaende ? 'var(--ak-maal-merke) 100%' : '100% var(--ak-maal-merke)',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: staaende ? '100% 0' : '0 100%',
      ...style
    }} />
  );
}
