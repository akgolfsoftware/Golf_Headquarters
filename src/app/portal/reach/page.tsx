/**
 * PlayerHQ · Reach & Engagement (P2)
 *
 * Spiller-side for synlighet, connections, privacy og activity-feed.
 * Hardkodet eksempel-data — wires opp mot Prisma + privacy-modellen senere.
 */
import Link from "next/link";
import {
  Eye,
  Users,
  Lock,
  Heart,
  MessageCircle,
  TrendingUp,
  ChevronRight,
  Award,
  Target,
  Flag,
  ShieldCheck,
} from "lucide-react";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ReachPrivacyClient } from "./reach-privacy-client";

type Synlighet = {
  omrade: "runder" | "mal" | "milepaeler";
  navn: string;
  visninger: number;
  endring: number; // % vs forrige uke
  iconBg: string;
  iconFg: string;
};

type Connection = {
  id: string;
  navn: string;
  initialer: string;
  rolle: "coach" | "foreldre" | "venn";
  rolleLabel: string;
  status: "aktiv" | "ventende";
  sistAktiv: string;
};

type Activity = {
  id: string;
  type: "likt" | "kommentert" | "sett";
  hvem: string;
  initialer: string;
  hva: string;
  naar: string;
};

const SYNLIGHET: Synlighet[] = [
  {
    omrade: "runder",
    navn: "Mine runder",
    visninger: 248,
    endring: 18,
    iconBg: "bg-primary/10",
    iconFg: "text-primary",
  },
  {
    omrade: "mal",
    navn: "Mine mål",
    visninger: 67,
    endring: 4,
    iconBg: "bg-accent/30",
    iconFg: "text-foreground",
  },
  {
    omrade: "milepaeler",
    navn: "Milepæler",
    visninger: 132,
    endring: 42,
    iconBg: "bg-destructive/15",
    iconFg: "text-destructive",
  },
];

const CONNECTIONS: Connection[] = [
  {
    id: "c-001",
    navn: "Anders Kristiansen",
    initialer: "AK",
    rolle: "coach",
    rolleLabel: "Hovedcoach",
    status: "aktiv",
    sistAktiv: "i dag",
  },
  {
    id: "c-002",
    navn: "Lise Hansen",
    initialer: "LH",
    rolle: "foreldre",
    rolleLabel: "Mor",
    status: "aktiv",
    sistAktiv: "i går",
  },
  {
    id: "c-003",
    navn: "Øyvind Rohjan",
    initialer: "MP",
    rolle: "venn",
    rolleLabel: "Treningskompis",
    status: "aktiv",
    sistAktiv: "3 dager siden",
  },
  {
    id: "c-004",
    navn: "Erik Solberg",
    initialer: "ES",
    rolle: "venn",
    rolleLabel: "Klubbkompis",
    status: "ventende",
    sistAktiv: "—",
  },
];

const ACTIVITY: Activity[] = [
  {
    id: "a-001",
    type: "likt",
    hvem: "Anders Kristiansen",
    initialer: "AK",
    hva: "PR-runde på Bossum — 68",
    naar: "2 timer siden",
  },
  {
    id: "a-002",
    type: "kommentert",
    hvem: "Lise Hansen",
    initialer: "LH",
    hva: "milepæl: 100 timer trening",
    naar: "5 timer siden",
  },
  {
    id: "a-003",
    type: "sett",
    hvem: "Øyvind Rohjan",
    initialer: "MP",
    hva: "mål-side",
    naar: "i går kl 19:42",
  },
  {
    id: "a-004",
    type: "likt",
    hvem: "Erik Solberg",
    initialer: "ES",
    hva: "Trackman-PR: 312m driver",
    naar: "i går kl 14:10",
  },
  {
    id: "a-005",
    type: "sett",
    hvem: "Anders Kristiansen",
    initialer: "AK",
    hva: "runde Borre GK",
    naar: "2 dager siden",
  },
];

function ikonForOmrade(omrade: Synlighet["omrade"]) {
  if (omrade === "runder") return Flag;
  if (omrade === "mal") return Target;
  return Award;
}

function ikonForActivity(type: Activity["type"]) {
  if (type === "likt") return Heart;
  if (type === "kommentert") return MessageCircle;
  return Eye;
}

function labelForActivity(type: Activity["type"]) {
  if (type === "likt") return "likte";
  if (type === "kommentert") return "kommenterte";
  return "så på";
}

function ikonForConnection(rolle: Connection["rolle"]) {
  if (rolle === "coach") return ShieldCheck;
  if (rolle === "foreldre") return Users;
  return Users;
}

