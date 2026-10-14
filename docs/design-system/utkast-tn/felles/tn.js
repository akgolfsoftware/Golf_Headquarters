/* Felles oppførsel for Team Norway-utkastene. Samme mønster som utkast-playerhq/felles/felles.js.
   Bruk: <template id="skjerm"><div class="app" data-aktiv="oversikt">…<main class="innhold">…</main>…</div></template>
   og TNUtkast.start({ etter: function (app, tilstand) {}, tom: {tittel, tekst, knapp}, laster: '…', feil: '…' }).
   data-aktiv: menypunktets id (oversikt, samlinger, turneringer, live-watch, spillere, fellestesting, college, skoler,
   uttak, rangliste, manedsplan, protokoller, referansenivaer, fagapparat, analyse, workbench, gruppeposter, dokumenter,
   lisens, tilgang, inviter). data-skall="tilbake" data-tilbake="Spillere" gir tilbakelinje (undersider på mobil).
   Flere skjermer i én fil: TNUtkast.start({ skjermer: { id: { mal, etter, tom, laster, feil } } }), velger data-skjerm,
   lenker data-gaa. Menyen følger tnHovedmeny() i src/components/team-norway/tn-shell.tsx (trener med admin). */
(function () {
  /* Lukket ikonsett: rette linjer, firkantede ender, ingen sirkler. 20 px. */
  var IKON = {
    oversikt: '<path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z"/>',
    kalender: '<path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/>',
    spillere: '<path d="M6 4h5v5H6zM3 20v-4l3-3h5l3 3v4M15 6h4v4h-4M14 13h4l3 3v4h-4"/>',
    uttak: '<path d="M4 12l5 5L20 6"/>',
    plan: '<path d="M4 4h16v16H4zM8 9h8M8 13h8M8 17h5"/>',
    gruppe: '<path d="M3 5h18v12H8l-5 3z"/>',
    meg: '<path d="M8 3h8v8H8zM4 21v-4l3-3h10l3 3v4"/>',
    mer: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    bjelle: '<path d="M6 17V10a6 6 0 0 1 12 0v7l2 2H4zM10 21h4"/>',
    pil: '<path d="M15 5l-7 7 7 7"/>'
  };
  function ikon(d) { return '<svg class="ikon" viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>'; }
  var MENY = [
    ['Daglig', [['oversikt', 'Oversikt'], ['samlinger', 'Samlinger'], ['turneringer', 'Turneringer og reise'], ['live-watch', 'Live Watch']]],
    ['Spillere', [['spillere', 'Spillerutvikling'], ['fellestesting', 'Fellestesting'], ['college', 'College og USA'], ['skoler', 'Skoleoversikt']]],
    ['Uttak', [['uttak', 'Uttak og kriterier'], ['rangliste', 'Rangliste']]],
    ['Plan og fag', [['manedsplan', 'Månedsplan'], ['workbench', 'Workbench'], ['protokoller', 'Testprotokoller'], ['referansenivaer', 'Referansenivåer'], ['fagapparat', 'Fagapparat'], ['analyse', 'Analyse']]],
    ['Gruppe', [['gruppeposter', 'Gruppeposter'], ['dokumenter', 'Dokumenter']]],
    ['Meg og admin', [['lisens', 'Lisens og økonomi'], ['samtykke', 'Samtykke'], ['tilgang', 'Trenere og tilgang'], ['inviter', 'Inviter spiller']]]
  ];
  var BUNN = [['oversikt', 'Oversikt', 'oversikt', ['oversikt']], ['samlinger', 'Samlinger', 'kalender', ['samlinger']], ['uttak', 'Uttak', 'uttak', ['uttak', 'rangliste']], ['spillere', 'Spillere', 'spillere', ['spillere', 'fellestesting', 'skoler']]];
  var LOGO = 'felles/logo-tn-hvit.png';

  function skall(app) {
    var aktiv = app.dataset.aktiv, main = app.querySelector('.innhold');
    if (!main || app.querySelector('.skall')) return;
    if (app.dataset.skall === 'tilbake') {
      var linje = document.createElement('div');
      linje.className = 'tilbakelinje tilbake-mob';
      linje.innerHTML = '<a class="tilbake" href="#">' + ikon(IKON.pil) + (app.dataset.tilbake || 'Tilbake') + '</a>' + (app.dataset.hoyre || '');
      app.insertBefore(linje, main);
    }
    var topp = document.createElement('div');
    topp.className = 'topplinje';
    topp.innerHTML = '<img class="logo" src="' + LOGO + '" alt="Team Norway Golf" width="50" height="28"><span class="org"><b>Team Norway Golf</b><span>Prestasjon</span></span>' +
      '<button type="button" class="ikonknapp" aria-label="Varsler, 3 nye">' + ikon(IKON.bjelle) + '<b>3</b></button>';
    var meny = '<nav class="meny" aria-label="Hovedmeny"><img class="logo" src="' + LOGO + '" alt="Team Norway Golf" width="79" height="44"><span class="org"><b>Team Norway Golf</b><span>Prestasjon</span></span>';
    MENY.forEach(function (g) {
      meny += '<span class="gruppe">' + g[0] + '</span>';
      g[1].forEach(function (p) { meny += '<a href="#"' + (p[0] === aktiv ? ' class="aktiv" aria-current="page"' : '') + '>' + p[1] + '</a>'; });
    });
    meny += '<div class="bruker"><span class="avatar">IH</span><span><b>Ida Hovland</b><span>Sportssjef</span></span></div></nav>';
    var s = document.createElement('div');
    s.className = 'skall';
    s.innerHTML = meny;
    app.insertBefore(topp, app.firstChild);
    app.insertBefore(s, main);
    s.appendChild(main);
    var bunn = document.createElement('nav');
    bunn.className = 'bunnmeny';
    bunn.setAttribute('aria-label', 'Faner');
    var iBunn = false;
    bunn.innerHTML = BUNN.map(function (b) {
      var a = b[3].indexOf(aktiv) >= 0; if (a) iBunn = true;
      return '<a href="#"' + (a ? ' class="aktiv" aria-current="page"' : '') + '>' + ikon(IKON[b[2]]) + b[1] + '</a>';
    }).join('') + '<a href="#"' + (!iBunn ? ' class="aktiv"' : '') + '>' + ikon(IKON.mer) + 'Mer</a>';
    app.insertBefore(bunn, s.nextSibling);
  }

  function tilstandsflate(app, o, t, tilbake) {
    var main = app.querySelector('.innhold'), behold = main.querySelectorAll(':scope > [data-behold]');
    var blokk = document.createElement('div');
    blokk.className = 'tilstand-blokk';
    if (t === 'laster') {
      blokk.setAttribute('aria-busy', 'true');
      blokk.innerHTML = '<p class="forklar">' + (o.laster || 'Henter …') + '</p><i class="skjelett" style="height:120px"></i><i class="skjelett" style="height:64px"></i><i class="skjelett" style="height:64px"></i>';
    } else if (t === 'feil') {
      blokk.innerHTML = '<div class="kort"><span class="merke feil"><i></i>Feil</span><b class="undertittel">' + (o.feil || 'Kunne ikke hentes') + '</b><p class="forklar">Ingenting er endret. Sjekk nettet og prøv igjen.</p><div class="knapper"><button type="button" class="knapp pri">Prøv igjen</button></div></div>';
      blokk.querySelector('button').addEventListener('click', tilbake);
    } else {
      blokk.innerHTML = '<div class="kort dempet"><b class="undertittel">' + o.tom.tittel + '</b><p class="forklar">' + o.tom.tekst + '</p><div class="knapper"><button type="button" class="knapp pri">' + o.tom.knapp + '</button></div></div>';
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
      b.style.width = '0%';
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        b.style.transition = 'width 600ms cubic-bezier(.23,1,.32,1) ' + (150 + i * 50) + 'ms';
        b.style.width = b.dataset.til;
      }); });
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
    var tilstand = { tilstand: 'data', bredde: 'mob', skjerm: opt.start || (opt.skjermer ? Object.keys(opt.skjermer)[0] : null) };
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
      var app = document.getElementById(o.mal || 'skjerm').content.firstElementChild.cloneNode(true);
      skall(app);
      velgere(app);
      var medData = !tilstand.tilstand || tilstand.tilstand === 'data' || !o.tom;
      if (!medData) tilstandsflate(app, o, tilstand.tilstand, function () {
        tilstand.tilstand = 'data';
        document.querySelectorAll('[data-tilstand]').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.tilstand === 'data' ? 'true' : 'false'); });
        tegn();
      });
      app.addEventListener('click', function (e) { var g = e.target.closest('[data-gaa]'); if (g) { e.preventDefault(); gaa(g.dataset.gaa); } });
      if (o.etter && medData) o.etter(app, tilstand);
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
    window.TNUtkast._gaa = gaa;
    tegn();
  }

  window.TNUtkast = { start: start, anim: anim, redusert: redusert, gaa: function (id) { if (window.TNUtkast._gaa) window.TNUtkast._gaa(id); } };
})();
