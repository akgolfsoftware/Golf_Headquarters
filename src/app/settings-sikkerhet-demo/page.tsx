/**
 * PILOT — Settings · Sikkerhet
 * Bygd direkte fra wireframe/design-files-v2/screens/13-settings-sikkerhet.html
 * URL: /settings-sikkerhet-demo
 *
 * Én produksjonsskjerm: 2FA aktiv, 3 aktive økter, login-historikk siste 7 dager.
 */

import { Check, Monitor, Smartphone, Tablet } from "lucide-react";

export default function SettingsSikkerhetDemo() {
  return (
    <div className="min-h-screen bg-background px-10 py-10 text-foreground">
      <div className="mx-auto max-w-[1100px]">
        <header className="mb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            Innstillinger · Sikkerhet
          </div>
          <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
            Hvem er <em className="font-normal italic">logget inn</em> akkurat nå?
          </h1>
          <p className="mt-3 max-w-[640px] text-[14px] text-muted-foreground">
            Kontoen din virker grei. Sjekk likevel listen — første gang du ser en rar IP er ofte siste sjanse.
          </p>
        </header>

        <div className="grid grid-cols-[200px_1fr] gap-8">
          <aside>
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Innstillinger
            </div>
            <nav className="flex flex-col">
              {[
                { label: "Profil" },
                { label: "Bruker" },
                { label: "Sikkerhet", active: true },
                { label: "Varsler" },
                { label: "API", count: 3 },
              ].map((item) => (
                <button
                  key={item.label}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-[13px] transition-colors ${
                    item.active
                      ? "bg-secondary font-medium text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.count != null && (
                    <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex flex-col gap-8">
            {/* Oversikt */}
            <Section title="Oversikt">
              <div className="grid grid-cols-2 gap-4 p-5">
                <MiniStat label="Score" value="82" unit="/ 100" sub="2FA aktiv, sterkt passord, ikke verifisert e-post" />
                <MiniStat label="Aktive økter" value="3" unit="enheter" sub="macOS, iOS, iPad — alle dine" />
              </div>
            </Section>

            {/* 2FA */}
            <Section title="To-faktor" aux="Aktiv via SMS">
              <FieldRow
                label="SMS-kode"
                value={
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#E5F1EA] px-2.5 py-1 text-[11px] font-medium text-[#1A7D56]">
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                    Aktiv · +47 ••• ••• 67
                  </span>
                }
                action="Endre"
              />
              <FieldRow
                label="Authenticator-app"
                hint="Anbefalt — Authy, 1Password"
                value={<span className="text-muted-foreground">Ikke konfigurert</span>}
                action="Sett opp"
              />
              <FieldRow
                label="Sikkerhetsnøkkel"
                hint="YubiKey, fysiske USB-nøkler"
                value={<span className="text-muted-foreground">Ikke konfigurert</span>}
                action="Legg til"
              />
              <FieldRow
                label="Recovery-koder"
                hint="10 engangskoder — sist generert 14. mars"
                value={
                  <div className="grid w-full max-w-[380px] grid-cols-2 gap-2 font-mono text-[13px]">
                    {[
                      { idx: "01", code: "K4P9-X2RM" },
                      { idx: "02", code: "9HQT-N7DV" },
                      { idx: "03", code: "R3W5-MJ8B", used: true },
                      { idx: "04", code: "2X8F-PCQK" },
                      { idx: "05", code: "L7VN-K4HW" },
                      { idx: "06", code: "3MZP-T9XB" },
                    ].map((r) => (
                      <span
                        key={r.idx}
                        className={`inline-flex items-center gap-2 rounded-sm border border-border bg-card px-2.5 py-1.5 ${
                          r.used ? "text-muted-foreground line-through" : "text-foreground"
                        }`}
                      >
                        <span className="text-[10px] text-muted-foreground">{r.idx}</span>
                        {r.code}
                      </span>
                    ))}
                  </div>
                }
                action="Regenerer"
              />
            </Section>

            {/* Aktive økter */}
            <Section
              title="Aktive økter"
              aux="3 enheter er logget inn akkurat nå"
              right={
                <button className="rounded-md border border-[#A32D2D]/30 px-3 py-1.5 text-[12px] font-medium text-[#A32D2D] hover:bg-[#A32D2D]/10">
                  Logg ut alle andre
                </button>
              }
            >
              <SessionRow
                icon={<Monitor className="h-4 w-4" strokeWidth={1.5} />}
                title="MacBook Pro · Safari 17"
                tag="Denne enheten"
                meta="macOS 14.5 · Oslo, NO · 84.215.142.018"
                statusTop="● Aktiv nå"
                statusBottom="Sist innlogg 09:14"
                current
              />
              <SessionRow
                icon={<Smartphone className="h-4 w-4" strokeWidth={1.5} />}
                title="iPhone 15 · CoachHQ-app"
                meta="iOS 17.4 · Oslo, NO · 84.215.142.018"
                statusTop="Aktiv 14 min siden"
                statusBottom="Innlogget 12. mai"
              />
              <SessionRow
                icon={<Tablet className="h-4 w-4" strokeWidth={1.5} />}
                title="iPad Pro · Safari"
                meta="iPadOS 17.4 · Bærum, NO · 178.232.014.092"
                statusTop="Aktiv 4 dager siden"
                statusTopWarn
                statusBottom="Innlogget 28. april"
              />
            </Section>

            {/* Historikk */}
            <Section title="Innloggings-historikk" aux="Siste 7 dager">
              <div className="font-mono text-[12px]">
                <HistRow time="14. mai · 09:14" ip="84.215.142.018" loc="Oslo, NO" status="ok" />
                <HistRow time="13. mai · 21:42" ip="84.215.142.018" loc="Oslo, NO" status="ok" />
                <HistRow time="12. mai · 08:31" ip="178.232.014.092" loc="Bærum, NO" status="ok" />
                <HistRow time="11. mai · 19:08" ip="192.168.043.122" loc="Trondheim, NO" status="fail" />
                <HistRow time="10. mai · 14:55" ip="84.215.142.018" loc="Oslo, NO" status="ok" />
                <HistRow time="08. mai · 11:02" ip="84.215.142.018" loc="Oslo, NO" status="ok" />
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  aux,
  right,
  children,
}: {
  title: string;
  aux?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="flex items-center gap-3 border-b border-border px-6 py-4">
        <h2 className="font-display text-[18px] font-semibold tracking-tight">{title}</h2>
        {aux && <span className="text-[12px] text-muted-foreground">{aux}</span>}
        {right && <div className="ml-auto">{right}</div>}
      </header>
      <div className="divide-y divide-border">{children}</div>
    </section>
  );
}

function MiniStat({ label, value, unit, sub }: { label: string; value: string; unit: string; sub: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 p-5">
      <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-2 font-display text-[30px] font-semibold tracking-tight">
        {value}
        <span className="font-mono text-[12px] font-normal text-muted-foreground">{unit}</span>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function FieldRow({
  label,
  hint,
  value,
  action,
}: {
  label: string;
  hint?: string;
  value: React.ReactNode;
  action?: string;
}) {
  return (
    <div className="grid grid-cols-[200px_1fr_auto] items-start gap-4 px-6 py-3.5">
      <div>
        <div className="text-[13px] text-muted-foreground">{label}</div>
        {hint && <div className="mt-0.5 text-[11px] text-muted-foreground/80">{hint}</div>}
      </div>
      <div className="text-[14px] text-foreground">{value}</div>
      {action && (
        <button className="text-[12px] font-medium text-primary hover:underline">{action} →</button>
      )}
    </div>
  );
}

function SessionRow({
  icon,
  title,
  tag,
  meta,
  statusTop,
  statusBottom,
  statusTopWarn,
  current,
}: {
  icon: React.ReactNode;
  title: string;
  tag?: string;
  meta: string;
  statusTop: string;
  statusBottom: string;
  statusTopWarn?: boolean;
  current?: boolean;
}) {
  return (
    <div className="grid grid-cols-[32px_1fr_auto_auto] items-center gap-4 px-6 py-4">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-md ${
          current ? "bg-accent/30 text-primary" : "bg-secondary text-muted-foreground"
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[14px] font-medium text-foreground">
          {title}
          {tag && (
            <span className="rounded-sm bg-accent/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.04em] font-semibold text-[#0A1F18]">
              {tag}
            </span>
          )}
        </div>
        <div className="font-mono text-[12px] text-muted-foreground">{meta}</div>
      </div>
      <div className="text-right font-mono text-[11px] leading-snug">
        <div className={current ? "font-semibold text-primary" : statusTopWarn ? "text-[#B8852A]" : "text-muted-foreground"}>
          {statusTop}
        </div>
        <div className="text-muted-foreground">{statusBottom}</div>
      </div>
      {current ? (
        <span className="w-16 text-center text-[12px] text-muted-foreground/40">—</span>
      ) : (
        <button className="text-[12px] font-medium text-foreground hover:underline">Logg ut →</button>
      )}
    </div>
  );
}

function HistRow({
  time,
  ip,
  loc,
  status,
}: {
  time: string;
  ip: string;
  loc: string;
  status: "ok" | "fail";
}) {
  return (
    <div className="grid grid-cols-[140px_1fr_130px_110px] items-center gap-4 px-6 py-2.5 border-t border-border first:border-t-0">
      <span className="text-muted-foreground">{time}</span>
      <span className="text-foreground">{ip}</span>
      <span className="text-muted-foreground">{loc}</span>
      <span
        className={`inline-flex items-center gap-1.5 self-start rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] ${
          status === "ok" ? "bg-[#E5F1EA] text-[#1A7D56]" : "bg-[#FCEBEB] text-[#A32D2D]"
        }`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {status === "ok" ? "OK" : "Feilet 2FA"}
      </span>
    </div>
  );
}
