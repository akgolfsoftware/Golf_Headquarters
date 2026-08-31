import React from 'react';

export function StatBar({label,value,max=100,unit='',tone='navy',target,compact=false}){
const pct=Math.max(0,Math.min(100,(value/max)*100));
const tones={navy:'var(--navy-900)',accent:'var(--red-600)',green:'var(--status-green)',amber:'var(--status-amber)',red:'var(--status-red)'};
return React.createElement('div',{style:{display:'flex',flexDirection:'column',gap:'8px',fontFamily:'var(--font-body)'}},
React.createElement('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'baseline',gap:'12px'}},
React.createElement('span',{style:{fontSize:'13.5px',fontWeight:500,color:'var(--ink-700)'}},label),
React.createElement('span',{style:{fontFamily:'var(--font-mono)',fontSize:compact?'13px':'15px',fontWeight:600,color:'var(--ink-900)'}},value,unit)
),
React.createElement('div',{style:{position:'relative',height:compact?'8px':'12px',background:'var(--ink-100)',borderRadius:'var(--radius-full)',overflow:'hidden'}},
React.createElement('div',{style:{width:pct+'%',height:'100%',background:tones[tone]||tones.navy,borderRadius:'var(--radius-full)',transition:'width var(--duration-slow) var(--ease-out)'}}),
target!=null?React.createElement('div',{style:{position:'absolute',left:Math.min(100,(target/max)*100)+'%',top:'-3px',bottom:'-3px',width:'2px',background:'var(--ink-900)',borderRadius:'1px'}}):null
)
);
}