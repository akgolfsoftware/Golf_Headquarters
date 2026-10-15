/* Felles oppførsel for AgencyOS-utkastene. Samme bruk som PlayerHQ-grunnmuren (utkast-playerhq/felles/felles.js),
   men med AgencyOS-skall:
   <template id="x"><div class="app" data-fane="cockpit" [data-tilbake="Stall"]><main class="innhold">…</main></div></template>
   data-fane: cockpit | innboks | stall | kalender | workbench | mer. data-tilbake gir en tilbakelenke øverst (undersider).
   AKAgency.start({ skjermer: { id: { mal, etter, tom, laster, feil } }, start: 'id' }).
   Velgere på siden: data-skjerm, data-bredde (mob|pc), data-tilstand (data|tom|laster|feil). Lenker i skjermen: data-gaa="id".
   Hurtigknappen har fem handlinger og kan dras. Under 5 px bevegelse er et trykk. Den holdes 8 px fra kantene. */
(function () {
  var I = {
    cockpit: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    innboks: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
    stall: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    kalender: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    workbench: '<path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/>',
    mer: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    bjelle: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    meny: '<path d="M4 6h16M4 12h16M4 18h16"/>', lukk: '<path d="M18 6L6 18M6 6l12 12"/>', pluss: '<path d="M12 5v14M5 12h14"/>',
    okt: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M12 14v4M10 16h4"/>',
    melding: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    runde: '<path d="M4 22V3l12 4-12 4"/><circle cx="18" cy="19" r="2"/>',
    jarvis: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>',
    booking: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 15l2 2 4-4"/>',
    tilbake: '<path d="M15 6l-6 6 6 6"/>'
  };
  var MENY = [['cockpit', 'Cockpit'], ['innboks', 'Innboks', '7'], ['stall', 'Stall'], ['kalender', 'Kalender'], ['workbench', 'Workbench'], ['mer', 'Mer']];
  var HURTIG = [['okt', 'Ny økt i Workbench'], ['melding', 'Ny melding til spiller'], ['runde', 'Registrer runde'], ['jarvis', 'Spør Jarvis'], ['booking', 'Ny booking']];
  var LOGO = 'bilder/logo-ak-golf-hq.svg';
  function ikon(d) { return '<svg class="ikon" viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>'; }
  function lenker(aktiv) {
    return MENY.map(function (m) {
      return '<a href="#" class="ag-lenke' + (m[0] === aktiv ? ' aktiv" aria-current="page' : '') + '">' + ikon(I[m[0]]) + m[1] + (m[2] ? '<span class="tall">' + m[2] + '</span>' : '') + '</a>';
    }).join('');
  }
  function bjelle(haster) { return '<button type="button" class="ag-ikonknapp" aria-label="Varsler, 3 nye">' + ikon(I.bjelle) + '<b' + (haster ? ' class="haster"' : '') + '>3</b></button>'; }

  function skall(app) {
    var fane = app.dataset.fane, main = app.querySelector('.innhold');
    if (!main || app.querySelector('.ag-skall')) return;
    var haster = app.dataset.haster === 'ja';
    var topp = document.createElement('div');
    topp.className = 'ag-topp';
    topp.innerHTML = '<div class="venstre"><button type="button" class="ag-ikonknapp" aria-label="Meny" aria-expanded="false" data-skuff>' + ikon(I.meny) + '</button><img class="logo" src="' + LOGO + '" alt="AK Golf HQ" width="91" height="20"></div>' + bjelle(haster);
    var skuff = document.createElement('div');
    skuff.className = 'ag-skuff'; skuff.hidden = true;
    skuff.innerHTML = '<nav aria-label="Hovedmeny">' + lenker(fane) + '</nav>';
    var s = document.createElement('div');
    s.className = 'ag-skall';
    s.innerHTML = '<nav class="ag-meny" aria-label="Hovedmeny"><img class="logo" src="' + LOGO + '" alt="AK Golf HQ" width="100" height="22">' + lenker(fane) +
      '<div class="ag-coach"><span class="av">AK</span><span><b>Anders Kristiansen</b><span>Head coach</span></span></div></nav><div class="ag-hoved"><div class="ag-pc-topp">' + bjelle(haster) + '</div></div>';
    app.insertBefore(topp, main); app.insertBefore(skuff, main); app.insertBefore(s, main);
    s.querySelector('.ag-hoved').appendChild(main);
    if (app.dataset.tilbake) {
      var t = document.createElement('a'); t.href = '#'; t.className = 'ag-tilbake'; t.innerHTML = ikon(I.tilbake) + app.dataset.tilbake;
      if (app.dataset.tilbakeGaa) t.dataset.gaa = app.dataset.tilbakeGaa;
      main.insertBefore(t, main.firstChild);
    }
    topp.querySelector('[data-skuff]').addEventListener('click', function (e) {
      var b = e.currentTarget, aapen = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', aapen ? 'false' : 'true'); b.innerHTML = ikon(aapen ? I.meny : I.lukk); skuff.hidden = aapen;
    });
    hurtig(app);
  }

  /* Hurtigknapp: dra med peker, trykk åpner menyen. Menyen åpner oppover og mot den siden det er plass. */
  function hurtig(app) {
    var lag = document.createElement('div'); lag.className = 'ag-hurtig-lag';
    lag.innerHTML = '<button type="button" class="ag-hurtig" aria-label="Hurtighandlinger" aria-expanded="false" aria-haspopup="menu">' + ikon(I.pluss) + '</button>';
    app.appendChild(lag);
    var k = lag.firstChild, dx = 0, dy = 0, start = null, meny = null;
    function lukk() { if (meny) { meny.remove(); meny = null; } k.setAttribute('aria-expanded', 'false'); }
    function aapne() {
      meny = document.createElement('div'); meny.className = 'ag-hurtig-meny'; meny.setAttribute('role', 'menu');
      meny.innerHTML = HURTIG.map(function (h) { return '<button type="button" role="menuitem" data-hurtig="' + h[0] + '">' + ikon(I[h[0]]) + h[1] + '</button>'; }).join('');
      lag.appendChild(meny);
      var r = k.getBoundingClientRect(), a = app.getBoundingClientRect(), venstre = (r.left - a.left) > a.width / 2;
      var bunn = 16 - dy + 64, side = venstre ? (a.right - r.right) : (r.left - a.left);
      meny.style.bottom = bunn + 'px';
      if (venstre) { meny.style.right = Math.max(8, side) + 'px'; } else { meny.style.left = Math.max(8, side) + 'px'; }
      k.setAttribute('aria-expanded', 'true');
      meny.addEventListener('click', function (e) {
        var b = e.target.closest('[data-hurtig]'); if (!b) return; lukk();
        if (window.AKAgency.paaHurtig) window.AKAgency.paaHurtig(app, b.dataset.hurtig, b.textContent);
      });
    }
    k.addEventListener('pointerdown', function (e) { start = { x: e.clientX, y: e.clientY, dx: dx, dy: dy, flyttet: false }; k.setPointerCapture(e.pointerId); });
    k.addEventListener('pointermove', function (e) {
      if (!start) return;
      var mx = e.clientX - start.x, my = e.clientY - start.y;
      if (!start.flyttet && Math.abs(mx) < 5 && Math.abs(my) < 5) return;
      start.flyttet = true; k.classList.add('drar'); lukk();
      var a = app.getBoundingClientRect(), vh = Math.min(window.innerHeight, a.bottom) - Math.max(0, a.top);
      dx = Math.min(0, Math.max(-(a.width - 56 - 24), start.dx + mx));
      dy = Math.min(8, Math.max(-(vh - 56 - 24), start.dy + my));
      k.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    });
    k.addEventListener('pointerup', function () { if (!start) return; var f = start.flyttet; start = null; k.classList.remove('drar'); if (!f) { if (meny) lukk(); else aapne(); } });
    app.addEventListener('click', function (e) { if (meny && !lag.contains(e.target)) lukk(); });
    k.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (meny) lukk(); else aapne(); } if (e.key === 'Escape') lukk(); });
  }

  function tilstandsflate(app, o, t, tilbake) {
    var main = app.querySelector('.innhold'), behold = main.querySelectorAll(':scope > [data-behold], :scope > .ag-tilbake');
    var blokk = document.createElement('div');
    blokk.className = 'tilstand-blokk';
    if (t === 'laster') {
      blokk.setAttribute('aria-busy', 'true');
      blokk.innerHTML = '<p class="forklar">' + (o.laster || 'Henter …') + '</p><i class="skjelett" style="height:120px"></i><i class="skjelett" style="height:72px"></i><i class="skjelett" style="height:72px"></i>';
    } else if (t === 'feil') {
      blokk.innerHTML = '<div class="kort dempet"><b class="undertittel">' + (o.feil || 'Kunne ikke hentes') + '</b><p class="forklar">Ingenting er endret. Sjekk nettet og prøv igjen.</p><div class="knapper"><button type="button" class="knapp pri">Prøv igjen</button></div></div>';
      blokk.querySelector('button').addEventListener('click', tilbake);
    } else {
      blokk.innerHTML = '<div class="kort dempet"><b class="undertittel">' + o.tom.tittel + '</b><p class="forklar">' + o.tom.tekst + '</p>' + (o.tom.knapp ? '<div class="knapper"><button type="button" class="knapp pri">' + o.tom.knapp + '</button></div>' : '') + '</div>';
      var kb = blokk.querySelector('button'); if (kb) kb.addEventListener('click', tilbake);
    }
    main.innerHTML = '';
    behold.forEach(function (b) { main.appendChild(b); });
    main.appendChild(blokk);
  }

  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function anim(app) {
    if (redusert) return;
    app.classList.add('anim');
    app.querySelectorAll('[data-til]').forEach(function (b, i) {
      b.style.width = '0%';
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        b.style.transition = 'width 600ms cubic-bezier(.23,1,.32,1) ' + (200 + i * 40) + 'ms';
        b.style.width = b.dataset.til;
      }); });
    });
    app.querySelectorAll('[data-tell]').forEach(function (t) {
      var mal = parseFloat(t.dataset.tell), des = (t.dataset.tell.split('.')[1] || '').length, t0 = performance.now();
      (function steg(n) {
        var x = Math.min(1, (n - t0) / 900), v = mal * (1 - Math.pow(1 - x, 3));
        t.textContent = v.toFixed(des).replace('.', ',').replace('-', '−');
        if (x < 1) requestAnimationFrame(steg);
      })(t0);
    });
  }
  function velgere(app) {
    app.addEventListener('click', function (e) {
      var b = e.target.closest('.valg button, .faner button, [data-gruppe] > button');
      if (!b) return;
      b.parentNode.querySelectorAll(':scope > button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    });
  }

  function toast(app, tekst, angre) {
    var gml = app.querySelector('.toast'); if (gml) gml.remove();
    var t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status');
    t.innerHTML = '<span></span>'; t.firstChild.textContent = tekst;
    if (angre) { var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Angre'; b.addEventListener('click', function () { t.remove(); angre(); }); t.appendChild(b); }
    app.querySelector('.innhold').appendChild(t);
    setTimeout(function () { t.remove(); }, angre ? 10000 : 3600);
  }
  function vis(app, sel, aapen) {
    var a = app.querySelector(sel); a.hidden = !aapen;
    if (aapen) { var f = a.querySelector('input, textarea, button'); if (f) f.focus({ preventScroll: true }); }
  }

  function start(opt) {
    var tilstand = { tilstand: 'data', bredde: 'mob', skjerm: opt.start || Object.keys(opt.skjermer)[0] };
    var ramme = document.getElementById('ramme'), skaler = null, obs = null;
    function gaa(id) {
      if (!opt.skjermer[id]) return;
      tilstand.skjerm = id;
      document.querySelectorAll('[data-skjerm]').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.skjerm === id ? 'true' : 'false'); });
      tegn();
      if (ramme.getBoundingClientRect().top < 0) ramme.scrollIntoView({ block: 'start' });
    }
    function tegn() {
      var o = opt.skjermer[tilstand.skjerm];
      skaler = null; if (obs) { obs.disconnect(); obs = null; } ramme.className = 'ramme ' + tilstand.bredde; ramme.innerHTML = ''; ramme.style.height = '';
      var app = document.getElementById(o.mal || tilstand.skjerm).content.firstElementChild.cloneNode(true);
      skall(app);
      velgere(app);
      var ikkeData = tilstand.tilstand !== 'data' && o.tom;
      if (ikkeData) tilstandsflate(app, o, tilstand.tilstand, function () { tilstand.tilstand = 'data'; document.querySelectorAll('[data-tilstand]').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.tilstand === 'data' ? 'true' : 'false'); }); tegn(); });
      app.addEventListener('click', function (e) { var g = e.target.closest('[data-gaa]'); if (g) { e.preventDefault(); gaa(g.dataset.gaa); } });
      if (o.etter && !ikkeData) o.etter(app, tilstand);
      if (tilstand.bredde === 'mob') { ramme.appendChild(app); anim(app); return; }
      var s = document.createElement('div');
      s.className = 'skala'; s.appendChild(app); ramme.appendChild(s);
      function pass() { var f = ramme.clientWidth / 1280; s.style.transform = 'scale(' + f + ')'; ramme.style.height = (s.offsetHeight * f) + 'px'; }
      pass(); anim(app); skaler = pass;
      app.querySelectorAll('img').forEach(function (i) { i.addEventListener('load', pass); });
      if (window.ResizeObserver) { obs = new ResizeObserver(pass); obs.observe(app); }
    }
    window.addEventListener('resize', function () { if (skaler) skaler(); });
    document.querySelectorAll('.velger').forEach(function (v) {
      v.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        v.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        if (b.dataset.bredde) tilstand.bredde = b.dataset.bredde;
        if (b.dataset.skjerm) tilstand.skjerm = b.dataset.skjerm;
        if (b.dataset.tilstand) tilstand.tilstand = b.dataset.tilstand;
        tegn();
      });
    });
    window.AKAgency._gaa = gaa;
    tegn();
  }

  window.AKAgency = {
    start: start, toast: toast, vis: vis, ikon: ikon, I: I,
    gaa: function (id) { if (window.AKAgency._gaa) window.AKAgency._gaa(id); },
    /* Standard for hurtighandlingene i utkastene: en kvittering. Skjermene kan overstyre. */
    paaHurtig: function (app, hva, navn) { toast(app, navn.trim() + ' åpnes her.'); }
  };
})();
