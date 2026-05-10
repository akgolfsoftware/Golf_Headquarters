import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import {
  getBriefData,
  bygBriefSystemPrompt,
  bygBriefUserPrompt,
} from "@/lib/admin-brief";
import { anthropicKlient, COACH_MODEL } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

export default async function DagligBrief() {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const data = await getBriefData(coach);

  let aiBrief: string | null = null;
  let aiFeil: string | null = null;
  try {
    const klient = anthropicKlient();
    const respons = await klient.messages.create({
      model: COACH_MODEL,
      max_tokens: 400,
      system: bygBriefSystemPrompt(),
      messages: [{ role: "user", content: bygBriefUserPrompt(data) }],
    });
    aiBrief = respons.content
      .filter((b) => b.type === "text")
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");
  } catch (err) {
    aiFeil = err instanceof Error ? err.message : "AI-brief utilgjengelig.";
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Hub
      </Link>

      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {new Date().toLocaleDateString("nb-NO", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Daglig</em> brief
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          AI-generert oppsummering av dagen. Genereres på nytt ved hvert besøk.
        </p>
      </header>

      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
        {aiBrief ? (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
            {aiBrief}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">
            {aiFeil
              ? `Kunne ikke generere AI-brief: ${aiFeil}`
              : "Genererer brief…"}
          </p>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card label="Dagens timer">
          {data.dagensTimer.antall === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen bookinger.</p>
          ) : (
            <p className="font-display text-2xl font-semibold tabular-nums">
              {data.dagensTimer.antall}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {data.dagensTimer.start?.toLocaleTimeString("nb-NO", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                –
                {data.dagensTimer.slutt?.toLocaleTimeString("nb-NO", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          )}
        </Card>
        <Card label="Ventende godkjenninger">
          <p className="font-display text-2xl font-semibold tabular-nums">
            {data.ventendeGodkjenninger}
          </p>
        </Card>
        <Card label="Ubesvart">
          <p className="font-display text-2xl font-semibold tabular-nums">
            {data.ubesvarteMeldinger}
          </p>
        </Card>
        <Card label="Siste 7 dager (agent-output)">
          <p className="text-sm">
            {data.ukenGenerert.signals} signals · {data.ukenGenerert.planActions}{" "}
            plan-forslag
          </p>
        </Card>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-semibold tracking-tight">
          Nyligste runder
        </h3>
        {data.nyligeRunder.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Ingen registrerte runder siste 24 timer.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {data.nyligeRunder.map((r, i) => (
              <li
                key={i}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div>
                  <span className="font-medium text-foreground">{r.spiller}</span>
                  <span className="ml-3 text-muted-foreground">{r.bane}</span>
                </div>
                <span className="font-mono text-sm tabular-nums text-foreground">
                  {r.sgTotal != null
                    ? `${r.sgTotal >= 0 ? "+" : ""}${r.sgTotal.toFixed(1).replace(".", ",")} SG`
                    : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </div>
  );
}
