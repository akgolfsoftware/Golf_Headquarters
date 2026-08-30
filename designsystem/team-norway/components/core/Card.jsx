import React from 'react';

export function Card({children,title,eyebrow,action,elevation='md',accent,padding='28px',dark=false}){
const shadows={flat:'none',sm:'var(--shadow-sm)',md:'var(--shadow-md)',lg:'var(--shadow-lg)'};
return React.createElement('div',{style:{
position:'relative',overflow:'hidden',
background:dark?'var(--surface-dark-card)':'var(--surface-card)',
border:dark?'1px solid var(--border-dark)':'1px solid var(--border-subtle)',
borderRadius:'var(--radius-lg)',
boxShadow:dark?'var(--shadow-dark)':shadows[elevation],
transition:'box-shadow var(--duration-base) var(--ease-out),transform var(--duration-base) var(--ease-out)',
padding,fontFamily:'var(--font-body)',
color:dark?'var(--text-on-dark)':'var(--text-primary)'
}},
accent?React.createElement('div',{style:{position:'absolute',left:0,top:0,bottom:0,width:'4px',background:accent==='red'?'var(--red-600)':'var(--navy-900)'}}):null,
(eyebrow||title||action)?React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'16px',marginBottom:'20px'}},
React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:'8px'}},
eyebrow?React.createElement('span',{style:{fontFamily:'var(--font-mono)',fontSize:'11px',letterSpacing:'.18em',color:dark?'var(--text-on-dark-muted)':'var(--ink-400)'}},eyebrow):null,
title?React.createElement('h3',{style:{fontFamily:'var(--font-display)',fontSize:'21px',fontWeight:700,letterSpacing:'-.02em',margin:0,lineHeight:1.25}},title):null
),
action||null
):null,
children);
}