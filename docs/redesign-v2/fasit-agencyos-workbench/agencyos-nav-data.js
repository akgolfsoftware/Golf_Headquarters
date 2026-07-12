// FASIT-REFERANSE (ekstrahert fra Claude Design offline-eksport 2026-07-12)
// Original sti: ui_kits/agencyos/agencyos-nav-data.js
// KUN referanse for v2-ombygging — importeres ALDRI av appen.

try { (() => {
/* AK Golf HQ — AgencyOS global nav manifest (plain JS, no JSX).
   Single source of truth for the sidebar (agencyos-shell.jsx) AND the ⌘K
   command palette (command-palette.jsx) — so "alle desktop-flater" always
   agree on what exists. Eksporterer window.AGENCYOSNAV = { NAV, ALL, CADDIE }.

   ═══ HANDOVER-KART (6. jul 2026) — sidemeny-knapp → skjerm-fil, 1:1 ═══
   Hver knapp i sidemenyen laster EKSAKT filen i `file` i modul-iframen.
   `file:null` = shellens egen Cockpit-landing (index.html). Ingen knapp
   deler skjerm, ingen skjerm mangler knapp (⌘K bruker samme manifest):

   Planlegging
     Cockpit            → index.html (shell-landing: KPI, varsler, dagens økter, NM, hurtigvalg)
     Cockpit · Triage   → triage.html (køer: trenger deg nå / venter / klare + dagens fysiske timer)
     Workbench          → workbench.html (planlegger: År → Måned → Uke → Økt, inspektør, diff)
     Kalender           → kalender.html (Agenda/Uke/Måned/Tidslinje m/ DnD + økt-peek)
     Plans              → plans.html (kanban over alle planer i stallen)
     Utviklingsplan     → utviklingsplan.html (teknisk: PYR/Område/Kølle → TrackMan-data → P1.0–P10.0)
     Fysisk program     → fysisk.html (styrke/rotasjon/mobilitet-blokker, live ACWR, CS-kobling — paritet coach/spiller)
     Drill-bibliotek    → drills.html (kategori, nivå-range CS50–CS100, koblinger)
   Oppfølging
     Stall              → stall.html (roster, grupper, spillerprofil m/ faner)
     Stall-tidslinje    → stall-tidslinje.html (sesong per spiller: faser, turneringer, peak)
     Analyse            → analyse.html (SG-trender, sammenligning, benchmarks)
     TrackMan           → trackman.html (økter: dispersion, ballbaner, per-kølle, oppgave-kobling)
     Talent Coach       → talent.html (WAGR, radar, kategori-stige)
     Turneringer        → turneringer.html (kalender, anbefalinger, NM-spor)
   Drift
     Live-økt           → live.html (coachens live-visning m/ drill-status)
     Innboks            → innboks.html (forespørsler/godkjenninger/varsler/meldinger)
     Godkjenninger      → godkjenninger.html (agent-forslag m/ før/etter-diff)
     Økonomi            → okonomi.html (MRR, fakturaer, pakker)
     Organisasjon       → org.html (team, integrasjoner, faktura-oppsett)
     Styring            → styring.html (sync-status, umatchet data, modell, /stats)
   Pinned
     AI-Caddie          → caddie.html (chat, økt-forslag, agent-team)
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  const NAV = [{
    grp: 'Planlegging',
    items: [{
      id: 'cockpit',
      label: 'Cockpit',
      icon: 'layout-dashboard',
      file: null,
      sub: 'Shell-landing (index.html)'
    }, {
      id: 'triage',
      label: 'Cockpit · Triage',
      icon: 'layers',
      file: 'triage.html',
      sub: 'Køer · dagens timer · 100 spillere'
    }, {
      id: 'workbench',
      label: 'Workbench',
      icon: 'calendar',
      file: 'workbench.html',
      sub: 'År · Måned · Uke · Økt'
    }, {
      id: 'kalender',
      label: 'Kalender',
      icon: 'calendar',
      file: 'kalender.html',
      sub: 'Agenda · Uke · drag-to-move · peek'
    }, {
      id: 'plans',
      label: 'Plans',
      icon: 'layout-dashboard',
      file: 'plans.html',
      sub: 'Kanban · alle planer i stallen'
    }, {
      id: 'utviklingsplan',
      label: 'Utviklingsplan',
      icon: 'git-branch',
      file: 'utviklingsplan.html',
      sub: 'PYR/Område/Kølle · TrackMan · P1.0–P10.0'
    }, {
      id: 'fysisk',
      label: 'Fysisk program',
      icon: 'dumbbell',
      file: 'fysisk.html',
      sub: 'Styrke · rotasjon · mobilitet · ACWR · paritet'
    }, {
      id: 'drills',
      label: 'Drill-bibliotek',
      icon: 'layers',
      file: 'drills.html',
      sub: 'Kategori · nivå-range · CS-mål'
    }]
  }, {
    grp: 'Oppfølging',
    items: [{
      id: 'stall',
      label: 'Stall',
      icon: 'users',
      file: 'stall.html',
      sub: 'Roster · grupper · full profil'
    }, {
      id: 'stall-tidslinje',
      label: 'Stall-tidslinje',
      icon: 'calendar',
      file: 'stall-tidslinje.html',
      sub: 'Sesong · faser · turneringer · peak'
    }, {
      id: 'analyse',
      label: 'Analyse',
      icon: 'bar-chart',
      file: 'analyse.html',
      sub: 'SG-trender · sammenligning · benchmarks'
    }, {
      id: 'trackman',
      label: 'TrackMan',
      icon: 'activity',
      file: 'trackman.html',
      sub: 'Økter · dispersion · per-kølle · oppgave-kobling'
    }, {
      id: 'talent',
      label: 'Talent Coach',
      icon: 'target',
      file: 'talent.html',
      sub: 'WAGR · radar · stige'
    }, {
      id: 'turneringer',
      label: 'Turneringer',
      icon: 'trophy',
      file: 'turneringer.html',
      sub: 'Kalender · anbefalinger · NM-spor'
    }]
  }, {
    grp: 'Drift',
    items: [{
      id: 'live',
      label: 'Live-økt',
      icon: 'play',
      file: 'live.html',
      sub: 'Coachens live-visning'
    }, {
      id: 'innboks',
      label: 'Innboks',
      icon: 'mail',
      file: 'innboks.html',
      badge: 2
    }, {
      id: 'godkjenninger',
      label: 'Godkjenninger',
      icon: 'git-branch',
      file: 'godkjenninger.html',
      sub: 'Agent-forslag · før/etter-diff',
      badge: 4
    }, {
      id: 'okonomi',
      label: 'Økonomi',
      icon: 'trending-up',
      file: 'okonomi.html',
      sub: 'MRR · fakturaer · pakker'
    }, {
      id: 'org',
      label: 'Organisasjon',
      icon: 'settings',
      file: 'org.html',
      sub: 'Team · integrasjoner · faktura'
    }, {
      id: 'styring',
      label: 'Styring',
      icon: 'activity',
      file: 'styring.html',
      sub: 'Sync · umatchet · modell · /stats'
    }]
  }];
  const CADDIE = {
    id: 'caddie',
    label: 'AI-Caddie',
    icon: 'sparkles',
    file: 'caddie.html'
  };
  const ALL = NAV.flatMap(g => g.items.map(it => ({
    ...it,
    grp: g.grp
  }))).concat({
    ...CADDIE,
    grp: 'Drift'
  });
  window.AGENCYOSNAV = {
    NAV,
    ALL,
    CADDIE
  };
})();
})(); 