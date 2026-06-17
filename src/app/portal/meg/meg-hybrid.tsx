"use client";

/**
 * MegHybrid — hybrid design for PlayerHQ "Meg" (/portal/meg).
 *
 * Editorial lyst profil-hero øverst, terminal stat-tiles og
 * innstillingsliste nedenfor. Alle data kommer som props fra
 * server-siden; varsler-toggles kaller onChange via server action.
 */

import Link from "next/link";
import {
  AlertCircle,
  Bell,
  ChevronRight,
  CircleDollarSign,
  Lock,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { useState, useTransition } from "react";
import type { Tier } from "@/generated/prisma/client";
import type { UserPreferences } from "@/lib/preferences";

// ── Typer ────────────────────────────────────────────────────────────────────

export type MegHybridProps = {
  name: string;
  initials: string;
  avatarUrl: string | null;
  hcp: number | null;
  homeClub: string | null;
  tier: Tier;
  streakDager: number;
  antallRunder: number;
  preferences: UserPreferences;
  onUpdatePreferences: (input: Partial<UserPreferences>) => Promise<void>;
  onLogout: () => Promise<void>;
};

// ── Hjelpere ─────────────────────────────────────────────────────────────────

function hcpTekst(hcp: number | null): string {
  if (hcp == null) return "—";
  return hcp.toLocaleString("nb-NO", { maximumFractionDigits: 1 });
}

function tierLabel(tier: Tier): string {
  // ELITE er dødt enum — behandles som GRATIS
  return tier === "PRO" ? "PLAYERHQ · PRO" : "PLAYERHQ · GRATIS";
}

// ── Sub-komponenter ───────────────────────────────────────────────────────────

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-2.5 py-2.5 text-center shadow-sm">
      <div className="font-mono text-[8px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-lg font-semibold tabular-nums leading-none text-foreground">
        {value}
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-t-xl border-x border-t border-border bg-secondary px-4 py-2">
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {children}
      </span>
    </div>
  );
}

function RowIcon({
  variant = "default",
  children,
}: {
  variant?: "forest" | "lime" | "warn" | "default";
  children: React.ReactNode;
}) {
  const variantClass = {
    forest: "bg-primary/10 text-primary",
    lime: "bg-accent/20 text-primary",
    warn: "bg-warning/10 text-warning",
    default: "bg-secondary text-muted-foreground",
  }[variant];

  return (
    <div
      className={`flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-lg ${variantClass}`}
    >
      {children}
    </div>
  );
}

