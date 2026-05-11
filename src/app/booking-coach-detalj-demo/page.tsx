/**
 * Booking — Coach-detalj (steg 2 av 5)
 * Bygd fra wireframe/design-files-v2/screens/booking/04-booking-coach-detalj.html
 * URL: /booking-coach-detalj-demo
 *
 * Coach-profil for Anders Kristiansen med bio, sertifiseringer,
 * anbefalinger og 7-dagers quick-book-grid (uke 19, mai 2026).
 */

import { Check } from "lucide-react";

const STEPS = [
  { num: "✓", label: "Tjeneste", state: "done" as const },
  { num: "2", label: "Coach", state: "active" as const },
  { num: "3", label: "Tid", state: "todo" as const },
  { num: "4", label: "Sammendrag", state: "todo" as const },
  { num: "5", label: "Betaling", state: "todo" as const },
];

const CERTS = [
  { badge: "P", label: "PGA Norge" },
  { badge: "T", label: "TrackMan Master" },
  { badge: "M", label: "Mac O'Grady-trent" },
  { badge: "J", label: "Junior-spesialist" },
];

const SPECIALITIES = [
  "Scoring innenfor 100 meter",
  "Putte-mekanikk og lesing",
  "Mental tilnærming under press",
  "Junior-utvikling (8–16 år)",
];

interface Quote {
  q: string;
  who: string;
  meta: string;
}

const QUOTES: Quote[] = [
  {
    q: "Anders snur ikke bare swingen — han snur måten jeg tenker på under runden. Mitt hcp gikk fra 11 til 6 på halvannen sesong.",
    who: "Markus R.",
    meta: "Hcp 6 · Coach siden 2024",
  },
  {
    q: "Tålmodig og målrettet. Datteren min på 11 år gledet seg til hver time.",
    who: "Lena B.",
    meta: "Forelder · Junior-coach",
  },
];

interface DaySlot {
  time: string;
  state?: "free" | "busy";
}

interface Day {
  wd: string;
  d: string;
  month: string;
  today?: boolean;
  empty?: string;
  slots?: DaySlot[];
}

const WEEK: Day[] = [
  {
    wd: "Man",
    d: "11",
    month: "Mai",
    today: true,
    slots: [
      { time: "08:00" },
      { time: "14:00" },
      { time: "15:00", state: "busy" },
    ],
  },
  {
    wd: "Tirs",
    d: "12",
    month: "Mai",
    slots: [
      { time: "08:00" },
      { time: "09:00" },
      { time: "10:00" },
      { time: "14:00" },
    ],
  },
  {
    wd: "Ons",
    d: "13",
    month: "Mai",
    slots: [
      { time: "09:00" },
      { time: "11:00" },
      { time: "14:00", state: "busy" },
    ],
  },
  { wd: "Tors", d: "14", month: "Mai", empty: "Ingen tider" },
  {
    wd: "Fre",
    d: "15",
    month: "Mai",
    slots: [
      { time: "08:00" },
      { time: "10:00" },
      { time: "13:00" },
      { time: "15:00" },
    ],
  },
  {
    wd: "Lør",
    d: "16",
    month: "Mai",
    slots: [{ time: "10:00" }, { time: "12:00" }],
  },
  { wd: "Søn", d: "17", month: "Mai", empty: "Stengt" },
];

