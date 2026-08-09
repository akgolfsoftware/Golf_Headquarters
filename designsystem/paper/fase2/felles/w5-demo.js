(function(){'use strict';
/* Delt demo-rigg for W5-wireframene: tilstandsbryter + tema.
   Alt merket data-demo-only fjernes ved integrasjon. Marketing er primært lys —
   tema-toggle finnes bare på produktflatene (auth/forelder/system). */
var knapper = document.querySelectorAll('[data-tilstand]');
function sett(navn){
  document.querySelectorAll('[data-vis]').forEach(function(s){ s.hidden = s.dataset.vis !== navn; });
  knapper.forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.tilstand === navn)); });
  var live = document.getElementById('live'); if (live) live.textContent = 'Tilstand: ' + navn;
}
knapper.forEach(function(b){ b.addEventListener('click', function(){ sett(b.dataset.tilstand); }); });
if (knapper.length) sett(knapper[0].dataset.tilstand);

/* Tema gjenopprettes KUN på flater som selv oppgir en temanøkkel. Marketing er
   primært lys og har ingen nøkkel — uten denne porten arvet den PlayerHQs
   lagrede mørke tema og rendret hele forsiden på blekk. */
var KEY = document.documentElement.dataset.temanokkel, saved = null;
if (KEY) {
  try { saved = localStorage.getItem(KEY); } catch(e){}
  if (saved) document.documentElement.dataset.theme = saved;
}
var tb = document.getElementById('themeBtn');
if (tb) tb.addEventListener('click', function(){
  var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { if (KEY) localStorage.setItem(KEY, next); } catch(e){}
  this.setAttribute('aria-label', next === 'dark' ? 'Bytt til lys modus' : 'Bytt til mørk modus');
});
})();
