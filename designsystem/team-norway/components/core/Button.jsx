import React from 'react';

export function Button({children,variant='primary',size='md',disabled,icon,fullWidth,onClick}){
// Alle tre størrelser tåler berøring: 44px er minste trykkmål.
const sizes={sm:{padding:'10px 16px',fontSize:'var(--text-xs)',height:'44px'},md:{padding:'12px 20px',fontSize:'var(--text-sm)',height:'48px'},lg:{padding:'16px 28px',fontSize:'var(--text-base)',height:'56px'}};
const variants={
primary:{background:'var(--navy-900)',color:'var(--white)',border:'1px solid transparent',boxShadow:'var(--shadow-sm)'},
accent:{background:'var(--red-600)',color:'var(--white)',border:'1px solid transparent',boxShadow:'var(--shadow-sm)'},
secondary:{background:'var(--white)',color:'var(--navy-900)',border:'1px solid var(--border-default)',boxShadow:'var(--shadow-sm)'},
ghost:{background:'transparent',color:'var(--navy-700)',border:'1px solid transparent'},
onDark:{background:'rgba(255,255,255,.1)',color:'var(--white)',border:'1px solid rgba(255,255,255,.24)'}
};
const hoverBg={primary:'var(--navy-700)',accent:'var(--red-700)',secondary:'var(--ink-50)',ghost:'var(--navy-100)',onDark:'rgba(255,255,255,.2)'};
const [hover,setHover]=React.useState(false);
const [press,setPress]=React.useState(false);
const finePointer=React.useRef(typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(hover:hover) and (pointer:fine)').matches);
const reduced=React.useRef(typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches);
const v=variants[variant]||variants.primary;
const active=press&&!disabled;
return React.createElement('button',{
onClick,disabled,
onPointerEnter:()=>finePointer.current&&setHover(true),
onPointerLeave:()=>{setHover(false);setPress(false)},
onPointerDown:()=>setPress(true),
onPointerUp:()=>setPress(false),
onPointerCancel:()=>setPress(false),
style:{
...sizes[size],...v,
background:hover&&!disabled?hoverBg[variant]:v.background,
display:'inline-flex',alignItems:'center',justifyContent:'center',gap:'8px',
width:fullWidth?'100%':'auto',
fontFamily:'var(--font-body)',fontWeight:'var(--weight-semibold)',letterSpacing:'-0.005em',
borderRadius:'var(--radius-full)',cursor:disabled?'not-allowed':'pointer',
opacity:disabled?.45:active&&reduced.current?.75:1,
transform:active&&!reduced.current?'scale(0.97)':'scale(1)',
transition:'transform var(--duration-press) var(--ease-out),background-color var(--duration-fast) var(--ease-hover),opacity var(--duration-fast) var(--ease-hover),box-shadow var(--duration-base) var(--ease-out)'
}},icon,children);
}