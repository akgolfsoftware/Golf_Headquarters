/* ============================================================
   Direction A — "Mission Control"
   Dark forest cockpit · bento grid · lime signals + glow · live.
   ============================================================ */
const A = window.AK;
const { useState: uS, useEffect: uE, useRef: uR } = React;

function DirAvatar({ initials, tone = "neutral", size = 34 }) {
  const tones = {
    neutral: { bg: "rgba(245,244,238,0.08)", fg: "var(--cream-100)" },
    lime: { bg: "var(--lime-500)", fg: "var(--forest-900)" },
    primary: { bg: "var(--forest-500)", fg: "var(--accent)" },
  };
  const t = tones[tone] || tones.neutral;
  return <span className="a-av" style={{ width: size, height: size, background: t.bg, color: t.fg, fontSize: size * 0.36 }}>{initials}</span>;
}

function PriTag({ p }) {
  const d = A.PRIO[p];
  return <span className="a-pri" style={{ color: d.color, borderColor: d.color }}><A.Icon name={d.icon} size={10} strokeWidth={2} />{d.label}</span>;
}

function ReplyBox({ onSend, placeholder }) {
  const [v, setV] = uS("");
  const ref = uR(null);
  uE(() => { ref.current && ref.current.focus(); }, []);
  const send = () => { onSend(); };
  return (
    <div className="a-reply" onClick={e => e.stopPropagation()}>
      <input ref={ref} value={v} onChange={e => setV(e.target.value)} placeholder={placeholder || "Skriv et hurtigsvar…"}
        onKeyDown={e => { if (e.key === "Enter") send(); }} />
      <button className="a-send" onClick={send}><A.Icon name="send" size={14} /> Send</button>
    </div>
  );
}

