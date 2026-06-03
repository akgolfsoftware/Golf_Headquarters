"use client";

/**
 * Varsel-senter (PlayerHQ · mobil-first 430px).
 *
 * Pixel-port av public/design-handover/playerhq/components-varsler.html.
 * Header («VARSLER · N NYE» + «Mark alle») · varsler gruppert per tid
 * (I dag / I går / Denne uka / Eldre) med per-gruppe-teller · varsel-card med
 * agent-ikon (lucide) + agent-navn (mono-eyebrow) + beskrivelse + relativ tid +
 * lime ulest-prikk. «Eldre» foldes inn bak «Vis eldre». Klikk = naviger til link.
 *
 * NB: FASIT-ens ←-tilbakeknapp er utelatt fordi route-layout.tsx allerede
 * rammer skjermen i en SubNav (Profil/Varsler/Abonnement/Innstillinger) — en
 * back-pil under fane-navigasjon ville villedet. Resten følger FASIT 1:1.
 * Følger queue-idiomet fra portal/tester/tester-list. Server-eide markeringer
 * skjer via actions.ts (markNotificationsRead). «N nye» = uleste, utledet.
 */

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  BarChart3,
  Bell,
  BotMessageSquare,
  Calendar,
  CheckCheck,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  Info,
  MessageSquare,
  Receipt,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { markNotificationsRead } from "@/app/portal/varsler/actions";

export type VarselItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: Date | null;
  createdAt: Date;
};

/**
 * Agent-presentasjon per varsel-type. `ic` = bakgrunns-/tekstfarge på ikon-flis
 * (DS-tokens, ingen hardkodet hex). `agent` = mono-eyebrow over beskrivelsen.
 */
type AgentPresentation = { icon: LucideIcon; ic: string; agent: string };

const AGENT: Record<string, AgentPresentation> = {
  plan: { icon: Zap, ic: "bg-accent/30 text-primary", agent: "Plan-vakten" },
  drill: { icon: Target, ic: "bg-primary/10 text-primary", agent: "Coach" },
  melding: { icon: MessageSquare, ic: "bg-info/10 text-info", agent: "Coach" },
  turnering: { icon: Trophy, ic: "bg-destructive/10 text-destructive", agent: "Turnering-agent" },
  achievement: { icon: Trophy, ic: "bg-accent/30 text-primary", agent: "Milepæl" },
  runde: { icon: BarChart3, ic: "bg-primary/10 text-primary", agent: "Runde-agent" },
  trackman: { icon: Zap, ic: "bg-primary/10 text-primary", agent: "TrackMan" },
  booking: { icon: Calendar, ic: "bg-info/10 text-info", agent: "Booking" },
  credit: { icon: CreditCard, ic: "bg-warning/15 text-warning", agent: "Credit" },
  betaling: { icon: CreditCard, ic: "bg-warning/15 text-warning", agent: "Betaling" },
  faktura: { icon: Receipt, ic: "bg-primary/[0.08] text-primary", agent: "Fakturaer" },
  ai: { icon: BotMessageSquare, ic: "bg-accent/30 text-primary", agent: "AI-caddie" },
  system: { icon: ClipboardCheck, ic: "bg-secondary text-muted-foreground", agent: "System" },
};

const FALLBACK: AgentPresentation = {
  icon: Info,
  ic: "bg-secondary text-muted-foreground",
  agent: "System",
};

function presentation(type: string): AgentPresentation {
  return AGENT[type] ?? FALLBACK;
}

// ── Tids-gruppering ─────────────────────────────────────────────
type GroupKey = "i-dag" | "i-gar" | "denne-uka" | "eldre";

const GROUP_ORDER: GroupKey[] = ["i-dag", "i-gar", "denne-uka", "eldre"];

const GROUP_LABEL: Record<GroupKey, string> = {
  "i-dag": "I dag",
  "i-gar": "I går",
  "denne-uka": "Denne uka",
  "eldre": "Eldre",
};

function getGroup(d: Date): GroupKey {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  // ISO-uke: mandag som første dag.
  const startOfWeek = new Date(startOfToday);
  const dow = (startOfToday.getDay() + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - dow);

  if (d >= startOfToday) return "i-dag";
  if (d >= startOfYesterday) return "i-gar";
  if (d >= startOfWeek) return "denne-uka";
  return "eldre";
}

