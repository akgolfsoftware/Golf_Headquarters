// AgencyOS · Caddie — chat-grensesnitt + regelmotor + kildetilkoblinger.
// Speiler CaddieScreen fra Claude artifact AK Golf AgencyOS.

import { Sparkles, MessageCircle, Mail, Calendar, FileText, CreditCard } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { CaddieChatStub } from "./caddie-chat-stub";

export const dynamic = "force-dynamic";

const REGLER = [
  { id: "r1", txt: "Send fakturaer automatisk når en pakke fullføres", level: "godkjenn", on: true },
  { id: "r2", txt: "Auto-purr utestående etter 7 dager", level: "auto", on: true },
  { id: "r3", txt: "Flytt time selv hvis spiller spør med >24t varsel", level: "godkjenn", on: true },
  { id: "r4", txt: "Avlys utendørs-økt automatisk ved kraftig regn", level: "hard", on: false },
  { id: "r5", txt: "Skriv Notion-logg etter hver økt fra mine stikkord", level: "godkjenn", on: true },
  { id: "r6", txt: "Send ukentlig sponsor-rapport hver fredag 16:00", level: "auto", on: false },
];

const FORESLATTE_PROMPT = [
  "Lag ukesrapport for sponsor-møtet",
  "Hvem skylder meg penger?",
  "Send vinterpakke-tilbud til Bjørn",
  "Flytt onsdag morgen til torsdag",
  "Oppsummer Notion-loggen for Nicolai",
];

export default async function CaddieTabPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const calConnection = await prisma.googleCalendarConnection
    .findUnique({ where: { userId: user.id } })
    .catch(() => null);

  const kilder = [
    {
      app: "Gmail",
      icon: Mail,
      stat: "Ikke koblet",
      scope: "Lese + utkast",
      tilkoblet: false,
      href: "https://mail.google.com",
    },
    {
      app: "Google Calendar",
      icon: Calendar,
      stat: calConnection ? "Synket nå" : "Ikke koblet",
      scope: "Lese + skrive hendelser",
      tilkoblet: !!calConnection,
      href: "/api/google-calendar/connect",
    },
    {
      app: "Notion",
      icon: FileText,
      stat: "Ikke koblet",
      scope: "Spillerlogg + prosjekter",
      tilkoblet: false,
      href: "https://notion.so",
    },
    {
      app: "Stripe",
      icon: CreditCard,
      stat: "Live · sync via webhook",
      scope: "Fakturaer + abonnement",
      tilkoblet: true,
      href: "https://dashboard.stripe.com",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="AgencyOS · Caddie"
        titleLead="Din"
        titleItalic="assistent"
        sub="Regler, kilder og direkte chat. Caddie holder dagen din i drift."
        actions={
          <span className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" /> Aktiv · siste sync nettopp
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat */}
        <section className="rounded-lg border border-border bg-card lg:col-span-2">
          <div className="flex items-baseline justify-between border-b border-border px-5 py-3">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold tracking-tight">
              <MessageCircle className="h-4 w-4 text-primary" /> Direkte med <em>Caddie</em>
            </h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              EKSPORT
            </span>
          </div>
          <CaddieChatStub foreslatteSporsmal={FORESLATTE_PROMPT} />
        </section>

        {/* Sidekolonne */}
        <aside className="space-y-6">
          {/* Regler */}
          <section className="rounded-lg border border-border bg-card">
            <div className="flex items-baseline justify-between border-b border-border px-5 py-3">
              <h3 className="font-display text-sm font-semibold tracking-tight">
                Regler
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                + NY REGEL
              </span>
            </div>
            <ul className="divide-y divide-border">
              {REGLER.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-foreground">{r.txt}</div>
                  </div>
                  <span
                    className={`shrink-0 rounded-sm px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                      r.level === "auto"
                        ? "bg-primary/10 text-primary"
                        : r.level === "hard"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-accent/15 text-accent-foreground"
                    }`}
                  >
                    {r.level}
                  </span>
                  <button
                    type="button"
                    disabled
                    aria-label={`Toggle regel ${r.id}`}
                    className={`h-5 w-9 shrink-0 rounded-full border transition-colors ${
                      r.on ? "border-primary bg-primary" : "border-border bg-muted"
                    }`}
                  >
                    <span
                      className={`block h-3.5 w-3.5 translate-y-[1px] rounded-full bg-background transition-transform ${
                        r.on ? "translate-x-[18px]" : "translate-x-[2px]"
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-border px-5 py-3 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Regelmotor kommer V1.5
            </div>
          </section>

          {/* Kilder */}
          <section className="rounded-lg border border-border bg-card">
            <div className="flex items-baseline justify-between border-b border-border px-5 py-3">
              <h3 className="font-display text-sm font-semibold tracking-tight">Tilkoblinger</h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                ADMIN
              </span>
            </div>
            <ul className="divide-y divide-border">
              {kilder.map((k) => (
                <li key={k.app} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                    <k.icon className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground">{k.app}</div>
                    <div className="truncate font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {k.stat} · {k.scope}
                    </div>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      k.tilkoblet ? "bg-primary" : "bg-muted-foreground"
                    }`}
                  />
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-accent/30 bg-accent/5 p-5">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
              <Sparkles className="h-3 w-3" /> Snart
            </div>
            <p className="mt-1 text-xs text-foreground">
              Caddie får MCP-tilgang til Gmail/Notion + autonom utkast-generering i M19 (AI-agenter-utvidelse).
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
