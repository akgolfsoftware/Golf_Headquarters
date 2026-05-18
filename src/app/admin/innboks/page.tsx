/**
 * CoachHQ — Innboks (samle-side).
 *
 * Slår sammen Oppfølgingskø, Godkjennelser, Meldinger og Turneringer til én
 * side med tabs. Dyperutene /admin/queue, /admin/approvals, /admin/messages og
 * /admin/tournaments er beholdt for direktelenker.
 */

import Link from "next/link";
import { Trophy } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { TabStrip } from "@/components/admin/tab-strip";
import { EmptyState } from "@/components/shared/empty-state";
import { avatarBg, initialsFromName } from "@/lib/avatar-colors";
import { PriorityPill } from "@/components/coachhq/tournament-enroll-modal";
import QueuePage from "@/app/admin/queue/page";
import ApprovalsPage from "@/app/admin/approvals/page";
import MessagesPage from "@/app/admin/messages/page";

type TabKey = "oppfolging" | "godkjennelser" | "meldinger" | "turneringer";

const TABS = [
  { key: "oppfolging", label: "Oppfølging" },
  { key: "godkjennelser", label: "Godkjennelser" },
  { key: "meldinger", label: "Meldinger" },
  { key: "turneringer", label: "Turneringer" },
];

type Search = {
  tab?: string;
  thread?: string;
  filter?: string;
};

export default async function InnboksPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;
  const tab: TabKey =
    params.tab === "godkjennelser" ||
    params.tab === "meldinger" ||
    params.tab === "turneringer"
      ? params.tab
      : "oppfolging";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · Produktivitet"
        titleLead="Din"
        titleItalic="innboks"
        sub="Oppfølging, godkjennelser, meldinger og turneringer samlet på ett sted."
      />
      <TabStrip basePath="/admin/innboks" tabs={TABS} active={tab} />
      <div>
        {tab === "oppfolging" && <QueuePage />}
        {tab === "godkjennelser" && <ApprovalsPage />}
        {tab === "meldinger" && (
          <MessagesPage
            searchParams={Promise.resolve({
              thread: params.thread,
              filter: params.filter,
            })}
          />
        )}
        {tab === "turneringer" && <TurneringerTab />}
      </div>
    </div>
  );
}

async function TurneringerTab() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const tretti = new Date(now);
  tretti.setDate(tretti.getDate() + 30);

  const entries = await prisma.tournamentEntry.findMany({
    where: {
      tournamentId: { not: null },
      tournament: { startDate: { gte: now, lt: tretti } },
    },
    include: {
      user: { select: { id: true, name: true } },
      tournament: { select: { id: true, name: true, startDate: true } },
    },
    orderBy: { tournament: { startDate: "asc" } },
  });

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        titleItalic="Ingen kommende"
        titleTrail="påmeldinger"
        sub="Når du melder på spillere via /admin/tournaments vises de her med dato og prioritet."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <ul className="divide-y divide-border">
        {entries.map((e) => {
          const navn = e.user.name ?? "?";
          return (
            <li key={e.id}>
              <Link
                href={`/admin/tournaments/${e.tournament?.id ?? ""}`}
                className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-secondary/40"
              >
                <div className="w-14 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                  {e.tournament?.startDate.toLocaleDateString("nb-NO", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-mono text-[11px] font-semibold text-white"
                  style={{ background: avatarBg(navn) }}
                >
                  {initialsFromName(navn)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-foreground">
                    {navn}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {e.tournament?.name ?? "—"}
                  </div>
                </div>
                <PriorityPill priority={e.priority} />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
