/**
 * /stats/sg-sammenlign/start — 2-stegs onboarding wizard (auth-protected)
 * Pixel-perfect port av design 08 fra design-handoff-stats-2026-05-25.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { startSammenligning } from "../actions";
import { SgStartSkjema, type RefSpiller } from "./skjema";
import "../../stats.css";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ feil?: string }>;
};

export default async function SgStartPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth/login?next=/stats/sg-sammenlign/start");
  }

  const refSpillere = await prisma.pgaPlayerSeason.findMany({
    where: {
      tour: "pga",
      sgTotal: { not: null },
      rounds: { gte: 20 },
    },
    orderBy: { sgTotal: "desc" },
    take: 100,
    select: {
      dgPlayerId: true,
      playerName: true,
      year: true,
      sgTotal: true,
      country: true,
    },
  });

  const spillereForUI: RefSpiller[] = refSpillere.map((r) => ({
    dgPlayerId: r.dgPlayerId,
    name: r.playerName,
    country: r.country,
    sgTotal: r.sgTotal!,
    year: r.year,
  }));

  const { feil } = await searchParams;

  return (
    <div className="bg-background text-foreground">
      {/* Top breadcrumb bar */}
      <div
        style={{
          padding: "12px 32px",
          borderBottom: "1px solid #E5E3DD",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          href="/stats/sg-sammenlign"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "hsl(var(--muted-foreground))",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          <ChevronLeft size={14} />
          Tilbake til SG-sammenligning
        </Link>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          AK GOLF STATS · SG-SAMMENLIGNING
        </span>
      </div>

      {/* Main wizard content */}
      <section
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "56px 32px 80px",
        }}
      >
        {spillereForUI.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: 64,
              border: "1px dashed #E5E3DD",
              borderRadius: 16,
            }}
          >
            <p style={{ color: "hsl(var(--muted-foreground))", fontSize: 15 }}>
              PGA Tour-data er ikke synket ennå. Prøv igjen om litt.
            </p>
          </div>
        ) : (
          <SgStartSkjema
            referanseSpillere={spillereForUI}
            action={startSammenligning}
            feil={feil}
          />
        )}
      </section>
    </div>
  );
}
