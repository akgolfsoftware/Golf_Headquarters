import Link from "next/link";
import { ChevronLeft, Globe } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { SpraakToggle } from "./sprak-toggle";

export const dynamic = "force-dynamic";

export default async function SprakPage() {
  const user = await requirePortalUser();
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { preferences: true },
  });
  const prefs = lesPreferences(fullUser ?? { preferences: null });

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 pb-20 sm:px-6">
      <Link
        href="/portal/meg/innstillinger"
        className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft size={14} strokeWidth={1.5} />
        Tilbake til innstillinger
      </Link>

      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          <Globe size={11} strokeWidth={1.5} />
          PlayerHQ · Meg · Innstillinger · Språk
        </div>
        <h1 className="font-display text-[28px] sm:text-[36px] italic font-medium leading-[1.05] tracking-tight">
          <em className="font-normal italic">Språk og region</em>
        </h1>
        <p className="text-sm text-muted-foreground">
          Velg hvilket språk appen vises på. Tidssone og datoformat tilpasses
          automatisk.
        </p>
      </header>

      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <SpraakToggle initial={prefs.spraak} />
      </div>

      <div className="rounded-lg border border-dashed border-border bg-card/40 p-4 sm:p-6">
        <h2 className="font-display text-base font-semibold tracking-tight">
          Region og format
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Datoer, tidssone og tallformat følger valgt språk. Mer finmasket
          kontroll kommer Q3 2026.
        </p>
      </div>
    </div>
  );
}
