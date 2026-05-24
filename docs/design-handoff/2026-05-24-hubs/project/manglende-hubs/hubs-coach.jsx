// Coach hubs 1-4: Planlegge, Gjennomføre, Innsikt, Admin
// All wrapped in pr1-frame shell so the chrome + tokens come along.

function HubShell({ role, active, name, role_meta, av_initials, av_meta, badges, crumbs, children }) {
  return (
    <div className="pr1-frame hub-frame">
      <div className="app">
        <HubSidebar role={role} active={active} name={name} role_meta={role_meta}
          av_initials={av_initials} av_meta={av_meta} badges={badges} />
        <div className="main">
          <HubTopbar crumbs={crumbs}/>
          <main className="page hub-page">{children}</main>
        </div>
      </div>
    </div>
  );
}
window.HubShell = HubShell;

// ============================================================
// 1. CoachHQ — Planlegge
// ============================================================
function CoachPlanlegge() {
  return (
    <HubShell
      role="coach"
      active="plan-treningsplaner"
      name="Anders K."
      role_meta="COACHHQ · HEAD COACH"
      av_initials="AK"
      av_meta="38 SPILLERE"
      badges={{ innboks: 7, godkjenninger: 8, bookinger: 1 }}
      crumbs={['CoachHQ', <span className="current" key="c">Planlegge</span>]}
    >
      <HubHeader
        eyebrow="COACHHQ · COACH"
        title="Bygg"
        titleItalic="planer"
        sub="Treningsplaner, plan-maler, teknisk plan og drill-bibliotek på ett sted."
        actions={
          <button className="btn btn-forest"><HI.Plus/>Ny plan</button>
        }
      >
        <div className="hub-stats">
          <span><strong>14</strong> aktive planer</span>
          <i/>
          <span><strong>28</strong> maler</span>
          <i/>
          <span><strong>247</strong> drills</span>
          <i/>
          <span><strong>3</strong> kommende turneringer</span>
        </div>
      </HubHeader>

      <section className="hub-grid">
        <HubCard
          Ic={HI.CalendarRange}
          eyebrow="01 · STALL"
          title="Treningsplaner"
          data="14 aktive planer"
          sub="6 utkast · sist endret 23. mai"
          statusPill={<Pill kind="ok" dot="d-ok">AKTIVE</Pill>}
          cta="Se alle →"
        />
        <HubCard
          Ic={HI.FileText}
          eyebrow="02 · BIBLIOTEK"
          title="Plan-maler"
          data="28 maler"
          sub="Sist brukt: 21. mai · Markus R.P."
          cta="Bla i bibliotek →"
        />
        <HubCard
          Ic={HI.Target}
          eyebrow="03 · INDIVID"
          title="Teknisk plan"
          data="9 spillere"
          sub="7 med aktiv plan · 2 venter"
          statusPill={<Pill kind="warn" dot="d-warn">2 VENTER</Pill>}
          cta="Se spillere →"
        />
        <HubCard
          Ic={HI.Dumbbell}
          eyebrow="04 · ØVELSER"
          title="Drill-bibliotek"
          data="247 drills"
          sub="12 nye denne uka · 4 kohort-favoritter"
          statusPill={<Pill kind="accent">+12 NY</Pill>}
          cta="Utforsk →"
        />
        <HubCard
          Ic={HI.Trophy}
          eyebrow="05 · KONKURRANSE"
          title="Turneringer"
          data="3 kommende"
          sub="Neste: Sørlandsåpent · 14. juni"
          visual={
            <div className="next-tourn">
              <span className="nt-when">14. JUN</span>
              <span className="nt-where">Bjaavann GK</span>
              <span className="nt-cnt">5 påmeldte</span>
            </div>
          }
          cta="Planlegg →"
        />
        <HubCard
          Ic={HI.Calendar}
          eyebrow="06 · ØKTER"
          title="Økter"
          data="47 totalt"
          sub="5 utkast · 12 denne uka"
          cta="Se alle →"
        />
        <HubCard
          Ic={HI.Video}
          eyebrow="07 · MEDIA"
          title="Videoer"
          data="23 i bibliotek"
          sub="Tek 9 · Slag 7 · Fys 4 · Spill 3"
          cta="Bla →"
        />
      </section>

      <aside className="hub-recent">
        <div className="hub-recent-head">
          <div className="eyebrow">SIST RØRT</div>
          <span className="hub-recent-meta">7 elementer denne uka</span>
        </div>
        <ul className="hub-recent-list">
          <li><span className="rc-kind"><HI.FileText/></span><span className="rc-ttl">Mal · Vinter-grunnplan A1</span><span className="rc-meta">redigert 21. mai · 14:32</span></li>
          <li><span className="rc-kind"><HI.Target/></span><span className="rc-ttl">Teknisk plan · Mathilde S.</span><span className="rc-meta">opprettet 20. mai · 09:11</span></li>
          <li><span className="rc-kind"><HI.Dumbbell/></span><span className="rc-ttl">Drill · Avstands-kontroll 8i</span><span className="rc-meta">lagt til 19. mai · 16:48</span></li>
          <li><span className="rc-kind"><HI.CalendarRange/></span><span className="rc-ttl">Plan · Markus R.P. — Periode 2</span><span className="rc-meta">justert 18. mai · 11:02</span></li>
        </ul>
      </aside>
    </HubShell>
  );
}

