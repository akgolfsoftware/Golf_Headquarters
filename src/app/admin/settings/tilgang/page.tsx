// Read-only CBAC-matrise. Viser hvilke capabilities hver rolle har i dag.
// Lagring i DB krever større refaktor (per-org overrides) — V1 er read-only.

import { CheckCircle2, Minus, Shield, Info } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";
import { Capability, can } from "@/lib/auth/cbac";
import type { UserRole } from "@/generated/prisma/client";

const ROLLER: UserRole[] = ["ADMIN", "COACH", "PLAYER", "PARENT", "GUEST"];

const CAPABILITY_BESKRIVELSE: Record<Capability, string> = {
  [Capability.VIEW_OWN_PROFILE]: "Se egen profil",
  [Capability.EDIT_OWN_PROFILE]: "Endre egen profil",
  [Capability.VIEW_OWN_BOOKINGS]: "Se egne bookinger",
  [Capability.CREATE_BOOKING]: "Opprette booking",
  [Capability.VIEW_CHILDREN]: "Se egne barn (forelder)",
  [Capability.VIEW_ALL_PLAYERS]: "Se alle spillere",
  [Capability.EDIT_PLAYER_PLAN]: "Endre spiller-plan",
  [Capability.VIEW_FINANCE]: "Se økonomidata",
  [Capability.MANAGE_FACILITIES]: "Administrere fasiliteter",
  [Capability.MANAGE_USERS]: "Administrere brukere",
};

export default async function TilgangPage() {
  await requirePortalUser({ allow: ["ADMIN"] });

  const capabilities = Object.values(Capability);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Innstillinger · Tilgang & roller"
        titleLead="Capability"
        titleItalic="matrise"
        sub="Hvilke handlinger hver rolle kan utføre i plattformen."
      />

      <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/40 p-4">
        <Info
          className="h-5 w-5 shrink-0 text-muted-foreground"
          strokeWidth={1.8}
        />
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">Read-only.</span> For å
          endre tilgang, kontakt utvikler. Alle senere endringer logges i
          AuditLog med actor og tidsstempel.
        </p>
      </div>

      <section>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border bg-secondary/40 text-left">
                <tr>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Capability
                  </th>
                  {ROLLER.map((rolle) => (
                    <th
                      key={rolle}
                      className="px-4 py-3 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
                    >
                      {rolle}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {capabilities.map((cap) => (
                  <tr
                    key={cap}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-4 py-3 text-sm">
                      <div className="font-semibold">
                        {CAPABILITY_BESKRIVELSE[cap]}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                        {cap}
                      </div>
                    </td>
                    {ROLLER.map((rolle) => {
                      const ok = can(rolle, cap);
                      return (
                        <td
                          key={rolle}
                          className="px-4 py-3 text-center"
                          aria-label={ok ? "Tillatt" : "Ikke tillatt"}
                        >
                          {ok ? (
                            <CheckCircle2
                              className="mx-auto h-5 w-5 text-primary"
                              strokeWidth={1.8}
                            />
                          ) : (
                            <Minus
                              className="mx-auto h-5 w-5 text-muted-foreground/40"
                              strokeWidth={1.8}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <Shield
            className="h-5 w-5 shrink-0 text-primary"
            strokeWidth={1.8}
          />
          <div>
            <h3 className="font-display text-base font-semibold tracking-tight">
              Hvordan tilgangsstyring fungerer
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              CBAC (Capability-Based Access Control) kobler hver rolle til et
              sett av tillatte handlinger. Endringer på matrisen krever
              koderefaktor i dag, men er forberedt for per-organisasjons
              overrides i DB. Alle endringer som logges via{" "}
              <code className="font-mono text-xs">audit()</code>-funksjonen
              havner i AuditLog og kan auditeres på{" "}
              <span className="font-semibold text-foreground">
                /admin/audit
              </span>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
