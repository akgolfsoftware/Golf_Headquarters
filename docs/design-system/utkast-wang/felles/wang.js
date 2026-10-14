/* Felles oppførsel for WANG-utkastene (trenerflaten i /team-wang).
   Bygd på samme mønster som utkast-playerhq/felles/felles.js.
   Bruk: <template id="skjerm"><div class="app" data-fane="idag"><main class="innhold">…</main></div></template>
   og WANGUtkast.start({ etter: function (app, tilstand) {}, tom: {…}, laster: '…', feil: '…' }).
   data-fane: idag | trening | tester | konkurranse | meldinger | elever | admin.
   data-skall="tilbake" gir tilbakelinje i stedet (undersider), data-tilbake="Elever" setter teksten.
   Velgere på siden: data-bredde (mob|pc), data-rolle (trener|sportssjef), data-tilstand (data|tom|laster|feil), data-skjerm.
   Menyen (beslutninger.md 27.09): seks hovedpunkter, Administrasjon bare for sportssjef.
   Mobil: I dag · Trening · Tester · Elever · Mer. Konkurranse, Meldinger og Administrasjon ligger under Mer. */
(function () {
  var IKON = {
    idag: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>',
    trening: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4"/>',
    tester: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 14l2 2 4-4"/>',
    konkurranse: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.7V17c0 .6-.5 1-1 1.2C7.9 18.8 7 20.2 7 22M14 14.7V17c0 .6.5 1 1 1.2 1.1.6 2 2 2 3.8M18 2H6v7a6 6 0 0 0 12 0V2z"/>',
    meldinger: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    elever: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    admin: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    mer: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    bjelle: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    tilbake: '<path d="M15 6l-6 6 6 6"/>'
  };
  var NAVN = { idag: 'I dag', trening: 'Trening', tester: 'Tester', konkurranse: 'Konkurranse', meldinger: 'Meldinger', elever: 'Elever', admin: 'Administrasjon' };
  var HOVED = ['idag', 'trening', 'tester', 'konkurranse', 'meldinger', 'elever'];
  var BUNN = ['idag', 'trening', 'tester', 'elever'];
  var ULESTE = 3; /* syntetisk: tre uleste meldinger */
  var LOGO = 'bilder/wang-logo-horizontal.svg';
  function ikon(d) { return '<svg class="ikon" viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>'; }
  function lenke(k, aktiv) {
    var t = k === 'meldinger' ? '<span class="teller" aria-label="' + ULESTE + ' uleste">' + ULESTE + '</span>' : '';
    return '<a href="#" data-meny="' + k + '"' + (k === aktiv ? ' class="aktiv" aria-current="page"' : '') + '>' + ikon(IKON[k]) + '<span>' + NAVN[k] + '</span>' + t + '</a>';
  }

  function skall(app, rolle) {
    var fane = app.dataset.fane, main = app.querySelector('.innhold');
    if (!main || app.querySelector('.skall')) return;
    if (app.dataset.skall === 'tilbake') {
      var linje = document.createElement('div');
      linje.className = 'tilbakelinje';
      linje.innerHTML = '<a class="tilbake" href="#">' + ikon(IKON.tilbake) + (app.dataset.tilbake || NAVN[fane] || 'Tilbake') + '</a>' + (app.dataset.hoyre || '');
      app.insertBefore(linje, main);
      return;
    }
    var punkter = HOVED.slice();
    if (rolle === 'sportssjef') punkter.push('admin');
    var rolleNavn = rolle === 'sportssjef' ? 'Sportssjef' : 'Trener';

    var topp = document.createElement('div');
    topp.className = 'topplinje';
    topp.innerHTML = '<img class="logo" src="' + LOGO + '" alt="WANG Toppidrett" width="100" height="34"><div class="topp-hoyre"><span class="rolle">' + rolleNavn + '</span><button type="button" class="bjelle" data-meny="meldinger" aria-label="Meldinger, ' + ULESTE + ' uleste">' + ikon(IKON.bjelle) + '<b>' + ULESTE + '</b></button></div>';

    var s = document.createElement('div');
    s.className = 'skall';
    var meny = '<nav class="meny" aria-label="Hovedmeny"><img class="logo" src="' + LOGO + '" alt="WANG Toppidrett" width="118" height="40"><p class="gruppe">Golf · WANG Fredrikstad</p>';
    meny += HOVED.map(function (k) { return lenke(k, fane); }).join('');
    if (rolle === 'sportssjef') meny += '<p class="etikett del">Sportssjef</p>' + lenke('admin', fane);
    meny += '<div class="bruker"><span class="avatar">' + (rolle === 'sportssjef' ? 'SS' : 'T1') + '</span><div><b>' + (rolle === 'sportssjef' ? 'Sportssjef' : 'Trener 1') + '</b><span>' + rolleNavn + ' · golf</span></div></div></nav>';
    s.innerHTML = meny;
    app.insertBefore(topp, main);
    app.insertBefore(s, main);
    s.appendChild(main);

    var iMer = punkter.filter(function (k) { return BUNN.indexOf(k) < 0; });
    var bunn = document.createElement('nav');
    bunn.className = 'bunnmeny';
    bunn.setAttribute('aria-label', 'Faner');
    bunn.innerHTML = BUNN.map(function (k) {
      return '<a href="#" data-meny="' + k + '"' + (k === fane ? ' class="aktiv" aria-current="page"' : '') + '>' + ikon(IKON[k]) + NAVN[k] + '</a>';
    }).join('') + '<button type="button" data-mer' + (iMer.indexOf(fane) >= 0 ? ' class="aktiv"' : '') + ' aria-haspopup="dialog">' + ikon(IKON.mer) + 'Mer</button>';
    app.insertBefore(bunn, s.nextSibling);

    var ark = document.createElement('div');
    ark.className = 'mer-ark';
    ark.hidden = true;
    ark.innerHTML = '<div class="ark" role="dialog" aria-label="Mer">' + iMer.map(function (k) { return lenke(k, fane); }).join('') + '</div>';
    app.appendChild(ark);
    bunn.querySelector('[data-mer]').addEventListener('click', function () { ark.hidden = false; });
    ark.addEventListener('click', function (e) { if (e.target === ark || e.target.closest('a')) ark.hidden = true; });
  }

  /* Tom, laster og feil: beholder skjermens topp ([data-behold]) og bytter resten. */
  function tilstandsflate(app, o, t, tilbake) {
    var main = app.querySelector('.innhold'), behold = main.querySelectorAll(':scope > [data-behold]');
    var blokk = document.createElement('div');
    blokk.className = 'tilstand-blokk';
    if (t === 'laster') {
      blokk.setAttribute('aria-busy', 'true');
      blokk.innerHTML = '<p class="forklar">' + (o.laster || 'Henter …') + '</p><i class="skjelett" style="height:150px"></i><i class="skjelett" style="height:84px"></i><i class="skjelett" style="height:84px"></i>';
    } else if (t === 'feil') {
      blokk.innerHTML = '<div class="kort"><span class="pille haster" style="justify-self:start"><i></i>Feil</span><b class="undertittel">' + (o.feil || 'Kunne ikke hentes') + '</b><p class="forklar">Ingenting er endret. Sjekk nettet og prøv igjen.</p><div class="knapper"><button type="button" class="knapp pri">Prøv igjen</button></div></div>';
      blokk.querySelector('button').addEventListener('click', tilbake);
    } else {
      blokk.innerHTML = '<div class="kort"><b class="undertittel">' + o.tom.tittel + '</b><p class="forklar">' + o.tom.tekst + '</p><div class="knapper"><button type="button" class="knapp pri">' + o.tom.knapp + '</button></div></div>';
      blokk.querySelector('button').addEventListener('click', tilbake);
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
      var egenskap = b.dataset.akse === 'y' ? 'height' : 'width';
      b.style[egenskap] = '0%';
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        b.style.transition = egenskap + ' 600ms cubic-bezier(.22,1,.36,1) ' + (150 + i * 40) + 'ms';
        b.style[egenskap] = b.dataset.til;
      }); });
    });
    app.querySelectorAll('[data-tell]').forEach(function (t) {
      var mal = parseFloat(t.dataset.tell), des = (t.dataset.tell.split('.')[1] || '').length, t0 = performance.now();
      (function steg(n) {
        var x = Math.min(1, (n - t0) / 900), v = mal * (1 - Math.pow(1 - x, 3));
        t.textContent = v.toFixed(des).replace('.', ',');
        if (x < 1) requestAnimationFrame(steg);
      })(t0);
    });
  }

  function velgere(app) {
    app.addEventListener('click', function (e) {
      var b = e.target.closest('.valg button, [data-gruppe] > button');
      if (!b) return;
      b.parentNode.querySelectorAll(':scope > button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    });
  }

  function start(opt) {
    opt = opt || {};
    var tilstand = { tilstand: 'data', bredde: 'mob', rolle: 'trener', skjerm: opt.start || (opt.skjermer ? Object.keys(opt.skjermer)[0] : null) };
    var ramme = document.getElementById('ramme'), skaler = null, obs = null;
    function valgt() { return opt.skjermer ? opt.skjermer[tilstand.skjerm] : opt; }
    function gaa(id) {
      if (!opt.skjermer || !opt.skjermer[id]) return;
      tilstand.skjerm = id;
      document.querySelectorAll('[data-skjerm]').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.skjerm === id ? 'true' : 'false'); });
      tegn();
      if (ramme.getBoundingClientRect().top < 0) ramme.scrollIntoView({ block: 'start' });
    }
    function tegn() {
      var o = valgt();
      skaler = null; if (obs) { obs.disconnect(); obs = null; }
      ramme.className = 'ramme ' + tilstand.bredde; ramme.innerHTML = ''; ramme.style.height = '';
      var mal = document.getElementById(o.mal || 'skjerm');
      var app = mal.content.firstElementChild.cloneNode(true);
      app.classList.add('rolle-' + tilstand.rolle);
      skall(app, tilstand.rolle);
      velgere(app);
      var vanlig = !tilstand.tilstand || tilstand.tilstand === 'data' || !o.tom;
      if (!vanlig) {
        tilstandsflate(app, o, tilstand.tilstand, function () {
          tilstand.tilstand = 'data';
          document.querySelectorAll('[data-tilstand]').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.tilstand === 'data' ? 'true' : 'false'); });
          tegn();
        });
      }
      app.addEventListener('click', function (e) {
        var g = e.target.closest('[data-gaa]');
        if (g) { e.preventDefault(); gaa(g.dataset.gaa); return; }
        if (e.target.closest('a[href="#"]')) e.preventDefault();
      });
      if (o.etter && vanlig) o.etter(app, tilstand);
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
        if (b.dataset.rolle) tilstand.rolle = b.dataset.rolle;
        if (b.dataset.skjerm) tilstand.skjerm = b.dataset.skjerm;
        if (b.dataset.tilstand) tilstand.tilstand = b.dataset.tilstand;
        tegn();
      });
    });
    window.WANGUtkast._gaa = gaa;
    tegn();
  }

  window.WANGUtkast = { start: start, anim: anim, redusert: redusert, gaa: function (id) { if (window.WANGUtkast._gaa) window.WANGUtkast._gaa(id); } };
})();
