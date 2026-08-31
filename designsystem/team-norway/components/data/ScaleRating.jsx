import React from 'react';

export function ScaleRating({value,max=5,onChange,labels,size='md',readOnly=false}){
const [hover,setHover]=React.useState(null);
const [press,setPress]=React.useState(null);
const finePointer=React.useRef(typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(hover:hover) and (pointer:fine)').matches);
const dim=size==='sm'?32:size==='lg'?52:42;
const items=[];
for(let i=1;i<=max;i++){
const active=i<=(hover??value);
const isCur=i===value;
const isPress=press===i;
items.push(React.createElement('button',{
key:i,type:'button',disabled:readOnly,
onClick:()=>!readOnly&&onChange&&onChange(i),
onPointerEnter:()=>!readOnly&&finePointer.current&&setHover(i),
onPointerLeave:()=>{if(!readOnly){setHover(null);setPress(null)}},
onPointerDown:()=>!readOnly&&setPress(i),
onPointerUp:()=>setPress(null),
onPointerCancel:()=>setPress(null),
style:{
width:dim+'px',height:dim+'px',flexShrink:0,
borderRadius:'var(--radius-sm)',
border:'1px solid '+(isCur?'var(--navy-900)':active?'transparent':'var(--border-subtle)'),
background:active?'var(--navy-900)':'var(--white)',
color:active?'#fff':'var(--ink-400)',
fontFamily:'var(--font-mono)',fontSize:size==='sm'?'12px':'14px',fontWeight:600,
boxShadow:isCur?'var(--shadow-md)':'var(--shadow-sm)',
cursor:readOnly?'default':'pointer',
transform:isPress?'scale(0.94)':isCur?'translateY(-2px)':'none',
transition:'transform var(--duration-press) var(--ease-out),background-color var(--duration-fast) var(--ease-hover),border-color var(--duration-fast) var(--ease-hover),color var(--duration-fast) var(--ease-hover),box-shadow var(--duration-base) var(--ease-out)'
}},i));
}
return React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:'8px',fontFamily:'var(--font-body)'}},
React.createElement('div',{style:{display:'flex',gap:'8px'}},items),
labels?React.createElement('div',{style:{display:'flex',justifyContent:'space-between',fontSize:'11.5px',color:'var(--ink-400)'}},
React.createElement('span',null,labels[0]),React.createElement('span',null,labels[1])
):null
);
}