function DirA() {
  const ops = A.useOpsState();
  const now = A.useClock();
  const { since, syncing } = A.useSyncTicker();
  const [q, setQ] = uS("");
  const [pf, setPf] = uS("alle");        // gmail priority filter
  const [reply, setReply] = uS(null);     // id med åpen svarboks
  const [drawer, setDrawer] = uS(null);   // { kind, item }
  const kAvt = A.useCountUp(ops.counts.avtaler);
  const kOpp = A.useCountUp(ops.counts.oppgaver);
  const kUbe = A.useCountUp(ops.counts.ubesvarte);
  const kUle = A.useCountUp(ops.counts.uleste);

  const ql = q.trim().toLowerCase();
  const match = (...s) => !ql || s.join(" ").toLowerCase().includes(ql);
  const emails = ops.emails.filter(e => (pf === "alle" || e.priority === pf) && match(e.subject, e.from, e.name, e.snippet));
  const messages = ops.messages.filter(m => match(m.name, m.source, m.snippet));
  const events = A.EVENTS.filter(e => match(e.title, e.who, e.source));
  const beeper = messages.filter(m => m.channel === "beeper");
  const imsg = messages.filter(m => m.channel === "imessage");

  const kpis = [
    { lbl: "Avtaler i dag", v: kAvt, sub: "Google Kalender", icon: "calendar", tone: "" },
    { lbl: "Aktive oppgaver", v: kOpp, sub: "Notion", icon: "check-check", tone: "" },
    { lbl: "Ubesvarte e-poster", v: kUbe, sub: "2 haster", icon: "mail", tone: "urgent" },
    { lbl: "Uleste meldinger", v: kUle, sub: "Beeper · iMessage", icon: "message-square", tone: "lime" },
  ];

  return (
    <div className="a-root dark">
      {/* command bar */}
      <header className="a-bar">
        <div className="a-brand"><img src="assets/logo-white-on-dark.svg" alt="ak" /><span className="a-wm">AgencyOS<b>· AK Golf Academy</b></span></div>
        <div className="a-search">
          <A.Icon name="search" size={15} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Søk på tvers av Gmail, Notion, kalender, meldinger…" />
          {q && <button className="a-clear" onClick={() => setQ("")}><A.Icon name="x" size={13} /></button>}
        </div>
        <div className="a-clock">
          <span className={"a-sync" + (syncing ? " on" : "")}><A.Icon name="refresh-cw" size={12} strokeWidth={2} /> {syncing ? "Synker…" : "for " + since + " s siden"}</span>
          <span className="a-time">{A.fmtTime(now)}</span>
        </div>
        <button className="a-bell"><A.Icon name="bell" size={17} /><i className="a-dot" /></button>
      </header>

      <div className="a-canvas">
        {/* greeting */}
        <div className="a-greet">
          <div>
            <div className="a-eyebrow">{A.SCENE_DATE} · OPS-OVERSIKT</div>
            <h1>God morgen, <em>Anders.</em></h1>
          </div>
          <div className="a-live"><span className="a-pulse" /> LIVE · alle kilder tilkoblet</div>
        </div>

        {/* KPI strip */}
        <div className="a-kpis">
          {kpis.map((k, i) => (
            <div key={i} className={"a-kpi" + (k.tone === "lime" ? " lime" : "") + (k.tone === "urgent" ? " urgent" : "")}>
              <div className="a-kpi-top"><span className="a-kpi-lbl">{k.lbl}</span><span className="a-kpi-ic"><A.Icon name={k.icon} size={15} /></span></div>
              <div className="a-kpi-v">{k.v}</div>
              <div className="a-kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* module launcher */}
        <div className="a-mods">
          {A.MODULES.map(m => (
            <button key={m.key} className={"a-mod" + (m.app ? " app" : "")}>
              <span className="a-mod-ic"><A.Icon name={m.icon} size={17} /></span>
              <span className="a-mod-l">{m.label}</span>
              <A.Icon name="arrow-up-right" size={13} className="a-mod-go" />
            </button>
          ))}
        </div>

        {/* dagens tre */}
        <div className="a-tre">
          <span className="a-tre-eb">DAGENS TRE · IKKE-FORHANDLINGSBART</span>
          <div className="a-tre-row">
            {A.DAGENS_TRE.map(t => (
              <span key={t.n} className="a-tre-pill"><b>{t.n}</b><A.Icon name={t.icon} size={14} />{t.label}</span>
            ))}
          </div>
          <span className="a-tre-glow" />
        </div>

        {/* BENTO */}
        <div className="a-bento">
          <div className="a-col a-col-l">
          {/* Kalender */}
          <section className="a-card a-cal">
            <div className="a-ch"><A.Icon name="calendar" size={15} /><span className="a-ct">Dagens kalender</span><span className="a-cc">{ops.counts.avtaler} AVTALER</span><span className="a-src">Google Kalender</span></div>
            <div className="a-cb">
              {events.map(ev => (
                <button key={ev.id} className={"a-ev ax-" + (ev.axis || "none") + (ev.next ? " next" : "")} onClick={() => setDrawer({ kind: "event", item: ev })}>
                  <span className="a-ev-t">{ev.allday ? "Hele\u00A0dagen" : ev.time}</span>
                  <span className="a-ev-b">
                    <span className="a-ev-h">
                      <span className="a-ev-title">{ev.title}</span>
                      {ev.next && <span className="a-next">NESTE</span>}
                    </span>
                    <span className="a-ev-who">{ev.who}</span>
                    <span className="a-ev-meta">
                      <span className="a-tagm">{ev.source}</span>
                      {ev.loc && <span className="a-loc"><A.Icon name="map-pin" size={11} />{ev.loc}</span>}
                    </span>
                  </span>
                </button>
              ))}
              {!ql && <button className="a-more"><A.Icon name="chevron-down" size={13} /> +{A.EVENTS_MORE} flere avtaler i dag</button>}
            </div>
          </section>

          {/* Gmail */}
          <section className="a-card a-gmail">
            <div className="a-ch"><A.Icon name="mail" size={15} /><span className="a-ct">Gmail</span><span className="a-cc alert">{ops.emails.length} UBESVART</span></div>
            <div className="a-chips">
              {[["alle", "Alle"], ["urgent", "Haster"], ["followup", "Følg opp"], ["open", "Ubesvart"]].map(([k, l]) => (
                <button key={k} className={"a-chip" + (pf === k ? " on" : "")} onClick={() => setPf(k)}>{l}</button>
              ))}
            </div>
            <div className="a-cb">
              {emails.length === 0 && <div className="a-empty"><A.Icon name="check-check" size={22} /><span>Innboks tom — godt jobba.</span></div>}
              {emails.map(e => (
                <div key={e.id} className="a-mail" onClick={() => setDrawer({ kind: "email", item: e })}>
                  <DirAvatar initials={e.initials} tone={e.priority === "urgent" ? "primary" : "neutral"} size={34} />
                  <div className="a-mail-b">
                    <div className="a-mail-top"><span className="a-mail-from">{e.name}</span><PriTag p={e.priority} /><span className="a-when">{e.when}</span></div>
                    <div className="a-mail-subj">{e.subject}</div>
                    <div className="a-mail-snip">{e.snippet}</div>
                    {reply === e.id
                      ? <ReplyBox onSend={() => { setReply(null); ops.readEmail(e.id, "Svar sendt · " + e.name); }} />
                      : <div className="a-acts" onClick={ev => ev.stopPropagation()}>
                        <button className="a-act pri" onClick={() => setReply(e.id)}><A.Icon name="reply" size={13} /> Svar</button>
                        <button className="a-act" onClick={() => ops.readEmail(e.id)}><A.Icon name="check" size={13} /> Les</button>
                        <button className="a-act" onClick={() => ops.readEmail(e.id, "Arkivert")}><A.Icon name="archive" size={13} /> Arkiver</button>
                      </div>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Oppgaver */}
          <section className="a-card a-tasks">
            <div className="a-ch"><A.Icon name="check-check" size={15} /><span className="a-ct">Oppgaver</span><span className="a-src">Notion ↗</span></div>
            <div className="a-cb">
              <div className="a-grp">FORFALLER I DAG</div>
              {ops.tasks.map(t => (
                <button key={t.id} className={"a-task" + (t.done ? " done" : "")} onClick={() => ops.toggleTask(t.id)}>
                  <span className="a-tchk">{t.done && <A.Icon name="check" size={12} strokeWidth={2.4} />}</span>
                  <span className="a-task-b"><span className="a-task-t">{t.title}</span><span className="a-task-m"><span className={"a-prio " + t.prio}>{t.prio}</span><span className="a-tag">{t.tag}</span>{t.due}</span></span>
                </button>
              ))}
            </div>
          </section>
          </div>

          <div className="a-col a-col-r">
          {/* Meldinger */}
          <section className="a-card a-msg">
            <div className="a-ch"><A.Icon name="message-square" size={15} /><span className="a-ct">Uleste meldinger</span><span className="a-cc lime">{ops.counts.uleste}</span></div>
            <div className="a-cb">
              <div className="a-grp">BEEPER · {beeper.reduce((s, m) => s + m.unread, 0)} ULESTE</div>
              {beeper.map(m => <MsgRow key={m.id} m={m} ops={ops} reply={reply} setReply={setReply} setDrawer={setDrawer} />)}
              <div className="a-grp im">IMESSAGE · {imsg.reduce((s, m) => s + m.unread, 0)} ULESTE</div>
              {imsg.map(m => <MsgRow key={m.id} m={m} ops={ops} reply={reply} setReply={setReply} setDrawer={setDrawer} />)}
            </div>
          </section>

          {/* Notion prosjekt */}
          <section className="a-card a-notion">
            <div className="a-ch"><A.Icon name="book-open" size={15} /><span className="a-ct">Notion-prosjekt</span><span className="a-src">Notion ↗</span></div>
            <div className="a-cb a-notion-b">
              <div className="a-proj">{A.NOTION.project}</div>
              <div className="a-proj-meta"><span className="a-status">{A.NOTION.status}</span><span>{A.NOTION.sprint}</span></div>
              <div className="a-prog"><span style={{ width: A.NOTION.progress + "%" }} /></div>
              <div className="a-prog-lbl">{A.NOTION.progress}% fullført</div>
              <div className="a-cols">
                {A.NOTION.columns.map(c => <div key={c.name} className="a-col-card"><b>{c.count}</b><span>{c.name}</span></div>)}
              </div>
            </div>
          </section>
          </div>
        </div>
      </div>

      {/* drawer */}
      <div className={"a-scrim" + (drawer ? " open" : "")} onClick={() => setDrawer(null)} />
      <aside className={"a-drawer" + (drawer ? " open" : "")}>
        {drawer && <DrawerBody drawer={drawer} ops={ops} onClose={() => setDrawer(null)} />}
      </aside>

      {ops.toast && <div className="a-toast"><A.Icon name="check" size={15} strokeWidth={2.4} /> {ops.toast}</div>}
    </div>
  );
}

function MsgRow({ m, ops, reply, setReply, setDrawer }) {
  return (
    <div className={"a-msgrow" + (m.fresh ? " fresh" : "")} onClick={() => setDrawer({ kind: "msg", item: m })}>
      <DirAvatar initials={m.initials} tone={m.fresh ? "lime" : "neutral"} size={32} />
      <div className="a-msg-b">
        <div className="a-msg-top">
          <span className="a-msg-name">{m.name}</span>
          {m.unread > 1 && <span className="a-unread">{m.unread}</span>}
          <span className="a-src-chip">{m.source}</span>
          {m.fresh && <span className="a-fresh-dot" />}
          <span className="a-when">{m.when}</span>
        </div>
        <div className="a-msg-snip">{m.snippet}</div>
        {reply === m.id
          ? <ReplyBox onSend={() => { setReply(null); ops.readMessage(m.id, "Svar sendt · " + m.name); }} />
          : <div className="a-acts" onClick={ev => ev.stopPropagation()}>
            <button className="a-act pri" onClick={() => setReply(m.id)}><A.Icon name="reply" size={13} /> Svar</button>
            <button className="a-act" onClick={() => ops.readMessage(m.id)}><A.Icon name="check" size={13} /> Les</button>
          </div>}
      </div>
    </div>
  );
}

function DrawerBody({ drawer, ops, onClose }) {
  const { kind, item } = drawer;
  const title = kind === "email" ? item.subject : kind === "event" ? item.title : item.name;
  return (
    <>
      <div className="a-dh">
        <span className="a-dh-eb">{kind === "email" ? "GMAIL" : kind === "event" ? "GOOGLE KALENDER" : (item.source || "MELDING").toUpperCase()}</span>
        <button className="a-dx" onClick={onClose}><A.Icon name="x" size={16} /></button>
      </div>
      <div className="a-db">
        <h3>{title}</h3>
        {kind === "email" && <div className="a-db-meta">{item.name} · {item.from} · {item.when}</div>}
        {kind === "event" && <div className="a-db-meta">{item.allday ? "Hele dagen" : item.time} · {item.who}</div>}
        {kind === "msg" && <div className="a-db-meta">{item.source} · {item.when} · {item.unread} uleste</div>}
        <p className="a-db-body">{item.snippet || item.loc || "Ingen forhåndsvisning."}</p>
        {item.loc && <div className="a-db-loc"><A.Icon name="map-pin" size={14} /> {item.loc}</div>}
        {(kind === "email" || kind === "msg") && <ReplyBox placeholder={"Svar til " + item.name + "…"} onSend={() => { kind === "email" ? ops.readEmail(item.id, "Svar sendt") : ops.readMessage(item.id, "Svar sendt"); onClose(); }} />}
      </div>
      <div className="a-df">
        {(kind === "email" || kind === "msg") && <button className="a-btn pri" onClick={() => { kind === "email" ? ops.readEmail(item.id) : ops.readMessage(item.id); onClose(); }}><A.Icon name="check" size={15} /> Merk som lest</button>}
        <button className="a-btn" onClick={onClose}>Lukk</button>
      </div>
    </>
  );
}

window.DirA = DirA;
