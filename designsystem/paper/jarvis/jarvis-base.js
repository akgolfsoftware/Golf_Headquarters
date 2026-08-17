/* ═══ Jarvis · /meg — delt oppførsel. Tema, artefakt, composer, ⌘K. ═══ */
(function(){
  var d=document, b=d.body;
  /* Tema — egen nøkkel for den personlige flaten */
  var KEY='akhq-theme-meg', root=d.documentElement;
  try{ var t=localStorage.getItem(KEY); if(t) root.setAttribute('data-theme',t); }catch(e){}
  var tt=d.getElementById('themeToggle');
  if(tt) tt.addEventListener('click',function(){
    var n=root.getAttribute('data-theme')==='dark'?'light':'dark';
    root.setAttribute('data-theme',n); try{localStorage.setItem(KEY,n);}catch(e){}
  });
  /* Artefakt: åpne/lukk med fokusretur (fokuskontrakt pkt 2+5) */
  var art=d.getElementById('artifactPanel'), qind=d.getElementById('qind'), scrim=d.getElementById('artScrim'), sist=null;
  function openArt(fra){ if(!art) return; sist=fra||qind; art.hidden=false; b.classList.add('art-open'); if(qind) qind.setAttribute('aria-expanded','true'); var f=art.querySelector('button,[tabindex="-1"],a,input,textarea'); (f||art).focus(); }
  function closeArt(){ if(!art) return; b.classList.remove('art-open'); if(qind) qind.setAttribute('aria-expanded','false'); art.hidden=true; if(sist&&d.contains(sist)) sist.focus(); else { var p=d.querySelector('[data-od-id="panel-composer"] textarea'); if(p) p.focus(); } }
  window.JARVIS={openArt:openArt,closeArt:closeArt};
  if(qind&&art) qind.addEventListener('click',function(){ b.classList.contains('art-open')?closeArt():openArt(qind); });
  d.querySelectorAll('[data-open-art]').forEach(function(el){ el.addEventListener('click',function(){openArt(el);}); });
  var ac=d.getElementById('artClose'); if(ac) ac.addEventListener('click',closeArt);
  if(scrim) scrim.addEventListener('click',closeArt);
  /* Composer */
  var ta=d.querySelector('.box textarea');
  if(ta){
    ta.addEventListener('input',function(){ ta.style.height='auto'; ta.style.height=Math.min(ta.scrollHeight,120)+'px'; });
    var send=d.getElementById('send');
    function sendMsg(){
      var v=ta.value.trim(); if(!v) return;
      var turns=d.getElementById('turns'); if(!turns) return;
      var el=d.createElement('article'); el.className='turn';
      el.innerHTML='<div class="you"><div class="av">AK</div><div class="msg"></div></div><div class="ai"><ul class="steps"><li><svg viewBox="0 0 24 24"><path d="M4 12l5 5 11-11"></path></svg>Notert<span class="t">nå</span></li></ul><p class="say">Mottatt — jeg tar det derfra og melder tilbake her.</p></div>';
      el.querySelector('.msg').textContent=v;
      turns.appendChild(el);
      ta.value=''; ta.style.height='auto';
      var th=d.getElementById('thread'); if(th) th.scrollTop=th.scrollHeight;
    }
    if(send) send.addEventListener('click',sendMsg);
    ta.addEventListener('keydown',function(e){ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendMsg(); } });
  }
  /* Mikrofon — ett trykk rett i opptak */
  var mic=d.getElementById('mic');
  if(mic) mic.addEventListener('click',function(){
    var on=mic.getAttribute('aria-pressed')==='true';
    mic.setAttribute('aria-pressed',String(!on)); b.classList.toggle('rec',!on);
    if(on&&ta){ ta.value='Hva sa Henrik om TrackMan-økten?'; ta.dispatchEvent(new Event('input')); ta.focus(); }
  });
  /* Demo-brytere: grupper på data-demo, sider lytter på 'jarvis:demo' */
  d.querySelectorAll('.state-switch').forEach(function(gr){
    gr.querySelectorAll('[data-demo]').forEach(function(ch){
      ch.addEventListener('click',function(){
        gr.querySelectorAll('[data-demo]').forEach(function(x){x.setAttribute('aria-pressed','false');});
        ch.setAttribute('aria-pressed','true');
        d.dispatchEvent(new CustomEvent('jarvis:demo',{detail:ch.dataset.demo}));
      });
    });
  });
  /* ⌘K-palett — fangst-verbene i nivå 1 (agent-flate) */
  var CMDS=[
    {t:'Fang en oppgave',u:'meg-fangst.html?type=oppgave',l:'1'},
    {t:'Fang en avtale',u:'meg-fangst.html?type=avtale',l:'1'},
    {t:'Fang et notat',u:'meg-fangst.html?type=notat',l:'1'},
    {t:'Husk til i morgen',u:'meg-fangst.html?type=husk',l:'1'},
    {t:'Åpne saker',u:'meg-saker.html',l:'1'},
    {t:'Dagen — tidslinje',u:'meg-dagen.html',l:'1'},
    {t:'Morgenbriefen',u:'meg-morgenbrief.html',l:'2'},
    {t:'Kveldsjournalen',u:'meg-kveldsjournal.html',l:'2'},
    {t:'Kalender-vakten',u:'meg-kalendervakt.html',l:'2'},
    {t:'Ukesreview',u:'meg-ukesreview.html',l:'2'},
    {t:'Historikken — revisjonslogg',u:'meg-historikk.html',l:'3'},
    {t:'Maskinrommet',u:'meg-maskinrom.html',l:'3'},
    {t:'Innstillinger',u:'meg-innstillinger.html',l:'3'},
    {t:'Til hjem (/meg)',u:'meg-hjem.html',l:'1'}
  ];
  var palOpenBtn=d.getElementById('palBtn'), palWrap=null, palTrigger=null;
  function buildPal(){
    palWrap=d.createElement('div'); palWrap.className='palwrap'; palWrap.hidden=true;
    palWrap.innerHTML='<div class="pal" role="dialog" aria-modal="true" aria-label="Kommandoer" data-od-id="panel-palett"><div class="pf"><svg class="ic" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.3-4.3"></path></svg><input id="palInput" placeholder="Hva vil du gjøre?" aria-label="Søk i kommandoer"></div><div class="plist" id="palList" role="listbox"></div><div class="pfoot"><span>↑↓ velg</span><span>⏎ åpne</span><span>esc lukk</span></div></div>';
    d.body.appendChild(palWrap);
    var list=palWrap.querySelector('#palList'), inp=palWrap.querySelector('#palInput'), idx=0, vis=[];
    function render(q){
      q=(q||'').toLowerCase(); list.innerHTML=''; vis=[];
      CMDS.forEach(function(c){
        if(q&&c.t.toLowerCase().indexOf(q)<0) return;
        var btn=d.createElement('button'); btn.className='pitem'; btn.setAttribute('role','option');
        btn.innerHTML='<span></span><span class="lvl"></span>';
        btn.firstChild.textContent=c.t; btn.lastChild.textContent='nivå '+c.l;
        btn.addEventListener('click',function(){ location.href=c.u; });
        list.appendChild(btn); vis.push(btn);
      });
      idx=0; mark();
    }
    function mark(){ vis.forEach(function(el,i){ el.setAttribute('aria-selected',String(i===idx)); }); }
    inp.addEventListener('input',function(){ render(inp.value); });
    inp.addEventListener('keydown',function(e){
      if(e.key==='ArrowDown'){ e.preventDefault(); idx=Math.min(idx+1,vis.length-1); mark(); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); idx=Math.max(idx-1,0); mark(); }
      else if(e.key==='Enter'&&vis[idx]){ vis[idx].click(); }
    });
    palWrap.addEventListener('click',function(e){ if(e.target===palWrap) closePal(); });
    render('');
  }
  function openPal(fra){ if(!palWrap) buildPal(); palTrigger=fra||palOpenBtn; palWrap.hidden=false; if(palOpenBtn) palOpenBtn.setAttribute('aria-expanded','true'); var inp=palWrap.querySelector('#palInput'); inp.value=''; inp.dispatchEvent(new Event('input')); inp.focus(); }
  function closePal(){ if(!palWrap||palWrap.hidden) return; palWrap.hidden=true; if(palOpenBtn) palOpenBtn.setAttribute('aria-expanded','false'); if(palTrigger&&d.contains(palTrigger)) palTrigger.focus(); }
  if(palOpenBtn) palOpenBtn.addEventListener('click',function(){ openPal(palOpenBtn); });
  d.addEventListener('keydown',function(e){
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){ e.preventDefault(); (palWrap&&!palWrap.hidden)?closePal():openPal(d.activeElement); }
    else if(e.key==='Escape'){
      if(palWrap&&!palWrap.hidden) closePal();
      else if(b.classList.contains('art-open')) closeArt();
    }
  });
})();
