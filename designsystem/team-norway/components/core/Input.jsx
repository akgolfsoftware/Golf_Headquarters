import React from 'react';

export function Input({label,value,onChange,placeholder,error,hint,type='text',suffix,disabled}){
const [focus,setFocus]=React.useState(false);
const border=error?'var(--status-red)':focus?'var(--navy-600)':'var(--border-subtle)';
return React.createElement('label',{style:{display:'flex',flexDirection:'column',gap:'7px',fontFamily:'var(--font-body)'}},
label?React.createElement('span',{style:{fontSize:'13px',fontWeight:600,color:'var(--ink-700)'}},label):null,
React.createElement('div',{style:{
display:'flex',alignItems:'center',gap:'8px',
background:disabled?'var(--ink-50)':'var(--white)',
border:'1px solid '+border,borderRadius:'var(--radius-sm)',
padding:'0 14px',height:'46px',
boxShadow:focus?'var(--focus-ring)':'var(--shadow-sm)',
transition:'border-color var(--duration-fast) var(--ease-out),box-shadow var(--duration-base) var(--ease-out)'
}},
React.createElement('input',{
type,value,placeholder,disabled,
onChange:e=>onChange&&onChange(e.target.value),
onFocus:()=>setFocus(true),onBlur:()=>setFocus(false),
style:{flex:1,border:'none',outline:'none',background:'transparent',fontFamily:type==='number'?'var(--font-mono)':'var(--font-body)',fontSize:'15px',color:'var(--ink-900)',minWidth:0}
}),
suffix?React.createElement('span',{style:{fontFamily:'var(--font-mono)',fontSize:'12px',color:'var(--ink-400)'}},suffix):null
),
error?React.createElement('span',{style:{fontSize:'12px',color:'var(--status-red-text)'}},error)
:hint?React.createElement('span',{style:{fontSize:'12px',color:'var(--ink-400)'}},hint):null
);
}