/**
 * PILOT - CoachHQ Plan-redigering (drawer åpen)
 * Bygd direkte fra wireframe/design-files-v2/coachhq-A/04-plan-edit.html
 * URL: /plan-edit-demo
 *
 * Viser fase-strip + økt-tabell med drawer åpnet for redigering av fase 3 (Spesifikk).
 */

import { X, Plus, Check } from "lucide-react";

type PyrKey = "fys" | "tek" | "slag" | "spill" | "turn";

const PYR_COLOR: Record<PyrKey, string> = {
  fys: "var(--color-pyr-fys, #005840)",
  tek: "var(--color-pyr-tek, #1A7D56)",
  slag: "var(--color-pyr-slag, #D1F843)",
  spill: "var(--color-pyr-spill, #B8852A)",
  turn: "var(--color-pyr-turn, #5E5C57)",
};

export default function PlanEditDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid grid-cols-[1fr_560px] gap-6">
        {/* Hovedflate */}
        <main>
          <header className="mb-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Treningsplaner · Redigerer · Sommer-toppform · Markus R.
            </span>
            <h1 className="mt-2 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
              <em className="font-medium italic">Rediger</em> · Sommer-toppform
            </h1>
            <p className="mt-2 max-w-[640px] text-[13px] leading-[1.5] text-muted-foreground">
              Klikk en fase for å redigere pyramide-vekting og økt-liste. Endringer lagres
              som utkast inntil du publiserer.
            </p>
          </header>

          {/* Action-strip */}
          <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
            <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Utkast · ulagrede endringer
            </span>
            <ActionItem tone="warn">
              <b>2</b> faser endret
            </ActionItem>
            <ActionItem tone="info">
              <b>4</b> økter flyttet
            </ActionItem>
            <button className="ml-auto inline-flex items-center gap-2 rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
              Forkast endringer
            </button>
            <button className="inline-flex items-center gap-2 rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
              Lagre utkast
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
              Publiser til Markus
            </button>
          </div>

          {/* Phase strip */}
          <div className="mb-6 grid grid-cols-5 gap-2">
            <PhaseStripCard
              num="F1"
              duration="2 u"
              name="Base"
              dates="9.–22. mai"
              pyr={[
                { key: "fys", value: 30 },
                { key: "tek", value: 35 },
                { key: "slag", value: 15 },
                { key: "spill", value: 12 },
                { key: "turn", value: 8 },
              ]}
            />
            <PhaseStripCard
              num="F2"
              duration="1 u"
              name="Forberedelse"
              dates="23.–29. mai"
              pyr={[
                { key: "fys", value: 18 },
                { key: "tek", value: 32 },
                { key: "slag", value: 25 },
                { key: "spill", value: 18 },
                { key: "turn", value: 7 },
              ]}
            />
            <PhaseStripCard
              num="F3 · REDIGERER"
              duration="3 u"
              name="Spesifikk"
              dates="30. mai – 1. jun"
              editing
              pyr={[
                { key: "fys", value: 10 },
                { key: "tek", value: 15 },
                { key: "slag", value: 35 },
                { key: "spill", value: 30 },
                { key: "turn", value: 10 },
              ]}
            />
            <PhaseStripCard
              num="F4"
              duration="3 d"
              name="Taper"
              dates="2.–4. jun"
              pyr={[
                { key: "fys", value: 5 },
                { key: "tek", value: 10 },
                { key: "slag", value: 30 },
                { key: "spill", value: 35 },
                { key: "turn", value: 20 },
              ]}
            />
            <PhaseStripCard
              num="F5"
              duration="3 d"
              name="Peak"
              dates="Sørlandsåpent"
              pyr={[{ key: "turn", value: 100 }]}
            />
          </div>

          {/* Session table */}
          <section className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="grid grid-cols-[100px_1fr_120px_80px_100px] bg-secondary px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              <div>Dato</div>
              <div>Økt</div>
              <div>Pyramide</div>
              <div>Tid</div>
              <div>Status</div>
            </div>

            <SessionTableRow
              date="30.05 fre"
              title="Range · jernspill 100-150 m"
              layer="slag"
              duration="90 m"
              statusLabel="Fullført"
              statusTone="success"
            />
            <SessionTableRow
              date="31.05 lør"
              title="9-hulls scoring"
              layer="spill"
              duration="2 t"
              statusLabel="Fullført"
              statusTone="success"
            />
            <SessionTableRow
              date="01.06 søn"
              title="Putte 6-fot drill"
              layer="slag"
              duration="45 m"
              statusLabel="Fullført"
              statusTone="success"
            />
            <SessionTableRow
              date="03.06 tir"
              title="18-hulls turnerings-sim"
              layer="turn"
              duration="4 t"
              statusLabel="Fullført"
              statusTone="success"
            />
            <SessionTableRow
              date="05.06 tor"
              title="FYS · rotasjon"
              layer="fys"
              duration="60 m"
              statusLabel="Fullført"
              statusTone="success"
            />
            <SessionTableRow
              date="07.06 lør"
              title="Range · driver kontroll"
              layer="slag"
              duration="75 m"
              statusLabel="Fullført"
              statusTone="success"
            />
            <SessionTableRow
              date="09.06 man"
              title="Banespill med coach"
              layer="spill"
              duration="3 t"
              statusLabel="Fullført"
              statusTone="success"
            />
            <SessionTableRow
              date="11.06 ons"
              title="Range · jernspill 100-150 m"
              layer="slag"
              duration="90 m"
              statusLabel="I dag"
              statusTone="lime"
              selected
            />
            <SessionTableRow
              date="13.06 fre"
              title="9-hulls scoring"
              layer="spill"
              duration="2 t"
              statusLabel="Planlagt"
              statusTone="muted"
            />
            <SessionTableRow
              date="15.06 søn"
              title="Turnerings-sim · gult tee"
              layer="turn"
              duration="4 t"
              statusLabel="Planlagt"
              statusTone="muted"
            />
          </section>
        </main>

        {/* Drawer */}
        <aside className="sticky top-0 h-fit rounded-lg border border-border bg-card">
          <header className="border-b border-border px-6 py-4">
            <div className="mb-2 flex items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              <span>Fase 3 · redigerer</span>
              <button
                className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Lukk"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            <h2 className="font-display text-[24px] font-bold leading-tight tracking-tight">
              <em className="font-medium italic">Spesifikk</em> · 3 ukers fase
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
              <span>30. mai – 1. juni</span>
              <span>·</span>
              <span>12 økter</span>
              <span>·</span>
              <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground">
                Pågår · u21
              </span>
            </div>
          </header>

          {/* Drawer tabs */}
          <div className="flex gap-2 border-b border-border px-6">
            {[
              { label: "Pyramide", active: true },
              { label: "Økter", num: 12 },
              { label: "Volum" },
              { label: "Notater" },
            ].map((t) => (
              <button
                key={t.label}
                className={`relative inline-flex items-center gap-2 py-2 text-[12px] font-medium transition-colors ${
                  t.active
                    ? "text-primary after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-accent"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
                {t.num !== undefined && (
                  <span className="font-mono text-[10px] tabular-nums opacity-50">
                    {t.num}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Drawer body */}
          <div className="px-6 py-6">
            {/* Pyramide editor */}
            <section className="mb-6">
              <h4 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Pyramide-vekting for denne fasen
              </h4>
              <div className="flex flex-col gap-4">
                <PyrSliderRow layer="fys" label="FYS" value={10} />
                <PyrSliderRow layer="tek" label="TEK" value={15} />
                <PyrSliderRow layer="slag" label="SLAG" value={35} />
                <PyrSliderRow layer="spill" label="SPILL" value={30} />
                <PyrSliderRow layer="turn" label="TURN" value={10} />
              </div>

              <div className="mt-4 flex items-center justify-between rounded-md bg-secondary px-4 py-2 text-[12px]">
                <span className="text-muted-foreground">Sum</span>
                <span className="inline-flex items-center gap-2 font-mono font-semibold tabular-nums text-[#1A7D56]">
                  100 %
                  <Check className="h-4 w-4" strokeWidth={1.5} />
                </span>
              </div>

              <div
                className="mt-2 flex items-center justify-between rounded-md px-4 py-2 text-[12px]"
                style={{
                  background: "rgba(209,248,67,0.15)",
                  border: "1px solid rgba(209,248,67,0.4)",
                }}
              >
                <span className="text-muted-foreground">Endring vs. forrige versjon</span>
                <span className="font-mono tabular-nums">
                  SLAG <b className="font-semibold text-[#1A7D56]">+10 %</b> · FYS{" "}
                  <b className="font-semibold text-destructive">−8 %</b>
                </span>
              </div>
            </section>

            {/* Sessions list */}
            <section>
              <h4 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Resterende økter i fase 3 · drag for å omrokere
              </h4>

              <DrawerSession
                date="11.06"
                day="ons"
                time="10:00"
                title="Range · jernspill 100-150 m"
                meta="90 min · TrackMan"
                layer="slag"
                layerLabel="SLAG"
              />
              <DrawerSession
                date="13.06"
                day="fre"
                time="14:30"
                title="9-hulls scoringsrunde"
                meta="2 t · Bjaavann"
                layer="spill"
                layerLabel="SPILL"
              />
              <DrawerSession
                date="15.06"
                day="søn"
                time="11:00"
                title="Turnerings-sim · gult tee"
                meta="4 t · 18 hull"
                layer="turn"
                layerLabel="TURN"
              />
              <DrawerSession
                date="17.06"
                day="tir"
                time="09:00"
                title="Range · sand + chip"
                meta="75 min · short-game-bay"
                layer="slag"
                layerLabel="SLAG"
              />
              <DrawerSession
                date="19.06"
                day="tor"
                time="16:00"
                title="Banespill med coach Anders"
                meta="3 t · 9 hull + debrief"
                layer="spill"
                layerLabel="SPILL"
              />

              <button className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-transparent px-4 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                Legg til økt
              </button>
            </section>
          </div>

          {/* Drawer footer */}
          <footer className="flex items-center justify-between gap-2 border-t border-border px-6 py-4">
            <button className="inline-flex items-center gap-2 rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
              Avbryt
            </button>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-2 rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
                Forhåndsvis
              </button>
              <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
                Lagre fase
              </button>
            </div>
          </footer>
        </aside>
      </div>
    </div>
  );
}

function ActionItem({
  tone,
  children,
}: {
  tone?: "info" | "warn" | "success";
  children: React.ReactNode;
}) {
  const bg =
    tone === "info"
      ? "bg-primary/10 text-primary"
      : tone === "warn"
        ? "bg-[#FFF0D6] text-[#B8852A]"
        : tone === "success"
          ? "bg-[#E5F1EA] text-[#1A7D56]"
          : "bg-secondary text-muted-foreground";
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-md px-2 py-2 text-[12px] font-medium transition-opacity hover:opacity-80 ${bg}`}
    >
      {children}
    </button>
  );
}

type PyrEntry = { key: PyrKey; value: number };

function PhaseStripCard({
  num,
  duration,
  name,
  dates,
  editing,
  pyr,
}: {
  num: string;
  duration: string;
  name: string;
  dates: string;
  editing?: boolean;
  pyr: PyrEntry[];
}) {
  return (
    <div
      className={`rounded-lg bg-card p-4 ${
        editing ? "border-2 border-accent shadow-[0_0_0_4px_rgba(209,248,67,0.20)]" : "border border-border"
      }`}
    >
      <div className="flex items-center justify-between font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {editing ? (
          <span className="rounded-sm bg-accent px-2 py-0.5 text-accent-foreground">
            {num}
          </span>
        ) : (
          <span>{num}</span>
        )}
        <span>{duration}</span>
      </div>
      <div className="mt-2 mb-1 text-[14px] font-semibold leading-tight">{name}</div>
      <div className="font-mono text-[11px] text-muted-foreground">{dates}</div>
      <div className="mt-2 flex h-2 gap-0.5 overflow-hidden rounded-sm">
        {pyr.map((p) => (
          <div
            key={p.key}
            style={{ width: `${p.value}%`, background: PYR_COLOR[p.key] }}
          />
        ))}
      </div>
    </div>
  );
}

