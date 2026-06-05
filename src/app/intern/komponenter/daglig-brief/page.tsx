import {
  Users,
  MapPin,
  User,
  Layers,
  ClipboardCheck,
  Cloud,
  Check,
  ChevronDown,
  AlertTriangle,
  Hand,
  ZapOff,
  Plus,
  MessageSquare,
  CalendarPlus,
  Reply,
  Phone,
  TrendingUp,
  Minus,
  Activity,
  Clock,
  CalendarClock,
} from "lucide-react";

// Troskapstest — runde 35 "Daglig brief" portert fra design-preview til
// athletic-tokens. Mock-data matcher r35-dashboard.png (NÅ = onsdag 28. mai 11:24).
// Isolert demo-rute: ingen admin-sidebar, så rammen matcher preview-en.

type Axis = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

const axis: Record<Axis, { bar: string; pill: string }> = {
  FYS: { bar: "bg-pyr-fys", pill: "bg-pyr-fys-track text-success-foreground" },
  TEK: { bar: "bg-pyr-tek", pill: "bg-pyr-tek-track text-warning-foreground" },
  SLAG: { bar: "bg-pyr-slag", pill: "bg-pyr-slag-track text-info-foreground" },
  SPILL: { bar: "bg-pyr-spill", pill: "bg-pyr-spill-track text-primary" },
  TURN: { bar: "bg-pyr-turn", pill: "bg-pyr-turn-track text-destructive-foreground" },
};

const sessions = [
  {
    time: "09:00", dur: "60 m", ax: "TEK" as Axis, status: "done" as const,
    initials: "SK", avatar: "bg-secondary text-foreground", name: "Sofie K.",
    title: "Sekvens P4–P8 · balltreff",
    meta: [
      { icon: Users, text: "5 spillere" },
      { chip: "WANG", chipCls: "bg-secondary text-muted-foreground" },
      { icon: MapPin, text: "GFGK · matte 1–5" },
    ],
  },
  {
    time: "11:00", dur: "60 m", ax: "SLAG" as Axis, status: "active" as const,
    initials: "ØR", avatar: "bg-primary text-accent", name: "Øyvind Rohjan",
    title: "Innspill 50–80 m · presisjon",
    meta: [
      { icon: User, text: "1-til-1" },
      { icon: Layers, text: "4 drills · CS 80" },
      { icon: MapPin, text: "GFGK · TM 3" },
    ],
  },
  {
    time: "14:30", dur: "45 m", ax: "TEK" as Axis, status: "upcoming" as const,
    eta: "om 3 t 6 m", initials: "EB", avatar: "bg-secondary text-foreground",
    name: "Emilie B.", title: "Putt-konsistens 4 m · TEST",
    meta: [
      { icon: ClipboardCheck, text: "TEST-UKE" },
      { chip: "TEST", chipCls: "bg-pyr-slag-track text-info-foreground" },
      { icon: MapPin, text: "Indoor green" },
    ],
  },
  {
    time: "17:00", dur: "90 m", ax: "SPILL" as Axis, status: "upcoming" as const,
    eta: "om 5 t 36 m", initials: "KL", avatar: "bg-accent text-primary",
    name: "Karl Ludvig", title: "9-hulls spillsimulering",
    meta: [
      { icon: User, text: "1-til-1" },
      { icon: MapPin, text: "GFGK Old · hull 10–18" },
      { icon: Cloud, text: "9 °C" },
    ],
  },
];

