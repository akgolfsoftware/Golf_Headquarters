/* ============================================================
   Direction B — "Editorial Dense"
   Light cream · 4-kolonne cockpit · DataGolf-tetthet · rolig.
   Prioritet via venstre fargekant + mono-tags. Minimal glød.
   ============================================================ */
const B = window.AK;
const { useState: bS } = React;

function BAvatar({ initials, tone = "neutral", size = 30 }) {
  const t = tone === "primary" ? { bg: "var(--primary)", fg: "var(--accent)" }
    : tone === "lime" ? { bg: "var(--accent)", fg: "var(--primary)" }
      : { bg: "var(--secondary)", fg: "var(--foreground)" };
  return <span className="b-av" style={{ width: size, height: size, background: t.bg, color: t.fg, fontSize: size * 0.36 }}>{initials}</span>;
}

function BDrawer({ drawer, ops, onClose }) {
  const [v, setV] = bS("");
  if (!drawer) return null;
  const { kind, item } = drawer;
  const title = kind === "email" ? item.subject : kind === "event" ? item.title : item.name;
  const read = () => { kind === "email" ? ops.readEmail(item.id) : ops.readMessage(item.id); onClose(); };
  const send = () => { kind === "email" ? ops.readEmail(item.id, "Svar sendt") : ops.readMessage(item.id, "Svar sendt"); onClose(); };
  return (
    <>
      <div className="b-scrim open" onClick={onClose} />
      <aside className="b-drawer open" onClick={e => e.stopPropagation()}>
        <div className="b-dh">
          <span className="b-dh-eb">{kind === "email" ? "GMAIL" : kind === "event" ? "GOOGLE KALENDER" : (item.source || "MELDING").toUpperCase()}</span>
          <button className="b-dx" onClick={onClose}><B.Icon name="x" size={16} /></button>
        </div>
        <div className="b-db">
          <h3>{title}</h3>
          {kind === "email" && <div className="b-db-meta">{item.name} · {item.from} · {item.when}</div>}
          {kind === "event" && <div className="b-db-meta">{item.allday ? "Hele dagen" : item.time} · {item.who}</div>}
          {kind === "msg" && <div className="b-db-meta">{item.source} · {item.when} · {item.unread} uleste</div>}
          <p className="b-db-body">{item.snippet || "Ingen forhåndsvisning."}</p>
          {item.loc && <div className="b-db-loc"><B.Icon name="map-pin" size={14} /> {item.loc}</div>}
          {(kind === "email" || kind === "msg") &&
            <div className="b-reply">
              <input value={v} onChange={e => setV(e.target.value)} placeholder={"Svar til " + item.name + "…"} onKeyDown={e => { if (e.key === "Enter") send(); }} />
              <button className="b-send" onClick={send}><B.Icon name="send" size={14} /></button>
            </div>}
        </div>
        <div className="b-df">
          {(kind === "email" || kind === "msg") && <button className="b-btn pri" onClick={read}><B.Icon name="check" size={15} /> Merk som lest</button>}
          <button className="b-btn" onClick={onClose}>Lukk</button>
        </div>
      </aside>
    </>
  );
}

