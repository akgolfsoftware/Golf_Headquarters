// Player hubs 5-7: Gjennomføre, Analysere, Meg

// ============================================================
// 5. PlayerHQ — Gjennomføre
// ============================================================
function PlayerGjennomfore() {
  return (
    <HubShell
      role="player"
      active="gj-idag"
      name="Anders Kristiansen"
      role_meta="PLAYERHQ · PRO"
      av_initials="AK"
      av_meta="HCP -- · A1"
      badges={{ varsler: 3 }}
      crumbs={['PlayerHQ', <span className="current" key="c">Gjennomføre</span>]}
    >
      <HubHeader
        eyebrow="PLAYERHQ · PRO"
        title="Gjør"
        titleItalic="jobben"
        sub="Dagens program, kalender, live-økt og bookinger."
        actions={
          <>
            <button className="btn btn-outline"><HI.Calendar/>Kalender</button>
            <button className="btn btn-forest"><HI.Plus/>Ny økt</button>
          </>
        }
      >
        <div className="hub-stats">
          <span><strong>0</strong> økter i dag</span>
          <i/>
          <span><strong>5</strong> denne uka</span>
          <i/>
          <span><strong>1</strong> booking kommende</span>
          <i/>
          <span><strong>Markus</strong> · 28. mai</span>
        </div>
      </HubHeader>

      <section className="player-hero-card">
        <div className="phc-left">
          <div className="phc-av">AK</div>
          <div>
            <div className="eyebrow">SPILLER · SESONG 2026</div>
            <h2>Anders Kristiansen</h2>
            <div className="phc-meta">
              <span className="pill pill-tier">A1</span>
              <span className="pill pill-tier-pro">PRO</span>
              <span className="phc-mono">HCP -- · SG +1.2 siste runde</span>
            </div>
          </div>
        </div>
        <div className="phc-right">
          <div className="phc-stat">
            <span className="phc-lbl">I DAG</span>
            <span className="phc-val">Hviledag</span>
            <span className="phc-sub">ingen planlagt økt</span>
          </div>
          <div className="phc-stat">
            <span className="phc-lbl">NESTE</span>
            <span className="phc-val">Markus R.P.</span>
            <span className="phc-sub">tirsdag 28. mai · 14:00</span>
          </div>
        </div>
      </section>

      <section className="hub-grid two-thirds">
        <HubCard
          Ic={HI.PlayCircle}
          eyebrow="01 · NÅVÆRENDE"
          title="I dag"
          data="0 økter i dag"
          sub="Sist gjennomført: 23. mai · Tek 60 min"
          tone="empty"
          cta="Se kalender →"
        />
        <HubCard
          Ic={HI.Calendar}
          eyebrow="02 · UKA"
          title="Kalender"
          data="5 økter denne uka"
          sub="Tek 2 · Slag 1 · Fys 1 · Spill 1"
          visual={
            <div className="wk-strip">
              {['ma','ti','on','to','fr','lø','sø'].map((d,i) => (
                <span key={d} className={"wk-cell " + ([0,1,3,4,5].includes(i) ? 'on':'off')}>
                  <span className="wk-d">{d}</span>
                </span>
              ))}
            </div>
          }
          cta="Åpne kalender →"
        />
        <HubCard
          Ic={HI.Activity}
          eyebrow="03 · SANNTID"
          title="Live-økt"
          data="Ingen aktiv"
          sub="Sist live: 19. mai · TrackMan · 47 slag"
          tone="empty"
          cta="Start ny økt →"
        />
        <HubCard
          Ic={HI.CalendarCheck}
          eyebrow="04 · COACH"
          title="Booking"
          data="1 kommende"
          sub="Markus R.P. · tirsdag 28. mai · 14:00 · GFGK"
          statusPill={<Pill kind="ok" dot="d-ok">BEKREFTET</Pill>}
          cta="Se bookinger →"
        />
        <HubCard
          Ic={HI.Radio}
          eyebrow="05 · UTSTYR"
          title="TrackMan"
          data="Siste sesjon 19. mai"
          sub="47 slag · driver-snitt 268m · spin 2 480"
          cta="Logg ny →"
        />
      </section>
    </HubShell>
  );
}

