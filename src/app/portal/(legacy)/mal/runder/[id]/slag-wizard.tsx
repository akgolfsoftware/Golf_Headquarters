"use client";

import { useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Check, Plus, Trash2 } from "lucide-react";
import { saveShot, deleteShot } from "./actions";
import type { ShotInput } from "./actions";

type SlagData = {
  id?: string;
  holeNumber: number;
  holePar: number;
  shotNumber: number;
  club: string | null;
  lie: string;
  distanceToPin: number | null;
  distanceHit: number | null;
  windDir: string | null;
  shotType: string;
  isPenalty: boolean;
  notes: string | null;
};

const KØLLELISTE = [
  "Driver", "3-wood", "5-wood", "4-jern", "5-jern", "6-jern", "7-jern",
  "8-jern", "9-jern", "PW", "GW 50°", "SW 54°", "LW 58°", "Putter",
];

const LIE_ALTERNATIV: { verdi: string; label: string }[] = [
  { verdi: "TEE", label: "Tee" },
  { verdi: "FAIRWAY", label: "Fairway" },
  { verdi: "SEMI_ROUGH", label: "Semi-rough" },
  { verdi: "ROUGH", label: "Rough" },
  { verdi: "DEEP_ROUGH", label: "Dypt rough" },
  { verdi: "BUNKER", label: "Bunker" },
  { verdi: "GREEN", label: "Green" },
  { verdi: "WATER", label: "Vann" },
  { verdi: "OOB", label: "OOB" },
  { verdi: "TREES", label: "Trær" },
];

const TYPE_ALTERNATIV: { verdi: string; label: string }[] = [
  { verdi: "DRIVE", label: "Drive" },
  { verdi: "APPROACH", label: "Tilnærming" },
  { verdi: "CHIP", label: "Chip" },
  { verdi: "PITCH", label: "Pitch" },
  { verdi: "PUTT", label: "Putt" },
  { verdi: "BUNKER", label: "Bunkersslag" },
  { verdi: "RECOVERY", label: "Redningsslag" },
  { verdi: "DROP", label: "Drop" },
];

const VIND_ALTERNATIV: { verdi: string; label: string }[] = [
  { verdi: "STILLE", label: "Stille" },
  { verdi: "MEDVIND", label: "Medvind" },
  { verdi: "MOTVIND", label: "Motvind" },
  { verdi: "VENSTRE", label: "Fra venstre" },
  { verdi: "HOYRE", label: "Fra høyre" },
];

function defaultSlag(holeNumber: number, holePar: number, shotNumber: number): SlagData {
  const lie = shotNumber === 1 ? "TEE" : "FAIRWAY";
  const shotType = shotNumber === 1 && holePar >= 4 ? "DRIVE" : shotNumber === 1 ? "APPROACH" : "APPROACH";
  return {
    holeNumber,
    holePar,
    shotNumber,
    club: null,
    lie,
    distanceToPin: null,
    distanceHit: null,
    windDir: null,
    shotType,
    isPenalty: false,
    notes: null,
  };
}

