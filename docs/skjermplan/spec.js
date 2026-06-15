// Spec-modell for AK Golf HQ — utleder hver skjerms komplette spesifikasjon:
// tilstander, modaler/paneler, detaljsider og handlinger.
// Standard sett pr. skjermtype (kind) + bespoke tillegg pr. nøkkelskjerm.
// Mønster lånt fra Fredrikstad Total, tilpasset golf-coaching-domenet.
window.SPEC = (function () {
  // ── standard tilstander pr. skjermtype ──
  const STATES = {
    list:      ["Standard", "Laster", "Tom liste", "Ingen treff", "Feil ved lasting", "Massehandling"],
    detail:    ["Standard", "Laster", "Redigeringsmodus", "Ulagrede endringer", "Ikke funnet (404)", "Slette-bekreftelse"],
    dashboard: ["Standard", "Laster", "Ingen data ennå", "Feil ved henting", "Filtrert utvalg"],
    board:     ["Standard", "Laster", "Tom kolonne", "Drar kort", "Filtrert"],
    calendar:  ["Standard", "Laster", "Tom dag", "Konflikt/overlapp", "Filtrert"],
    form:      ["Tom", "Validering feilet", "Sender", "Suksess", "Server-feil"],
    auth:      ["Tom", "Sender", "Feil / avvist", "Konto låst", "Suksess → videre"],
    marketing: ["Standard", "Innlogget variant", "Mobil", "A/B-variant"],
    workbench: ["Standard", "Laster plan", "Tom (ingen plan)", "Drar økt", "Ulagrede endringer", "Coach-endring synket"],
    live:      ["Brief", "Aktiv økt", "Pause", "Logger slag/reps", "Oppsummering", "Avbrutt"],
    analyse:   ["Standard", "Laster data", "Ingen data ennå", "Filtrert (periode/kategori)", "Sammenligning"],
    test:      ["Klar til start", "Pågår (scorekort)", "Mangler resultat", "Fullført", "Avbrutt"],
    page:      ["Standard", "Laster", "Tom", "Feil"],
  };
  // ── standard modaler/paneler pr. skjermtype ──
  const MODALS = {
    list:      ["Filterpanel", "Kolonnevelger", "Detalj-skuff", "Eksport"],
    detail:    ["Rediger-skjema", "Bekreft sletting", "Del / tilgang"],
    dashboard: ["Periodevelger", "Spiller-/gruppevelger", "Widget-innstillinger"],
    board:     ["Kort-detalj", "Nytt kort", "Flytt / arkiver"],
    calendar:  ["Hendelse-detalj", "Ny hendelse", "Konflikt-varsel"],
    form:      ["Bekreft avbryt", "Kvittering"],
    auth:      ["Glemt passord", "2FA / BankID"],
    marketing: ["Cookie-samtykke", "Kontakt / påmelding"],
    workbench: ["Ny plan", "Ny økt", "Øvelse-velger", "Mål-kobling", "Periode-detalj"],
    live:      ["Drill-detalj", "Logg slag/reps", "Melding til coach", "Avslutt økt"],
    analyse:   ["Periodevelger", "Kategori-/kølle-filter", "Drill-forslag", "Del"],
    test:      ["Test-instruks", "Registrer slag", "Kontekst (vær/bane)", "Bekreft fullføring"],
    page:      ["Bekreft-dialog"],
  };
  // ── standard handlinger pr. skjermtype ──
  const ACTIONS = {
    list:      ["Søk", "Filtrer", "Sorter", "Eksport", "Ny"],
    detail:    ["Rediger", "Slett", "Del", "Tilbake"],
    dashboard: ["Velg periode", "Bytt spiller/gruppe", "Eksport"],
    board:     ["Nytt kort", "Flytt", "Filtrer"],
    calendar:  ["Ny hendelse", "Bytt visning", "I dag", "Filtrer"],
    form:      ["Lagre", "Avbryt", "Neste / Forrige"],
    auth:      ["Logg inn", "BankID", "Glemt passord"],
    marketing: ["Bli medlem", "Book", "Kontakt"],
    workbench: ["Ny plan", "Ny økt", "Dra & slipp", "Tildel spiller", "Lagre"],
    live:      ["Start", "Pause", "Logg", "Neste øvelse", "Avslutt & lagre"],
    analyse:   ["Velg periode", "Bytt fane", "Filtrer", "Foreslå drill"],
    test:      ["Start test", "Registrer", "Fullfør", "Se analyse"],
    page:      ["Primærhandling"],
  };

  // ── utled skjermtype fra rute + navn ──
  function inferKind(s) {
    const n = (s.navn || "").toLowerCase();
    const r = (s.rute || "").toLowerCase();
    // mest spesifikke først
    if (/\(fullscreen\)\/live|\/live\//.test(r) || /live-økt/.test(n)) return "live";
    if (/\/workbench/.test(r) || /workbench/.test(n)) return "workbench";
    if (/gjennomfor|\/live|summary/.test(r) && /test/.test(r)) return "test";
    if (/tester\/.*\/(gjennomfor)|test.*(gjennomføring|live|scorekort)/.test(n + " " + r)) return "test";
    if (/sg-hub|analysere|statistikk|trackman|\/analyse|lag-snitt|fremgang|radar/.test(r) ||
        /strokes gained|analyse|statistikk|sg-hub|trackman|fremgang/.test(n)) return "analyse";
    if (/innlogg|logg inn|registrer|passord|bankid|onboarding|samtykke|logget ut/.test(n) || /^\/auth/.test(r)) return "auth";
    if (/^\/\(marketing\)/.test(r)) return "marketing";
    if (/kalender|calendar|aarsplan|årsplan|årshjul/.test(r) || /kalender|årsplan/.test(n)) return "calendar";
    if (/tavle|kanban|\/uka|\/board|coaching-board/.test(r) || /tavle|kanban|uka/.test(n)) return "board";
    if (/detalj|-detalj/.test(n) || /\/\[[a-z]*id\]$|\/\[id\]$|\/\[slug\]$|\/\[club\]$|\/\[metric\]$|\/\[testid\]$/i.test(r)) return "detail";
    if (/hub|oversikt|cockpit|dashboard|hjem|drift i dag|min uke|innboks|workspace|stall-oversikt/.test(n)) return "dashboard";
    if (/\/(ny|rediger|new|bygger)\b|\/ny$|\/ny\/|wizard/.test(r) || /\bny |rediger|bygger|wizard|innstillinger|profil|samtykke|inviter/.test(n)) return "form";
    if (/liste|alle|spillere|grupper|drills|runder|bookinger|planer|maler|turneringer|rapporter|tester|øvelser|godkjenn|forespørsler|varsler|meldinger/.test(n)) return "list";
    return "page";
  }

  // ── bespoke tillegg pr. nøkkelskjerm (key = rute) ──
  const EXTRA = {
    "/portal": { details: ["Dagens økt"], modals: ["Hurtig-logg", "Varsel"], actions: ["Start dagens økt"] },
    "/portal/planlegge/workbench": { details: ["Plan-detalj", "Økt-detalj"], modals: ["CreatePlanSheet", "CreateSessionSheet", "Øvelse-velger", "Mål-kobling"], note: "Alt planlegging går gjennom Workbench (låst beslutning)." },
    "/portal/analysere": { modals: ["Innsikt-fortelling", "Hull-analyse"], note: "Analysere + TrackMan + Runder + SG er én flate med faner." },
    "/portal/mal/sg-hub": { details: ["Kølle-detalj", "Benchmark", "Best vs nå"], modals: ["Drill-forslag (gap→drill)", "Avstander", "Forhold"] },
    "/portal/tren/tester": { details: ["Test-detalj"], modals: ["Tildelt deg", "Test-instruks"], actions: ["Start test", "Se tildelte"] },
    "/portal/tren/tester/[testId]/gjennomfor": { modals: ["Registrer slag", "Kontekst (vær/bane/green)", "Bekreft fullføring"], note: "Krever resultat på ALLE slag før lagring." },
    "/portal/booking": { details: ["Booking-detalj"], modals: ["Velg coach", "Velg anlegg", "Credit-måler"], actions: ["Book økt"] },
    "/portal/meg/abonnement": { modals: ["Oppgrader", "Avbestill", "Nytt kort"], note: "Gratis eller 300 kr/mnd — ingen tier-nivåer." },
    "/admin/agencyos": { details: ["Spiller-detalj"], modals: ["Fokus-spiller (pin + AI)", "Caddie (AI)"], note: "Coachens cockpit — «hvem trenger meg i dag?»." },
    "/admin/spillere": { details: ["Spiller-detalj"], modals: ["Ny spiller", "Filter"], actions: ["Ny spiller", "Søk"] },
    "/admin/spillere/[id]": { details: ["Workbench (coach-i-spiller)", "Fremgang", "Tester"], modals: ["Tildel test", "Send melding"] },
    "/admin/spillere/[id]/workbench": { modals: ["Ny plan", "Ny økt", "Tildel test", "Øvelse-velger"], note: "Coach-endring propagerer til spillerens Workbench (delt kjerne)." },
    "/admin/innboks": { details: ["Meldingstråd"], modals: ["Svar", "Godkjenn forespørsel"], actions: ["Svar", "Godkjenn", "Arkiver"] },
    "/admin/plans/new": { modals: ["Velg mal", "Øvelse-velger", "Periode", "Tildel spiller"], note: "Plan-bygger." },
    "/admin/tester": { details: ["Test-detalj"], modals: ["Tildel test", "Foreslåtte tester"], actions: ["Tildel test"] },
    "/admin/kalender": { modals: ["Ny hendelse", "Bytt måned/uke"], actions: ["Ny hendelse", "I dag"] },
    "/admin/foresporsler": { details: ["Forespørsel-detalj"], modals: ["Godkjenn", "Avslå"], actions: ["Godkjenn", "Avslå"] },
    "/auth/login": { modals: ["Glemt passord", "BankID"], actions: ["Logg inn", "BankID", "Registrer"] },
    "/auth/onboarding": { note: "8-stegs spiller-onboarding.", modals: ["Steg-navigasjon", "Hopp over"] },
  };

  const uniq = (a) => Array.from(new Set(a));

  function specFor(s) {
    const kind = inferKind(s);
    const ex = EXTRA[s.rute] || {};
    return {
      kind,
      states:  uniq([...(STATES[kind] || []),  ...(ex.states  || [])]),
      modals:  uniq([...(MODALS[kind] || []),  ...(ex.modals  || [])]),
      actions: uniq([...(ACTIONS[kind] || []), ...(ex.actions || [])]),
      details: uniq(ex.details || []),
      note: ex.note || "",
    };
  }

  const KIND_LABEL = {
    list: "Liste", detail: "Detalj", dashboard: "Dashbord", board: "Tavle",
    calendar: "Kalender", form: "Skjema", auth: "Pålogging", marketing: "Markedsside",
    workbench: "Workbench", live: "Live-økt", analyse: "Analyse", test: "Test", page: "Side",
  };

  return { specFor, inferKind, KIND_LABEL };
})();
