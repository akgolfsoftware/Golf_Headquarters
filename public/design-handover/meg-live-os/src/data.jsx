/* ============================================================
   AK Golf HQ — AgencyOS · live ops data + shared primitives
   Data lifted verbatim from Anders' inbox screenshots.
   Exports everything onto window.AK so each direction file can
   pull from the same source of truth.
   ============================================================ */
const { useState, useEffect, useRef, useCallback } = React;

/* ---------- Lucide stroke paths (1.5px, currentColor) ---------- */
const P = {
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  "message-square": '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  "message-circle": '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  "calendar-check": '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  "check-check": '<path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  "alert-triangle": '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  "corner-up-left": '<polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>',
  archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  "arrow-up-right": '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  "chevron-right": '<path d="m9 18 6-6-6-6"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
  "grip-vertical": '<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>',
  "refresh-cw": '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  "layout-dashboard": '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  "book-open": '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z"/>',
  "trending-up": '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  "map-pin": '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  circle: '<circle cx="12" cy="12" r="10"/>',
  filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  phone: '<path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.06 6.034z"/>',
  reply: '<polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/>',
  "external-link": '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  "server-cog": '<path d="M5 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1"/><path d="M5 14H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h7"/><circle cx="18" cy="18" r="3"/><path d="M18 14v1"/><path d="M18 21v1"/><path d="M22 18h-1"/><path d="M15 18h-1"/>',
  activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  "wifi-off": '<path d="M12 20h.01"/><path d="M8.5 16.42a5 5 0 0 1 7 0"/><path d="M5 12.86a10 10 0 0 1 5.17-2.7"/><path d="M19 12.86a10 10 0 0 0-3.32-2.21"/><path d="M2 8.82a15 15 0 0 1 4.17-2.65"/><path d="M22 8.82a15 15 0 0 0-11.28-3.8"/><path d="m2 2 20 20"/>',
};

function Icon({ name, size = 18, className = "", style = {}, strokeWidth = 1.5 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: "block", ...style }}
      dangerouslySetInnerHTML={{ __html: P[name] || "" }} />
  );
}

/* ---------- live clock + relative-time hooks ---------- */
function useClock(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), intervalMs); return () => clearInterval(t); }, [intervalMs]);
  return now;
}
const pad = n => String(n).padStart(2, "0");
const fmtTime = d => pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
const fmtHM = d => pad(d.getHours()) + ":" + pad(d.getMinutes());

/* relative "for X sek siden" since a sync timestamp that resets every ~50s */
function useSyncTicker() {
  const [since, setSince] = useState(0);
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      setSince(s => {
        if (s >= 48) { setPulse(true); setTimeout(() => setPulse(false), 1200); return 0; }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return { since, syncing: pulse };
}

/* count-up for KPI numbers */
function useCountUp(target, dur = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf, start, done = false;
    const tick = ts => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick); else done = true;
    };
    raf = requestAnimationFrame(tick);
    // guaranteed landing even if rAF is throttled (backgrounded tab/iframe)
    const fb = setTimeout(() => { if (!done) setV(target); }, dur + 250);
    return () => { cancelAnimationFrame(raf); clearTimeout(fb); };
  }, [target, dur]);
  return v;
}

/* ============================================================
   DATA — verbatim from screenshots
   ============================================================ */
const SCENE_DATE = "Onsdag 3. juni 2026";
const SCENE_GREETING = "God morgen, Anders";

// priority: "urgent" (haster) | "followup" (følg opp) | "open" (ubesvart)
const EMAILS = [
  { id: "e1", subject: "Velkommen til Veien til Golf hos GFGK (30–31 mai 2026)", from: "anders@akgolf.no", name: "Anders Kragerud", initials: "AK", priority: "urgent", label: "Viktig", when: "08:14", snippet: "Bekreft påmeldingene før helgen — to deltakere mangler betaling. Trenger romliste til klubben innen fredag.", read: false },
  { id: "e2", subject: "Svar: Lag – NM – status Jakob", from: "andreas@pointernorge.no", name: "Andreas P.", initials: "AP", priority: "urgent", label: "Viktig", when: "07:51", snippet: "Jakob er tatt ut, men vi mangler signatur på samtykkeskjema. Kan du ringe far i dag?", read: false },
  { id: "e3", subject: "[Action required] Provide information about Skillest", from: "notifications@stripe.com", name: "Stripe", initials: "ST", priority: "followup", label: "Følg opp", when: "06:32", snippet: "Additional information is required to keep payouts enabled for your Skillest connected account.", read: false },
];

