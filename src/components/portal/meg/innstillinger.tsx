"use client";

/**
 * Innstillinger — PlayerHQ-skjerm (/portal/meg/innstillinger), preview-variant.
 *
 * Portet FRA v10-fasit (LÅST design-porting-gate):
 *   - Visuell pixel-fasit: [historisk fasit, fjernet 2026-07-03] _screens/pl-innstillinger.png
 *     (mobil 430px — Mathias Sørby, GRATIS, Profil-seksjon åpen øverst).
 *   - HTML/CSS-referanse (eksakte verdier): [historisk fasit, fjernet 2026-07-03] playerhq/
 *     components-innstillinger.html (accordion, toggles, snap-slidere, lagre-bar).
 *   - Manifest: skjerm-manifest-playerhq.md §6 (/portal/meg/innstillinger).
 *
 * Elementliste fra fasiten (topp → bunn):
 *   1. Topbar:        «‹ PROFIL» (mono uppercase, lenke tilbake) + «Innstillinger» (display).
 *   2. Accordion — én seksjon åpen om gangen:
 *      a) Profil      (åpen i fasit): avatar (initialer) + «Bytt bilde» +
 *                     felt FULLT NAVN / E-POST / HJEMMEKLUBB + «Rediger profil ›».
 *      b) Fasiliteter (lukket): undertekst + snap-slidere (range maks / innspill / green).
 *      c) Varsler     (lukket): «N AV M PÅ» + toggle-rader.
 *      d) Personvern  (lukket): plink-rader (last ned data / erklæring / slett konto-danger).
 *   3. Lagre-bar:     status «Alt lagret» → «Ulagrede endringer» når noe endres;
 *                     Lagre-knapp nedtonet til dirty.
 *
 * Presentasjonell + props-drevet for innhold/defaults. Interaktiv tilstand
 * (åpen seksjon, toggles, slider-verdier, dirty) holdes lokalt — INGEN
 * Prisma/DB/auth her. DS-tokens + lucide. Ingen hardkodet hex, ingen emoji.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Download,
  ExternalLink,
  FileText,
  MapPin,
  Save,
  ShieldCheck,
  Trash2,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────────────────────
// Datamodell — alt skjermen trenger som props (defaults; lokal state styrer UI).
// ────────────────────────────────────────────────────────────────────────────

export type InnstillingerProfil = {
  initialer: string;
  avatarUrl?: string | null;
  fulltNavn: string;
  epost: string;
  /** Hjemmeklubb-verdi, f.eks. «Ikke satt» i tom-tilstand. */
  hjemmeklubb: string;
  /** Lenke til full profilredigering. */
  redigerHref: string;
};

export type InnstillingerSlider = {
  id: string;
  navn: string;
  min: number;
  max: number;
  step: number;
  /** Startverdi. */
  value: number;
  /** Enhet som vises etter tallet, f.eks. «m» eller «m²». */
  unit: string;
};

export type InnstillingerToggle = {
  id: string;
  tittel: string;
  /** Undertekst (mono), f.eks. «24 T FØR HVER ØKT». */
  sub: string;
  on: boolean;
};

export type InnstillingerPersonvernLenke = {
  id: string;
  label: string;
  /** Ikon-variant — chevron (intern) eller external-link (ekstern). */
  retning: "intern" | "ekstern";
  danger?: boolean;
  href: string;
};

export type InnstillingerData = {
  /** Tilbake-lenke i topbar (label vises uppercase). */
  tilbake: { label: string; href: string };
  profil: InnstillingerProfil;
  /** Undertekst på Fasiliteter-seksjonshodet, f.eks. «INGEN VALGT · ALLE DRILLS». */
  fasiliteterSub: string;
  fasiliteter: InnstillingerSlider[];
  varsler: InnstillingerToggle[];
  personvern: InnstillingerPersonvernLenke[];
};

type SeksjonId = "profil" | "fasiliteter" | "varsler" | "personvern";

// ────────────────────────────────────────────────────────────────────────────
// Seksjonsskall — hode (ikon + tittel + sub + chevron) + utfellbar body.
// ────────────────────────────────────────────────────────────────────────────

function Seksjon({
  id,
  icon: Icon,
  tittel,
  sub,
  open,
  onToggle,
  children,
}: {
  id: SeksjonId;
  icon: LucideIcon;
  tittel: string;
  sub: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const bodyId = `sec-body-${id}`;
  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex min-h-[56px] w-full items-center gap-3 px-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-primary/[0.08] text-primary">
          <Icon className="size-[17px]" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="flex flex-1 flex-col gap-0.5">
          <span className="font-display text-[15px] font-bold tracking-[-0.012em] text-foreground">
            {tittel}
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
            {sub}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-[18px] shrink-0 transition-transform duration-200",
            open ? "rotate-180 text-primary" : "text-muted-foreground",
          )}
          strokeWidth={2}
          aria-hidden
        />
      </button>

      <div
        id={bodyId}
        hidden={!open}
        className="flex flex-col gap-3.5 border-t border-border px-4 pb-[18px] pt-1"
      >
        {children}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Profil-body — avatar + «Bytt bilde», felt-rader, «Rediger profil ›».
