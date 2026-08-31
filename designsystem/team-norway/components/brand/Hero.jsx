import React from 'react';

export function Hero({eyebrow,title,description,actions,meta,height=380,align='left'}){
return React.createElement('div',{style:{
position:'relative',minHeight:height+'px',overflow:'hidden',
background:'var(--dark-900)',borderRadius:'var(--radius-xl)',
fontFamily:'var(--font-body)',display:'flex',flexDirection:'column',justifyContent:'center'
}},
React.createElement('div',{style:{position:'absolute',inset:0,background:'linear-gradient(115deg,var(--navy-900) 0%,var(--dark-900) 58%,var(--dark-800) 100%)'}}),
React.createElement('div',{style:{position:'absolute',right:'-8%',top:'-20%',width:'46%',height:'140%',background:'var(--navy-800)',transform:'skewX(-9deg)',opacity:.55}}),
React.createElement('div',{style:{position:'absolute',left:0,right:0,bottom:0,height:'10px',background:'var(--red-600)',clipPath:'polygon(0 100%,100% 0,100% 100%)'}}),
React.createElement('div',{style:{position:'relative',padding:'48px 52px',display:'flex',flexDirection:'column',gap:'20px',maxWidth:'720px',alignItems:align==='center'?'center':'flex-start',textAlign:align}},
eyebrow?React.createElement('div',{style:{display:'flex',alignItems:'center',gap:'12px'}},
React.createElement('div',{style:{width:'28px',height:'2px',background:'var(--red-600)',flexShrink:0}}),
React.createElement('span',{style:{fontFamily:'var(--font-mono)',fontSize:'11px',letterSpacing:'.18em',color:'var(--navy-300)'}},String(eyebrow).toUpperCase())
):null,
title?React.createElement('h1',{style:{fontFamily:'var(--font-display)',fontSize:'clamp(38px,5vw,60px)',fontWeight:800,letterSpacing:'-.04em',lineHeight:1.02,margin:0,color:'#fff'}},title):null,
description?React.createElement('p',{style:{margin:0,fontSize:'16.5px',lineHeight:1.6,color:'#A9C0DA',maxWidth:'520px',textWrap:'pretty'}},description):null,
actions?React.createElement('div',{style:{display:'flex',gap:'12px',marginTop:'8px',flexWrap:'wrap'}},actions):null,
meta?React.createElement('div',{style:{display:'flex',gap:'40px',marginTop:'16px',flexWrap:'wrap'}},
meta.map((m,i)=>React.createElement('div',{key:i,style:{display:'flex',flexDirection:'column',gap:'4px'}},
React.createElement('span',{style:{fontFamily:'var(--font-mono)',fontSize:'10.5px',letterSpacing:'.16em',color:'var(--navy-300)'}},String(m.label).toUpperCase()),
React.createElement('span',{style:{fontFamily:'var(--font-display)',fontSize:'22px',fontWeight:700,letterSpacing:'-.02em',color:'#fff'}},m.value)
))
):null
)
);
}