import re
import os
HER=os.path.dirname(os.path.abspath(__file__))
UT=os.path.join(HER,'..','stats.html')

# ---------- Snittscore (brutto) ----------
runder=[75,74,76,73,74,75,72,74,73,72,74,71,73,72,73,71,72,72]
snitt=sum(runder)/len(runder); siste5=sum(runder[-5:])/5
W,H,PL,PR,PT,PB=320,150,26,8,10,22
ymin,ymax=69,77
X=lambda i:PL+i*(W-PL-PR)/(len(runder)-1)
Y=lambda v:PT+(v-ymin)/(ymax-ymin)*(H-PT-PB)   # lavere score = høyere opp? nei: lav score skal ligge høyt
Y=lambda v:PT+(v-ymin)/(ymax-ymin)*(H-PT-PB)
# Lavere score er bedre og skal ligge høyere: y øker nedover når score øker -> riktig
pts=' '.join(f'{X(i):.1f},{Y(v):.1f}' for i,v in enumerate(runder))
linje='M'+pts.replace(' ',' L')
flate=linje+f' L{X(len(runder)-1):.1f},{H-PB} L{X(0):.1f},{H-PB} Z'
# 5-runders glidende snitt
gl=[sum(runder[max(0,i-4):i+1])/len(runder[max(0,i-4):i+1]) for i in range(len(runder))]
glpts='M'+' L'.join(f'{X(i):.1f},{Y(v):.1f}' for i,v in enumerate(gl))
bandB=f'<rect x="{PL}" y="{PT}" width="{W-PL-PR}" height="{Y(72)-PT:.1f}" fill="var(--sand-150)"/><line x1="{PL}" x2="{W-PR}" y1="{Y(72):.1f}" y2="{Y(72):.1f}" stroke="var(--graphite-600)" stroke-dasharray="4 3" stroke-width="1"/><text x="{PL+6}" y="{PT+12}" class="gt">Kategori B: under 72</text>'
yt=''.join(f'<text x="{PL-6}" y="{Y(v)+4:.1f}" text-anchor="end" class="gt">{v}</text>' for v in (70,72,74,76))
snittsvg=f'''<svg class="graf" viewBox="0 0 {W} {H}" role="img" aria-label="Brutto score per runde, 18 runder, fra 75 til 72. Snitt 73,1.">{bandB}{yt}
<path class="tegn" d="{linje}" fill="none" stroke="var(--graphite-500)" stroke-width="1.5" stroke-linejoin="round"/>
<path class="tegn" d="{glpts}" fill="none" stroke="var(--graphite-900)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="{X(17):.1f}" cy="{Y(gl[-1]):.1f}" r="4.5" fill="var(--graphite-900)"/>
<text x="{PL}" y="{H-5}" class="gt">Runde 1</text><text x="{W-PR}" y="{H-5}" text-anchor="end" class="gt">Runde 18</text></svg>'''

# ---------- Strokes Gained ----------
sg=[('OTT','Utslag',+0.2,True),('APP','Innspill',-0.9,True),('ARG','Nærspill',-0.4,False),('PUTT','Putting',-0.0,False)]
tot=sum(v for *_,v,_ in sg)
def f(v):
    s=f'{abs(v):.1f}'.replace('.',',')
    return ('+' if v>0 else ('−' if v<0 else ''))+s
maxv=1.2
sgrader=''
for kode,navn,v,sikker in sg:
    bredde=abs(v)/maxv*50
    venstre=50-bredde if v<0 else 50
    sterk=' svakest' if v==min(x[2] for x in sg) else (' sterkest' if v==max(x[2] for x in sg) else '')
    merke='' if sikker else '<span class="forelopig">Foreløpig</span>'
    sgrader+=f'<div class="sgr{sterk}"><span class="sgn"><b>{navn}</b> <small>{kode}</small>{merke}</span><span class="sgbar"><i class="null"></i><span data-til="{bredde:.1f}%" style="left:{venstre:.1f}%;width:{bredde:.1f}%"></span></span><span class="sgv">{f(v)}</span></div>'

# ---------- Trening (4 uker, minutter per akse) ----------
uker=[('Uke 37',{'fys':150,'tek':170,'slag':260,'spill':100,'turn':80}),
      ('Uke 38',{'fys':160,'tek':180,'slag':270,'spill':120,'turn':55}),
      ('Uke 39',{'fys':90,'tek':150,'slag':240,'spill':110,'turn':90}),
      ('Uke 40',{'fys':140,'tek':160,'slag':245,'spill':120,'turn':0})]
totmin=sum(sum(u.values()) for _,u in uker)
plan=52*60+20
def tm(m): 
    t,mm=divmod(m,60); return f'{t} t {mm} min' if mm else f'{t} t'
