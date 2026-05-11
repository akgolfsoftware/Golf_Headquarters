/**
 * PILOT — CoachHQ Meldinger · foreldre-tråd
 * Bygd direkte fra wireframe/design-files-v2/04-meldinger.html
 * URL: /meldinger-demo
 *
 * Mock-data. Bytt til Prisma-henting senere.
 */

import {
  Search,
  Phone,
  MoreVertical,
  Image as ImageIcon,
  Sparkles,
  Check,
  Pencil,
  Paperclip,
  Calendar,
  Clock,
  Send,
  ArrowUpRight,
} from "lucide-react";

type Thread = {
  initials: string;
  name: string;
  role: string;
  time: string;
  preview: string;
  pills?: { label: string; tone?: "warning" | "success" }[];
  unread?: boolean;
  active?: boolean;
  fromMe?: boolean;
};

const THREADS: Thread[] = [
  {
    initials: "LT",
    name: "Lise Tangen",
    role: "mor til Maja",
    time: "14:21",
    preview:
      "Hei Anders — Maja har hatt vondt i høyre handledd siden onsdag. Bør hun stå over slagøkta på lørdag?",
    pills: [
      { label: "skade", tone: "warning" },
      { label: "@deg" },
    ],
    unread: true,
    active: true,
  },
  {
    initials: "PF",
    name: "Per Fjellstad",
    role: "far til Henrik",
    time: "13:48",
    preview: "Sender bilde av baghen — bør han bytte til light shaft?",
    pills: [{ label: "utstyr" }],
    unread: true,
  },
  {
    initials: "SB",
    name: "Sondre Berg",
    role: "elev",
    time: "12:30",
    preview: "Tok 78 på Bossum i dag — føler putteren er på plass!",
    pills: [{ label: "score", tone: "success" }],
    unread: true,
  },
  {
    initials: "EK",
    name: "Eline Krogh",
    role: "elev",
    time: "11:14",
    preview: "Du: «Bra plan for neste uke. Husk å logge søvn-app-data før mandag.»",
    fromMe: true,
  },
  {
    initials: "JT",
    name: "Jakob Tønsberg",
    role: "junior · 14",
    time: "i går",
    preview: "Pappa lurer på om jeg kan flytte mandag-økta til onsdag pga skole-tur",
    pills: [{ label: "booking" }],
  },
  {
    initials: "MR",
    name: "Markus Roinås P.",
    role: "elev",
    time: "i går",
    preview: "Du: «Send meg video av ny launch — vi går gjennom i morgen.»",
    fromMe: true,
  },
  {
    initials: "AK",
    name: "Astrid Kvam",
    role: "senior",
    time: "man",
    preview: "Du: «Hyggelig økt i dag, Astrid. Husk å puste på adressen.»",
    fromMe: true,
  },
  {
    initials: "LS",
    name: "Linn Solem",
    role: "mor til Eline",
    time: "man",
    preview: "Takk for fin oppfølging før KM. Hun er så møtt opp av deg.",
    pills: [{ label: "positiv", tone: "success" }],
  },
  {
    initials: "MP",
    name: "Mathias Pedersen",
    role: "elev",
    time: "søn",
    preview: "Du: «Strålende, Mathias — vinn KM neste helg.»",
    fromMe: true,
  },
];

