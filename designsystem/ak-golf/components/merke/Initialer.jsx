import React from 'react';

/* Initialer — en person uten bilde. Kvadrat med radius sm (merket er rolig,
   ikke rundt), to bokstaver i display-fonten. Med foto vises fotoet i samme
   form. Fargen er alltid tekst på senket grunn — aldri en variantfarge per
   person: farge er ikke identitet, og en liste med ti farger er støy. */

export function Initialer({ navn, foto, storrelse = 40, style }) {
  const init = (navn || '').trim().split(/\s+/).filter(Boolean).map((d) => d[0]).filter((_, i, a) => i === 0 || i === a.length - 1).join('').toUpperCase();
  const felles = {
    width: storrelse, height: storrelse, borderRadius: 'var(--ak-hjorne-sm)', flex: '0 0 auto',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    background: 'var(--ak-grunn-senk)', color: 'var(--ak-tekst)', ...style
  };
  if (foto) return <img src={foto} alt={navn} width={storrelse} height={storrelse} style={{ ...felles, objectFit: 'cover' }} />;
  return (
    <span role="img" aria-label={navn} style={{
      ...felles, fontFamily: 'var(--ak-display)', fontWeight: 'var(--ak-v-600)',
      fontSize: Math.round(storrelse * 0.42), letterSpacing: '0.02em', lineHeight: 1
    }}>{init || '–'}</span>
  );
}
