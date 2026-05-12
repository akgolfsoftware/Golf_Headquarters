"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { opprettOktPaaTid } from "../../calendar/actions";

type Spiller = { id: string; name: string; email: string };
type Service = {
  id: string;
  name: string;
  durationMin: number;
  priceOre: number;
};
type Lokasjon = { id: string; name: string };

type Props = {
  spillere: Spiller[];
  services: Service[];
  lokasjoner: Lokasjon[];
};

export function NyBookingForm({ spillere, services, lokasjoner }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [spillerId, setSpillerId] = useState<string>(spillere[0]?.id ?? "");
  const [serviceTypeId, setServiceTypeId] = useState<string>(
    services[0]?.id ?? "",
  );
  const [locationId, setLocationId] = useState<string>(
    lokasjoner[0]?.id ?? "",
  );
  const [startAt, setStartAt] = useState<string>(defaultStartAt());
  const [varighet, setVarighet] = useState<string>(
    services[0]?.durationMin ? String(services[0].durationMin) : "60",
  );
  const [notater, setNotater] = useState<string>("");

  const valgtService = useMemo(
    () => services.find((s) => s.id === serviceTypeId),
    [services, serviceTypeId],
  );

  // Når tjeneste byttes — oppdater varighet til default fra tjeneste
  function byttService(id: string) {
    setServiceTypeId(id);
    const s = services.find((x) => x.id === id);
    if (s) setVarighet(String(s.durationMin));
  }

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!spillerId) return setError("Velg en spiller.");
    if (!serviceTypeId) return setError("Velg en tjeneste.");
    if (!locationId) return setError("Velg en lokasjon.");
    if (!startAt) return setError("Velg dato og tid.");
    const varighetNum = Number(varighet);
    if (!varighetNum || varighetNum <= 0) {
      return setError("Varighet må være større enn 0.");
    }

    startTransition(async () => {
      try {
        await opprettOktPaaTid({
          spillerId,
          serviceTypeId,
          locationId,
          startAt: new Date(startAt),
          varighetMin: varighetNum,
          notater: notater.trim() || undefined,
        });
        router.push("/admin/bookings");
        router.refresh();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Kunne ikke opprette";
        setError(msg);
      }
    });
  }

  if (spillere.length === 0 || services.length === 0 || lokasjoner.length === 0) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        Mangler{" "}
        {[
          spillere.length === 0 && "spillere",
          services.length === 0 && "aktive tjenester",
          lokasjoner.length === 0 && "aktive lokasjoner",
        ]
          .filter(Boolean)
          .join(", ")}
        . Opprett disse først før du kan booke en ny økt.
      </div>
    );
  }

  return (
    <form onSubmit={lagre} className="space-y-4">
      <Felt label="Spiller">
        <select
          value={spillerId}
          onChange={(e) => setSpillerId(e.target.value)}
          className={inputCls}
        >
          {spillere.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.email})
            </option>
          ))}
        </select>
      </Felt>

      <Felt label="Tjeneste">
        <select
          value={serviceTypeId}
          onChange={(e) => byttService(e.target.value)}
          className={inputCls}
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.durationMin} min · {(s.priceOre / 100).toFixed(0)} kr
            </option>
          ))}
        </select>
      </Felt>

      <Felt label="Lokasjon">
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className={inputCls}
        >
          {lokasjoner.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </Felt>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Felt label="Dato og tid">
          <input
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className={inputCls}
          />
        </Felt>
        <Felt
          label={`Varighet (min)${
            valgtService ? ` · default ${valgtService.durationMin}` : ""
          }`}
        >
          <input
            type="number"
            min={1}
            step={5}
            value={varighet}
            onChange={(e) => setVarighet(e.target.value)}
            className={inputCls}
          />
        </Felt>
      </div>

      <Felt label="Notater (valgfritt)">
        <textarea
          value={notater}
          onChange={(e) => setNotater(e.target.value)}
          rows={4}
          placeholder="Korte notater, fokusområde, e.l."
          className={`${inputCls} resize-y`}
        />
      </Felt>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Link
          href="/admin/bookings"
          className="rounded-md border border-input bg-card px-4 py-2 text-sm font-medium hover:border-border"
        >
          Avbryt
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Oppretter…" : "Opprett"}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

function Felt({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function defaultStartAt(): string {
  // Default = neste hele time fra nå, formatert for datetime-local input.
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}
