import React from 'react';

/* Ferdige låsefiler. Bygg ALDRI en lås for hånd — teksten i filene er
   konvertert til former, så de ikke er avhengige av at Poppins er installert. */

const varianter = {
  academy: 'ak-golf-laas-academy',
  'junior-academy': 'ak-golf-laas-junior-academy',
  hq: 'ak-golf-laas-hq',
  organisasjon: 'ak-golf-laas-organisasjon',
  products: 'ak-golf-laas-products'
};

export function Navnelaas({ variant = 'academy', paaMorkt = false, hoyde = 40, rot = '/assets/logo/', style, ...rest }) {
  const stamme = varianter[variant] || varianter.academy;
  const fil = stamme + (paaMorkt ? '-pa-morkt' : '') + '.svg';
  const navn = { academy: 'AK Golf Academy', 'junior-academy': 'AK Golf Junior Academy', hq: 'AK Golf HQ', organisasjon: 'WANG Toppidrett Fredrikstad — coaching ved AK Golf', products: 'Skarpnord Golf Products' }[variant];
  return <img {...rest} src={rot + fil} alt={navn} style={{ height: Math.max(hoyde, 24), width: 'auto', display: 'block', alignSelf: 'flex-start', flex: '0 0 auto', maxWidth: '100%', objectFit: 'contain', ...style }} />;
}
