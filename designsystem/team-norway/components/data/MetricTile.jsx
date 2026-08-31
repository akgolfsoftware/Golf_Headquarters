import React from 'react';

export function MetricTile({label,value,unit,delta,deltaTone,caption,dark=false}){
const tones={up:'var(--status-green)',down:'var(--status-red)',flat:'var(--ink-400)'};
return React.createElement('div',{style:{
display:'flex',flexDirection:'column',gap:'10px',
background:dark?'var(--surface-dark-card)':'var(--white)',
border:'1px solid '+(dark?'var(--border-dark)':'var(--border-subtle)'),
borderRadius:'var(--radius-lg)',boxShadow:dark?'none':'var(--shadow-sm)',
padding:'22px 24px',fontFamily:'var(--font-body)'
}},
React.createElement('span',{style:{fontFamily:'var(--font-mono)',fontSize:'10.5px',letterSpacing:'.16em',color:dark?'var(--text-on-dark-muted)':'var(--ink-400)'}},String(label).toUpperCase()),
React.createElement('div',{style:{display:'flex',alignItems:'baseline',gap:'8px'}},
React.createElement('span',{style:{fontFamily:'var(--font-display)',fontSize:'40px',fontWeight:800,letterSpacing:'-.035em',lineHeight:1,color:dark?'#fff':'var(--ink-900)'}},value),
unit?React.createElement('span',{style:{fontFamily:'var(--font-mono)',fontSize:'14px',color:dark?'var(--text-on-dark-muted)':'var(--ink-400)'}},unit):null,
delta?React.createElement('span',{style:{fontFamily:'var(--font-mono)',fontSize:'13px',fontWeight:600,color:tones[deltaTone]||tones.flat,marginLeft:'2px'}},delta):null
),
caption?React.createElement('span',{style:{fontSize:'12.5px',color:dark?'var(--text-on-dark-muted)':'var(--ink-500)',lineHeight:1.45}},caption):null
);
}