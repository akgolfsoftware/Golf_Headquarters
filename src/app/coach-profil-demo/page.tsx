/**
 * CoachHQ — Coach-profil (Anders sin "om meg")
 * Bygd fra wireframe/design-files-v2/screens/11-coach-profil.html
 * URL: /coach-profil-demo
 */

import { Edit, ExternalLink, AlertTriangle, ImagePlus } from "lucide-react";

type Field = { label: string; value: string; mono?: boolean };
const personFields: Field[] = [
  { label: "Fullt navn", value: "Anders Kristiansen" },
  { label: "Tittel", value: "Hovedcoach AK Golf Academy" },
  { label: "E-post", value: "anders@akgolf.no", mono: true },
  { label: "Mobil", value: "+47 412 34 567", mono: true },
  { label: "Fødselsdato", value: "14. mars 1986 — 40 år", mono: true },
];

const certifications = ["PGA Class A", "TPI Level 2", "MORAD", "NGF Trener 3"];
const languages = ["Norsk", "Engelsk"];
const clubs = ["GFGK", "Mulligan"];

export default function CoachProfilDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <header className="mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          CoachHQ · Konto · Profil
        </span>
        <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
          Profilen din. <em className="italic text-primary">Slik den ser ut</em> for spillerne.
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Endringer du gjør her vises på akgolf.no/coach/anders innen 5 minutter.
        </p>
      </header>

      <div className="grid grid-cols-[320px_1fr] items-start gap-8">
        {/* Aside */}
        <aside className="sticky top-6 flex flex-col gap-4.5 rounded-2xl border border-border bg-card p-6">
          <div className="relative flex justify-center">
            <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-[#005840] to-[#1A7D56] font-display text-[32px] font-semibold text-white">
              AK
            </div>
            <button className="absolute -bottom-1 right-8 inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px]">
              <Edit size={11} strokeWidth={1.5} />
              Endre
            </button>
          </div>
          <div className="mt-1 text-center">
            <div className="font-display text-[24px] font-semibold tracking-tight">Anders Kristiansen</div>
            <div className="mt-0.5 text-[13px] text-muted-foreground">Hovedcoach AK Golf Academy</div>
          </div>
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.04em] text-[#0A1F18]">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Aktiv coach
          </div>
          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <StatRow l="Spillere" v="38" />
            <StatRow l="År som coach" v="12" />
            <StatRow l="Klubber" v="GFGK · Mulligan" />
          </div>
          <a className="flex items-center justify-between rounded-sm border border-border bg-[var(--surface-alt,#F1EEE5)] p-3 text-[12px]">
            <span>Se offentlig profil</span>
            <ExternalLink size={14} strokeWidth={1.5} />
          </a>
        </aside>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <Section title="Personalia" aux="Synlig for spillere">
            {personFields.map((f) => (
              <FieldRow key={f.label} {...f} />
            ))}
          </Section>

          <Section title="Profesjonelt" aux="Vises på offentlig profil">
            <div className="grid grid-cols-[180px_1fr_auto] items-start gap-6 border-b border-border px-6 py-5 last:border-b-0">
              <div>
                <span className="text-[13px] font-medium text-muted-foreground">Bio</span>
                <small className="mt-0.5 block font-mono text-[10px] text-muted-foreground">Maks 280 tegn</small>
              </div>
              <div className="text-[14px] leading-relaxed">
                Hovedcoach for AK Golf Academy. Tolv år med spillere i alle aldre — fra junior til pro. PGA Class A, TPI Level 2, sertifisert i Mac O&apos;Grady MORAD. Spesialitet: spillere som vil bli bedre, ikke bare lavere.
              </div>
              <a className="cursor-pointer text-[12px] font-medium text-primary">Endre</a>
            </div>
            <ChipRow label="Sertifiseringer" chips={certifications} variant="accent" />
            <ChipRow label="Språk" chips={languages} />
            <ChipRow label="Klubb-tilknytning" chips={clubs} mono />
            <div className="grid grid-cols-[180px_1fr_auto] items-start gap-6 px-6 py-5">
              <div>
                <span className="text-[13px] font-medium text-muted-foreground">Coaching-stil</span>
                <small className="mt-0.5 block font-mono text-[10px] text-muted-foreground">Rich text</small>
              </div>
              <div className="text-[14px] italic leading-relaxed text-muted-foreground">
                &quot;Jeg coacher det jeg ser, ikke det jeg tror du har. Du skal forstå hva som skjer i din egen sving.&quot;
              </div>
              <a className="cursor-pointer text-[12px] font-medium text-primary">Endre</a>
            </div>
          </Section>

          <Section title="Galleri" aux="4 bilder vises på offentlig profil">
            <div className="grid grid-cols-2 gap-2.5 p-4.5">
              <GalleryTile grad="from-[#1A7D56] to-[#005840]" />
              <GalleryTile grad="from-[#0A1F18] to-[#163027]" />
              <GalleryTile grad="from-[#B8852A] to-[#9c6e1c]" />
              <GalleryEmpty />
            </div>
          </Section>

          <DangerZone />
        </div>
      </div>
    </div>
  );
}

