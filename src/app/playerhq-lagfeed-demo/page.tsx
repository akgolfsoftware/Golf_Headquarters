/**
 * PlayerHQ — Lagfeed & sosial · klubb
 * Bygd fra wireframe/design-files-v2/screens/55-playerhq-lagfeed.html
 * URL: /playerhq-lagfeed-demo
 */

import { Heart, MessageCircle, Share2, Play, BarChart3, Film, Dumbbell, MapPin } from "lucide-react";

type FilterRow = { label: string; count?: number; active?: boolean };

const filters: FilterRow[] = [
  { label: "Alt", count: 42, active: true },
  { label: "Scores", count: 18 },
  { label: "Coach-klipp", count: 7 },
  { label: "Gratulasjoner", count: 9 },
  { label: "Arrangementer", count: 5 },
  { label: "Treningsklipp", count: 3 },
];

const teams: FilterRow[] = [
  { label: "U18 mix", count: 18, active: true },
  { label: "Damelag" },
  { label: "Herrelag" },
  { label: "Klubb · alle" },
];

const leaderboard = [
  { pos: "#1", name: "Frida Kolstad", sub: "Asker GK · U18 J", pts: "2 418", me: false },
  { pos: "#14", name: "Mathilde Bjerke", sub: "Bærum GK · U18 J", pts: "1 348", me: false },
  { pos: "#19", name: "Markus Roinås Pedersen", sub: "Du · U18 G", pts: "1 218", me: true },
  { pos: "#22", name: "Sondre Karlsen", sub: "Bærum GK · U18 G", pts: "1 124", me: false },
  { pos: "#28", name: "Eira Hopstad", sub: "Bærum GK · U18 J", pts: "812", me: false },
];

const events = [
  { day: "20", mon: "mai", title: "NM Q-school R1", sub: "Larvik GK · buss 07:30" },
  { day: "21", mon: "mai", title: "NM R2", sub: "Larvik · cut etter R2" },
  { day: "25", mon: "mai", title: "Klubbmesterskap final", sub: "Bærum · hjemme" },
  { day: "02", mon: "jun", title: "Asker Open U18", sub: "Asker GK" },
];