function SessionTableRow({
  date,
  title,
  layer,
  duration,
  statusLabel,
  statusTone,
  selected,
}: {
  date: string;
  title: string;
  layer: PyrKey;
  duration: string;
  statusLabel: string;
  statusTone: "success" | "lime" | "muted";
  selected?: boolean;
}) {
  const layerLabel = layer.toUpperCase();
  const pillStyles =
    statusTone === "success"
      ? "bg-[#E5F1EA] text-[#1A7D56]"
      : statusTone === "lime"
        ? "bg-accent text-accent-foreground"
        : "bg-secondary text-muted-foreground";
  return (
    <div
      className={`grid grid-cols-[100px_1fr_120px_80px_100px] items-center border-t border-border px-4 py-2 text-[12px] font-medium ${
        selected ? "bg-[rgba(209,248,67,0.18)]" : ""
      }`}
    >
      <div className="font-mono tabular-nums">{date}</div>
      <div className="font-semibold">{title}</div>
      <div className="inline-flex items-center gap-2">
        <i
          className="inline-block h-2 w-2 rounded-sm"
          style={{ background: PYR_COLOR[layer] }}
        />
        {layerLabel}
      </div>
      <div>{duration}</div>
      <div>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${pillStyles}`}
        >
          {statusLabel}
        </span>
      </div>
    </div>
  );
}

function PyrSliderRow({
  layer,
  label,
  value,
}: {
  layer: PyrKey;
  label: string;
  value: number;
}) {
  return (
    <div className="grid grid-cols-[80px_1fr_50px] items-center gap-4">
      <div className="inline-flex items-center gap-2 text-[12px] font-semibold">
        <i
          className="h-2 w-2 rounded-sm"
          style={{ background: PYR_COLOR[layer] }}
        />
        {label}
      </div>
      <div className="relative h-2 rounded-sm bg-secondary">
        <div
          className="absolute left-0 top-0 h-full rounded-sm"
          style={{ width: `${value}%`, background: PYR_COLOR[layer] }}
        />
        <div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-card shadow-sm"
          style={{ left: `${value}%`, borderColor: PYR_COLOR[layer] }}
        />
      </div>
      <div className="text-right font-mono text-[14px] font-semibold tabular-nums">
        {value} %
      </div>
    </div>
  );
}

function DrawerSession({
  date,
  day,
  time,
  title,
  meta,
  layer,
  layerLabel,
}: {
  date: string;
  day: string;
  time: string;
  title: string;
  meta: string;
  layer: PyrKey;
  layerLabel: string;
}) {
  const pillBg =
    layer === "slag"
      ? "bg-[rgba(209,248,67,0.30)] text-accent-foreground"
      : layer === "spill"
        ? "bg-[rgba(184,133,42,0.20)] text-[#B8852A]"
        : layer === "turn"
          ? "bg-[rgba(94,92,87,0.20)] text-[#5E5C57]"
          : layer === "fys"
            ? "bg-[rgba(0,88,64,0.10)] text-primary"
            : "bg-[rgba(26,125,86,0.15)] text-[#1A7D56]";
  return (
    <div className="mb-2 grid grid-cols-[56px_1fr_auto] items-center gap-2 rounded-md border border-border bg-background px-2 py-2 transition-colors hover:bg-secondary">
      <div className="font-mono text-[11px] font-semibold leading-tight tabular-nums">
        {date}
        <span className="mt-1 block font-sans text-[10px] font-normal text-muted-foreground">
          {day} {time}
        </span>
      </div>
      <div>
        <div className="text-[12px] font-semibold leading-tight">{title}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">{meta}</div>
      </div>
      <span
        className={`inline-flex items-center rounded-full px-2 py-1 font-mono text-[10px] font-semibold ${pillBg}`}
      >
        {layerLabel}
      </span>
    </div>
  );
}
