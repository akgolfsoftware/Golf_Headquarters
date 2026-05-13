import {
  Bell,
  Calendar,
  ClipboardList,
  Info,
  MessageSquare,
  Trophy,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { MarkAllReadButton } from "./mark-all-read-button";
import { NotificationItem } from "./notification-item";

const IKON: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  booking: Calendar,
  plan: ClipboardList,
  achievement: Trophy,
  melding: MessageSquare,
  system: Info,
};

export default async function VarslerPage() {
  const user = await requirePortalUser();

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const ulestAntall = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="PlayerHQ · Varsler"
        titleLead="Alle"
        titleItalic="varsler"
        sub={
          ulestAntall > 0
            ? `${ulestAntall} ulest · klikk for å gå til kilden.`
            : "Alt er lest. Bra jobba."
        }
        actions={ulestAntall > 0 ? <MarkAllReadButton /> : undefined}
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          titleItalic="Ingen varsler"
          titleTrail="ennå"
          sub="Vi sier fra her når noe skjer — booking-bekreftelser, plan-oppdateringer, milepæler."
        />
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => {
            const Icon = IKON[n.type] ?? Info;
            return (
              <NotificationItem
                key={n.id}
                id={n.id}
                type={n.type}
                title={n.title}
                body={n.body}
                link={n.link}
                readAt={n.readAt}
                createdAt={n.createdAt}
                IconName={n.type}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}