const inbox = [
  { initials: "ØR", avatar: "bg-primary text-accent", name: "Øyvind Rohjan", type: "GODKJENN", typeCls: "bg-pyr-spill-track text-primary", preview: "Foreslår å bytte fre-økt til lørdag før Srixon Tour #2", when: "07:42", unread: true },
  { initials: "SK", avatar: "bg-secondary text-foreground", name: "Sofie K.", type: "FORESPØRSEL", typeCls: "bg-pyr-slag-track text-info-foreground", preview: "Kan jeg booke ekstra TrackMan-time tirsdag?", when: "06:18", unread: true },
  { initials: "KL", avatar: "bg-accent text-primary", name: "Karl Ludvig", type: "MELDING", typeCls: "bg-secondary text-muted-foreground", preview: "Sender video fra runden i går — ser noe på driveren", when: "i går 21:14", unread: true },
  { initials: "EB", avatar: "bg-secondary text-foreground", name: "Emilie B.", type: "MELDING", typeCls: "bg-secondary text-muted-foreground", preview: "Takk for økten — føles bra med ny gripp", when: "i går 18:02", unread: false },
  { initials: "JH", avatar: "bg-secondary text-foreground", name: "Jonas H.", type: "RÅD", typeCls: "bg-pyr-tek-track text-warning-foreground", preview: "Wedge-bytte før neste turnering — får ikke til vinkel", when: "i går 15:55", unread: false },
  { initials: "SY", avatar: "bg-secondary text-foreground", name: "Stiftelsen Y.", type: "MELDING", typeCls: "bg-secondary text-muted-foreground", preview: "Bekreftelse på reise-stipend Q3 — vedlegg", when: "i går 12:30", unread: false },
];

const tasks = [
  { label: "Send video-feedback til Øyvind (Innspill 50–80)", tag: "⌘1", done: true },
  { label: "Godkjenn Sofies plan-endring · uke 22", tag: "2 m", done: true },
  { label: "Bestille range-baller torsdag", tag: "5 m", done: true },
  { label: "Ring forelder til Karl L. (turneringspåmelding)", tag: "DAG", due: true },
  { label: "Klargjør Srixon Tour #2-orientering for fredag", tag: "FRE" },
];

const kpis = [
  { lbl: "AKTIVE SPILLERE", icon: Users, val: "38", delta: "+2 denne mnd.", deltaCls: "text-success", deltaIcon: TrendingUp },
  { lbl: "ØKTER I DAG", icon: CalendarClock, val: "4", delta: "1 fullført · 1 pågår · 2 igjen", deltaCls: "text-muted-foreground", deltaIcon: Minus },
  { lbl: "BOOKINGER · UKE 22", icon: Clock, val: "12", delta: "+3 vs uke 21", deltaCls: "text-success", deltaIcon: TrendingUp },
  { lbl: "TRENINGSTIMER · STALLEN", icon: Activity, val: "142", unit: "t", delta: "+18 t vs 30 d", deltaCls: "text-success", deltaIcon: TrendingUp },
];

function ColHead({ lbl, ct, ctAlert, filter }: { lbl: string; ct: string; ctAlert?: boolean; filter: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-3.5 py-3">
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">{lbl}</span>
      <span className={`font-mono text-[10px] font-bold tracking-[0.04em] ${ctAlert ? "text-destructive" : "text-muted-foreground"}`}>{ct}</span>
      <span className="ml-auto inline-flex h-[22px] cursor-pointer items-center gap-1 rounded-full bg-secondary px-2 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        {filter}<ChevronDown className="h-2.5 w-2.5" strokeWidth={1.5} />
      </span>
    </div>
  );
}