function StatRow({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex items-center justify-between px-1 py-2 text-[13px]">
      <span className="text-muted-foreground">{l}</span>
      <span className="font-mono font-medium">{v}</span>
    </div>
  );
}

function Section({ title, aux, children }: { title: string; aux: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-md border border-border bg-card">
      <div className="flex items-baseline justify-between border-b border-border px-6 py-4">
        <h2 className="font-display text-[16px] font-semibold tracking-tight">{title}</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">{aux}</span>
      </div>
      <div>{children}</div>
    </section>
  );
}

function FieldRow({ label, value, mono }: Field) {
  return (
    <div className="grid grid-cols-[180px_1fr_auto] items-center gap-6 border-b border-border px-6 py-4 last:border-b-0">
      <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
      <span className={`text-[14px] ${mono ? "font-mono" : ""}`}>{value}</span>
      <a className="cursor-pointer text-[12px] font-medium text-primary">Endre</a>
    </div>
  );
}

function ChipRow({
  label,
  chips,
  variant = "default",
  mono = false,
}: {
  label: string;
  chips: string[];
  variant?: "default" | "accent";
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr_auto] items-center gap-6 border-b border-border px-6 py-4 last:border-b-0">
      <span className="text-[13px] font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <span
            key={c}
            className={`rounded-sm px-2 py-1 text-[11px] font-medium ${variant === "accent" ? "bg-primary/10 text-primary" : "bg-[var(--surface-alt,#F1EEE5)] text-foreground"} ${mono ? "font-mono tracking-[0.02em]" : ""}`}
          >
            {c}
          </span>
        ))}
      </div>
      <a className="cursor-pointer text-[12px] font-medium text-primary">Endre</a>
    </div>
  );
}

function GalleryTile({ grad }: { grad: string }) {
  return (
    <div className={`aspect-square rounded-md border border-border bg-gradient-to-br ${grad}`} />
  );
}

function GalleryEmpty() {
  return (
    <div className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border-[1.5px] border-dashed border-muted-foreground/40 text-muted-foreground">
      <ImagePlus size={24} strokeWidth={1.5} />
      <span className="text-[11px]">+ Last opp</span>
    </div>
  );
}

function DangerZone() {
  return (
    <section className="overflow-hidden rounded-md border border-[#A32D2D]/30 bg-[#A32D2D]/5">
      <div className="flex items-center gap-2 border-b border-[#A32D2D]/30 px-6 py-3.5">
        <AlertTriangle size={16} strokeWidth={1.5} className="text-[#A32D2D]" />
        <h3 className="font-display text-[14px] font-semibold tracking-tight text-[#A32D2D]">Farlig sone</h3>
      </div>
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <div className="text-[13px] font-semibold">Skjul offentlig profil</div>
          <div className="mt-0.5 text-[12px] text-muted-foreground">
            Spillere kan fortsatt finne deg via direkte lenke
          </div>
        </div>
        <button className="rounded-sm border border-[#A32D2D]/40 px-3 py-1.5 text-[12px] font-medium text-[#A32D2D]">
          Skjul
        </button>
      </div>
    </section>
  );
}
