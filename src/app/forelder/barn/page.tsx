// Liste over alle koblede barn (synlig spesielt når forelder har flere enn ett).

import Link from "next/link";
import { ChevronRight, UserRound } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { PageHeader } from "@/components/shared/page-header";

export default async function MineBarn() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Foreldreportal · Barn"
        titleLead="Mine"
        titleItalic="barn"
        sub="Velg et barn for å se treningsprofilen."
      />

      {barn.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Ingen barn koblet til kontoen din.
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {barn.map((b) => (
            <li key={b.child.id}>
              <Link
                href={`/forelder/barn/${b.child.id}`}
                className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <UserRound className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="font-display text-base font-semibold">{b.child.name}</div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {b.relationship} · HCP {b.child.hcp ?? "—"}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