akser=['fys','tek','slag','spill','turn']
maxu=900
tsvg=[]
BW,BH=300,140
kol=(BW-40)/4
for i,(navn,u) in enumerate(uker):
    x=30+i*kol+kol*0.2; w=kol*0.6; y=BH-20
    for a in akser:
        h=u[a]/maxu*(BH-30)
        if h<=0: continue
        y-=h
        tsvg.append(f'<rect class="vokse" x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="var(--{a})" style="transform-origin:{x+w/2:.1f}px {BH-20}px;animation-delay:{i*80}ms"/>')
    tsvg.append(f'<text x="{x+w/2:.1f}" y="{BH-5}" text-anchor="middle" class="gt">{navn}</text>')
planlinje=plan/4/maxu*(BH-30)
tsvg.append(f'<line x1="26" x2="{BW-4}" y1="{BH-20-planlinje:.1f}" y2="{BH-20-planlinje:.1f}" stroke="var(--graphite-900)" stroke-dasharray="4 3"/><text x="{BW-4}" y="{BH-24-planlinje:.1f}" text-anchor="end" class="gt">Plan {tm(round(plan/4))} per uke</text>')
treningsvg=f'<svg class="graf" viewBox="0 0 {BW} {BH}" role="img" aria-label="Trening per uke, uke 37 til 40, fordelt på akse">{"".join(tsvg)}</svg>'
aksesum={a:sum(u[a] for _,u in uker) for a in akser}
forklaring=''.join(f'<span class="lg"><i style="background:var(--{a})"></i>{a.upper()} {tm(aksesum[a])}</span>' for a in akser)

# ---------- Tester ----------
cs=[104.1,105.0,106.5,106.2,108.4]
cmin,cmax=103,109
spark='M'+' L'.join(f'{4+i*(120-8)/4:.1f},{4+(cmax-v)/(cmax-cmin)*32:.1f}' for i,v in enumerate(cs))
tester=[('Club Speed','108,4 mph','+1,9 siden juli','28. sep.','TrackMan · Kontrollert',True),
        ('Markløft trapbar','140 kg','+10 kg siden juli','21. sep.','Egenført',False),
        ('Lengdehopp','2,48 m','+0,06 m siden juli','21. sep.','Kontrollert',False),
        ('Rotasjonskast','11,2 m','Første måling','21. sep.','Egenført',False)]
testrader=''.join(f'<div class="tr"><div><strong>{n}</strong><small>{d} · {k}</small></div><div class="tr-h"><span class="tv">{v}</span><span class="tt">{t}</span></div></div>' for n,v,t,d,k,_ in tester[1:])

