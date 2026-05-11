/**
 * PILOT — Foreldreportal · Medlemskap og billing
 * Bygd direkte fra wireframe/design-files-v2/screens/40-foreldre-billing.html
 * URL: /foreldre-billing-demo
 */

import { Lock, ShieldCheck } from "lucide-react";

export default function ForeldreBillingDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] px-8 py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Foreldreportal · Medlemskap og billing
            </div>
            <h1 className="mt-1 font-display text-[32px] font-semibold tracking-tight leading-[1.1]">
              Medlemskap{" "}
              <em className="font-normal italic text-muted-foreground">· Pedersen-familien</em>
            </h1>
            <p className="mt-2 max-w-[640px] text-[13px] leading-[1.55] text-muted-foreground">
              Frode er fakturaansvarlig. Endring av plan eller betalingsmetode krever forelder-tilgang.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-md border border-border bg-transparent px-3 py-2 text-[12px] font-medium hover:bg-secondary">
              Last ned skattedata
            </button>
            <button className="rounded-md border border-border bg-transparent px-3 py-2 text-[12px] font-medium hover:bg-secondary">
              Hjelp · refusjon
            </button>
          </div>
        </div>

        {/* Plan hero */}
        <section className="mb-5 overflow-hidden rounded-2xl border border-border bg-[#0A1F17] p-7 text-[#F5F4EE]">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent">
                Aktiv plan · faktureres årlig
              </div>
              <h2 className="mt-2 font-display text-[28px] font-semibold leading-tight tracking-tight">
                Familie Pro
              </h2>
              <p className="mt-2 max-w-[480px] text-[13px] leading-[1.5] text-[rgba(245,244,238,0.65)]">
                Opptil 4 spillere, ubegrenset coaching-board, video-arkiv 24 mnd, klubb-deling og
                prioritert support — alt inkludert.
              </p>
              <div className="mt-4">
                <span className="font-display text-[36px] font-semibold tracking-tight">3 600 kr</span>
                <span className="ml-2 font-mono text-[12px] tracking-[0.04em] text-[rgba(245,244,238,0.55)]">
                  / år inkl. MVA · 300 kr/mnd
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="rounded-md border border-[rgba(245,244,238,0.15)] bg-[rgba(245,244,238,0.08)] px-3 py-2 text-[12px] font-medium text-[#F5F4EE]">
                Bytt til månedlig
              </button>
              <button className="rounded-md bg-accent px-3 py-2 text-[12px] font-medium text-[#0A1F17]">
                Administrer plan
              </button>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-0 border-t border-[rgba(245,244,238,0.10)] pt-4">
            <HeroCell label="Aktive seter" v="2" sub="av 4 inkludert" />
            <HeroCell label="Neste trekk" v="14.06.2026" sub="autotrekk · Vipps" />
            <HeroCell label="Fornyer" v="14.05.2027" sub="365 dgr igjen" />
            <HeroCell label="Spart vs månedlig" v="1 200 kr" sub="22 % rabatt årlig" last />
          </div>
        </section>

        <div className="grid grid-cols-12 gap-5">
          {/* Left column */}
          <div className="col-span-8 flex flex-col gap-5">
            {/* Seats */}
            <section className="rounded-lg border border-border bg-card p-6">
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="font-display text-[14px] font-semibold tracking-tight">
                  Spillere i planen{" "}
                  <em className="font-normal italic text-muted-foreground text-[12px]">· 2 av 4</em>
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                  2 seter ledige · ingen ekstra kost
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <SeatRow initials="MR" name="Markus Roinås Pedersen" age="16 år" sub="PlayerHQ · 27 økter · 8 opptak · coach Anders Kristiansen" tier="Pro" active="aktiv 11 mnd" />
                <SeatRow initials="EP" name="Emma Pedersen" age="13 år" sub="PlayerHQ · 14 økter · 3 opptak · coach Lars Hammer" tier="Junior" active="aktiv 4 mnd" basic />
                <SeatRow empty label="Inviter spiller nr 3" sub="e-post, mobil eller BankID — barnet får eget login" />
                <SeatRow empty label="Inviter spiller nr 4" sub="inkludert i Familie Pro · ingen ekstra kost" />
              </div>
            </section>

            {/* Invoice history */}
            <section className="rounded-lg border border-border bg-card p-6">
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="font-display text-[14px] font-semibold tracking-tight">
                  Fakturahistorikk{" "}
                  <em className="font-normal italic text-muted-foreground text-[12px]">· 12 mnd</em>
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                  5 fakturaer · 1 refusjon
                </span>
              </div>
              <div>
                <InvRow d="14.05" y="2026" title="Familie Pro · årlig 14.05.26 – 14.05.27" sub="inv #INV-2026-04812 · MVA 25 % · 720 kr" amount="3 600 kr" status="Betalt" tone="paid" />
                <InvRow d="14.04" y="2026" title="Justering: bytt fra månedlig → årlig (kreditert)" sub="inv #INV-2026-04201 · proporsjonal kreditt" amount="−300 kr" status="Kreditert" tone="refund" />
                <InvRow d="14.03" y="2026" title="Familie Pro · månedlig (mars)" sub="inv #INV-2026-03102 · MVA 25 %" amount="300 kr" status="Betalt" tone="paid" />
                <InvRow d="14.02" y="2026" title="Familie Pro · månedlig (februar)" sub="inv #INV-2026-02041 · forsøk 1 mislyktes · korrigert 15.02" amount="300 kr" status="Betalt" tone="paid" />
                <InvRow d="14.01" y="2026" title="Familie Pro · månedlig (januar) · oppstart" sub="inv #INV-2026-00118 · prøveperiode endt 12.01" amount="300 kr" status="Betalt" tone="paid" />
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[var(--line-soft,#EFEDE6)] pt-3">
                <span className="font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
                  Totalt belastet 12 mnd:{" "}
                  <b className="font-semibold text-foreground">4 500 kr</b> · MVA inkl. 900 kr
                </span>
                <button className="rounded-md border border-border bg-transparent px-3 py-2 text-[12px] font-medium hover:bg-secondary">
                  Last ned alle som ZIP
                </button>
              </div>
            </section>

            {/* Usage */}
            <section className="rounded-lg border border-border bg-card p-6">
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="font-display text-[14px] font-semibold tracking-tight">
                  Bruk denne perioden{" "}
                  <em className="font-normal italic text-muted-foreground text-[12px]">· 14.05 – nå</em>
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                  ingen overforbruk · alt inkl. i Familie Pro
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Gauge label="Video-lagring" used="2,4" unit="GB" total="∞" pct={8} meta="ubegrenset i Pro" />
                <Gauge label="Coaching-økter" used="41" unit="økter" total="∞" pct={33} meta="~12 økter/mnd snitt" />
                <Gauge label="Agent-kjøringer" used="1 248" unit="i mnd" total="5 000" pct={25} meta="nullstilles 14.06" />
                <Gauge label="Klubb-delinger" used="1" unit="klubb" total="3" pct={33} meta="GFGK · 2 ledige" />
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="col-span-4 flex flex-col gap-5">
            <section className="rounded-lg border border-border bg-card p-6">
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="font-display text-[14px] font-semibold tracking-tight">Betalingsmetode</h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                  primær
                </span>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#23211D] to-[#1A1916] p-4 text-white">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[18px] font-bold tracking-tight">Vipps</span>
                  <span className="h-6 w-8 rounded-sm bg-gradient-to-br from-[#D4AF37] to-[#A88A28]" />
                </div>
                <div className="mt-4 font-mono text-[16px] tracking-[0.12em] font-medium">
                  <span className="opacity-40">•••• •••• ••••</span> 4242
                </div>
                <div className="mt-4 flex gap-3 font-mono text-[10px]">
                  <div className="flex-1">
                    <div className="text-[rgba(255,255,255,0.45)]">NAVN</div>
                    <div className="mt-0.5">Frode Pedersen</div>
                  </div>
                  <div>
                    <div className="text-[rgba(255,255,255,0.45)]">UTLØPER</div>
                    <div className="mt-0.5">08/28</div>
                  </div>
                  <div>
                    <div className="text-[rgba(255,255,255,0.45)]">TYPE</div>
                    <div className="mt-0.5">Visa Debit</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-1.5">
                <PmRow logo="VISA" name="Visa **8821" sub="utløper 03/27" tag="reserve" />
                <PmRow logo="V" vipps name="Vipps eFaktura" sub="DNB · 8 dgr forfall" tag="manuell" />
              </div>
              <button className="mt-3 w-full rounded-md border border-border bg-transparent px-3 py-2 text-[12px] font-medium hover:bg-secondary">
                + Legg til betalingsmetode
              </button>
            </section>

            <section className="rounded-lg border border-border bg-card p-6">
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="font-display text-[14px] font-semibold tracking-tight">Neste trekk</h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                  14.06.2026
                </span>
              </div>
              <div className="rounded-md border border-border bg-secondary p-4">
                <h4 className="mb-2 text-[13px] font-semibold">Forhåndsvisning</h4>
                <RcptLine name="Familie Pro · årlig" amt="2 880 kr" />
                <RcptLine name="Markus (Pro)" amt="inkl." />
                <RcptLine name="Emma (Junior)" amt="inkl." />
                <RcptLine name="Klubb-deling · 1" amt="inkl." />
                <div className="my-2 h-px bg-border" />
                <RcptLine name="Sum eks. MVA" amt="2 880 kr" />
                <RcptLine name="MVA 25 %" amt="720 kr" />
                <div className="mt-2 flex justify-between border-t-2 border-foreground pt-2 font-display text-[16px] font-semibold">
                  <span>Total</span>
                  <span>3 600 kr</span>
                </div>
              </div>
              <div className="mt-3 font-mono text-[10px] leading-[1.5] tracking-[0.04em] text-muted-foreground">
                Trekkes automatisk fra Vipps **4242 den 14.06. Du kan kansellere kostnadsfritt frem til
                13.06 kl 23:59.
              </div>
            </section>

            <section className="rounded-lg border border-border bg-secondary p-6">
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="font-display text-[14px] font-semibold tracking-tight">
                  Refusjon og oppsigelse
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                  åpenhetslogg
                </span>
              </div>
              <div className="mb-3 text-[12px] leading-[1.6] text-muted-foreground">
                <p className="mb-2">
                  <b className="font-semibold text-foreground">14 dgr angrerett</b> — full refusjon innen 14 dgr fra oppstart, uten begrunnelse.
                </p>
                <p className="mb-2">
                  <b className="font-semibold text-foreground">Pro rata-refusjon</b> ved oppsigelse av årsplan — gjenstående mnd kreditert.
                </p>
                <p>
                  <b className="font-semibold text-foreground">Ingen binding</b> — månedsplaner sies opp med øyeblikkelig virkning.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <button className="rounded-md border border-border bg-card px-3 py-2 text-[12px] font-medium hover:bg-secondary">
                  Pause abonnement (90 dgr)
                </button>
                <button className="rounded-md border border-[rgba(163,45,45,0.30)] bg-card px-3 py-2 text-[12px] font-medium text-destructive hover:bg-secondary">
                  Si opp medlemskap
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* Trust footer */}
        <div className="mt-5 flex flex-wrap items-center gap-6 rounded-lg border border-border bg-card px-5 py-4">
          <div className="flex items-center gap-2.5 text-[12px] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-[var(--status-success,#1A7D56)]" strokeWidth={1.5} />
            <span>
              <b className="font-semibold text-foreground">PCI-DSS Lvl 1</b> · kortdata håndteres av
              Stripe Norge AS
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-[12px] text-muted-foreground">
            <Lock className="h-4 w-4 text-primary" strokeWidth={1.5} />
            <span>
              <b className="font-semibold text-foreground">Sikker betaling</b> · TLS 1.3 · 3D Secure 2 ·
              BankID
            </span>
          </div>
          <span className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
            AK Golf HQ AS · Org 922 814 110 MVA · Klingenberggata 7, 0161 Oslo
          </span>
          <a className="ml-auto font-mono text-[11px] tracking-[0.04em] text-primary underline">
            Vilkår · personvern · cookies
          </a>
        </div>
      </div>
    </div>
  );
}