// ============================================================
// 2. CoachHQ — Gjennomføre
// ============================================================
function CoachGjennomfore() {
  return (
    <HubShell
      role="coach"
      active="gj-kalender"
      name="Anders K."
      role_meta="COACHHQ · HEAD COACH"
      av_initials="AK"
      av_meta="38 SPILLERE"
      badges={{ innboks: 7, godkjenninger: 8, bookinger: 1 }}
      crumbs={['CoachHQ', <span className="current" key="c">Gjennomføre</span>]}
    >
      <HubHeader
        eyebrow="COACHHQ · COACH"
        title="Daglig"
        titleItalic="drift"
        sub="Kalender, bookinger, anlegg, tilgjengelighet og live-økter."
        actions={
          <>
            <button className="btn btn-outline"><HI.Calendar/>I dag</button>
            <button className="btn btn-forest"><HI.Plus/>Ny booking</button>
          </>
        }
      >
        <div className="hub-stats">
          <span><strong>5</strong> økter i dag</span>
          <i/>
          <span><strong>23</strong> denne uka</span>
          <i/>
          <span className="ok-dot"><span/><strong>Stripe aktiv</strong></span>
          <i/>
          <span><strong>3</strong> anlegg</span>
        </div>
      </HubHeader>

      <section className="hub-grid">
        <HubCard
          Ic={HI.Calendar}
          eyebrow="01 · DAGENS DRIFT"
          title="Coach-kalender"
          data="5 økter i dag"
          sub="23 denne uka · 4 venter input"
          visual={
            <div className="cal-mini">
              <span className="cm-tick m"></span><span className="cm-tick"></span><span className="cm-tick m"></span><span className="cm-tick"></span><span className="cm-tick"></span>
              <span className="cm-now"/>
            </div>
          }
          cta="Åpne →"
        />
        <HubCard
          Ic={HI.CalendarCheck}
          eyebrow="02 · INNKOMMENDE"
          title="Bookinger"
          data="4 kommende"
          sub="1 venter på bekreft · 12 historikk"
          statusPill={<Pill kind="warn" dot="d-warn">1 PENDING</Pill>}
          cta="Behandle →"
        />
        <HubCard
          Ic={HI.MapPin}
          eyebrow="03 · LOKASJONER"
          title="Anlegg"
          data="3 anlegg"
          sub="GFGK · Bjaavann · Hellerudsletta"
          cta="Administrer →"
        />
        <HubCard
          Ic={HI.Clock}
          eyebrow="04 · ÅPNE TIMER"
          title="Tilgjengelighet"
          data="12 t denne uka"
          sub="ti 09–14 · on 13–18 · to 10–15"
          visual={
            <div className="wk-strip">
              {['ma','ti','on','to','fr','lø','sø'].map((d,i) => (
                <span key={d} className={"wk-cell " + (i<5 ? 'on':'off') + (i===1?' me':'')}>
                  <span className="wk-d">{d}</span>
                </span>
              ))}
            </div>
          }
          cta="Sett →"
        />
        <HubCard
          Ic={HI.Gauge}
          eyebrow="05 · BELASTNING"
          title="Kapasitet"
          data="2% brukt denne uka"
          sub="Mål: 75% · 23/40 t booket"
          visual={<KpiBar pct={2} tone="ok"/>}
          cta="Se trend →"
        />
        <HubCard
          Ic={HI.CreditCard}
          eyebrow="06 · ØKONOMI"
          title="Tjenester"
          data="5 prislister"
          sub="Stripe aktiv · 12 abonnenter"
          statusPill={<Pill kind="ok" dot="d-pulse">STRIPE OK</Pill>}
          cta="Åpne →"
        />
        <HubCard
          Ic={HI.Radio}
          eyebrow="07 · UTSTYR"
          title="TrackMan"
          data="1 aktiv sesjon"
          sub="Markus R.P. · GFGK Bay 3"
          statusPill={<Pill kind="accent" dot="d-pulse">LIVE</Pill>}
          cta="Se live →"
        />
        <HubCard
          Ic={HI.Activity}
          eyebrow="08 · ØYEBLIKK"
          title="Live-økter"
          data="Ingen aktiv nå"
          sub="Sist live: 23. mai · 16:00"
          tone="empty"
          cta="Start ny økt →"
        />
      </section>
    </HubShell>
  );
}

