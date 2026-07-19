"use client";

/**
 * ProfileForm — redigerbart profilskjema for /portal/meg.
 *
 * Felter: fullt navn, e-post (read-only), telefon, hjemmeklubb, handicap,
 * fødselsdato. E-post styres av Supabase auth og kan ikke endres her.
 * Lagring går via server action fra parent.
 */

import { Avatar } from "@/components/athletic/golfdata";
import { useState, useTransition } from "react";
import type { User } from "@/generated/prisma/client";
import { useRef } from "react";
import {
  Calendar,
  Camera,
  Flag,
  Mail,
  Phone,
  Target,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadAvatar } from "@/lib/storage/avatar";
import { skalerAvatar } from "@/lib/klient/skaler-avatar";

type ProfileUpdateInput = {
  name: string;
  phone: string | null;
  homeClub: string | null;
  hcp: number | null;
  dateOfBirth: Date | null;
};

type ProfileFormProps = {
  user: Pick<
    User,
    "name" | "email" | "phone" | "avatarUrl" | "homeClub" | "hcp" | "dateOfBirth"
  >;
  onSubmit: (input: ProfileUpdateInput) => Promise<void>;
};

const labelClass =
  "mb-2 block font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground";
const inputClass =
  "h-12 w-full rounded-md border border-input bg-card px-4 text-base md:text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground";

function parseDateValue(d: Date | null): string {
  if (!d) return "";
  const iso = d.toISOString().slice(0, 10);
  return iso;
}

function parseHcp(hcp: string): number | null {
  const cleaned = hcp.trim().replace(",", ".");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isNaN(n) ? null : n;
}


export function ProfileForm({ user, onSubmit }: ProfileFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [homeClub, setHomeClub] = useState(user.homeClub ?? "");
  const [hcp, setHcp] = useState(
    user.hcp != null
      ? user.hcp.toLocaleString("nb-NO", { maximumFractionDigits: 1 })
      : "",
  );
  const [dateOfBirth, setDateOfBirth] = useState(parseDateValue(user.dateOfBirth));
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);

  function velgBilde(e: React.ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0];
    if (!fil) return;
    setError(null);
    startTransition(async () => {
      try {
        // Nedskaler på klienten — kamerabilder (2–8 MB) sprenger ellers
        // server-action-grensen før uploadAvatar i det hele tatt kjører.
        const formData = new FormData();
        formData.append("file", await skalerAvatar(fil));
        const res = await uploadAvatar(formData);
        if (!res.ok) throw new Error(res.error);
        setAvatarUrl(res.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Opplasting feilet.");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const hcpValue = parseHcp(hcp);
    if (hcp.trim() !== "" && hcpValue == null) {
      setError("Handicap må være et tall, f.eks. 4,2.");
      return;
    }

    const fullName = name.trim();
    if (!fullName) {
      setError("Navn kan ikke være tomt.");
      return;
    }

    startTransition(async () => {
      try {
        await onSubmit({
          name: fullName,
          phone: phone.trim() || null,
          homeClub: homeClub.trim() || null,
          hcp: hcpValue,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        });
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke lagre.");
      }
    });
  }

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h2 className="font-display text-lg font-bold tracking-[-0.015em] text-foreground">
          Profil
        </h2>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Dine opplysninger
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        {/* Avatar-opplasting */}
        <div className="flex items-center gap-4">
          <Avatar src={avatarUrl ?? undefined} name={name} size="xl" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={velgBilde}
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-primary px-6 font-mono text-xs font-bold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
          >
            <Camera className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Bytt bilde
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Fullt navn</span>
            <span className="relative block">
              <UserIcon
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
                aria-hidden
              />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${inputClass} pl-10`}
                autoComplete="name"
              />
            </span>
          </label>

          <label className="block">
            <span className={labelClass}>E-post</span>
            <span className="relative block">
              <Mail
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
                aria-hidden
              />
              <Input
                type="email"
                value={user.email}
                disabled
                className={`${inputClass} pl-10`}
                title="E-post endres via kontoinnstillinger"
              />
            </span>
          </label>

          <label className="block">
            <span className={labelClass}>Telefon</span>
            <span className="relative block">
              <Phone
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
                aria-hidden
              />
              <Input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="+47 …"
                autoComplete="tel"
              />
            </span>
          </label>

          <label className="block">
            <span className={labelClass}>Hjemmeklubb</span>
            <span className="relative block">
              <Flag
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
                aria-hidden
              />
              <Input
                value={homeClub}
                onChange={(e) => setHomeClub(e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="F.eks. Gamle Fredrikstad GK"
              />
            </span>
          </label>

          <label className="block">
            <span className={labelClass}>Handicap</span>
            <span className="relative block">
              <Target
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
                aria-hidden
              />
              <Input
                inputMode="decimal"
                value={hcp}
                onChange={(e) => setHcp(e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="4,2"
              />
            </span>
          </label>

          <label className="block">
            <span className={labelClass}>Fødselsdato</span>
            <span className="relative block">
              <Calendar
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
                aria-hidden
              />
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={`${inputClass} pl-10`}
              />
            </span>
          </label>
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {success && (
          <p className="rounded-lg border border-success/40 bg-success/10 px-4 py-2 text-sm text-success">
            Profilen er lagret.
          </p>
        )}

        <div className="pt-2">
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "Lagrer …" : "Lagre endringer"}
          </Button>
        </div>
      </form>
    </section>
  );
}
