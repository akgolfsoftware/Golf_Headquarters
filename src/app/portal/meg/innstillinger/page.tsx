import Link from "next/link";
import {
  Bell,
  Lock,
  Link2,
  Globe,
  Shield,
  Monitor,
  Trash2,
  Pencil,
  ChevronRight,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PageHeader } from "@/components/shared/page-header";

export default async function InnstillingerPage() {
  const user = await requirePortalUser();

  const name = user.name ?? "Markus Røinås Pedersen";
  const email = user.email ?? "markus.rp@example.com";
  const tier = user.tier ?? "PRO";
  const hcp = user.hcp != null ? String(user.hcp).replace(".", ",") : "+3,5";
  const homeClub = user.homeClub ?? "Søgne & Mandal GK";
  const initialer = name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto w-full max-w-[720px] space-y-8">
      <PageHeader
        eyebrow="Profil · Konto · Innstillinger"
        titleLead="Tilpass appen"
        titleItalic="til deg"
        sub="Velg hva du vil ha varsel om, hvem som ser hva, og hvilke tjenester PlayerHQ kobler seg til. Alle endringer lagres umiddelbart."
      />

      {/* Account block */}
      <section className="grid grid-cols-[56px_1fr_auto] items-center gap-4 rounded-xl border border-border bg-card px-6 py-5 shadow-sm sm:gap-6">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-primary font-display text-lg font-bold text-accent">
          {initialer || "?"}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-display text-base font-semibold tracking-tight text-foreground">
            {name}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {email}
          </span>
          <span className="mt-0.5 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">
            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold tracking-[0.10em] text-accent-foreground">
              {tier}
            </span>
            <span>HCP {hcp} · A1 · {homeClub}</span>
          </span>
        </div>
        <Link
          href="/portal/meg/profil/rediger"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Pencil className="h-3 w-3" strokeWidth={1.75} />
          Rediger profil
        </Link>
      </section>

      <section className="flex flex-col gap-3">
        <span className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Kategorier
        </span>

        <SettingCard
          href="/portal/meg/innstillinger"
          icon={<Bell className="h-5 w-5" strokeWidth={1.75} />}
          title="Notifikasjoner"
          desc="Velg hvilke varsler du vil ha — push, e-post, SMS"
          state={{ value: "7 av 12", label: "aktive" }}
        />
        <SettingCard
          href="/portal/meg/sikkerhet"
          icon={<Lock className="h-5 w-5" strokeWidth={1.75} />}
          title="Personvern"
          desc="Synlighet, datadeling, GDPR-eksport og sletting"
          pill="Synlig"
        />
        <SettingCard
          href="/portal/meg/innstillinger/integrasjoner"
          icon={<Link2 className="h-5 w-5" strokeWidth={1.75} />}
          title="Integrasjoner"
          desc="TrackMan · GolfBox · Strava · Apple Health"
          state={{ value: "3 koblet", label: "GolfBox, TrackMan, Apple Health" }}
        />
        <SettingCard
          href="/portal/meg/innstillinger"
          icon={<Globe className="h-5 w-5" strokeWidth={1.75} />}
          title="Språk og region"
          desc="Hva appen vises på og hvilken tidssone som regnes"
          state={{ value: "Norsk bokmål", label: "Europa/Oslo (UTC+2)" }}
        />
        <SettingCard
          href="/portal/meg/sikkerhet"
          icon={<Shield className="h-5 w-5" strokeWidth={1.75} />}
          title="Sikkerhet"
          desc="Passord, to-faktor-pålogging og pålitelige enheter"
          pill="2FA på"
        />
        <SettingCard
          href="/portal/meg/sikkerhet"
          icon={<Monitor className="h-5 w-5" strokeWidth={1.75} />}
          title="Apparater og økter"
          desc="Hvor du er logget inn akkurat nå"
          state={{ value: "2 aktive", label: "MacBook Air · iPhone 15" }}
        />
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/80">
          Faresone
        </span>
        <Link
          href="/portal/meg/sikkerhet"
          className="inline-flex w-fit items-center gap-2 py-1.5 text-sm text-destructive hover:underline"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          Slett konto permanent
        </Link>
      </section>

      <p className="pt-6 text-center font-display italic text-muted-foreground/80">
        «Mindre bryderi, mer golf.»
      </p>
    </div>
  );
}

function SettingCard({
  href,
  icon,
  title,
  desc,
  state,
  pill,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  state?: { value: string; label: string };
  pill?: string;
}) {
  return (
    <Link
      href={href}
      className="group grid grid-cols-[44px_1fr_auto] items-center gap-4 rounded-xl border border-border bg-card px-6 py-5 transition-all hover:-translate-y-px hover:border-primary hover:bg-primary/[0.03] sm:gap-5"
    >
      <div className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-muted text-primary transition-colors group-hover:bg-primary group-hover:text-accent">
        {icon}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-display text-[15.5px] font-semibold text-foreground">
          {title}
        </span>
        <span className="text-sm text-muted-foreground">{desc}</span>
      </div>
      <div className="flex items-center gap-3">
        {state && (
          <div className="hidden text-right font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground sm:block">
            <span className="block font-semibold text-foreground">
              {state.value}
            </span>
            {state.label}
          </div>
        )}
        {pill && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2 py-1 font-mono text-[10px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:rgb(44_125_82)]" />
            {pill}
          </span>
        )}
        <ChevronRight
          className="h-4 w-4 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
          strokeWidth={1.75}
        />
      </div>
    </Link>
  );
}