// ============================================================
// 3. CoachHQ — Innsikt
// ============================================================
function CoachInnsikt() {
  return (
    <HubShell
      role="coach"
      active="in-lag"
      name="Anders K."
      role_meta="COACHHQ · HEAD COACH"
      av_initials="AK"
      av_meta="38 SPILLERE"
      badges={{ innboks: 7, godkjenninger: 8 }}
      crumbs={['CoachHQ', <span className="current" key="c">Innsikt</span>]}
    >
      <HubHeader
        eyebrow="COACHHQ · COACH"
        title="Innsikt over"
        titleItalic="stallen"
        sub="Stall-statistikk, tester, godkjenninger og rapporter."
        actions={
          <>
            <button className="btn btn-outline"><HI.Download/>Eksporter</button>
            <button className="btn btn-forest"><HI.Plus/>Generer rapport</button>
          </>
        }
      >
        <div className="hub-stats">
          <span><strong>38</strong> spillere</span>
          <i/>
          <span className="warn-dot"><span/><strong>7 overdue</strong> tester</span>
          <i/>
          <span className="warn-dot"><span/><strong>8</strong> godkjenninger venter</span>
          <i/>
          <span><strong>+12%</strong> mot forrige mnd</span>
        </div>
      </HubHeader>

      <section className="hub-grid">
        <HubCard
          Ic={HI.BarChart3}
          eyebrow="01 · OVERSIKT"
          title="Lag-snitt"
          data="Pyramide-snitt · Q2 2026"
          sub="Tek 32% · Slag 28% · Fys 18% · Spill 14% · Turn 8%"
          visual={<PyramidViz/>}
          cta="Se trender →"
        />
        <HubCard
          Ic={HI.ClipboardCheck}
          eyebrow="02 · MÅLINGER"
          title="Tester"
          data="7 overdue · 12 snart"
          sub="CMJ · Squat · 5-iron · Wedge"
          statusPill={<Pill kind="danger" dot="d-danger">7 OVERDUE</Pill>}
          cta="Behandle →"
        />
        <HubCard
          Ic={HI.CheckCheck}
          eyebrow="03 · INNBOKS"
          title="Godkjenninger"
          data="8 venter"
          sub="3 plan-revisjon · 4 runder · 1 utstyr"
          statusPill={<Pill kind="warn" dot="d-warn">8 VENTER</Pill>}
          cta="Gå gjennom →"
        />
        <HubCard
          Ic={HI.MsgSquare}
          eyebrow="04 · DIALOG"
          title="Forespørsler"
          data="0 ubehandlete"
          sub="Sist: 24. mai · 11:48 — alt besvart"
          statusPill={<Pill kind="ok" dot="d-ok">INBOX 0</Pill>}
          tone="muted"
          cta="Se historikk →"
        />
        <HubCard
          Ic={HI.FileBarChart}
          eyebrow="05 · EKSPORT"
          title="Rapporter"
          data="Siste generert: 23. mai"
          sub="Mnd-rapport mai · 38 spillere"
          cta="Generer ny →"
        />
        <HubCard
          Ic={HI.Flag}
          eyebrow="06 · KONKURRANSE"
          title="Runder"
          data="47 logget"
          sub="12 denne mnd · snitt SG +0,8"
          visual={
            <svg className="spk" viewBox="0 0 90 28" width="90" height="28" preserveAspectRatio="none">
              <path d="M2 18 L14 16 L26 19 L38 12 L50 14 L62 8 L74 11 L86 6" stroke="#005840" strokeWidth="1.6" fill="none"/>
              <circle cx="86" cy="6" r="2.6" fill="#D1F843" stroke="#005840" strokeWidth="1.4"/>
            </svg>
          }
          cta="Se runder →"
        />
        <HubCard
          Ic={HI.Wallet}
          eyebrow="07 · ØKONOMI"
          title="Finance"
          data="kr 36 753"
          sub="+12% mot forrige · 23 fakturaer"
          statusPill={<Pill kind="ok" dot="d-ok">+12%</Pill>}
          cta="Detaljer →"
        />
        <HubCard
          Ic={HI.HeartPulse}
          eyebrow="08 · HELSE"
          title="Tilstander"
          data="2 registrerte skader"
          sub="Sondre H. — handledd · Iben L. — kne"
          statusPill={<Pill kind="warn" dot="d-warn">2 SKADER</Pill>}
          cta="Se logger →"
        />
      </section>
    </HubShell>
  );
}

