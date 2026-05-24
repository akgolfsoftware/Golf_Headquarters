/**
 * PILOT — PlayerHQ Ny-økt-wizard (6 steg)
 * Dynamic route: /demos/ny-okt/[1..6] (under (internal) → ADMIN-only)
 * Bygd direkte fra wireframe/design-files-v2/playerhq-C/{01-06}-ny-okt-steg-*.html
 *
 * Mock-data for Markus R. Pedersen som lager en egen TEK-økt på Mulligan Studio 2.
 * Bytt til Prisma-henting senere.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Check,
  Clock,
  GripVertical,
  Home,
  Play,
  Plus,
  Shield,
  Sparkles,
  Target,
  Triangle,
  TriangleAlert,
  X,
} from "lucide-react";

type StegId = "1" | "2" | "3" | "4" | "5" | "6";

const VALID_STEG: readonly StegId[] = ["1", "2", "3", "4", "5", "6"] as const;

type StegMeta = {
  num: StegId;
  label: string;
};

const STEPS: readonly StegMeta[] = [
  { num: "1", label: "Hva skal du trene?" },
  { num: "2", label: "Lengde og intensitet" },
  { num: "3", label: "Velg fasilitet" },
  { num: "4", label: "Når passer det?" },
  { num: "5", label: "Øvelser" },
  { num: "6", label: "Bekreft og start" },
];

export default async function NyOktStegPage({
  params,
}: {
  params: Promise<{ steg: string }>;
}) {
  const { steg } = await params;
  if (!VALID_STEG.includes(steg as StegId)) notFound();
  const current = steg as StegId;

  return (
    <div className="min-h-screen bg-[var(--surface,#FAFAF7)] text-foreground">
      <main className="mx-auto max-w-[1180px] px-8 py-8">
        <PageHead />
        <DotIndicator current={current} />
        {current === "1" && <Step1 />}
        {current === "2" && <Step2 />}
        {current === "3" && <Step3 />}
        {current === "4" && <Step4 />}
        {current === "5" && <Step5 />}
        {current === "6" && <Step6 />}
        <FooterBar current={current} />
      </main>
    </div>
  );
}

/* ============================================================
   FELLES SHELL
   ============================================================ */

function PageHead() {
  return (
    <header className="mb-6">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        /min/okt/ny
      </span>
      <h1 className="mt-1 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
        Lag din <em className="font-medium italic">egen</em> økt
      </h1>
      <p className="mt-2 max-w-[640px] text-[13px] leading-[1.55] text-muted-foreground">
        Sett sammen en økt utenfor coach-planen din — på 6 raske steg.
      </p>
    </header>
  );
}

