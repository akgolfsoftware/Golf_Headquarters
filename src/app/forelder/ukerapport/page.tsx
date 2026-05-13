// Ukerapport — historiske oppsummeringer per barn.
// WeeklyReport-tabell finnes ikke ennå — derfor placeholder med info.

import { Mail } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { PageHeader } from "@/components/shared/page-header";

export default async function Ukerapport() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Foreldreportal · Rapport"
        titleLead="Ukerapport"
        titleItalic="hver fredag"
        sub="Sammendrag av treningsuken sendes på e-post hver fredag kveld."
      />

      <section className="rounded-xl border border-border bg-card p-6">
        <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          <Mail className="h-3 w-3" strokeWidth={1.5} />
          Abonnement
        </div>
        <p className="mt-3 text-sm">
          Du mottar ukerapport for:
        </p>
        <ul className="mt-3 space-y-2">
          {barn.map((b) => (
            <li key={b.child.id} className="rounded-md bg-muted px-4 py-2 text-sm">
              <span className="font-semibold">{b.child.name}</span>{" "}
              <span className="text-muted-foreground">— {b.child.email}</span>
            </li>
          ))}
          {barn.length === 0 ? (
            <li className="text-sm text-muted-foreground">Ingen barn koblet ennå.</li>
          ) : null}
        </ul>
        <p className="mt-6 text-xs text-muted-foreground">
          Arkiv over tidligere ukerapporter kommer i en senere versjon.
        </p>
      </section>
    </div>
  );
}