// ============================================================
// 6. PlayerHQ — Analysere
// ============================================================
function PlayerAnalysere() {
  return (
    <HubShell
      role="player"
      active="an-stat"
      name="Anders Kristiansen"
      role_meta="PLAYERHQ · PRO"
      av_initials="AK"
      av_meta="HCP -- · A1"
      badges={{ varsler: 3 }}
      crumbs={['PlayerHQ', <span className="current" key="c">Analysere</span>]}
    >
      <HubHeader
        eyebrow="PLAYERHQ · PRO"
        title="Forstå spillet"
        titleItalic="ditt"
        sub="Statistikk, Strokes Gained, runder, TrackMan, tester og AI-innsikt."
        actions={
          <>
            <button className="btn btn-outline"><HI.Download/>Eksporter</button>
            <button className="btn btn-forest"><HI.Plus/>Logg runde</button>
          </>
        }
      >
        <div className="hub-stats">
          <span><strong>47</strong> runder</span>
          <i/>
          <span className="ok-dot"><span/><strong>SG +1.2</strong> siste</span>
          <i/>
          <span><strong>12/36</strong> tester</span>
          <i/>
          <span><strong>#14</strong> av 87</span>
        </div>
      </HubHeader>

      <section className="hub-grid">
        <HubCard
          Ic={HI.BarChart3}
          eyebrow="01 · OVERSIKT"
          title="Statistikk"
          data="47 runder loggført"
          sub="Snitt: 71.4 · driver 268m · 65% GIR"
          visual={
            <svg className="spk" viewBox="0 0 90 28" width="90" height="28" preserveAspectRatio="none">
              <path d="M2 22 L14 17 L26 19 L38 14 L50 11 L62 13 L74 8 L86 5" stroke="#005840" strokeWidth="1.6" fill="none"/>
              <circle cx="86" cy="5" r="2.6" fill="#D1F843" stroke="#005840" strokeWidth="1.4"/>
            </svg>
          }
          cta="Se trender →"
        />
        <HubCard
          Ic={HI.TrendUp}
          eyebrow="02 · NØKKELTALL"
          title="Strokes Gained"
          data="+1.2 siste runde"
          sub="Tee +0.4 · Approach +0.7 · Putt +0.1"
          statusPill={<Pill kind="ok" dot="d-ok">+1.2 SG</Pill>}
          cta="Detalj-analyse →"
        />
        <HubCard
          Ic={HI.Flag}
          eyebrow="03 · RUNDER"
          title="Runder"
          data="47 totalt"
          sub="12 denne mnd · 4 par-eller-bedre"
          cta="Bla →"
        />
        <HubCard
          Ic={HI.Radio}
          eyebrow="04 · ØVELSE"
          title="TrackMan"
          data="23 sesjoner"
          sub="Siste: 19. mai · driver-spin -180 rpm"
          cta="Åpne →"
        />
        <HubCard
          Ic={HI.ClipboardCheck}
          eyebrow="05 · MÅLINGER"
          title="Tester"
          data="12/36 gjennomført"
          sub="CMJ · Squat · Wedge 50m · 5-iron carry"
          visual={<Progress done={12} total={36} tone="ok"/>}
          cta="Se tester →"
        />
        <HubCard
          Ic={HI.Sparkles}
          eyebrow="06 · AI-CADDIE"
          title="AI-Innsikt"
          data="3 nye anbefalinger"
          sub="Approach 100-150m · putt 4-8 fot · driver-tempo"
          statusPill={<Pill kind="accent">3 NYE</Pill>}
          tone="accent"
          cta="Les anbefalinger →"
        />
        <HubCard
          Ic={HI.Map}
          eyebrow="07 · GEOGRAFI"
          title="Baner"
          data="Top 5 spilte"
          sub="GFGK · Bjaavann · Hellerudsletta · Losby · Oslo GK"
          cta="Se kartlag →"
        />
        <HubCard
          Ic={HI.Trophy}
          eyebrow="08 · POSISJON"
          title="Leaderboard"
          data="Din rank: 14 / 87"
          sub="+3 siden forrige uke · A1-klassen"
          statusPill={<Pill kind="forest">#14</Pill>}
          cta="Se ranking →"
        />
      </section>
    </HubShell>
  );
}

// ============================================================
// 7. PlayerHQ — Meg
// ============================================================
function PlayerMeg() {
  return (
    <HubShell
      role="player"
      active="me-profil"
      name="Anders Kristiansen"
      role_meta="PLAYERHQ · MIN PROFIL"
      av_initials="AK"
      av_meta="PRO · A1"
      badges={{ varsler: 3 }}
      crumbs={['PlayerHQ', <span className="current" key="c">Meg</span>]}
    >
      <HubHeader
        eyebrow="PLAYERHQ · MIN PROFIL"
        title="Hei,"
        titleItalic="Anders."
        sub="Bilde, navn og kontaktinfo — samt alt du eier i appen."
        actions={
          <button className="btn btn-outline"><HI.UserLg/>Rediger raskt</button>
        }
      />

      <section className="meg-hero">
        <div className="meg-av-wrap">
          <div className="meg-av">AK</div>
          <div className="meg-av-tier">A1</div>
        </div>
        <div className="meg-info">
          <div className="meg-name-row">
            <h2>Anders Kristiansen</h2>
            <span className="pill pill-tier-pro">PRO</span>
          </div>
          <div className="meg-contact">
            <span className="mc-row"><span className="mc-lbl">E-POST</span><span>anders@akgolf.no</span></span>
            <span className="mc-row"><span className="mc-lbl">TELEFON</span><span>+47 481 22 184</span></span>
            <span className="mc-row"><span className="mc-lbl">KLUBB</span><span>Gamle Fredrikstad GK</span></span>
            <span className="mc-row"><span className="mc-lbl">HCP</span><span>-- · Pro</span></span>
          </div>
        </div>
        <div className="meg-side">
          <span className="ms-lbl">NESTE FAKTURA</span>
          <span className="ms-val">kr 300</span>
          <span className="ms-sub">15. juni · PRO-abonnement</span>
        </div>
      </section>

      <section className="hub-grid">
        <HubCard
          Ic={HI.UserLg}
          eyebrow="01 · IDENTITET"
          title="Profil"
          data="Bilde + navn"
          sub="Synlig for coach og foreldre"
          cta="Rediger →"
        />
        <HubCard
          Ic={HI.Settings}
          eyebrow="02 · PREFERANSER"
          title="Innstillinger"
          data="Personvern, varsler, språk"
          sub="+5 andre seksjoner"
          cta="Åpne →"
        />
        <HubCard
          Ic={HI.ShieldLg}
          eyebrow="03 · KONTO"
          title="Sikkerhet"
          data="2FA aktivert"
          sub="Sist innlogget i dag · 08:14 fra iPhone"
          statusPill={<Pill kind="ok" dot="d-ok">2FA</Pill>}
          cta="Se logger →"
        />
        <HubCard
          Ic={HI.CreditCard}
          eyebrow="04 · BETALING"
          title="Abonnement"
          data="PRO · 300 kr / mnd"
          sub="Neste faktura 15. juni · Visa ••5114"
          statusPill={<Pill kind="forest">PRO</Pill>}
          cta="Administrer →"
        />
        <HubCard
          Ic={HI.CalendarCheck}
          eyebrow="05 · TIMER"
          title="Bookinger"
          data="1 kommende"
          sub="Markus R.P. · 28. mai · 4 historikk"
          cta="Se →"
        />
        <HubCard
          Ic={HI.HeartPulse}
          eyebrow="06 · KROPP"
          title="Helse"
          data="Siste logg 22. mai"
          sub="HR-hvile 52 · søvn 7t 14m · ingen skader"
          cta="Logg ny →"
        />
        <HubCard
          Ic={HI.Briefcase}
          eyebrow="07 · UTSTYR"
          title="Utstyrsbag"
          data="14 køller registrert"
          sub="Driver Stealth 2 · 7-iron P790 · TM2024 setup"
          visual={
            <div className="bag-strip">
              {['D','3w','5w','4i','5i','6i','7i','8i','9i','PW','GW','SW','LW','P'].map((c,i) => (
                <span key={i} className="bag-club">{c}</span>
              ))}
            </div>
          }
          cta="Åpne bag →"
        />
        <HubCard
          Ic={HI.FileText}
          eyebrow="08 · ARKIV"
          title="Dokumenter"
          data="3 dokumenter"
          sub="Kontrakt 2026 · Forsikring · Reise-DOK"
          cta="Se arkiv →"
        />
        <HubCard
          Ic={HI.HelpCircle}
          eyebrow="09 · HJELP"
          title="Hjelp"
          data="Søk hjelp"
          sub="47 artikler · chat med AK-support"
          cta="Åpne →"
        />
      </section>
    </HubShell>
  );
}

Object.assign(window, { PlayerGjennomfore, PlayerAnalysere, PlayerMeg });
