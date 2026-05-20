import Link from "next/link";
import { ArrowLeft, RefreshCw, Sparkles } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { MalByggerClient } from "./bygger-client";

export default async function MalByggerPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "PARENT"] });
  const fornavn = user.name?.split(" ")[0] ?? "Markus";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center gap-4 border-b border-border bg-card px-8 py-[18px]">
        <Link
          href="/portal/mal"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Tilbake
        </Link>
        <span className="font-mono text-[13px] font-bold tracking-[0.02em] text-primary">
          AK GOLF · PLAYERHQ
        </span>
        <div className="ml-auto flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-foreground">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
          <span className="font-display text-[14px] font-semibold">
            AI <em className="font-display italic font-normal text-primary">mål-bygger</em>
          </span>
        </div>
        <button
          type="button"
          className="ml-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-transparent px-3 py-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:border-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-3 w-3" strokeWidth={1.75} />
          Start på nytt
        </button>
      </nav>

      <MalByggerClient fornavn={fornavn} />
    </div>
  );
}
