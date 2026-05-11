/**
 * PILOT — Foreldreportal · Samtykke og GDPR
 * Bygd direkte fra wireframe/design-files-v2/screens/38-foreldre-samtykke.html
 * URL: /foreldre-samtykke-demo
 */

import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Download,
  FileDown,
  Flag,
  Trash2,
} from "lucide-react";

export default function ForeldreSamtykkeDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] px-8 py-10">
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Foreldreportal · Samtykke og GDPR
            </div>
            <h1 className="mt-1 font-display text-[32px] font-semibold tracking-tight leading-[1.1]">
              Samtykke{" "}
              <em className="font-normal italic text-muted-foreground">· Markus Roinås Pedersen (16)</em>
            </h1>
            <p className="mt-2 max-w-[640px] text-[13px] leading-[1.55] text-muted-foreground">
              5 av 6 scopes aktive. Hver endring krever BankID hvis scopet er sensitivt
              (helse, opptak, klubb-deling), og logges i audit-historikken.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3 py-2 text-[12px] font-medium text-foreground hover:bg-secondary">
              <FileDown className="h-3.5 w-3.5" strokeWidth={1.5} /> Last ned samtykke (PDF)
            </button>
            <button className="rounded-md border border-border bg-transparent px-3 py-2 text-[12px] font-medium text-foreground hover:bg-secondary">
              Send på e-post
            </button>
          </div>
        </div>

        {/* Warning */}
        <div className="mb-5 flex items-center gap-4 rounded-lg border border-[rgba(184,133,42,0.30)] bg-[#FFF6E0] p-4">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[#B8852A] text-white">
            <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <div className="flex-1 text-[12px] leading-[1.5] text-[#6F500B]">
            <b className="font-semibold text-[#3a2a05]">Markus' medsamtykke venter.</b> For at video- og
            helse-scopes skal være fullt gyldige (over 13 år), trenger vi at Markus signerer. Lenken er
            sendt — påminnelse går ut 12.05 09:00. Scopes er midlertidig aktive basert på forelder-signatur.
          </div>
          <button className="rounded-md border border-border bg-card px-3 py-2 text-[12px] font-medium text-foreground hover:bg-secondary">
            Send påminnelse nå
          </button>
        </div>

        <div className="grid grid-cols-12 gap-5">
          {/* Scopes column */}
          <div className="col-span-8 flex flex-col gap-2">
            <ScopeCard
              variant="req"
              title="Konto og profil"
              badge="påkrevd"
              desc="Lagre navn, klubb, alder og handicap for å kunne logge inn og se egen progresjon. Dette er nødvendig for tjenesten — kan ikke skrus av uten å avslutte kontoen."
              meta={["Lovgrunnlag: avtale (GDPR art. 6 b)", "Retention: kontoens levetid", "Ansvarlig: AK Golf HQ"]}
              actionText="aktiv siden 11.05"
              auditLink
            />
            <ScopeCard
              variant="on"
              title="Deling med coach"
              desc="Tildelt coach (Anders Kristiansen) kan se økt-notater, treningsplan, kommentarer fra coaching-board og rapporter. Hver visning logges på Markus' audit-tidslinje."
              meta={["Lovgrunnlag: samtykke (art. 6 a)", "Trekkbart: umiddelbart", "Behandlere: 1 coach", "Forelder-sig: Frode 11.05", "Spiller-sig: venter"]}
              cta="Endre coach"
              trekkLink
            />
            <ScopeCard
              variant="on"
              title="Video- og lydopptak"
              badge="sensitiv"
              badgeTone="warn"
              desc="Coach kan ta swing-video som lagres i opptaks-galleriet. Familien eier opptakene og kan slette dem når som helst. Krever BankID-signering."
              meta={["Lovgrunnlag: samtykke", "Retention: 24 mnd · auto-slettes", "Lagring: S3-Frankfurt (kryptert)", "Antall opptak: 8 stk · 142 MB"]}
              cta="Se opptak (8)"
              trekkLink="Slett alle"
            />
            <ScopeCard
              variant="on"
              title="Helse- og bevegelsesdata"
              badge="særlig kategori"
              badgeTone="warn"
              desc="Smerter, søvn, RPE og bevegelses-screening lagres for å justere belastning. Coach ser kun aggregater — ikke fritekst eller diagnoser. Krever BankID."
              meta={["Lovgrunnlag: samtykke (art. 9)", "Retention: 24 mnd", "Synlighet: aggregert til coach", "Rådata: kun spiller + forelder"]}
              cta="Se dine data"
              trekkLink
            />
            <ScopeCard
              variant="on"
              title="Deling med GFGK"
              desc="Klubbens trener-team får aggregerte resultater for landslags-utvelgelse og turnerings-oppfølging. Kun aggregert — ikke fritekst, video eller helse."
              meta={["Lovgrunnlag: samtykke", "Felles ansvar: AK Golf HQ + GFGK", "Mottakere: 4 trenere", "DPA: v3 · 2026-01"]}
              trekkLink
              dpaLink
            />
            <ScopeCard
              variant="off"
              title="Markedsføring (e-post og nyhetsbrev)"
              desc="AK Golf HQ kontakter deg om nye funksjoner, klubbtilbud og turneringer. Maks 2 e-poster i måneden. Du kan melde deg av når som helst."
              meta={["Lovgrunnlag: samtykke", "Status: avslått 12.04"]}
              actionText="av"
            />
          </div>

          {/* Right column */}
          <div className="col-span-4 flex flex-col gap-5">
            <section className="rounded-lg border border-border bg-card p-6">
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="font-display text-[14px] font-semibold tracking-tight">Signeringsstempel</h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                  v3 · 11.05.2026
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <StampCard label="Forelder" value="Frode Pedersen" sub="BankID · 14:11" />
                <StampCard
                  label="Spiller (12+)"
                  value="Venter"
                  sub="Markus · 12.05 ETA"
                  tone="warn"
                />
                <div className="col-span-2 rounded-md border border-border bg-secondary p-3">
                  <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    Hash og integritet
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                    sha-256 d9c7…42b8
                  </div>
                  <div className="mt-1 font-mono text-[10px] tracking-[0.02em] text-muted-foreground">
                    IP 84.214.x · device fingerprint OK
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-border bg-card p-6">
              <div className="mb-3 flex items-baseline justify-between">
                <h3 className="font-display text-[14px] font-semibold tracking-tight">
                  Dine rettigheter{" "}
                  <em className="font-normal italic text-muted-foreground text-[12px]">· GDPR</em>
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                  selvbetjent
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <RightRow icon={<Download className="h-3.5 w-3.5" strokeWidth={1.5} />} title="Eksporter alle data" sub="art. 15 · PDF/CSV · ETA 2 t" />
                <RightRow icon={<ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />} title="Be om retting" sub="art. 16 · skriv til DPO" />
                <RightRow icon={<Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />} title="Slett kontoen" sub="art. 17 · 30 dgr grace" tone="danger" />
                <RightRow icon={<Clock className="h-3.5 w-3.5" strokeWidth={1.5} />} title="Pause behandling" sub="art. 18 · inntil 90 dgr" />
                <RightRow icon={<Flag className="h-3.5 w-3.5" strokeWidth={1.5} />} title="Klage til Datatilsynet" sub="art. 77 · ekstern lenke" />
              </div>
            </section>
          </div>
        </div>

        {/* History */}
        <section className="mt-6 rounded-lg border border-border bg-card p-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-display text-[14px] font-semibold tracking-tight">
              Endringslogg{" "}
              <em className="font-normal italic text-muted-foreground text-[12px]">· siste 90 dgr</em>
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
              14 hendelser · nyeste først
            </span>
          </div>
          <div>
            <HistRow d="11.05.2026" t="14:11" title="Forelder signerte samtykke v3" sub="5 scopes aktivert · BankID hash d9c7…42b8 · IP 84.214.x" badge="Signert" badgeTone="sig" />
            <HistRow d="11.05.2026" t="14:09" title="Medsamtykke-lenke sendt til Markus" sub="markus@vipps.no · token gyldig 48 t" badge="Pending" badgeTone="add" />
            <HistRow d="11.05.2026" t="14:08" title="Scope «video- og lydopptak» aktivert" sub="krevde BankID · forelder bekreftet retention 24 mnd" badge="Aktivert" badgeTone="add" />
            <HistRow d="12.04.2026" t="09:22" title="Scope «markedsføring» revidert → av" sub="forelder avslo · ingen ny e-post sendes" badge="Trukket" badgeTone="rev" />
            <HistRow d="02.04.2026" t="16:50" title="DPA-v3 vist for GFGK" sub="klubb-deling reaktivert med ny avtale" badge="Aktivert" badgeTone="add" />
            <HistRow d="14.03.2026" t="11:04" title="Eksport-forespørsel ferdig" sub="art. 15 · 8,4 MB PDF + 2 CSV · sendt til frode@pedersen.no" badge="Eksport" badgeTone="sig" />
          </div>
          <a className="mt-3 inline-block font-mono text-[11px] uppercase tracking-[0.04em] text-primary underline">
            Se full historikk (14)
          </a>
        </section>
      </div>
    </div>
  );
}

