/**
 * CoachHQ — Innboks (samle-side).
 *
 * Slår sammen Oppfølgingskø, Godkjennelser og Meldinger til én side med tabs.
 * Dyperutene /admin/queue, /admin/approvals og /admin/messages er beholdt for
 * direktelenker, men sidemeny-linkene peker hit.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";
import { TabStrip } from "@/components/admin/tab-strip";
import QueuePage from "@/app/admin/queue/page";
import ApprovalsPage from "@/app/admin/approvals/page";
import MessagesPage from "@/app/admin/messages/page";

type TabKey = "oppfolging" | "godkjennelser" | "meldinger";

const TABS = [
  { key: "oppfolging", label: "Oppfølging" },
  { key: "godkjennelser", label: "Godkjennelser" },
  { key: "meldinger", label: "Meldinger" },
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
    params.tab === "godkjennelser" || params.tab === "meldinger"
      ? params.tab
      : "oppfolging";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · Produktivitet"
        titleLead="Din"
        titleItalic="innboks"
        sub="Oppfølging, godkjennelser og meldinger samlet på ett sted."
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
      </div>
    </div>
  );
}