html=f'''<!doctype html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stats – nytt utkast</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="felles/felles.css">
<style>
/* ---------- Stats ---------- */
.s-hode{{display:grid;gap:var(--r4)}}
.sammenlign button,.del{{transition:transform 160ms var(--ut)}}
.sammenlign button:active{{transform:scale(.97)}}
.s-hode img{{display:block;width:100%;height:150px;object-fit:cover;object-position:50% 45%;border-radius:12px}}
.deler{{display:grid;gap:var(--r4)}}
.del{{border:1px solid var(--sand-300);border-radius:12px;background:var(--white);padding:18px;display:grid;gap:var(--r3);align-content:start}}
.del-topp{{display:flex;justify-content:space-between;align-items:center;gap:var(--r3)}}
.del-topp h2{{margin:0;font:600 17px/1.25 var(--sans)}}
.del-topp a{{font:500 14px/1 var(--sans);color:var(--graphite-900);text-underline-offset:3px;display:inline-flex;align-items:center;min-height:44px}}
.sammenlign{{display:inline-flex;flex-wrap:wrap;gap:3px;padding:3px;border-radius:8px;border:1px solid var(--sand-300)}}
.sammenlign button{{min-height:36px;padding:0 12px;border:0;border-radius:6px;background:transparent;font:500 13px/1 var(--sans);color:var(--graphite-800);cursor:pointer}}
.sammenlign button[aria-pressed="true"]{{background:var(--slag);color:#fff}}
.sg-liste{{display:grid;gap:10px}}
.sgr{{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1.4fr) 44px;gap:10px;align-items:center}}
.sgn{{font-size:14px;line-height:1.3;display:flex;flex-wrap:wrap;gap:2px 6px;align-items:center}}
.sgn small{{font:500 11px/1 var(--mono);color:var(--graphite-600)}}
.sgbar{{position:relative;height:14px;border-radius:3px;background:var(--sand-150)}}
.sgbar .null{{position:absolute;left:50%;top:-3px;bottom:-3px;width:2px;background:var(--graphite-600)}}
.sgbar span{{position:absolute;top:0;bottom:0;border-radius:3px;background:var(--slag);opacity:.45}}
.sgr.svakest .sgbar span,.sgr.sterkest .sgbar span{{opacity:1}}
.sgv{{font:600 15px/1 var(--mono);text-align:right}}
.sgr.svakest .sgv{{color:var(--slag-ink)}}
.uthev{{display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:start;padding:12px 14px;border-radius:10px;background:var(--slag);color:#fff;font-size:14px;line-height:1.45}}
.uthev b{{font-weight:600}}
.test-topp{{display:grid;grid-template-columns:1fr auto;gap:var(--r3);align-items:end;padding:14px;border-radius:10px;background:var(--fys-ink);color:#fff}}
.test-topp strong{{display:block;font:600 15px/1.3 var(--sans)}}
.test-topp .stor{{font:600 40px/1 var(--mono);letter-spacing:-.03em;margin-top:6px;display:block}}
.test-topp .stor small{{display:inline;font:500 15px/1 var(--mono);margin-left:4px;opacity:.85;letter-spacing:0}}
.test-topp small{{display:block;font:400 12.5px/1.45 var(--sans);opacity:.9;margin-top:4px}}
.test-topp svg{{width:120px;height:40px}}
.pr{{display:inline-block;height:20px;padding:0 7px;border-radius:4px;background:#fff;color:var(--fys-ink);font:600 11px/20px var(--sans);margin-left:6px;vertical-align:2px}}
.tr{{display:grid;grid-template-columns:1fr auto;gap:var(--r3);align-items:center;padding:10px 0;border-top:1px solid var(--sand-300)}}
.tr strong{{display:block;font:600 14px/1.3 var(--sans)}}
.tr small{{display:block;font:400 12.5px/1.45 var(--sans);color:var(--graphite-600)}}
.tr-h{{display:grid;justify-items:end;gap:2px}}
.tv{{font:600 16px/1 var(--mono)}}
.tt{{font-size:12.5px;color:var(--graphite-800)}}
.datanote{{font-size:13px;line-height:1.5;color:var(--graphite-800);padding:12px 14px;border-radius:10px;border:1px dashed var(--graphite-500)}}
@container (min-width:900px){{
  .s-hode{{grid-template-columns:minmax(0,1fr) 380px;align-items:end;gap:var(--r6)}}
  .s-hode img{{height:180px;grid-row:span 2;grid-column:2;grid-row:1/3}}
  .deler{{grid-template-columns:1fr 1fr;gap:var(--r5)}}
}}
</style>

<div class="ytre">
  <div class="hode">
    <span class="meta-s">PlayerHQ · PH-16 · utkast 1 · 14.10.2026</span>
    <h1>Stats: fire deler, ett tall hver</h1>
    <p>Demodata for Øyvind Rohjan, Kategori C. Bytt mellom utkast og dagens design, og mellom mobil og PC.</p>
  </div>
  <div class="kontroller">
    <div class="velger" role="group" aria-label="Versjon"><button type="button" aria-pressed="true" data-versjon="etter">Utkast</button><button type="button" aria-pressed="false" data-versjon="for">Dagens design</button></div>
    <div class="velger" role="group" aria-label="Bredde"><button type="button" aria-pressed="true" data-bredde="mob">Mobil</button><button type="button" aria-pressed="false" data-bredde="pc">PC</button></div>
  </div>
  <div class="scene"><div class="ramme mob" id="ramme"></div></div>
  <div class="notater">
    <div class="endringer">
      <span class="meta-s">Hva som er nytt</span>
      <ul>
        <li><b>Fire like deler</b> som vedtatt 28.09: Snittscore, Strokes Gained, Trening og Tester. Dagens design viser bare Strokes Gained.</li>
        <li><b>Ett stort tall per del</b>, med trend og én tydelig graf.</li>
        <li><b>Strokes Gained som søyler</b> fra null, så sterkest og svakest område synes med en gang. Svakest område er uthevet og koblet til treningen.</li>
        <li><b>Trening i aksefargene</b>, uke for uke, mot planlinjen.</li>
        <li><b>Golfbilde i toppen</b>, med tittelen ved siden av og ikke oppå.</li>
        <li>Grafene tegnes og søylene vokser når skjermen åpnes. Bevegelsen slås av for brukere som har valgt «reduser bevegelse».</li>
      </ul>
    </div>
    <div class="endringer">
      <span class="meta-s">Reglene som er fulgt</span>
      <ul>
        <li>Bare brutto score. Kategorien settes på brutto snitt: 73,1 gir C, og B er under 72.</li>
        <li>Sammenligning mot neste kategori er standard og merket «Estimat». PGA Tour kan slås på. Ingen sammenligning med andre spillere.</li>
        <li>Nok data: utslag og innspill er sikre fra 12 runder, nærspill og putting fra 24. Under 24 runder står «Foreløpig».</li>
        <li>Alle tall har periode og kilde. Fargene følger aksene: SLAG for Strokes Gained, aksefargene for trening og FYS for fysiske tester.</li>
      </ul>
    </div>
  </div>
</div>

<template id="skjerm">
<div class="app" data-fane="stats">
    <main class="innhold">
      <div class="s-hode">
        <div>
          <div class="dato">Sesong 2026 · Kategori C</div>
          <h1 class="tittel">Stats</h1>
        </div>
        <img src="bilder/stats-topp.jpg" alt="" width="1600" height="1067">
        <div class="valg" role="group" aria-label="Periode"><button type="button" aria-pressed="false">Siste 5 runder</button><button type="button" aria-pressed="false">Siste 20</button><button type="button" aria-pressed="true">Sesong</button></div>
      </div>

      <div class="deler">
        <section class="del" aria-label="Snittscore">
          <div class="del-topp"><h2>Snittscore</h2><a href="#">Alle runder</a></div>
          <div class="hoved"><strong data-tell="{snitt:.1f}" data-fra="{snitt+6:.1f}">{f"{snitt:.1f}".replace(".",",")}</strong><span class="trend opp"><svg class="ikon" viewBox="0 0 24 24"><path d="M7 7l10 10M17 9v8H9"/></svg>1,5 bedre enn 2025</span></div>
          <p class="forklar">Siste 5 runder: <b>{f"{siste5:.1f}".replace(".",",")}</b>. Snitt under 72 gir Kategori B.</p>
          {snittsvg}
          <div class="lg-rad"><span class="lg"><i style="background:var(--graphite-900);height:3px"></i>Snitt siste 5 runder</span><span class="lg"><i style="background:var(--graphite-500);height:2px"></i>Hver runde</span></div>
          <p class="kildetekst">Brutto · 18 tellende runder · 12. april–4. oktober · GolfBox og egne registreringer</p>
        </section>

        <section class="del" aria-label="Strokes Gained">
          <div class="del-topp"><h2>Strokes Gained</h2><a href="#">Per område</a></div>
          <div class="hoved"><strong>{f(tot)}</strong><span class="trend opp"><svg class="ikon" viewBox="0 0 24 24"><path d="M7 17L17 7M9 7h8v8"/></svg>0,4 bedre siden juli</span></div>
          <p class="forklar">Slag per runde mot Kategori B. <span class="estimat">Estimat</span></p>
          <div class="sammenlign" role="group" aria-label="Sammenlign med"><button type="button" aria-pressed="true">Kategori B</button><button type="button" aria-pressed="false">PGA Tour</button></div>
          <div class="sg-liste">{sgrader}</div>
          <div class="uthev"><svg class="ikon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg><span><b>Innspill taper mest:</b> 0,9 slag per runde, mest fra 100–150 m. Dagens økt kl. 15:30 trener dette.</span></div>
          <p class="kildetekst">12 runder slag for slag · 2. juni–4. oktober · nærspill og putting er sikre fra 24 runder</p>
        </section>

        <section class="del" aria-label="Trening">
          <div class="del-topp"><h2>Trening</h2><a href="#">Til Plan</a></div>
          <div class="hoved"><strong>{totmin//60}<small>t {totmin%60} min</small></strong><span class="trend">{round(totmin/plan*100)} % av plan</span></div>
          <p class="forklar">Siste 4 uker, av {tm(plan)} planlagt.</p>
          {treningsvg}
          <div class="lg-rad">{forklaring}</div>
          <p class="kildetekst">Gjennomført tid · uke 37–40 · 7. sep.–4. okt.</p>
        </section>

        <section class="del" aria-label="Tester">
          <div class="del-topp"><h2>Tester</h2><a href="#">Alle tester</a></div>
          <div class="test-topp">
            <div><strong>Club Speed<span class="pr">Personlig rekord</span></strong><span class="stor">108,4<small>mph</small></span><small>+1,9 siden juli · 28. sep. · TrackMan · Kontrollert</small></div>
            <svg viewBox="0 0 120 40" role="img" aria-label="Club Speed siste 5 tester, fra 104,1 til 108,4"><path class="tegn" d="{spark}" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="116" cy="{4+(cmax-108.4)/(cmax-cmin)*32:.1f}" r="3.5" fill="#fff"/></svg>
          </div>
          {testrader}
          <p class="kildetekst">Testbatteri AK Golf · neste fysiske test i uke 43</p>
        </section>
      </div>
    </main>
</div>
</template>

<script src="felles/felles.js"></script>
<script>AKUtkast.start({{for:{{mob:'screenshots/PH-16-390.jpg',pc:'screenshots/PH-16-1440.jpg'}}}});</script>
'''
open(UT,'w',encoding='utf8').write(html)
print(round(snitt,2),round(siste5,2),tot,totmin,plan,round(totmin/plan*100))