function DotIndicator({ current }: { current: StegId }) {
  const idx = Number(current);
  const label = STEPS[idx - 1].label;
  return (
    <div className="mb-7">
      <div className="mb-2.5 flex items-center gap-1.5">
        {STEPS.map((s, i) => {
          const stepNum = i + 1;
          const state: "done" | "active" | "todo" =
            stepNum < idx ? "done" : stepNum === idx ? "active" : "todo";
          return (
            <div key={s.num} className="flex flex-1 items-center gap-1.5">
              <span
                className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                  state === "done"
                    ? "bg-[var(--brand-primary,#005840)]"
                    : state === "active"
                      ? "bg-accent ring-2 ring-[var(--brand-primary,#005840)] ring-offset-2 ring-offset-[var(--surface,#FAFAF7)]"
                      : "bg-[var(--surface-alt,#F1EEE5)] border border-border"
                }`}
              />
              {i < STEPS.length - 1 && (
                <span
                  className={`h-px flex-1 ${
                    stepNum < idx
                      ? "bg-[var(--brand-primary,#005840)]"
                      : "bg-[var(--line-soft,#EFEDE6)]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="text-[12px] leading-none text-muted-foreground">
        <b className="font-semibold text-foreground">Steg {idx} av 6</b> · {label}
      </div>
    </div>
  );
}

function FooterBar({ current }: { current: StegId }) {
  const idx = Number(current);
  const prev = idx > 1 ? String(idx - 1) : null;
  const next = idx < 6 ? String(idx + 1) : null;

  const nextLabels: Record<number, string> = {
    1: "Neste — Lengde",
    2: "Neste — Fasilitet",
    3: "Neste — Tid",
    4: "Neste — Øvelser",
    5: "Neste — Bekreft",
  };

  return (
    <div className="mt-8 flex items-center justify-between gap-2.5 border-t border-border pt-5">
      <div className="flex gap-2.5">
        {prev ? (
          <Link
            href={`/demos/ny-okt/${prev}`}
            className="inline-flex items-center rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            ← Tilbake
          </Link>
        ) : (
          <button className="inline-flex items-center rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
            Avbryt
          </button>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[12px] text-muted-foreground">Steg {idx} / 6</span>
        {next ? (
          <Link
            href={`/demos/ny-okt/${next}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-[13px] font-semibold text-[var(--brand-accent-on,#005840)] transition-opacity hover:opacity-90"
          >
            {nextLabels[idx]}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        ) : (
          <button className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-[13px] font-semibold text-[var(--brand-accent-on,#005840)] transition-opacity hover:opacity-90">
            <Play className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
            Start økt →
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   STEG 1 — Kategori og undertype
   ============================================================ */

function Step1() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <SectionHead num="01 · KATEGORI" title="Velg en retning for økta">
          Du kan justere underveis. Kategorien styrer hvilke øvelser agenten foreslår.
        </SectionHead>
        <div className="grid grid-cols-3 gap-3.5">
          <KCard
            icon={<Target className="h-6 w-6" strokeWidth={1.5} />}
            title="Fokusert"
            sub="Jobbe med én ting — TEK, SLAG, SPILL eller PUTT."
            selected
          />
          <KCard
            icon={<Triangle className="h-6 w-6" strokeWidth={1.5} />}
            title="Komplett økt"
            sub="Hele runden gjennom alle fokusområder — som en mini-runde."
          />
          <KCard
            icon={<Shield className="h-6 w-6" strokeWidth={1.5} />}
            title="Lek og lær"
            sub="Drills, utfordringer, leaderboard mot deg selv."
          />
        </div>
      </section>

      <section>
        <SectionHead num="02 · UNDERTYPE" title="Hvilket område?" />
        <div className="flex flex-wrap gap-2">
          <Chip label="TEK · teknikk" tone="tek" active />
          <Chip label="SLAG · presisjon" tone="slag" />
          <Chip label="SPILL · scoring" tone="spill" />
          <Chip label="PUTT · putting" />
        </div>
      </section>

      <section>
        <div
          className="flex items-start gap-3.5 rounded-xl border bg-card px-5 py-4"
          style={{
            background: "rgba(0,88,64,0.04)",
            borderColor: "rgba(0,88,64,0.18)",
          }}
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--brand-primary,#005840)] text-white">
            <Sparkles className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-[var(--brand-primary,#005840)]">
              Agenten anbefaler
            </div>
            <p className="mt-1 font-display text-[15px] italic leading-[1.4] text-foreground">
              «TEK · teknikk passer godt — du har ikke trent driver på 8 dager, og du har en runde
              på Bossum lørdag.»
            </p>
          </div>
        </div>
      </section>

      <div
        className="flex items-center gap-2.5 rounded-lg border px-4 py-3 text-[13px]"
        style={{
          background: "rgba(209,248,67,0.16)",
          borderColor: "rgba(209,248,67,0.4)",
        }}
      >
        <Shield
          className="h-4 w-4 text-[var(--brand-primary,#005840)]"
          strokeWidth={1.75}
        />
        <span>
          <b className="font-semibold">Pro-abonnement</b> · ubegrenset antall egendefinerte økter
          denne måneden.
        </span>
      </div>
    </div>
  );
}

function KCard({
  icon,
  title,
  sub,
  selected = false,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex flex-col items-start gap-3 rounded-xl border-2 bg-card p-5 text-left transition-colors ${
        selected
          ? "border-[var(--brand-primary,#005840)] bg-[rgba(0,88,64,0.04)]"
          : "border-border hover:bg-secondary/40"
      }`}
    >
      <div
        className={
          selected
            ? "text-[var(--brand-primary,#005840)]"
            : "text-muted-foreground"
        }
      >
        {icon}
      </div>
      <div className="font-display text-[16px] font-bold leading-tight">{title}</div>
      <p className="text-[12.5px] leading-[1.5] text-muted-foreground">{sub}</p>
      {selected && (
        <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--brand-primary,#005840)]">
          <Check className="h-3 w-3" strokeWidth={2.5} />
          Valgt
        </div>
      )}
    </button>
  );
}

function Chip({
  label,
  tone,
  active = false,
}: {
  label: string;
  tone?: "tek" | "slag" | "spill";
  active?: boolean;
}) {
  const toneBg: Record<string, string> = {
    tek: "rgba(0,88,64,0.12)",
    slag: "rgba(209,248,67,0.25)",
    spill: "rgba(184,133,42,0.15)",
  };
  const toneColor: Record<string, string> = {
    tek: "#005840",
    slag: "#5C6B0E",
    spill: "#B8852A",
  };
  if (active) {
    return (
      <button
        className="inline-flex items-center rounded-full px-4 py-2 text-[12.5px] font-semibold leading-none ring-2 ring-[var(--brand-primary,#005840)] ring-offset-2 ring-offset-[var(--surface,#FAFAF7)]"
        style={{
          background: tone ? toneBg[tone] : "var(--surface-alt,#F1EEE5)",
          color: tone ? toneColor[tone] : undefined,
        }}
      >
        {label}
      </button>
    );
  }
  return (
    <button
      className="inline-flex items-center rounded-full border border-border bg-transparent px-4 py-2 text-[12.5px] font-medium leading-none text-foreground transition-colors hover:bg-secondary"
      style={
        tone
          ? { background: toneBg[tone], color: toneColor[tone], borderColor: "transparent" }
          : undefined
      }
    >
      {label}
    </button>
  );
}

/* ============================================================
   STEG 2 — Lengde og intensitet
   ============================================================ */

function Step2() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <SectionHead num="01 · VARIGHET" title="Hvor lang økt?" />
        <div className="inline-flex rounded-md border border-border bg-card p-1">
          {[
            { l: "30 min", a: false },
            { l: "60 min", a: true },
            { l: "90 min", a: false },
            { l: "120 min", a: false },
          ].map((b) => (
            <button
              key={b.l}
              className={`inline-flex items-center rounded-sm px-4 py-2 text-[13px] font-medium transition-colors ${
                b.a
                  ? "bg-[var(--brand-primary,#005840)] text-white"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              {b.l}
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionHead num="02 · INTENSITET" title="Hvor hardt?">
          Medium · «Du trener kvalitet, ikke volum. Ca. 280 svinger.»
        </SectionHead>
        <div className="rounded-xl border border-border bg-card px-6 py-5">
          <div className="relative h-2 rounded-sm bg-[var(--surface-alt,#F1EEE5)]">
            <div
              className="absolute left-0 top-0 h-full rounded-sm bg-[var(--brand-primary,#005840)]"
              style={{ width: "50%" }}
            />
            <div
              className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--brand-primary,#005840)] bg-white shadow"
              style={{ left: "50%" }}
            />
          </div>
          <div className="mt-3 flex justify-between font-mono text-[11px] text-muted-foreground">
            <span>1 · Lett</span>
            <span>2</span>
            <span className="font-semibold text-[var(--brand-primary,#005840)]">3 · Medium</span>
            <span>4</span>
            <span>5 · Hard</span>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4">
          <Clock
            className="h-5 w-5 text-[var(--brand-primary,#005840)]"
            strokeWidth={1.75}
          />
          <div className="text-[13px] leading-[1.5] text-foreground">
            <b className="font-semibold">60 min</b> · medium intensitet · ca.{" "}
            <b className="font-semibold">280 svinger</b> · estimert kaloriforbruk{" "}
            <b className="font-semibold">240 kcal</b>.
          </div>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   STEG 3 — Fasilitet
   ============================================================ */

function Step3() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <SectionHead num="01 · STED" title="Hvor skal du trene?" />
          <div className="inline-flex rounded-md border border-border bg-transparent p-1">
            <button className="rounded-sm bg-[var(--brand-primary,#005840)] px-3 py-1.5 text-[12px] font-medium text-white">
              Mine vanlige
            </button>
            <button className="rounded-sm px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-secondary">
              Søk alle
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <FacRow
            name="Mulligan Studio 2"
            meta="Fredrikstad · 2,1 km · TrackMan-sim · 800 kr/time"
            pill="Din vanligste"
            slots={[
              { l: "I dag 14:00" },
              { l: "I dag 16:30" },
              { l: "I morgen 09:00", busy: true },
              { l: "I morgen 17:00" },
              { l: "Tor 13:00" },
            ]}
            selected
          />
          <FacRow
            name="GFGK Range"
            meta="Gressvik · 4,3 km · Utendørs · gratis for medlem"
            slots={[
              { l: "I dag 15:00" },
              { l: "I dag 18:00" },
              { l: "I morgen 10:00" },
            ]}
          />
          <FacRow
            name="Bossum Golfklubb"
            meta="Bossum · 14 km · Range + korthold · 200 kr"
            slots={[{ l: "Tor 11:00" }, { l: "Fre 09:00" }]}
          />
          <FacRow
            name="Hjemme / egen tid"
            meta="Hage, garasje, eller hvor som helst — uten booking."
            dashed
          />
        </div>
      </section>
    </div>
  );
}

function FacRow({
  name,
  meta,
  pill,
  slots,
  selected = false,
  dashed = false,
}: {
  name: string;
  meta: string;
  pill?: string;
  slots?: { l: string; busy?: boolean }[];
  selected?: boolean;
  dashed?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-4 rounded-xl bg-card p-4 ${
        selected
          ? "border-2 border-[var(--brand-primary,#005840)] bg-[rgba(0,88,64,0.04)]"
          : dashed
            ? "border border-dashed border-border"
            : "border border-border hover:bg-secondary/30"
      }`}
    >
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--surface-alt,#F1EEE5)] text-[var(--brand-primary,#005840)]">
        <Home className="h-[22px] w-[22px]" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold leading-none">{name}</span>
          {pill && (
            <span className="rounded-full bg-[var(--status-success-bg,#E5F1EA)] px-2 py-0.5 text-[10px] font-medium leading-none text-[var(--status-success,#1A7D56)]">
              {pill}
            </span>
          )}
        </div>
        <div className="mt-1 text-[12.5px] leading-[1.4] text-muted-foreground">{meta}</div>
        {slots && slots.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {slots.map((s, i) => (
              <span
                key={i}
                className={`rounded-md border px-2.5 py-1 font-mono text-[11px] leading-none ${
                  s.busy
                    ? "border-[var(--line-soft,#EFEDE6)] bg-[var(--surface-alt,#F1EEE5)] text-muted-foreground line-through opacity-60"
                    : "border-border bg-background text-foreground hover:bg-secondary"
                }`}
              >
                {s.l}
              </span>
            ))}
          </div>
        )}
      </div>
      {selected && (
        <Check
          className="h-5 w-5 flex-shrink-0 text-[var(--brand-primary,#005840)]"
          strokeWidth={2}
        />
      )}
    </div>
  );
}

/* ============================================================
   STEG 4 — Dato og tid
   ============================================================ */

function Step4() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <SectionHead
          num="01 · DATO & TID"
          title={
            <>
              Velg når på <span className="font-mono">Mulligan Studio 2</span>
            </>
          }
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Dato
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-2.5 flex items-center justify-between">
                <button className="text-muted-foreground hover:text-foreground">‹</button>
                <div className="font-display text-[14px] font-semibold">Mai 2026</div>
                <button className="text-muted-foreground hover:text-foreground">›</button>
              </div>
              <div className="mb-1 grid grid-cols-7 gap-0.5 text-center font-mono text-[10px] text-muted-foreground">
                {["M", "T", "O", "T", "F", "L", "S"].map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5 text-center font-mono text-[13px]">
                <CalDay d={28} muted />
                <CalDay d={29} muted />
                <CalDay d={30} muted />
                <CalDay d={1} />
                <CalDay d={2} />
                <CalDay d={3} />
                <CalDay d={4} />
                <CalDay d={5} />
                <CalDay d={6} />
                <CalDay d={7} />
                <CalDay d={8} />
                <CalDay d={9} />
                <CalDay d={10} />
                <CalDay d={11} selected />
                <CalDay d={12} />
                <CalDay d={13} />
                <CalDay d={14} />
                <CalDay d={15} />
                <CalDay d={16} />
                <CalDay d={17} />
                <CalDay d={18} />
                <CalDay d={19} />
                <CalDay d={20} />
                <CalDay d={21} />
                <CalDay d={22} />
                <CalDay d={23} />
                <CalDay d={24} />
                <CalDay d={25} />
                <CalDay d={26} />
                <CalDay d={27} />
                <CalDay d={28} />
                <CalDay d={29} />
                <CalDay d={30} />
                <CalDay d={31} />
              </div>
            </div>
            <div className="mt-2 text-[12px] text-muted-foreground">
              Valgt: <b className="font-semibold text-foreground">Man 11. mai 2026</b> (i dag)
            </div>
          </div>

          <div>
            <div className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Klokkeslett
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 text-center font-mono text-[42px] font-medium leading-none tabular-nums tracking-tight">
                14:00
              </div>
              <div className="mb-4 flex justify-center gap-2">
                <button className="rounded-full border border-border bg-transparent px-3 py-1.5 text-[12px] font-medium hover:bg-secondary">
                  −15 min
                </button>
                <button className="rounded-full border border-border bg-transparent px-3 py-1.5 text-[12px] font-medium hover:bg-secondary">
                  +15 min
                </button>
              </div>
              <div
                className="flex items-start gap-2.5 rounded-md border px-3 py-2.5"
                style={{
                  background: "rgba(216,57,57,0.08)",
                  borderColor: "rgba(216,57,57,0.25)",
                }}
              >
                <TriangleAlert
                  className="h-4 w-4 flex-shrink-0 text-[#D83939]"
                  strokeWidth={1.75}
                />
                <div className="text-[12.5px] leading-[1.4] text-foreground">
                  <b className="font-semibold">14:00 er opptatt.</b> Studio er booket til 15:30.
                </div>
              </div>
              <div className="mt-3.5 text-[12px] text-muted-foreground">
                Foreslåtte ledige tider:
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["15:45", "16:30", "I morgen 09:00"].map((t) => (
                  <button
                    key={t}
                    className="rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-[12px] leading-none hover:bg-secondary"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CalDay({
  d,
  muted = false,
  selected = false,
}: {
  d: number;
  muted?: boolean;
  selected?: boolean;
}) {
  let cls = "py-1.5 rounded-md";
  if (muted) cls += " text-muted-foreground/50";
  else if (selected)
    cls += " bg-accent text-[var(--brand-accent-on,#005840)] font-semibold";
  else cls += " hover:bg-secondary cursor-pointer";
  return <span className={cls}>{d}</span>;
}

/* ============================================================
   STEG 5 — Øvelser
   ============================================================ */

function Step5() {
  const exercises: ExerciseRow[] = [
    {
      pill: "TEK",
      title: "Driver — tempo-sving 7/10",
      sub: "15 min · 30 svinger · video-opptak",
      mins: "15m",
    },
    {
      pill: "TEK",
      title: "7-jern stigning — kontaktskonsistens",
      sub: "12 min · 20 baller · TrackMan-snitt",
      mins: "12m",
    },
    {
      pill: "TEK",
      title: "Wedge — kontroll 30/50/70 m",
      sub: "15 min · 25 baller · 3 distanser",
      mins: "15m",
    },
    {
      pill: "TEK",
      title: "Putting — 3 m sikker zone",
      sub: "10 min · 40 putts · klokke",
      mins: "10m",
    },
    {
      pill: "+ LAGT TIL",
      title: "Cool-down — pust og tempo",
      sub: "6 min · 10 svinger halv-fart",
      mins: "6m",
      added: true,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section>
        <SectionHead
          num="01 · FORESLÅTT FRA PLANEN DIN"
          title="Anders har 4 øvelser som matcher TEK-fokus"
        >
          Plukket fra «Sommer-toppform» · uke 19. Dra for å sortere, eller fjern det du ikke vil
          ha.
        </SectionHead>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          {exercises.map((e, i) => (
            <ExerciseLine
              key={i}
              {...e}
              last={i === exercises.length - 1}
            />
          ))}
        </div>

        <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-transparent px-4 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
          <Plus className="h-4 w-4" strokeWidth={2} />
          Legg til fra bibliotek
        </button>
      </section>

      <section>
        <div
          className="flex items-center justify-between rounded-xl border border-dashed border-border px-5 py-4"
          style={{ background: "var(--surface-alt,#F1EEE5)" }}
        >
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Sum
            </div>
            <div className="mt-1 font-display text-[17px] font-semibold">
              <b className="font-mono tabular-nums">5</b> øvelser ·{" "}
              <b className="font-mono tabular-nums">58</b> min
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Valgt
            </div>
            <div className="mt-1 font-display text-[17px] font-semibold text-[var(--status-success,#1A7D56)]">
              <b className="font-mono tabular-nums">60</b> min · innenfor
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

type ExerciseRow = {
  pill: string;
  title: string;
  sub: string;
  mins: string;
  added?: boolean;
};

function ExerciseLine({
  pill,
  title,
  sub,
  mins,
  added = false,
  last = false,
}: ExerciseRow & { last?: boolean }) {
  return (
    <div
      className={`flex items-center gap-3.5 px-5 py-3.5 ${
        last ? "" : "border-b border-[var(--line-soft,#EFEDE6)]"
      }`}
      style={added ? { background: "rgba(209,248,67,0.06)" } : undefined}
    >
      <GripVertical
        className="h-4 w-4 flex-shrink-0 cursor-grab text-muted-foreground"
        strokeWidth={1.75}
      />
      <span
        className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-semibold leading-none"
        style={
          added
            ? { background: "rgba(209,248,67,0.32)", color: "#5C6B0E" }
            : { background: "rgba(0,88,64,0.12)", color: "#005840" }
        }
      >
        {pill}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold leading-tight">{title}</div>
        <div className="mt-1 text-[12.5px] leading-none text-muted-foreground">{sub}</div>
      </div>
      <span className="font-mono text-[12px] tabular-nums text-muted-foreground">{mins}</span>
      <button className="text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}

/* ============================================================
   STEG 6 — Bekreft og start
   ============================================================ */

function Step6() {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <div className="rounded-2xl border border-border bg-card px-7 py-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Sammendrag
              </div>
              <h2 className="mt-1 font-display text-[28px] font-medium italic leading-tight tracking-tight">
                «TEK · teknikk på Mulligan Studio 2»
              </h2>
            </div>
            <span className="inline-flex flex-shrink-0 items-center rounded-full bg-accent px-3 py-1 text-[12px] font-semibold leading-none text-[var(--brand-accent-on,#005840)]">
              Klar
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-7 gap-y-3.5 border-t border-[var(--line-soft,#EFEDE6)] pt-5">
            <SummaryItem label="Type" value="Fokusert · TEK" />
            <SummaryItem label="Fasilitet" value="Mulligan Studio 2" />
            <SummaryItem label="Varighet & intensitet" value="60 min · medium (3 / 5)" />
            <SummaryItem
              label="Tid"
              value={
                <>
                  Man 11. mai · <span className="font-mono tabular-nums">15:45</span>
                </>
              }
            />
          </div>

          <div className="mt-5 border-t border-[var(--line-soft,#EFEDE6)] pt-5">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              5 øvelser · 58 min
            </div>
            <ol className="mt-2 flex flex-col gap-1.5 p-0">
              <ExerciseListRow num="01" title="Driver — tempo-sving 7/10" mins="15 min" />
              <ExerciseListRow
                num="02"
                title="7-jern stigning — kontaktskonsistens"
                mins="12 min"
              />
              <ExerciseListRow num="03" title="Wedge — kontroll 30/50/70 m" mins="15 min" />
              <ExerciseListRow num="04" title="Putting — 3 m sikker zone" mins="10 min" />
              <ExerciseListRow num="05" title="Cool-down — pust og tempo" mins="6 min" />
            </ol>
          </div>
        </div>
      </section>

      <section>
        <SectionHead num="OPSJONER" title="Etter du har startet" />
        <div className="flex flex-col gap-2">
          <OptionRow
            title="Del med coach Anders K."
            sub="Anders ser hva du har planlagt og resultatene etterpå."
          />
          <OptionRow title="Påminnelse 30 min før" sub="Push-varsel kl. 15:15." />
          <OptionRow
            title="Logg automatisk i tren-kalender"
            sub="Vises i mai-kalenderen umiddelbart."
          />
        </div>
      </section>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-[14px] font-semibold">{value}</div>
    </div>
  );
}

function ExerciseListRow({
  num,
  title,
  mins,
}: {
  num: string;
  title: string;
  mins: string;
}) {
  return (
    <li className="flex items-center justify-between text-[13.5px]">
      <span>
        <span className="font-mono text-muted-foreground/60">{num}</span>
        <span className="ml-3">{title}</span>
      </span>
      <span className="font-mono tabular-nums text-muted-foreground">{mins}</span>
    </li>
  );
}

function OptionRow({ title, sub }: { title: string; sub: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-sm border-2 border-[var(--brand-primary,#005840)] bg-[var(--brand-primary,#005840)] text-white">
        <Check className="h-3 w-3" strokeWidth={2.5} />
      </span>
      <div className="flex-1">
        <div className="text-[13.5px] font-semibold leading-tight">{title}</div>
        <div className="mt-0.5 text-[12px] leading-none text-muted-foreground">{sub}</div>
      </div>
    </label>
  );
}

/* ============================================================
   FELLES HJELPERE
   ============================================================ */

function SectionHead({
  num,
  title,
  children,
}: {
  num: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {num}
      </div>
      <div className="mt-1 font-display text-[18px] font-bold leading-tight tracking-tight">
        {title}
      </div>
      {children && (
        <p className="mt-1.5 max-w-[600px] text-[12.5px] leading-[1.5] text-muted-foreground">
          {children}
        </p>
      )}
    </div>
  );
}
