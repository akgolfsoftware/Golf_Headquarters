/**
 * /admin/meg — Coach profil-hub
 *
 * Design: Variant A "Sticky tab-bar by-the-book" fra Claude Design-bundle
 * Sg2FEKvykU45c4naIgQx6w (s2-coach-meg.jsx).
 *
 * 6 tabs: Profil · Spillere · Stripe · Nøkler · Varsler · Tilkoblinger.
 * Hver tab er en sub-komponent i meg-tabs/.
 *
 * Eksisterende /admin/profile beholdes som "rediger profil"-flyt.
 */

import Link from "next/link";
import { Edit, ExternalLink } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AthleticEyebrow, AthleticButton } from "@/components/athletic";
import { TabBar } from "@/components/ds/tab-bar";
import {
  ProfilTab,
  SpillereTab,
  StripeTab,
  NoklerTab,
  VarslerTab,
  TilkoblingerTab,
  LoggUtAlleEnheter,
} from "./meg-tabs";

export const dynamic = "force-dynamic";

const TABS = ["profil", "spillere", "stripe", "nokler", "varsler", "tilkoblinger"] as const;
type Tab = (typeof TABS)[number];

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function AdminMegPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;
  const tab: Tab = TABS.includes(params.tab as Tab) ? (params.tab as Tab) : "profil";

  const [spillerCount, aktivCount] = await Promise.all([
    prisma.user.count({ where: { role: "PLAYER", deletedAt: null } }),
    prisma.user
      .count({ where: { role: "PLAYER", userStatus: "AKTIV", deletedAt: null } })
      .catch(() => 0),
  ]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <header className="-mx-4 -mt-4 border-b border-border bg-gradient-to-b from-[#FBFAF5] to-background px-4 py-7 md:-mx-8 md:-mt-8 md:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <div className="flex h-22 w-22 shrink-0 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-accent" style={{ width: 88, height: 88 }}>
            {initials(user.name ?? "AK")}
          </div>
          <div className="flex-1">
            <AthleticEyebrow>CoachHQ · Min profil</AthleticEyebrow>
            <h1 className="font-display mt-1.5 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {user.name?.split(" ")[0] ?? "Coach"}{" "}
              <em
                className="font-normal not-italic"
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                  color: "#005840",
                }}
              >
                {user.name?.split(" ").slice(1).join(" ") || ""}
              </em>
            </h1>
            <div className="font-mono mt-2 text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
              HEAD COACH · {spillerCount} SPILLERE
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin/profile">
              <AthleticButton variant="ghost-light" size="md">
                <Edit className="h-4 w-4" /> Rediger profil
              </AthleticButton>
            </Link>
            <Link href={`/coach/${user.id}`} target="_blank">
              <AthleticButton variant="primary" size="md">
                Offentlig profil
                <ExternalLink className="h-4 w-4" />
              </AthleticButton>
            </Link>
          </div>
        </div>
      </header>

      {/* Tab-bar */}
      <TabBar
        tabs={[
          { id: "profil", label: "Profil" },
          { id: "spillere", label: "Spillere", count: spillerCount },
          { id: "stripe", label: "Stripe" },
          { id: "nokler", label: "Nøkler", count: 4 },
          { id: "varsler", label: "Varsler" },
          { id: "tilkoblinger", label: "Tilkoblinger", count: 5 },
        ]}
        defaultTab="profil"
      />

      {/* Tab-innhold */}
      <div className="space-y-9">
        {tab === "profil" ? <ProfilTab user={user} /> : null}
        {tab === "spillere" ? <SpillereTab totalCount={spillerCount} activeCount={aktivCount} /> : null}
        {tab === "stripe" ? <StripeTab /> : null}
        {tab === "nokler" ? <NoklerTab /> : null}
        {tab === "varsler" ? <VarslerTab /> : null}
        {tab === "tilkoblinger" ? <TilkoblingerTab /> : null}

        <LoggUtAlleEnheter />
      </div>
    </div>
  );
}
