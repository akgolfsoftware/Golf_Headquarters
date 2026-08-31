import React from 'react';

export function DataTable({columns=[],rows=[],highlightRow,dense=false}){
const pad=dense?'10px 14px':'14px 18px';
return React.createElement('div',{style:{overflow:'hidden',borderRadius:'var(--radius-lg)',border:'1px solid var(--border-subtle)',background:'var(--white)',boxShadow:'var(--shadow-sm)'}},
React.createElement('table',{style:{width:'100%',borderCollapse:'collapse',fontFamily:'var(--font-body)',fontSize:dense?'13px':'14px'}},
React.createElement('thead',null,
React.createElement('tr',null,columns.map((c,i)=>{
const num=c.align==='right';
return React.createElement('th',{key:i,style:{
textAlign:num?'right':'left',padding:pad,
background:'var(--ink-50)',
fontFamily:'var(--font-mono)',fontSize:'10.5px',letterSpacing:'.14em',fontWeight:500,
color:'var(--ink-500)',borderBottom:'1px solid var(--border-subtle)',whiteSpace:'nowrap'
}},String(c.label||c).toUpperCase())}))
),
React.createElement('tbody',null,rows.map((r,ri)=>{
const hl=highlightRow===ri;
return React.createElement('tr',{key:ri,style:{background:hl?'var(--navy-50)':'transparent',boxShadow:hl?'inset 3px 0 0 var(--red-600)':'none'}},
columns.map((c,ci)=>{
const key=c.key||c;const num=c.align==='right';
return React.createElement('td',{key:ci,style:{
padding:pad,textAlign:num?'right':'left',
fontFamily:num?'var(--font-mono)':'var(--font-body)',
fontWeight:hl?600:num?500:400,
color:'var(--ink-900)',
borderBottom:ri===rows.length-1?'none':'1px solid var(--ink-100)'
}},r[key])})
)}))
)
);
}