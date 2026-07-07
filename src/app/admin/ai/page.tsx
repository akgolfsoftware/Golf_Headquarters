import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgPage, AgPageHead } from "@/components/admin/agencyos/ui";
import { Bot } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AIWorkspacePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const { tab = "kode" } = await searchParams;

  const recentRuns = await prisma.agentRun.findMany({
    where: { agentName: { startsWith: "ai-code-session" } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentActions = await prisma.planAction.findMany({
    where: { actionType: "AI_CODE_SESSION" },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <AgPage>
      <AgPageHead 
        eyebrow="AI WORKSPACE" 
        title="Claude · Grok · Gemini" 
        italic="kode-sesjoner"
      />

      <div className="flex gap-2 mb-4 border-b border-border">
        <Link href="/admin/ai?tab=kode" className={`px-4 py-2 text-sm font-medium ${tab === 'kode' ? 'border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Kode-Sesjoner</Link>
        <Link href="/admin/ai?tab=chat" className={`px-4 py-2 text-sm font-medium ${tab === 'chat' ? 'border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Chat</Link>
        <Link href="/admin/ai?tab=agenter" className={`px-4 py-2 text-sm font-medium ${tab === 'agenter' ? 'border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>Agenter 24/7</Link>
      </div>

      <div className="grid gap-6">
        {tab === 'kode' && (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bot className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Multi-Modell Kode Sesjoner</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Velg modell og kjør full agent-sesjon direkte her. Kontekst fra akgolf-hq + akgolf-booking.
            </p>

            <form action="/admin/ai/run" method="POST" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Modell</label>
                <select name="model" className="border border-border rounded px-3 py-2 w-full bg-card">
                  <option value="claude">Claude (Anthropic)</option>
                  <option value="grok">Grok (xAI)</option>
                  <option value="gemini">Gemini (Google)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Repo / Område</label>
                <select name="repo" className="border border-border rounded px-3 py-2 w-full bg-card">
                  <option value="hq">akgolf-hq (AgencyOS + PlayerHQ)</option>
                  <option value="booking">akgolf-booking</option>
                  <option value="both">Begge</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Task / Instruksjon</label>
                <textarea 
                  name="task" 
                  className="border border-border rounded px-3 py-2 w-full h-24 bg-card"
                  defaultValue="Forbedre kalender i booking til å bruke ekte CoachAvailability + Booking data. Legg til bedre Plan-kobling i AgencyOS admin."
                />
              </div>
              <button type="submit" className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-semibold">
                Kjør kode-sesjon
              </button>
            </form>
          </div>
        )}

        {tab === 'chat' && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold mb-2">Chat med AI (Claude/Grok/Gemini)</h2>
            <p className="text-sm text-muted-foreground">Mock chat for nå. I full, koble til caddie eller multi LLM.</p>
            <textarea className="w-full border p-2 h-24" placeholder="Skriv spørsmål om booking eller kode..."></textarea>
            <button className="mt-2 px-4 py-2 bg-primary text-white rounded">Send</button>
          </div>
        )}

        {tab === 'agenter' && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-2">Agenter 24/7</h3>
            <p className="text-sm">Se /admin/agents for full liste og manuell trigger. Cron kjører dem 24/7.</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          Sesjoner logges som AgentRun. Godkjenn forslag før apply.
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold mb-2">Forslag til flere agenter (24/7 for deg)</h3>
          <ul className="text-sm space-y-1 list-disc pl-4">
            <li><strong>booking-optimizer</strong>: Analyserer bookinger, foreslår bedre availability. Kjør daglig via cron.</li>
            <li><strong>availability-24-7-monitor</strong>: Sjekker lav availability hver 15 min, lager alerts.</li>
            <li><strong>ai-code-reviewer</strong>: Ukentlig AI review av booking/calendar kode, foreslår forbedringer (bruk denne workspace).</li>
            <li><strong>booking-demand-predictor</strong>: Predikerer travle tider, auto-forslag til slots.</li>
            <li><strong>24-7-booking-alerts</strong>: Proactive varsler til spillere/coach via caddie når slots åpnes.</li>
          </ul>
          <p className="mt-2 text-xs">Slik 24/7: Legg til i vercel.json cron (f.eks. &apos;*/15 * * * *&apos; for monitor). Agenter lager PlanAction/Signal, du ser i /admin/agents og caddie. AI workspace kan trigge manuelt eller via cron for kode tasks. Alt logges, proactive via Telegram/caddie.</p>
        </div>

        {recentRuns.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-2">Siste AI kode-sesjoner</h3>
            <ul className="text-sm space-y-1">
              {recentRuns.map((run) => (
                <li key={run.id} className="font-mono text-xs">
                  {run.agentName} - {run.status} - {run.createdAt.toISOString().slice(0,16)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {recentActions.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-2">AI Kode Historikk & Apply</h3>
            <ul className="text-sm space-y-2">
              {recentActions.map((action) => (
                <li key={action.id} className="p-2 border rounded">
                  <div className="font-mono text-xs">{action.actionType} - {action.status}</div>
                  <div className="text-xs">{JSON.stringify(action.suggestion).slice(0,100)}...</div>
                  <form action={async () => {
                    "use server";
                    await prisma.planAction.update({ where: { id: action.id }, data: { status: "ACCEPTED" } });
                  }}>
                    <button type="submit" className="text-xs text-primary underline">Apply (godkjenn)</button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </AgPage>
  );
}
