import React from 'react';

export function SectionHeader({eyebrow,title,description,index,action,onDark=false}){
const muted=onDark?'var(--text-on-dark-muted)':'var(--ink-500)';
return React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:'32px',fontFamily:'var(--font-body)',paddingBottom:'20px',borderBottom:'1px solid '+(onDark?'var(--border-dark)':'var(--border-subtle)')}},
React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:'12px',maxWidth:'640px'}},
(eyebrow||index)?React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'12px',fontFamily:'var(--font-mono)',fontSize:'11px',letterSpacing:'.18em',color:onDark?'var(--navy-300)':'var(--ink-400)'}},
index?React.createElement('span',{style:{color:'var(--red-600)'}},'('+index+')'):null,
eyebrow?React.createElement('span',null,String(eyebrow).toUpperCase()):null
):null,
title?React.createElement('h2',{style:{fontFamily:'var(--font-display)',fontSize:'32px',fontWeight:800,letterSpacing:'-.035em',lineHeight:1.08,margin:0,color:onDark?'#fff':'var(--ink-900)'}},title):null,
description?React.createElement('p',{style:{margin:0,fontSize:'15px',lineHeight:1.55,color:muted,textWrap:'pretty'}},description):null
),
action||null
);
}