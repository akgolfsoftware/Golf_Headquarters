"use client";

/**
 * Ny booking — 5-stegs wizard (/admin/bookinger/ny).
 *
 * Steg: 1 Spiller · 2 Tjeneste · 3 Lokasjon/fasilitet · 4 Dato & tid · 5 Bekreft.
 * Wirer mot eksisterende server-action createSessionFromCalendar (src/app/admin/
 * calendar/actions.ts) — ingen ny booking-logikk. AgencyOS-DNA: mono-eyebrows,
 * lime-aksent, DS-tokens, lucide-ikoner. Ingen hardkodet hex, ingen emoji.
 *
 * Validering pr. steg (kan ikke gå videre uten påkrevd valg). Pris/varighet
 * vises fra valgt tjeneste — aldri oppdiktede tall.
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  MapPin,
  Search,
  Tag,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createSessionFromCalendar } from "@/app/admin/(legacy)/calendar/actions";

type Spiller = { id: string; name: string; email: string; homeClub: string | null };
type Tjeneste = { id: string; name: string; durationMin: number; priceOre: number };
type Fasilitet = { id: string; name: string };
type Lokasjon = { id: string; name: string; address: string; facilities: Fasilitet[] };

export type NyBookingWizardProps = {
  spillere: Spiller[];
  tjenester: Tjeneste[];
  lokasjoner: Lokasjon[];
  groupId?: string;
  group?: { id: string; name: string; maxParticipants: number | null } | null;
};

const STEG = [
  { n: 1, label: "Spiller", icon: UserIcon },
  { n: 2, label: "Tjeneste", icon: Tag },
  { n: 3, label: "Lokasjon", icon: MapPin },
  { n: 4, label: "Dato & tid", icon: Calendar },
  { n: 5, label: "Bekreft", icon: ClipboardList },
] as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatKr(ore: number): string {
  return new Intl.NumberFormat("nb-NO").format(Math.round(ore / 100));
}

export function NyBookingWizard({ spillere, tjenester, lokasjoner, groupId, group }: NyBookingWizardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [steg, setSteg] = useState(1);
  const [spillerId, setSpillerId] = useState<string | null>(null);
  const [tjenesteId, setTjenesteId] = useState<string | null>(null);
  const [lokasjonId, setLokasjonId] = useState<string | null>(null);
  const [fasilitetId, setFasilitetId] = useState<string | null>(null);
  const [dato, setDato] = useState("");
  const [tid, setTid] = useState("");
  const [notat, setNotat] = useState("");
  const [sok, setSok] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [antallDeltagere, setAntallDeltagere] = useState<number | null>(group?.maxParticipants || null);
  const isGroup = !!groupId;

  const valgtSpiller = spillere.find((s) => s.id === spillerId) ?? null;
  const valgtTjeneste = tjenester.find((t) => t.id === tjenesteId) ?? null;
  const valgtLokasjon = lokasjoner.find((l) => l.id === lokasjonId) ?? null;
  const valgtFasilitet = valgtLokasjon?.facilities.find((f) => f.id === fasilitetId) ?? null;

  const filtrerteSpillere = useMemo(() => {
    const q = sok.trim().toLowerCase();
    if (!q) return spillere;
    return spillere.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.homeClub?.toLowerCase().includes(q) ?? false),
    );
  }, [spillere, sok]);

  const kanVidere =
    (steg === 1 && (isGroup || !!spillerId)) ||
    (steg === 2 && !!tjenesteId) ||
    (steg === 3 && !!lokasjonId) ||
    (steg === 4 && !!dato && !!tid) ||
    steg === 5;

  function neste() {
    setFeil(null);
    if (steg < 5 && kanVidere) setSteg((s) => s + 1);
  }
  function forrige() {
    setFeil(null);
    if (steg > 1) setSteg((s) => s - 1);
  }

  function opprett() {
    if (!tjenesteId || !lokasjonId || !valgtTjeneste || !dato || !tid) {
      setFeil("Fyll ut alle påkrevde felt.");
      return;
    }
    if (!isGroup && !spillerId) {
      setFeil("Velg spiller eller gruppe.");
      return;
    }
    const startAt = new Date(`${dato}T${tid}`);
    if (Number.isNaN(startAt.getTime())) {
      setFeil("Ugyldig dato eller tid.");
      return;
    }
    setFeil(null);
    startTransition(async () => {
      try {
        if (isGroup && groupId) {
          // For gruppe: opprett GroupSchedule med antall deltagere
          const { opprettGruppeTrening } = await import("@/app/admin/grupper/[id]/actions");
          const varighetMin = valgtTjeneste.durationMin;
          const endAt = new Date(startAt.getTime() + varighetMin * 60000);
          await opprettGruppeTrening(groupId, {
            title: valgtTjeneste.name + (group ? ` · ${group.name}` : ""),
            startAt,
            endAt,
            location: valgtLokasjon?.name,
            recurring: "NONE",
            maxParticipants: antallDeltagere || undefined,
          });
          router.push(`/admin/grupper/${groupId}/timeplan`);
        } else if (spillerId) {
          const res = await createSessionFromCalendar({
            spillerId,
            serviceTypeId: tjenesteId,
            locationId: lokasjonId,
            facilityId: fasilitetId ?? undefined,
            startAt,
            varighetMin: valgtTjeneste.durationMin,
            notater: notat.trim() || undefined,
          });
          router.push(`/admin/bookinger/${res.bookingId}`);
        }
        router.refresh();
      } catch (e) {
        setFeil(e instanceof Error ? e.message : "Kunne ikke opprette.");
      }
    });
  }

  return (
    <div className="mx-auto max-w-[960px] px-6 py-8">
      <Link
        href="/admin/bookinger"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        Tilbake til bookinger
      </Link>

      <h1 className="mt-3 font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-foreground">
        Ny <em className="font-normal italic text-primary">booking</em>
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manuell booking for en spiller — fem steg. Sender ingen automatisk bekreftelse.
      </p>

      {/* Stepper */}
      <ol className="mt-6 flex flex-wrap items-center gap-2">
        {STEG.map((s, i) => {
          const aktiv = s.n === steg;
          const ferdig = s.n < steg;
          const StegIcon = ferdig ? Check : s.icon;
          return (
            <li key={s.n} className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em]",
                  aktiv
                    ? "border-primary bg-primary text-primary-foreground"
                    : ferdig
                      ? "border-accent/50 bg-accent/15 text-primary"
                      : "border-border bg-card text-muted-foreground",
                )}
              >
                <StegIcon className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                {s.label}
              </span>
              {i < STEG.length - 1 && (
                <span
                  className={cn("h-px w-4", ferdig ? "bg-accent/60" : "bg-border")}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        {/* STEG 1 — Spiller eller Gruppe */}
        {steg === 1 && (
          <StegRamme tittel={isGroup ? "Gruppe" : "Velg spiller"} sub={isGroup ? "Gruppe trening" : "Hvem er bookingen for?"}>
            {isGroup && group ? (
              <div className="p-4 border rounded bg-accent/10">
                <div className="font-bold">{group.name}</div>
                <div className="text-sm text-muted-foreground">Gruppe trening • max {group.maxParticipants || "ubegrenset"} deltagere</div>
                <div className="text-xs mt-1">Antall deltagere: <input type="number" value={antallDeltagere || ""} onChange={e => setAntallDeltagere(e.target.value ? parseInt(e.target.value) : null)} className="border px-1 w-20" /></div>
              </div>
            ) : (
              <>
                <label className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground">
                  <Search className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                  <input
                    type="search"
                    value={sok}
                    onChange={(e) => setSok(e.target.value)}
                    placeholder="Søk navn, e-post eller klubb"
                    className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </label>
                <div className="mt-3 max-h-[360px] space-y-1.5 overflow-y-auto pr-1">
                  {filtrerteSpillere.map((s) => {
                    const valgt = s.id === spillerId;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSpillerId(s.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                          valgt
                            ? "border-primary bg-accent/10"
                            : "border-border bg-background hover:border-input",
                        )}
                      >
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-xs font-bold text-foreground">
                          {initials(s.name)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold tracking-[-0.005em] text-foreground">
                            {s.name}
                          </span>
                          <span className="block truncate font-mono text-[10px] tracking-[0.02em] text-muted-foreground">
                            {[s.homeClub, s.email].filter(Boolean).join(" · ")}
                          </span>
                        </span>
                        {valgt && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} aria-hidden />
                        )}
                      </button>
                    );
                  })}
                  {filtrerteSpillere.length === 0 && (
                    <Tom tekst="Ingen spillere matcher søket." />
                  )}
                </div>
              </>
            )}
          </StegRamme>
        )}

        {/* STEG 2 — Tjeneste */}
        {steg === 2 && (
          <StegRamme tittel="Velg tjeneste" sub="Type, varighet og pris låses fra tjenesten.">
            {tjenester.length === 0 ? (
              <Tom tekst="Ingen aktive tjenester. Opprett en under Tjenester." />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {tjenester.map((t) => {
                  const valgt = t.id === tjenesteId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTjenesteId(t.id)}
                      className={cn(
                        "flex flex-col gap-2 rounded-lg border p-3.5 text-left transition-colors",
                        valgt
                          ? "border-primary bg-accent/10"
                          : "border-border bg-background hover:border-input",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-bold tracking-[-0.005em] text-foreground">
                          {t.name}
                        </span>
                        {valgt && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} aria-hidden />
                        )}
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" strokeWidth={1.75} aria-hidden />
                          {t.durationMin} min
                        </span>
                        <span className="inline-flex items-center gap-1 font-bold text-foreground">
                          {formatKr(t.priceOre)} kr
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </StegRamme>
        )}

        {/* STEG 3 — Lokasjon / fasilitet */}
        {steg === 3 && (
          <StegRamme tittel="Velg lokasjon" sub="Og eventuelt en spesifikk fasilitet.">
            {lokasjoner.length === 0 ? (
              <Tom tekst="Ingen aktive lokasjoner. Legg til under Anlegg." />
            ) : (
              <div className="space-y-2">
                {lokasjoner.map((l) => {
                  const valgt = l.id === lokasjonId;
                  return (
                    <div key={l.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setLokasjonId(l.id);
                          setFasilitetId(null);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                          valgt
                            ? "border-primary bg-accent/10"
                            : "border-border bg-background hover:border-input",
                        )}
                      >
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                          <Building2 className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold tracking-[-0.005em] text-foreground">
                            {l.name}
                          </span>
                          <span className="block truncate font-mono text-[10px] tracking-[0.02em] text-muted-foreground">
                            {l.address}
                          </span>
                        </span>
                        {valgt && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} aria-hidden />
                        )}
                      </button>

                      {valgt && l.facilities.length > 0 && (
                        <div className="ml-12 mt-2 flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => setFasilitetId(null)}
                            className={cn(
                              "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em]",
                              fasilitetId === null
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-card text-muted-foreground hover:bg-secondary",
                            )}
                          >
                            Hele lokasjonen
                          </button>
                          {l.facilities.map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setFasilitetId(f.id)}
                              className={cn(
                                "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em]",
                                fasilitetId === f.id
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-card text-muted-foreground hover:bg-secondary",
                              )}
                            >
                              {f.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </StegRamme>
        )}

        {/* STEG 4 — Dato & tid */}
        {steg === 4 && (
          <StegRamme tittel="Dato og tid" sub="Varighet settes automatisk fra tjenesten.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Felt label="Dato" icon={Calendar}>
                <input
                  type="date"
                  value={dato}
                  onChange={(e) => setDato(e.target.value)}
                  className={inputCls}
                />
              </Felt>
              <Felt label="Starttid" icon={Clock}>
                <input
                  type="time"
                  value={tid}
                  onChange={(e) => setTid(e.target.value)}
                  className={inputCls}
                />
              </Felt>
            </div>
            {valgtTjeneste && (
              <p className="mt-3 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
                Varighet: <span className="font-bold text-foreground">{valgtTjeneste.durationMin} min</span>
                {dato && tid && (
                  <> · slutt ca. {sluttTid(dato, tid, valgtTjeneste.durationMin)}</>
                )}
              </p>
            )}
            <Felt label="Notat (valgfritt)" className="mt-4">
              <textarea
                rows={3}
                value={notat}
                onChange={(e) => setNotat(e.target.value.slice(0, 500))}
                placeholder="Intern merknad om bookingen…"
                className={inputCls}
              />
            </Felt>
            {isGroup && (
              <Felt label="Antall deltagere (max)" className="mt-4">
                <input
                  type="number"
                  value={antallDeltagere || ""}
                  onChange={(e) => setAntallDeltagere(e.target.value ? parseInt(e.target.value) : null)}
                  className={inputCls}
                  placeholder="Antall deltagere"
                />
              </Felt>
            )}
          </StegRamme>
        )}

        {/* STEG 5 — Bekreft */}
        {steg === 5 && (
          <StegRamme tittel="Bekreft booking" sub="Sjekk detaljene før du oppretter.">
            <dl className="divide-y divide-border rounded-lg border border-border bg-background">
              <Oppsummer label="Spiller" verdi={valgtSpiller?.name ?? "—"} />
              <Oppsummer
                label="Tjeneste"
                verdi={
                  valgtTjeneste
                    ? `${valgtTjeneste.name} · ${valgtTjeneste.durationMin} min · ${formatKr(valgtTjeneste.priceOre)} kr`
                    : "—"
                }
              />
              <Oppsummer
                label="Sted"
                verdi={
                  valgtLokasjon
                    ? [valgtLokasjon.name, valgtFasilitet?.name].filter(Boolean).join(" · ")
                    : "—"
                }
              />
              <Oppsummer
                label="Tidspunkt"
                verdi={dato && tid ? `${formatDato(dato)} kl. ${tid}` : "—"}
              />
              {notat.trim() && <Oppsummer label="Notat" verdi={notat.trim()} />}
            </dl>
          </StegRamme>
        )}

        {feil && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
          >
            {feil}
          </div>
        )}

        {/* Navigasjon */}
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-5">
          <button
            type="button"
            onClick={forrige}
            disabled={steg === 1 || pending}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Forrige
          </button>

          {steg < 5 ? (
            <button
              type="button"
              onClick={neste}
              disabled={!kanVidere || pending}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Neste
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              onClick={opprett}
              disabled={pending}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
              {pending ? "Oppretter…" : "Opprett booking"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Hjelpere ────────────────────────────────────────────────────
const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus:border-ring";

function sluttTid(dato: string, tid: string, durMin: number): string {
  const start = new Date(`${dato}T${tid}`);
  if (Number.isNaN(start.getTime())) return "—";
  const slutt = new Date(start.getTime() + durMin * 60_000);
  return `${String(slutt.getHours()).padStart(2, "0")}:${String(slutt.getMinutes()).padStart(2, "0")}`;
}

function formatDato(iso: string): string {
  const d = new Date(`${iso}T00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" });
}

function StegRamme({
  tittel,
  sub,
  children,
}: {
  tittel: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="font-display text-lg font-bold tracking-[-0.015em] text-foreground">{tittel}</h2>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {sub}
        </p>
      </div>
      {children}
    </div>
  );
}

function Felt({
  label,
  icon: Icon,
  className,
  children,
}: {
  label: string;
  icon?: typeof Calendar;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" strokeWidth={1.75} aria-hidden />}
        {label}
      </span>
      {children}
    </label>
  );
}

function Oppsummer({ label, verdi }: { label: string; verdi: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-right text-sm font-semibold tracking-[-0.005em] text-foreground">{verdi}</dd>
    </div>
  );
}

function Tom({ tekst }: { tekst: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-background px-4 py-10 text-center text-sm text-muted-foreground">
      {tekst}
    </div>
  );
}
