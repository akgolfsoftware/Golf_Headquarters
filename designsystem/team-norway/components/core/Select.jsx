import React from 'react';

export function Select({label,value,onChange,options=[],hint,disabled}){
const [focus,setFocus]=React.useState(false);
return React.createElement('label',{style:{display:'flex',flexDirection:'column',gap:'7px',fontFamily:'var(--font-body)'}},
label?React.createElement('span',{style:{fontSize:'13px',fontWeight:600,color:'var(--ink-700)'}},label):null,
React.createElement('div',{style:{position:'relative'}},
React.createElement('select',{
value,disabled,
onChange:e=>onChange&&onChange(e.target.value),
onFocus:()=>setFocus(true),onBlur:()=>setFocus(false),
style:{
width:'100%',height:'46px',padding:'0 40px 0 14px',
appearance:'none',WebkitAppearance:'none',
background:disabled?'var(--ink-50)':'var(--white)',
border:'1px solid '+(focus?'var(--navy-600)':'var(--border-subtle)'),
borderRadius:'var(--radius-sm)',boxShadow:focus?'var(--focus-ring)':'var(--shadow-sm)',
fontFamily:'var(--font-body)',fontSize:'15px',color:'var(--ink-900)',outline:'none',cursor:disabled?'not-allowed':'pointer',
transition:'border-color var(--duration-fast) var(--ease-out),box-shadow var(--duration-base) var(--ease-out)'
}},
options.map((o,i)=>{const val=typeof o==='string'?o:o.value;const lab=typeof o==='string'?o:o.label;
return React.createElement('option',{key:i,value:val},lab)})
),
React.createElement('span',{style:{position:'absolute',right:'15px',top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:'var(--ink-400)',fontSize:'11px'}},'▼')
),
hint?React.createElement('span',{style:{fontSize:'12px',color:'var(--ink-400)'}},hint):null
);
}