"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Check,
  HelpCircle,
  RefreshCw,
  Save,
} from "lucide-react";
import { updateProfile } from "./actions";
import { AthleticButton } from "@/components/athletic/button";

type Initial = {
  name: string;
  email: string;
  phone: string;
  hcp: number | null;
  homeClub: string;
  ambition: string;
  playingYears: number | null;
  avatarUrl: string | null;
  tier: "GRATIS" | "PRO" | "ELITE";
  fodselsdato: string;
  adresse: string;
  kjonn: string;
  aListe: string;
  dominantHand: "Høyrehendt" | "Venstrehendt";
};

export function ProfilRedigerForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Split "Markus Røinås Pedersen" -> fornavn/etternavn
  const parts = initial.name.split(" ");
  const [fornavn, setFornavn] = useState(parts[0] ?? "");
  const [etternavn, setEtternavn] = useState(parts.slice(1).join(" "));
  const [fodselsdato, setFodselsdato] = useState(initial.fodselsdato);
  const [kjonn, setKjonn] = useState(initial.kjonn);
  const [email, setEmail] = useState(initial.email);
  const [telefon, setTelefon] = useState(initial.phone.replace(/^\+47\s*/, ""));
  const [adresse, setAdresse] = useState(initial.adresse);
  const [homeClub, setHomeClub] = useState(initial.homeClub);
  const [aListe, setAListe] = useState(initial.aListe);
  const [dominant, setDominant] = useState<"Høyrehendt" | "Venstrehendt">(
    initial.dominantHand,
  );
  const [ambition, setAmbition] = useState(initial.ambition);

  // Dirty-tracking
  const dirty =
    fornavn !== parts[0] ||
    etternavn !== parts.slice(1).join(" ") ||
    fodselsdato !== initial.fodselsdato ||
    kjonn !== initial.kjonn ||
    email !== initial.email ||
    telefon !== initial.phone.replace(/^\+47\s*/, "") ||
    adresse !== initial.adresse ||
    homeClub !== initial.homeClub ||
    aListe !== initial.aListe ||
    dominant !== initial.dominantHand ||
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
          homeClub,
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

  const initialer = (fornavn[0] ?? "") + (etternavn[0] ?? "");

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[280px_1fr]">
      {/* ID-kort */}
      <aside className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-8">
        <div className="relative">
          <div className="grid h-24 w-24 place-items-center rounded-full border-[3px] border-accent bg-primary text-accent">
            <span className="font-display text-[30px] font-bold leading-none tracking-tight">
              {initialer.toUpperCase() || "?"}
            </span>
          </div>
          <button
            type="button"
            aria-label="Bytt profilbilde"
            className="absolute -bottom-0.5 -right-0.5 grid h-8 w-8 place-items-center rounded-full border-[2px] border-card bg-accent text-foreground transition-opacity hover:opacity-90"
          >
            <Camera className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="text-center">
          <h2 className="font-display text-[22px] font-medium italic leading-tight tracking-tight text-foreground">
            {fornavn} {etternavn}
          </h2>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="rounded-md bg-primary px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-primary-foreground">
              {initial.tier}
            </span>
          </div>
        </div>

        <div className="w-full space-y-1.5 border-t border-border pt-4 text-[12px]">
          <Stat label="HCP" value={initial.hcp != null ? String(initial.hcp).replace(".", ",") : "—"} mono />
          <Stat label="Klubb" value={homeClub.split(" ").slice(0, 2).join(" ")} />
          <Stat label="A-liste" value={aListe.split(" ")[0]} mono />
        </div>

        <div className="w-full space-y-1 border-t border-border pt-4 text-[10px] font-mono uppercase tracking-[0.10em] text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="h-3 w-3 text-primary" strokeWidth={2} />
            <span>JPG / PNG · maks 5 MB</span>
          </div>
        </div>
      </aside>

      {/* Form */}
      <div className="flex min-w-0 flex-col gap-8">
        <Section title="Personalia" aux="Hvem du er">
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
            <Field label="Fornavn" required>
              <input
                className={inputCss}
                value={fornavn}
                onChange={(e) => setFornavn(e.target.value)}
                required
              />
            </Field>
            <Field label="Etternavn" required>
              <input
                className={inputCss}
                value={etternavn}
                onChange={(e) => setEtternavn(e.target.value)}
                required
              />
            </Field>
            <Field label="Fødselsdato" required>
              <input
                className={`${inputCss} font-mono`}
                value={fodselsdato}
                onChange={(e) => setFodselsdato(e.target.value)}
                placeholder="DD.MM.ÅÅÅÅ"
              />
            </Field>
            <Field label="Kjønn">
              <select
                className={inputCss}
                value={kjonn}
                onChange={(e) => setKjonn(e.target.value)}
              >
                <option>Mann</option>
                <option>Kvinne</option>
                <option>Annet</option>
                <option>Vil ikke oppgi</option>
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Kontakt" aux="Hvordan vi når deg">
          <div className="flex flex-col gap-4 p-6">
            <Field label="E-post" required badge={<span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.10em] text-primary"><Check className="h-2.5 w-2.5" strokeWidth={2.2} />Verifisert</span>}>
              <input
                type="email"
                className={`${inputCss} font-mono text-[13px]`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Telefon">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[12px] text-muted-foreground">
                    +47
                  </span>
                  <input
                    type="tel"
                    inputMode="tel"
                    className={`${inputCss} pl-12 font-mono`}
                    value={telefon}
                    onChange={(e) => setTelefon(e.target.value)}
                  />
                </div>
              </Field>
              <Field label="Adresse">
                <input
                  className={inputCss}
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Gateadresse"
                />
              </Field>
            </div>
          </div>
        </Section>

        <Section title="Golf" aux="Synces til coach">
          <div className="flex flex-col gap-4 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.4fr_0.8fr_0.8fr]">
              <Field label="Klubb" required>
                <select
                  className={inputCss}
                  value={homeClub}
                  onChange={(e) => setHomeClub(e.target.value)}
                >
                  <option>Søgne &amp; Mandal Golfklubb</option>
                  <option>Kristiansand Golfklubb</option>
                  <option>Mandal Golfklubb</option>
                  <option>Bjaavann Golfklubb</option>
                  <option>Gamle Fredrikstad GK</option>
                  <option>Oslo Golfklubb</option>
                </select>
              </Field>
              <Field
                label="HCP"
                badge={
                  <span title="Synket fra GolfBox – ikke redigerbar her">
                    <HelpCircle className="h-3 w-3 text-muted-foreground/70" strokeWidth={1.75} />
                  </span>
                }
              >
                <input
                  className={`${inputCss} cursor-not-allowed border-dashed bg-muted font-mono font-semibold text-muted-foreground`}
                  value={initial.hcp != null ? String(initial.hcp).replace(".", ",") : "—"}
                  disabled
                />
                <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-[color:rgb(44_125_82)]">
                  <RefreshCw className="h-2.5 w-2.5" strokeWidth={2} />
                  Synket fra GolfBox · 18. mai
                </div>
              </Field>
              <Field label="A-liste">
                <select
                  className={inputCss}
                  value={aListe}
                  onChange={(e) => setAListe(e.target.value)}
                >
                  <option>A1 — Toppidrett</option>
                  <option>A2 — Talent</option>
                  <option>B — Aktiv</option>
                  <option>Ingen</option>
                </select>
              </Field>
            </div>

            <Field label="Dominant hånd">
              <div className="grid grid-cols-2 gap-2 rounded-md border border-border bg-muted p-1">
                {(["Høyrehendt", "Venstrehendt"] as const).map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setDominant(h)}
                    className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                      dominant === h
                        ? "bg-card text-foreground shadow-sm"
                        : "bg-transparent text-muted-foreground"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Ambisjon" hint="Maks 280 tegn">
              <textarea
                className={inputCss}
                rows={3}
                value={ambition}
                onChange={(e) => setAmbition(e.target.value.slice(0, 280))}
                placeholder="Hva er du på vei mot?"
              />
              <span className="mt-1 block text-right font-mono text-[10px] text-muted-foreground">
                {ambition.length} / 280
              </span>
            </Field>
          </div>
        </Section>

        {/* Sticky save-bar */}
        <div className="sticky bottom-4 z-10 flex items-center gap-4 rounded-full border border-border bg-card/95 px-6 py-3 shadow-lg backdrop-blur">
          {dirty ? (
            <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.06em] text-[color:rgb(217_119_6)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:rgb(217_119_6)]" />
              Ulagrede endringer
            </span>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
              Ingen endringer
            </span>
          )}
          {savedAt && (
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
              <Check className="h-3 w-3" strokeWidth={2} />
              Lagret
            </span>
          )}
          {error && <span className="text-xs text-destructive">{error}</span>}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Avbryt
            </button>
            <AthleticButton
              type="button"
              variant="primary"
              disabled={!dirty || pending}
              onClick={lagre}
            >
              <Save className="h-3.5 w-3.5" strokeWidth={2} />
              {pending ? "Lagrer …" : "Lagre endringer"}
            </AthleticButton>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCss =
  "w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30";

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
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <header className="flex items-baseline justify-between border-b border-border px-6 py-4">
        <h2 className="font-display text-base font-semibold text-foreground">
          {title}
        </h2>
        {aux && (
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {aux}
          </span>
        )}
      </header>
      <div>{children}</div>
    </section>
  );
}

function Field({
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
      <label className="flex items-center gap-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
        {badge && <span className="ml-auto">{badge}</span>}
      </label>
      {children}
      {hint && (
        <span className="font-mono text-[10px] text-muted-foreground/70">
          {hint}
        </span>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between py-1 text-muted-foreground">
      <span>{label}</span>
      <span className={`font-medium text-foreground ${mono ? "font-mono text-[13px]" : ""}`}>
        {value}
      </span>
    </div>
  );
}