function HeroCell({ label, v, sub, last }: { label: string; v: string; sub: string; last?: boolean }) {
  return (
    <div className={`pr-4 ${last ? "" : "border-r border-[rgba(245,244,238,0.10)]"}`}>
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[rgba(245,244,238,0.45)]">
        {label}
      </div>
      <div className="mt-1.5 font-display text-[17px] font-semibold tracking-tight">{v}</div>
      <div className="mt-0.5 font-mono text-[10px] tracking-[0.04em] text-[rgba(245,244,238,0.55)]">
        {sub}
      </div>
    </div>
  );
}

function SeatRow({
  initials,
  name,
  age,
  sub,
  tier,
  active,
  basic,
  empty,
  label,
}: {
  initials?: string;
  name?: string;
  age?: string;
  sub?: string;
  tier?: string;
  active?: string;
  basic?: boolean;
  empty?: boolean;
  label?: string;
}) {
  if (empty) {
    return (
      <div className="grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border border-dashed border-border bg-secondary p-3 opacity-80 hover:opacity-100 hover:border-primary">
        <span className="grid h-9 w-9 place-items-center rounded-md border border-dashed border-border bg-secondary text-muted-foreground">
          +
        </span>
        <div>
          <div className="text-[13px] font-medium text-muted-foreground">{label}</div>
          <div className="mt-0.5 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">{sub}</div>
        </div>
        <span className="rounded-sm border border-dashed border-border bg-secondary px-2 py-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          ledig sete
        </span>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border border-border bg-card p-3">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-[rgba(0,88,64,0.06)] font-display text-[13px] font-semibold text-primary">
        {initials}
      </span>
      <div>
        <div className="text-[13px] font-medium leading-tight">
          {name}
          <span className="ml-2 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
            · {age}
          </span>
        </div>
        <div className="mt-1 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">{sub}</div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span
          className={`rounded-sm px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-white ${
            basic ? "bg-muted-foreground" : "bg-foreground"
          }`}
        >
          {tier}
        </span>
        <span className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">{active}</span>
      </div>
    </div>
  );
}

function InvRow({
  d,
  y,
  title,
  sub,
  amount,
  status,
  tone,
}: {
  d: string;
  y: string;
  title: string;
  sub: string;
  amount: string;
  status: string;
  tone: "paid" | "refund";
}) {
  const stStyle =
    tone === "paid"
      ? "bg-[rgba(26,125,86,0.12)] text-[var(--status-success,#1A7D56)]"
      : "bg-secondary text-muted-foreground";
  return (
    <div className="grid grid-cols-[88px_1fr_90px_100px_28px] items-center gap-3 border-b border-[var(--line-soft,#EFEDE6)] py-3 last:border-b-0">
      <div className="font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
        <b className="block font-medium text-foreground">{d}</b>
        {y}
      </div>
      <div>
        <div className="text-[13px] leading-tight">{title}</div>
        <div className="mt-0.5 font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{sub}</div>
      </div>
      <div className="text-right font-mono text-[13px] font-semibold tracking-[0.02em]">{amount}</div>
      <span className={`justify-self-start rounded-sm px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${stStyle}`}>
        {status}
      </span>
      <span className="text-center text-muted-foreground hover:text-primary">↓</span>
    </div>
  );
}

function Gauge({ label, used, unit, total, pct, meta }: { label: string; used: string; unit: string; total: string; pct: number; meta: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary p-4">
      <div className="mb-2 flex justify-between font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        <span>{label}</span>
        <span>
          {used} / {total}
        </span>
      </div>
      <div className="font-display text-[22px] font-semibold leading-none tracking-tight">
        {used}
        <span className="ml-1 font-mono text-[11px] font-medium text-muted-foreground tracking-[0.04em]">{unit}</span>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[9px] tracking-[0.04em] text-muted-foreground">
        <span>brukt</span>
        <span>{meta}</span>
      </div>
    </div>
  );
}

function PmRow({ logo, name, sub, tag, vipps }: { logo: string; name: string; sub: string; tag: string; vipps?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 rounded-md border border-border bg-secondary p-2.5">
      <span
        className={`grid h-5 w-7 place-items-center rounded-sm font-display text-[8px] font-bold tracking-[0.05em] text-white ${
          vipps ? "bg-[#FF5B24]" : "bg-foreground"
        }`}
      >
        {logo}
      </span>
      <div className="flex-1">
        <div className="font-mono text-[11px] tracking-[0.04em] text-foreground">{name}</div>
        <div className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">{sub}</div>
      </div>
      <span className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">{tag}</span>
    </div>
  );
}

function RcptLine({ name, amt }: { name: string; amt: string }) {
  return (
    <div className="flex justify-between py-1 font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
      <span>{name}</span>
      <b className="font-medium text-foreground">{amt}</b>
    </div>
  );
}
