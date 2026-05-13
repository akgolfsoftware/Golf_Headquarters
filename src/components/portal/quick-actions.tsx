import Link from "next/link";
import { CalendarPlus, Sparkles, Send } from "lucide-react";

type Props = {
  erAcademyKunde: boolean;
  creditsRemaining?: number;
  monthlyCredits?: number;
};

/**
 * Hurtigtilgang-widget på PlayerHQ-hjemmesiden.
 * Viser 3 primære handlinger spilleren ofte vil starte fra:
 * - Book time (intern credit-flyt for Academy-kunder, ellers drop-in)
 * - Ny økt (registrer egen treningsøkt manuelt)
 * - Ønskelig økt (be coach om økt-tema)
 */
export function QuickActions({
  erAcademyKunde,
  creditsRemaining,
  monthlyCredits,
}: Props) {
  const bookHref = erAcademyKunde ? "/portal/booking/ny" : "/booking";
  const bookSub =
    erAcademyKunde && creditsRemaining !== undefined && monthlyCredits
      ? `${creditsRemaining}/${monthlyCredits} timer igjen`
      : "Velg coach og tid";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <ActionCard
        href={bookHref}
        icon={CalendarPlus}
        tittel="Book time"
        beskrivelse={bookSub}
      />
      <ActionCard
        href="/portal/ny-okt"
        icon={Sparkles}
        tittel="Ny økt"
        beskrivelse="Registrer egen treningsøkt"
      />
      <ActionCard
        href="/portal/onskeligokt"
        icon={Send}
        tittel="Ønskelig økt"
        beskrivelse="Be coach om økt-tema"
      />
    </div>
  );
}

function ActionCard({
  href,
  icon: Icon,
  tittel,
  beskrivelse,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tittel: string;
  beskrivelse: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 active:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-display text-sm font-semibold tracking-tight text-foreground group-hover:text-primary">
          {tittel}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {beskrivelse}
        </div>
      </div>
      <span className="text-muted-foreground group-hover:text-primary">→</span>
    </Link>
  );
}
