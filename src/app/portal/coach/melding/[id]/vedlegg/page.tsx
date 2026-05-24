import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { VedleggUi } from "./vedlegg-ui";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export default async function VedleggGalleriPage({ params }: RouteProps) {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "PARENT"] });
  const { id } = await params;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="flex items-center gap-4 border-b border-border bg-card px-8 py-[18px]">
        <Link
          href={`/portal/coach/melding/${id}`}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Tilbake til tråd
        </Link>
        <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
          /portal / coach / melding / {id.slice(0, 9)} /{" "}
          <span className="font-semibold text-foreground">vedlegg</span>
        </span>
      </nav>

      <VedleggUi />
    </div>
  );
}
