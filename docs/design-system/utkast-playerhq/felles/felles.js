/* Felles oppførsel for PlayerHQ-utkastene.
   Bruk: <template id="skjerm"><div class="app" data-fane="plan">…<main class="innhold">…</main>…</div></template>
   og AKUtkast.start({ for: { mob: 'bilder/design-PH-10-390.jpg', pc: 'bilder/design-PH-10-1440.jpg' }, etter: function (app) {} }).
   data-fane: idag | plan | stats | meg gir topplinje, sidemeny og bunnmeny. data-skall="tilbake" gir tilbakelinje i stedet (undersider).
   Velgere på siden: data-versjon (etter|for), data-bredde (mob|pc), data-spill (av|paa), data-tema (lys|natt). */
(function () {
  var IKON = {
    idag: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>',
    plan: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    stats: '<path d="M12 20V10M18 20V4M6 20v-4"/>',
    meg: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'
  };
  var NAVN = { idag: 'I dag', plan: 'Plan', stats: 'Stats', meg: 'Meg' };
  function ikon(d) { return '<svg class="ikon" viewBox="0 0 24 24">' + d + '</svg>'; }
  function lenker(aktiv) {
    return Object.keys(NAVN).map(function (k) {
      return '<a href="#"' + (k === aktiv ? ' class="aktiv" aria-current="page"' : '') + '>' + ikon(IKON[k]) + NAVN[k] + '</a>';
    }).join('');
  }
  var LOGO = 'bilder/logo-ak-golf-hq.svg';

  function skall(app) {
    var fane = app.dataset.fane, main = app.querySelector('.innhold');
    if (!main || app.querySelector('.skall')) return;
    if (app.dataset.skall === 'tilbake') {
      var linje = document.createElement('div');
      linje.className = 'tilbakelinje';
      linje.innerHTML = '<a class="tilbake" href="#">' + ikon('<path d="M15 6l-6 6 6 6"/>') + (app.dataset.tilbake || NAVN[fane] || 'Tilbake') + '</a>' + (app.dataset.hoyre || '');
      app.insertBefore(linje, main);
      return;
    }
    var topp = document.createElement('div');
    topp.className = 'topplinje';
    topp.innerHTML = '<img class="logo" src="' + LOGO + '" alt="AK Golf HQ" width="91" height="20"><span class="bjelle" aria-label="Innboks, 2 nye">' + ikon('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>') + '<b>2</b></span>';
    var s = document.createElement('div');
    s.className = 'skall';
    s.innerHTML = '<nav class="meny" aria-label="Hovedmeny"><img class="logo" src="' + LOGO + '" alt="AK Golf HQ" width="100" height="22">' + lenker(fane) + '</nav>';
    app.insertBefore(topp, main);
    app.insertBefore(s, main);
    s.appendChild(main);
    var bunn = document.createElement('nav');
    bunn.className = 'bunnmeny';
    bunn.setAttribute('aria-label', 'Faner');
    bunn.innerHTML = lenker(fane);
    app.insertBefore(bunn, s.nextSibling);
  }

  var redusert = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Fyll stolper ([data-til]) og tell opp tall ([data-tell], komma som desimaltegn) */
  function anim(app) {
    if (redusert) return;
    app.classList.add('anim');
    app.querySelectorAll('[data-til]').forEach(function (b, i) {
      b.style.width = '0%';
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        b.style.transition = 'width 600ms cubic-bezier(.23,1,.32,1) ' + (200 + i * 60) + 'ms';
        b.style.width = b.dataset.til;
      }); });
    });
    app.querySelectorAll('[data-tell]').forEach(function (t) {
      var mal = parseFloat(t.dataset.tell), des = (t.dataset.tell.split('.')[1] || '').length;
      var fra = t.dataset.fra !== undefined ? parseFloat(t.dataset.fra) : 0, t0 = performance.now();
      (function steg(n) {
        var x = Math.min(1, (n - t0) / 900), v = fra + (mal - fra) * (1 - Math.pow(1 - x, 3));
        t.textContent = v.toFixed(des).replace('.', ',').replace('-', '−');
        if (x < 1) requestAnimationFrame(steg);
      })(t0);
    });
  }

  /* Velgergrupper inne i skjermen: .valg og [data-gruppe] — én trykket om gangen */
  function velgere(app) {
    app.addEventListener('click', function (e) {
      var b = e.target.closest('.valg button, [data-gruppe] > button');
      if (!b) return;
      b.parentNode.querySelectorAll(':scope > button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    });
  }

  function start(opt) {
    opt = opt || {};
    var tilstand = { versjon: 'etter', bredde: 'mob', spill: false, tema: opt.tema || 'lys' };
    var ramme = document.getElementById('ramme'), skaler = null;
    function tegn() {
      skaler = null; ramme.className = 'ramme ' + tilstand.bredde; ramme.innerHTML = ''; ramme.style.height = '';
      if (tilstand.versjon === 'for' && opt.for) {
        var img = document.createElement('img');
        img.className = 'for-bilde';
        img.src = tilstand.bredde === 'mob' ? opt.for.mob : opt.for.pc;
        img.alt = 'Dagens design';
        ramme.appendChild(img);
        return;
      }
      var mal = document.getElementById(opt.mal || 'skjerm');
      var app = mal.content.firstElementChild.cloneNode(true);
      skall(app);
      if (tilstand.spill) app.classList.add('med-spill');
      if (tilstand.tema === 'natt') app.classList.add('natt');
      velgere(app);
      if (opt.etter) opt.etter(app, tilstand);
      if (tilstand.bredde === 'mob') { ramme.appendChild(app); anim(app); return; }
      var s = document.createElement('div');
      s.className = 'skala'; s.appendChild(app); ramme.appendChild(s);
      function pass() { var f = ramme.clientWidth / 1280; s.style.transform = 'scale(' + f + ')'; ramme.style.height = (s.offsetHeight * f) + 'px'; }
      pass(); anim(app); skaler = pass;
      app.querySelectorAll('img').forEach(function (i) { i.addEventListener('load', pass); });
      if (window.ResizeObserver) new ResizeObserver(pass).observe(app);
    }
    window.addEventListener('resize', function () { if (skaler) skaler(); });
    document.querySelectorAll('.velger').forEach(function (v) {
      v.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        v.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        if (b.dataset.versjon) tilstand.versjon = b.dataset.versjon;
        if (b.dataset.bredde) tilstand.bredde = b.dataset.bredde;
        if (b.dataset.spill) tilstand.spill = b.dataset.spill === 'paa';
        if (b.dataset.tema) tilstand.tema = b.dataset.tema;
        tegn();
      });
    });
    tegn();
  }

  window.AKUtkast = { start: start, anim: anim, redusert: redusert };
})();
