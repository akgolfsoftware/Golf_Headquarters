import { Package } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ServiceForm } from "./service-form";

export default async function ServicesAdmin() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const services = await prisma.serviceType.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });

  const aktive = services.filter((s) => s.active).length;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Tjenester"
        titleLead="Service"
        titleItalic="typer"
        sub={`${services.length} tjenester — ${aktive} aktive.`}
        actions={<ServiceForm triggerLabel="+ Ny tjeneste" />}
      />

      {services.length === 0 ? (
        <EmptyState
          icon={Package}
          titleItalic="Ingen tjenester"
          titleTrail="definert"
          sub="Klikk «+ Ny tjeneste» øverst for å starte. Tjenester vises i booking-katalogen."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-secondary/40 text-left">
              <tr>
                <Th>Navn</Th>
                <Th>Beskrivelse</Th>
                <Th className="text-right">Varighet</Th>
                <Th className="text-right">Pris</Th>
                <Th>Status</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-border/60 last:border-0 hover:bg-secondary/30"
                >
                  <Td>
                    <span className="font-medium text-foreground">{s.name}</span>
                  </Td>
                  <Td>
                    <span className="text-muted-foreground">
                      {s.description ?? "—"}
                    </span>
                  </Td>
                  <Td className="text-right tabular-nums font-mono text-[13px]">{s.durationMin} min</Td>
                  <Td className="text-right tabular-nums font-mono text-[13px]">
                    {(s.priceOre / 100).toFixed(0)} kr
                  </Td>
                  <Td>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                        s.active
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {s.active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </Td>
                  <Td className="text-right">
                    <ServiceForm
                      initial={{
                        id: s.id,
                        name: s.name,
                        description: s.description,
                        priceOre: s.priceOre,
                        durationMin: s.durationMin,
                        active: s.active,
                      }}
                      triggerLabel="Endre"
                    />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children = null, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
