"use client";

/**
 * Innstillinger — mobil-først accordion (/portal/meg/innstillinger)
 * Pixel-port av public/design-handover/playerhq/components-innstillinger.html.
 *
 * Fire seksjoner som folder ut én om gangen — Profil, Fasiliteter, Varsler,
 * Personvern. 44 px touch-targets, ekte toggles, og en lagre-bar som først
 * våkner når noe er endret (auto-lagrer ved endring, jf. design-prompt).
 *
 * Server-data inn via props (ekte Prisma). Skrive-stier:
 *   - Varsler    → oppdaterPreferences (User.preferences JSON)
 *   - Fasiliteter→ lagreFasilitetProfil (User.tilgjengeligeFasiliteter[])
 *   - Personvern → exportUserData / deleteUserAccount (GDPR)
 *   - Profil     → lenke til eksisterende /portal/meg/profil/rediger
 *
 * Ingen hardkodet hex — kun DS-tokens. Ingen emoji — kun lucide-react.
 * "Fasiliteter"-seksjonen i design-HTML bruker avstands-slidere uten
 * backing-felt i schema; her er den bundet til de ekte fasilitet-enum-ene
 * (DrillFasilitet[]) i stedet for oppdiktede meter-verdier.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  MapPin,
  Save,
  ShieldCheck,
  Trash2,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";
import type { DrillFasilitet } from "@/generated/prisma/client";
import type { UserPreferences } from "@/lib/preferences";
import { cn } from "@/lib/utils";
import { oppdaterPreferences } from "@/app/portal/meg/actions";
import { lagreFasilitetProfil } from "@/app/portal/meg/innstillinger/actions";
import {
  exportUserData,
  deleteUserAccount,
} from "@/app/portal/meg/innstillinger/actions";
import { logout } from "@/lib/auth/logout";

// ── typer ────────────────────────────────────────────────────────
type NotifFelt = keyof UserPreferences["notif"];

type FasilitetValg = { kode: DrillFasilitet; navn: string };

export type InnstillingerAccordionProps = {
  profil: {
    navn: string;
    epost: string;
    hjemmeklubb: string | null;
    avatarUrl: string | null;
    initialer: string;
  };
  notif: UserPreferences["notif"];
  fasiliteter: DrillFasilitet[];
};

// Varsel-rader — mapper design-HTMLs 4 toggles til ekte notif-felter.
const VARSEL_RADER: { felt: NotifFelt; tittel: string; under: string }[] = [
  { felt: "paaminnelse", tittel: "Økt-påminnelser", under: "FØR HVER ØKT" },
  { felt: "ukentligRapport", tittel: "Ukerapport", under: "SØNDAG 18:00" },
  { felt: "nyMeldingFraCoach", tittel: "Coach-meldinger", under: "PUSH + E-POST" },
  { felt: "turneringsresultater", tittel: "Turneringsresultater", under: "NÅR REGISTRERT" },
];

// Fasilitet-valg — de mest brukte, med korte navn for mobil-rad.
const FASILITET_VALG: FasilitetValg[] = [
  { kode: "RADAR", navn: "Launch monitor / radar" },
  { kode: "DRIVING_RANGE", navn: "Driving range" },
  { kode: "SHORT_GAME_AREA", navn: "Nærspillsareal" },
  { kode: "PUTTING_GREEN_KORT", navn: "Putting green (≤ 10 m)" },
  { kode: "PUTTING_GREEN_LANG", navn: "Putting green (15 m+)" },
  { kode: "BUNKER", navn: "Sandbunker" },
  { kode: "SIMULATOR", navn: "Innendørs simulator" },
  { kode: "BANE", navn: "Tilgang til banen" },
];

type SeksjonId = "profil" | "fasiliteter" | "varsler" | "personvern";

// ── primitiver ───────────────────────────────────────────────────
function SeksjonHead({
  icon: Icon,
  tittel,
  under,
  apen,
  onClick,
}: {
  icon: LucideIcon;
  tittel: string;
  under: string;
  apen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={apen}
      className="flex min-h-[56px] w-full items-center gap-3 bg-card px-4 text-left"
    >
      <span className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-primary/[0.08] text-primary">
        <Icon className="h-[17px] w-[17px]" strokeWidth={1.75} aria-hidden />
      </span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="font-display text-[15px] font-bold leading-tight tracking-[-0.012em] text-foreground">
          {tittel}
        </span>
        <span className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
          {under}
        </span>
      </span>
      <ChevronDown
        className={cn(
          "h-[18px] w-[18px] shrink-0 transition-transform duration-200",
          apen ? "rotate-180 text-primary" : "text-muted-foreground",
        )}
        strokeWidth={2}
        aria-hidden
      />
    </button>
  );
}

function Felt({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}

function VisFelt({ verdi }: { verdi: string }) {
  return (
    <div className="flex h-[46px] items-center rounded-[11px] border border-input bg-card px-3.5 text-[15px] text-foreground">
      {verdi}
    </div>
  );
}

function Toggle({
  tittel,
  under,
  on,
  onToggle,
  disabled,
}: {
  tittel: string;
  under: string;
  on: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex min-h-[48px] items-center gap-3 py-1">
      <span className="flex-1">
        <span className="block text-[14px] font-semibold leading-tight tracking-[-0.005em] text-foreground">
          {tittel}
        </span>
        <span className="mt-0.5 block font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
          {under}
        </span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={tittel}
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-60",
          on ? "bg-primary" : "bg-secondary",
        )}
      >
        <span
          className={cn(
            "absolute top-[3px] h-[22px] w-[22px] rounded-full bg-card shadow-[0_1px_4px_hsl(var(--foreground)/0.25)] transition-transform duration-200",
            on ? "translate-x-[23px]" : "translate-x-[3px]",
          )}
        />
      </button>
    </div>
  );
}

// ── hovedkomponent ───────────────────────────────────────────────
export function InnstillingerAccordion({
  profil,
  notif,
  fasiliteter,
}: InnstillingerAccordionProps) {
  const router = useRouter();
  const [apen, setApen] = useState<SeksjonId>("profil");

  // varsler-state
  const [notifState, setNotifState] = useState(notif);
  const [pending, startTransition] = useTransition();

  // fasilitet-state
  const [valgte, setValgte] = useState<Set<DrillFasilitet>>(new Set(fasiliteter));

  // dirty / lagre-status
  const [dirty, setDirty] = useState(false);
  const [lagret, setLagret] = useState(false);

  function toggleSeksjon(id: SeksjonId) {
    setApen((forrige) => (forrige === id ? ("" as SeksjonId) : id));
  }

  function setNotif(felt: NotifFelt) {
    const ny = { ...notifState, [felt]: !notifState[felt] };
    setNotifState(ny);
    setDirty(true);
    setLagret(false);
    startTransition(async () => {
      await oppdaterPreferences({ notif: ny });
      setDirty(false);
      setLagret(true);
      router.refresh();
      setTimeout(() => setLagret(false), 2000);
    });
  }

  function toggleFasilitet(kode: DrillFasilitet) {
    const ny = new Set(valgte);
    if (ny.has(kode)) ny.delete(kode);
    else ny.add(kode);
    setValgte(ny);
    setDirty(true);
    setLagret(false);
    startTransition(async () => {
      await lagreFasilitetProfil([...ny]);
      setDirty(false);
      setLagret(true);
      router.refresh();
      setTimeout(() => setLagret(false), 2000);
    });
  }

  const notifPaa = VARSEL_RADER.filter((r) => notifState[r.felt]).length;

  return (
    <div className="mx-auto w-full max-w-[480px]">
      {/* topbar — tilbake-link + tittel */}
      <div className="flex items-center gap-3 border-b border-border px-2 py-3">
        <Link
          href="/portal/meg"
          className="inline-flex items-center gap-1.5 px-1 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
          Profil
        </Link>
        <h1 className="font-display text-[17px] font-bold tracking-[-0.015em] text-foreground">
          Innstillinger
        </h1>
      </div>

      {/* accordion */}
      <div className="flex flex-col gap-2.5 px-2 pb-4 pt-3">
        {/* PROFIL */}
        <section className="overflow-hidden rounded-[14px] border border-border bg-card">
          <SeksjonHead
            icon={UserIcon}
            tittel="Profil"
            under="NAVN · E-POST · BILDE"
            apen={apen === "profil"}
            onClick={() => toggleSeksjon("profil")}
          />
          {apen === "profil" && (
            <div className="flex flex-col gap-3.5 border-t border-border px-4 pb-[18px] pt-3">
              <div className="flex items-center gap-3.5">
                <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-display text-xl font-bold text-accent">
                  {profil.avatarUrl ? (
                    <Image
                      src={profil.avatarUrl}
                      alt={profil.navn}
                      width={56}
                      height={56}
                      sizes="56px"
                    />
                  ) : (
                    profil.initialer
                  )}
                </span>
                <Link
                  href="/portal/meg/profil/rediger"
                  className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-border bg-card px-3.5 font-mono text-[11px] font-extrabold tracking-[0.04em] text-foreground transition-colors hover:bg-secondary"
                >
                  <Camera className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
                  Bytt bilde
                </Link>
              </div>
              <Felt label="Fullt navn">
                <VisFelt verdi={profil.navn} />
              </Felt>
              <Felt label="E-post">
                <VisFelt verdi={profil.epost || "—"} />
              </Felt>
              <Felt label="Hjemmeklubb">
                <VisFelt verdi={profil.hjemmeklubb || "Ikke satt"} />
              </Felt>
              <Link
                href="/portal/meg/profil/rediger"
                className="inline-flex items-center gap-1.5 self-start font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary"
              >
                Rediger profil
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              </Link>
            </div>
          )}
        </section>

        {/* FASILITETER */}
        <section className="overflow-hidden rounded-[14px] border border-border bg-card">
          <SeksjonHead
            icon={MapPin}
            tittel="Fasiliteter"
            under={
              valgte.size === 0
                ? "INGEN VALGT · ALLE DRILLS"
                : `${valgte.size} VALGT · FILTRERER DRILLS`
            }
            apen={apen === "fasiliteter"}
            onClick={() => toggleSeksjon("fasiliteter")}
          />
          {apen === "fasiliteter" && (
            <div className="flex flex-col border-t border-border px-4 pb-[18px] pt-1">
              {FASILITET_VALG.map((f) => {
                const erValgt = valgte.has(f.kode);
                return (
                  <Toggle
                    key={f.kode}
                    tittel={f.navn}
                    under={erValgt ? "TILGJENGELIG" : "IKKE TILGJENGELIG"}
                    on={erValgt}
                    onToggle={() => toggleFasilitet(f.kode)}
                    disabled={pending}
                  />
                );
              })}
              <p className="mt-2 font-mono text-[10px] leading-relaxed tracking-[0.02em] text-muted-foreground">
                Drills som krever en fasilitet du ikke har, filtreres bort.
              </p>
            </div>
          )}
        </section>

        {/* VARSLER */}
        <section className="overflow-hidden rounded-[14px] border border-border bg-card">
          <SeksjonHead
            icon={Bell}
            tittel="Varsler"
            under={`${notifPaa} AV ${VARSEL_RADER.length} PÅ`}
            apen={apen === "varsler"}
            onClick={() => toggleSeksjon("varsler")}
          />
          {apen === "varsler" && (
            <div className="flex flex-col border-t border-border px-4 pb-[18px] pt-1">
              {VARSEL_RADER.map((r) => (
                <Toggle
                  key={r.felt}
                  tittel={r.tittel}
                  under={r.under}
                  on={notifState[r.felt]}
                  onToggle={() => setNotif(r.felt)}
                  disabled={pending}
                />
              ))}
            </div>
          )}
        </section>

        {/* PERSONVERN */}
        <section className="overflow-hidden rounded-[14px] border border-border bg-card">
          <SeksjonHead
            icon={ShieldCheck}
            tittel="Personvern"
            under="DATA · GDPR · KONTO"
            apen={apen === "personvern"}
            onClick={() => toggleSeksjon("personvern")}
          />
          {apen === "personvern" && (
            <div className="flex flex-col border-t border-border px-4 pb-[18px] pt-1">
              <EksportRad />
              <Link
                href="/personvern"
                className="flex min-h-[48px] items-center gap-3 border-t border-dashed border-border px-0.5"
              >
                <FileText className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden />
                <span className="flex-1 text-[14px] font-semibold tracking-[-0.005em] text-foreground">
                  Personvernerklæring
                </span>
                <ExternalLink className="h-[15px] w-[15px] text-muted-foreground" strokeWidth={1.75} aria-hidden />
              </Link>
              <SlettKontoRad />
            </div>
          )}
        </section>
      </div>

      {/* lagre-bar — våkner ved endring (auto-lagrer, viser status) */}
      <div className="sticky bottom-0 flex items-center gap-2.5 border-t border-border bg-secondary px-4 pb-[18px] pt-3">
        <span
          className={cn(
            "inline-flex flex-1 items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.04em]",
            dirty ? "text-warning" : "text-muted-foreground",
          )}
        >
          {dirty ? (
            <>
              <Loader2 className="h-[13px] w-[13px] animate-spin" strokeWidth={2} aria-hidden />
              Lagrer endringer …
            </>
          ) : lagret ? (
            <>
              <CheckCircle2 className="h-[13px] w-[13px] text-primary" strokeWidth={2} aria-hidden />
              Endring lagret
            </>
          ) : (
            <>
              <Check className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
              Alt lagret
            </>
          )}
        </span>
        <span
          className={cn(
            "inline-flex h-[46px] items-center gap-2 rounded-[12px] px-5 font-mono text-[11px] font-extrabold uppercase tracking-[0.08em]",
            dirty
              ? "bg-primary text-accent"
              : "bg-primary text-accent opacity-45",
          )}
        >
          {dirty ? (
            <CircleDot className="h-3.5 w-3.5 animate-pulse" strokeWidth={2} aria-hidden />
          ) : (
            <Save className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          )}
          {dirty ? "Lagrer" : "Lagret"}
        </span>
      </div>
    </div>
  );
}

