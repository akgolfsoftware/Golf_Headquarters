/**
 * PILOT — Foreldreportal · Varsler og preferanser
 * Bygd direkte fra wireframe/design-files-v2/screens/39-foreldre-varsler.html
 * URL: /foreldre-varsler-demo
 */

import {
  CheckCircle2,
  CreditCard,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Smartphone,
  Trophy,
  AlertTriangle,
  Check,
} from "lucide-react";

export default function ForeldreVarslerDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] px-8 py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Foreldreportal · Varsler og preferanser
            </div>
            <h1 className="mt-1 font-display text-[32px] font-semibold tracking-tight leading-[1.1]">
              Varsler{" "}
              <em className="font-normal italic text-muted-foreground">· Markus Roinås Pedersen</em>
            </h1>
            <p className="mt-2 max-w-[640px] text-[13px] leading-[1.55] text-muted-foreground">
              Skader og kritiske helse-flagg leveres alltid — du kan ikke skru disse av.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-md border border-border bg-transparent px-3 py-2 text-[12px] font-medium hover:bg-secondary">
              Test-varsel
            </button>
            <button className="rounded-md border border-border bg-transparent px-3 py-2 text-[12px] font-medium hover:bg-secondary">
              Tilbakestill
            </button>
          </div>
        </div>

        {/* Channels */}
        <div className="mb-5 grid grid-cols-4 gap-3">
          <ChanCard icon={<Mail className="h-4 w-4" strokeWidth={1.5} />} name="E-post" sub="frode@pedersen.no" sent="22" delivered="100 %" on />
          <ChanCard icon={<Smartphone className="h-4 w-4" strokeWidth={1.5} />} name="Push (mobil)" sub="iPhone 15 · iOS 18.2" sent="18" delivered="94 %" on />
          <ChanCard icon={<Phone className="h-4 w-4" strokeWidth={1.5} />} name="SMS" sub="+47 905 xx xxx" sent="7" delivered="kun kritisk" warn on />
          <ChanCard icon={<MessageCircle className="h-4 w-4" strokeWidth={1.5} />} name="WhatsApp" sub="ikke koblet" sent="—" delivered="Koble til via QR" warn />
        </div>

        {/* Event matrix */}
        <section className="mb-5 rounded-lg border border-border bg-card">
          <div className="flex items-baseline justify-between px-6 py-4">
            <h3 className="font-display text-[14px] font-semibold tracking-tight">Hendelsesmatrise</h3>
            <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
              7 kategorier · 4 kanaler · frekvens
            </span>
          </div>
          <div className="overflow-hidden rounded-md border-t border-border">
            <div className="grid grid-cols-[1fr_70px_70px_70px_70px_110px] items-center bg-secondary px-6 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              <span>Kategori</span>
              <span className="text-center">E-post</span>
              <span className="text-center">Push</span>
              <span className="text-center">SMS</span>
              <span className="text-center">In-app</span>
              <span className="text-right">Frekvens</span>
            </div>
            <MatrixRow
              name="Skade- og smerte-flagg"
              tag="kritisk"
              tagTone="crit"
              desc="RPE >8 i to økter på rad, smerte >6, fysio-anbefaling"
              channels={[1, 1, 1, 1]}
              locked
              freq="umiddelbart"
            />
            <MatrixRow
              name="Samtykke- og tilgangsendringer"
              tag="påkrevd"
              tagTone="req"
              desc="Ny coach, scope endret, DPA oppdatert, ny enhet"
              channels={[1, 1, 0, 1]}
              freq="umiddelbart"
            />
            <MatrixRow
              name="Treningsplan oppdatert"
              desc="Ny uke- eller blokk-plan publisert"
              channels={[1, 1, 0, 1]}
              freq="daglig digest"
            />
            <MatrixRow
              name="Ukerapport klar"
              desc="Sammendrag av økter, fremgang og fokus"
              channels={[1, 0, 0, 1]}
              freq="søn 18:00"
            />
            <MatrixRow
              name="Resultat fra turnering"
              desc="Score, plassering, høydepunkter"
              channels={[1, 1, 1, 1]}
              freq="umiddelbart"
            />
            <MatrixRow
              name="Klubb og turneringsmeldinger"
              desc="RSVP, lagoppstilling, oppmøtebekreftelser"
              channels={[1, 1, 0, 1]}
              freq="umiddelbart"
            />
            <MatrixRow
              name="Faktura og betalinger"
              desc="Faktura tilgjengelig, mislykket betaling, fornyelse"
              channels={[1, 0, 1, 0]}
              freq="umiddelbart"
            />
          </div>
        </section>

        {/* Quiet + digest */}
        <div className="grid grid-cols-[2fr_1fr] gap-5">
          <section className="rounded-lg border border-border bg-card p-6">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="font-display text-[14px] font-semibold tracking-tight">Stille tider</h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                push og SMS pauses · e-post leveres alltid
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-foreground px-3 py-1.5 font-mono text-[13px] font-semibold tracking-[0.04em] text-background">
                21:30
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="rounded-md bg-foreground px-3 py-1.5 font-mono text-[13px] font-semibold tracking-[0.04em] text-background">
                07:00
              </span>
              <span className="font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
                man – søn · Europe/Oslo
              </span>
              <button className="ml-auto rounded-md border border-border bg-transparent px-3 py-2 text-[12px] font-medium hover:bg-secondary">
                Endre
              </button>
            </div>
            <div className="mt-4 h-8 rounded-md border border-border bg-secondary" />
            <div className="mt-5 border-t border-[var(--line-soft,#EFEDE6)] pt-3 text-[12px] leading-[1.7] text-muted-foreground">
              <div>Skade- og helse-varsler bryter alltid gjennom</div>
              <div>Varsler i stille tid samles til én push neste morgen kl 07:00</div>
              <div>Helg-regel: lørdag og søndag stille tid fra kl 22:30</div>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-3 font-display text-[14px] font-semibold tracking-tight">Digest-frekvens</h3>
            <p className="mb-4 text-[12px] leading-[1.5] text-muted-foreground">
              Sammendrag fremfor enkeltvarsler?
            </p>
            <DigestOpt label="Umiddelbart" meta="~ 22/uke" />
            <DigestOpt label="Daglig digest" meta="19:00 · 7/uke" selected />
            <DigestOpt label="Ukentlig digest" meta="søn 18:00" />
            <DigestOpt label="Kun kritisk" meta="~ 2/uke" />
          </section>
        </div>

        {/* Activity log */}
        <section className="mt-5 rounded-lg border border-border bg-card p-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-display text-[14px] font-semibold tracking-tight">
              Sist leverte varsler{" "}
              <em className="font-normal italic text-muted-foreground text-[12px]">· 7 dgr</em>
            </h3>
            <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
              12 sendt · 98,2 % lest · audit-bevis
            </span>
          </div>
          <ActRow
            tone="warn"
            icon={<AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />}
            title="Markus rapporterte RPE 8 — coach varslet"
            sub="skade-flagg · auto-eskalert · åpnet 14:36"
            channel="Push + SMS"
            channelTone="warn"
            when="14:18 i dag"
          />
          <ActRow
            icon={<CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />}
            title="Anders publiserte «Pre-camp uke 19»"
            sub="i daglig digest · åpnet 19:04"
            channel="E-post"
            when="19:00 i går"
          />
          <ActRow
            tone="ok"
            icon={<Trophy className="h-3.5 w-3.5" strokeWidth={1.5} />}
            title="Resultat: 72 brutto, par · 4. plass — Borre Open R1"
            sub="åpnet 17:14 · delt med Frode 17:16"
            channel="Push"
            when="17:12 09.05"
          />
          <ActRow
            icon={<ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />}
            title="Ny coach tildelt — samtykke krevdes og ble signert"
            sub="BankID · 1 påminnelse · åpnet 11:02"
            channel="E-post + In-app"
            when="10:45 07.05"
          />
          <ActRow
            icon={<CreditCard className="h-3.5 w-3.5" strokeWidth={1.5} />}
            title="Månedsfaktura mai klar · 300 kr"
            sub="autotrekk Visa **4242 den 14.05 · åpnet 08:21"
            channel="E-post + SMS"
            when="08:00 06.05"
          />
        </section>
      </div>
    </div>
  );
}

