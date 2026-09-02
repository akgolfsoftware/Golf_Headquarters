import React from 'react';

/* Logoen rendres ALLTID fra fil. Aldri gjenskapt i markup, aldri farget om.
   Filene ligger i assets/logo/ — komponenten peker bare på dem. */

const filer = {
  'primaer-lys': 'ak-golf-logo-primary-on-light.svg',
  'primaer-mork': 'ak-golf-logo-primary-on-dark.svg',
  'hvit-mork': 'ak-golf-logo-white-on-dark.svg',
  'hvit-mono': 'ak-golf-logo-white-mono.svg',
  'sort-mono': 'ak-golf-logo-black-mono.svg',
  'signal-mono': 'ak-golf-logo-primary-mono.svg',
  'kvadrat': 'ak-golf-merke-kvadrat.svg',
  'favicon': 'ak-golf-favicon.svg'
};

export function Logo({ variant = 'primaer-lys', hoyde = 40, klaring = false, rot = '/assets/logo/', style, ...rest }) {
  const fil = filer[variant] || filer['primaer-lys'];
  const h = Math.max(hoyde, 24);
  return (
    <img
      {...rest} src={rot + fil} alt="AK Golf"
      style={{
        height: h, width: 'auto', display: 'block', alignSelf: 'flex-start', flex: '0 0 auto', maxWidth: '100%', objectFit: 'contain',
        padding: klaring ? h / 2 : 0,
        ...style
      }}
    />
  );
}