// ── personvern-handlinger (gjenbruker GDPR-server-actions) ────────
function EksportRad() {
  const [pending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);

  function onEksport() {
    startTransition(async () => {
      setFeil(null);
      const res = await exportUserData();
      if (!res.ok || !res.data) {
        setFeil(res.error ?? "Eksport feilet.");
        return;
      }
      const blob = new Blob([JSON.stringify(res.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `akgolf-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  return (
    <button
      type="button"
      onClick={onEksport}
      disabled={pending}
      className="flex min-h-[48px] items-center gap-3 px-0.5 text-left disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" strokeWidth={1.75} aria-hidden />
      ) : (
        <Download className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} aria-hidden />
      )}
      <span className="flex flex-1 flex-col">
        <span className="text-[14px] font-semibold tracking-[-0.005em] text-foreground">
          {pending ? "Genererer …" : "Last ned mine data"}
        </span>
        {feil && (
          <span className="mt-0.5 font-mono text-[10px] tracking-[0.04em] text-destructive">
            {feil}
          </span>
        )}
      </span>
      <ChevronRight className="h-[15px] w-[15px] text-muted-foreground" strokeWidth={1.75} aria-hidden />
    </button>
  );
}

function SlettKontoRad() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [bekreft, setBekreft] = useState(false);
  const [tekst, setTekst] = useState("");
  const [feil, setFeil] = useState<string | null>(null);

  function onSlett() {
    startTransition(async () => {
      setFeil(null);
      const res = await deleteUserAccount(tekst);
      if (!res.ok) {
        setFeil(res.error ?? "Sletting feilet.");
        return;
      }
      await logout();
      router.push("/auth/login?deleted=1");
    });
  }

  if (!bekreft) {
    return (
      <button
        type="button"
        onClick={() => setBekreft(true)}
        className="flex min-h-[48px] items-center gap-3 border-t border-dashed border-border px-0.5 text-left"
      >
        <Trash2 className="h-4 w-4 text-destructive" strokeWidth={1.75} aria-hidden />
        <span className="flex-1 text-[14px] font-semibold tracking-[-0.005em] text-destructive">
          Slett konto
        </span>
        <ChevronRight className="h-[15px] w-[15px] text-muted-foreground" strokeWidth={1.75} aria-hidden />
      </button>
    );
  }

  return (
    <div className="mt-1 rounded-[12px] border border-destructive bg-card p-3.5">
      <p className="text-[13px] font-semibold text-destructive">Er du helt sikker?</p>
      <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
        Kontoen deaktiveres umiddelbart og alle data slettes permanent etter 30 dager.
        Skriv <strong className="text-foreground">SLETT</strong> for å bekrefte.
      </p>
      <input
        type="text"
        value={tekst}
        onChange={(e) => setTekst(e.target.value)}
        placeholder="SLETT"
        autoComplete="off"
        autoCapitalize="characters"
        className="mt-2.5 h-11 w-full max-w-[200px] rounded-[10px] border border-input bg-card px-3.5 text-[15px] uppercase tracking-[0.10em] text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
      />
      {feil && (
        <p className="mt-2 font-mono text-[10px] tracking-[0.04em] text-destructive">{feil}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSlett}
          disabled={pending || tekst !== "SLETT"}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-destructive px-5 font-display text-[13px] font-bold text-destructive-foreground transition disabled:opacity-50"
        >
          {pending ? "Sletter …" : "Bekreft sletting"}
        </button>
        <button
          type="button"
          onClick={() => {
            setBekreft(false);
            setTekst("");
            setFeil(null);
          }}
          disabled={pending}
          className="inline-flex h-10 items-center rounded-full border border-border bg-card px-5 font-display text-[13px] font-semibold text-foreground transition hover:bg-secondary"
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}