function ScopeCard({
  variant,
  title,
  badge,
  badgeTone,
  desc,
  meta,
  cta,
  trekkLink,
  dpaLink,
  auditLink,
  actionText,
}: {
  variant: "on" | "off" | "req";
  title: string;
  badge?: string;
  badgeTone?: "warn";
  desc: string;
  meta: string[];
  cta?: string;
  trekkLink?: boolean | string;
  dpaLink?: boolean;
  auditLink?: boolean;
  actionText?: string;
}) {
  const wrap =
    variant === "off"
      ? "border-border bg-secondary opacity-90"
      : variant === "req"
        ? "border-border bg-card border-l-[3px] border-l-[var(--ink-disabled,#C4C0B8)]"
        : "border-border bg-card border-l-[3px] border-l-primary";

  const toggleStyle =
    variant === "off"
      ? "bg-secondary"
      : variant === "req"
        ? "bg-[var(--ink-disabled,#C4C0B8)] opacity-70"
        : "bg-primary";

  const knobLeft = variant !== "off" ? "left-[18px]" : "left-[2px]";

  return (
    <div className={`grid grid-cols-[auto_1fr_auto] items-start gap-4 rounded-lg border p-4 ${wrap}`}>
      <div className={`relative mt-0.5 h-[22px] w-[38px] rounded-full border-[1.5px] border-border ${toggleStyle}`}>
        <span className={`absolute top-[1px] ${knobLeft} h-4 w-4 rounded-full border border-border bg-white`} />
      </div>
      <div>
        <div className="mb-1 flex items-center gap-2 text-[14px] font-medium leading-tight text-foreground">
          {title}
          {badge && (
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                badgeTone === "warn"
                  ? "bg-[#FFF0D6] text-[#B8852A]"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
        <div className="max-w-[600px] text-[12px] leading-[1.55] text-muted-foreground">{desc}</div>
        <div className="mt-2 flex flex-wrap gap-3 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
          {meta.map((m, i) => (
            <span key={i}>{i > 0 ? "· " : ""}{m}</span>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        {cta && (
          <button className="rounded-md border border-border bg-card px-3 py-2 text-[12px] font-medium text-foreground hover:bg-secondary">
            {cta}
          </button>
        )}
        {dpaLink && (
          <a className="font-mono text-[11px] tracking-[0.04em] text-primary underline">Se DPA</a>
        )}
        {trekkLink && (
          <a className="font-mono text-[11px] tracking-[0.04em] text-primary underline">
            {typeof trekkLink === "string" ? trekkLink : "Trekk"}
          </a>
        )}
        {auditLink && (
          <a className="font-mono text-[11px] tracking-[0.04em] text-primary underline">Audit-rad</a>
        )}
        {actionText && (
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
              actionText === "av"
                ? "bg-secondary text-muted-foreground"
                : "bg-[rgba(26,125,86,0.12)] text-[var(--status-success,#1A7D56)]"
            }`}
          >
            {actionText}
          </span>
        )}
      </div>
    </div>
  );
}

function StampCard({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "warn" }) {
  return (
    <div className={`rounded-md border p-3 ${tone === "warn" ? "border-[rgba(184,133,42,0.30)] bg-[#FFF6E0]" : "border-border bg-secondary"}`}>
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className={`mt-1.5 font-mono text-[13px] ${tone === "warn" ? "text-[#B8852A]" : "text-foreground"}`}>
        {value}
      </div>
      <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function RightRow({
  icon,
  title,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  tone?: "danger";
}) {
  return (
    <div className="flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card p-3 hover:border-primary">
      <span
        className={`grid h-8 w-8 place-items-center rounded-md ${
          tone === "danger"
            ? "bg-[rgba(163,45,45,0.10)] text-destructive"
            : "bg-[rgba(0,88,64,0.06)] text-primary"
        }`}
      >
        {icon}
      </span>
      <div className="flex-1">
        <div className={`text-[13px] font-medium leading-tight ${tone === "danger" ? "text-destructive" : "text-foreground"}`}>
          {title}
        </div>
        <div className="mt-1 font-mono text-[11px] tracking-[0.02em] text-muted-foreground">{sub}</div>
      </div>
      <span className="self-center text-muted-foreground">→</span>
    </div>
  );
}

function HistRow({
  d,
  t,
  title,
  sub,
  badge,
  badgeTone,
}: {
  d: string;
  t: string;
  title: string;
  sub: string;
  badge: string;
  badgeTone: "add" | "rev" | "sig";
}) {
  const badgeStyle =
    badgeTone === "add"
      ? "bg-[rgba(26,125,86,0.12)] text-[var(--status-success,#1A7D56)]"
      : badgeTone === "rev"
        ? "bg-[rgba(163,45,45,0.10)] text-destructive"
        : "bg-[rgba(0,88,64,0.06)] text-primary";
  return (
    <div className="grid grid-cols-[80px_1fr_auto] items-start gap-3 border-b border-[var(--line-soft,#EFEDE6)] py-3 last:border-b-0">
      <div className="font-mono text-[11px] tracking-[0.02em] text-muted-foreground">
        <b className="block font-medium text-foreground">{d}</b>
        {t}
      </div>
      <div>
        <div className="text-[12px] leading-tight text-foreground">{title}</div>
        <div className="mt-1 font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{sub}</div>
      </div>
      <span className={`rounded-sm px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] ${badgeStyle}`}>
        {badge}
      </span>
    </div>
  );
}