// ============================================================
// 4. CoachHQ — Admin
// ============================================================
function CoachAdmin() {
  return (
    <HubShell
      role="coach"
      active="ad-klubb"
      name="Anders K."
      role_meta="COACHHQ · HEAD COACH"
      av_initials="AK"
      av_meta="HEAD COACH"
      badges={{ innboks: 7, godkjenninger: 8 }}
      crumbs={['CoachHQ', <span className="current" key="c">Admin</span>]}
    >
      <HubHeader
        eyebrow="COACHHQ · HEAD COACH"
        title="Organisasjon"
        titleItalic=""
        sub="Klubb, team, integrasjoner og innstillinger."
        actions={
          <button className="btn btn-outline"><HI.Settings/>Innstillinger</button>
        }
      >
        <div className="hub-stats">
          <span><strong>Gamle Fredrikstad GK</strong></span>
          <i/>
          <span><strong>4</strong> coacher · <strong>2</strong> admin</span>
          <i/>
          <span><strong>6</strong> integrasjoner</span>
          <i/>
          <span className="ok-dot"><span/><strong>Audit ren</strong></span>
        </div>
      </HubHeader>

      <section className="hub-grid">
        <HubCard
          Ic={HI.Building}
          eyebrow="01 · IDENTITET"
          title="Klubb-info"
          data="Gamle Fredrikstad GK"
          sub="Org.nr 992 884 — Plassen 1, 1632"
          cta="Rediger →"
        />
        <HubCard
          Ic={HI.UsersLg}
          eyebrow="02 · TEAM"
          title="Team"
          data="4 coacher · 2 admin"
          sub="AK · MWA · TLO · JBR · 2 admin-roller"
          visual={
            <div className="team-strip">
              {[
                {n:'AK', c:'c2'}, {n:'MW', c:'c3'}, {n:'TL', c:'c5'},
                {n:'JB', c:'c1'}, {n:'IS', c:'c6'}, {n:'+1', c:'c8'},
              ].map((p,i) => (
                <span key={i} className={"team-av " + p.c}>{p.n}</span>
              ))}
            </div>
          }
          cta="Administrer →"
        />
        <HubCard
          Ic={HI.Plug}
          eyebrow="03 · KOBLINGER"
          title="Integrasjoner"
          data="6 koblet · 1 ikke"
          sub="Notion ikke koblet · re-auth nødvendig"
          statusPill={<Pill kind="warn" dot="d-warn">NOTION OFF</Pill>}
          visual={
            <div className="int-strip">
              <span className="int-pill on">Stripe</span>
              <span className="int-pill on">TrackMan</span>
              <span className="int-pill on">WAGR</span>
              <span className="int-pill on">Google Cal</span>
              <span className="int-pill on">Slack</span>
              <span className="int-pill off">Notion</span>
            </div>
          }
          cta="Koble →"
        />
        <HubCard
          Ic={HI.Settings}
          eyebrow="04 · KONFIG"
          title="Innstillinger"
          data="Sist endret 22. mai"
          sub="Varsler · Personvern · Språk · Branding"
          cta="Åpne →"
        />
        <HubCard
          Ic={HI.Bot}
          eyebrow="05 · AGENTER"
          title="AI-agenter"
          data="3 aktive"
          sub="Caddie · Plan-bygger · Drill-foreslår"
          statusPill={<Pill kind="accent" dot="d-pulse">3 LIVE</Pill>}
          cta="Konfigurer →"
        />
        <HubCard
          Ic={HI.Mail}
          eyebrow="06 · MAL"
          title="E-postmaler"
          data="12 maler"
          sub="Velkomst · Faktura · Booking · Reminder"
          cta="Bla →"
        />
        <HubCard
          Ic={HI.ShieldLg}
          eyebrow="07 · SIKKERHET"
          title="Audit-log"
          data="Siste hendelse 04:12"
          sub="24. mai · API-key rotert (auto)"
          statusPill={<Pill kind="ok" dot="d-ok">REN</Pill>}
          cta="Se aktivitet →"
        />
        <HubCard
          Ic={HI.UserLg}
          eyebrow="08 · MEG"
          title="Min profil"
          data="Anders K. · Head Coach"
          sub="Tilgjengelig · pro@akgolf.no"
          statusPill={<Pill kind="tier">HEAD</Pill>}
          cta="Rediger →"
        />
      </section>
    </HubShell>
  );
}

Object.assign(window, { CoachPlanlegge, CoachGjennomfore, CoachInnsikt, CoachAdmin });
