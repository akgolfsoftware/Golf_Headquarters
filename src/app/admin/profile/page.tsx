import Link from "next/link";
import { AlertTriangle, ExternalLink, ImagePlus } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { EditProfileForm } from "./edit-form";

type Field = { label: string; value: string; mono?: boolean };

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function AdminProfilePage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const personFields: Field[] = [
    { label: "Fullt navn", value: user.name },
    { label: "E-post", value: user.email, mono: true },
    { label: "Mobil", value: user.phone ?? "Ikke registrert", mono: true },
    {
      label: "Handicap",
      value: user.hcp != null ? String(user.hcp) : "Ikke registrert",
      mono: true,
    },
    {
      label: "Hjemmeklubb",
      value: user.homeClub ?? "Ikke registrert",
    },
  ];

  const prefs =
    user.preferences &&
    typeof user.preferences === "object" &&
    !Array.isArray(user.preferences)
      ? (user.preferences as Record<string, unknown>)
      : {};

  function asStringArray(v: unknown, fallback: string[]): string[] {
    if (Array.isArray(v)) return v.filter((s): s is string => typeof s === "string");
    return fallback;
  }

  const bioStored = user.ambition ?? "";
  const bio = bioStored || "Legg til en kort bio som vises på offentlig profil.";
  const certifications = asStringArray(prefs.certifications, []);
  const languages = asStringArray(prefs.languages, ["Norsk"]);
  const clubs = asStringArray(
    prefs.clubs,
    user.homeClub ? [user.homeClub] : [],
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            CoachHQ · Konto · Profil
          </span>
          <h1 className="mt-2 font-display text-[22px] sm:text-[28px] md:text-[36px] font-medium italic leading-[1.1] tracking-tight">
            Profilen din.{" "}
            <em className="italic text-primary">Slik den ser ut</em> for spillerne.
          </h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Endringer du gjør her vises på akgolf.no/coach innen 5 minutter.
          </p>
        </div>
        <EditProfileForm
          initial={{
            navn: user.name,
            epost: user.email,
            phone: user.phone ?? "",
            hcp: user.hcp != null ? String(user.hcp).replace(".", ",") : "",
            homeClub: user.homeClub ?? "",
            bio: bioStored,
            certifications: certifications.join(", "),
            languages: languages.join(", "),
            clubs: clubs.join(", "),
          }}
        />
      </header>

      <div className="grid grid-cols-[320px_1fr] items-start gap-8">
        <aside className="sticky top-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
          <div className="relative flex justify-center">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-primary font-display text-[32px] font-semibold text-primary-foreground">
              {initials(user.name) || "AK"}
            </div>
          </div>
          <div className="mt-1 text-center">
            <div className="font-display text-[24px] font-semibold tracking-tight">
              {user.name}
            </div>
            <div className="mt-0.5 text-[13px] text-muted-foreground">
              {user.role === "ADMIN" ? "Administrator" : "Coach"} · AK Golf
            </div>
          </div>
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.04em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Aktiv {user.role === "ADMIN" ? "admin" : "coach"}
          </div>
          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <StatRow l="Tier" v={user.tier} />
            <StatRow
              l="Opprettet"
              v={user.createdAt.toLocaleDateString("nb-NO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            />
            <StatRow l="Klubb" v={user.homeClub ?? "—"} />
          </div>
          <Link
            href="/"
            className="flex items-center justify-between rounded-sm border border-border bg-secondary p-3 text-[12px] text-foreground transition-colors hover:bg-secondary/80"
          >
            <span>Se offentlig profil</span>
            <ExternalLink size={14} strokeWidth={1.5} />
          </Link>
        </aside>

        <div className="flex flex-col gap-6">
          <Section title="Personalia" aux="Synlig for spillere">
            {personFields.map((f) => (
              <FieldRow key={f.label} {...f} />
            ))}
          </Section>

          <Section title="Profesjonelt" aux="Vises på offentlig profil">
            <div className="grid grid-cols-[180px_1fr_auto] items-start gap-6 border-b border-border px-6 py-5 last:border-b-0">
              <div>
                <span className="text-[13px] font-medium text-muted-foreground">
                  Bio
                </span>
                <small className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                  Maks 280 tegn
                </small>
              </div>
              <div className="text-[14px] leading-relaxed">{bio}</div>
              <span aria-hidden />
            </div>
            <ChipRow
              label="Sertifiseringer"
              chips={certifications}
              empty="Legg til sertifisering"
              variant="accent"
            />
            <ChipRow label="Språk" chips={languages} empty="Legg til språk" />
            <ChipRow
              label="Klubb-tilknytning"
              chips={clubs}
              empty="Legg til klubb"
              mono
            />
          </Section>

          <Section title="Galleri" aux="4 bilder vises på offentlig profil">
            <div className="grid grid-cols-2 gap-3 p-4">
              <GalleryEmpty />
              <GalleryEmpty />
              <GalleryEmpty />
              <GalleryEmpty />
            </div>
          </Section>

          <DangerZone />
        </div>
      </div>
    </div>
  );
}

function StatRow({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex items-center justify-between px-1 py-2 text-[13px]">
      <span className="text-muted-foreground">{l}</span>
      <span className="font-mono font-medium">{v}</span>
    </div>
  );
}

function Section({
  title,
  aux,
  children,
}: {
  title: string;
  aux: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-md border border-border bg-card">
      <div className="flex items-baseline justify-between border-b border-border px-6 py-4">
        <h2 className="font-display text-base font-semibold tracking-tight">
          {title}
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
          {aux}
        </span>
      </div>
      <div>{children}</div>
    </section>
  );
}

function FieldRow({ label, value, mono }: Field) {
  return (
    <div className="grid grid-cols-[180px_1fr_auto] items-center gap-6 border-b border-border px-6 py-4 last:border-b-0">
      <span className="text-[13px] font-medium text-muted-foreground">
        {label}
      </span>
      <span className={`text-[14px] ${mono ? "font-mono" : ""}`}>{value}</span>
      <span aria-hidden />
    </div>
  );
}

function ChipRow({
  label,
  chips,
  empty,
  variant = "default",
  mono = false,
}: {
  label: string;
  chips: string[];
  empty: string;
  variant?: "default" | "accent";
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr_auto] items-center gap-6 border-b border-border px-6 py-4 last:border-b-0">
      <span className="text-[13px] font-medium text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {chips.length === 0 ? (
          <span className="text-[13px] text-muted-foreground">{empty}</span>
        ) : (
          chips.map((c) => (
            <span
              key={c}
              className={`rounded-sm px-2 py-1 text-[11px] font-medium ${
                variant === "accent"
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary text-foreground"
              } ${mono ? "font-mono tracking-[0.02em]" : ""}`}
            >
              {c}
            </span>
          ))
        )}
      </div>
      <span aria-hidden />
    </div>
  );
}

function GalleryEmpty() {
  return (
    <div className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border-[1.5px] border-dashed border-border text-muted-foreground">
      <ImagePlus size={24} strokeWidth={1.5} />
      <span className="text-[11px]">Last opp</span>
    </div>
  );
}

function DangerZone() {
  return (
    <section className="overflow-hidden rounded-md border border-destructive/30 bg-destructive/5">
      <div className="flex items-center gap-2 border-b border-destructive/30 px-6 py-4">
        <AlertTriangle
          size={16}
          strokeWidth={1.5}
          className="text-destructive"
        />
        <h3 className="font-display text-sm font-semibold tracking-tight text-destructive">
          Farlig sone
        </h3>
      </div>
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <div className="text-[13px] font-semibold">Skjul offentlig profil</div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">
            Spillere kan fortsatt finne deg via direkte lenke
          </div>
        </div>
        <button
          type="button"
          className="rounded-sm border border-destructive/40 px-3 py-2 text-[12px] font-medium text-destructive"
        >
          Skjul
        </button>
      </div>
    </section>
  );
}