export default function PlayerHqLagfeedDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <header className="mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          PlayerHQ · Lagfeed
        </span>
        <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
          Hva skjer <em className="italic text-primary">på laget.</em>
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          U18 jenter + gutter · klubb GFGK · synlig kun for medlemmer.
        </p>
      </header>

      <div className="grid grid-cols-[240px_1fr_280px] items-start gap-5">
        {/* Sidebar filters */}
        <aside className="sticky top-0 flex flex-col gap-4 rounded-sm border border-border bg-card p-4">
          <FilterSection title="Filtre" items={filters} />
          <FilterSection title="Lag" items={teams} />
        </aside>

        {/* Feed */}
        <div>
          <Composer />

          {/* Post 1 — Eira score */}
          <Post
            avatar={{ initials: "EH", grad: "from-[#005840] to-[#1A7D56]" }}
            author="Eira Hopstad"
            role="Spiller"
            roleVariant="player"
            meta="U18 jenter · GFGK · for 2 timer siden"
            body={
              <>
                Ny rekord på hjemmebane i dag — <em className="not-italic font-medium text-primary">69 (−2)</em>. Kortspillet sitter endelig etter approach-blokken i april.
              </>
            }
            reactions={[
              { icon: Heart, count: "14", active: true },
              { icon: MessageCircle, count: "5 kommentarer" },
              { icon: Share2, count: "Del" },
            ]}
            footnote="Coach Anders + 11 til"
          >
            <div className="flex items-center gap-3.5 rounded-sm bg-gradient-to-br from-[#005840] to-[#0A3C2F] px-4 py-3.5 text-white">
              <div className="font-display text-[38px] font-medium leading-none tracking-tight">
                69<small className="ml-1.5 font-mono text-[11px] font-medium text-accent">−2</small>
              </div>
              <div className="flex-1 font-mono text-[11px] leading-relaxed text-white/65">
                Bærum GK · par 71 · gul tee
                <br />
                <b className="font-medium text-white">SG totalt +1,4</b> · pro-tier Live Tapper · 14. mai
              </div>
            </div>
          </Post>

          {/* Post 2 — Coach video */}
          <Post
            avatar={{ initials: "AK", grad: "from-[#7d5814] to-[#B8852A]" }}
            author="Anders Kristiansen"
            role="Coach"
            roleVariant="coach"
            meta="U18 · GFGK · for 4 timer siden"
            body={
              <>
                Markus — her er ditt approach-svingsklipp fra økten i går vs. uke 8. Se hvordan høyre albue holder seg lukket nå.{" "}
                <em className="not-italic font-medium text-primary">Følg progresjonen, fortsett samme rutine.</em>
              </>
            }
            reactions={[
              { icon: Heart, count: "8" },
              { icon: MessageCircle, count: "2 kommentarer" },
            ]}
            footnote="Privat · kun @markus.p"
          >
            <div className="relative grid aspect-video place-items-center overflow-hidden rounded-sm bg-gradient-to-br from-[#1A1916] to-[#3a3935]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_60%,rgba(225,206,123,0.18),transparent_70%)]" />
              <div className="relative z-10 grid h-14 w-14 place-items-center rounded-full bg-white/95 text-primary">
                <Play size={22} strokeWidth={1.5} fill="currentColor" />
              </div>
              <div className="absolute right-3 top-3 z-10 rounded-sm bg-white/12 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-white backdrop-blur">
                Til: @markus.p
              </div>
              <div className="absolute bottom-3 left-3 z-10 font-mono text-[11px] tracking-[0.04em] text-white">
                PIQ-klipp · 18 sek · <b className="font-semibold text-accent">side-by-side · uke 8 vs uke 19</b>
              </div>
            </div>
          </Post>

          {/* Post 3 — Live */}
          <Post
            avatar={{ initials: "SK", grad: "from-[#5e2b2b] to-[#B04444]" }}
            author="Sondre Karlsen"
            role="Spiller"
            roleVariant="player"
            meta="U18 · GFGK · i dag 14:42"
            body={
              <>
                Live fra Kongsberg Open R2 — leder klubb-feltet på <em className="not-italic font-medium text-primary">−2 etter 9 hull</em>. Føler det godt på greenene.
              </>
            }
            reactions={[
              { icon: Heart, count: "22 heier" },
              { icon: MessageCircle, count: "4" },
            ]}
            footnote="Live · oppdateres auto"
          >
            <div className="flex items-center gap-3.5 rounded-sm bg-[var(--surface-alt,#F1EEE5)] px-4 py-3.5">
              <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-sm bg-primary/10 font-display text-[16px] font-semibold text-primary">
                ●
              </div>
              <div className="flex-1">
                <b className="text-[13px] font-semibold">Kongsberg Open R2 · live</b>
                <div className="mt-1 font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
                  Følg leaderboard · neste oppdatering kl 16:00
                </div>
              </div>
            </div>
          </Post>
        </div>

        {/* Right rail */}
        <aside className="flex flex-col gap-4">
          <RightCard title="Klubb-leaderboard · sesong">
            {leaderboard.map((row) => (
              <div
                key={row.name}
                className="flex items-center gap-2.5 border-b border-border py-2 last:border-b-0 text-[12px]"
              >
                <span className={`w-5 text-center font-mono text-[11px] font-semibold ${row.me ? "text-primary" : "text-muted-foreground"}`}>
                  {row.pos}
                </span>
                <span className={`flex-1 ${row.me ? "font-semibold text-foreground" : "text-foreground"}`}>
                  {row.name}
                  <small className="mt-0.5 block font-mono text-[9px] text-muted-foreground">{row.sub}</small>
                </span>
                <span className="font-mono text-[11px] font-semibold tabular-nums">{row.pts}</span>
              </div>
            ))}
            <a className="mt-2 block text-center text-[11px] font-medium text-primary">Vis hele ranking</a>
          </RightCard>

          <RightCard title="Kommende">
            {events.map((e) => (
              <div key={e.title} className="mb-2 flex items-start gap-2.5 rounded-sm bg-[var(--surface-alt,#F1EEE5)] px-3 py-2 text-[12px] last:mb-0">
                <div className="flex h-8 w-8 flex-shrink-0 flex-col items-center justify-center rounded-sm border border-border bg-card font-mono leading-tight">
                  <b className="font-display text-[13px] font-semibold">{e.day}</b>
                  <small className="text-[8px] uppercase tracking-[0.06em] text-muted-foreground">{e.mon}</small>
                </div>
                <div className="flex-1">
                  <b className="text-[12px] font-semibold">{e.title}</b>
                  <small className="mt-0.5 block font-mono text-[10px] text-muted-foreground">{e.sub}</small>
                </div>
              </div>
            ))}
          </RightCard>
        </aside>
      </div>
    </div>
  );
}

