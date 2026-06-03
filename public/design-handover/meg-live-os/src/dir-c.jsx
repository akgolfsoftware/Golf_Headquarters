/* ============================================================
   Direction C — "Prioritetsfeed"
   Hybrid: dark forest kommando-header + lys, samlet inbox-zero-
   strøm sortert etter hastegrad. Dra for å reprioritere.
   Høyre kontekstskinne: dagens kalender + Notion + Dagens tre.
   ============================================================ */
const C = window.AK;
const { useState: cS, useRef: cR } = React;

const RANK = { urgent: 0, followup: 1, open: 2 };

function msgPrio(m) { return m.unread >= 3 ? "followup" : (m.channel === "imessage" ? "followup" : "open"); }

function CAvatar({ initials, tone, size = 32, icon }) {
  const t = tone === "primary" ? { bg: "var(--primary)", fg: "var(--accent)" } : tone === "lime" ? { bg: "var(--accent)", fg: "var(--primary)" } : { bg: "var(--secondary)", fg: "var(--foreground)" };
  return <span className="c-av" style={{ width: size, height: size, background: t.bg, color: t.fg, fontSize: size * 0.36 }}>{icon ? <C.Icon name={icon} size={Math.round(size * 0.5)} /> : initials}</span>;
}

function DirC() {
  const ops = C.useOpsState();
  const now = C.useClock();
  const { since, syncing } = C.useSyncTicker();
  const [q, setQ] = cS("");
  const [src, setSrc] = cS("alle");      // source filter
  const [order, setOrder] = cS(null);     // manual drag order (array of keys)
  const [drawer, setDrawer] = cS(null);
  const [dragKey, setDragKey] = cS(null);
  const [overKey, setOverKey] = cS(null);

  const kAvt = C.useCountUp(ops.counts.avtaler);
  const kOpp = C.useCountUp(ops.counts.oppgaver);
  const kUbe = C.useCountUp(ops.counts.ubesvarte);
  const kUle = C.useCountUp(ops.counts.uleste);

  // build unified feed
  let feed = [
    ...ops.emails.map(e => ({ key: "e:" + e.id, type: "email", id: e.id, src: "Gmail", srcKey: "gmail", priority: e.priority, who: e.name, title: e.subject, sub: e.snippet, when: e.when, initials: e.initials, item: e })),
    ...ops.messages.map(m => ({ key: "m:" + m.id, type: "msg", id: m.id, src: m.source, srcKey: m.channel, priority: msgPrio(m), who: m.name, title: m.snippet, sub: m.source + (m.unread > 1 ? " · " + m.unread + " uleste" : ""), when: m.when, initials: m.initials, item: m, fresh: m.fresh })),
    ...ops.tasks.map(t => ({ key: "t:" + t.id, type: "task", id: t.id, src: "Notion", srcKey: "notion", priority: t.prio === "P1" ? "urgent" : "followup", who: t.tag, title: t.title, sub: "Oppgave · forfaller " + t.due, when: t.due, initials: "", icon: "check-check", item: t })),
  ];
  const ql = q.trim().toLowerCase();
  feed = feed.filter(f => (src === "alle" || f.srcKey === src || (src === "beeper" && f.srcKey !== "imessage" && f.type === "msg" && f.item.channel === "beeper")) &&
    (!ql || (f.who + " " + f.title + " " + f.sub).toLowerCase().includes(ql)));
  // sort: manual order if present, else by priority rank then time
  if (order) {
    feed.sort((a, b) => {
      const ia = order.indexOf(a.key), ib = order.indexOf(b.key);
      if (ia === -1 && ib === -1) return RANK[a.priority] - RANK[b.priority];
      if (ia === -1) return 1; if (ib === -1) return -1; return ia - ib;
    });
  } else {
    feed.sort((a, b) => RANK[a.priority] - RANK[b.priority]);
  }

  const onDrop = (targetKey) => {
    if (!dragKey || dragKey === targetKey) { setDragKey(null); setOverKey(null); return; }
    const keys = feed.map(f => f.key);
    const from = keys.indexOf(dragKey), to = keys.indexOf(targetKey);
    keys.splice(to, 0, keys.splice(from, 1)[0]);
    setOrder(keys); setDragKey(null); setOverKey(null);
  };

  const srcs = [["alle", "Alle"], ["gmail", "Gmail"], ["beeper", "Beeper"], ["imessage", "iMessage"], ["notion", "Notion"]];
  const kpis = [["Avtaler", kAvt], ["Oppgaver", kOpp], ["Ubesvart", kUbe], ["Uleste", kUle]];

  return (
    <div className="c-root">
      {/* dark command header */}
      <header className="c-head dark">
        <div className="c-head-top">
          <div className="c-brand"><img src="assets/logo-white-on-green.svg" alt="ak" /><span className="c-wm">AgencyOS<b>· AK Golf Academy</b></span></div>
          <div className="c-search"><C.Icon name="search" size={15} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Søk på tvers av alle kilder…" />{q && <button onClick={() => setQ("")}><C.Icon name="x" size={13} /></button>}</div>
          <div className="c-clock"><span className="c-time">{C.fmtTime(now)}</span><span className={"c-sync" + (syncing ? " on" : "")}><C.Icon name="refresh-cw" size={11} /> {syncing ? "synker…" : "for " + since + " s siden"}</span></div>
        </div>
        <div className="c-head-mid">
          <h1>God morgen, <em>Anders.</em></h1>
          <div className="c-kpipills">
            {kpis.map(([l, v], i) => <span key={i} className={"c-pill" + (i === 2 ? " urg" : i === 3 ? " lime" : "")}><b>{v}</b>{l}</span>)}
          </div>
        </div>
      </header>

      <div className="c-body">
        {/* FEED */}
        <main className="c-feed">
          <div className="c-feedbar">
            <div className="c-filters">{srcs.map(([k, l]) => <button key={k} className={"c-filter" + (src === k ? " on" : "")} onClick={() => setSrc(k)}>{l}</button>)}</div>
            <span className="c-sortlbl"><C.Icon name="grip-vertical" size={12} /> Sortert: hastegrad · dra for å reprioritere</span>
          </div>
          <div className="c-stream">
            {feed.length === 0 && <div className="c-empty"><C.Icon name="check-check" size={26} /><span>Inbox zero. Alt er ryddet.</span></div>}
            {feed.map(f => {
              const pr = C.PRIO[f.priority];
              return (
                <div key={f.key}
                  className={"c-item" + (f.fresh ? " fresh" : "") + (overKey === f.key ? " over" : "") + (dragKey === f.key ? " dragging" : "")}
                  draggable
                  onDragStart={() => setDragKey(f.key)}
                  onDragOver={e => { e.preventDefault(); if (overKey !== f.key) setOverKey(f.key); }}
                  onDragEnd={() => { setDragKey(null); setOverKey(null); }}
                  onDrop={() => onDrop(f.key)}
                  onClick={() => f.type === "task" ? ops.toggleTask(f.id) : setDrawer({ kind: f.type === "email" ? "email" : "msg", item: f.item })}
                  style={{ "--pc": pr.color }}>
                  <span className="c-grip"><C.Icon name="grip-vertical" size={15} /></span>
                  <span className="c-rail" />
                  <CAvatar initials={f.initials} icon={f.icon} tone={f.fresh ? "lime" : f.priority === "urgent" ? "primary" : "neutral"} size={36} />
                  <div className="c-item-b">
                    <div className="c-item-top">
                      <span className="c-pri" style={{ color: pr.color, background: pr.bg }}><C.Icon name={pr.icon} size={10} strokeWidth={2} />{pr.label}</span>
                      <span className="c-who">{f.who}</span>
                      <span className="c-srctag">{f.src}</span>
                      {f.fresh && <span className="c-fresh">ny</span>}
                      <span className="c-when">{f.when}</span>
                    </div>
                    <div className="c-title">{f.title}</div>
                    <div className="c-sub">{f.sub}</div>
                  </div>
                  <div className="c-quick" onClick={e => e.stopPropagation()}>
                    {f.type === "task"
                      ? <button className="c-qa pri" onClick={() => ops.toggleTask(f.id)}><C.Icon name="check" size={13} /> Fullfør</button>
                      : <>
                        <button className="c-qa pri" onClick={() => { f.type === "email" ? ops.readEmail(f.id, "Svar sendt · " + f.who) : ops.readMessage(f.id, "Svar sendt · " + f.who); }}><C.Icon name="reply" size={13} /> Svar</button>
                        <button className="c-qa" onClick={() => f.type === "email" ? ops.readEmail(f.id) : ops.readMessage(f.id)}><C.Icon name="check" size={13} /></button>
                      </>}
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* context rail */}
        <aside className="c-rail-col">
          <section className="c-card">
            <div className="c-ch"><C.Icon name="calendar" size={14} /><span>Dagens kalender</span><span className="c-cc">{ops.counts.avtaler}</span></div>
            <div className="c-cal">
              {C.EVENTS.map(ev => (
                <div key={ev.id} className={"c-ev ax-" + (ev.axis || "none") + (ev.next ? " next" : "")}>
                  <span className="c-ev-t">{ev.allday ? "Hele dagen" : ev.time}</span>
                  <div className="c-ev-b"><div className="c-ev-h"><span className="c-ev-title">{ev.title}</span>{ev.next && <span className="c-next">NESTE</span>}</div><span className="c-ev-who">{ev.who}</span></div>
                </div>
              ))}
              <div className="c-more">+{C.EVENTS_MORE} flere i dag</div>
            </div>
          </section>

          <section className="c-card">
            <div className="c-ch"><C.Icon name="book-open" size={14} /><span>Notion-prosjekt</span></div>
            <div className="c-notion">
              <div className="c-proj">{C.NOTION.project}</div>
              <div className="c-proj-meta"><span className="c-status">{C.NOTION.status}</span><span>{C.NOTION.sprint}</span></div>
              <div className="c-prog"><span style={{ width: C.NOTION.progress + "%" }} /></div>
              <div className="c-cols">{C.NOTION.columns.map(c => <div key={c.name} className="c-colcard"><b>{c.count}</b><span>{c.name}</span></div>)}</div>
            </div>
          </section>

          <section className="c-tre">
            <span className="c-tre-eb">Dagens tre · ikke-forhandlingsbart</span>
            {C.DAGENS_TRE.map(t => <span key={t.n} className="c-tre-row"><b>{t.n}</b><C.Icon name={t.icon} size={13} />{t.label}</span>)}
          </section>
        </aside>
      </div>

      {drawer && <CDrawer drawer={drawer} ops={ops} onClose={() => setDrawer(null)} />}
      {ops.toast && <div className="c-toast"><C.Icon name="check" size={15} strokeWidth={2.4} /> {ops.toast}</div>}
    </div>
  );
}

function CDrawer({ drawer, ops, onClose }) {
  const [v, setV] = cS("");
  const { kind, item } = drawer;
  const title = kind === "email" ? item.subject : item.name;
  const send = () => { kind === "email" ? ops.readEmail(item.id, "Svar sendt") : ops.readMessage(item.id, "Svar sendt"); onClose(); };
  const read = () => { kind === "email" ? ops.readEmail(item.id) : ops.readMessage(item.id); onClose(); };
  return (
    <>
      <div className="c-scrim" onClick={onClose} />
      <aside className="c-drawer" onClick={e => e.stopPropagation()}>
        <div className="c-dh"><span className="c-dh-eb">{kind === "email" ? "GMAIL" : (item.source || "MELDING").toUpperCase()}</span><button className="c-dx" onClick={onClose}><C.Icon name="x" size={16} /></button></div>
        <div className="c-db">
          <h3>{title}</h3>
          <div className="c-db-meta">{kind === "email" ? item.name + " · " + item.from + " · " + item.when : item.source + " · " + item.when + " · " + item.unread + " uleste"}</div>
          <p className="c-db-body">{item.snippet}</p>
          <div className="c-reply"><input value={v} onChange={e => setV(e.target.value)} placeholder={"Svar til " + item.name + "…"} onKeyDown={e => { if (e.key === "Enter") send(); }} /><button onClick={send}><C.Icon name="send" size={14} /></button></div>
        </div>
        <div className="c-df"><button className="c-btn pri" onClick={read}><C.Icon name="check" size={15} /> Merk som lest</button><button className="c-btn" onClick={onClose}>Lukk</button></div>
      </aside>
    </>
  );
}

window.DirC = DirC;
