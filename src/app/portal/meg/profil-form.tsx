"use client";

import { Button } from "@/components/athletic/golfdata";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  AlertTriangle,
  Plus,
  Mail,
  Phone,
} from "lucide-react";
import type { Tier } from "@/generated/prisma/client";
import type { UserPreferences } from "@/lib/preferences";
import { oppdaterProfil, oppdaterPreferences } from "./actions";

type ProfilInitial = {
  name: string;
  phone: string | null;
  hcp: number | null;
  playingYears: number | null;
  ambition: string | null;
  homeClub: string | null;
  school: string | null;
  prevSeasonAvgScore: number | null;
  email: string;
  tier: Tier;
  avatarUrl: string | null;
};

type Parent = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  relationship: string;
  approved: boolean;
};

type Props = {
  initial: ProfilInitial;
  prefs: UserPreferences;
  parents: Parent[];
};

export function ProfilForm({ initial, prefs, parents }: Props) {
  const router = useRouter();

  // Personalia + golf-info state
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [homeClub, setHomeClub] = useState(initial.homeClub ?? "");
  const [hcp, setHcp] = useState(initial.hcp != null ? String(initial.hcp) : "");
  const [playingYears, setPlayingYears] = useState(
    initial.playingYears != null ? String(initial.playingYears) : "",
  );
  const [ambition, setAmbition] = useState(initial.ambition ?? "");
  const [school, setSchool] = useState(initial.school ?? "");
  const [prevSeasonAvgScore, setPrevSeasonAvgScore] = useState(
    initial.prevSeasonAvgScore != null ? String(initial.prevSeasonAvgScore) : "",
  );

  // Personvern state (local, persisted via oppdaterPreferences)
  const [notifEpost, setNotifEpost] = useState(prefs.notif.epost);
  const [notifPush, setNotifPush] = useState(prefs.notif.push);
  const [notifPaaminnelse, setNotifPaaminnelse] = useState(
    prefs.notif.paaminnelse,
  );

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLagret(false);
    startTransition(async () => {
      try {
        await oppdaterProfil({
          name: name.trim(),
          phone: phone || null,
          hcp: hcp ? Number(hcp) : null,
          playingYears: playingYears ? Number(playingYears) : null,
          ambition: ambition || null,
          homeClub: homeClub || null,
          school: school || null,
          prevSeasonAvgScore: prevSeasonAvgScore ? Number(prevSeasonAvgScore) : null,
        });
        setLagret(true);
        router.refresh();
        setTimeout(() => setLagret(false), 2000);
      } catch {
        setError("Kunne ikke lagre. Prøv igjen.");
      }
    });
  }

  function togglePref(
    felt: "epost" | "push" | "paaminnelse",
    nyVerdi: boolean,
  ) {
    if (felt === "epost") setNotifEpost(nyVerdi);
    if (felt === "push") setNotifPush(nyVerdi);
    if (felt === "paaminnelse") setNotifPaaminnelse(nyVerdi);
    startTransition(async () => {
      try {
        await oppdaterPreferences({
          notif: {
            ...prefs.notif,
            [felt]: nyVerdi,
          },
        });
      } catch {
        // Revert ved feil
        if (felt === "epost") setNotifEpost(!nyVerdi);
        if (felt === "push") setNotifPush(!nyVerdi);
        if (felt === "paaminnelse") setNotifPaaminnelse(!nyVerdi);
      }
    });
  }

  return (
    <div className="flex min-w-0 flex-col gap-8">
      <div>
        <form onSubmit={lagre} className="flex flex-col gap-8">
          {/* Personalia */}
          <Section title="Personalia" aux="Hvem du er">
            <FieldRow label="Fullt navn">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputCss}
              />
            </FieldRow>

            <FieldRow
              label="E-post"
              hint="Kan ikke endres"
              badge={{ icon: Mail, text: "Innlogging" }}
            >
              <input
                type="email"
                value={initial.email}
                disabled
                className={`${inputCss} cursor-not-allowed bg-muted text-muted-foreground`}
              />
            </FieldRow>

            <FieldRow
              label="Mobil"
              badge={phone ? { icon: Phone, text: "Kontakt" } : undefined}
            >
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+47 …"
                className={inputCss}
              />
            </FieldRow>

            <FieldRow label="Fødselsår" hint="Brukes for U18-flagg">
              <input
                type="text"
                value="—"
                disabled
                className={`${inputCss} cursor-not-allowed bg-muted text-muted-foreground`}
              />
            </FieldRow>
          </Section>

          {/* Golf-info */}
          <Section title="Golf-info" aux="Synces til coach">
            <FieldRow label="Hjemmeklubb">
              <input
                type="text"
                value={homeClub}
                onChange={(e) => setHomeClub(e.target.value)}
                placeholder="f.eks. Gamle Fredrikstad GK"
                className={inputCss}
              />
            </FieldRow>

            <FieldRow label="HCP">
              <input
                type="number"
                step="0.1"
                value={hcp}
                onChange={(e) => setHcp(e.target.value)}
                className={`${inputCss} font-mono`}
              />
            </FieldRow>

            <FieldRow label="År med golf">
              <input
                type="number"
                step="1"
                min="0"
                value={playingYears}
                onChange={(e) => setPlayingYears(e.target.value)}
                className={`${inputCss} font-mono`}
              />
            </FieldRow>

            <FieldRow label="VGS" hint="Videregående skole / toppidrettslinje">
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="f.eks. WANG Toppidrett Fredrikstad"
                className={inputCss}
              />
            </FieldRow>

            <FieldRow
              label="Snittscore forrige sesong"
              hint="Brukes som baseline for fremgang"
            >
              <input
                type="number"
                step="1"
                min="0"
                value={prevSeasonAvgScore}
                onChange={(e) => setPrevSeasonAvgScore(e.target.value)}
                className={`${inputCss} font-mono`}
              />
            </FieldRow>

            <FieldRow
              label="Ambisjon"
              hint="Maks 280 tegn"
            >
              <textarea
                value={ambition}
                onChange={(e) => setAmbition(e.target.value.slice(0, 280))}
                rows={3}
                className={inputCss}
              />
              <span className="mt-1 block text-right font-mono text-[10px] text-muted-foreground">
                {ambition.length} / 280
              </span>
            </FieldRow>
          </Section>

          {/* Save-row spans both sections */}
          {error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? "Lagrer…" : "Lagre profil"}
            </Button>
            {lagret && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                <Check className="h-3 w-3" strokeWidth={1.5} />
                Lagret
              </span>
            )}
          </div>
        </form>

        {/* Foreldre / foresatte — kun hvis det finnes relasjoner */}
        {parents.length > 0 && (
          <Section
            title="Foreldre / foresatte"
            desc="Foresatte med tilgang til kontoen din."
          >
            {parents.map((p) => (
              <ParentRow key={p.id} parent={p} />
            ))}
            <div className="grid grid-cols-[36px_1fr_auto] items-center gap-4 bg-secondary/60 px-6 py-4">
              <div className="grid h-9 w-9 place-items-center rounded-full border border-dashed border-border text-muted-foreground">
                <Plus className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-muted-foreground">
                  Legg til foresatt
                </span>
                <span className="text-[11px] text-muted-foreground/80">
                  Krever bekreftelse fra coach.
                </span>
              </div>
              <span />
            </div>
          </Section>
        )}

        {/* Personvern */}
        <Section title="Personvern" aux="Hva andre kan se">
          <ToggleRow
            label="E-postvarsler"
            hint="Booking-bekreftelser, ukerapport og viktige meldinger"
            on={notifEpost}
            onChange={(v) => togglePref("epost", v)}
          />
          <ToggleRow
            label="Push-varsler"
            hint="Påminnelser før økt og live-session"
            on={notifPush}
            onChange={(v) => togglePref("push", v)}
          />
          <ToggleRow
            label="Daglig påminnelse"
            hint="Hjelp meg å holde streaken"
            on={notifPaaminnelse}
            onChange={(v) => togglePref("paaminnelse", v)}
          />
        </Section>

        {/* Farlig sone */}
        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle
              className="h-4 w-4 text-destructive"
              strokeWidth={1.5}
            />
            <h3 className="font-display text-[15px] font-semibold text-foreground">
              Farlig sone
            </h3>
          </div>
          <DangerItem
            title="Eksporter alle mine data"
            desc="Du får alt — runder, helse, meldinger. Tar 2–5 minutter."
            cta="Be om eksport"
          />
          <DangerItem
            title="Slett konto"
            desc="Sender forespørsel til coach. Du må være 18 for å gjøre dette selv."
            cta="Be om sletting"
            destructive
          />
        </section>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-komponenter
