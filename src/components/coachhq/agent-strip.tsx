import { Sparkles } from "lucide-react";

/**
 * AgentStrip — AI-coach hint banner.
 * Direkte fra wireframe/design-package/project/coachhq-A/02-plan-bygger.html (linje 23-33).
 *
 * Brukes for å vise AI-assistentens forslag, observasjoner eller status.
 * Forest-til-lime gradient bakgrunn + lime venstre-border + AK-avatar.
 */
export function AgentStrip({
  label = "AK-AGENT",
  children,
  initials = "AK",
}: {
  label?: string;
  children: React.ReactNode;
  initials?: string;
}) {
  return (
    <div
      className="flex items-center gap-3.5 rounded-2xl border border-l-[4px] border-primary/20 border-l-primary px-4 py-3.5"
      style={{
        background:
          "linear-gradient(135deg, rgba(0,88,64,0.06) 0%, rgba(209,248,67,0.10) 100%)",
      }}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-[11px] font-bold leading-none text-accent">
        {initials}
      </div>
      <div className="flex-1">
        <div className="mb-1 font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.10em] text-muted-foreground">
          <Sparkles className="-mt-0.5 mr-1 inline h-3 w-3" strokeWidth={1.75} />
          {label}
        </div>
        <div className="max-w-[720px] text-[13px] leading-relaxed text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}
