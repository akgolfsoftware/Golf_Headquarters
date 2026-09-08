import React from 'react';

const FILE='assets/logo/team-norway-golf.png';

// Merket rendres alltid fra fil. Løses relativt til bundle-scriptet, slik at
// logoen ikke brekker når komponenten brukes fra en undermappe (templates/*).
function resolveSrc(){
try{
const s=document.querySelector('script[src*="_ds_bundle.js"]');
if(s) return new URL(FILE,new URL('./',s.src)).href;
}catch(e){}
return '/'+FILE;
}

export function Logo({height=40,onDark=false,src,plate='auto'}){
const file=src||resolveSrc();
const img=React.createElement('img',{
src:file,alt:'Team Norway Golf',
style:{height:height+'px',width:'auto',display:'block'}
});
const needsPlate=onDark&&plate!=='never';
if(!needsPlate) return img;
const pad=Math.round(height*0.34);
return React.createElement('div',{style:{
display:'inline-flex',alignItems:'center',justifyContent:'center',
background:'var(--white)',borderRadius:'var(--radius-md)',
padding:pad+'px '+Math.round(pad*1.2)+'px',
boxShadow:'var(--shadow-sm)'
}},img);
}