export function SlagWizard({
  roundId,
  eksisterendeSlag,
}: {
  roundId: string;
  eksisterendeSlag: SlagData[];
}) {
  const [aktivtHull, setAktivtHull] = useState(1);
  const [alleSlag, setAlleSlag] = useState<SlagData[]>(eksisterendeSlag);
  const [redigert, setRedigert] = useState<SlagData | null>(null);
  const [holePar, setHolePar] = useState<number>(4);
  const [parValgt, setParValgt] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feilmelding, setFeilmelding] = useState<string | null>(null);
  const [lagret, setLagret] = useState(false);

  const hullSlag = alleSlag
    .filter((s) => s.holeNumber === aktivtHull)
    .sort((a, b) => a.shotNumber - b.shotNumber);

  const eksisterendePar = hullSlag[0]?.holePar;
  const effektivPar = eksisterendePar ?? holePar;

  function byttHull(nr: number) {
    setAktivtHull(nr);
    setParValgt(false);
    setRedigert(null);
    setFeilmelding(null);
    setLagret(false);
  }

  function startNyttSlag() {
    const nesteNr = hullSlag.length + 1;
    setRedigert(defaultSlag(aktivtHull, effektivPar, nesteNr));
    setFeilmelding(null);
    setLagret(false);
  }

  function redigerSlag(slag: SlagData) {
    setRedigert({ ...slag });
    setFeilmelding(null);
    setLagret(false);
  }

  function oppdaterFelt<K extends keyof SlagData>(felt: K, verdi: SlagData[K]) {
    setRedigert((prev) => (prev ? { ...prev, [felt]: verdi } : prev));
  }

  function lagreSlag() {
    if (!redigert) return;
    if (!redigert.lie) { setFeilmelding("Velg lie."); return; }
    if (!redigert.shotType) { setFeilmelding("Velg slagtype."); return; }

    setFeilmelding(null);
    startTransition(async () => {
      try {
        const input: ShotInput = {
          holeNumber: redigert.holeNumber,
          holePar: redigert.holePar,
          shotNumber: redigert.shotNumber,
          club: redigert.club ?? undefined,
          lie: redigert.lie as ShotInput["lie"],
          distanceToPin: redigert.distanceToPin ?? undefined,
          distanceHit: redigert.distanceHit ?? undefined,
          windDir: redigert.windDir as ShotInput["windDir"] ?? undefined,
          shotType: redigert.shotType as ShotInput["shotType"],
          isPenalty: redigert.isPenalty,
          notes: redigert.notes ?? undefined,
        };
        await saveShot(roundId, input);
        setAlleSlag((prev) => {
          const uten = prev.filter(
            (s) => !(s.holeNumber === redigert.holeNumber && s.shotNumber === redigert.shotNumber)
          );
          return [...uten, redigert].sort((a, b) =>
            a.holeNumber !== b.holeNumber ? a.holeNumber - b.holeNumber : a.shotNumber - b.shotNumber
          );
        });
        setRedigert(null);
        setLagret(true);
      } catch {
        setFeilmelding("Noe gikk galt. Prøv igjen.");
      }
    });
  }

  function slettSlag(slag: SlagData) {
    if (!slag.id) return;
    startTransition(async () => {
      try {
        await deleteShot(roundId, slag.id!);
        setAlleSlag((prev) =>
          prev.filter((s) => !(s.holeNumber === slag.holeNumber && s.shotNumber === slag.shotNumber))
        );
        setRedigert(null);
      } catch {
        setFeilmelding("Kunne ikke slette slag.");
      }
    });
  }

  const hullFerdig = (nr: number) => alleSlag.some((s) => s.holeNumber === nr);

  return (
    <div className="space-y-6">
      {/* Hull-navigator */}
      <div className="overflow-x-auto">
        <div className="flex min-w-max gap-1.5 pb-1">
          {Array.from({ length: 18 }, (_, i) => i + 1).map((nr) => {
            const aktiv = nr === aktivtHull;
            const ferdig = hullFerdig(nr);
            return (
              <button
                key={nr}
                type="button"
                onClick={() => byttHull(nr)}
                className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-semibold transition-colors ${
                  aktiv
                    ? "border-primary bg-primary text-primary-foreground"
                    : ferdig
                    ? "border-primary/40 bg-primary/8 text-primary"
                    : "border-border bg-card text-foreground hover:border-primary/60"
                }`}
              >
                {nr}
                {ferdig && !aktiv && (
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hull-innhold */}
      <div className="rounded-xl border border-border bg-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Hull {aktivtHull} av 18
            </div>
            <div className="mt-0.5 font-display text-lg font-semibold text-foreground">
              {hullSlag.length > 0 ? `Par ${effektivPar} · ${hullSlag.length} slag registrert` : "Ingen slag ennå"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => aktivtHull > 1 && byttHull(aktivtHull - 1)}
              disabled={aktivtHull === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => aktivtHull < 18 && byttHull(aktivtHull + 1)}
              disabled={aktivtHull === 18}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Par-velger (vises kun hvis hull ikke har slag ennå) */}
          {hullSlag.length === 0 && !parValgt && (
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground mb-2">
                Par på hull {aktivtHull}
              </div>
              <div className="flex gap-2">
                {[3, 4, 5].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => { setHolePar(p); setParValgt(true); startNyttSlag(); }}
                    className={`flex h-12 w-20 items-center justify-center rounded-xl border font-mono text-xl font-semibold transition-colors ${
                      holePar === p
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary text-foreground hover:border-primary"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Eksisterende slag */}
          {hullSlag.length > 0 && (
            <div className="space-y-2">
              {hullSlag.map((s) => (
                <div
                  key={s.shotNumber}
                  onClick={() => redigerSlag(s)}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-2 transition-colors hover:border-primary ${
                    redigert?.shotNumber === s.shotNumber ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary font-mono text-xs font-bold text-foreground">
                      {s.shotNumber}
                    </span>
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {TYPE_ALTERNATIV.find((t) => t.verdi === s.shotType)?.label ?? s.shotType}
                      </span>
                      {s.club && (
                        <span className="ml-2 font-mono text-[11px] text-muted-foreground">{s.club}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                    <span>{LIE_ALTERNATIV.find((l) => l.verdi === s.lie)?.label ?? s.lie}</span>
                    {s.distanceToPin != null && <span>{s.distanceToPin} m til pin</span>}
                    {s.isPenalty && <span className="text-destructive">+1 straff</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Slagskjema */}
          {redigert && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-6">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
                Slag {redigert.shotNumber}
              </div>

              {/* Slagtype */}
              <FieldGroup label="Type slag">
                <ChipGroup
                  alternativ={TYPE_ALTERNATIV}
                  valgt={redigert.shotType}
                  onValg={(v) => oppdaterFelt("shotType", v)}
                />
              </FieldGroup>

              {/* Kølle */}
              <FieldGroup label="Kølle">
                <div className="flex flex-wrap gap-1.5">
                  {KØLLELISTE.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => oppdaterFelt("club", redigert.club === k ? null : k)}
                      className={`rounded-full px-4 py-1 font-mono text-[11px] font-medium transition-colors ${
                        redigert.club === k
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-card text-foreground hover:border-primary"
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </FieldGroup>

              {/* Lie */}
              <FieldGroup label="Lie">
                <ChipGroup
                  alternativ={LIE_ALTERNATIV}
                  valgt={redigert.lie}
                  onValg={(v) => oppdaterFelt("lie", v)}
                />
              </FieldGroup>

              {/* Avstand til pin + avstand slått */}
              <div className="grid grid-cols-2 gap-4">
                <FieldGroup label="Avstand til pin (m)">
                  <input
                    type="number"
                    min={0}
                    max={600}
                    value={redigert.distanceToPin ?? ""}
                    onChange={(e) => oppdaterFelt("distanceToPin", e.target.value ? Number(e.target.value) : null)}
                    placeholder="142"
                    className="w-full rounded-lg border border-border bg-card px-4 py-2 font-mono text-sm tabular-nums text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-primary"
                  />
                </FieldGroup>
                <FieldGroup label="Avstand slått (m)">
                  <input
                    type="number"
                    min={0}
                    max={400}
                    value={redigert.distanceHit ?? ""}
                    onChange={(e) => oppdaterFelt("distanceHit", e.target.value ? Number(e.target.value) : null)}
                    placeholder="138"
                    className="w-full rounded-lg border border-border bg-card px-4 py-2 font-mono text-sm tabular-nums text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-primary"
                  />
                </FieldGroup>
              </div>

              {/* Vindretning */}
              <FieldGroup label="Vindretning">
                <ChipGroup
                  alternativ={[{ verdi: "", label: "—" }, ...VIND_ALTERNATIV]}
                  valgt={redigert.windDir ?? ""}
                  onValg={(v) => oppdaterFelt("windDir", v || null)}
                />
              </FieldGroup>

              {/* Straff */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => oppdaterFelt("isPenalty", !redigert.isPenalty)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                    redigert.isPenalty
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-border bg-card text-muted-foreground hover:border-primary"
                  }`}
                >
                  {redigert.isPenalty ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </button>
                <span className="text-sm text-muted-foreground">Straffslag (+1)</span>
              </div>

              {/* Notat */}
              <FieldGroup label="Notat (valgfritt)">
                <input
                  type="text"
                  value={redigert.notes ?? ""}
                  onChange={(e) => oppdaterFelt("notes", e.target.value || null)}
                  placeholder="Eks. dårlig kontakt, god read..."
                  className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-primary"
                />
              </FieldGroup>

              {feilmelding && (
                <p className="font-mono text-[11px] text-destructive">{feilmelding}</p>
              )}

              {/* Handlingsrad */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  {redigert.id && (
                    <button
                      type="button"
                      onClick={() => slettSlag(redigert)}
                      disabled={isPending}
                      className="flex h-9 items-center gap-1.5 rounded-lg border border-border px-4 text-sm text-destructive hover:border-destructive disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Slett
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { setRedigert(null); setFeilmelding(null); }}
                    className="h-9 rounded-lg border border-border px-4 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Avbryt
                  </button>
                </div>
                <button
                  type="button"
                  onClick={lagreSlag}
                  disabled={isPending}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
                >
                  {isPending ? "Lagrer…" : "Lagre slag"}
                </button>
              </div>
            </div>
          )}

          {lagret && !redigert && (
            <p className="font-mono text-[11px] text-primary">Slag lagret.</p>
          )}

          {/* Legg til / neste hull */}
          {!redigert && (hullSlag.length > 0 || parValgt) && (
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={startNyttSlag}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium text-foreground hover:border-primary"
              >
                <Plus className="h-4 w-4" />
                Legg til slag {hullSlag.length + 1}
              </button>
              {aktivtHull < 18 && (
                <button
                  type="button"
                  onClick={() => byttHull(aktivtHull + 1)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Hull {aktivtHull + 1} →
                </button>
              )}
              {aktivtHull === 18 && (
                <span className="font-mono text-[11px] text-primary">
                  Alle 18 hull — runde komplett!
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function ChipGroup({
  alternativ,
  valgt,
  onValg,
}: {
  alternativ: { verdi: string; label: string }[];
  valgt: string;
  onValg: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {alternativ.map((a) => (
        <button
          key={a.verdi}
          type="button"
          onClick={() => onValg(a.verdi)}
          className={`rounded-full px-4 py-1 font-mono text-[11px] font-medium transition-colors ${
            valgt === a.verdi
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-foreground hover:border-primary"
          }`}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
