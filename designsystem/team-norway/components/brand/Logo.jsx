import React from 'react';

const SRC='/assets/logo/team-norway-golf.png';

export function Logo({height=40,onDark=false,src,plate='auto'}){
const file=src||SRC;
const img=React.createElement('img',{
src:file,alt:'Team Norway Golf',
style:{height:height+'px',width:'auto',display:'block'}
});
const needsPlate=onDark&&plate!=='never';
if(!needsPlate) return img;
const pad=Math.round(height*0.34);
return React.createElement('div',{style:{
display:'inline-flex',alignItems:'center',justifyContent:'center',
background:'#fff',borderRadius:'var(--radius-md)',
padding:pad+'px '+Math.round(pad*1.2)+'px',
boxShadow:'var(--shadow-sm)'
}},img);
}