"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { UserRole, Tier } from "@/generated/prisma/client";

type RoleOption = { value: UserRole; label: string };
const ROLES: RoleOption[] = [
  { value: "PLAYER", label: "Spiller" },
  { value: "COACH", label: "Coach" },
  { value: "PARENT", label: "Foresatt" },
];

type TierOption = { value: Tier; name: string; price: string; desc: string };
const TIERS: TierOption[] = [
  {
    value: "GRATIS",
    name: "Gratis",
    price: "0 kr",
    desc: "Tilgang til app, basis-funksjoner",
  },
  {
    value: "PRO",
    name: "Pro",
    price: "300 kr/mnd",
    desc: "Full tracking, AI-coach, treningsplaner",
  },
];

export function SignupForm() {
  const router = useRouter();
  const supabase = createClient();
  const [tier, setTier] = useState<Tier>("PRO");
  const [role, setRole] = useState<UserRole>("PLAYER");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
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
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, tier, firstName, lastName },
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
    if (data.session) {
      router.push("/auth/onboarding");
      router.refresh();
    } else {
      router.push("/auth/check-email");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Velg medlemskap
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TIERS.map((t) => {
            const aktiv = t.value === tier;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTier(t.value)}
                className={`rounded-md border p-4 text-left transition-colors ${
                  aktiv
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-input bg-card hover:border-border"
                }`}
              >
                <div className="font-display text-sm font-semibold">{t.name}</div>
                <div className="my-1 font-mono text-xs font-semibold text-primary">
                  {t.price}
                </div>
                <div className="text-[11px] leading-snug text-muted-foreground">
                  {t.desc}
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
        />
        <Felt
          label="Etternavn"
          id="lastName"
          value={lastName}
          onChange={setLastName}
          required
          autoComplete="family-name"
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
        />
        <Felt
          label="Bekreft passord"
          id="confirm"
          type="password"
          value={confirm}
          onChange={setConfirm}
          required
          autoComplete="new-password"
        />
      </div>

      <div>
        <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
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
                className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
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

      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={accept}
          onChange={(e) => setAccept(e.target.checked)}
          className="mt-0.5 accent-primary"
        />
        <span>
          Jeg godtar{" "}
          <Link href="/vilkar" className="text-primary hover:underline">
            vilkårene
          </Link>{" "}
          og{" "}
          <Link href="/personvern" className="text-primary hover:underline">
            personvernerklæringen
          </Link>
          .
        </span>
      </label>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Oppretter konto…" : "Opprett konto"}
      </button>

      <p className="pt-2 text-center text-sm text-muted-foreground">
        Har du allerede konto?{" "}
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
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
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-md border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
      />
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
