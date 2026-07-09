/**
 * /admin/gjennomfore — AgencyOS Gjennomføre hub
 *
 * v13-kalibrert (design-bølge D2): AgPage + AgPageHead + nav-kort komponert
 * lokalt med Tailwind-tokens (erstatter gamle HubFrame/hubs.css med rå hex).
 * Alle tall er ekte Prisma — «—» der kilde mangler, aldri fabrikkerte verdier.
 */

import Link from "next/link";
import {
  Activity,
  Calendar,
  CalendarCheck,
  Clock,
  CreditCard,
  Gauge,
  MapPin,
  Radio,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgPage, AgPageHead } from "@/components/admin/agencyos/ui";
import { cn } from "@/lib/utils";
import { IDagButton, NyBookingButton } from "./gjennomfore-actions";

export const dynamic = "force-dynamic";

/**
 * Dato-grenser beregnes utenfor render-body (react-hooks/purity: Date.now()
 * kan ikke kalles i render). Kalles én gang per request fra server-funksjonen.
 */
function dagOgUkeVindu(): {
  dagStart: Date;
  dagSlutt: Date;
  ukeStart: Date;
  ukeSlutt: Date;
} {
  const dagStart = new Date();
  dagStart.setHours(0, 0, 0, 0);

  const dagSlutt = new Date(dagStart);
  dagSlutt.setDate(dagStart.getDate() + 1);

  const ukeStart = new Date(dagStart);
  ukeStart.setDate(dagStart.getDate() - ((dagStart.getDay() + 6) % 7)); // mandag

  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeStart.getDate() + 7); // neste mandag

  return { dagStart, dagSlutt, ukeStart, ukeSlutt };
}

const AKTIVE_STATUSER = ["CONFIRMED", "PENDING"] as const;

/** Nav-kort for hub — lokal v13-komposisjon (ui.tsx-tokens, ingen hubs.css). */
function HubNavCard({
  href,
  icon: Icon,
  eyebrow,
  title,
  data,
  sub,
  empty = false,
  cta = "Åpne →",
}: {
  href: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  data: ReactNode;
  sub?: ReactNode;
  empty?: boolean;
  cta?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-[200px] flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_28px_-8px_hsl(var(--foreground)/0.10)]",
        empty && "border-dashed",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary",
            empty && "opacity-55",
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
      </div>
      <div>
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {eyebrow}
        </div>
        <h3 className="mt-1 font-display text-lg font-semibold leading-[1.15] tracking-[-0.015em] text-foreground">
          {title}
        </h3>
      </div>
      <div className="h-px bg-border/50" />
      <div className="flex flex-1 flex-col gap-1.5">
        <div
          className={cn(
            "font-mono text-[13px] font-bold leading-[1.25]",
            empty ? "italic text-muted-foreground" : "text-foreground",
          )}
        >
          {data}
        </div>
        {sub && (
          <div className="font-mono text-[10.5px] leading-[1.4] text-muted-foreground">{sub}</div>
        )}
      </div>
      <div className="mt-auto pt-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-primary transition-colors group-hover:text-foreground">
        {cta}
      </div>
    </Link>
  );
}

export default async function GjennomforePage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const { dagStart, dagSlutt, ukeStart, ukeSlutt } = dagOgUkeVindu();

  const [okterIDag, okterDenneUka, antallAnlegg] = await Promise.all([
    prisma.booking.count({
      where: { startAt: { gte: dagStart, lt: dagSlutt }, status: { in: [...AKTIVE_STATUSER] } },
    }),
    prisma.booking.count({
      where: { startAt: { gte: ukeStart, lt: ukeSlutt }, status: { in: [...AKTIVE_STATUSER] } },
    }),
    prisma.location.count({ where: { active: true } }),
  ]);

  return (
    <AgPage>
      <AgPageHead
        eyebrow="AgencyOS · Coach"
        title="Daglig"
        italic="drift"
        lead={
          <>
            Kalender, bookinger, anlegg, tilgjengelighet og live-økter.{" "}
            <b className="font-semibold text-foreground">{okterIDag}</b>{" "}
            {okterIDag === 1 ? "økt" : "økter"} i dag ·{" "}
            <b className="font-semibold text-foreground">{okterDenneUka}</b> denne uka ·{" "}
            <b className="font-semibold text-foreground">{antallAnlegg}</b> anlegg.
          </>
        }
        actions={
          <>
            <IDagButton />
            <NyBookingButton />
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <HubNavCard
          href="/admin/kalender/uke"
          icon={Calendar}
          eyebrow="01 · Dagens drift"
          title="Coach-kalender"
          data={`${okterIDag} ${okterIDag === 1 ? "økt" : "økter"} i dag`}
          sub={`${okterDenneUka} denne uka`}
          cta="Åpne →"
        />
        <HubNavCard
          href="/admin/bookinger"
          icon={CalendarCheck}
          eyebrow="02 · Innkommende"
          title="Bookinger"
          data={`${okterDenneUka} denne uka`}
          sub="Behandle bekreftelser og avvisninger"
          cta="Behandle →"
        />
        <HubNavCard
          href="/admin/locations"
          icon={MapPin}
          eyebrow="03 · Lokasjoner"
          title="Anlegg"
          data={`${antallAnlegg} anlegg`}
          sub="Aktive lokasjoner"
          cta="Administrer →"
        />
        <HubNavCard
          href="/admin/availability"
          icon={Clock}
          eyebrow="04 · Åpne timer"
          title="Tilgjengelighet"
          data="—"
          sub="Sett åpne timer"
          cta="Sett →"
        />
        <HubNavCard
          href="/admin/kapasitet"
          icon={Gauge}
          eyebrow="05 · Belastning"
          title="Kapasitet"
          data="—"
          sub="Se kapasitet-trend"
          cta="Se trend →"
        />
        <HubNavCard
          href="/admin/services"
          icon={CreditCard}
          eyebrow="06 · Økonomi"
          title="Tjenester"
          data="—"
          sub="Prislister og tjenester"
          cta="Åpne →"
        />
        <HubNavCard
          href="/admin/trackman"
          icon={Radio}
          eyebrow="07 · Utstyr"
          title="TrackMan"
          data="—"
          sub="Aktive sesjoner"
          cta="Se live →"
        />
        <HubNavCard
          href="/admin/kalender"
          icon={Activity}
          eyebrow="08 · Øyeblikk"
          title="Live-økter"
          data="—"
          sub="Start ny økt fra kalender"
          empty
          cta="Start ny økt →"
        />
      </section>
    </AgPage>
  );
}
