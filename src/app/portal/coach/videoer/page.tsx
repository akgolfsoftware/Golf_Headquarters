/**
 * PlayerHQ Coach Videoer (/portal/coach/videoer) — hybrid-design 2026-06-17.
 *
 * Videokort med forest-gradient header, lime play-ikon, mono-meta.
 * Matcher fasit B5 · Innhold (Videoer-fane). Data-henting uendret.
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerVideoCard } from "./player-video-card";

export const dynamic = "force-dynamic";

export default async function VideoerPage() {
  const user = await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN"],
  });

  const videos = await prisma.sessionVideo.findMany({
    where: { playerId: user.id, status: "READY" },
    include: { coach: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-[430px] pb-24 pt-2 md:max-w-[860px] md:pb-8">

      {/* Tilbake */}
      <div className="mb-3 px-4 md:px-0">
        <Link
          href="/portal/coach"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Coach
        </Link>
      </div>

      {/* Header */}
      <div className="mb-4 px-4 md:px-0">
        <h1 className="font-display text-[20px] font-bold leading-[1.06] tracking-[-0.02em] text-foreground">
          Videoer fra
          <em className="font-medium italic text-primary"> Anders</em>
        </h1>
      </div>

      {/* Liste */}
      {videos.length === 0 ? (
        <div className="mx-3 rounded-xl border border-dashed border-border bg-card p-8 text-center md:mx-0">
          {/* Forest-gradient placeholder — tomt state */}
          <div
            className="relative mx-auto mb-4 flex h-[60px] w-[60px] items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(150deg,#2f5a2c,#0a2417)" }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <polygon points="5 3 19 12 5 21 5 3" fill="#D1F843" />
            </svg>
          </div>
          <p className="font-display text-[15px] font-semibold text-foreground">
            Ingen videoer ennå
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Coachen din kan dele swing-analyser, drill-demo og kamp-feedback her.
          </p>
        </div>
      ) : (
        <div className="px-3 md:px-0">
          <ul className="flex flex-col gap-2.5">
            {videos.map((v) => (
              <PlayerVideoCard
                key={v.id}
                id={v.id}
                title={v.title}
                tag={v.tag}
                notes={v.notes}
                createdAt={v.createdAt}
                coachName={v.coach.name}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