// ============================================================================

const inputCss =
  "w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30";


function Section({
  title,
  aux,
  desc,
  children,
}: {
  title: string;
  aux?: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <header className="flex items-baseline justify-between gap-4 border-b border-border px-6 py-4">
        <h2 className="font-display text-[15px] font-semibold text-foreground">
          {title}
        </h2>
        {aux && (
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {aux}
          </span>
        )}
        {desc && (
          <span className="max-w-[420px] text-right text-[12px] text-muted-foreground">
            {desc}
          </span>
        )}
      </header>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

type FieldRowProps = {
  label: string;
  hint?: string;
  badge?: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; text: string };
  children: React.ReactNode;
};

function FieldRow({ label, hint, badge, children }: FieldRowProps) {
  const BadgeIcon = badge?.icon;
  return (
    <div className="grid grid-cols-1 items-start gap-4 border-b border-border/60 px-6 py-4 last:border-b-0 sm:grid-cols-[180px_1fr]">
      <div className="flex flex-col gap-1">
        <span className="text-[12px] font-medium text-muted-foreground">
          {label}
        </span>
        {hint && (
          <span className="text-[11px] text-muted-foreground/70">{hint}</span>
        )}
        {badge && BadgeIcon && (
          <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-sm bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            <BadgeIcon className="h-2.5 w-2.5" strokeWidth={1.5} />
            {badge.text}
          </span>
        )}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function ParentRow({ parent }: { parent: Parent }) {
  const initials = parent.name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="grid grid-cols-[36px_1fr_auto] items-center gap-4 border-b border-border/60 px-6 py-4 last:border-b-0">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/80 text-[12px] font-semibold text-primary-foreground">
        {initials || "?"}
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-[13px] font-medium text-foreground">
          {parent.name}{" "}
          <span className="font-normal text-muted-foreground/70">
            · {parent.relationship.toLowerCase()}
          </span>
        </span>
        <span className="truncate text-[11px] text-muted-foreground/80">
          {parent.email}
          {parent.phone ? ` · ${parent.phone}` : ""}
        </span>
      </div>
      <span
        className={`rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em] ${
          parent.approved
            ? "border-primary/20 bg-primary/10 text-primary"
            : "border-border bg-secondary text-muted-foreground"
        }`}
      >
        {parent.approved ? "Bekreftet" : "Avventer"}
      </span>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint?: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border/60 px-6 py-4 last:border-b-0">
      <span className="flex flex-col text-[13px] text-foreground">
        {label}
        {hint && (
          <span className="text-[11px] text-muted-foreground">{hint}</span>
        )}
      </span>
      <button
        type="button"
        onClick={() => onChange(!on)}
        role="switch"
        aria-checked={on}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          on ? "bg-primary" : "bg-secondary"
        }`}
      >
        <span
          className={`absolute h-4 w-4 rounded-full bg-card shadow transition-transform ${
            on ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function DangerItem({
  title,
  desc,
  cta,
  destructive = false,
}: {
  title: string;
  desc: string;
  cta: string;
  destructive?: boolean;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 border-t border-destructive/20 py-4 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:gap-6">
      <div className="flex min-w-0 flex-col">
        <span className="text-[13px] font-medium text-foreground">{title}</span>
        <span className="text-[12px] text-muted-foreground">{desc}</span>
      </div>
      <button
        type="button"
        className={`whitespace-nowrap rounded-md border px-4 py-2 text-[12px] font-medium transition-colors ${
          destructive
            ? "border-destructive/30 text-destructive hover:bg-destructive/10"
            : "border-border text-foreground hover:bg-secondary"
        }`}
      >
        {cta} →
      </button>
    </div>
  );
}
