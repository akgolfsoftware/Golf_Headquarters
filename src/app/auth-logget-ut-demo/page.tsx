/**
 * PILOT — Auth · Logget ut (øktsammendrag + gjenta-login)
 * Bygd direkte fra wireframe/design-files-v2/screens/66-auth-logget-ut.html
 * URL: /auth-logget-ut-demo
 *
 * Anti-state-katalog: én produksjonsskjerm — sluttkort etter logout
 * med sesjons-sammendrag og siste fane-tråder.
 */

import { LogOut, ArrowRight } from "lucide-react";

export default function AuthLoggetUtDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-[680px]">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-12 text-center shadow-xl">
            {/* Top-stripe */}
            <span className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />

            {/* Icon */}
            <div className="relative mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/8 text-primary">
              <span
                className="absolute -inset-2 rounded-full border border-dashed border-primary/30"
                aria-hidden
              />
              <LogOut size={28} strokeWidth={1.5} />
            </div>

            <h1 className="font-display text-[30px] font-medium leading-tight tracking-tight text-foreground">
              Du er <em className="italic text-primary">trygt logget ut</em>.
            </h1>
            <p className="mx-auto mt-3 max-w-[480px] text-[14.5px] leading-[1.6] text-muted-foreground">
              Alle aktive sesjoner er avsluttet, og data lokalt på denne
              enheten er ryddet. Vi sees igjen — appen husker hvor du var.
            </p>

            {/* Summary */}
            <div className="mt-7 grid grid-cols-2 gap-4 rounded-xl bg-background p-5 text-left">
              <SumCol label="Du var innlogget som">
                Anders Kristiansen
                <small className="mt-0.5 block font-mono text-[10.5px] font-normal tracking-[0.02em] text-muted-foreground">
                  akgolfgroup@gmail.com · coach @ GFGK · Pro
                </small>
              </SumCol>
              <SumCol label="Økt-varighet">
                47 min · 22 sek
                <small className="mt-0.5 block font-mono text-[10.5px] font-normal tracking-[0.02em] text-muted-foreground">
                  11.05.2026 · 09:01 – 09:48
                </small>
              </SumCol>
              <SumCol label="Endringer denne økten">
                12 oppdateringer
                <small className="mt-0.5 block font-mono text-[10.5px] font-normal tracking-[0.02em] text-muted-foreground">
                  3 sesjons-notater · 1 mål-status · 8 video-tags
                </small>
              </SumCol>
              <SumCol label="Auto-redirect">
                Til /auth/login om{" "}
                <b className="font-mono font-semibold tracking-[0.04em] text-primary">
                  0:27
                </b>
                <small className="mt-0.5 block font-mono text-[10.5px] font-normal tracking-[0.02em] text-muted-foreground">
                  eller klikk «Logg inn igjen» under
                </small>
              </SumCol>
              <div className="col-span-2 border-t border-border pt-3">
                <span className="block font-mono text-[9.5px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  Sikkerhet
                </span>
                <span className="mt-1.5 block text-[12.5px] leading-[1.6] text-muted-foreground">
                  Refresh-token revokert · device-cookie slettet ·
                  siste-aktivitet-stempel logget på sikkerhetsoversikten. Tar
                  du opp samme nettleser senere, må du logge inn på nytt.
                </span>
              </div>
            </div>

            {/* Login-again CTA */}
            <div className="mt-5 flex items-center justify-between rounded-xl bg-gradient-to-br from-[#0A3C2F] to-[#1A1916] p-5 text-left text-white">
              <div>
                <b className="block font-display text-[16px] font-medium tracking-tight text-white">
                  Var du midt i noe?
                </b>
                <small className="mt-0.5 block font-mono text-[10.5px] tracking-[0.02em] text-white/55">
                  3 fane-tråder kan gjenåpnes når du logger inn igjen.
                </small>
              </div>
              <button className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-[13px] font-semibold text-accent-foreground transition-opacity hover:opacity-90">
                Logg inn igjen
                <ArrowRight size={14} strokeWidth={1.5} />
              </button>
            </div>

            {/* Recent threads */}
            <div className="mt-6 border-t border-border pt-5 text-left">
              <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Siste åpne fane-tråder · gjenåpnes ved neste login
              </div>
              <div className="flex flex-col gap-1.5">
                <RecentItem
                  initials="CB"
                  title="Coaching Board · Markus R. P."
                  detail="uke 19 · sesjons-plan og video-review"
                  when="aktiv i 22m"
                />
                <RecentItem
                  initials="IN"
                  title="Innboks · Kari Nordby"
                  detail="tråd om Jonas — utkast lagret"
                  when="aktiv i 8m"
                />
                <RecentItem
                  initials="RP"
                  title="Coach-rapport · mai 2026"
                  detail="utkast for styre-utsendelse"
                  when="aktiv i 6m"
                />
              </div>
            </div>

            {/* Quick actions */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
                Bytt konto
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
                Tilbake til akgolf.no
              </button>
            </div>
          </div>

          {/* Footer-meta */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5 font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
            <span>
              <b className="font-semibold uppercase tracking-[0.06em] text-foreground">
                G · Auth &amp; før-login — fullført
              </b>{" "}
              · 62 logg inn · 63 reset · 64 BankID · 65 organisasjon · 66
              logget ut
            </span>
            <span>9-G/5 av 5 · skjerm 66 av 66 · prototype komplett</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SumCol({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <span className="text-[13.5px] font-medium text-foreground">
        {children}
      </span>
    </div>
  );
}

function RecentItem({
  initials,
  title,
  detail,
  when,
}: {
  initials: string;
  title: string;
  detail: string;
  when: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-md bg-background p-3 text-[13px]">
      <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-md border border-border bg-card font-mono text-[10px] font-bold tracking-[0.04em] text-primary">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <b className="block font-semibold text-foreground">{title}</b>
        <small className="mt-0.5 block font-mono text-[10.5px] tracking-[0.02em] text-muted-foreground">
          {detail}
        </small>
      </div>
      <div className="flex-shrink-0 font-mono text-[10.5px] tracking-[0.02em] text-muted-foreground">
        {when}
      </div>
    </div>
  );
}