// Beeper + iMessage. unread badge = ekstra uleste i tråden
const MESSAGES = [
  { id: "m1", name: "Rui Fu", channel: "beeper", source: "Instagram", unread: 1, when: "11:58", snippet: "Hey Anders! Loved the swing breakdown — do you coach remotely?", initials: "RF" },
  { id: "m2", name: "Charlie Hills", channel: "beeper", source: "Instagram", unread: 1, when: "11:40", snippet: "Sender deg en klipp fra runden i går, sjekk driver-planet 🙏", initials: "CH" },
  { id: "m3", name: "Alex Hormozi", channel: "beeper", source: "Instagram", unread: 1, when: "10:22", snippet: "Appreciate the follow — let's talk content collab.", initials: "AH" },
  { id: "m4", name: "Nils-Jørgen Olsen", channel: "beeper", source: "Instagram", unread: 5, when: "10:05", snippet: "Har du ledig time torsdag? Vil ha med sønnen min også.", initials: "NO" },
  { id: "m5", name: "Jan Petter Braathen", channel: "beeper", source: "Messenger", unread: 1, when: "09:47", snippet: "Takk for sist! Når åpner vinterbookingen?", initials: "JB" },
  { id: "m6", name: "Lars Gunnar With", channel: "beeper", source: "Messenger", unread: 1, when: "09:30", snippet: "Kan vi flytte fredagsøkta til lørdag?", initials: "LW" },
  { id: "m7", name: "Utdrikningslag – Jørn", channel: "beeper", source: "Messenger", unread: 5, when: "09:12", snippet: "12 stk, lørdag — har dere simulator-pakke?", initials: "UJ" },
  { id: "m8", name: "Geir Strand", channel: "beeper", source: "Messenger", unread: 2, when: "08:58", snippet: "Faktura mottatt, betaler i dag. Takk!", initials: "GS" },
  { id: "m9", name: "Håvard R. F. Johansen", channel: "beeper", source: "Messenger", unread: 1, when: "08:40", snippet: "Junior-gruppa — er det plass til én til?", initials: "HJ" },
  { id: "m10", name: "Filip Svendsen", channel: "beeper", source: "WhatsApp", unread: 2, when: "08:21", snippet: "På vei nå, 10 min forsinket til 14:00 — beklager!", initials: "FS" },
  { id: "m11", name: "golf-app", channel: "beeper", source: "Slack", unread: 1, when: "07:55", snippet: "Deploy #482 grønn. Notion-sync cron kjører kl 06:00.", initials: "GA" },
  { id: "m12", name: "Pernille (regnskap)", channel: "imessage", source: "iMessage", unread: 1, when: "08:02", snippet: "Sender MVA-oppgaven til signering i dag. Sjekk mail.", initials: "PE" },
  { id: "m13", name: "Anders Kristiansen", channel: "imessage", source: "iMessage", unread: 2, when: "07:36", snippet: "Sees på Gamle Fredrikstad 13:50. Tar med TrackMan.", initials: "AK" },
];

const TASKS = [
  { id: "t1", title: "Notion-sync v1.1 — OAuth + Prisma + cron", prio: "P1", tag: "Software", due: "Halvdag", done: false },
  { id: "t2", title: "PWA-setup — akgolf.no installerbar som mobil-app", prio: "P2", tag: "Software", due: "2 t", done: false },
];

const NOTION = {
  project: "akgolf.no — plattform v1",
  status: "Pågår",
  sprint: "Sprint 14 · uke 23",
  progress: 62,
  columns: [
    { name: "Backlog", count: 9 },
    { name: "Denne uka", count: 4 },
    { name: "Pågår", count: 2 },
    { name: "Review", count: 1 },
    { name: "Ferdig", count: 18 },
  ],
};

