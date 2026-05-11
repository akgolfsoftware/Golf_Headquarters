/**
 * CoachHQ — Foreldre-kommunikasjon · innboks
 * Bygd fra wireframe/design-files-v2/screens/60-coachhq-foreldre-innboks.html
 * URL: /coachhq-foreldre-innboks-demo
 */

import { Sparkles, Paperclip, Calendar, Link2 } from "lucide-react";

type FilterRow = { label: string; count?: number; active?: boolean; section?: boolean };

const filters: FilterRow[] = [
  { label: "Innboks", count: 14, active: true },
  { label: "Venter svar > 24t", count: 1 },
  { label: "Utkast", count: 3 },
  { label: "Arkiv" },
  { label: "Type", section: true },
  { label: "Framdrift / coaching", count: 8 },
  { label: "Samtykke / GDPR", count: 2 },
  { label: "Billing", count: 2 },
  { label: "Praktisk / RSVP", count: 2 },
  { label: "Spiller", section: true },
  { label: "Markus Roinås P.", count: 3 },
  { label: "Eira H.", count: 2 },
  { label: "Jonas N.", count: 1 },
  { label: "Mathilde B.", count: 2 },
  { label: "Vis alle 18" },
];

type ThreadTag = "player" | "urg" | "bill";

type Thread = {
  initials: string;
  avGrad: string;
  name: string;
  time: string;
  subject: string;
  preview: string;
  unread?: boolean;
  active?: boolean;
  tags: { kind: ThreadTag; label: string }[];
};

const threads: Thread[] = [
  {
    initials: "KN", avGrad: "from-[#3a4f5c] to-[#5a7180]",
    name: "Kari Nordby", time: "10:14",
    subject: "Bekymring for Jonas — fortsatt nedstemt",
    preview: "Hei Anders, Jonas har vært mer stille enn vanlig etter cuten i april. Vi lurer på om…",
    unread: true, active: true,
    tags: [{ kind: "player", label: "Jonas N." }, { kind: "urg", label: "venter 2 dgr" }],
  },
  {
    initials: "IP", avGrad: "from-[#7d5814] to-[#B8852A]",
    name: "Inger Pedersen", time: "09:42",
    subject: "Faktura for april — kan vi splitte i to?",
    preview: "Hei! Vi ser at april-fakturaen er på 4 800 kr. Er det mulig å dele opp i to…",
    unread: true,
    tags: [{ kind: "player", label: "Markus P." }, { kind: "bill", label: "billing" }],
  },
  {
    initials: "SH", avGrad: "from-[#005840] to-[#1A7D56]",
    name: "Stine Hopstad", time: "i går 21:08",
    subject: "Re: Eiras framdrift uke 19",
    preview: "Tusen takk for ukerapporten — Eira er kjempemotivert. Spørsmål om sommeren…",
    unread: true,
    tags: [{ kind: "player", label: "Eira H." }],
  },
  {
    initials: "EB", avGrad: "from-[#5e2b2b] to-[#B04444]",
    name: "Eivind Bjerke", time: "i går 18:30",
    subject: "RSVP Klubbmesterskap 25.05",
    preview: "Mathilde stiller. Trenger hun shuttle eller kommer hun selv?",
    tags: [{ kind: "player", label: "Mathilde B." }],
  },
  {
    initials: "TK", avGrad: "from-[#3a4f5c] to-[#5a7180]",
    name: "Tone Karlsen", time: "13.05 14:22",
    subject: "Re: Kongsberg R2 påmelding",
    preview: "Ja, vi betaler påmeldingen direkte til klubben. Sender bekreftelse.",
    tags: [{ kind: "player", label: "Sondre K." }],
  },
];

export default function CoachHqForeldreInnboksDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <header className="mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          CoachHQ · Innboks
        </span>
        <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
          Foreldre-<em className="italic text-primary">kommunikasjon.</em>
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          3 uleste tråder · 1 venter på svar over 24 t · 2 fakturaforespørsler.
        </p>
      </header>

      <div className="grid h-[760px] grid-cols-[260px_1fr_320px] items-start gap-4.5 gap-x-5">
        {/* Filters */}
        <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border bg-[var(--surface-alt,#F1EEE5)] px-4 py-3">
            <h4 className="font-display text-[13px] font-semibold tracking-tight">Filtre</h4>
            <small className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">42 åpne</small>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {filters.map((f) =>
              f.section ? (
                <div
                  key={f.label}
                  className="px-2.5 pb-1 pt-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
                >
                  {f.label}
                </div>
              ) : (
                <div
                  key={f.label}
                  className={`mb-px flex cursor-pointer items-center justify-between rounded-sm px-2.5 py-1.5 text-[13px] ${f.active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground"}`}
                >
                  <span>{f.label}</span>
                  {f.count !== undefined && (
                    <small className="font-mono text-[10px] tracking-[0.04em]">{f.count}</small>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* Thread list */}
        <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border bg-[var(--surface-alt,#F1EEE5)] px-4 py-3">
            <h4 className="font-display text-[13px] font-semibold tracking-tight">Tråder · 14</h4>
            <small className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">sorter: nyeste</small>
          </div>
          <div className="flex-1 overflow-auto">
            {threads.map((t) => (
              <ThreadRow key={t.subject} thread={t} />
            ))}
          </div>
        </div>

        {/* Reader */}
        <div className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-display text-[20px] font-semibold tracking-tight">
              Bekymring for Jonas — fortsatt nedstemt
            </h2>
            <div className="mt-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#3a4f5c] to-[#5a7180] font-display text-[12px] font-semibold text-white">
                  KN
                </div>
                <div className="text-[13px] leading-tight">
                  <b className="font-semibold">Kari Nordby</b>
                  <small className="mt-0.5 block font-mono text-[10px] tracking-[0.02em] text-muted-foreground">
                    Mor til Jonas Nordby (U16 G · GFGK)
                  </small>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button className="rounded-sm border border-border bg-transparent px-2.5 py-1 text-[11px] font-medium">
                  Arkiver
                </button>
                <button className="rounded-sm border border-border bg-transparent px-2.5 py-1 text-[11px] font-medium">
                  Marker
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 overflow-auto p-5">
            <Message
              initials="KN"
              avGrad="from-[#3a4f5c] to-[#5a7180]"
              name="Kari Nordby"
              when="12. mai · 18:42"
              body="Hei Anders. Bare en kort lapp — Jonas har vært mer stille enn vanlig etter cuten på Asker. Han har avlyst to range-økter, og snakker minst mulig om golf hjemme. Vet ikke om dette er en fase, eller om vi bør gjøre noe annet."
            />
            <Message
              me
              initials="AK"
              avGrad="from-[#005840] to-[#1A7D56]"
              name="Anders Kristiansen (deg)"
              when="13. mai · 09:14"
              body="Takk for at du melder fra Kari — det er viktig. Jeg har sett det samme i appen (lite aktivitet siste 10 dager). La meg ta en kort samtale med Jonas først, og så ringes vi to senere i uka. Stemmer det at han har skole-eksamen om to uker?"
            />
            <Message
              initials="KN"
              avGrad="from-[#3a4f5c] to-[#5a7180]"
              name="Kari Nordby"
              when="i dag · 10:14"
              body="Ja, eksamen 28.–30. mai i fire fag. Pluss at vennegjengen drar på fest 25.05 (klubbmesterskap-dato). Tror det er kombinasjonen som sliter på ham. Hvis det er noe vi som foreldre kan tilrettelegge for fram til da, si fra."
            />
          </div>

          <div className="flex flex-col gap-2.5 border-t border-border bg-[var(--surface-alt,#F1EEE5)] px-5 py-4">
            <div className="flex items-center gap-1.5">
              <div className="inline-flex cursor-pointer items-center gap-1 rounded-sm bg-foreground px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-background">
                <Sparkles size={12} strokeWidth={1.5} />
                Foreslå svar
              </div>
              <div className="inline-flex cursor-pointer items-center gap-1 rounded-sm border border-border bg-card px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                <Paperclip size={12} strokeWidth={1.5} />
                Vedlegg
              </div>
              <div className="inline-flex cursor-pointer items-center gap-1 rounded-sm border border-border bg-card px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                <Calendar size={12} strokeWidth={1.5} />
                Foreslå tid
              </div>
              <div className="inline-flex cursor-pointer items-center gap-1 rounded-sm border border-border bg-card px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                <Link2 size={12} strokeWidth={1.5} />
                Spiller-data
              </div>
            </div>
            <div className="min-h-[80px] rounded-sm border border-border bg-card p-3 text-[13px] leading-relaxed">
              <span className="mb-1.5 block font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-primary">
                Agent-utkast · klikk for å redigere
              </span>
              Tusen takk Kari. Da gjør vi følgende: jeg booker en kort 1-til-1 samtale med Jonas torsdag 16.05 (15 min, ingen agenda), og vi senker treningsvolumet til 1 økt/uke fram til 30.05 — fokus på det som gir glede, ikke teknikk. Klubbmesterskap er frivillig; han skal kjenne at det er ok å droppe det. Vi tar telefonen onsdag kveld om det passer for dere?
            </div>
            <div className="flex items-center justify-between">
              <small className="font-mono text-[10px] tracking-[0.02em] text-muted-foreground">
                Generert basert på Jonas&apos; aktivitet + bookinger · agent v2.4
              </small>
              <div className="flex gap-1.5">
                <button className="rounded-sm border border-border bg-card px-2.5 py-1 text-[11px] font-medium">
                  Lagre utkast
                </button>
                <button className="rounded-sm bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground">
                  Send svar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThreadRow({ thread: t }: { thread: Thread }) {
  const tagStyle: Record<ThreadTag, string> = {
    player: "bg-primary/10 text-primary",
    urg: "bg-[rgba(176,68,68,0.10)] text-[#A32D2D]",
    bill: "bg-[rgba(184,133,42,0.10)] text-[#7d5814]",
  };
  return (
    <div
      className={`relative flex cursor-pointer gap-3 border-b border-border px-4 py-3.5 last:border-b-0 ${t.active ? "bg-primary/10" : "hover:bg-[var(--surface-alt,#F1EEE5)]"}`}
    >
      {t.unread && (
        <span className="absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary" />
      )}
      <div className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br ${t.avGrad} font-display text-[12px] font-semibold text-white`}>
        {t.initials}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <b className={`truncate text-[13px] ${t.unread ? "font-bold" : "font-semibold"}`}>{t.name}</b>
          <span className="flex-shrink-0 font-mono text-[10px] tracking-[0.02em] text-muted-foreground">{t.time}</span>
        </div>
        <div className="truncate text-[12px] font-medium leading-tight">{t.subject}</div>
        <div className="truncate text-[11.5px] leading-relaxed text-muted-foreground">{t.preview}</div>
        <div className="mt-1 flex gap-1">
          {t.tags.map((tag) => (
            <span
              key={tag.label}
              className={`rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.04em] ${tagStyle[tag.kind]}`}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Message({
  initials,
  avGrad,
  name,
  when,
  body,
  me = false,
}: {
  initials: string;
  avGrad: string;
  name: string;
  when: string;
  body: string;
  me?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br ${avGrad} font-display text-[11px] font-semibold text-white`}>
        {initials}
      </div>
      <div className="flex-1">
        <div className="mb-1 flex justify-between font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
          <b className="font-semibold text-foreground" style={{ fontFamily: "var(--font-geist)", fontSize: 12 }}>
            {name}
          </b>
          <span>{when}</span>
        </div>
        <div className={`rounded-sm px-4 py-3.5 text-[13.5px] leading-relaxed ${me ? "bg-primary/10" : "bg-[var(--surface-alt,#F1EEE5)]"}`}>
          {body}
        </div>
      </div>
    </div>
  );
}
