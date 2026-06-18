"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Camera,
  Check,
  HelpCircle,
  Loader2,
  RefreshCw,
  Save,
} from "lucide-react";
import { updateProfile } from "./actions";

type Initial = {
  name: string;
  email: string;
  phone: string;
  hcp: number | null;
  homeClub: string;
  ambition: string;
  avatarUrl: string | null;
  tier: "GRATIS" | "PRO" | "ELITE"; // ELITE er dødt enum — håndteres i render
};

const KLUBBER = [
  "Søgne & Mandal Golfklubb",
  "Kristiansand Golfklubb",
  "Mandal Golfklubb",
  "Bjaavann Golfklubb",
  "Gamle Fredrikstad GK",
  "Oslo Golfklubb",
];

function hcpTekst(hcp: number | null): string {
  return hcp != null ? String(hcp).replace(".", ",") : "—";
}

export function ProfilRedigerForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Splitt fullt navn → fornavn / etternavn
  const parts = initial.name.trim().split(/\s+/).filter(Boolean);
  const initFornavn = parts[0] ?? "";
  const initEtternavn = parts.slice(1).join(" ");
  const initTelefon = initial.phone.replace(/^\+47\s*/, "");

  const [fornavn, setFornavn] = useState(initFornavn);
  const [etternavn, setEtternavn] = useState(initEtternavn);
  const [telefon, setTelefon] = useState(initTelefon);
  const [homeClub, setHomeClub] = useState(initial.homeClub);
  const [ambition, setAmbition] = useState(initial.ambition);

  const dirty =
    fornavn !== initFornavn ||
    etternavn !== initEtternavn ||
    telefon !== initTelefon ||
    homeClub !== initial.homeClub ||
    ambition !== initial.ambition;

  function lagre() {
    setError(null);
    startTransition(async () => {
      try {
        const fullName = [fornavn.trim(), etternavn.trim()]
          .filter(Boolean)
          .join(" ");
        await updateProfile({
          name: fullName,
          phone: telefon ? `+47 ${telefon}` : null,
          homeClub: homeClub || null,
          ambition: ambition || null,
        });
        setSavedAt(new Date());
        router.refresh();
        setTimeout(() => setSavedAt(null), 2400);
      } catch {
        setError("Kunne ikke lagre. Prøv igjen.");
      }
    });
  }

  const initialer =
    ((fornavn[0] ?? "") + (etternavn[0] ?? "")).toUpperCase() || "?";

  return (
    <div className="flex flex-col gap-3">
      {/* ID-kort */}
      <div className="flex items-center gap-3.5 rounded-[14px] border border-border bg-card p-4">
        <div className="relative shrink-0">
          <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-full border-2 border-accent bg-primary text-accent">
            {initial.avatarUrl ? (
              <Image
                src={initial.avatarUrl}
                alt={`${fornavn} ${etternavn}`.trim() || "Profilbilde"}
                width={64}
                height={64}
                sizes="64px"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-display text-xl font-bold leading-none">
                {initialer}
              </span>
            )}
          </span>
          <button
            type="button"
            aria-label="Bytt profilbilde"
            className="absolute -bottom-0.5 -right-0.5 grid h-7 w-7 place-items-center rounded-full border-2 border-card bg-accent text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Camera className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-display text-lg font-bold leading-tight tracking-[-0.015em] text-foreground">
            {`${fornavn} ${etternavn}`.trim() || "Navnløs"}
          </h2>
          <div className="mt-1.5">
            <span className="rounded-md bg-primary px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-accent">
              {initial.tier === "PRO" ? "Pro" : "Gratis"}
            </span>
          </div>
        </div>
      </div>

      {/* Personalia */}
      <Section title="Personalia" aux="Navn">
        <div className="grid grid-cols-1 gap-3.5 p-4 sm:grid-cols-2">
          <Felt label="Fornavn" required>
            <input
              className={input}
              value={fornavn}
              onChange={(e) => setFornavn(e.target.value)}
              required
            />
          </Felt>
          <Felt label="Etternavn" required>
            <input
              className={input}
              value={etternavn}
              onChange={(e) => setEtternavn(e.target.value)}
              required
            />
          </Felt>
        </div>
      </Section>

      {/* Kontakt */}
      <Section title="Kontakt" aux="Hvordan vi når deg">
        <div className="flex flex-col gap-3.5 p-4">
          <Felt
            label="E-post"
            badge={
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/[0.08] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-primary">
                <Check className="h-2.5 w-2.5" strokeWidth={2.2} aria-hidden />
                Verifisert
              </span>
            }
          >
            <input
              type="email"
              className={`${input} cursor-not-allowed bg-secondary font-mono text-[13px] text-muted-foreground`}
              value={initial.email || "—"}
              disabled
            />
            <span className="mt-1 block font-mono text-[9px] tracking-[0.02em] text-muted-foreground/70">
              Endres via innlogging-/kontoinnstillinger.
            </span>
          </Felt>
          <Felt label="Telefon">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-[13px] text-muted-foreground">
                +47
              </span>
              <input
                type="tel"
                inputMode="tel"
                className={`${input} pl-12 font-mono`}
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
                placeholder="412 33 555"
              />
            </div>
          </Felt>
        </div>
      </Section>

      {/* Golf */}
      <Section title="Golf" aux="Synces til coach">
        <div className="flex flex-col gap-3.5 p-4">
          <Felt label="Klubb">
            <select
              className={input}
              value={homeClub}
              onChange={(e) => setHomeClub(e.target.value)}
            >
              <option value="">Ikke valgt</option>
              {KLUBBER.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
              {homeClub && !KLUBBER.includes(homeClub) && (
                <option value={homeClub}>{homeClub}</option>
              )}
            </select>
          </Felt>

          <Felt
            label="HCP"
            badge={
              <span title="Synket fra GolfBox – ikke redigerbar her">
                <HelpCircle
                  className="h-3 w-3 text-muted-foreground/70"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </span>
            }
          >
            <input
              className={`${input} cursor-not-allowed bg-secondary font-mono font-semibold text-muted-foreground`}
              value={hcpTekst(initial.hcp)}
              disabled
            />
            <span className="mt-1 flex items-center gap-1.5 font-mono text-[9px] tracking-[0.02em] text-success">
              <RefreshCw className="h-2.5 w-2.5" strokeWidth={2} aria-hidden />
              Synket fra GolfBox
            </span>
          </Felt>

          <Felt label="Ambisjon" hint="Maks 280 tegn">
            <textarea
              className={`${input} resize-y`}
              rows={3}
              value={ambition}
              onChange={(e) => setAmbition(e.target.value.slice(0, 280))}
              placeholder="Hva er du på vei mot?"
            />
            <span className="mt-1 block text-right font-mono text-[9px] text-muted-foreground">
              {ambition.length} / 280
            </span>
          </Felt>
        </div>
      </Section>

      {error && (
        <div className="rounded-[12px] border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-[13px] text-destructive">
          {error}
        </div>
      )}

      {/* lagre-bar */}
      <div className="sticky bottom-0 flex items-center gap-2.5 rounded-[14px] border border-border bg-secondary px-4 py-3">
        <span
          className={`inline-flex flex-1 items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.04em] ${
            dirty ? "text-warning" : "text-muted-foreground"
          }`}
        >
          {pending ? (
            <>
              <Loader2 className="h-[13px] w-[13px] animate-spin" strokeWidth={2} aria-hidden />
              Lagrer …
            </>
          ) : savedAt ? (
            <>
              <Check className="h-[13px] w-[13px] text-primary" strokeWidth={2} aria-hidden />
              Lagret
            </>
          ) : dirty ? (
            <>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-warning" />
              Ulagrede endringer
            </>
          ) : (
            "Ingen endringer"
          )}
        </span>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={pending}
          className="inline-flex h-[46px] items-center rounded-[12px] px-4 font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          Avbryt
        </button>
        <button
          type="button"
          onClick={lagre}
          disabled={!dirty || pending}
          className="inline-flex h-[46px] items-center gap-2 rounded-[12px] bg-primary px-5 font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-accent transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-45"
        >
          <Save className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          Lagre
        </button>
      </div>
    </div>
  );
}

const input =
  "w-full rounded-[11px] border border-input bg-card px-3.5 py-2.5 text-[15px] text-foreground outline-none transition-colors focus-visible:outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

function Section({
  title,
  aux,
  children,
}: {
  title: string;
  aux?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[14px] border border-border bg-card">
      <header className="flex items-baseline justify-between gap-4 border-b border-border px-4 py-3">
        <h2 className="font-display text-[15px] font-bold tracking-[-0.012em] text-foreground">
          {title}
        </h2>
        {aux && (
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            {aux}
          </span>
        )}
      </header>
      {children}
    </section>
  );
}

function Felt({
  label,
  required = false,
  badge,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  badge?: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
        {(badge || hint) && (
          <span className="ml-auto inline-flex items-center gap-1.5 normal-case">
            {hint && (
              <span className="font-mono text-[9px] font-normal tracking-[0.02em] text-muted-foreground/70">
                {hint}
              </span>
            )}
            {badge}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}