function LinkRow({
  href,
  icon,
  iconVariant,
  label,
  sub,
}: {
  href: string;
  icon: React.ReactNode;
  iconVariant?: "forest" | "lime" | "warn" | "default";
  label: string;
  sub?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-[11px] border-t border-border px-4 py-[13px] transition-colors hover:bg-secondary/50 first:border-t-0"
    >
      <RowIcon variant={iconVariant}>{icon}</RowIcon>
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {sub && (
          <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
        )}
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} aria-hidden />
    </Link>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${on ? "bg-primary" : "bg-border"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-card transition-transform ${on ? "translate-x-4" : "translate-x-0"}`}
      />
    </button>
  );
}

function ToggleRow({
  icon,
  iconVariant,
  label,
  sub,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  iconVariant?: "forest" | "lime" | "warn" | "default";
  label: string;
  sub?: string;
  checked: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-[11px] border-t border-border px-4 py-[13px] first:border-t-0">
      <RowIcon variant={iconVariant}>{icon}</RowIcon>
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {sub && (
          <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>
        )}
      </div>
      <Toggle on={checked} onChange={onChange} />
    </div>
  );
}

// ── Hoveddkomponent ───────────────────────────────────────────────────────────

export function MegHybrid({
  name,
  initials,
  hcp,
  homeClub,
  tier,
  streakDager,
  antallRunder,
  preferences,
  onUpdatePreferences,
  onLogout,
}: MegHybridProps) {
  const [pending, startTransition] = useTransition();
  const [notifState, setNotifState] = useState(preferences.notif);

  function togglePush(on: boolean) {
    const next = { ...notifState, push: on };
    setNotifState(next);
    startTransition(async () => {
      await onUpdatePreferences({ notif: next });
    });
  }

  function toggleEpost(on: boolean) {
    const next = { ...notifState, epost: on };
    setNotifState(next);
    startTransition(async () => {
      await onUpdatePreferences({ notif: next });
    });
  }

  const metaDeler: string[] = [];
  if (hcp != null) metaDeler.push(`HCP ${hcpTekst(hcp)}`);
  if (homeClub) metaDeler.push(homeClub);

  return (
    <div className="mx-auto w-full max-w-[480px] space-y-4 px-3.5 pb-10 pt-3.5">
      {/* ── Profil-hero ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3.5">
        {/* Avatar */}
        <div
          className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border-2 border-accent font-mono text-xl font-bold text-accent"
          style={{ background: "var(--color-primary)" }}
          aria-label={`Avatar for ${name}`}
        >
          {initials}
        </div>

        {/* Navn + meta */}
        <div className="min-w-0">
          <p className="font-display text-xl font-bold leading-tight tracking-tight text-foreground">
            {name}
          </p>
          {metaDeler.length > 0 && (
            <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
              {metaDeler.join(" · ")}
            </p>
          )}
          {/* Tier-pill */}
          <div
            className="mt-1.5 inline-flex items-center rounded-full px-2.5 py-1"
            style={{ background: "var(--color-primary)" }}
          >
            <span className="font-mono text-[9px] font-bold tracking-[0.04em] text-accent">
              {tierLabel(tier)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stat-tiles ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <StatTile label="HCP" value={hcpTekst(hcp)} />
        <StatTile label="Streak" value={streakDager > 0 ? `${streakDager} d` : "—"} />
        <StatTile label="Runder" value={antallRunder > 0 ? String(antallRunder) : "0"} />
      </div>

      {/* ── Konto ───────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <SectionHeader>Konto</SectionHeader>
        <LinkRow
          href="/portal/meg/profil"
          icon={<UserIcon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />}
          iconVariant="forest"
          label="Rediger profil"
          sub="Navn, e-post, foto"
        />
        <LinkRow
          href="/portal/meg/sikkerhet"
          icon={<Lock className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />}
          label="Passord"
        />
      </div>

      {/* ── Varsler ─────────────────────────────────────────────────────── */}
      <div
        className={`overflow-hidden rounded-xl border border-border bg-card${pending ? " opacity-75" : ""}`}
      >
        <SectionHeader>Varsler</SectionHeader>
        <ToggleRow
          icon={<Bell className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />}
          iconVariant="lime"
          label="Push-varsler"
          sub="Nye meldinger fra coach"
          checked={notifState.push}
          onChange={togglePush}
        />
        <ToggleRow
          icon={<Mail className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />}
          label="E-postvarsler"
          sub="Ukessammendrag"
          checked={notifState.epost}
          onChange={toggleEpost}
        />
      </div>

      {/* ── Abonnement ──────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <SectionHeader>Abonnement</SectionHeader>
        <LinkRow
          href="/portal/meg/abonnement/oppgrader"
          icon={<CircleDollarSign className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />}
          iconVariant="forest"
          label="Oppgrader til PRO"
          sub="300 kr/mnd · Video + prioritet"
        />
        <form action={onLogout} className="border-t border-border">
          <button
            type="submit"
            className="flex w-full items-center gap-[11px] px-4 py-[13px] text-left transition-colors hover:bg-secondary/50"
          >
            <RowIcon variant="warn">
              <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            </RowIcon>
            <div className="flex-1 text-sm font-medium text-foreground">Logg ut</div>
          </button>
        </form>
      </div>
    </div>
  );
}