export default function MeldingerDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className="grid min-h-[880px]"
        style={{ gridTemplateColumns: "320px 1fr 360px", height: "calc(100vh - 16px)" }}
      >
        {/* Inbox */}
        <section className="flex flex-col overflow-hidden border-r border-border bg-card">
          <div className="border-b border-border px-5 pb-4 pt-6">
            <h2 className="mb-3 font-display text-[22px] font-semibold leading-tight tracking-tight">
              Meldinger
            </h2>
            <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-secondary px-3 text-[13px] text-muted-foreground">
              <Search className="h-4 w-4" />
              <span>Søk navn, tråd, tag …</span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">⌘K</span>
            </div>
          </div>
          <div className="flex gap-1 border-b border-border px-5 py-3">
            <FilterBtn active>
              Alle <span className="ml-1 font-mono text-[10px] opacity-70">14</span>
            </FilterBtn>
            <FilterBtn>
              Ulest <span className="ml-1 font-mono text-[10px] opacity-70">3</span>
            </FilterBtn>
            <FilterBtn>
              Foreldre <span className="ml-1 font-mono text-[10px] opacity-70">8</span>
            </FilterBtn>
            <FilterBtn>
              @meg <span className="ml-1 font-mono text-[10px] opacity-70">2</span>
            </FilterBtn>
          </div>
          <div className="flex-1 overflow-y-auto">
            {THREADS.map((t, i) => (
              <ThreadItem key={i} thread={t} />
            ))}
          </div>
        </section>

        {/* Conversation */}
        <section className="flex min-w-0 flex-col bg-background">
          {/* Conv head */}
          <div className="flex items-center gap-3.5 border-b border-border bg-card px-7 py-4">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-muted font-display text-[16px] font-semibold">
              LT
            </span>
            <div className="flex-1">
              <div className="font-display text-[17px] font-semibold leading-tight tracking-tight">
                Lise Tangen{" "}
                <span className="text-[13px] font-normal text-muted-foreground">· mor til Maja Tangen</span>
              </div>
              <div className="mt-0.5 text-[12px] text-muted-foreground">
                Aktiv nylig · Foreldre · <span className="text-[var(--color-pyr-tek,#1A7D56)]">●</span> online
              </div>
            </div>
            <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
              <Phone className="h-4 w-4" />
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border bg-card px-7">
            <TabBtn active>Samtale</TabBtn>
            <TabBtn>Notater</TabBtn>
            <TabBtn>
              Filer <span className="ml-1 font-mono text-[10px] text-muted-foreground">4</span>
            </TabBtn>
            <TabBtn>Bookinger</TabBtn>
          </div>

          {/* Stream */}
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-7 py-6">
            <DaySep>Onsdag · 13. mai</DaySep>

            <Msg
              initials="LT"
              name="Lise Tangen"
              time="14:21"
              body="Hei Anders — Maja har hatt vondt i høyre handledd siden onsdag etter trening. Vi har is på, men hun klager fortsatt. Bør hun stå over slagøkta på lørdag, eller er det noe annet vi bør gjøre?"
            />

            {/* Image attach */}
            <div className="grid max-w-[680px] grid-cols-[36px_1fr] gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-muted font-display text-[12px] font-semibold">
                LT
              </span>
              <div>
                <div className="inline-flex items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 py-2 text-[12px]">
                  <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>IMG_4421.jpg · 1,2 MB</span>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">14:22</div>
              </div>
            </div>

            {/* AI Draft */}
            <div className="ml-auto w-full max-w-[680px] rounded-2xl border border-border bg-accent/15 p-5">
              <div className="mb-2.5 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                AI-utkast — basert på Maja sin journal og din skrivestil
                <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold text-accent-foreground">
                  stil: din · ●
                </span>
              </div>
              <div className="mb-3 border-l-2 border-border pl-3 text-[12px] italic leading-relaxed text-muted-foreground">
                «… vondt i høyre handledd siden onsdag … bør hun stå over slagøkta på lørdag?»
              </div>
              <div className="whitespace-pre-wrap rounded-md border border-border bg-card px-3.5 py-3 text-[13.5px] leading-relaxed">
                {`Hei Lise,

Takk for at du sier fra. Handledd-smerter etter slag-intensive økter ser jeg av og til, spesielt i denne aldersgruppen.

Jeg vil anbefale at Maja står over slag-delen på lørdag, men hun kan godt være med på putting og chipping — det belaster ikke handleddet på samme måte. Jeg har lagt opp en alternativ økt i kalenderen hennes.

Hvis det fortsatt er vondt etter helga, anbefaler jeg en kort time hos Stein (fysio på AK) — jeg kan reservere onsdag 16:00 hvis det passer?

Hilsen Anders`}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Knob on>tone: varm</Knob>
                <Knob>tone: direkte</Knob>
                <Knob>tone: kort</Knob>
                <Knob on>foreslå fysio</Knob>
                <Knob on>alternativ økt</Knob>
                <Knob>be om bilde</Knob>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
                  <Check className="h-3.5 w-3.5" />
                  Send som er
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
                  <Pencil className="h-3.5 w-3.5" />
                  Rediger
                </button>
                <button className="inline-flex items-center rounded-md px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary">
                  Regenerer
                </button>
                <button className="inline-flex items-center rounded-md px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary">
                  Forkast
                </button>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                  basert på 47 tidligere svar · 0,3 s
                </span>
              </div>
            </div>

            <DaySep>I dag · 14. mai</DaySep>

            <MeMsg
              name="Du · Anders"
              time="09:08"
              body="Hei Lise! Sender oppdatert plan til Maja i ettermiddag. Tar en kjapp kikk på videoen fra trening først."
            />

            <Msg
              initials="LT"
              name="Lise Tangen"
              time="09:14"
              body="Takk Anders, ingen hast — bare hvis du har tid før helgen. Hun gleder seg uansett til KM neste uke."
            />
          </div>

          {/* Composer */}
          <div className="border-t border-border bg-card px-7 py-5">
            <div className="rounded-2xl border border-border bg-background px-3.5 py-3">
              <div className="text-[14px] leading-relaxed text-muted-foreground">
                Skriv et svar … <span className="text-muted-foreground/70">/</span>{" "}
                <span className="font-mono text-[11px] text-muted-foreground">snarvei</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
                  <Paperclip className="h-4 w-4" />
                </button>
                <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-secondary">
                  <ImageIcon className="h-4 w-4" />
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary">
                  <Calendar className="h-3.5 w-3.5" />
                  Plan
                </button>
                <button className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI-utkast
                </button>
                <span className="flex-1" />
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Utkast lagret · 14:23
                </span>
                <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
                  Send
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right context panel */}
        <aside className="flex flex-col gap-5 overflow-y-auto border-l border-border bg-secondary/50 px-6 py-6">
          {/* Student card */}
          <div className="rounded-lg border border-border bg-card px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-muted font-display text-[18px] font-semibold">
                MT
              </span>
              <div>
                <div className="font-display text-[16px] font-semibold tracking-tight">Maja Tangen</div>
                <div className="text-[12px] text-muted-foreground">12 år · GFGK Junior · HCP 16,4</div>
              </div>
            </div>
            <div className="mt-3.5">
              <StatRow k="Coach" v="Anders K." />
              <StatRow k="Adherence · 30d" v="94 %" tone="success" />
              <StatRow k="Skade-historikk" v="2 episoder" tone="warning" />
              <StatRow k="Foreldre-godkjenning" v="aktiv" tone="success" />
              <StatRow k="Neste økt" v="lør 10:00" />
            </div>
            <button className="mt-3.5 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
              Åpne profil
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Timeline */}
          <div className="rounded-lg border border-border bg-card px-5 py-4">
            <h3 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Siste interaksjoner
            </h3>
            <div className="relative pl-5">
              <span className="absolute bottom-1 left-1 top-1 w-px bg-border" />
              <TlItem when="i dag · 14:21" now>
                <b className="font-semibold">Lise (mor)</b> sender melding om handledd
              </TlItem>
              <TlItem when="onsdag · 17:30">
                <b className="font-semibold">Slagøkt</b> Studio 2 · 60 min · ble forkortet
              </TlItem>
              <TlItem when="tirsdag · 16:00">
                <b className="font-semibold">Plan oppdatert</b> · +2 putting-økter
              </TlItem>
              <TlItem when="mandag · 15:00">
                <b className="font-semibold">FYS-økt</b> hjemme · 45 min · loggført
              </TlItem>
              <TlItem when="forrige uke">
                <b className="font-semibold">Strokes Gained</b> oppdatert · +0,4
              </TlItem>
            </div>
          </div>

          {/* Suggested shortcuts */}
          <div className="rounded-lg border border-border bg-card px-5 py-4">
            <h3 className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Foreslåtte snarveier
            </h3>
            <div className="flex flex-col gap-2">
              <Shortcut icon={<Calendar className="h-3.5 w-3.5" />}>Reserver fysio · ons 16:00</Shortcut>
              <Shortcut icon={<Pencil className="h-3.5 w-3.5" />}>Lag alt-økt · putting/chipping</Shortcut>
              <Shortcut icon={<Check className="h-3.5 w-3.5" />}>Marker skade-episode</Shortcut>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ThreadItem({ thread }: { thread: Thread }) {
  return (
    <div
      className={`relative grid cursor-pointer grid-cols-[36px_1fr] gap-3 border-b border-border px-5 py-3.5 hover:bg-secondary ${
        thread.active ? "bg-secondary shadow-[inset_3px_0_0_var(--color-primary)]" : ""
      }`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-muted font-display text-[12px] font-semibold">
        {thread.initials}
      </span>
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className={`truncate text-[14px] tracking-tight ${
              thread.unread ? "font-bold" : "font-semibold"
            }`}
          >
            {thread.name}{" "}
            <span className="font-normal text-muted-foreground">· {thread.role}</span>
          </span>
          <span className="font-mono text-[10.5px] text-muted-foreground">{thread.time}</span>
        </div>
        <div
          className={`mt-0.5 line-clamp-2 text-[12.5px] leading-snug ${
            thread.unread ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {thread.preview}
        </div>
        {thread.pills && (
          <div className="mt-1.5 flex gap-1">
            {thread.pills.map((p, i) => (
              <span
                key={i}
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  p.tone === "warning"
                    ? "bg-[#FFF0D6] text-[var(--color-pyr-spill,#B8852A)]"
                    : p.tone === "success"
                      ? "bg-[#E5F1EA] text-[var(--color-pyr-tek,#1A7D56)]"
                      : "bg-secondary text-muted-foreground"
                }`}
              >
                {p.label}
              </span>
            ))}
          </div>
        )}
      </div>
      {thread.unread && (
        <span className="absolute right-4 top-4 h-1.5 w-1.5 rounded-full bg-primary" />
      )}
    </div>
  );
}

