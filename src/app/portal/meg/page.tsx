import Image from "next/image";
import Link from "next/link";
import {
  Briefcase,
  HeartPulse,
  Shield,
  CalendarDays,
  Mail,
  Phone,
  Trophy,
  Building2,
  ChevronRight,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { lesPreferences } from "@/lib/preferences";
import { AvatarUpload } from "@/components/shared/avatar-upload";
import { ProfilRedigerTrigger } from "@/components/shared/profil-rediger-trigger";
import { ProfilForm } from "./profil-form";

export default async function MegProfil() {
  const user = await requirePortalUser();
  const prefs = lesPreferences(user);

  const parents = await prisma.parentRelation.findMany({
    where: { childId: user.id },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const fornavn = user.name.split(" ")[0] ?? user.name;
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";
  const isFree = user.tier === "GRATIS";

  return (
    <div className="space-y-8">
      {/* Profil-hero */}
      <header className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-background to-secondary p-6 md:p-8 dark:from-card dark:to-card">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="flex items-start gap-4 md:gap-6">
            <span className="relative shrink-0">
              <span className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-primary text-2xl font-semibold text-primary-foreground md:h-24 md:w-24 md:text-3xl">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt=""
                    width={96}
                    height={96}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  initial
                )}
              </span>
              <span
                className={`absolute -bottom-1 -right-1 rounded-sm border-2 border-background px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${
                  isFree
                    ? "bg-secondary text-muted-foreground"
                    : "bg-accent text-accent-foreground"
                }`}
              >
                {isFree ? "Free" : "Pro"}
              </span>
            </span>
            <div className="min-w-0">
              <span className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
                PlayerHQ · Min profil
              </span>
              <h1 className="mt-2 font-display text-3xl font-normal italic leading-[1.05] tracking-tight text-foreground md:text-[40px]">
                Hei, {fornavn}.
              </h1>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Bilde, navn og kontaktinfo. Endringer her synes for coach og — om
                du er under 18 — for foresatte.
              </p>
            </div>
          </div>

          {/* Kontaktinfo-grid + redigerings-knapp */}
          <div className="flex flex-col items-stretch gap-4 md:max-w-xs">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <InfoItem icon={Mail} label="E-post" value={user.email} mono />
              <InfoItem
                icon={Phone}
                label="Telefon"
                value={user.phone ?? "—"}
              />
              <InfoItem
                icon={Building2}
                label="Klubb"
                value={user.homeClub ?? "—"}
              />
              <InfoItem
                icon={Trophy}
                label="HCP"
                value={
                  user.hcp != null
                    ? user.hcp.toFixed(1).replace(".", ",")
                    : "—"
                }
                mono
              />
            </dl>
            <ProfilRedigerTrigger
              variant="ghost"
              label="Rediger raskt"
              className="self-end"
              initial={{
                name: user.name,
                email: user.email,
                phone: user.phone ?? "",
                hcp: user.hcp ?? null,
                playingYears: user.playingYears ?? null,
                homeClub: user.homeClub ?? "",
                ambition: user.ambition ?? "",
                fodselsdato: "",
                adresse: "",
                kjonn: "Vil ikke oppgi",
                dominantHand: "Høyrehendt",
              }}
            />
          </div>
        </div>
      </header>

      {/* Hurtigvalg-grid */}
      <section>
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Hurtigvalg
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Hurtigvalg
            href="/portal/meg/utstyrsbag"
            icon={Briefcase}
            tittel="Utstyrsbag"
            beskrivelse="Køller og settings"
          />
          <Hurtigvalg
            href="/portal/meg/helse"
            icon={HeartPulse}
            tittel="Helse"
            beskrivelse="Skader og status"
          />
          <Hurtigvalg
            href="/portal/meg/sikkerhet"
            icon={Shield}
            tittel="Sikkerhet"
            beskrivelse="Passord og 2FA"
          />
          <Hurtigvalg
            href="/portal/meg/bookinger"
            icon={CalendarDays}
            tittel="Bookinger"
            beskrivelse="Mine kommende økter"
          />
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-sm font-semibold tracking-tight">
          Profilbilde
        </h2>
        <AvatarUpload name={user.name} avatarUrl={user.avatarUrl} />
      </section>

      <ProfilForm
        initial={{
          name: user.name,
          phone: user.phone,
          hcp: user.hcp,
          playingYears: user.playingYears,
          ambition: user.ambition,
          homeClub: user.homeClub,
          email: user.email,
          tier: user.tier,
          avatarUrl: user.avatarUrl,
        }}
        prefs={prefs}
        parents={parents.map((p) => ({
          id: p.id,
          name: p.parent.name,
          email: p.parent.email,
          phone: p.parent.phone,
          relationship: p.relationship,
          approved: p.approved,
        }))}
      />
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
        strokeWidth={1.75}
      />
      <div className="min-w-0">
        <dt className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
          {label}
        </dt>
        <dd
          className={`mt-0.5 truncate text-sm text-foreground ${
            mono ? "font-mono tabular-nums" : ""
          }`}
        >
          {value}
        </dd>
      </div>
    </div>
  );
}

function Hurtigvalg({
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
      className="group flex items-start gap-4 rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-secondary/40"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-secondary text-foreground">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-sm font-semibold tracking-tight text-foreground">
            {tittel}
          </span>
          <ChevronRight
            className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5"
            strokeWidth={1.75}
          />
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {beskrivelse}
        </p>
      </div>
    </Link>
  );
}
