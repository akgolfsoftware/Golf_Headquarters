/**
 * PILOT — PlayerHQ Ny melding til coach
 * Bygd direkte fra wireframe/design-files-v2/playerhq-C/08-coach-melding.html
 * URL: /coach-melding-demo
 *
 * Mock-data for Markus Roinaas Pedersen → coach Anders Kristiansen.
 */

import {
  ArrowLeft,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Paperclip,
  Smile,
  Send,
  X,
  ChevronUp,
  Calendar as CalIcon,
} from "lucide-react";

export default function CoachMeldingDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[860px] px-6 py-8">
        {/* Header */}
        <header className="mb-7 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Tilbake
            </button>
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                /min/coach/melding/ny
              </span>
              <h1 className="mt-1 font-display text-[24px] font-semibold leading-tight -tracking-[0.01em]">
                Ny melding til <em className="font-medium italic">Anders K.</em>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-border bg-card px-3 py-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#3A5BB0] text-[11px] font-semibold text-white">
              AK
            </div>
            <div className="text-[12.5px] leading-tight">
              <div className="font-semibold">Anders K.</div>
              <div className="text-[11px] text-muted-foreground">
                Svarer typisk innen 4 t
              </div>
            </div>
            <span className="h-2 w-2 rounded-full bg-[#1A7D56]" />
            <span className="text-[11px] font-semibold text-[#1A7D56]">
              Online
            </span>
          </div>
        </header>

        {/* Mottaker-bar */}
        <div className="mb-5 flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#3A5BB0] text-[13px] font-semibold text-white">
            AK
          </div>
          <div className="flex-1">
            <div className="text-[13.5px] font-semibold">
              Anders Kristiansen{" "}
              <span className="font-normal text-[12px] text-muted-foreground">
                — Hovedcoach
              </span>
            </div>
            <div className="text-[12px] text-muted-foreground">
              Tilgjengelig nå · Sist svart 14 min siden
            </div>
          </div>
          <a
            href="#"
            className="text-[13px] font-semibold text-primary hover:underline"
          >
            Coach-profil →
          </a>
        </div>

        {/* Emne */}
        <div className="mb-4">
          <input
            className="w-full rounded-md border border-input bg-card px-4 py-3 text-[15px] font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            defaultValue="Høyre-misser fra 100 m"
            placeholder="Emne (valgfritt)"
          />
          <div className="mt-1 text-[11.5px] text-muted-foreground">
            Hjelper Anders prioritere — kan stå tomt.
          </div>
        </div>

        {/* Toolbar + textarea */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="flex items-center gap-0.5 border-b border-border bg-secondary px-3 py-2">
            <TBBtn label="Bold" active>
              <span className="font-bold">B</span>
            </TBBtn>
            <TBBtn label="Italic" active>
              <span className="italic">I</span>
            </TBBtn>
            <Sep />
            <TBBtn label="Liste" active>
              <List className="h-4 w-4" />
            </TBBtn>
            <TBBtn label="Nummerert liste">
              <span className="font-mono text-[12px]">1.</span>
            </TBBtn>
            <Sep />
            <TBBtn label="Lenke">
              <LinkIcon className="h-4 w-4" />
            </TBBtn>
            <TBBtn label="Bilde">
              <ImageIcon className="h-4 w-4" />
            </TBBtn>
            <TBBtn label="Video">
              <Video className="h-4 w-4" />
            </TBBtn>
            <TBBtn label="Vedlegg">
              <Paperclip className="h-4 w-4" />
            </TBBtn>
            <TBBtn label="Emoji">
              <Smile className="h-4 w-4" />
            </TBBtn>
            <span className="ml-auto font-mono text-[11px] text-muted-foreground">
              Markdown støttet
            </span>
          </div>
          <div className="px-5 py-4 text-[14.5px] leading-[1.6] text-foreground min-h-[220px]">
            <p>Hei Anders!</p>
            <p className="mt-2.5">
              Etter Bossum sist lørdag har jeg lagt merke til at jeg{" "}
              <b>misser høyre konsistent</b> fra 100 m. Ikke push, men en{" "}
              <i>løs-fade</i> som bare faller bort.
            </p>
            <p className="mt-2.5">
              Har en kort klipp av tre forsøk og en TrackMan-screenshot. Kunne
              du tatt en titt før onsdagens økt?
            </p>
          </div>
        </div>

        {/* Vedlegg */}
        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
          <AttachmentCard
            icon={
              <div className="grid h-12 w-12 place-items-center rounded-md bg-gradient-to-br from-[#1A7D56] to-[#005840] text-white">
                <Video className="h-5 w-5" />
              </div>
            }
            name="bossum-100m-misser.mp4"
            meta="18,4 MB · 00:42"
          />
          <AttachmentCard
            icon={
              <div className="grid h-12 w-12 place-items-center rounded-md bg-[#0A1F18] font-mono text-[10px] font-semibold text-accent">
                TM
              </div>
            }
            name="trackman-100m-3may.png"
            meta="847 kB · 1920×1080"
          />
        </div>

        {/* Koble til */}
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <div className="flex cursor-pointer items-center justify-between">
            <div className="flex items-center gap-2.5 text-[13.5px] font-semibold">
              <LinkIcon className="h-4 w-4 text-primary" />
              Koble til
            </div>
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.08] px-3 py-1.5 text-[12.5px] font-semibold text-primary">
              <CalIcon className="h-3.5 w-3.5" />
              Plan: Sommer-toppform · uke 19
              <X className="h-3 w-3 cursor-pointer" />
            </span>
            <button className="rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-secondary">
              + Plan-uke
            </button>
            <button className="rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-secondary">
              + TrackMan-økt
            </button>
            <button className="rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-secondary">
              + Runde (GolfBox)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
          <div className="flex items-center gap-3">
            <button className="rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
              Avbryt
            </button>
            <button className="text-[13px] font-medium text-muted-foreground hover:text-foreground">
              Lagre som utkast
            </button>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-[13px] font-semibold text-accent-foreground transition-opacity hover:opacity-90">
            Send
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TBBtn({
  children,
  label,
  active,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      title={label}
      className={`grid place-items-center rounded-md px-2 py-1.5 text-[13px] transition-colors hover:bg-card ${
        active ? "bg-card" : "bg-transparent"
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="mx-1 h-4 w-px bg-border" />;
}

function AttachmentCard({
  icon,
  name,
  meta,
}: {
  icon: React.ReactNode;
  name: string;
  meta: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      {icon}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold">{name}</div>
        <div className="font-mono text-[11px] text-muted-foreground">
          {meta}
        </div>
      </div>
      <button className="text-muted-foreground transition-colors hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
