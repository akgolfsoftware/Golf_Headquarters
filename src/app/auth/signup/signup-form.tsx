"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, Lock, Mail, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { UserRole, Tier } from "@/generated/prisma/client";
import { AthleticButton } from "@/components/athletic/button";
import { AthleticBadge } from "@/components/athletic/badge";

type RoleOption = { value: UserRole; label: string };
const ROLES: RoleOption[] = [
  { value: "PLAYER", label: "Spiller" },
  { value: "PARENT", label: "Foresatt" },
];

type PackageValue = "PERFORMANCE_PRO" | "PERFORMANCE" | "PLAYERHQ_ONLY";
type PackageOption = {
  value: PackageValue;
  name: string;
  price: string;
  trialHint?: string;
  desc: string;
  monthlyCredits: number;
  featured?: boolean;
};
const PACKAGES: PackageOption[] = [
  {
    value: "PERFORMANCE_PRO",
    name: "Performance Pro",
    price: "2 220 kr/mnd",
    desc: "4 coaching-økter i måneden · PlayerHQ inkludert",
    monthlyCredits: 4,
    featured: true,
  },
  {
    value: "PERFORMANCE",
    name: "Performance",
    price: "1 200 kr/mnd",
    desc: "2 coaching-økter i måneden · PlayerHQ inkludert",
    monthlyCredits: 2,
  },
  {
    value: "PLAYERHQ_ONLY",
    name: "PlayerHQ",
    price: "299 kr/mnd",
    trialHint: "1. måned gratis",
    desc: "App-tilgang: tracking, AI-coach, treningsplaner",
    monthlyCredits: 0,
  },
];

