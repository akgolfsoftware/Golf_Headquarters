/**
 * AgencyOS — Rapporter (SYSTEM · RAPPORTER), /admin/reports.
 *
 * Port av fasit `agencyos-app/screens-analyze.jsx` → ReportsScreen (mørkt
 * tema, desktop 1280): PageHead («Seks rapporter.» + «Ny rapport») og
 * 3-kolonners grid av rapport-tiles (ikon + navn + CTA + meta).
 *
 * Datakilder: tile-lista er fasit-statisk, men telleverdiene i meta er ekte
 * (prisma-counts: spillere, fullførte økter, sesongår). CSV-tilene peker på
 * de EKTE eksport-endepunktene /api/admin/reports/[type] («Generer →»);
 * rapporter uten generator lenker til riktig analyse-flate («Åpne →») —
 * aldri liksom-generering.
 */

import Link from "next/link";
import {
  Banknote,
  CalendarCheck,
  Plus,
  TrendingUp,
  Trophy,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgPage, AgPageHead, agBtnClass } from "@/components/admin/agencyos/ui";

export const dynamic = "force-dynamic";

type Tile = {
  icon: LucideIcon;
  navn: string;
  meta: string;
  cta: string;
  href: string;
  /** true = CSV-endepunkt (vanlig <a>), false = intern flate (<Link>). */
  nedlasting: boolean;
};

export default async function RapporterPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [spillere, okter] = await Promise.all([
    prisma.user.count({ where: { role: "PLAYER", deletedAt: null } }),
    prisma.trainingPlanSession.count({ where: { status: "COMPLETED" } }),
  ]);

  const sesong = new Date().getFullYear();

  const tiles: Tile[] = [
    {
      icon: User,
      navn: "Spiller-rapport",
      meta: `PDF · ${spillere} spillere`,
      cta: "Generer →",
      href: "/api/admin/reports/spillere.csv",
      nedlasting: true,
    },
    {
      icon: Users,
      navn: "Gruppe-rapport",
      meta: "Lag-snitt + utvikling",
      cta: "Åpne →",
      href: "/admin/lag-snitt",
      nedlasting: false,
    },
    {
      icon: TrendingUp,
      navn: "Utviklingsrapport",
      meta: "Kvartalsvis · stall",
      cta: "Åpne →",
      href: "/admin/analyse",
      nedlasting: false,
    },
    {
      icon: Banknote,
      navn: "Omsetning & MRR",
      meta: "Faktura-oversikt",
      cta: "Generer →",
      href: "/api/admin/reports/abonnement.csv",
      nedlasting: true,
    },
    {
      icon: CalendarCheck,
      navn: "Aktivitetslogg",
      meta: `${okter} økter + oppmøte`,
      cta: "Generer →",
      href: "/api/admin/reports/okter.csv",
      nedlasting: true,
    },
    {
      icon: Trophy,
      navn: "Turneringsresultater",
      meta: `Sesong ${sesong}`,
      cta: "Åpne →",
      href: "/admin/tournaments",
      nedlasting: false,
    },
  ];

  const tileClass =
    "flex flex-col gap-[10px] rounded-xl border border-border bg-card p-4 text-left transition-[border-color,box-shadow] hover:border-primary hover:shadow-sm";

  return (
    <AgPage>
      <AgPageHead
        eyebrow="System · Rapporter"
        title="Seks"
        italic="rapporter."
        lead="Generer rapporter for spillere, foreldre, klubb eller forbund. Eksport til PDF."
        actions={
          <Link href="/admin/reports" className={agBtnClass("primary")}>
            <Plus size={16} strokeWidth={1.5} /> Ny rapport
          </Link>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        {tiles.map((t) => {
          const Ikon = t.icon;
          const innhold = (
            <>
              <span className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-secondary text-primary">
                <Ikon size={20} strokeWidth={1.5} />
              </span>
              <span className="font-display text-base font-bold leading-[1.2] tracking-[-0.015em] text-foreground">
                {t.navn}
              </span>
              <span className="mt-auto font-mono text-[10px] leading-none text-muted-foreground">
                <b className="font-bold text-primary">{t.cta}</b> {t.meta}
              </span>
            </>
          );
          return t.nedlasting ? (
            <a key={t.navn} href={t.href} className={tileClass}>
              {innhold}
            </a>
          ) : (
            <Link key={t.navn} href={t.href} className={tileClass}>
              {innhold}
            </Link>
          );
        })}
      </div>
    </AgPage>
  );
}
