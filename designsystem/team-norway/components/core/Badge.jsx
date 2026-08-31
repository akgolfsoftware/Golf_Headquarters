import React from 'react';

export function Badge({children,tone='neutral',solid=false,dot=false}){
const tones={
neutral:{bg:'var(--ink-100)',fg:'var(--ink-700)',solid:'var(--ink-700)'},
navy:{bg:'var(--navy-100)',fg:'var(--navy-800)',solid:'var(--navy-900)'},
accent:{bg:'var(--red-100)',fg:'var(--red-700)',solid:'var(--red-600)'},
green:{bg:'var(--status-green-bg)',fg:'var(--status-green-text)',solid:'var(--status-green)'},
amber:{bg:'var(--status-amber-bg)',fg:'var(--status-amber-text)',solid:'var(--status-amber)'},
red:{bg:'var(--status-red-bg)',fg:'var(--status-red-text)',solid:'var(--status-red)'},
info:{bg:'var(--status-info-bg)',fg:'var(--status-info-text)',solid:'var(--status-info)'}
};
const t=tones[tone]||tones.neutral;
return React.createElement('span',{style:{
display:'inline-flex',alignItems:'center',gap:'6px',
padding:'5px 11px',borderRadius:'var(--radius-full)',
background:solid?t.solid:t.bg,color:solid?'#fff':t.fg,
fontFamily:'var(--font-body)',fontSize:'12.5px',fontWeight:600,letterSpacing:'-0.005em',whiteSpace:'nowrap'
}},
dot?React.createElement('span',{style:{width:'6px',height:'6px',borderRadius:'50%',background:solid?'#fff':t.solid,flexShrink:0}}):null,
children);
}