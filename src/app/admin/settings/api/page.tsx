import Link from "next/link";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { CreateApiKeyModal } from "./create-key-modal";
import { RevokeButton } from "./revoke-button";
import { CopyPrefixButton } from "./copy-prefix-button";

function formatDate(d: Date) {
  return d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function relative(d: Date) {
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "nå nettopp";
  if (min < 60) return `${min} min siden`;
  const t = Math.floor(min / 60);
  if (t < 24) return `${t}t siden`;
  const dg = Math.floor(t / 24);
  return `${dg} dag${dg === 1 ? "" : "er"} siden`;
}

export default async function AdminApiKeysPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const keys = await prisma.apiKey.findMany({
    where: user.role === "ADMIN" ? {} : { userId: user.id },
    include: { user: { select: { name: true } } },
    orderBy: [{ revokedAt: "asc" }, { createdAt: "desc" }],
  });

  const aktive = keys.filter((k) => !k.revokedAt).length;

  return (
    <div className="space-y-8">
      <Link
        href="/admin/settings"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Innstillinger
      </Link>

      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Innstillinger · API
        </span>
        <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
          <em className="italic text-primary">API-nøkler</em> og integrasjoner
        </h1>
        <p className="mt-2 max-w-[640px] text-[13px] text-muted-foreground">
          Generer nøkler for eksterne verktøy som skal lese eller skrive data
          fra CoachHQ. {aktive} aktiv{aktive === 1 ? "" : "e"} · {keys.length}{" "}
          totalt.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-card">
        <header className="flex items-center gap-3 border-b border-border px-6 py-4">
          <h2 className="font-display text-base font-semibold tracking-tight">
            API-nøkler
          </h2>
          <span className="text-[12px] text-muted-foreground">
            Brukes av eksterne verktøy for å lese data fra CoachHQ
          </span>
          <div className="ml-auto">
            <CreateApiKeyModal />
          </div>
        </header>

        {keys.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-display text-base text-foreground">
              <em className="italic">Ingen</em> API-nøkler ennå
            </p>
            <p className="mt-2 text-[13px] text-muted-foreground">
              Generer en nøkkel for å la et eksternt verktøy lese eller skrive
              data fra CoachHQ.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {keys.map((k) => {
              const erRevokert = k.revokedAt != null;
              const scopes = Array.isArray(k.scopes) ? (k.scopes as string[]) : [];
              return (
                <div
                  key={k.id}
                  className={`grid grid-cols-[1fr_220px_160px_72px] items-center gap-4 px-6 py-4 ${
                    erRevokert ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex min-w-0 flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium text-foreground">
                        {k.name}
                      </span>
                      {erRevokert ? (
                        <span className="rounded-sm bg-destructive/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-destructive">
                          Revokert
                        </span>
                      ) : (
                        <span className="rounded-sm bg-accent/40 px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                          {scopes.length === 0 ? "Ingen scopes" : `${scopes.length} scope${scopes.length === 1 ? "" : "s"}`}
                        </span>
                      )}
                      {user.role === "ADMIN" && (
                        <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                          · {k.user.name}
                        </span>
                      )}
                    </div>
                    <div className="inline-flex w-fit items-center gap-2 rounded-sm border border-border bg-secondary px-2 py-1 font-mono text-[12px] text-muted-foreground">
                      {k.prefix}…
                      <CopyPrefixButton prefix={k.prefix} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {scopes.map((s) => (
                      <span
                        key={s}
                        className="rounded-sm border border-border bg-card px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="text-right font-mono text-[11px] leading-snug">
                    <div className="text-muted-foreground">
                      Brukt{" "}
                      <span className="font-medium text-foreground">
                        {k.lastUsedAt ? relative(k.lastUsedAt) : "aldri"}
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      Opprettet {formatDate(k.createdAt)}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    {erRevokert ? (
                      <button
                        type="button"
                        disabled
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground"
                        aria-label="Ingen handlinger"
                      >
                        <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    ) : (
                      <RevokeButton keyId={k.id} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* TODO: Integrasjoner og webhooks — krever egen modell og handlers */}
      <section className="rounded-lg border border-dashed border-border bg-card/40 p-6">
        <h2 className="font-display text-base font-semibold tracking-tight">
          Integrasjoner
        </h2>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Trackman, FlightScope, Garmin, Zapier og NGF Golfbox kommer her når
          integrasjons-laget er ferdig. Inntil da bruker du API-nøkler over.
        </p>
      </section>
    </div>
  );
}
