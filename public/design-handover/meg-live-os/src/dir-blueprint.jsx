/* ============================================================
   Teknisk blueprint — paste-ready konfig for det enhetlige
   sanntidsvinduet. Datakilder · prioritet · feil · sikkerhet.
   ============================================================ */
const BP = window.AK;

const BP_SOURCES = [
  { kilde: "Gmail", felt: "Avsender · emne · etikett (Viktig) · prioritet · tid · uleste", oppd: "Push (watch) · fallback 60 s", auth: "OAuth · gmail.readonly + modify" },
  { kilde: "Google Kalender", felt: "Tid · tittel · sted · deltaker · kilde (Acuity/internt) · NESTE", oppd: "Push (channel) · fallback 60 s", auth: "OAuth · calendar.readonly" },
  { kilde: "Notion — prosjekt", felt: "Prosjekt · status · sprint · kolonner · framdrift %", oppd: "Webhook + cron 5 min", auth: "Notion-integrasjon (intern)" },
  { kilde: "Notion — oppgaver", felt: "Tittel · prioritet (P1/P2) · tag · forfaller · status", oppd: "Webhook + cron 5 min", auth: "Notion-integrasjon (intern)" },
  { kilde: "Beeper", felt: "Navn · kanal (Instagram/Messenger/WhatsApp/Slack) · uleste · tid", oppd: "Sanntid (Matrix websocket)", auth: "Beeper-token · Matrix access" },
  { kilde: "iMessage", felt: "Navn · forhåndsvisning · uleste · tid", oppd: "Sanntid via Beeper-bridge", auth: "Lokal bridge · enhetsnøkkel" },
];

const BP_PRIO = [
  { t: "Haster", c: "var(--destructive)", d: "Etikett «Viktig», SLA brutt, P1, eller ≥3 uleste i tråd. Rød kant + topp i feed." },
  { t: "Følg opp", c: "var(--warning-500)", d: "Venter på svar fra deg, lovet oppfølging, iMessage/regnskap, P2. Amber." },
  { t: "Ubesvart", c: "var(--muted-foreground)", d: "Lest-status mangler, ingen frist. Nøytral — vises etter de to over." },
];

const BP_FAIL = [
  ["API-feil (5xx / rate-limit)", "Eksponentiell backoff (1→2→4→8 s, maks 5). Behold siste snapshot, vis «sist synket»-tid + gult «utdatert»-merke på kortet."],
  ["Nett faller ut", "Offline-banner. Les fra IndexedDB-cache. Handlinger (les/arkiver/svar) køes lokalt og spilles av ved gjenkobling."],
  ["Manglende tilgang / token utløpt", "Kortet degraderes til «Koble til på nytt»-tilstand med re-auth-knapp. Øvrige kilder fortsetter upåvirket."],
  ["Delvis svar / tomt felt", "Skjult heller enn placeholder-støy. Tellere reflekterer kun verifiserte data."],
];

const BP_SEC = [
  ["Minimale scopes", "Read-only der det holder (kalender, prosjekt). Skrive-scope kun for Gmail modify (merk lest) og Notion oppgavestatus."],
  ["Autentisering", "OAuth 2.0 + PKCE for Google. Notion intern-integrasjon. Beeper/iMessage via lokal bridge — token aldri i frontend."],
  ["Token-lagring", "Server-side, kryptert (AES-256). Korte access-tokens, roterende refresh. Ingen hemmeligheter i artifact-koden."],
  ["Synk & isolasjon", "Per-kilde rate-limit + sirkelbryter. Én kildes feil isoleres. All trafikk over TLS; audit-logg på skrivehandlinger."],
];

function DirBlueprint() {
  return (
    <div className="bp-root dark">
      <header className="bp-head">
        <span className="bp-eb">PASTE-READY KONFIG · CLAUDE COWORK</span>
        <h1>Teknisk blueprint for det <em>enhetlige</em> sanntidsvinduet</h1>
        <p className="bp-lead">Ett vindu, åtte kilder, sanntid. Under: hvordan hver komponent kobles, oppdateres, prioriteres og sikres — uten å fjerne eller omdefinere noen kanal.</p>
      </header>

      <section className="bp-block">
        <div className="bp-bh"><BP.Icon name="server-cog" size={15} /><span>1 · Datakilder, felt & oppdatering</span></div>
        <div className="bp-table">
          <div className="bp-tr bp-th"><span>Kilde</span><span>Felt / kolonner</span><span>Oppdatering</span><span>Auth</span></div>
          {BP_SOURCES.map((s, i) => (
            <div className="bp-tr" key={i}><span className="bp-kilde">{s.kilde}</span><span className="bp-felt">{s.felt}</span><span className="bp-oppd">{s.oppd}</span><span className="bp-auth">{s.auth}</span></div>
          ))}
        </div>
      </section>

      <div className="bp-2col">
        <section className="bp-block">
          <div className="bp-bh"><BP.Icon name="flag" size={15} /><span>2 · Prioritetsregler & koblinger</span></div>
          <div className="bp-prio">
            {BP_PRIO.map((p, i) => (
              <div className="bp-prio-row" key={i}><span className="bp-dot" style={{ background: p.c }} /><div><b style={{ color: p.c }}>{p.t}</b><span>{p.d}</span></div></div>
            ))}
          </div>
          <div className="bp-note"><BP.Icon name="activity" size={13} /> <b>Koblinger:</b> e-post ↔ kalender ↔ kontakt deler person-ID — Filip Svendsens WhatsApp, e-post og 14:00-økt lenkes på tvers. Klikk åpner samme person-drawer.</div>
        </section>

        <section className="bp-block">
          <div className="bp-bh"><BP.Icon name="wifi-off" size={15} /><span>3 · Feilhåndtering & fallback</span></div>
          <div className="bp-list">
            {BP_FAIL.map(([t, d], i) => <div className="bp-li" key={i}><b>{t}</b><span>{d}</span></div>)}
          </div>
        </section>
      </div>

      <section className="bp-block">
        <div className="bp-bh"><BP.Icon name="lock" size={15} /><span>4 · Sikkerhet & tilgangskontroll</span></div>
        <div className="bp-sec">
          {BP_SEC.map(([t, d], i) => <div className="bp-sec-card" key={i}><b>{t}</b><span>{d}</span></div>)}
        </div>
      </section>

      <div className="bp-foot"><span className="bp-foot-eb">OPPDATERINGSKADENS</span> Sanntid: Beeper/iMessage · Push: Gmail/Kalender · 5 min: Notion · UI-klokke: 1 s · re-sync-puls: 50 s. Alle kanaler bevart — ingen lagt til.</div>
    </div>
  );
}

window.DirBlueprint = DirBlueprint;