export function SignupForm({
  defaultEmail,
  subscribe,
}: { defaultEmail?: string; subscribe?: string } = {}) {
  const router = useRouter();
  const supabase = createClient();
  const [pkg, setPkg] = useState<PackageValue>("PERFORMANCE_PRO");
  const [role, setRole] = useState<UserRole>("PLAYER");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accept, setAccept] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Passordet må være minst 8 tegn.");
      return;
    }
    if (password !== confirm) {
      setError("Passordene er ikke like.");
      return;
    }
    if (!accept) {
      setError("Du må godta vilkårene for å fortsette.");
      return;
    }

    setLoading(true);
    const selected = PACKAGES.find((p) => p.value === pkg)!;
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          tier: "PRO" satisfies Tier,
          package: selected.value,
          monthlyCredits: selected.monthlyCredits,
          firstName,
          lastName,
        },
      },
    });
    setLoading(false);

    if (err) {
      setError(oversettAuthFeil(err.message));
      return;
    }

    // Hvis Supabase returnerer en aktiv session betyr det at "Confirm email"
    // er AV — brukeren er allerede innlogget. Ellers (vanlig case) må de
    // bekrefte e-posten først.
    // Bær subscribe-intent videre så en ny besøkende kan fullføre betaling i én flyt.
    const onbUrl = subscribe
      ? `/auth/onboarding?subscribe=${encodeURIComponent(subscribe)}`
      : "/auth/onboarding";
    if (data.session) {
      router.push(onbUrl);
      router.refresh();
    } else {
      router.push(
        subscribe ? `/auth/check-email?subscribe=${encodeURIComponent(subscribe)}` : "/auth/check-email",
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Velg medlemskap
        </label>
        <div className="space-y-2">
          {PACKAGES.map((p) => {
            const aktiv = p.value === pkg;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setPkg(p.value)}
                aria-pressed={aktiv}
                className={`relative block w-full rounded-xl border p-4 text-left transition-colors ${
                  aktiv
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-input bg-card hover:border-border"
                }`}
              >
                {p.featured && (
                  <AthleticBadge
                    variant="lime"
                    className="absolute -top-2 right-4"
                  >
                    Mest populær
                  </AthleticBadge>
                )}
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-display text-sm font-semibold">{p.name}</div>
                  <div className="font-mono text-xs font-semibold text-primary">
                    {p.price}
                  </div>
                </div>
                {p.trialHint && (
                  <AthleticBadge variant="lime" className="mt-2">
                    {p.trialHint}
                  </AthleticBadge>
                )}
                <div className="mt-1 text-[12px] leading-snug text-muted-foreground">
                  {p.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Felt
          label="Fornavn"
          id="firstName"
          value={firstName}
          onChange={setFirstName}
          required
          autoComplete="given-name"
          icon={<User className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />}
        />
        <Felt
          label="Etternavn"
          id="lastName"
          value={lastName}
          onChange={setLastName}
          required
          autoComplete="family-name"
          icon={<User className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />}
        />
      </div>

      <Felt
        label="E-post"
        id="email"
        type="email"
        value={email}
        onChange={setEmail}
        required
        autoComplete="email"
        placeholder="navn@klubb.no"
        icon={<Mail className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />}
      />

      <div className="grid grid-cols-2 gap-4">
        <Felt
          label="Passord"
          id="password"
          type="password"
          value={password}
          onChange={setPassword}
          required
          autoComplete="new-password"
          placeholder="Minst 8 tegn"
          icon={<Lock className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />}
        />
        <Felt
          label="Bekreft passord"
          id="confirm"
          type="password"
          value={confirm}
          onChange={setConfirm}
          required
          autoComplete="new-password"
          icon={<Lock className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />}
        />
      </div>

      <div>
        <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Jeg er
        </label>
        <div className="flex gap-2">
          {ROLES.map((r) => {
            const aktiv = r.value === role;
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`flex-1 rounded-xl border px-4 py-2 text-sm transition-colors ${
                  aktiv
                    ? "border-primary bg-primary/5 font-semibold text-primary"
                    : "border-input bg-card text-foreground hover:border-border"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={accept}
          onChange={(e) => setAccept(e.target.checked)}
          className="peer sr-only"
        />
        {/* Fasit-checkbox: 20px, radius 6, primary-fylt med lime hake når huket */}
        <span
          aria-hidden
          className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-[1.5px] border-border bg-card transition-colors peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
        >
          <Check className="h-[13px] w-[13px] text-accent" strokeWidth={3} />
        </span>
        <span>
          Jeg godtar{" "}
          <Link href="/vilkar" className="font-semibold text-primary hover:underline">
            vilkår
          </Link>{" "}
          og{" "}
          <Link href="/personvern" className="font-semibold text-primary hover:underline">
            personvern
          </Link>
          .
        </span>
      </label>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-4 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <AthleticButton
        type="submit"
        variant="primary"
        size="lg"
        disabled={loading}
        aria-busy={loading || undefined}
        className="w-full"
      >
        {loading ? (
          "Oppretter…"
        ) : (
          <>
            Opprett konto{" "}
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </>
        )}
      </AthleticButton>

      <p className="pt-2 text-center">
        <span className="font-mono text-xs text-muted-foreground">
          Har du konto?{" "}
        </span>
        <Link
          href="/auth/login"
          className="rounded-sm font-mono text-xs font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Logg inn
        </Link>
      </p>
    </form>
  );
}

function Felt({
  label,
  id,
  type = "text",
  value,
  onChange,
  required,
  autoComplete,
  placeholder,
  icon,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
      >
        {label}
      </label>
      <div className="flex h-12 items-center gap-2 rounded-xl border border-input bg-card px-4 transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
        {icon}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="h-full w-full min-w-0 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/60 sm:text-sm"
        />
      </div>
    </div>
  );
}

function oversettAuthFeil(msg: string): string {
  if (msg.includes("already registered") || msg.includes("already exists"))
    return "En konto med denne e-posten finnes allerede.";
  if (msg.includes("Password should be at least"))
    return "Passordet er for kort. Minst 8 tegn.";
  if (msg.includes("rate limit"))
    return "For mange forsøk. Prøv igjen om litt.";
  return msg;
}
