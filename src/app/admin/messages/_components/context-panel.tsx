import Link from "next/link";
import {
  Calendar,
  FileText,
  ArrowUpRight,
  ClipboardCheck,
} from "lucide-react";

type Props = {
  spiller: {
    id: string;
    navn: string;
    initialer: string;
    tier: string;
    hcp: number | null;
    homeClub: string | null;
    medlemsSiden: Date;
  };
  meldingerAntall: number;
  sistOppdatert: Date;
};

export function ContextPanel({
  spiller,
  meldingerAntall,
  sistOppdatert,
}: Props) {
  const medlemsÅr = spiller.medlemsSiden.toLocaleDateString("nb-NO", {
    month: "long",
    year: "numeric",
  });

  return (
    <aside className="flex flex-col gap-4 overflow-y-auto border-l border-border bg-secondary/40 px-6 py-6">
      {/* Spiller-kort */}
      <div className="rounded-lg border border-border bg-card px-4 py-4">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-lg bg-muted font-display text-[16px] font-semibold">
            {spiller.initialer}
          </span>
          <div className="min-w-0">
            <div className="truncate font-display text-[15px] font-semibold tracking-tight">
              {spiller.navn}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {spiller.tier === "PRO" ? "PRO-medlem" : "Gratis-medlem"}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Stat
            k="Handicap"
            v={
              spiller.hcp != null
                ? spiller.hcp.toFixed(1).replace(".", ",")
                : "—"
            }
          />
          <Stat k="Hjemmeklubb" v={spiller.homeClub ?? "—"} />
          <Stat k="Medlem siden" v={medlemsÅr} />
          <Stat k="Meldinger i tråd" v={String(meldingerAntall)} />
        </div>
        <Link
          href={`/admin/spillere/${spiller.id}`}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Åpne profil
          <ArrowUpRight size={14} strokeWidth={1.5} />
        </Link>
      </div>

      {/* Tidslinje */}
      <div className="rounded-lg border border-border bg-card px-4 py-4">
        <h3 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Siste aktivitet
        </h3>
        <div className="relative pl-6">
          <span className="absolute bottom-1 left-1 top-1 w-px bg-border" />
          <TlItem
            when={sistOppdatert.toLocaleString("nb-NO", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
            now
          >
            <b className="font-semibold">Siste melding</b> i tråden
          </TlItem>
          <TlItem
            when={spiller.medlemsSiden.toLocaleDateString("nb-NO", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            })}
          >
            <b className="font-semibold">Opprettet konto</b>
          </TlItem>
        </div>
      </div>

      {/* Snarveier */}
      <div className="rounded-lg border border-border bg-card px-4 py-4">
        <h3 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          Snarveier
        </h3>
        <div className="flex flex-col gap-2">
          <Shortcut
            href={`/admin/spillere/${spiller.id}`}
            icon={<FileText size={14} strokeWidth={1.5} />}
          >
            Spiller-profil
          </Shortcut>
          <Shortcut
            href={`/admin/kalender?player=${spiller.id}`}
            icon={<Calendar size={14} strokeWidth={1.5} />}
          >
            Book økt
          </Shortcut>
          <Shortcut
            href={`/admin/spillere/${spiller.id}/workbench`}
            icon={<ClipboardCheck size={14} strokeWidth={1.5} />}
          >
            Treningsplan
          </Shortcut>
        </div>
      </div>
    </aside>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-t border-border py-1.5 text-[12px] first:border-t-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-foreground">{v}</span>
    </div>
  );
}

function TlItem({
  when,
  now,
  children,
}: {
  when: string;
  now?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative py-1.5 text-[12px]">
      <span
        className={`absolute -left-[18px] top-3 grid h-2 w-2 place-items-center rounded-full border-2 ${
          now ? "border-primary bg-primary" : "border-muted-foreground bg-card"
        }`}
      />
      <span className="block font-mono text-[10px] text-muted-foreground">
        {when}
      </span>
      <span className="text-foreground">{children}</span>
    </div>
  );
}

function Shortcut({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-start gap-2 rounded-md border border-border bg-card px-4 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
    >
      {icon}
      {children}
    </Link>
  );
}
