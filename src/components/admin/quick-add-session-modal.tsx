"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, X } from "lucide-react";
import { opprettOktPaaTid } from "@/app/admin/calendar/actions";

export type SpillerOption = {
  id: string;
  name: string;
  email: string;
};

export type ServiceTypeOption = {
  id: string;
  name: string;
  durationMin: number;
};

export type LocationOption = {
  id: string;
  name: string;
};

export type FacilityOption = {
  id: string;
  name: string;
  locationId: string;
};

export type QuickAddSlot = {
  /** ISO-streng (UTC) for valgt start-tidspunkt. Brukes for å unngå tidsone-glipp serverside. */
  startIso: string;
  /** Norsk label, f.eks. "Mandag 12. mai". */
  datoLabel: string;
  /** Klokketid "HH:MM" (lokal). */
  tidLabel: string;
  /** Norsk ukedag, brukt i header ("Mandag"). */
  ukedag: string;
};

type Props = {
  slot: QuickAddSlot | null;
  onClose: () => void;
  spillere: SpillerOption[];
  serviceTypes: ServiceTypeOption[];
  locations: LocationOption[];
  facilities?: FacilityOption[];
  defaultLocationId?: string;
};

export function QuickAddSessionModal({
  slot,
  onClose,
  spillere,
  serviceTypes,
  locations,
  facilities = [],
  defaultLocationId,
}: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();

  // Default service-type: 60 min pro-time hvis vi finner en — ellers første aktive.
  const defaultServiceTypeId = useMemo(() => {
    if (serviceTypes.length === 0) return "";
    const proTime = serviceTypes.find(
      (s) =>
        s.durationMin === 60 &&
        (s.name.toLowerCase().includes("pro") ||
          s.name.toLowerCase().includes("1:1") ||
          s.name.toLowerCase().includes("coaching")),
    );
    return proTime?.id ?? serviceTypes[0].id;
  }, [serviceTypes]);

  // Default location: "Mulligan Borre" hvis funnet, ellers defaultLocationId, ellers første.
  const defaultLocId = useMemo(() => {
    if (locations.length === 0) return "";
    const mulligan = locations.find((l) =>
      l.name.toLowerCase().includes("mulligan"),
    );
    if (mulligan) return mulligan.id;
    if (defaultLocationId) return defaultLocationId;
    return locations[0].id;
  }, [locations, defaultLocationId]);

  // Når slot åpnes må alle form-felter resettes. Vi sporer hvilken slot
  // staten i øyeblikket "tilhører" — hvis slot bytter, regenererer vi state
  // i selve render-fasen (i stedet for via useEffect, som gir cascading
  // renders).
  const [aktivSlotKey, setAktivSlotKey] = useState<string | null>(null);
  const [spillerSok, setSpillerSok] = useState("");
  const [spillerId, setSpillerId] = useState("");
  const [serviceTypeId, setServiceTypeId] = useState(defaultServiceTypeId);
  const [locationId, setLocationId] = useState(defaultLocId);
  const [varighetMin, setVarighetMin] = useState<number>(() => {
    const st = serviceTypes.find((s) => s.id === defaultServiceTypeId);
    return st?.durationMin ?? 60;
  });
  const [facilityId, setFacilityId] = useState<string>("");
  const [notater, setNotater] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Facilities for valgt lokasjon
  const facilityValg = useMemo(
    () => facilities.filter((f) => f.locationId === locationId),
    [facilities, locationId],
  );

  const slotKey = slot?.startIso ?? null;
  if (slotKey !== aktivSlotKey) {
    setAktivSlotKey(slotKey);
    setSpillerSok("");
    setSpillerId("");
    setServiceTypeId(defaultServiceTypeId);
    setLocationId(defaultLocId);
    const st = serviceTypes.find((s) => s.id === defaultServiceTypeId);
    setVarighetMin(st?.durationMin ?? 60);
    setFacilityId("");
    setNotater("");
    setError(null);
    setSuccess(null);
  }

  // Reset facility-valg når lokasjon endres
  if (
    facilityId &&
    facilityValg.length > 0 &&
    !facilityValg.some((f) => f.id === facilityId)
  ) {
    setFacilityId("");
  }

  // Vis/skjul dialog via slot.
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (slot && !dlg.open) dlg.showModal();
    if (!slot && dlg.open) dlg.close();
  }, [slot]);

  // Når brukeren bytter service-type, oppdater varighet til den nye defaulten.
  function valgtServiceType(id: string) {
    setServiceTypeId(id);
    const st = serviceTypes.find((s) => s.id === id);
    if (st) setVarighetMin(st.durationMin);
  }

  // Filtrer spillere på enkel substring-match.
  const matchendeSpillere = useMemo(() => {
    const q = spillerSok.trim().toLowerCase();
    if (!q) return spillere.slice(0, 8);
    return spillere
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [spillere, spillerSok]);

  function lukk() {
    setError(null);
    setSuccess(null);
    onClose();
  }

  function lagre(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!slot) return;
    if (!spillerId) {
      setError("Velg en spiller.");
      return;
    }
    if (!serviceTypeId) {
      setError("Velg en tjeneste.");
      return;
    }
    if (!locationId) {
      setError("Velg en lokasjon.");
      return;
    }
    if (!varighetMin || varighetMin <= 0) {
      setError("Varighet må være større enn 0.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        await opprettOktPaaTid({
          spillerId,
          serviceTypeId,
          locationId,
          facilityId: facilityId || undefined,
          startAt: slot.startIso,
          varighetMin,
          notater: notater.trim() || undefined,
        });
        setSuccess("Økt opprettet.");
        router.refresh();
        // Lukk modal etter kort suksess-tilbakemelding.
        window.setTimeout(() => {
          lukk();
        }, 900);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Kunne ikke opprette økten.",
        );
      }
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={lukk}
      className="w-full max-w-lg rounded-2xl border border-border bg-card p-0 shadow-xl backdrop:bg-foreground/80"
    >
      {slot && (
        <form onSubmit={lagre} className="flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Ny økt
              </span>
              <h2 className="font-display text-xl font-semibold leading-tight tracking-tight text-foreground">
                <em className="font-normal italic text-primary">
                  {slot.ukedag}
                </em>{" "}
                {slot.datoLabel.replace(slot.ukedag, "").trim()} kl{" "}
                <span className="font-mono tabular-nums">{slot.tidLabel}</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={lukk}
              disabled={pending}
              aria-label="Lukk"
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-4 px-6 py-4">
            {/* Spiller — autocomplete */}
            <div>
              <label
                htmlFor="quick-add-spiller-sok"
                className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
              >
                Spiller
              </label>
              <input
                id="quick-add-spiller-sok"
                type="text"
                value={spillerSok}
                onChange={(e) => {
                  setSpillerSok(e.target.value);
                  setSpillerId("");
                }}
                placeholder="Søk navn eller e-post"
                autoComplete="off"
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
              {matchendeSpillere.length > 0 && !spillerId && (
                <ul className="mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-popover shadow-sm">
                  {matchendeSpillere.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSpillerId(s.id);
                          setSpillerSok(s.name);
                        }}
                        className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-secondary"
                      >
                        <span className="font-medium text-popover-foreground">
                          {s.name}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {s.email}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {spillerId && (
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  Valgt: {spillere.find((p) => p.id === spillerId)?.name}
                </p>
              )}
            </div>

            {/* Tjeneste */}
            <div>
              <label
                htmlFor="quick-add-service"
                className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
              >
                Tjeneste
              </label>
              <select
                id="quick-add-service"
                value={serviceTypeId}
                onChange={(e) => valgtServiceType(e.target.value)}
                className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                {serviceTypes.length === 0 && (
                  <option value="">Ingen tjenester</option>
                )}
                {serviceTypes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.durationMin} min)
                  </option>
                ))}
              </select>
            </div>

            {/* Lokasjon + Varighet på samme rad */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="quick-add-location"
                  className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
                >
                  Lokasjon
                </label>
                <select
                  id="quick-add-location"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                >
                  {locations.length === 0 && (
                    <option value="">Ingen lokasjoner</option>
                  )}
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
              {facilityValg.length > 0 && (
                <div>
                  <label
                    htmlFor="quick-add-facility"
                    className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
                  >
                    Fasilitet (valgfritt)
                  </label>
                  <select
                    id="quick-add-facility"
                    value={facilityId}
                    onChange={(e) => setFacilityId(e.target.value)}
                    className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                  >
                    <option value="">Ingen spesifikk</option>
                    {facilityValg.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label
                  htmlFor="quick-add-varighet"
                  className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
                >
                  Varighet (min)
                </label>
                <input
                  id="quick-add-varighet"
                  type="number"
                  min={15}
                  step={15}
                  value={varighetMin}
                  onChange={(e) => setVarighetMin(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm font-mono tabular-nums outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>

            {/* Notater */}
            <div>
              <label
                htmlFor="quick-add-notater"
                className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground"
              >
                Notater
              </label>
              <textarea
                id="quick-add-notater"
                value={notater}
                onChange={(e) => setNotater(e.target.value)}
                rows={3}
                placeholder="Valgfri intern notis."
                className="w-full resize-y rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>

            {/* Feedback */}
            {error && (
              <div
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </div>
            )}
            {success && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary"
              >
                <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                {success}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-border bg-secondary/40 px-6 py-3">
            <button
              type="button"
              onClick={lukk}
              disabled={pending}
              className="rounded-md border border-input bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-border disabled:opacity-60"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={pending || !!success}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pending && (
                <Loader2
                  className="h-4 w-4 animate-spin"
                  strokeWidth={1.5}
                />
              )}
              {pending ? "Oppretter…" : "Opprett økt"}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
