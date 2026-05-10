import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { OnskeligOktForm } from "./form";

type Search = { sent?: string };

export default async function OnskeligOktPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requirePortalUser();
  const params = await searchParams;

  const coacher = await prisma.user.findMany({
    where: { role: "COACH" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <Link
        href="/portal"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Hjem
      </Link>

      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Forespørsel
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Be om</em> en ekstra økt
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Si fra hva du vil jobbe med — coachen din ser forespørselen i CoachHQ
          og setter opp en tid som passer.
        </p>
      </header>

      {params.sent === "1" && (
        <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
          Forespørsel sendt. Du får varsel når coachen har satt opp en tid.
        </div>
      )}

      <OnskeligOktForm coacher={coacher} />
    </div>
  );
}