export default function R35BriefDemo() {
  return (
    <div className="min-h-screen bg-background px-8 py-10">
      <div className="mx-auto w-[1200px] max-w-full">
        {/* eyebrow */}
        <div className="mb-3.5 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          AgencyOS · daglig brief · 3-kolonne Bloomberg-tetthet
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* header */}
        <div className="mb-3 flex items-end justify-between">
          <h1 className="font-display text-[26px] font-bold leading-[1.1] tracking-[-0.02em] text-foreground">
            God formiddag, Andreas — <em className="font-normal italic text-primary">Øyvind er på range nå.</em>
          </h1>
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-accent [box-shadow:0_0_6px_rgba(209,248,67,0.7)]" />LIVE
            </span>
            ONSDAG 28 MAI · 11:24
          </div>
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-3 gap-3">

          {/* COL 1 — TIMELINE */}
          <div className="flex h-[720px] flex-col overflow-hidden rounded-[12px] border border-border bg-card">
            <ColHead lbl="DAGENS TIMELINE" ct="ONSDAG 28 MAI · 4 ØKTER" filter="ALLE" />
            <div className="flex-1 overflow-y-auto">
              <div className="relative px-3.5 pb-3.5 pt-2">
                {/* vertical rail */}
                <span className="pointer-events-none absolute bottom-3.5 left-[56px] top-[18px] w-px bg-border" />
                {sessions.map((s, i) => (
                  <div key={i}>
                    {/* NÅ-strek rett før første kommende økt */}
                    {s.status === "upcoming" && sessions.findIndex((x) => x.status === "upcoming") === i && (
                      <div className="relative my-1 h-0.5 bg-accent [box-shadow:0_0_8px_rgba(209,248,67,0.5)]">
                        <span className="absolute -top-1 left-[38px] h-2.5 w-2.5 rounded-full border-2 border-card bg-accent" />
                        <span className="absolute -top-2.5 right-0 rounded-full bg-accent px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-primary">NÅ · 11:24</span>
                      </div>
                    )}
                    <div className="relative grid grid-cols-[44px_1fr] items-start gap-x-4 py-2.5">
                      <div className={`font-mono text-xs font-extrabold leading-[1.2] tabular-nums ${s.status === "active" ? "text-primary" : s.status === "done" ? "text-muted-foreground" : "text-foreground"}`}>
                        {s.time}
                        <span className="mt-0.5 block font-mono text-[9px] font-semibold tracking-[0.04em] text-muted-foreground">{s.dur}</span>
                      </div>
                      <div className={`relative overflow-hidden rounded-lg border py-2 pl-3.5 pr-2.5 ${s.status === "active" ? "border-border bg-card ring-2 ring-accent" : "border-border bg-background"} ${s.status === "done" ? "opacity-[0.62]" : ""}`}>
                        <span className={`absolute bottom-2 left-0 top-2 w-[3px] rounded-full ${axis[s.ax].bar}`} />
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full font-display text-[9px] font-bold ${s.avatar}`}>{s.initials}</span>
                          <span className={`text-xs font-bold leading-[1.2] tracking-[-0.005em] text-foreground ${s.status === "done" ? "line-through decoration-border" : ""}`}>{s.name}</span>
                          {s.status === "done" && (
                            <span className="ml-auto inline-flex items-center gap-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-success">
                              <Check className="h-[11px] w-[11px]" strokeWidth={1.5} />FERDIG
                            </span>
                          )}
                          {s.status === "active" && (
                            <span className="ml-auto inline-flex items-center gap-1 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-primary">
                              <span className="h-[5px] w-[5px] rounded-full bg-accent [box-shadow:0_0_4px_rgba(209,248,67,0.7)]" />PÅGÅR
                            </span>
                          )}
                          <span className={`${s.status === "active" ? "ml-2" : s.status === "upcoming" ? "ml-auto" : "ml-2"} rounded-full px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] ${axis[s.ax].pill}`}>{s.ax}</span>
                        </div>
                        <div className="mt-1 text-xs leading-[1.3] tracking-[-0.005em] text-foreground">{s.title}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
                          {s.meta.map((m, j) =>
                            "chip" in m ? (
                              <span key={j} className={`inline-flex h-3.5 items-center rounded-[3px] px-[5px] font-mono text-[8px] font-extrabold uppercase tracking-[0.10em] ${m.chipCls}`}>{m.chip}</span>
                            ) : (
                              <span key={j} className="inline-flex items-center gap-1">
                                {m.icon && <m.icon className="h-2.5 w-2.5" strokeWidth={1.5} />}{m.text}
                              </span>
                            ),
                          )}
                        </div>
                        {s.status === "upcoming" && s.eta && (
                          <div className={`mt-0.5 font-mono text-[9px] font-bold tracking-[0.04em] ${sessions.findIndex((x) => x.status === "upcoming") === i ? "text-primary" : "text-muted-foreground"}`}>{s.eta}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COL 2 — INBOX + TASKS */}
          <div className="flex h-[720px] flex-col overflow-hidden rounded-[12px] border border-border bg-card">
            <ColHead lbl="INNBOKS" ct="3 ULESTE" ctAlert filter="ALLE" />
            <div className="flex-1 overflow-y-auto">
              <div className="px-3.5 pb-3.5 pt-1">
                <div className="flex items-center gap-2 px-2 pb-2.5 pt-1">
                  <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">SISTE 24 T</span>
                  <span className="font-mono text-[10px] font-bold text-muted-foreground">6</span>
                  <span className="ml-auto cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-primary">SE ALLE</span>
                </div>
                {inbox.map((m, i) => (
                  <div key={i} className={`relative grid grid-cols-[24px_1fr_auto] items-center gap-x-2.5 rounded-lg px-2 py-2.5 ${i > 0 ? "rounded-none border-t border-border" : ""}`}>
                    {m.unread && <span className="absolute left-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-destructive" />}
                    <span className={`inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-display text-[9px] font-bold ${m.avatar}`}>{m.initials}</span>
                    <div className="flex min-w-0 flex-col leading-[1.2]">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-[-0.005em] text-muted-foreground">
                        {m.name}
                        <span className={`rounded-[3px] px-[5px] py-px font-mono text-[8px] font-extrabold uppercase tracking-[0.12em] ${m.typeCls}`}>{m.type}</span>
                      </span>
                      <span className={`mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] tracking-[-0.005em] text-foreground ${m.unread ? "font-semibold" : ""}`}>{m.preview}</span>
                    </div>
                    <span className="flex-shrink-0 font-mono text-[10px] font-semibold tracking-[0.04em] text-muted-foreground">{m.when}</span>
                  </div>
                ))}
                {/* tasks */}
                <div className="mt-3.5 border-t border-border pt-3.5">
                  <div className="flex items-center gap-2 px-2 pb-2.5 pt-1">
                    <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">OPPGAVER</span>
                    <span className="font-mono text-[10px] font-bold text-muted-foreground">3 av 5 i dag</span>
                    <span className="ml-auto cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-primary">+ NY</span>
                  </div>
                  {tasks.map((t, i) => (
                    <div key={i} className="grid grid-cols-[18px_1fr_auto] items-center gap-x-2.5 rounded-md px-2 py-[7px]">
                      <span className={`inline-flex h-4 w-4 items-center justify-center rounded ${t.done ? "border-primary bg-primary text-accent" : "border-[1.5px] border-input bg-card text-transparent"}`}>
                        {t.done && <Check className="h-[11px] w-[11px]" strokeWidth={2.5} />}
                      </span>
                      <span className={`text-xs leading-[1.3] tracking-[-0.005em] ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{t.label}</span>
                      <span className={`font-mono text-[9px] font-bold uppercase tracking-[0.10em] ${t.due ? "text-destructive" : "text-muted-foreground"}`}>{t.tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* COL 3 — FOKUS-SPILLERE */}
          <div className="flex h-[720px] flex-col overflow-hidden rounded-[12px] border border-border bg-card">
            <ColHead lbl="TRENGER OPPMERKSOMHET" ct="3 SPILLERE" filter="AUTO" />
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-2.5 p-3.5">
                {/* Øyvind — alert */}
                <FocusCard
                  alert avatarCls="bg-primary text-accent" initials="ØR" name="Øyvind Rohjan"
                  meta="WANG · KONK · 12 DG TIL SRIXON #2"
                  signal={{ icon: AlertTriangle, text: "2 ØKTER BAK", cls: "bg-destructive/10 text-destructive" }}
                  reason={<>Taper <b className="font-bold">−0,42 SG i innspill</b>, men kun <em className="not-italic mx-0.5 rounded-[3px] bg-secondary px-1.5 py-px font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">2 av 6 t</em> SLAG-trening denne uka. Foreslå tilleggs-økt før helgen.</>}
                  actions={[{ icon: Plus, label: "Legg til økt", pri: true }, { icon: MessageSquare, label: "Melding" }, { icon: User, label: "Profil" }]}
                />
                {/* Sofie — lime */}
                <FocusCard
                  avatarCls="bg-secondary text-foreground" initials="SK" name="Sofie K."
                  meta="GFGK · MOSJONIST · 8 ØKTER 30 D"
                  signal={{ icon: Hand, text: "ØNSKER VEILEDNING", cls: "bg-accent text-primary" }}
                  reason={<>Spurt om hjelp med <b className="font-bold">nærspill 20–30 m</b>. Plan B-utkast venter. Kort 1-1 før gruppen i dag?</>}
                  actions={[{ icon: CalendarPlus, label: "Book 30 m", pri: true }, { icon: Reply, label: "Svar" }]}
                />
                {/* Jonas — alert/warn */}
                <FocusCard
                  alert avatarCls="bg-secondary text-foreground" initials="JH" name="Jonas H."
                  meta="GFGK · KONKURRANSE · INAKTIV"
                  signal={{ icon: ZapOff, text: "5 DG INAKTIV", cls: "bg-pyr-tek-track text-warning-foreground" }}
                  reason={<>Ingen registrerte økter siden <em className="not-italic mx-0.5 rounded-[3px] bg-secondary px-1.5 py-px font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">23. mai</em>. Ingen kommunikasjon. Sjekk inn.</>}
                  actions={[{ icon: Phone, label: "Ring", pri: true }, { icon: MessageSquare, label: "Melding" }, { icon: User, label: "Profil" }]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* KPI STRIP */}
        <div className="mt-4 grid grid-cols-4 gap-3">
          {kpis.map((k, i) => (
            <div key={i} className="relative flex flex-col gap-2.5 overflow-hidden rounded-[12px] border border-border bg-card px-[18px] py-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{k.lbl}</span>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                  <k.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                </span>
              </div>
              <div className="font-mono text-[34px] font-bold leading-none tracking-[-0.02em] tabular-nums text-foreground">
                {k.val}{k.unit && <span className="ml-1 text-base font-bold text-muted-foreground">{k.unit}</span>}
              </div>
              <div className={`inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-[0.04em] ${k.deltaCls}`}>
                <k.deltaIcon className="h-[11px] w-[11px]" strokeWidth={1.5} />{k.delta}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FocusCard({
  alert, avatarCls, initials, name, meta, signal, reason, actions,
}: {
  alert?: boolean;
  avatarCls: string;
  initials: string;
  name: string;
  meta: string;
  signal: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; text: string; cls: string };
  reason: React.ReactNode;
  actions: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string; pri?: boolean }[];
}) {
  return (
    <div className={`overflow-hidden rounded-[12px] border bg-card ${alert ? "border-destructive/30 [background:linear-gradient(180deg,rgba(163,45,45,0.04),transparent_40%)]" : "border-border"}`}>
      <div className="grid grid-cols-[44px_1fr_auto] items-center gap-x-3 p-3">
        <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full font-display text-sm font-bold ${avatarCls}`}>{initials}</span>
        <div>
          <div className="font-display text-[15px] font-bold leading-[1.1] tracking-[-0.015em] text-foreground">{name}</div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">{meta}</div>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] ${signal.cls}`}>
          <signal.icon className="h-[11px] w-[11px]" strokeWidth={1.5} />{signal.text}
        </span>
      </div>
      <div className="px-3 pb-2.5 text-xs leading-[1.45] tracking-[-0.005em] text-foreground">{reason}</div>
      <div className="flex gap-1.5 px-3 pb-3">
        {actions.map((a, i) => (
          <button key={i} className={`inline-flex h-[30px] items-center gap-1.5 rounded-lg px-2.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] ${a.pri ? "border border-primary bg-primary text-accent" : "border border-border bg-card text-foreground"}`}>
            <a.icon className="h-[11px] w-[11px]" strokeWidth={1.5} />{a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
