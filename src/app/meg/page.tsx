// /meg — dashboard for Meg-assistenten. Server component, låst til ADMIN.
// Viser siste morgenbrief, ventende bekreftelser, og siste logg. Funksjonell
// v1 — den polerte fler-skjerm-versjonen bygges etter Anders kjører Claude
// Design-promptene (lagret i Google Drive inbox/meg-assistent-design-prompter.md).
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { adminSubject } from "@/lib/meg/access";
import { hentBriefer, hentVentende, hentNylige } from "@/lib/meg/read";
import { AthleticEyebrow, AthleticBadge } from "@/components/athletic";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  morgenbrief: "Morgenbrief",
  kveldsjournal: "Kveldsjournal",
  loftesjekk: "Løftesjekk",
  crm_nudge: "CRM-nudge",
};

function dato(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function MegDashboard() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();

  const subject = adminSubject() ?? "";
  const [briefer, ventende, logg] = await Promise.all([
    hentBriefer(subject, 8),
    hentVentende(subject, 10),
    hentNylige(subject, 12),
  ]);

  const sisteMorgenbrief = briefer.find((b) => b.kind === "morgenbrief") ?? briefer[0] ?? null;

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <AthleticEyebrow>Meg</AthleticEyebrow>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Hei, {user.name?.split(" ")[0] ?? "Anders"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Personlig assistent. Snakk inn via Telegram — her ser du briefer, ventende
          bekreftelser og siste logg.
        </p>
      </header>

      {/* Siste brief */}
      <section className="space-y-3">
        <AthleticEyebrow>Siste brief</AthleticEyebrow>
        {sisteMorgenbrief ? (
          <article className="rounded-xl border border-border bg-card p-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
                {KIND_LABEL[sisteMorgenbrief.kind] ?? sisteMorgenbrief.kind}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {dato(sisteMorgenbrief.created_at)}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {sisteMorgenbrief.content}
            </p>
          </article>
        ) : (
          <p className="text-sm text-muted-foreground">
            Ingen briefer ennå. De kommer automatisk når cron-jobbene kjører.
          </p>
        )}
      </section>

      {/* Ventende bekreftelser */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <AthleticEyebrow>Venter på BEKREFT</AthleticEyebrow>
          {ventende.length > 0 && <AthleticBadge variant="urgent">{ventende.length}</AthleticBadge>}
        </div>
        {ventende.length ? (
          <ul className="space-y-2">
            {ventende.map((p) => (
              <li key={p.id} className="rounded-lg border border-border bg-card p-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">{p.tool_name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{dato(p.created_at)}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm">{p.summary}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Ingenting venter på bekreftelse.</p>
        )}
      </section>

      {/* Siste logg */}
      <section className="space-y-3">
        <AthleticEyebrow>Siste logg</AthleticEyebrow>
        {logg.length ? (
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {logg.map((r) => (
              <li key={r.id} className="flex items-start gap-3 p-3">
                <AthleticBadge variant="neutral">{r.kind}</AthleticBadge>
                <span className="flex-1 text-sm">{r.text}</span>
                <span className="font-mono text-xs text-muted-foreground">{dato(r.created_at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Ingen logg ennå.</p>
        )}
      </section>
    </div>
  );
}
