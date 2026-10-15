/* Felles oppførsel for de øvrige flatene. Samme bruk som AgencyOS-grunnmuren (utkast-agencyos/felles/agencyos.js):
   <template id="x"><div class="app" data-skall="forelder" data-aktiv="idag" [data-tilbake="Barn"]><main class="innhold">…</main></div></template>
   data-skall: forelder | offentlig | gfgk | konto | epost | system.
   forelder: hamburgermeny på mobil, topplinje med fire mål og «Mer» på PC (vedtak 23.09).
   offentlig: menyen fra markedssidene (Coaching · Junior · Priser · Om oss · Kontakt) og «Book time», bunn med lenker.
   AKFlate.start({ skjermer: { id: { mal, etter, tom, laster, feil } }, start: 'id' }).
   Velgere på siden: data-skjerm, data-bredde (mob|pc), data-tilstand (data|tom|laster|feil). Lenker i skjermen: data-gaa="id". */
(function () {
  var I = {
    idag: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    barn: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    booking: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M9 15l2 2 4-4"/>',
    okonomi: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    samtykke: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    coach: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    innstillinger: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    rapport: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 6-6"/>',
    bjelle: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    meny: '<path d="M4 6h16M4 12h16M4 18h16"/>', lukk: '<path d="M18 6L6 18M6 6l12 12"/>', pluss: '<path d="M12 5v14M5 12h14"/>',
    ned: '<path d="M6 9l6 6 6-6"/>', tilbake: '<path d="M15 6l-6 6 6 6"/>', hoyre: '<path d="M9 6l6 6-6 6"/>',
    ut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    sjekk: '<path d="M20 6L9 17l-5-5"/>', info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    laas: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    sok: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>', kalender: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    klokke: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>', sted: '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    epost: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>', last: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    fil: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    trofe: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    flagg: '<path d="M4 22V3l12 4-12 4"/>', bruker: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    wifi: '<path d="M2 2l20 20M8.5 16.4a5 5 0 0 1 7 0M5 12.9a10 10 0 0 1 5.2-2.8M19 12.9a10 10 0 0 0-2.3-1.6M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8A15 15 0 0 0 10.7 5M12 20h.01"/>',
    verktoy: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
    stjerne: '<path d="M12 2l3 7 7 .6-5.3 4.6L18.2 22 12 18.3 5.8 22l1.5-7.8L2 9.6 9 9z"/>',
    graf: '<path d="M3 3v18h18"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/>'
  };
  var LOGO = 'bilder/logo-ak-golf-hq.svg';
  var SKALL = {
    forelder: { hoved: [['idag', 'I dag'], ['barn', 'Barn'], ['booking', 'Booking'], ['okonomi', 'Økonomi']],
      mer: [['samtykke', 'Samtykke'], ['coach', 'Coach'], ['rapport', 'Ukerapport'], ['innstillinger', 'Innstillinger']] },
    offentlig: { hoved: [['coaching', 'Coaching'], ['junior', 'Junior'], ['priser', 'Priser'], ['om', 'Om oss'], ['kontakt', 'Kontakt']] },
    gfgk: { hoved: [['forside', 'Forside'], ['grupper', 'Grupper'], ['planer', 'Treningsplaner'], ['kalender', 'Kalender'], ['veileder', 'Veileder']] }
  };
  function ikon(d) { return '<svg class="ikon" viewBox="0 0 24 24" aria-hidden="true">' + (I[d] || d) + '</svg>'; }
  function lenke(m, aktiv, medIkon) {
    return '<a href="#" class="fl-lenke' + (m[0] === aktiv ? ' aktiv" aria-current="page' : '') + '" data-meny="' + m[0] + '">' + (medIkon ? ikon(m[0]) : '') + m[1] + '</a>';
  }
  function hamburger() { return '<button type="button" class="fl-ikonknapp" aria-label="Meny" aria-expanded="false" data-skuff>' + ikon('meny') + '</button>'; }

  function skall(app) {
    var type = app.dataset.skall, aktiv = app.dataset.aktiv, main = app.querySelector('.innhold');
    if (!main || app.querySelector('.fl-topp, .fl-konto-topp') || type === 'epost') { tilbakelenke(app, main); return; }
    var topp = document.createElement('div'), skuff = null, s = SKALL[type];
    if (type === 'konto' || type === 'system') {
      topp.className = 'fl-konto-topp';
      topp.innerHTML = '<img class="logo" src="' + LOGO + '" alt="AK Golf HQ" width="91" height="20">' + (app.dataset.toppLenke ? '<a href="#">' + app.dataset.toppLenke + '</a>' : '');
      app.insertBefore(topp, main); tilbakelenke(app, main); return;
    }
    topp.className = 'fl-topp';
    var merke = type === 'gfgk' ? '<span style="display:inline-flex;align-items:center;gap:8px"><img class="logo" src="' + LOGO + '" alt="AK Golf HQ" width="91" height="20"><b style="font:600 15px/1 var(--sans);padding-left:8px;border-left:1px solid var(--sand-300)">GFGK Junior</b></span>' : '<img class="logo" src="' + LOGO + '" alt="AK Golf HQ" width="91" height="20">';
    var pc = '<nav class="fl-pc-meny" aria-label="Hovedmeny">' + s.hoved.map(function (m) { return '<a href="#" data-meny="' + m[0] + '"' + (m[0] === aktiv ? ' class="aktiv" aria-current="page"' : '') + '>' + m[1] + '</a>'; }).join('') +
      (s.mer ? '<div class="fl-mer"><button type="button" aria-expanded="false" data-mer' + (s.mer.some(function (m) { return m[0] === aktiv; }) ? ' style="background:var(--graphite-900);color:var(--white)"' : '') + '>Mer' + ikon('ned') + '</button></div>' : '') + '</nav>';
    var hoyre = '';
    if (type === 'forelder') hoyre = '<button type="button" class="fl-ikonknapp" aria-label="Varsler, 2 nye">' + ikon('bjelle') + '<b>2</b></button><span class="fl-avatar" aria-label="Kari Rohjan">KR</span>';
    else if (type === 'offentlig') hoyre = '<a href="#" class="lenke pc-bare" style="margin-right:8px">Logg inn</a><a href="#" class="knapp pri" style="min-height:40px">Book time</a>';
    topp.innerHTML = '<div class="venstre">' + hamburger() + merke + pc + '</div><div class="hoyre">' + hoyre + '</div>';
    skuff = document.createElement('div'); skuff.className = 'fl-skuff'; skuff.hidden = true;
    var alle = s.hoved.concat(s.mer || []);
    skuff.innerHTML = '<nav aria-label="Hovedmeny">' + alle.map(function (m) { return lenke(m, aktiv, type === 'forelder'); }).join('') +
      (type === 'forelder' ? '<div class="skille"></div><a href="#" class="fl-lenke">' + ikon('ut') + 'Logg ut</a>' : '') +
      (type === 'offentlig' ? '<div class="skille"></div><a href="#" class="fl-lenke">Logg inn</a><a href="#" class="knapp pri stor">Book time</a>' : '') + '</nav>';
    app.insertBefore(topp, main); app.insertBefore(skuff, main);
    topp.querySelector('[data-skuff]').addEventListener('click', function (e) {
      var b = e.currentTarget, aapen = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', aapen ? 'false' : 'true'); b.innerHTML = ikon(aapen ? 'meny' : 'lukk'); skuff.hidden = aapen;
    });
    var mer = topp.querySelector('[data-mer]');
    if (mer) mer.addEventListener('click', function () {
      var boks = mer.parentNode, l = boks.querySelector('.fl-mer-liste');
      if (l) { l.remove(); mer.setAttribute('aria-expanded', 'false'); return; }
      l = document.createElement('div'); l.className = 'fl-mer-liste';
      l.innerHTML = s.mer.map(function (m) { return lenke(m, aktiv, true); }).join('') + '<div class="skille"></div><a href="#" class="fl-lenke">' + ikon('ut') + 'Logg ut</a>';
      boks.appendChild(l); mer.setAttribute('aria-expanded', 'true');
    });
    app.addEventListener('click', function (e) {
      var m = e.target.closest('[data-meny]'); if (!m) return; e.preventDefault();
      var mal = (window.AKFlate.menyMaal || {})[m.dataset.meny]; if (mal) window.AKFlate.gaa(mal);
    });
    if (type === 'offentlig' || type === 'gfgk') bunn(app, type);
    tilbakelenke(app, main);
  }
  function tilbakelenke(app, main) {
    if (!main || !app.dataset.tilbake || main.querySelector(':scope > .fl-tilbake')) return;
    var t = document.createElement('a'); t.href = '#'; t.className = 'fl-tilbake'; t.innerHTML = ikon('tilbake') + app.dataset.tilbake;
    if (app.dataset.tilbakeGaa) t.dataset.gaa = app.dataset.tilbakeGaa;
    main.insertBefore(t, main.firstChild);
  }
  function bunn(app, type) {
    var f = document.createElement('footer'); f.className = 'fl-bunn';
    if (type === 'gfgk') {
      f.innerHTML = '<div class="kol"><b>GFGK Junior</b><p class="forklar" style="max-width:34ch">Juniorarbeidet i Gamle Fredrikstad Golfklubb. Sportslig opplegg ved AK Golf.</p></div>' +
        '<div class="kol"><b>Juniorene</b><a href="#">Grupper</a><a href="#">Treningsplaner</a><a href="#">Kalender</a></div>' +
        '<div class="kol"><b>For foreldre</b><a href="#">Veileder</a><a href="#">Logg inn</a></div>' +
        '<div class="kol"><b>Klubben</b><a href="#">Gamle Fredrikstad Golfklubb</a></div>' +
        '<div class="jur"><a href="#">Personvern</a><a href="#">Informasjonskapsler</a></div>';
    } else {
      f.innerHTML = '<div class="kol"><img class="logo" src="' + LOGO + '" alt="AK Golf HQ" width="146" height="32" style="height:32px"><p class="forklar" style="max-width:34ch;margin-top:8px">AK Golf Academy drives av Anders Kristiansen — golfcoach, sportslig ansvarlig i Gamle Fredrikstad Golfklubb og sportssjef ved WANG Toppidrett Fredrikstad.</p><div class="merkelapper" style="margin-top:8px"><span class="merkelapp">Junior Academy</span><span class="merkelapp">AK Golf HQ</span><span class="merkelapp">Skarpnord</span></div></div>' +
        '<div class="kol"><b>Tilbud</b><a href="#">Coaching</a><a href="#">Junior Academy</a><a href="#">Priser</a><a href="#">Kontakt</a></div>' +
        '<div class="kol"><b>Mer</b><a href="#">AK Golf HQ</a><a href="#">Mulligan Indoor Golf</a><a href="#">Coacher</a><a href="#">Anlegg</a><a href="#">Slik trener vi</a><a href="#">Turneringer</a><a href="#">Blogg</a><a href="#">Spørsmål og svar</a><a href="#">Jobb hos oss</a><a href="#">Logg inn</a></div>' +
        '<div class="kol"><b>Kontakt</b><a href="#">post@akgolf.no</a><span class="forklar">Fredrikstad</span></div>' +
        '<div class="jur"><span>© 2026 AK Golf Group AS</span><a href="#">Vilkår</a><a href="#">Personvern</a><a href="#">Informasjonskapsler</a></div>';
    }
    app.appendChild(f);
  }

  function tilstandsflate(app, o, t, tilbake) {
    var main = app.querySelector('.innhold'), behold = main.querySelectorAll(':scope > [data-behold], :scope > .fl-tilbake');
    var blokk = document.createElement('div');
    blokk.className = 'tilstand-blokk';
    if (t === 'laster') {
      blokk.setAttribute('aria-busy', 'true');
      blokk.innerHTML = '<p class="forklar">' + (o.laster || 'Henter …') + '</p><i class="skjelett" style="height:120px"></i><i class="skjelett" style="height:72px"></i><i class="skjelett" style="height:72px"></i>';
    } else if (t === 'feil') {
      blokk.innerHTML = '<div class="kort dempet"><b class="undertittel">' + (o.feil || 'Kunne ikke hentes') + '</b><p class="forklar">' + (o.feilTekst || 'Ingenting er endret. Sjekk nettet og prøv igjen.') + '</p><div class="knapper"><button type="button" class="knapp pri">Prøv igjen</button></div></div>';
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
    window.AKFlate._gaa = gaa;
    tegn();
  }

  window.AKFlate = {
    start: start, toast: toast, ikon: ikon, I: I, menyMaal: {},
    gaa: function (id) { if (window.AKFlate._gaa) window.AKFlate._gaa(id); }
  };
})();
