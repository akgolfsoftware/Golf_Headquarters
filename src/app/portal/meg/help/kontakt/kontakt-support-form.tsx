"use client";

import { useState, useTransition } from "react";
import {
  CreditCard,
  MessageSquare,
  AlertTriangle,
  Key,
  RefreshCw,
  HelpCircle,
  Upload,
  Image as ImageIcon,
  X,
  ChevronDown,
  Send,
  Check,
} from "lucide-react";
import { submitSupportTicket } from "./actions";

type Kategori = "booking" | "coach-meldinger" | "app-feil" | "konto" | "data-synk" | "annet";

const KATEGORIER: { id: Kategori; navn: string; eksempel: string; Icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { id: "booking", navn: "Booking & betaling", eksempel: "Faktura, refunderinger, double-charge", Icon: CreditCard },
  { id: "coach-meldinger", navn: "Coach-meldinger", eksempel: "Mangler svar, varsler, vedlegg", Icon: MessageSquare },
  { id: "app-feil", navn: "App-feil / bug", eksempel: "Krasj, frys, layout-feil", Icon: AlertTriangle },
  { id: "konto", navn: "Konto & login", eksempel: "Glemt passord, 2FA, sperret konto", Icon: Key },
  { id: "data-synk", navn: "Data & synk", eksempel: "GolfBox, TrackMan, Apple Health", Icon: RefreshCw },
  { id: "annet", navn: "Annet", eksempel: "Generelle spørsmål, forslag", Icon: HelpCircle },
];

