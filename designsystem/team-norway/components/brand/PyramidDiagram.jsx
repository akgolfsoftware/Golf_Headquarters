import React from 'react';

// Kanoniske kortformer fra AK Golf HQ (grunnlag-funn.md): FYS/TEK/SLAG/SPILL/TURN.
// Toppen først.
const DEFAULT=[
{name:'TURN',caption:'Turnering — konkurransen'},
{name:'SPILL',caption:'Spill — strategi og valg'},
{name:'SLAG',caption:'Golfslag — slaget som helhet'},
{name:'TEK',caption:'Teknikk — svingbevegelsen'},
{name:'FYS',caption:'Fysikk — grunnmuren'}
];

export function PyramidDiagram({levels=DEFAULT,active,onSelect,width=420,showCaptions=true}){
const n=levels.length;
const h=Math.round(width*0.62);
const gap=4;
const rowH=(h-gap*(n-1))/n;
const ramp=['var(--data-1)','var(--data-2)','var(--data-3)','var(--data-4)','var(--data-5)'];
return React.createElement('div',{style:{display:'flex',gap:'28px',alignItems:'center',fontFamily:'var(--font-body)'}},
React.createElement('svg',{width,height:h,viewBox:'0 0 '+width+' '+h,style:{flexShrink:0,overflow:'visible'}},
levels.map((lv,i)=>{
const y=i*(rowH+gap);
const topW=(i/n)*width;
const botW=((i+1)/n)*width;
const isActive=active===i;
const fill=isActive?'var(--red-600)':ramp[Math.min(i,ramp.length-1)];
const pts=[(width-topW)/2+','+y,(width+topW)/2+','+y,(width+botW)/2+','+(y+rowH),(width-botW)/2+','+(y+rowH)].join(' ');
return React.createElement('polygon',{
key:i,points:pts,fill,
onClick:()=>onSelect&&onSelect(i),
style:{cursor:onSelect?'pointer':'default',transition:'fill var(--duration-base) var(--ease-out),filter var(--duration-base) var(--ease-out)',filter:isActive?'drop-shadow(0 6px 16px rgba(215,2,50,.35))':'none'}
});
})
),
React.createElement('div',{style:{display:'flex',flexDirection:'column',justifyContent:'space-between',height:h+'px',paddingTop:'2px',paddingBottom:'2px'}},
levels.map((lv,i)=>{
const isActive=active===i;
return React.createElement('div',{
key:i,onClick:()=>onSelect&&onSelect(i),
style:{display:'flex',alignItems:'center',gap:'10px',cursor:onSelect?'pointer':'default',flex:1}
},
React.createElement('span',{style:{fontFamily:'var(--font-mono)',fontSize:'10.5px',color:isActive?'var(--red-600)':'var(--ink-300)',width:'18px'}},String(n-i).padStart(2,'0')),
React.createElement('div',{style:{display:'flex',flexDirection:'column'}},
React.createElement('span',{style:{fontFamily:'var(--font-mono)',fontSize:'14px',fontWeight:isActive?700:600,letterSpacing:'.04em',color:isActive?'var(--red-600)':'var(--ink-900)',transition:'color var(--duration-base) var(--ease-out)'}},lv.name),
showCaptions&&lv.caption?React.createElement('span',{style:{fontSize:'12px',color:'var(--ink-400)'}},lv.caption):null
)
)})
)
);
}