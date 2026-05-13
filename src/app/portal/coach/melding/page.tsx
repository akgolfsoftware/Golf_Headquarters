import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { MeldingForm } from "./form";

export default async function CoachMeldingPage() {
  const user = await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN", "PARENT"],
  });

  if (user.tier === "GRATIS") {
    return (
      <div className="mx-auto max-w-[860px] space-y-6 px-6 py-8">
        <div className="space-y-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            PlayerHQ · Coach
          </span>
          <h1 className="font-display text-3xl font-semibold italic leading-tight -tracking-[0.01em]">
            Krever <em className="italic font-medium text-primary">Pro</em>
          </h1>
          <p className="text-sm text-muted-foreground">
            Direkte coach-meldinger er en del av Pro-abonnementet.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <Link
            href="/portal/meg/abonnement"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Oppgrader til Pro
            <ArrowUpRight size={14} strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    );
  }

  const coacher = await prisma.user.findMany({
    where: { role: "COACH" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const hovedcoach = coacher[0];
  const fornavn = hovedcoach?.name.split(" ")[0] ?? "coach";
  const initialer = hovedcoach
    ? hovedcoach.name
        .split(" ")
        .map((d) => d[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "CO";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[860px] px-6 py-8">
        <header className="mb-7 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Link
              href="/portal/coach"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Tilbake
            </Link>
            <div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                PlayerHQ · Ny melding
              </span>
              <h1 className="mt-1 font-display text-[24px] font-semibold italic leading-tight -tracking-[0.01em]">
                Ny melding{" "}
                <em className="font-medium italic">til {fornavn}</em>
              </h1>
            </div>
          </div>
          {hovedcoach && (
            <div className="flex items-center gap-3 rounded-full border border-border bg-card px-3 py-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                {initialer}
              </div>
              <div className="text-[12.5px] leading-tight">
                <div className="font-semibold">{hovedcoach.name}</div>
                <div className="font-mono text-[11px] text-muted-foreground">
                  {/* TODO: hent reell svartid og online-status */}
                  Hovedcoach
                </div>
              </div>
            </div>
          )}
        </header>

        <MeldingForm coacher={coacher} />
      </div>
    </div>
  );
}