export function KontaktSupportForm({
  bruker,
}: {
  bruker: { navn: string; epost: string };
}) {
  const [kategori, setKategori] = useState<Kategori>("app-feil");
  const [emne, setEmne] = useState("Live-økt fryser når jeg starter time-på");
  const [beskrivelse, setBeskrivelse] = useState(
    `I går kveld krasjet appen tre ganger når jeg trykket Start på en putting-økt. Jeg fikk valgt drill og sett opp settene, men i det jeg trykket «Start time-på» frøs hele skjermen i ca. 5 sekunder før appen lukket seg.

Skjedde på iPhone 15 Pro, iOS 18.4. App-versjon 0.9.4. Wifi tilkoblet hjemme.`,
  );
  const [vedlegg, setVedlegg] = useState<{ navn: string; storrelse: string }[]>([
    { navn: "skjermbilde-1.png", storrelse: "847 KB" },
    { navn: "skjermbilde-2.png", storrelse: "1,2 MB" },
  ]);
  const [tillatInnsyn, setTillatInnsyn] = useState(false);
  const [techOpen, setTechOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function fjernVedlegg(navn: string) {
    setVedlegg((v) => v.filter((f) => f.navn !== navn));
  }

  function send() {
    startTransition(async () => {
      await submitSupportTicket({
        kategori,
        emne,
        beskrivelse,
        tillatInnsyn,
      });
    });
  }

  const kanSende = emne.trim().length >= 5 && beskrivelse.trim().length >= 20;

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        if (kanSende) send();
      }}
    >
      <SectionNum num="01" title="Hva gjelder det?">
        <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {KATEGORIER.map((k) => {
            const valgt = kategori === k.id;
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => setKategori(k.id)}
                className={`relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
                  valgt
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-card hover:border-primary/50"
                }`}
              >
                <span
                  className={`grid h-9 w-9 place-items-center rounded-lg ${
                    valgt
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <k.Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="font-display text-sm font-semibold text-foreground">
                  {k.navn}
                </span>
                <span className="text-xs text-muted-foreground">{k.eksempel}</span>
                {valgt && (
                  <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </SectionNum>

      <SectionNum num="02" title="Beskriv problemet">
        <div className="space-y-5 p-6">
          <Field label="Emne" htmlFor="emne">
            <input
              id="emne"
              type="text"
              maxLength={100}
              required
              value={emne}
              onChange={(e) => setEmne(e.target.value)}
              className={inputCss}
            />
            <MetaRow
              hint="Kort tittel — gjør det enklere å sortere."
              count={`${emne.length} / 100`}
            />
          </Field>
          <Field label="Beskrivelse" htmlFor="besk">
            <textarea
              id="besk"
              maxLength={1000}
              required
              rows={6}
              value={beskrivelse}
              onChange={(e) => setBeskrivelse(e.target.value)}
              className={inputCss}
            />
            <MetaRow
              hint="Inkluder steg du tok, hvilken side du var på, og tid/dato."
              count={`${beskrivelse.length} / 1000`}
            />
          </Field>
        </div>
      </SectionNum>

      <SectionNum num="03" title="Vedlegg" optional="Valgfritt">
        <div className="space-y-3 p-6">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 py-8 text-center transition-colors hover:border-primary hover:bg-muted">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-card text-muted-foreground">
              <Upload className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <span className="text-sm text-foreground">
              Slipp filer her eller <strong className="font-semibold text-primary">velg fra enheten</strong>
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              JPG · PNG · PDF — maks 10 MB hver, opptil 3 filer
            </span>
            <input type="file" multiple accept="image/png,image/jpeg,application/pdf" className="hidden" />
          </label>

          {vedlegg.length > 0 && (
            <div className="space-y-2">
              {vedlegg.map((v) => (
                <div
                  key={v.navn}
                  className="grid grid-cols-[40px_1fr_auto] items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-gradient-to-br from-primary to-[color:rgb(136_180_90)] text-white">
                    <ImageIcon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">
                      {v.navn}
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[10.5px] text-muted-foreground">
                      <span>{v.storrelse}</span>
                      <span>·</span>
                      <span className="text-[color:rgb(44_125_82)]">Lastet opp</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Fjern vedlegg"
                    onClick={() => fjernVedlegg(v.navn)}
                    className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionNum>

      <SectionNum num="04" title="Tilgang">
        <div className="space-y-4 p-6">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40">
            <input
              type="checkbox"
              checked={tillatInnsyn}
              onChange={(e) => setTillatInnsyn(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border accent-primary"
            />
            <div>
              <div className="text-sm font-medium text-foreground">
                Tillat at support kan se profilen min
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Lar oss reprodusere problemet og sjekke planen din direkte. Du kan trekke tilgangen når som helst i «Personvern».
              </div>
            </div>
          </label>

          <details
            open={techOpen}
            onToggle={(e) => setTechOpen((e.target as HTMLDetailsElement).open)}
            className="overflow-hidden rounded-lg border border-border bg-card"
          >
            <summary className="flex cursor-pointer items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
              <span className="grid h-7 w-7 place-items-center rounded-md bg-muted text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>
              <span className="font-display text-sm font-semibold text-foreground">
                Tekniske detaljer
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                Automatisk vedlagt
              </span>
              <ChevronDown
                className={`ml-auto h-4 w-4 text-muted-foreground transition-transform ${techOpen ? "rotate-180" : ""}`}
                strokeWidth={1.75}
              />
            </summary>
            <div className="grid grid-cols-[140px_1fr] gap-x-4 gap-y-1.5 border-t border-border px-4 py-4 font-mono text-xs">
              {[
                ["App-versjon", "0.9.4 (build 2026.05.18)"],
                ["Plattform", "iOS 18.4 · iPhone 15 Pro"],
                ["Sist innlogget", "19.05.2026 · 14:12"],
                ["Brukerkonto", `${bruker.navn} · A1`],
                ["Klubb", "Søgne & Mandal GK · medlem #4082"],
                ["Region", "eu-north-1 · Oslo"],
                ["Session-ID", "sess_8a2f4c91e7d6"],
              ].map(([k, v]) => (
                <div key={k} className="contents">
                  <span className="tracking-[0.06em] text-muted-foreground">{k}</span>
                  <span className="font-medium tabular-nums text-foreground">{v}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </SectionNum>

      <div className="sticky bottom-0 -mx-6 flex items-center gap-3 border-t border-border bg-card/95 px-6 py-4 backdrop-blur">
        <div className="text-xs text-muted-foreground">
          Eller{" "}
          <a href="#" className="font-semibold text-foreground underline underline-offset-2 hover:text-primary">
            åpne live-chat
          </a>{" "}
          — vanligvis svar innen 2 min
        </div>
        <button
          type="button"
          className="ml-auto rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
        >
          Avbryt
        </button>
        <button
          type="submit"
          disabled={!kanSende || pending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
          {pending ? "Sender …" : "Send melding"}
        </button>
      </div>
    </form>
  );
}

const inputCss =
  "w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30";

function SectionNum({
  num,
  title,
  optional,
  children,
}: {
  num: string;
  title: string;
  optional?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <header className="flex items-baseline gap-3 border-b border-border px-6 py-4">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          {num}
        </span>
        <h2 className="font-display text-base font-semibold text-foreground">
          {title}
        </h2>
        {optional && (
          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            {optional}
          </span>
        )}
      </header>
      <div>{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.10em] text-muted-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function MetaRow({ hint, count }: { hint: string; count: string }) {
  return (
    <div className="flex items-center justify-between text-[10.5px]">
      <span className="text-muted-foreground/80">{hint}</span>
      <span className="font-mono tabular-nums text-muted-foreground">{count}</span>
    </div>
  );
}