function FilterBtn({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <button
      className={`flex-1 rounded-md py-1.5 text-[12px] font-medium transition-colors ${
        active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}

function TabBtn({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <button
      className={`border-b-2 px-4 py-3 text-[13px] font-medium transition-colors ${
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function DaySep({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-2 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
      {children}
    </div>
  );
}

function Msg({
  initials,
  name,
  time,
  body,
}: {
  initials: string;
  name: string;
  time: string;
  body: string;
}) {
  return (
    <div className="grid max-w-[680px] grid-cols-[36px_1fr] gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-muted font-display text-[12px] font-semibold">
        {initials}
      </span>
      <div>
        <div className="mb-1 flex items-baseline gap-2 text-[11px] text-muted-foreground">
          <span className="text-[12.5px] font-semibold text-foreground">{name}</span>
          <span>{time}</span>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-[13.5px] leading-relaxed">
          {body}
        </div>
      </div>
    </div>
  );
}

function MeMsg({ name, time, body }: { name: string; time: string; body: string }) {
  return (
    <div className="grid max-w-[680px] grid-cols-[1fr_36px] justify-self-end gap-3">
      <div>
        <div className="mb-1 flex items-baseline justify-end gap-2 text-[11px] text-muted-foreground">
          <span className="text-[12.5px] font-semibold text-foreground">{name}</span>
          <span>{time}</span>
        </div>
        <div className="rounded-2xl bg-foreground px-4 py-3 text-[13.5px] leading-relaxed text-background">
          {body}
        </div>
      </div>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary font-display text-[12px] font-semibold text-primary-foreground">
        AK
      </span>
    </div>
  );
}

function Knob({ on, children }: { on?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] ${
        on
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function StatRow({ k, v, tone }: { k: string; v: string; tone?: "success" | "warning" }) {
  return (
    <div className="flex justify-between border-t border-border py-2 text-[13px] first:border-t-0">
      <span className="text-muted-foreground">{k}</span>
      <span
        className={`font-medium ${
          tone === "success"
            ? "text-[var(--color-pyr-tek,#1A7D56)]"
            : tone === "warning"
              ? "text-[var(--color-pyr-spill,#B8852A)]"
              : "text-foreground"
        }`}
      >
        {v}
      </span>
    </div>
  );
}

function TlItem({
  when,
  now,
  children,
}: {
  when: string;
  now?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative py-1.5 text-[12.5px]">
      <span
        className={`absolute -left-[18px] top-3 grid h-2 w-2 place-items-center rounded-full border-2 ${
          now ? "border-primary bg-primary" : "border-muted-foreground bg-card"
        }`}
      />
      <span className="block font-mono text-[10.5px] text-muted-foreground">{when}</span>
      <span className="text-foreground">{children}</span>
    </div>
  );
}

function Shortcut({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center justify-start gap-2 rounded-md border border-border bg-card px-3 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
      {icon}
      {children}
    </button>
  );
}