// ────────────────────────────────────────────────────────────────────────────

function Felt({ label, value }: { label: string; value: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <input
        type="text"
        defaultValue={value}
        className="h-[46px] rounded-[11px] border border-input bg-card px-3.5 text-[15px] text-foreground outline-none transition-[border-color,box-shadow] focus:border-primary focus:[box-shadow:0_0_0_3px_color-mix(in_srgb,hsl(var(--ring))_20%,transparent)]"
      />
    </label>
  );
}

function ProfilBody({
  profil,
  onDirty,
}: {
  profil: InnstillingerProfil;
  onDirty: () => void;
}) {
  return (
    <div onInput={onDirty} className="flex flex-col gap-3.5">
      <div className="flex items-center gap-3.5">
        <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-primary font-display text-xl font-bold text-accent">
          {profil.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profil.avatarUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            profil.initialer
          )}
        </span>
        <button
          type="button"
          onClick={onDirty}
          className="inline-flex h-10 items-center gap-[7px] rounded-[10px] border border-border bg-card px-3.5 font-mono text-[11px] font-extrabold tracking-[0.04em] text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          <Camera className="size-[13px]" strokeWidth={2} aria-hidden />
          Bytt bilde
        </button>
      </div>

      <Felt label="Fullt navn" value={profil.fulltNavn} />
      <Felt label="E-post" value={profil.epost} />
      <Felt label="Hjemmeklubb" value={profil.hjemmeklubb} />

      <Link
        href={profil.redigerHref}
        className="mt-0.5 inline-flex items-center gap-1.5 self-start font-mono text-[11px] font-extrabold uppercase tracking-[0.10em] text-primary transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      >
        Rediger profil
        <ChevronRight className="size-3.5" strokeWidth={2.5} aria-hidden />
      </Link>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Fasiliteter-body — snap-slidere med live verdi-utskrift.
// ────────────────────────────────────────────────────────────────────────────

function SliderRad({
  slider,
  onChange,
}: {
  slider: InnstillingerSlider;
  onChange: (verdi: number) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1">
      <span className="text-sm font-semibold tracking-[-0.005em] text-foreground">
        {slider.navn}
      </span>
      <span className="font-mono text-sm font-extrabold tracking-[-0.01em] text-primary tabular-nums">
        {slider.value.toLocaleString("nb-NO")} {slider.unit}
      </span>
      <input
        type="range"
        min={slider.min}
        max={slider.max}
        step={slider.step}
        value={slider.value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={slider.navn}
        className="ak-range col-span-2 m-0 h-11 w-full cursor-pointer appearance-none bg-transparent"
      />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Varsler-body — toggle-rader.
// ────────────────────────────────────────────────────────────────────────────

function ToggleRad({
  toggle,
  onToggle,
}: {
  toggle: InnstillingerToggle;
  onToggle: () => void;
}) {
  return (
    <div className="flex min-h-12 items-center gap-3 py-1">
      <span className="flex-1">
        <span className="block text-sm font-semibold tracking-[-0.005em] text-foreground">
          {toggle.tittel}
        </span>
        <span className="mt-px block font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
          {toggle.sub}
        </span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={toggle.on}
        aria-label={toggle.tittel}
        onClick={onToggle}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          toggle.on ? "bg-primary" : "bg-secondary",
        )}
      >
        <span
          className={cn(
            "absolute left-[3px] top-[3px] size-[22px] rounded-full bg-card shadow-[0_1px_4px_rgba(10,31,23,0.25)] transition-transform duration-200",
            toggle.on && "translate-x-5",
          )}
        />
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Personvern-body — lenke-rader (intern chevron / ekstern link / danger).
// ────────────────────────────────────────────────────────────────────────────

function PersonvernRad({
  lenke,
  forste,
}: {
  lenke: InnstillingerPersonvernLenke;
  forste: boolean;
}) {
  const LeadIcon = lenke.danger ? Trash2 : lenke.retning === "ekstern" ? FileText : Download;
  const TrailIcon = lenke.retning === "ekstern" ? ExternalLink : ChevronRight;
  return (
    <Link
      href={lenke.href}
      className={cn(
        "flex min-h-12 items-center gap-3 px-0.5 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        !forste && "border-t border-dashed border-border",
        lenke.danger ? "text-destructive" : "text-foreground",
      )}
    >
      <LeadIcon
        className={cn("size-4", lenke.danger ? "text-destructive" : "text-muted-foreground")}
        strokeWidth={2}
        aria-hidden
      />
      <span className="flex-1 text-sm font-semibold tracking-[-0.005em]">{lenke.label}</span>
      <TrailIcon className="size-[15px] text-muted-foreground" strokeWidth={2} aria-hidden />
    </Link>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Hovedkomponent.
// ────────────────────────────────────────────────────────────────────────────

export function Innstillinger({ data }: { data: InnstillingerData }) {
  const [open, setOpen] = useState<SeksjonId>("profil");
  const [sliders, setSliders] = useState(data.fasiliteter);
  const [toggles, setToggles] = useState(data.varsler);
  const [dirty, setDirty] = useState(false);

  const varslerPaa = useMemo(
    () => toggles.filter((t) => t.on).length,
    [toggles],
  );

  function velg(id: SeksjonId) {
    setOpen((prev) => (prev === id ? ("" as SeksjonId) : id));
  }

  function settSlider(id: string, verdi: number) {
    setSliders((prev) => prev.map((s) => (s.id === id ? { ...s, value: verdi } : s)));
    setDirty(true);
  }

  function vippToggle(id: string) {
    setToggles((prev) => prev.map((t) => (t.id === id ? { ...t, on: !t.on } : t)));
    setDirty(true);
  }

  return (
    <div className="mx-auto w-full max-w-[460px] md:max-w-[640px]">
      {/* Range-thumb/track-styling kan ikke uttrykkes i Tailwind-utilities. */}
      <style>{`
        .ak-range::-webkit-slider-runnable-track { height: 6px; border-radius: 9999px; background: rgba(10,31,23,0.10); }
        .ak-range::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; margin-top: -9px; width: 24px; height: 24px; border-radius: 9999px; background: hsl(var(--accent)); border: 3px solid hsl(var(--card)); box-shadow: 0 2px 8px rgba(10,31,23,0.25); }
        .ak-range::-moz-range-track { height: 6px; border-radius: 9999px; background: rgba(10,31,23,0.10); }
        .ak-range::-moz-range-thumb { width: 24px; height: 24px; border-radius: 9999px; border: 3px solid hsl(var(--card)); background: hsl(var(--accent)); box-shadow: 0 2px 8px rgba(10,31,23,0.25); }
      `}</style>

      {/* Topbar */}
      <div className="flex items-center gap-3 border-b border-border px-2 py-3">
        <Link
          href={data.tilbake.href}
          className="inline-flex items-center gap-1.5 px-1 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
        >
          <ChevronLeft className="size-[13px]" strokeWidth={2.5} aria-hidden />
          {data.tilbake.label}
        </Link>
        <h1 className="font-display text-[17px] font-bold tracking-[-0.015em] text-foreground">
          Innstillinger
        </h1>
      </div>

      {/* Accordion */}
      <div className="flex flex-col gap-2.5 px-3.5 pb-4 pt-3">
        <Seksjon
          id="profil"
          icon={User}
          tittel="Profil"
          sub="NAVN · E-POST · BILDE"
          open={open === "profil"}
          onToggle={() => velg("profil")}
        >
          <ProfilBody profil={data.profil} onDirty={() => setDirty(true)} />
        </Seksjon>

        <Seksjon
          id="fasiliteter"
          icon={MapPin}
          tittel="Fasiliteter"
          sub={data.fasiliteterSub}
          open={open === "fasiliteter"}
          onToggle={() => velg("fasiliteter")}
        >
          {sliders.map((s) => (
            <SliderRad key={s.id} slider={s} onChange={(v) => settSlider(s.id, v)} />
          ))}
        </Seksjon>

        <Seksjon
          id="varsler"
          icon={Bell}
          tittel="Varsler"
          sub={`${varslerPaa} AV ${toggles.length} PÅ`}
          open={open === "varsler"}
          onToggle={() => velg("varsler")}
        >
          {toggles.map((t) => (
            <ToggleRad key={t.id} toggle={t} onToggle={() => vippToggle(t.id)} />
          ))}
        </Seksjon>

        <Seksjon
          id="personvern"
          icon={ShieldCheck}
          tittel="Personvern"
          sub="DATA · GDPR · KONTO"
          open={open === "personvern"}
          onToggle={() => velg("personvern")}
        >
          {data.personvern.map((l, i) => (
            <PersonvernRad key={l.id} lenke={l} forste={i === 0} />
          ))}
        </Seksjon>
      </div>

      {/* Lagre-bar */}
      <div className="flex items-center gap-2.5 border-t border-border bg-secondary px-4 pb-[18px] pt-3">
        <span
          className={cn(
            "inline-flex flex-1 items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.04em]",
            dirty ? "text-warning-foreground" : "text-muted-foreground",
          )}
        >
          {dirty ? (
            <>
              <CircleDot className="size-[13px]" strokeWidth={2} aria-hidden />
              Ulagrede endringer
            </>
          ) : (
            <>
              <CheckCircle2 className="size-[13px]" strokeWidth={2} aria-hidden />
              Alt lagret
            </>
          )}
        </span>
        <button
          type="button"
          disabled={!dirty}
          onClick={() => setDirty(false)}
          className={cn(
            "inline-flex h-[46px] items-center gap-2 rounded-xl bg-primary px-5 font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-accent transition-opacity",
            dirty ? "hover:opacity-90" : "pointer-events-none opacity-45",
          )}
        >
          <Save className="size-3.5" strokeWidth={2} aria-hidden />
          Lagre
        </button>
      </div>
    </div>
  );
}
