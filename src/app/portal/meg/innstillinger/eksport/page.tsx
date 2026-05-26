import Link from "next/link";
import { ChevronLeft, Download, FileText, ShieldCheck } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";

export default async function EksportPage() {
  await requirePortalUser();

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 pb-20 sm:px-6">
      <Link
        href="/portal/meg/innstillinger"
        className="inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft size={14} strokeWidth={1.5} />
        Tilbake til innstillinger
      </Link>

      <header className="space-y-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          PlayerHQ · Meg · Innstillinger · Eksport
        </span>
        <h1 className="font-display text-[28px] sm:text-[36px] italic font-medium leading-[1.05] tracking-tight">
          <em className="font-normal italic">Eksport av data</em>
        </h1>
        <p className="text-sm text-muted-foreground">
          Last ned alle dine data — runder, økter, TrackMan-shots, kommentarer
          og planer. Dette er din rett etter GDPR.
        </p>
      </header>

      {/* GDPR-info */}
      <div className="flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-4 text-sm">
        <ShieldCheck size={16} strokeWidth={1.5} className="mt-0.5 text-primary" />
        <div>
          <p className="font-semibold text-foreground">Din rett til data-portabilitet</p>
          <p className="mt-1 text-muted-foreground">
            Etter GDPR har du rett til å laste ned alle data vi har lagret om
            deg. Eksport-jobber kjøres bakgrunns og sendes til e-posten din når
            ferdig.
          </p>
        </div>
      </div>

      <EmptyState
        icon={Download}
        titleItalic="Eksport-funksjonen"
        titleTrail="kommer Q2 2026"
        sub="Vi jobber med en sikker, signert eksport-pipeline. Inntil videre kan du kontakte personvern@akgolf.no for å få utlevert dataene dine."
        cta={
          <a
            href="mailto:personvern@akgolf.no?subject=Forespørsel%20om%20data-eksport"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-[13px] font-semibold text-primary-foreground hover:opacity-90"
          >
            <FileText size={14} strokeWidth={1.5} />
            Be om eksport via e-post
          </a>
        }
      />
    </div>
  );
}
