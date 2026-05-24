import Link from "next/link";
import { ChevronLeft, Laptop, ShieldCheck } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";

export default async function OkterPage() {
  await requirePortalUser();

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <Link
        href="/portal/meg/innstillinger"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft size={14} strokeWidth={1.5} />
        Tilbake til innstillinger
      </Link>

      <header className="space-y-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          PlayerHQ · Meg · Innstillinger · Apparater
        </span>
        <h1 className="font-display text-[28px] sm:text-[36px] italic font-medium leading-[1.05] tracking-tight">
          <em className="font-normal italic">Apparater og økter</em>
        </h1>
        <p className="text-sm text-muted-foreground">
          Se hvor du er logget inn og administrer aktive sesjoner. Logg ut alle
          andre enheter med ett klikk.
        </p>
      </header>

      {/* Sikkerhets-info */}
      <div className="flex items-start gap-3 rounded-md border border-primary/30 bg-primary/5 p-4 text-sm">
        <ShieldCheck size={16} strokeWidth={1.5} className="mt-0.5 text-primary" />
        <div>
          <p className="font-semibold text-foreground">Sikker tilgang</p>
          <p className="mt-1 text-muted-foreground">
            Alle sesjoner krypteres via Supabase Auth. Du kan trygt logge ut
            denne enheten via &laquo;Logg ut&raquo;-knappen i hovedmenyen.
          </p>
        </div>
      </div>

      <EmptyState
        icon={Laptop}
        titleItalic="Apparat-oversikt"
        titleTrail="kommer Q3 2026"
        sub="Vi bygger en oversikt der du kan se alle dine aktive innlogginger og logge ut spesifikke enheter."
      />
    </div>
  );
}
