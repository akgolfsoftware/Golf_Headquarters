"use client";

/**
 * Skjema for /portal/meg/profil — fasitens ProfilScreen-grid (1 kol mobil /
 * 2 kol md, gap 14px). Felt-stil: mono-label 10px uppercase + h-11 rounded-xl
 * input med ledende lucide-ikon (fasitens .field/.lbl/.inp).
 *
 * Lagrer via eksisterende oppdaterProfil-action (navn, telefon, hcp,
 * hjemmeklubb). E-post = auth-styrt (disabled). Gruppe = coach-styrt via
 * GroupMember (disabled). Dominant hånd finnes ikke i Prisma — disabled
 * placeholder, lagres ikke. «Bytt bilde» bruker ekte uploadAvatar-action.
 */

import { Avatar } from "@/components/athletic/golfdata";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Check,
  Flag,
  Hand,
  Loader2,
  Mail,
  Phone,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import { uploadAvatar } from "@/lib/storage/avatar";
import { oppdaterProfil } from "../actions";

type Initial = {
  name: string;
  email: string;
  phone: string;
  hcp: number | null;
  homeClub: string;
  /** Gruppenavn fra GroupMember-relasjonen, eller "" hvis ingen. */
  gruppe: string;
  avatarUrl: string | null;
};

const inputKlasse =
  "h-11 w-full rounded-xl border border-input bg-card px-3.5 text-[15px] text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground";

function Felt({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <span className="relative block">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden
          />
        )}
        {children}
      </span>
    </label>
  );
}

function hcpTilTekst(hcp: number | null): string {
  return hcp != null ? String(hcp).replace(".", ",") : "";
}

export function ProfilRedigerForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const filInput = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl);

  // Splitt fullt navn → fornavn / etternavn (fasitens to felter).
  const navnDeler = initial.name.trim().split(/\s+/).filter(Boolean);
  const [fornavn, setFornavn] = useState(navnDeler[0] ?? "");
  const [etternavn, setEtternavn] = useState(navnDeler.slice(1).join(" "));
  const [telefon, setTelefon] = useState(initial.phone);
  const [homeClub, setHomeClub] = useState(initial.homeClub);
  const [hcp, setHcp] = useState(hcpTilTekst(initial.hcp));

  const initialer =
    ((fornavn[0] ?? "") + (etternavn[0] ?? "")).toUpperCase() || "—";

  function velgBilde(e: React.ChangeEvent<HTMLInputElement>) {
    const fil = e.target.files?.[0];
    if (!fil) return;
    setError(null);
    const formData = new FormData();
    formData.append("file", fil);
    startTransition(async () => {
      try {
        const res = await uploadAvatar(formData);
        setAvatarUrl(res.url);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Opplasting feilet.");
      } finally {
        if (filInput.current) filInput.current.value = "";
      }
    });
  }

  function lagre() {
    setError(null);
    const hcpTrimmet = hcp.trim();
    let hcpTall: number | null = null;
    if (hcpTrimmet !== "") {
      hcpTall = Number(hcpTrimmet.replace(",", "."));
      if (Number.isNaN(hcpTall)) {
        setError("Handicap må være et tall, f.eks. 4,2.");
        return;
      }
    }
    const fulltNavn = [fornavn.trim(), etternavn.trim()].filter(Boolean).join(" ");
    if (!fulltNavn) {
      setError("Fornavn kan ikke være tomt.");
      return;
    }
    startTransition(async () => {
      try {
        await oppdaterProfil({
          name: fulltNavn,
          phone: telefon.trim(),
          hcp: hcpTall,
          homeClub: homeClub.trim(),
        });
        router.push("/portal/meg");
        router.refresh();
      } catch {
        setError("Kunne ikke lagre. Prøv igjen.");
      }
    });
  }

  return (
    <div>
      {/* Avatar 72px + Bytt bilde (fasit: secondary med camera-ikon) */}
      <div className="mb-[22px] flex items-center gap-4">
        <Avatar src={avatarUrl ?? undefined} name={[fornavn, etternavn].filter(Boolean).join(" ") || initialer} size="xl" />
        <input
          ref={filInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={velgBilde}
        />
        <button
          type="button"
          disabled={pending}
          onClick={() => filInput.current?.click()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-primary px-5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
        >
          <Camera className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Bytt bilde
        </button>
      </div>

      {/* Skjema-grid: 1 kol mobil / 2 kol md (fasit gap 14px) */}
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
        <Felt label="Fornavn">
          <input
            className={inputKlasse}
            value={fornavn}
            onChange={(e) => setFornavn(e.target.value)}
            autoComplete="given-name"
          />
        </Felt>
        <Felt label="Etternavn">
          <input
            className={inputKlasse}
            value={etternavn}
            onChange={(e) => setEtternavn(e.target.value)}
            autoComplete="family-name"
          />
        </Felt>
        <Felt label="E-post" icon={Mail}>
          <input
            type="email"
            className={`${inputKlasse} pl-10`}
            value={initial.email}
            disabled
            title="E-post endres via kontoinnstillinger"
          />
        </Felt>
        <Felt label="Telefon" icon={Phone}>
          <input
            type="tel"
            inputMode="tel"
            className={`${inputKlasse} pl-10`}
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            placeholder="+47 …"
            autoComplete="tel"
          />
        </Felt>
        <Felt label="Hjemmeklubb" icon={Flag}>
          <input
            className={`${inputKlasse} pl-10`}
            value={homeClub}
            onChange={(e) => setHomeClub(e.target.value)}
            placeholder="F.eks. Gamle Fredrikstad GK"
          />
        </Felt>
        <Felt label="Handicap" icon={Target}>
          <input
            inputMode="decimal"
            className={`${inputKlasse} pl-10`}
            value={hcp}
            onChange={(e) => setHcp(e.target.value)}
            placeholder="4,2"
          />
        </Felt>
        <Felt label="Gruppe" icon={Users}>
          <input
            className={`${inputKlasse} pl-10`}
            value={initial.gruppe || "—"}
            disabled
            title="Gruppe settes av coachen din"
          />
        </Felt>
        <Felt label="Dominant hånd" icon={Hand}>
          <select
            className={`${inputKlasse} appearance-none pl-10`}
            value=""
            disabled
            title="Kommer snart"
          >
            <option value="">—</option>
          </select>
        </Felt>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-[13px] text-destructive">
          {error}
        </p>
      )}

      {/* Lagre + Avbryt (fasit: primary med check + secondary) */}
      <div className="mt-[22px] flex gap-2.5">
        <button
          type="button"
          onClick={lagre}
          disabled={pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden />
          ) : (
            <Check className="h-4 w-4" strokeWidth={2} aria-hidden />
          )}
          Lagre endringer
        </button>
        <button
          type="button"
          onClick={() => router.push("/portal/meg")}
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-full border border-primary px-5 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}