// "Hele dagen" + chronological. axis = pyramide-akse for fargekant.
const EVENTS = [
  { id: "ev0", time: "Hele dagen", allday: true, title: "Oskar Hammer — Arbeidsuke", who: "AK Golf Academy", source: "Internt", axis: "" },
  { id: "ev1", time: "14:00", title: "Filip Svendsen — Flex 50 minutter", who: "Gamle Fredrikstad GK · Anders Kristiansen", loc: "Torsnesveien 16, 1630 Gamle Fredrikstad", source: "Booking Acuity", axis: "slag", next: true },
  { id: "ev2", time: "14:00", title: "Dugnad Srixon tour", who: "Emilie", source: "AK Golf Academy", axis: "spill" },
  { id: "ev3", time: "15:00", title: "Fredrik Hovland Kjølberg — Flex 20 minutter", who: "Gamle Fredrikstad GK · Anders Kristiansen", loc: "Torsnesveien 16, 1630 Gamle Fredrikstad", source: "Booking Acuity", axis: "tek" },
  { id: "ev4", time: "22:30", title: "N2", who: "Karoline Sarpsborg", source: "AK Golf Academy", axis: "fys" },
];
const EVENTS_MORE = 9; // 14 avtaler totalt; 5 vist

const MODULES = [
  { key: "playerhq", label: "PlayerHQ", icon: "users", app: true },
  { key: "coachhq", label: "CoachHQ", icon: "shield", app: true },
  { key: "booking", label: "Booking", icon: "clock", app: true },
  { key: "marketing", label: "Marketing", icon: "globe", app: true },
  { key: "notion", label: "Notion", icon: "book-open", app: false },
  { key: "gmail", label: "Gmail", icon: "mail", app: false },
  { key: "kalender", label: "Kalender", icon: "calendar", app: false },
];

const DAGENS_TRE = [
  { n: "01", label: "Svare opp", icon: "corner-up-left" },
  { n: "02", label: "Følge opp", icon: "flag" },
  { n: "03", label: "Være tilstede", icon: "activity" },
];

// scripted live arrival to demo the "stream-in" feel (fires once per direction)
const INCOMING = { id: "live1", name: "Sofie Kvam", channel: "beeper", source: "Instagram", unread: 1, when: "nå", snippet: "Kan jeg booke en ekstra TrackMan-time før NM?", initials: "SK", fresh: true };

const PRIO = {
  urgent: { label: "Haster", color: "var(--destructive)", bg: "var(--destructive-tint-bg)", fg: "var(--destructive-foreground)", icon: "flame" },
  followup: { label: "Følg opp", color: "var(--warning-500)", bg: "var(--warning-tint-bg)", fg: "var(--warning-foreground)", icon: "flag" },
  open: { label: "Ubesvart", color: "var(--muted-foreground)", bg: "var(--secondary)", fg: "var(--muted-foreground)", icon: "circle" },
};

const clone = o => JSON.parse(JSON.stringify(o));

/* ============================================================
   useOpsState — per-direction independent live state
   ============================================================ */
function useOpsState({ stream = true } = {}) {
  const [emails, setEmails] = useState(() => clone(EMAILS));
  const [messages, setMessages] = useState(() => clone(MESSAGES));
  const [tasks, setTasks] = useState(() => clone(TASKS));
  const [toast, setToast] = useState(null);

  const flash = m => { setToast(m); };
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 1900); return () => clearTimeout(t); }, [toast]);

  // one scripted incoming message → stream-in + counter bump + pulse
  useEffect(() => {
    if (!stream) return;
    const t = setTimeout(() => {
      setMessages(m => (m.some(x => x.id === INCOMING.id) ? m : [{ ...INCOMING }, ...m]));
      flash("Ny melding · Sofie Kvam");
    }, 6500);
    return () => clearTimeout(t);
  }, [stream]);

  const readEmail = useCallback((id, verb = "Merket som lest") => { setEmails(es => es.filter(e => e.id !== id)); flash(verb); }, []);
  const readMessage = useCallback((id, verb = "Merket som lest") => { setMessages(ms => ms.filter(m => m.id !== id)); flash(verb); }, []);
  const toggleTask = useCallback(id => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t)), []);
  const reorderMessages = useCallback((from, to) => setMessages(ms => { const a = [...ms]; const [it] = a.splice(from, 1); a.splice(to, 0, it); return a; }), []);

  return {
    emails, messages, tasks, toast,
    counts: {
      avtaler: 14,
      oppgaver: tasks.filter(t => !t.done).length,
      ubesvarte: emails.length,
      uleste: messages.reduce((s, m) => s + (m.unread || 1), 0),
    },
    readEmail, readMessage, toggleTask, reorderMessages, flash,
  };
}

window.AK = {
  Icon, useClock, useSyncTicker, useCountUp, useOpsState,
  fmtTime, fmtHM, pad,
  EMAILS, MESSAGES, TASKS, NOTION, EVENTS, EVENTS_MORE, MODULES, DAGENS_TRE, PRIO,
  SCENE_DATE, SCENE_GREETING,
};
