(function(){'use strict';
/* Delt demo-rigg for W4-wireframene: tilstandsbryter, faner, tema, brytere.
   Alt merket data-demo-only fjernes ved integrasjon. */
var knapper = document.querySelectorAll('[data-tilstand]');
function sett(navn){
  document.querySelectorAll('[data-vis]').forEach(function(s){ s.hidden = s.dataset.vis !== navn; });
  knapper.forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.tilstand === navn)); });
  var live = document.getElementById('live'); if (live) live.textContent = 'Tilstand: ' + navn;
}
knapper.forEach(function(b){ b.addEventListener('click', function(){ sett(b.dataset.tilstand); }); });
if (knapper.length) sett(knapper[0].dataset.tilstand);

document.querySelectorAll('[data-faner]').forEach(function(gruppe){
  var faner = gruppe.querySelectorAll('.fane');
  faner.forEach(function(f){
    f.addEventListener('click', function(){
      faner.forEach(function(a){ a.setAttribute('aria-selected', String(a === f)); });
      var mål = f.dataset.fane;
      document.querySelectorAll('[data-fanepanel]').forEach(function(p){
        p.hidden = p.dataset.fanepanel !== mål;
      });
    });
  });
});

var KEY = 'akhq-theme-agencyos', saved = null;
try { saved = localStorage.getItem(KEY); } catch(e){}
if (saved) document.documentElement.dataset.theme = saved;
var tb = document.getElementById('themeBtn');
if (tb) tb.addEventListener('click', function(){
  var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem(KEY, next); } catch(e){}
  this.setAttribute('aria-label', next === 'dark' ? 'Bytt til lys modus' : 'Bytt til mørk modus');
});
document.querySelectorAll('.sw').forEach(function(s){
  s.addEventListener('click', function(){
    this.setAttribute('aria-checked', this.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
  });
});
})();
