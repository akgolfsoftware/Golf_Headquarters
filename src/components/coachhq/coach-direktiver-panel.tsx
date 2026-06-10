"use client";

/**
 * CoachDirektiverPanel — AgencyOS-komponent for å vise og administrere
 * coach-drill-direktiver (PIN / BLOCK / PRIORITER) per spiller.
 *
 * Henter alle direktiver fra server som prop og håndterer legg-til / slett
 * via server actions.
 *
 * Brukes i /admin/spillere/[id] under "Presisjonstreningsplan"-seksjonen.
 */

import { useState, useTransition } from "react";
import {
  Ban,
  ChevronDown,
  Pin,
  Plus,
  Shield,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import {
  lagreCoachDirektiv,
  slettCoachDirektiv,
} from "@/app/admin/spillere/[id]/actions";

// ─── Typer ───────────────────────────────────────────────────────────────────

type DirektivType = "PIN" | "BLOCK" | "PRIORITER";

export type DrillOption = {
  id: string;
  name: string;
};

export type DirektivItem = {
  id: string;
  drillId: string;
  drillNavn: string;
  type: DirektivType;
  kommentar: string | null;
  gyldigTil: string | null; // ISO-dato eller null
};

export type CoachDirektiverPanelProps = {
  spillerId: string;
  direktiver: DirektivItem[];
  alleDrills: DrillOption[];
};

// ─── Styling per type ─────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  DirektivType,
  { label: string; icon: typeof Pin; badge: string; iconColor: string }
> = {
  PIN: {
    label: "PIN",
    icon: Pin,
    badge: "bg-primary/15 text-primary",
    iconColor: "text-primary",
  },
  BLOCK: {
    label: "BLOCK",
    icon: Ban,
    badge: "bg-destructive/15 text-destructive",
    iconColor: "text-destructive",
  },
  PRIORITER: {
    label: "PRIORITER",
    icon: Zap,
    badge: "bg-accent/40 text-accent-foreground",
    iconColor: "text-accent-foreground",
  },
};

// ─── DirektivRad ─────────────────────────────────────────────────────────────

function DirektivRad({
  spillerId,
  direktiv,
  onSlettet,
}: {
  spillerId: string;
  direktiv: DirektivItem;
  onSlettet: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [feil, setFeil] = useState<string | null>(null);
  const cfg = TYPE_CONFIG[direktiv.type];
  const Icon = cfg.icon;

  function slett() {
    setFeil(null);
    startTransition(async () => {
      const res = await slettCoachDirektiv(spillerId, direktiv.id);
      if (res.ok) {
        onSlettet(direktiv.id);
      } else {
        setFeil(res.error);
      }
    });
  }

  return (
    <li className="rounded-lg border border-border bg-secondary/40 p-4">
      <div className="flex items-start gap-2">
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${cfg.badge}`}
        >
          <Icon size={9} strokeWidth={2} className={cfg.iconColor} />
          {cfg.label}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium text-foreground">
            {direktiv.drillNavn}
          </div>
          {direktiv.kommentar && (
            <p className="mt-1 text-[12px] leading-[1.5] text-muted-foreground">
              {direktiv.kommentar}
            </p>
          )}
          {direktiv.gyldigTil && (
            <div className="mt-1 font-mono text-[10px] text-muted-foreground">
              Gyldig til{" "}
              {new Intl.DateTimeFormat("nb-NO", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(new Date(direktiv.gyldigTil))}
            </div>
          )}
          {feil && (
            <div className="mt-1 text-[11px] text-destructive">{feil}</div>
          )}
        </div>
        <button
          type="button"
          onClick={slett}
          disabled={isPending}
          aria-label="Slett direktiv"
          className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
        >
          <Trash2 size={13} strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </li>
  );
}

// ─── LeggTilForm ─────────────────────────────────────────────────────────────

function LeggTilForm({
  spillerId,
  alleDrills,
  onLagtTil,
}: {
  spillerId: string;
  alleDrills: DrillOption[];
  onLagtTil: (item: DirektivItem) => void;
}) {
  const [soketekst, setSoketekst] = useState("");
  const [valgtDrill, setValgtDrill] = useState<DrillOption | null>(null);
  const [visDropdown, setVisDropdown] = useState(false);
  const [type, setType] = useState<DirektivType>("PIN");
  const [kommentar, setKommentar] = useState("");
  const [gyldigTil, setGyldigTil] = useState("");

  const [feil, setFeil] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtrerteDrills = alleDrills.filter((d) =>
    soketekst
      ? d.name.toLowerCase().includes(soketekst.toLowerCase())
      : true,
  );

  function velgDrill(drill: DrillOption) {
    setValgtDrill(drill);
    setSoketekst(drill.name);
    setVisDropdown(false);
  }

  function leggTil() {
    if (!valgtDrill) {
      setFeil("Velg en drill.");
      return;
    }
    setFeil(null);
    startTransition(async () => {
      const res = await lagreCoachDirektiv(spillerId, {
        drillId: valgtDrill.id,
        type,
        kommentar: kommentar.trim() || undefined,
        gyldigTil: gyldigTil || null,
      });
      if (res.ok) {
        onLagtTil({
          id: res.id,
          drillId: valgtDrill.id,
          drillNavn: valgtDrill.name,
          type,
          kommentar: kommentar.trim() || null,
          gyldigTil: gyldigTil || null,
        });
        setValgtDrill(null);
        setSoketekst("");
        setKommentar("");
        setGyldigTil("");
        setType("PIN");
      } else {
        setFeil(res.error);
      }
    });
  }

  return (
    <div className="rounded-lg border border-dashed border-border p-4">
      <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        Legg til direktiv
      </div>

      <div className="space-y-2">
        {/* Drill-søk */}
        <div className="relative">
          <input
            type="text"
            placeholder="Søk på drill-navn..."
            aria-label="Søk på drill-navn"
            value={soketekst}
            onChange={(e) => {
              setSoketekst(e.target.value);
              setValgtDrill(null);
              setVisDropdown(true);
            }}
            onFocus={() => setVisDropdown(true)}
            className="w-full rounded-md border border-input bg-background px-4 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
          />
          {valgtDrill && (
            <button
              type="button"
              onClick={() => {
                setValgtDrill(null);
                setSoketekst("");
              }}
              aria-label="Fjern valgt drill"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={12} strokeWidth={2} aria-hidden />
            </button>
          )}
          {visDropdown && soketekst && !valgtDrill && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-card shadow-md">
              <ul className="max-h-48 overflow-y-auto py-1">
                {filtrerteDrills.slice(0, 20).map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => velgDrill(d)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-[12px] text-foreground hover:bg-secondary"
                    >
                      {d.name}
                    </button>
                  </li>
                ))}
                {filtrerteDrills.length === 0 && (
                  <li className="px-4 py-2 text-[12px] text-muted-foreground">
                    Ingen treff
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Type-velger */}
        <div className="relative">
          <label htmlFor="direktiv-type" className="sr-only">
            Direktiv-type
          </label>
          <select
            id="direktiv-type"
            value={type}
            onChange={(e) => setType(e.target.value as DirektivType)}
            className="w-full appearance-none rounded-md border border-input bg-background px-4 py-2 pr-8 text-[13px] text-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
          >
            <option value="PIN">PIN — Alltid inkluder</option>
            <option value="BLOCK">BLOCK — Ikke foreslå</option>
            <option value="PRIORITER">PRIORITER — Boost prioritet</option>
          </select>
          <ChevronDown
            size={14}
            strokeWidth={1.75}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
        </div>

        {/* Kommentar (valgfri) */}
        <input
          type="text"
          placeholder="Kommentar (valgfri)"
          aria-label="Kommentar"
          value={kommentar}
          onChange={(e) => setKommentar(e.target.value)}
          maxLength={500}
          className="w-full rounded-md border border-input bg-background px-4 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
        />

        {/* Gyldig til (valgfri) */}
        <div>
          <label
            htmlFor="direktiv-gyldig-til"
            className="mb-1 block font-mono text-[10px] text-muted-foreground"
          >
            Gyldig til (valgfri)
          </label>
          <input
            id="direktiv-gyldig-til"
            type="date"
            value={gyldigTil}
            onChange={(e) => setGyldigTil(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-4 py-2 text-[13px] text-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring"
          />
        </div>

        {feil && (
          <div className="text-[12px] text-destructive">{feil}</div>
        )}

        <button
          type="button"
          onClick={leggTil}
          disabled={isPending || !valgtDrill}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 font-mono text-[12px] font-semibold uppercase tracking-[0.06em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {isPending ? (
            "Lagrer..."
          ) : (
            <>
              <Plus size={12} strokeWidth={2} />
              Legg til
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Hoved-komponent ─────────────────────────────────────────────────────────

export function CoachDirektiverPanel({
  spillerId,
  direktiver: initialDirektiver,
  alleDrills,
}: CoachDirektiverPanelProps) {
  const [direktiver, setDirektiver] =
    useState<DirektivItem[]>(initialDirektiver);
  const [visForm, setVisForm] = useState(false);

  function handleSlettet(id: string) {
    setDirektiver((prev) => prev.filter((d) => d.id !== id));
  }

  function handleLagtTil(item: DirektivItem) {
    setDirektiver((prev) => {
      // Unngå duplikat (upsert-semantikk: same drillId+type = erstatt)
      const finnes = prev.findIndex(
        (d) => d.drillId === item.drillId && d.type === item.type,
      );
      if (finnes >= 0) {
        const kopi = [...prev];
        kopi[finnes] = item;
        return kopi;
      }
      return [item, ...prev];
    });
    setVisForm(false);
  }

  const pinDirektiver = direktiver.filter((d) => d.type === "PIN");
  const blockDirektiver = direktiver.filter((d) => d.type === "BLOCK");
  const prioriterDirektiver = direktiver.filter((d) => d.type === "PRIORITER");

  return (
    <section
      aria-label="Coach-drill-direktiver"
      className="rounded-lg border border-border bg-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <Shield size={16} strokeWidth={1.75} className="text-primary" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            Coach-direktiver
          </span>
          {direktiver.length > 0 && (
            <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] text-foreground">
              {direktiver.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setVisForm((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-foreground transition-colors hover:border-primary hover:bg-secondary"
        >
          {visForm ? (
            <>
              <X size={12} strokeWidth={2} />
              Avbryt
            </>
          ) : (
            <>
              <Plus size={12} strokeWidth={2} />
              Nytt direktiv
            </>
          )}
        </button>
      </div>

      <div className="space-y-4 p-6">
        {/* Legg til form */}
        {visForm && (
          <LeggTilForm
            spillerId={spillerId}
            alleDrills={alleDrills}
            onLagtTil={handleLagtTil}
          />
        )}

        {/* Tom tilstand */}
        {direktiver.length === 0 && !visForm && (
          <div className="rounded-md border border-dashed border-border bg-muted/40 p-6 text-center text-[13px] text-muted-foreground">
            Ingen direktiver registrert. Bruk &laquo;Nytt direktiv&raquo; for
            å PIN, BLOCK eller PRIORITER drills for denne spilleren.
          </div>
        )}

        {/* PIN */}
        {pinDirektiver.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-primary">
              <Pin size={10} strokeWidth={2} />
              Pinned · {pinDirektiver.length}
            </div>
            <ul className="space-y-2">
              {pinDirektiver.map((d) => (
                <DirektivRad
                  key={d.id}
                  spillerId={spillerId}
                  direktiv={d}
                  onSlettet={handleSlettet}
                />
              ))}
            </ul>
          </div>
        )}

        {/* PRIORITER */}
        {prioriterDirektiver.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent-foreground">
              <Zap size={10} strokeWidth={2} />
              Prioritert · {prioriterDirektiver.length}
            </div>
            <ul className="space-y-2">
              {prioriterDirektiver.map((d) => (
                <DirektivRad
                  key={d.id}
                  spillerId={spillerId}
                  direktiv={d}
                  onSlettet={handleSlettet}
                />
              ))}
            </ul>
          </div>
        )}

        {/* BLOCK */}
        {blockDirektiver.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-destructive">
              <Ban size={10} strokeWidth={2} />
              Blokkert · {blockDirektiver.length}
            </div>
            <ul className="space-y-2">
              {blockDirektiver.map((d) => (
                <DirektivRad
                  key={d.id}
                  spillerId={spillerId}
                  direktiv={d}
                  onSlettet={handleSlettet}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
