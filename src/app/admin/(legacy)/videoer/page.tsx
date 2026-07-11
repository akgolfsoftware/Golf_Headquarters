import { Video } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { VideoUploadForm } from "./video-upload-form";
import { VideoCard } from "./video-card";

export default async function VideoerPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [spillere, videos] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PLAYER" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.sessionVideo.findMany({
      where: user.role === "ADMIN" ? {} : { coachId: user.id },
      include: {
        player: { select: { id: true, name: true } },
        coach: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const totalBytes = videos.reduce((s, v) => s + Number(v.sizeBytes ?? 0), 0);
  const totalGb = totalBytes / 1024 / 1024 / 1024;
  const naa = new Date();
  const syvDagerSiden = new Date(naa);
  syvDagerSiden.setDate(syvDagerSiden.getDate() - 7);
  const sisteUke = videos.filter((v) => v.createdAt >= syvDagerSiden).length;
  const uniqueSpillere = new Set(videos.map((v) => v.player.id)).size;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AgencyOS · Coaching-videoer"
        titleLead="Last opp og"
        titleItalic="del"
        titleTrail="med spillerne"
        sub={`${videos.length} videoer totalt. Maks 500 MB per video — mp4, mov eller webm.`}
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          label="Videoer totalt"
          value={String(videos.length)}
          sub="opplastet"
        />
        <Kpi label="Siste 7 dgr" value={String(sisteUke)} sub="nye opplastinger" />
        <Kpi
          label="Unike spillere"
          value={String(uniqueSpillere)}
          sub="har mottatt video"
        />
        <Kpi
          label="Lagring"
          value={`${totalGb.toFixed(1)} GB`}
          sub="totalt brukt"
        />
      </div>

      <VideoUploadForm spillere={spillere} />

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
          Opplastede <em className="font-normal italic text-primary">videoer</em>
        </h2>

        {videos.length === 0 ? (
          <EmptyState
            icon={Video}
            titleItalic="Ingen videoer"
            titleTrail="ennå"
            sub="Bruk skjemaet over for å laste opp første video."
          />
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <VideoCard
                key={v.id}
                id={v.id}
                title={v.title}
                tag={v.tag}
                status={v.status}
                createdAt={v.createdAt}
                playerName={v.player.name}
                playerId={v.player.id}
                coachName={v.coach.name}
                sizeBytes={v.sizeBytes}
                canDelete={user.role === "ADMIN" || v.coach.name === user.name}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-[28px] font-medium leading-none tabular-nums text-foreground">
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}