export default async function ReachPage() {
  await requirePortalUser();

  const totalVisninger = SYNLIGHET.reduce((s, r) => s + r.visninger, 0);
  const aktiveConnections = CONNECTIONS.filter((c) => c.status === "aktiv");
  const ventende = CONNECTIONS.filter((c) => c.status === "ventende");

  return (
    <div className="mx-auto max-w-[1240px] space-y-8 px-4 sm:px-6">
      <PageHeader
        eyebrow="PlayerHQ · /portal/reach"
        titleLead="Hvem ser"
        titleItalic="reisen"
        titleTrail="din?"
        sub="Synlighet, connections og personvern. Du bestemmer hva som deles og med hvem."
        actions={
          <Link
            href="/portal/meg/innstillinger"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Lock size={14} strokeWidth={1.75} />
            Personvern
          </Link>
        }
      />

      {/* Min synlighet */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[22px] font-medium italic tracking-tight">
            Min synlighet
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Siste 30 dager · {totalVisninger} visninger totalt
          </span>
        </div>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {SYNLIGHET.map((s) => {
            const Ikon = ikonForOmrade(s.omrade);
            const positiv = s.endring >= 0;
            return (
              <li
                key={s.omrade}
                className="rounded-lg border border-border bg-card p-6"
              >
                <div
                  className={`grid h-10 w-10 place-items-center rounded-md ${s.iconBg} ${s.iconFg}`}
                >
                  <Ikon size={20} strokeWidth={1.75} />
                </div>
                <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  {s.navn}
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-[32px] font-semibold tabular-nums leading-none">
                    {s.visninger}
                  </span>
                  <span
                    className={`inline-flex items-center gap-0.5 font-mono text-[11px] tabular-nums ${
                      positiv ? "text-primary" : "text-destructive"
                    }`}
                  >
                    <TrendingUp
                      size={12}
                      strokeWidth={1.75}
                      className={positiv ? "" : "rotate-180"}
                    />
                    {positiv ? "+" : ""}
                    {s.endring}%
                  </span>
                </div>
                <p className="mt-2 text-[12px] text-muted-foreground">
                  vs forrige periode
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid grid-cols-12 gap-6">
        {/* Mine connections */}
        <section className="col-span-12 lg:col-span-7 space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-[22px] font-medium italic tracking-tight">
              Mine connections
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              {aktiveConnections.length} aktive · {ventende.length} ventende
            </span>
          </div>

          <ul className="space-y-2">
            {CONNECTIONS.map((c) => {
              const Ikon = ikonForConnection(c.rolle);
              return (
                <li
                  key={c.id}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
                >
                  <div className="relative">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-primary font-mono text-[13px] font-semibold text-primary-foreground">
                      {c.initialer}
                    </div>
                    {c.status === "aktiv" && (
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-[14px] font-semibold leading-none">
                        {c.navn}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-sm bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                        <Ikon size={10} strokeWidth={1.75} />
                        {c.rolleLabel}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                      {c.status === "aktiv"
                        ? `Aktiv ${c.sistAktiv}`
                        : "Venter på godkjenning"}
                    </div>
                  </div>
                  {c.status === "ventende" ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-full bg-primary px-4 py-1.5 text-[11px] font-semibold text-primary-foreground hover:opacity-90"
                      >
                        Godta
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-border px-4 py-1.5 text-[11px] font-medium text-foreground hover:bg-secondary"
                      >
                        Avslå
                      </button>
                    </div>
                  ) : (
                    <ChevronRight
                      size={16}
                      strokeWidth={1.75}
                      className="text-muted-foreground"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Privacy-toggles */}
        <aside className="col-span-12 lg:col-span-5 space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-[22px] font-medium italic tracking-tight">
              Personvern
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Synlighet per område
            </span>
          </div>
          <ReachPrivacyClient />
        </aside>
      </div>

      {/* Activity-feed */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[22px] font-medium italic tracking-tight">
            Hva andre gjør
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Aktivitet på dine ting
          </span>
        </div>
        <ul className="space-y-2 rounded-lg border border-border bg-card p-2">
          {ACTIVITY.map((a) => {
            const Ikon = ikonForActivity(a.type);
            return (
              <li
                key={a.id}
                className="flex items-center gap-4 rounded-md px-4 py-2 transition-colors hover:bg-secondary/40"
              >
                <div className="relative">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary font-mono text-[11px] font-semibold text-foreground">
                    {a.initialer}
                  </div>
                  <div className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground">
                    <Ikon size={10} strokeWidth={1.75} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug text-foreground">
                    <span className="font-semibold">{a.hvem}</span>{" "}
                    <span className="text-muted-foreground">
                      {labelForActivity(a.type)}
                    </span>{" "}
                    <span className="font-medium">{a.hva}</span>
                  </p>
                </div>
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                  {a.naar}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