function ChanCard({
  icon,
  name,
  sub,
  sent,
  delivered,
  on,
  warn,
}: {
  icon: React.ReactNode;
  name: string;
  sub: string;
  sent: string;
  delivered: string;
  on?: boolean;
  warn?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-2.5 rounded-lg border p-4 ${on ? "border-l-[3px] border-l-primary bg-card" : "bg-secondary opacity-80"}`}>
      <div className="flex items-center gap-2.5">
        <span
          className={`grid h-8 w-8 place-items-center rounded-md ${
            on ? "bg-[rgba(0,88,64,0.06)] text-primary" : "bg-secondary text-muted-foreground"
          }`}
        >
          {icon}
        </span>
        <div className="flex-1">
          <div className={`text-[13px] font-semibold ${on ? "text-foreground" : "text-muted-foreground"}`}>{name}</div>
          <div className="mt-0.5 font-mono text-[10px] tracking-[0.04em] text-muted-foreground">{sub}</div>
        </div>
        <span className={`relative inline-block h-5 w-9 rounded-full border-[1.5px] border-border ${on ? "bg-primary" : "bg-secondary"}`}>
          <span className={`absolute top-[1px] h-3.5 w-3.5 rounded-full border border-border bg-white ${on ? "left-[16px]" : "left-[1px]"}`} />
        </span>
      </div>
      <div className={`flex items-center justify-between border-t border-[var(--line-soft,#EFEDE6)] pt-2 font-mono text-[10px] tracking-[0.04em] ${warn ? "text-[#B8852A]" : "text-muted-foreground"}`}>
        <span>Sendt 30d: <b className="font-medium text-foreground">{sent}</b></span>
        <span>{delivered}</span>
      </div>
    </div>
  );
}

function MatrixRow({
  name,
  tag,
  tagTone,
  desc,
  channels,
  locked,
  freq,
}: {
  name: string;
  tag?: string;
  tagTone?: "crit" | "req";
  desc: string;
  channels: number[];
  locked?: boolean;
  freq: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_70px_70px_70px_70px_110px] items-center border-b border-[var(--line-soft,#EFEDE6)] px-6 py-3 last:border-b-0">
      <div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-foreground">
          {name}
          {tag && (
            <span
              className={`rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] ${
                tagTone === "crit"
                  ? "bg-[rgba(163,45,45,0.10)] text-destructive"
                  : "bg-foreground text-background"
              }`}
            >
              {tag}
            </span>
          )}
        </div>
        <div className="mt-0.5 font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{desc}</div>
      </div>
      {channels.map((c, i) => (
        <div key={i} className="flex justify-center">
          <span
            className={`grid h-5 w-5 place-items-center rounded-sm border-[1.5px] ${
              c === 1
                ? locked
                  ? "border-[var(--ink-disabled,#C4C0B8)] bg-[var(--ink-disabled,#C4C0B8)] text-white opacity-65"
                  : "border-primary bg-primary text-white"
                : "border-border bg-white"
            }`}
          >
            {c === 1 && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
          </span>
        </div>
      ))}
      <div className="text-right font-mono text-[11px] tracking-[0.04em] text-muted-foreground">{freq}</div>
    </div>
  );
}

function DigestOpt({ label, meta, selected }: { label: string; meta: string; selected?: boolean }) {
  return (
    <div
      className={`mb-2 flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 ${
        selected ? "border-primary bg-[rgba(0,88,64,0.06)]" : "border-border bg-card"
      }`}
    >
      <span className={`relative inline-block h-3.5 w-3.5 rounded-full border-[1.5px] ${selected ? "border-primary" : "border-border"}`}>
        {selected && <span className="absolute inset-[2px] rounded-full bg-primary" />}
      </span>
      <span className="text-[12px] font-medium text-foreground">{label}</span>
      <span className="ml-auto font-mono text-[10px] tracking-[0.04em] text-muted-foreground">{meta}</span>
    </div>
  );
}

function ActRow({
  tone,
  icon,
  title,
  sub,
  channel,
  channelTone,
  when,
}: {
  tone?: "warn" | "ok";
  icon: React.ReactNode;
  title: string;
  sub: string;
  channel: string;
  channelTone?: "warn";
  when: string;
}) {
  const iconStyle =
    tone === "warn"
      ? "bg-[#FFF0D6] text-[#B8852A]"
      : tone === "ok"
        ? "bg-[rgba(26,125,86,0.12)] text-[var(--status-success,#1A7D56)]"
        : "bg-[rgba(0,88,64,0.06)] text-primary";
  return (
    <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 border-b border-[var(--line-soft,#EFEDE6)] py-3 last:border-b-0">
      <span className={`grid h-7 w-7 place-items-center rounded-md ${iconStyle}`}>{icon}</span>
      <div>
        <div className="text-[13px] leading-tight text-foreground">{title}</div>
        <div className="mt-1 font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{sub}</div>
      </div>
      <span
        className={`rounded-sm px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] ${
          channelTone === "warn" ? "bg-[#FFF0D6] text-[#B8852A]" : "bg-secondary text-muted-foreground"
        }`}
      >
        {channel}
      </span>
      <span className="min-w-[60px] text-right font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{when}</span>
    </div>
  );
}
