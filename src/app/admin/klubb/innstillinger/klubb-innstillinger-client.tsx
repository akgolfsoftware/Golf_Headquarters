"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Users,
  UserCog,
  Clock,
  Pencil,
  Plus,
  Power,
  Star,
} from "lucide-react";
import {
  addClub,
  removeClub,
  updateClubSettings,
} from "./actions";

export type ClubFacility = {
  id: string;
  name: string;
  capacity: number;
  active: boolean;
};

export type ClubItem = {
  id: string;
  name: string;
  address: string;
  active: boolean;
  facilities: ClubFacility[];
  spillereCount: number;
  coacherCount: number;
  defaultFacilityId: string | null;
  dagligLederNavn: string;
  dagligLederEmail: string;
  apningstider: {
    hverdag: string;
    helg: string;
  };
};

type Props = {
  klubber: ClubItem[];
};

export function KlubbInnstillingerClient({ klubber }: Props) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [edit, setEdit] = useState<ClubItem | null>(null);

  return (
    <>
      <div className="flex flex-col gap-4">
        {klubber.length === 0 ? (
          <div
            role="status"
            className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 px-8 py-16 text-center"
          >
            <div
              aria-hidden="true"
              className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-secondary text-muted-foreground"
            >
              <Building2 size={24} strokeWidth={1.75} />
            </div>
            <h3 className="font-display text-lg font-semibold leading-tight tracking-tight">
              <em className="font-normal italic text-primary">Ingen klubber</em>{" "}
              <span className="text-foreground">registrert</span>
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Legg til din første klubb for å begynne å håndtere multi-club
              setup. Hver klubb kan ha egne fasiliteter, åpningstider og
              daglig leder.
            </p>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus size={14} strokeWidth={1.75} />
              Legg til klubb
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {klubber.map((k) => (
              <KlubbKort
                key={k.id}
                klubb={k}
                onEdit={() => setEdit(k)}
              />
            ))}
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="group flex min-h-[260px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 p-6 text-muted-foreground transition-colors hover:border-primary hover:bg-card hover:text-primary"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary group-hover:bg-primary/10">
                <Plus size={20} strokeWidth={1.75} />
              </div>
              <span className="font-display text-base font-semibold">
                Legg til klubb
              </span>
              <span className="max-w-[240px] text-center text-xs text-muted-foreground">
                Multi-club lar deg drifte flere anlegg fra samme AgencyOS.
              </span>
            </button>
          </div>
        )}
      </div>

      {addOpen && (
        <KlubbDialog
          mode="add"
          klubb={null}
          onClose={() => {
            setAddOpen(false);
            router.refresh();
          }}
        />
      )}

      {edit && (
        <KlubbDialog
          mode="edit"
          klubb={edit}
          onClose={() => {
            setEdit(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

// ----------------- Kort -----------------

function KlubbKort({
  klubb,
  onEdit,
}: {
  klubb: ClubItem;
  onEdit: () => void;
}) {
  const defaultFacility =
    klubb.facilities.find((f) => f.id === klubb.defaultFacilityId) ??
    klubb.facilities[0] ??
    null;

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
              <Building2 size={18} strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-base font-semibold leading-tight tracking-tight text-foreground">
                {klubb.name}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground">
                <MapPin size={11} strokeWidth={1.75} />
                {klubb.address}
              </p>
            </div>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] ${
            klubb.active
              ? "bg-primary/10 text-primary"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          {klubb.active ? "Aktiv" : "Inaktiv"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-border pt-4">
        <Stat
          icon={Users}
          label="Spillere"
          value={String(klubb.spillereCount)}
        />
        <Stat
          icon={UserCog}
          label="Coacher"
          value={String(klubb.coacherCount)}
        />
        <Stat
          icon={MapPin}
          label="Fasiliteter"
          value={String(klubb.facilities.length)}
        />
        <Stat
          icon={Clock}
          label="Åpningstider"
          value={klubb.apningstider.hverdag}
        />
      </div>

      <div className="rounded-md border border-border bg-background/60 px-4 py-2">
        <div className="flex items-center gap-2">
          <Star size={12} strokeWidth={1.75} className="text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            Default-fasilitet
          </span>
        </div>
        <p className="mt-1 text-[13px] font-medium text-foreground">
          {defaultFacility ? defaultFacility.name : "Ingen fasiliteter ennå"}
        </p>
      </div>

      <div className="rounded-md border border-border bg-background/60 px-4 py-2">
        <div className="flex items-center gap-2">
          <UserCog size={12} strokeWidth={1.75} className="text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            Daglig leder
          </span>
        </div>
        <p className="mt-1 text-[13px] font-medium text-foreground">
          {klubb.dagligLederNavn}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {klubb.dagligLederEmail}
        </p>
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:border-primary hover:text-primary"
        >
          <Pencil size={12} strokeWidth={1.75} />
          Rediger
        </button>
        <a
          href={`/admin/klubb/${klubb.id}/rediger`}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary"
        >
          Detaljer
        </a>
      </div>
    </article>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} strokeWidth={1.75} className="text-muted-foreground" />
      <div className="min-w-0">
        <div className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
          {label}
        </div>
        <div className="truncate font-mono text-[13px] font-semibold tabular-nums text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}

// ----------------- Dialog -----------------

type DialogProps = {
  mode: "add" | "edit";
  klubb: ClubItem | null;
  onClose: () => void;
};

function KlubbDialog({ mode, klubb, onClose }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(klubb?.name ?? "");
  const [address, setAddress] = useState(klubb?.address ?? "");
  const [active, setActive] = useState(klubb?.active ?? true);
  const [defaultFacilityId, setDefaultFacilityId] = useState<string>(
    klubb?.defaultFacilityId ?? klubb?.facilities[0]?.id ?? "",
  );
  const [dagligLederEmail, setDagligLederEmail] = useState(
    klubb?.dagligLederEmail ?? "",
  );
  const [hverdag, setHverdag] = useState(
    klubb?.apningstider.hverdag ?? "08:00 – 21:00",
  );
  const [helg, setHelg] = useState(
    klubb?.apningstider.helg ?? "09:00 – 18:00",
  );

  useEffect(() => {
    const node = dialogRef.current;
    node?.showModal();
    return () => node?.close();
  }, []);

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "add") {
          await addClub({ name, address, active });
        } else if (klubb) {
          await updateClubSettings(klubb.id, {
            name,
            address,
            active,
            defaultFacilityId: defaultFacilityId || null,
            daglig_leder_email: dagligLederEmail,
            apningstider: { hverdag, helg },
          });
        }
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke lagre");
      }
    });
  }

  function deaktiver() {
    if (!klubb) return;
    if (!confirm(`Deaktivere klubben «${klubb.name}»?`)) return;
    startTransition(async () => {
      try {
        await removeClub(klubb.id);
        onClose();
      } catch {
        setError("Kunne ikke deaktivere klubben");
      }
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-0 h-full max-h-full w-full max-w-full rounded-none border-0 bg-card p-0 shadow-xl backdrop:bg-foreground/40 sm:m-auto sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl sm:border sm:border-border"
    >
      <form onSubmit={lagre} className="p-4 sm:p-6">
        <header>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Klubb-innstillinger
          </span>
          <h2 className="mt-1 font-display text-xl font-semibold leading-tight tracking-tight">
            <em className="font-normal text-primary md:italic">
              {mode === "add" ? "Ny klubb" : "Rediger"}
            </em>
            {mode === "edit" && klubb ? ` · ${klubb.name}` : ""}
          </h2>
        </header>

        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Felt label="Klubb-navn">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Gamle Fredrikstad Golfklubb"
                className={inputClass}
                required
              />
            </Felt>
            <Felt label="Status">
              <label className="flex h-[42px] cursor-pointer items-center gap-2 rounded-md border border-input bg-card px-4">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="accent-primary"
                />
                <span className="text-sm">
                  {active ? "Aktiv" : "Inaktiv"}
                </span>
              </label>
            </Felt>
          </div>

          <Felt label="Adresse">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Bossumveien 1, 1632 Gamle Fredrikstad"
              className={inputClass}
              required
            />
          </Felt>

          {mode === "edit" && klubb && (
            <>
              <Felt label="Default-fasilitet (brukes ved hurtigbooking)">
                <select
                  value={defaultFacilityId}
                  onChange={(e) => setDefaultFacilityId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Ingen valgt</option>
                  {klubb.facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} {!f.active && "(inaktiv)"}
                    </option>
                  ))}
                </select>
              </Felt>

              <Felt label="Daglig leder · e-post">
                <input
                  type="email"
                  value={dagligLederEmail}
                  onChange={(e) => setDagligLederEmail(e.target.value)}
                  placeholder="daglig-leder@gfgk.no"
                  className={inputClass}
                />
              </Felt>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Felt label="Åpningstider · hverdag">
                  <input
                    type="text"
                    value={hverdag}
                    onChange={(e) => setHverdag(e.target.value)}
                    placeholder="08:00 – 21:00"
                    className={inputClass}
                  />
                </Felt>
                <Felt label="Åpningstider · helg">
                  <input
                    type="text"
                    value={helg}
                    onChange={(e) => setHelg(e.target.value)}
                    placeholder="09:00 – 18:00"
                    className={inputClass}
                  />
                </Felt>
              </div>
            </>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <footer className="mt-6 flex items-center gap-2">
          {mode === "edit" && klubb && (
            <button
              type="button"
              onClick={deaktiver}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2 text-xs font-medium text-destructive hover:border-destructive/50 disabled:opacity-60"
            >
              <Power size={12} strokeWidth={1.75} />
              Deaktiver
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="ml-auto rounded-md border border-input bg-card px-4 py-2 text-sm font-medium hover:border-border"
          >
            Avbryt
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Lagrer…" : "Lagre"}
          </button>
        </footer>
      </form>
    </dialog>
  );
}

const inputClass =
  "w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30";

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
