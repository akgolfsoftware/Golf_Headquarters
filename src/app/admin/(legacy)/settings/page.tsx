/**
 * AgencyOS — Admin (SYSTEM · ADMIN), /admin/settings.
 *
 * Port av fasit `agencyos-app/screens-analyze.jsx` → AdminScreen (mørkt tema,
 * desktop 1280): PageHead («Organisasjon & tilgang.») + seg-faner
 * Organisasjon / Team & roller / Tilgang (?tab=, server component — fasit
 * bruker useState).
 *
 * Datakilder (ekte verdier eller «—»):
 *   - Organisasjon: prisma.location (aktive klubber/anlegg) + fasilitetstall.
 *     Spillere-per-klubb er ikke modellert — vises ikke (aldri liksom-tall).
 *   - Team & roller: prisma.user (ADMIN/COACH) + antall unike spillere i
 *     coachens grupper. ADMIN → «Eier»-chip (fasit), COACH → «Coach».
 *   - Tilgang: org-innstillinger har ingen DB-modell ennå — fasit-radene
 *     vises med «—» i stedet for toggles (ingen påfunnede tilstander), med
 *     lenke til den ekte CBAC-matrisen på /admin/settings/tilgang.
 *
 * Undersider (settings/api, /calendar, /security, /tilgang) er urørt.
 */

import Link from "next/link";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  AgAvatar,
  AgChip,
  AgPage,
  AgPageHead,
  AgPlayerCell,
  AgTable,
  AgTd,
  AgTh,
  agTrClass,
} from "@/components/admin/agencyos/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Tab = "org" | "team" | "tilgang";

const TABS: { key: Tab; label: string }[] = [
  { key: "org", label: "Organisasjon" },
  { key: "team", label: "Team & roller" },
  { key: "tilgang", label: "Tilgang" },
];

/** Fasit-radene i Tilgang-fanen. Ingen org-innstillingsmodell → verdi «—». */
const TILGANGSRADER = [
  "Spillere ser egen data",
  "Foreldre-tilgang (junior)",
  "Coacher ser hele stallen",
  "WAGR-synk automatisk",
  "Faktura synlig for spiller",
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await requirePortalUser({ allow: ["ADMIN"] });

  const sp = await searchParams;
  const tab: Tab = TABS.some((t) => t.key === sp.tab) ? (sp.tab as Tab) : "org";

  const [klubber, coacher] = await Promise.all([
    prisma.location.findMany({
      where: { active: true },
      select: { id: true, name: true, _count: { select: { facilities: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: { role: { in: ["ADMIN", "COACH"] }, deletedAt: null },
      select: {
        id: true,
        name: true,
        role: true,
        coachedGroups: { select: { members: { select: { userId: true } } } },
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
  ]);

  const teamRader = coacher.map((c) => {
    const unike = new Set<string>();
    for (const g of c.coachedGroups) for (const m of g.members) unike.add(m.userId);
    return {
      id: c.id,
      navn: c.name,
      rolle: c.role === "ADMIN" ? "Head coach" : "Coach",
      spillere: unike.size,
      eier: c.role === "ADMIN",
    };
  });

  return (
    <AgPage>
      <AgPageHead
        eyebrow="System · Admin"
        title="Organisasjon"
        italic="& tilgang."
        lead="Klubber, coacher og rolletilgang. Eierrollen styrer hvem som ser hva."
      />

      {/* Seg-faner (fasit .seg) — ?tab= i stedet for useState (server component) */}
      <div className="mb-4 inline-flex gap-[2px] rounded-lg bg-secondary p-[3px]">
        {TABS.map((t) =>
          t.key === tab ? (
            <span
              key={t.key}
              className="inline-flex h-[26px] items-center rounded-md bg-card px-[11px] font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-primary shadow-sm"
            >
              {t.label}
            </span>
          ) : (
            <Link
              key={t.key}
              href={`/admin/settings?tab=${t.key}`}
              className="inline-flex h-[26px] items-center rounded-md px-[11px] font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {t.label}
            </Link>
          ),
        )}
      </div>

      {tab === "org" && (
        <div className="grid grid-cols-3 gap-3">
          {klubber.length === 0 && (
            <div className="col-span-3 rounded-xl border border-border bg-card px-[18px] py-10 text-center text-sm text-muted-foreground">
              Ingen klubber/anlegg registrert ennå — legg til under Anlegg.
            </div>
          )}
          {klubber.map((k, i) => (
            <div key={k.id} className="rounded-xl border border-border bg-card p-[18px]">
              <div className="flex items-center gap-3">
                <AgAvatar initials={initials(k.name)} size={40} tone={i === 0 ? "lime" : "neu"} />
                <div>
                  <div className="text-[15px] font-bold text-foreground">{k.name}</div>
                  <div className="mt-[2px] font-mono text-[10px] text-muted-foreground">
                    {k._count.facilities}{" "}
                    {k._count.facilities === 1 ? "fasilitet" : "fasiliteter"} · aktiv
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "team" && (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <AgTable>
            <thead>
              <tr>
                <AgTh>Coach</AgTh>
                <AgTh>Rolle</AgTh>
                <AgTh num>Spillere</AgTh>
                <AgTh>Status</AgTh>
              </tr>
            </thead>
            <tbody>
              {teamRader.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-[14px] py-10 text-center text-[13px] text-muted-foreground">
                    Ingen coacher registrert ennå.
                  </td>
                </tr>
              )}
              {teamRader.map((c) => (
                <tr key={c.id} className={agTrClass}>
                  <AgTd>
                    <AgPlayerCell initials={initials(c.navn)} name={c.navn} size={28} tone={c.eier ? "pri" : "neu"} />
                  </AgTd>
                  <AgTd>{c.rolle}</AgTd>
                  <AgTd num>{c.spillere}</AgTd>
                  <AgTd>
                    <AgChip tone={c.eier ? "lime" : "neu"}>{c.eier ? "Eier" : "Coach"}</AgChip>
                  </AgTd>
                </tr>
              ))}
            </tbody>
          </AgTable>
        </div>
      )}

      {tab === "tilgang" && (
        <div className="max-w-[640px]">
          <div className="rounded-xl border border-border bg-card px-[18px] py-1">
            {TILGANGSRADER.map((label, i) => (
              <div
                key={label}
                className={cn(
                  "flex items-center justify-between py-[15px]",
                  i > 0 && "border-t border-border",
                )}
              >
                <span className="text-sm font-medium text-foreground">{label}</span>
                {/* Org-innstillinger er ikke modellert ennå — ingen påfunnet av/på-tilstand */}
                <span className="font-mono text-[11px] font-bold text-muted-foreground">—</span>
              </div>
            ))}
          </div>
          <Link
            href="/admin/settings/tilgang"
            className="mt-3 inline-block font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:underline"
          >
            Full tilgangsmatrise per rolle →
          </Link>
        </div>
      )}
    </AgPage>
  );
}