function DirB() {
  const ops = B.useOpsState();
  const now = B.useClock();
  const { since, syncing } = B.useSyncTicker();
  const [q, setQ] = bS("");
  const [pf, setPf] = bS("alle");
  const [drawer, setDrawer] = bS(null);

  const ql = q.trim().toLowerCase();
  const match = (...s) => !ql || s.join(" ").toLowerCase().includes(ql);
  const emails = ops.emails.filter(e => (pf === "alle" || e.priority === pf) && match(e.subject, e.from, e.name, e.snippet));
  const messages = ops.messages.filter(m => match(m.name, m.source, m.snippet));
  const events = B.EVENTS.filter(e => match(e.title, e.who, e.source));
  const beeper = messages.filter(m => m.channel === "beeper");
  const imsg = messages.filter(m => m.channel === "imessage");

  const stats = [
    { k: "avtaler", lbl: "Avtaler i dag", v: ops.counts.avtaler },
    { k: "oppgaver", lbl: "Aktive oppgaver", v: ops.counts.oppgaver },
    { k: "ubesvarte", lbl: "Ubesvarte e-poster", v: ops.counts.ubesvarte, tone: "urgent" },
    { k: "uleste", lbl: "Uleste meldinger", v: ops.counts.uleste, tone: "lime" },
  ];

  return (
    <div className="b-root">
      {/* topbar */}
      <header className="b-top">
        <div className="b-brand"><img src="assets/logo-primary-on-light.svg" alt="ak" /><span className="b-wm">AgencyOS</span></div>
        <div className="b-greet"><span className="b-eb">{B.SCENE_DATE}</span><h1>God morgen, <em>Anders.</em></h1></div>
        <div className="b-tools">
          <div className="b-search"><B.Icon name="search" size={14} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Søk alle kilder…" />{q && <button onClick={() => setQ("")}><B.Icon name="x" size={12} /></button>}</div>
          <div className="b-live"><span className="b-time">{B.fmtHM(now)}</span><span className={"b-sync" + (syncing ? " on" : "")}><B.Icon name="refresh-cw" size={11} /> {syncing ? "synker" : since + "s"}</span></div>
        </div>
      </header>

      {/* stats rule */}
      <div className="b-stats">
        {stats.map(s => (
          <div key={s.k} className={"b-stat" + (s.tone ? " " + s.tone : "")}>
            <span className="b-stat-v">{B.useCountUp(s.v)}</span>
            <span className="b-stat-l">{s.lbl}</span>
          </div>
        ))}
      </div>

      {/* 4-col cockpit */}
      <div className="b-grid">
        {/* col 1 — kalender */}
        <section className="b-col">
          <div className="b-colh"><B.Icon name="calendar" size={14} /><span>Dagens kalender</span><span className="b-c">{ops.counts.avtaler}</span></div>
          <div className="b-list">
            {events.map(ev => (
              <button key={ev.id} className={"b-ev ax-" + (ev.axis || "none") + (ev.next ? " next" : "")} onClick={() => setDrawer({ kind: "event", item: ev })}>
                <div className="b-ev-top"><span className="b-ev-t">{ev.allday ? "Hele dagen" : ev.time}</span>{ev.next && <span className="b-next">NESTE</span>}</div>
                <div className="b-ev-title">{ev.title}</div>
                <div className="b-ev-who">{ev.who}</div>
                <div className="b-ev-meta"><span className="b-tagm">{ev.source}</span>{ev.loc && <span className="b-loc"><B.Icon name="map-pin" size={10} />{ev.loc.split(",")[0]}</span>}</div>
              </button>
            ))}
            {!ql && <div className="b-more">+{B.EVENTS_MORE} flere avtaler i dag</div>}
          </div>
        </section>

        {/* col 2 — gmail */}
        <section className="b-col">
          <div className="b-colh"><B.Icon name="mail" size={14} /><span>Gmail</span><span className="b-c alert">{ops.emails.length} ubesvart</span></div>
          <div className="b-chips">
            {[["alle", "Alle"], ["urgent", "Haster"], ["followup", "Følg opp"], ["open", "Ubesvart"]].map(([k, l]) => (
              <button key={k} className={"b-chip" + (pf === k ? " on" : "")} onClick={() => setPf(k)}>{l}</button>
            ))}
          </div>
          <div className="b-list">
            {emails.length === 0 && <div className="b-empty"><B.Icon name="check-check" size={20} /><span>Innboks tom.</span></div>}
            {emails.map(e => {
              const pr = B.PRIO[e.priority];
              return (
                <div key={e.id} className="b-mail" style={{ borderLeftColor: pr.color }} onClick={() => setDrawer({ kind: "email", item: e })}>
                  <div className="b-mail-top"><span className="b-mail-from">{e.name}</span><span className="b-pri" style={{ color: pr.color }}><B.Icon name={pr.icon} size={10} strokeWidth={2} />{pr.label}</span><span className="b-when">{e.when}</span></div>
                  <div className="b-mail-subj">{e.subject}</div>
                  <div className="b-mail-snip">{e.snippet}</div>
                  <div className="b-acts" onClick={ev => ev.stopPropagation()}>
                    <button className="b-act" onClick={() => ops.readEmail(e.id)}><B.Icon name="check" size={12} /> Les</button>
                    <button className="b-act" onClick={() => ops.readEmail(e.id, "Arkivert")}><B.Icon name="archive" size={12} /> Arkiver</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* col 3 — meldinger */}
        <section className="b-col">
          <div className="b-colh"><B.Icon name="message-square" size={14} /><span>Uleste meldinger</span><span className="b-c lime">{ops.counts.uleste}</span></div>
          <div className="b-list">
            <div className="b-grp">Beeper · {beeper.reduce((s, m) => s + m.unread, 0)}</div>
            {beeper.map(m => <BMsg key={m.id} m={m} ops={ops} setDrawer={setDrawer} />)}
            <div className="b-grp im">iMessage · {imsg.reduce((s, m) => s + m.unread, 0)}</div>
            {imsg.map(m => <BMsg key={m.id} m={m} ops={ops} setDrawer={setDrawer} />)}
          </div>
        </section>

        {/* col 4 — oppgaver + notion + tre */}
        <section className="b-col">
          <div className="b-colh"><B.Icon name="check-check" size={14} /><span>Oppgaver</span><span className="b-src">Notion ↗</span></div>
          <div className="b-list">
            <div className="b-grp">Forfaller i dag</div>
            {ops.tasks.map(t => (
              <button key={t.id} className={"b-task" + (t.done ? " done" : "")} onClick={() => ops.toggleTask(t.id)}>
                <span className="b-tchk">{t.done && <B.Icon name="check" size={11} strokeWidth={2.6} />}</span>
                <span><span className="b-task-t">{t.title}</span><span className="b-task-m"><span className={"b-prio " + t.prio}>{t.prio}</span><span className="b-tag">{t.tag}</span>{t.due}</span></span>
              </button>
            ))}
          </div>
          <div className="b-notion">
            <div className="b-colh sub"><B.Icon name="book-open" size={14} /><span>Notion-prosjekt</span></div>
            <div className="b-proj">{B.NOTION.project}</div>
            <div className="b-proj-meta"><span className="b-status">{B.NOTION.status}</span><span>{B.NOTION.sprint}</span></div>
            <div className="b-prog"><span style={{ width: B.NOTION.progress + "%" }} /></div>
            <div className="b-cols">{B.NOTION.columns.map(c => <div key={c.name} className="b-cc"><b>{c.count}</b><span>{c.name}</span></div>)}</div>
          </div>
          <div className="b-tre">
            <span className="b-tre-eb">Dagens tre · ikke-forhandlingsbart</span>
            {B.DAGENS_TRE.map(t => <span key={t.n} className="b-tre-row"><b>{t.n}</b><B.Icon name={t.icon} size={13} />{t.label}</span>)}
          </div>
        </section>
      </div>

      <BDrawer drawer={drawer} ops={ops} onClose={() => setDrawer(null)} />
      {ops.toast && <div className="b-toast"><B.Icon name="check" size={15} strokeWidth={2.4} /> {ops.toast}</div>}
    </div>
  );
}

function BMsg({ m, ops, setDrawer }) {
  return (
    <button className={"b-msg" + (m.fresh ? " fresh" : "")} onClick={() => setDrawer({ kind: "msg", item: m })}>
      <BAvatar initials={m.initials} tone={m.fresh ? "lime" : "neutral"} size={28} />
      <div className="b-msg-b">
        <div className="b-msg-top"><span className="b-msg-name">{m.name}</span>{m.unread > 1 && <span className="b-unread">{m.unread}</span>}<span className="b-when">{m.when}</span></div>
        <div className="b-msg-meta"><span className="b-src-chip">{m.source}</span></div>
        <div className="b-msg-snip">{m.snippet}</div>
      </div>
    </button>
  );
}

window.DirB = DirB;
