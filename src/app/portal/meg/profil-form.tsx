"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { oppdaterProfil } from "./actions";

type Props = {
  initial: {
    name: string;
    phone: string | null;
    hcp: number | null;
    playingYears: number | null;
    ambition: string | null;
    homeClub: string | null;
    email: string;
  };
};

export function ProfilForm({ initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [hcp, setHcp] = useState(initial.hcp != null ? String(initial.hcp) : "");
  const [playingYears, setPlayingYears] = useState(
    initial.playingYears != null ? String(initial.playingYears) : ""
  );
  const [ambition, setAmbition] = useState(initial.ambition ?? "");
  const [homeClub, setHomeClub] = useState(initial.homeClub ?? "");

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
        });
        setLagret(true);
        router.refresh();
        setTimeout(() => setLagret(false), 2000);
      } catch {
        setError("Kunne ikke lagre. Prøv igjen.");
      }
    });
  }

  return (
    <form onSubmit={lagre} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Felt label="Navn">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputCss}
          />
        </Felt>
        <Felt label="E-post (kan ikke endres)">
          <input
            type="email"
            value={initial.email}
            disabled
            className={`${inputCss} cursor-not-allowed bg-muted text-muted-foreground`}
          />
        </Felt>
        <Felt label="Mobil">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+47 …"
            className={inputCss}
          />
        </Felt>
        <Felt label="Hjemmeklubb">
          <input
            type="text"
            value={homeClub}
            onChange={(e) => setHomeClub(e.target.value)}
            placeholder="f.eks. Gamle Fredrikstad GK"
            className={inputCss}
          />
        </Felt>
        <Felt label="HCP">
          <input
            type="number"
            step="0.1"
            value={hcp}
            onChange={(e) => setHcp(e.target.value)}
            className={inputCss}
          />
        </Felt>
        <Felt label="År med golf">
          <input
            type="number"
            step="1"
            value={playingYears}
            onChange={(e) => setPlayingYears(e.target.value)}
            className={inputCss}
          />
        </Felt>
      </div>

      <Felt label="Ambisjon (maks 280 tegn)">
        <textarea
          value={ambition}
          onChange={(e) => setAmbition(e.target.value.slice(0, 280))}
          rows={3}
          className={inputCss}
        />
        <span className="mt-1 block text-right font-mono text-[10px] text-muted-foreground">
          {ambition.length} / 280
        </span>
      </Felt>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Lagrer…" : "Lagre profil"}
        </button>
        {lagret && (
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
            Lagret ✓
          </span>
        )}
      </div>
    </form>
  );
}

const inputCss =
  "w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

function Felt({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