/** Relativ tid i mono-caps, à la FASIT: «2 T SIDEN», «1 D SIDEN», «NÅ». */
function relativeTime(d: Date): string {
  const diffMs = Date.now() - d.getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Nå";
  if (min < 60) return `${min} min siden`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} t siden`;
  const days = Math.floor(hours / 24);
  return `${days} d siden`;
}

// ── Varsel-card ─────────────────────────────────────────────────
function VarselCard({ v }: { v: VarselItem }) {
  const p = presentation(v.type);
  const Icon = p.icon;
  const ulest = !v.readAt;

  const inner = (
    <div className="relative grid grid-cols-[36px_1fr] gap-3 px-[18px] py-[13px] transition-colors hover:bg-primary/[0.02]">
      <span
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]",
          p.ic,
        )}
        aria-hidden
      >
        <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} />
      </span>

      <div className="min-w-0">
        <p
          className={cn(
            "font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground",
            !ulest && "opacity-[0.62]",
          )}
        >
          {p.agent}
        </p>
        <p
          className={cn(
            "mt-[3px] text-[13.5px] font-medium leading-[1.4] tracking-[-0.005em] text-foreground",
            !ulest && "opacity-[0.62]",
          )}
        >
          <span className="font-bold">{v.title}</span>
          {v.body ? <> {v.body}</> : null}
        </p>
        <p className="mt-[5px] font-mono text-[9.5px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
          {relativeTime(v.createdAt)}
        </p>
      </div>

      {ulest && (
        <span
          className="absolute right-4 top-4 h-[9px] w-[9px] rounded-full bg-accent shadow-[0_0_0_3px_hsl(var(--card))]"
          aria-label="Ulest"
        />
      )}
    </div>
  );

  return (
    <li className="border-b border-border last:border-b-0">
      {v.link ? (
        <Link
          href={v.link}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          {inner}
        </Link>
      ) : (
        inner
      )}
    </li>
  );
}

// ── Dag-bar ─────────────────────────────────────────────────────
function DayBar({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2.5 border-b border-border bg-background px-[18px] py-[9px]">
      <span className="font-mono text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className="ml-auto inline-flex items-center rounded-full border border-border bg-card px-[7px] py-px font-mono text-[8.5px] font-bold tracking-[0.04em] text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

export function VarslerClient({
  varsler,
  demo,
}: {
  varsler: VarselItem[];
  demo: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [visEldre, setVisEldre] = useState(false);

  const ulestAntall = useMemo(
    () => varsler.filter((v) => !v.readAt).length,
    [varsler],
  );

  const grupper = useMemo(() => {
    const map: Record<GroupKey, VarselItem[]> = {
      "i-dag": [],
      "i-gar": [],
      "denne-uka": [],
      "eldre": [],
    };
    for (const v of varsler) map[getGroup(v.createdAt)].push(v);
    return map;
  }, [varsler]);

  function markerAlleLest() {
    if (demo || ulestAntall === 0) return;
    startTransition(async () => {
      await markNotificationsRead();
    });
  }

  const harEldre = grupper["eldre"].length > 0;
  const synligeGrupper = GROUP_ORDER.filter(
    (g) => g !== "eldre" && grupper[g].length > 0,
  );
  const tomt = varsler.length === 0;

  return (
    <div className="mx-auto max-w-[430px] overflow-hidden rounded-xl border border-border bg-card pb-2">
      {/* Header — tittel + «N nye» + Mark alle */}
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <span className="font-display text-[17px] font-bold leading-tight tracking-[-0.015em] text-foreground">
          Varsler
          {ulestAntall > 0 && (
            <>
              {" · "}
              <span className="text-primary">{ulestAntall} nye</span>
            </>
          )}
        </span>
        <button
          type="button"
          onClick={markerAlleLest}
          disabled={pending || demo || ulestAntall === 0}
          className={cn(
            "ml-auto inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/[0.06] px-2.5 py-1.5 font-mono text-[9.5px] font-extrabold uppercase tracking-[0.04em] text-primary transition-opacity",
            (pending || demo || ulestAntall === 0) && "pointer-events-none opacity-50",
          )}
        >
          <CheckCheck className="h-3 w-3" strokeWidth={2} aria-hidden />
          {pending ? "Markerer…" : "Mark alle"}
        </button>
      </div>

      {demo && (
        <div className="border-b border-border bg-secondary/40 px-[18px] py-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Demo-data — ekte varsler vises her etter hvert
        </div>
      )}

      {tomt ? (
        <EmptyState />
      ) : (
        <div>
          {synligeGrupper.map((g) => (
            <div key={g}>
              <DayBar label={GROUP_LABEL[g]} count={grupper[g].length} />
              <ul>
                {grupper[g].map((v) => (
                  <VarselCard key={v.id} v={v} />
                ))}
              </ul>
            </div>
          ))}

          {/* Eldre — foldet bak «Vis eldre» */}
          {harEldre && visEldre && (
            <div>
              <DayBar label={GROUP_LABEL["eldre"]} count={grupper["eldre"].length} />
              <ul>
                {grupper["eldre"].map((v) => (
                  <VarselCard key={v.id} v={v} />
                ))}
              </ul>
            </div>
          )}

          {harEldre && !visEldre && (
            <div className="px-[18px] py-[18px] text-center">
              <button
                type="button"
                onClick={() => setVisEldre(true)}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.06em] text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                Vis eldre
                <ChevronDown className="h-3 w-3" strokeWidth={2.5} aria-hidden />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 px-4 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Bell className="h-7 w-7" strokeWidth={1.5} aria-hidden />
      </span>
      <div>
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Ingen varsler — du er{" "}
          <em className="font-normal italic text-primary">à jour</em>
        </h2>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Alt nytt vises her: meldinger fra coach, AI-forslag, bookinger og
          fakturaer.
        </p>
      </div>
    </div>
  );
}
