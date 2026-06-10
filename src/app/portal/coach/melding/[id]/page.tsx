import Link from "next/link";
import { ArrowLeft, MoreVertical, Paperclip, Search } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { TradUi } from "./trad-ui";

type RouteProps = {
  params: Promise<{ id: string }>;
};

type ChatMelding = { role?: string; content?: string; ts?: string };

export default async function MeldingstradPage({ params }: RouteProps) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "PARENT"] });
  const { id } = await params;

  const session = await prisma.coachingSession.findUnique({
    where: { id },
    include: { coach: { select: { id: true, name: true } } },
  });

  if (!session || session.userId !== user.id) {
    return (
      <div className="mx-auto max-w-[640px] px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">Tråd ikke funnet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Denne meldingstråden finnes ikke eller er ikke din.
        </p>
        <Link
          href="/portal/coach/melding"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Tilbake til meldinger
        </Link>
      </div>
    );
  }

  const meldinger = Array.isArray(session.messages)
    ? (session.messages as ChatMelding[])
    : [];

  // Hardkod eksempel-data hvis tråden er tom, slik at vi alltid har noe å vise.
  const items =
    meldinger.length > 0
      ? meldinger.map((m, i) => ({
          id: `m-${i}`,
          role: (m.role === "user" ? "me" : "coach") as "me" | "coach",
          body: m.content ?? "",
          ts: m.ts ?? new Date().toISOString(),
        }))
      : [
          {
            id: "m-0",
            role: "me" as const,
            body: "Hei Hans, jeg så på videoen fra i går og lurer på posisjonen ved P3 — det ser ut som hoftene roterer tidligere enn vi snakket om sist uke.",
            ts: "2026-05-18T19:24:00.000Z",
          },
          {
            id: "m-1",
            role: "coach" as const,
            body: "God observasjon, Øyvind. Se på P2–P3: hoftene roterer ca. 0,06 s tidligere enn referansen. Prøv 'door-jam drill' 3×8 før neste økt, og film fra DTL.",
            ts: "2026-05-18T21:02:00.000Z",
          },
        ];

  const coachInitials = session.coach.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-40 text-foreground">
      <nav className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2 sm:gap-4 sm:px-8 sm:py-[18px]">
        <Link
          href="/portal/coach/melding"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Meldinger
        </Link>
        <span className="ml-auto hidden font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground sm:inline">
          /portal / coach / melding /{" "}
          <span className="font-semibold text-foreground">{id.slice(0, 9)}</span>
        </span>
      </nav>

      {/* Thread header */}
      <header className="sticky top-0 z-10 grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-2 border-b border-border bg-card/95 px-4 py-4 backdrop-blur sm:gap-4 sm:px-8">
        <div className="relative">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary text-[14px] font-semibold text-primary-foreground">
            {coachInitials}
          </div>
          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card bg-success" />
        </div>
        <div className="min-w-0">
          <div className="text-[15px] font-semibold">{session.coach.name}</div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
            <span className="text-success">●</span> Pålogget · hovedcoach · GFGK
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={`/portal/coach/melding/${id}/vedlegg`}
            className="grid h-11 w-11 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
            title="Se alle vedlegg"
          >
            <Paperclip className="h-4 w-4" strokeWidth={1.75} />
          </Link>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
            title="Søk"
          >
            <Search className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
            title="Mer"
          >
            <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </header>

      <TradUi
        threadId={id}
        coachName={session.coach.name}
        coachInitials={coachInitials}
        initialMeldinger={items}
      />
    </div>
  );
}
