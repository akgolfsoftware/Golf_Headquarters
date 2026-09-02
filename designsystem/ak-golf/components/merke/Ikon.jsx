import React from 'react';

/* Ikon — merkets ikonsett. 24 ikoner fra Lucide (ISC), satt opp etter merkets
   regler: 24 × 24 viewBox, strek 2, square linecap, miter linejoin — rolig,
   ikke rundt. Strekene ligger inline her så ingen flate trenger å hente en
   fil; de samme 24 ligger som SVG i assets/ikon/ til e-post, trykk og
   verktøy som ikke kjører React.

   Et ikon er aldri eneste bærer av mening. Står det uten tekst ved siden av,
   MÅ `merkelapp` settes — den blir aria-label. Trenger du et ikon som ikke
   finnes her: hent fra Lucide, sett square/miter, legg det til i settet og i
   assets/ikon/. Ikke tegn et eget. */

const IKONER = {
  meny: <><path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/></>,
  lukk: <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
  'pil-ned': <path d="m6 9 6 6 6-6"/>,
  'pil-hoyre': <path d="m9 18 6-6-6-6"/>,
  'pil-venstre': <path d="m15 18-6-6 6-6"/>,
  videre: <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
  ut: <><path d="M7 7h10v10"/><path d="M7 17 17 7"/></>,
  pluss: <><path d="M5 12h14"/><path d="M12 5v14"/></>,
  minus: <path d="M5 12h14"/>,
  hake: <path d="M20 6 9 17l-5-5"/>,
  sok: <><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></>,
  kalender: <><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></>,
  klokke: <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,
  sted: <><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></>,
  epost: <><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/></>,
  telefon: <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/>,
  'last-ned': <><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></>,
  ekstern: <><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>,
  info: <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>,
  advarsel: <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></>,
  kryss: <><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></>,
  maal: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>,
  person: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  dokument: <><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></>
};

export const IKONNAVN = Object.keys(IKONER);

export function Ikon({ navn, storrelse = 20, merkelapp, style, ...rest }) {
  const inner = IKONER[navn];
  if (!inner) return null;
  return (
    <svg {...rest} width={storrelse} height={storrelse} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"
      role={merkelapp ? 'img' : undefined} aria-label={merkelapp || undefined} aria-hidden={merkelapp ? undefined : true}
      style={{ flex: '0 0 auto', display: 'inline-block', verticalAlign: 'middle', ...style }}>
      {inner}
    </svg>
  );
}
