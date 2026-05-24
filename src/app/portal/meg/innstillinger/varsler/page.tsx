import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { NotifToggles } from "../notif-toggles";

export const dynamic = "force-dynamic";

export default async function VarslerPage() {
  const user = await requirePortalUser();
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { preferences: true },
  });
  const prefs = lesPreferences(fullUser ?? { preferences: null });

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <Link
        href="/portal/meg/innstillinger"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft size={14} strokeWidth={1.5} />
        Tilbake til innstillinger
      </Link>

      <header className="space-y-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          PlayerHQ · Meg · Innstillinger · Varsler
        </span>
        <h1 className="font-display text-[28px] sm:text-[36px] italic font-medium leading-[1.05] tracking-tight">
          <em className="font-normal italic">Varsler</em>
        </h1>
        <p className="text-sm text-muted-foreground">
          Velg hvilke varsler du vil ha og hvordan de leveres. Endringer lagres
          automatisk.
        </p>
      </header>

      <div className="rounded-lg border border-border bg-card p-6">
        <NotifToggles initial={prefs} />
      </div>
    </div>
  );
}