function FilterSection({ title, items }: { title: string; items: FilterRow[] }) {
  return (
    <div>
      <h4 className="mb-2 font-display text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {title}
      </h4>
      <div className="flex flex-col gap-1">
        {items.map((i) => (
          <div
            key={i.label}
            className={`flex cursor-pointer items-center justify-between rounded-sm px-2.5 py-1.5 text-[13px] ${i.active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground"}`}
          >
            <span>{i.label}</span>
            {i.count !== undefined && (
              <small className="font-mono text-[10px] tracking-[0.04em]">{i.count}</small>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Composer() {
  return (
    <div className="mb-4 flex gap-3 rounded-sm border border-border bg-card p-4">
      <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#005840] to-[#1A7D56] font-display text-[13px] font-semibold text-white">
        MP
      </div>
      <div className="flex flex-1 flex-col gap-2.5">
        <div className="rounded-sm border border-border bg-[var(--surface-alt,#F1EEE5)] px-3.5 py-2.5 text-[13px] text-muted-foreground">
          Del en score, et klipp eller en treningsøkt med laget.
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            <TypeChip Icon={BarChart3} label="Score" active />
            <TypeChip Icon={Film} label="Klipp" />
            <TypeChip Icon={Dumbbell} label="Trening" />
            <TypeChip Icon={MapPin} label="Check-in" />
          </div>
          <button className="rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground">
            Publiser
          </button>
        </div>
      </div>
    </div>
  );
}

function TypeChip({
  Icon,
  label,
  active = false,
}: {
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-sm border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${active ? "border-primary/20 bg-primary/10 text-primary" : "border-border bg-[var(--surface-alt,#F1EEE5)] text-muted-foreground"}`}
    >
      <Icon size={12} strokeWidth={1.5} />
      {label}
    </div>
  );
}

type Reaction = {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; fill?: string }>;
  count: string;
  active?: boolean;
};

function Post({
  avatar,
  author,
  role,
  roleVariant,
  meta,
  body,
  children,
  reactions,
  footnote,
}: {
  avatar: { initials: string; grad: string };
  author: string;
  role: string;
  roleVariant: "player" | "coach";
  meta: string;
  body: React.ReactNode;
  children?: React.ReactNode;
  reactions: Reaction[];
  footnote: string;
}) {
  const roleStyle = roleVariant === "coach" ? "bg-[rgba(184,133,42,0.12)] text-[#7d5814]" : "bg-primary/10 text-primary";
  return (
    <article className="mb-4 flex flex-col gap-3 rounded-sm border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br ${avatar.grad} font-display text-[13px] font-semibold text-white`}>
          {avatar.initials}
        </div>
        <div className="flex-1 text-[13px] leading-tight">
          <b className="text-[14px] font-semibold">{author}</b>
          <span className={`ml-2 inline-block rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] ${roleStyle}`}>
            {role}
          </span>
          <small className="mt-1 block font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{meta}</small>
        </div>
      </div>
      <div className="text-[14px] leading-relaxed text-foreground">{body}</div>
      {children}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex gap-3.5">
          {reactions.map((r) => (
            <span
              key={r.count}
              className={`inline-flex items-center gap-1.5 font-mono text-[12px] font-medium tracking-[0.02em] ${r.active ? "text-primary" : "text-muted-foreground"}`}
            >
              <r.icon size={14} strokeWidth={1.5} fill={r.active ? "currentColor" : "none"} />
              {r.count}
            </span>
          ))}
        </div>
        <div className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">{footnote}</div>
      </div>
    </article>
  );
}

function RightCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border border-border bg-card p-4">
      <h4 className="mb-3 font-display text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {title}
      </h4>
      {children}
    </section>
  );
}