export default function BookingCoachDetaljDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <ProgressBar />

      <div className="mx-auto max-w-[1000px] px-12 pb-16 pt-12">
        {/* Hero */}
        <div className="flex items-center gap-7">
          <div className="grid h-24 w-24 flex-shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-[32px] font-bold text-primary">
            AK
          </div>
          <div>
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              PGA-Profesjonell · Mulligan Indoor Borre · 12 år erfaring
            </div>
            <h1 className="mt-2 font-display text-[44px] font-normal leading-[1.05] tracking-tight">
              Anders <em className="italic text-primary">Kristiansen</em>
            </h1>
            <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#E8F5E9] px-3 py-1 text-[12px] font-medium text-[#16A34A]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
              Ledig denne uka — 14 ledige tider
            </span>
          </div>
        </div>

        {/* Bio + spesialitet */}
        <div className="mt-10 grid grid-cols-[1.4fr_1fr] gap-8">
          <div>
            <p className="max-w-[580px] text-[14px] leading-[1.65]">
              Anders har coachet golfere på alle nivåer i over 12 år — fra første runde til norgesmesterskap. Spesialiserer seg på scoring-spill og mental tilnærming under press.
            </p>
            <p className="mt-3 max-w-[580px] text-[14px] leading-[1.65]">
              Tidligere norgesfinalist (2014, 2017) og en av få nordmenn som har trent direkte med Mac O&apos;Grady. Tror på data, men enda mer på følelse.
            </p>
            <p className="mt-3 max-w-[580px] text-[14px] leading-[1.65] text-muted-foreground">
              Tilgjengelig på Mulligan Indoor Borre. Tar imot alle aldre, fra junior 8 år til senior.
            </p>

            <div className="mt-8">
              <h3 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Sertifiseringer
              </h3>
              <div className="flex flex-wrap gap-2">
                {CERTS.map((c) => (
                  <span
                    key={c.label}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[12px]"
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 font-mono text-[10px] font-bold text-primary">
                      {c.badge}
                    </span>
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Spesialitet
            </h3>
            <ul className="space-y-3">
              {SPECIALITIES.map((s) => (
                <li key={s} className="flex items-center gap-3 text-[14px]">
                  <span className="grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-3 w-3" strokeWidth={2} />
                  </span>
                  {s}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <h3 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Anbefalinger
              </h3>
              <div className="space-y-3">
                {QUOTES.map((q) => (
                  <div
                    key={q.who}
                    className="rounded-2xl border border-border bg-card p-5"
                  >
                    <p className="font-display text-[17px] font-normal italic leading-[1.45]">
                      &ldquo;{q.q}&rdquo;
                    </p>
                    <div className="mt-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                      <span>{q.who}</span>
                      <span className="text-border">·</span>
                      <span>{q.meta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Uke-grid */}
        <div className="mt-12 rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-[24px] font-normal italic tracking-tight">
              Ledige tider <em>neste 7 dager</em>
            </h2>
            <a href="#" className="text-[13px] font-medium text-primary hover:underline">
              Se hele kalenderen →
            </a>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {WEEK.map((day) => (
              <div
                key={day.d}
                className="flex min-h-[200px] flex-col gap-2 rounded-xl bg-secondary/50 p-3"
              >
                <div className="border-b border-border pb-2 text-center">
                  <div
                    className={`font-mono text-[10px] uppercase tracking-[0.1em] ${
                      day.today ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {day.wd}
                  </div>
                  <div
                    className={`mt-0.5 font-display text-[22px] italic leading-tight ${
                      day.today ? "text-primary" : ""
                    }`}
                  >
                    {day.d}
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                    {day.month}
                  </div>
                </div>
                {day.empty ? (
                  <div className="flex flex-1 items-center justify-center px-2 text-center font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                    {day.empty}
                  </div>
                ) : (
                  day.slots?.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={slot.state === "busy"}
                      className={`grid h-8 place-items-center rounded-md border font-mono text-[11px] transition-colors ${
                        slot.state === "busy"
                          ? "cursor-not-allowed border-dashed border-border text-muted-foreground line-through"
                          : "border-border bg-card text-foreground hover:border-primary"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function TopNav() {
  return (
    <nav className="flex h-16 items-center justify-between border-b border-border px-12">
      <div className="flex items-center gap-2 text-[13px] font-medium">
        <span className="h-2 w-2 rounded-full bg-primary" />
        <span>AK Golf</span>
        <span className="text-border">·</span>
        <span className="text-muted-foreground">Booking</span>
      </div>
      <a href="#" className="text-[13px] font-medium hover:text-primary">
        Min side →
      </a>
    </nav>
  );
}

function ProgressBar() {
  return (
    <div className="flex items-center justify-center gap-3 border-b border-border bg-secondary/40 px-12 py-4">
      {STEPS.map((step, i) => (
        <div key={step.label} className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium ${
              step.state === "active"
                ? "bg-primary text-primary-foreground"
                : step.state === "done"
                  ? "text-foreground"
                  : "text-muted-foreground"
            }`}
          >
            <span
              className={`grid h-5 w-5 place-items-center rounded-full font-mono text-[10px] ${
                step.state === "active"
                  ? "bg-primary-foreground/20"
                  : step.state === "done"
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary"
              }`}
            >
              {step.num}
            </span>
            {step.label}
          </span>
          {i < STEPS.length - 1 && <span className="text-border">→</span>}
        </div>
      ))}
    </div>
  );
}

function Footer() {
  return (
    <footer className="flex items-center justify-between border-t border-border px-12 py-5">
      <button
        type="button"
        className="rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium hover:bg-secondary"
      >
        ← Andre coacher
      </button>
      <button
        type="button"
        className="rounded-md bg-primary px-5 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90"
      >
        Se hele kalenderen →
      </button>
    </footer>
  );
}
