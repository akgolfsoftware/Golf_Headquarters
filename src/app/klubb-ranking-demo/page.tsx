/**
 * PILOT — Klubb-admin · Ranking
 * Bygd direkte fra wireframe/design-files-v2/screens/50-klubb-ranking.html
 * URL: /klubb-ranking-demo
 */

export default function KlubbRankingDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1280px] px-8 py-10">
        <div className="mb-5 flex items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              GFGK Klubb-portal · Ranking
            </div>
            <h1 className="mt-1 font-display text-[28px] font-semibold tracking-tight leading-[1.1]">
              NGF Junior Ranking · sesong 2026
            </h1>
            <p className="mt-2 max-w-[540px] text-[13px] leading-[1.5] text-muted-foreground">
              Oppdatert daglig 06:00. Poeng beregnes som rullerende sum av 8 beste resultater de siste 12
              mnd. Klubb-spillere fremhevet med lime-strek.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-md border border-border bg-transparent px-3 py-2 text-[12px] font-medium hover:bg-secondary">
              Last ned CSV
            </button>
            <button className="rounded-md border border-border bg-transparent px-3 py-2 text-[12px] font-medium hover:bg-secondary">
              Del lenke
            </button>
            <button className="rounded-md bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground">
              Sammenlign spillere
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Seg options={["U18", "U16", "U14", "U12", "Senior amatør"]} active={0} />
          <Seg options={["Alle", "Gutter", "Jenter"]} active={1} />
          <Pill k="Klubb" v="GFGK · 7 i ranking" />
          <Pill k="Region" v="Øst" />
          <Pill k="Tier" v="Tour + Q-school" />
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-5">
          <section className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="grid grid-cols-[56px_1fr_90px_90px_90px_110px_110px_90px] gap-2.5 border-b border-border bg-secondary px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              <span>Rank</span>
              <span>Spiller</span>
              <span className="text-right">Poeng</span>
              <span className="text-right">Snittscore</span>
              <span className="text-right">Cut %</span>
              <span>Form (5 siste)</span>
              <span className="text-center">Trend</span>
              <span className="text-right">Start</span>
            </div>
            <Row pos="1" delta="−" deltaTone="eq" initials="FK" name="Frida Kolstad" sub="Asker GK · 17 år · HCP +1,8" pts="2 418" ptsSub="+182 R2" avg="69,4" cut="94 %" form={["win:1", "top10:5", "top10:3", "top25:12", "top10:7"]} sparkLow={[40, 55]} sparkHigh={[70, 80, 88, 95, 100]} start="14" />
            <Row pos="2" delta="↑ 1" deltaTone="up" initials="VS" name="Vilde Stenersen" sub="Trondheim GK · 18 år · HCP +1,4" pts="2 217" ptsSub="+98 R2" avg="70,1" cut="91 %" form={["top10:2", "top10:8", "top25:15", "top10:4", "top10:6"]} sparkLow={[60, 70]} sparkHigh={[65, 75, 82, 88, 92]} start="16" />
            <Row pos="3" delta="↓ 1" deltaTone="dn" initials="SH" name="Solveig Haugen" sub="Hauger GK · 17 år · HCP +1,0" pts="2 104" ptsSub="+12 R2" avg="70,8" cut="88 %" form={["top25:18", "top10:9", "cut:CUT", "top25:22", "top10:7"]} sparkLow={[80, 88, 92, 75, 78, 70, 68]} sparkHigh={[]} start="18" />
            <Row club pos="14" delta="↑ 6" deltaTone="up" initials="MR" name="Markus Roinås Pedersen" club_em="GFGK" sub="16 år · HCP +2,4 · guttejunior" pts="1 548" ptsSub="+204 R2" avg="71,2" cut="86 %" form={["top10:4", "top25:21", "top25:14", "top10:8", "top10:6"]} sparkLow={[30, 42, 48]} sparkHigh={[60, 72, 80, 90]} start="15" />
            <Row club pos="28" delta="↑ 3" deltaTone="up" initials="EH" name="Eira Hopstad" club_em="GFGK" sub="15 år · HCP 2,8 · pikejunior" pts="812" ptsSub="+62 R2" avg="74,6" cut="71 %" form={["top25:24", "cut:CUT", "top25:18", "top25:15", "top25:22"]} sparkLow={[25, 30, 42, 38]} sparkHigh={[55, 62, 68]} start="12" />
            <Row club pos="42" delta="↓ 2" deltaTone="dn" initials="RJ" name="Ruth Johansen" club_em="GFGK" sub="14 år · HCP 4,1 · pikejunior" pts="514" ptsSub="−18 R2" avg="76,8" cut="58 %" form={["miss:MC", "top25:29", "cut:CUT", "top25:27", "cut:CUT"]} sparkLow={[50, 48, 55, 42, 38, 42, 35]} sparkHigh={[]} start="9" />
            <Row pos="58" delta="−" deltaTone="eq" initials="IK" name="Iben Kvam" sub="Stavanger GK · 16 år · HCP 3,2" pts="388" muted avg="75,9" cut="62 %" form={["top25:26", "top25:18", "cut:CUT", "top25:31", "top25:22"]} sparkLow={[40, 38, 42, 40, 38, 42, 40]} sparkHigh={[]} start="8" startMuted />
          </section>

          {/* Sidebar */}
          <div>
            <section className="mb-3 rounded-xl bg-[#0A1F17] p-5 text-[#F5F4EE]">
              <h5 className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[rgba(245,244,238,0.55)]">
                Klubb-snitt rank
              </h5>
              <div className="mt-1 font-display text-[28px] font-semibold tracking-tight">
                42<span className="ml-2 font-mono text-[12px] font-medium tracking-[0.02em] text-accent">↑ 8 sesong</span>
              </div>
              <p className="mt-2 text-[11px] leading-[1.5] text-[rgba(245,244,238,0.55)]">
                7 spillere i ranking · best plassering #14 (M. Pedersen). To spillere har klatret &gt;5
                plasser siden 01.04.
              </p>
            </section>

            <section className="mb-3 rounded-xl border border-border bg-card p-5">
              <h4 className="mb-3 font-display text-[13px] font-semibold tracking-tight">
                Spillere per kategori
              </h4>
              <div className="flex flex-col gap-2">
                <BcRow label="U18 J" pct={80} v="4" />
                <BcRow label="U18 G" pct={40} v="2" />
                <BcRow label="U16 J" pct={60} v="3" />
                <BcRow label="U16 G" pct={100} v="5" />
                <BcRow label="U14 J" pct={20} v="1" mut />
                <BcRow label="U14 G" pct={40} v="2" mut />
              </div>
            </section>

            <section className="mb-3 rounded-xl border border-border bg-card p-5">
              <h4 className="mb-3 font-display text-[13px] font-semibold tracking-tight">
                Konkurrenter · region øst
              </h4>
              <div className="flex flex-col gap-2 font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
                <CompRow club="Oslo GK" meta="9 spillere · snitt #38" delta="↑ 3" tone="up" />
                <CompRow club="GFGK" meta="7 spillere · snitt #42" delta="↑ 8" tone="up" highlight />
                <CompRow club="Asker GK" meta="11 spillere · snitt #44" delta="↓ 1" tone="dn" />
                <CompRow club="Hauger GK" meta="6 spillere · snitt #51" delta="−" tone="eq" />
                <CompRow club="Drøbak GK" meta="4 spillere · snitt #62" delta="↓ 4" tone="dn" />
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-5">
              <h4 className="mb-3 font-display text-[13px] font-semibold tracking-tight">
                Endringer siste 7 dgr
              </h4>
              <div className="flex flex-col gap-2 font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
                <div>· <b className="font-semibold text-foreground">M. Pedersen</b> ↑ 6 plasser → #14</div>
                <div>· <b className="font-semibold text-foreground">E. Hopstad</b> ↑ 3 plasser → #28</div>
                <div>· <b className="font-semibold text-foreground">R. Johansen</b> ↓ 2 plasser → #42</div>
                <div>· <b className="font-semibold text-foreground">T. Fjell</b> ↑ 4 plasser → #51 (G U18)</div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Seg({ options, active }: { options: string[]; active: number }) {
  return (
    <div className="flex overflow-hidden rounded-md border border-border bg-card">
      {options.map((o, i) => (
        <button
          key={o}
          className={`border-r border-border px-3 py-2 text-[12px] last:border-r-0 ${
            i === active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Pill({ k, v }: { k: string; v: string }) {
  return (
    <span className="rounded-md border border-border bg-card px-3 py-2 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
      {k}: <b className="font-semibold text-foreground">{v}</b>
    </span>
  );
}

function Row({
  pos,
  delta,
  deltaTone,
  initials,
  name,
  sub,
  club,
  club_em,
  pts,
  ptsSub,
  avg,
  cut,
  form,
  sparkLow,
  sparkHigh,
  start,
  startMuted,
  muted,
}: {
  pos: string;
  delta: string;
  deltaTone: "up" | "dn" | "eq";
  initials: string;
  name: string;
  sub: string;
  club?: boolean;
  club_em?: string;
  pts: string;
  ptsSub?: string;
  avg: string;
  cut: string;
  form: string[];
  sparkLow: number[];
  sparkHigh: number[];
  start: string;
  startMuted?: boolean;
  muted?: boolean;
}) {
  const dTone =
    deltaTone === "up"
      ? "text-[var(--status-success,#1A7D56)]"
      : deltaTone === "dn"
        ? "text-destructive"
        : "text-muted-foreground";
  const numClass = muted ? "text-muted-foreground" : "text-foreground";
  return (
    <div
      className={`grid grid-cols-[56px_1fr_90px_90px_90px_110px_110px_90px] items-center gap-2.5 border-b border-[var(--line-soft,#EFEDE6)] px-5 py-3 last:border-b-0 hover:bg-secondary ${
        club ? "bg-[rgba(209,248,67,0.06)]" : ""
      }`}
    >
      <div className="flex items-center gap-1.5 font-display text-[16px] font-semibold tracking-tight">
        {pos}
        <span className={`font-mono text-[10px] font-semibold tracking-[0.02em] ${dTone}`}>{delta}</span>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[rgba(0,88,64,0.06)] font-display text-[12px] font-semibold text-primary">
          {initials}
        </span>
        <div>
          <div className="text-[13px] font-medium leading-tight">
            {name}
            {club_em && <em className="ml-1.5 not-italic text-primary font-semibold">· {club_em}</em>}
          </div>
          <div className="mt-1 font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{sub}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-display text-[15px] font-semibold tracking-tight">{pts}</div>
        {ptsSub && <div className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">{ptsSub}</div>}
      </div>
      <div className={`text-right font-mono text-[13px] font-medium tracking-[0.02em] ${numClass}`}>{avg}</div>
      <div className={`text-right font-mono text-[13px] font-medium tracking-[0.02em] ${numClass}`}>{cut}</div>
      <div className="flex gap-1 font-mono text-[9px] font-bold tracking-[0.04em]">
        {form.map((f, i) => {
          const [tone, val] = f.split(":");
          const cls =
            tone === "win"
              ? "bg-[var(--status-success,#1A7D56)] text-white"
              : tone === "top10"
                ? "bg-primary text-white"
                : tone === "top25"
                  ? "bg-[rgba(0,88,64,0.10)] text-primary"
                  : tone === "miss"
                    ? "bg-[rgba(163,45,45,0.10)] text-[#7a3232]"
                    : tone === "cut"
                      ? "bg-[#FFF0D6] text-[#6F500B]"
                      : "bg-secondary text-muted-foreground";
          return (
            <span key={i} className={`rounded-sm px-1.5 py-0.5 ${cls}`}>
              {val}
            </span>
          );
        })}
      </div>
      <div className="flex h-[34px] items-end justify-center gap-0.5">
        {sparkLow.map((h, i) => (
          <span key={i} className="w-1 rounded-sm bg-border" style={{ height: `${h}%` }} />
        ))}
        {sparkHigh.map((h, i) => (
          <span key={i} className="w-1 rounded-sm bg-primary" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className={`text-right font-mono text-[13px] font-medium tracking-[0.02em] ${startMuted ? "text-muted-foreground" : "text-foreground"}`}>
        {start}
      </div>
    </div>
  );
}

function BcRow({ label, pct, v, mut }: { label: string; pct: number; v: string; mut?: boolean }) {
  return (
    <div className="grid grid-cols-[80px_1fr_36px] items-center gap-2 font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
      <span>{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full ${mut ? "bg-muted-foreground" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <b className="text-right font-semibold text-foreground">{v}</b>
    </div>
  );
}

function CompRow({ club, meta, delta, tone, highlight }: { club: string; meta: string; delta: string; tone: "up" | "dn" | "eq"; highlight?: boolean }) {
  const dTone =
    tone === "up"
      ? "text-[var(--status-success,#1A7D56)]"
      : tone === "dn"
        ? "text-destructive"
        : "text-muted-foreground";
  return (
    <div
      className={`flex justify-between rounded-md px-3 py-2 ${
        highlight ? "border border-[rgba(0,88,64,0.20)] bg-[rgba(0,88,64,0.06)]" : "bg-secondary"
      }`}
    >
      <span>
        <b className="block font-sans text-[12px] font-medium text-foreground">{club}</b>
        {meta}
      </span>
      <span className={`font-semibold ${dTone}`}>{delta}</span>
    </div>
  );
}
