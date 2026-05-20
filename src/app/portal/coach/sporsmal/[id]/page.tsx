import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Clock,
  FileText,
  MessageSquare,
  Play,
  Send,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

type RouteProps = {
  params: Promise<{ id: string }>;
};

export default async function CoachSporsmalDetalj({ params }: RouteProps) {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "PARENT"] });
  const { id } = await params;

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      <nav className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3 sm:gap-4 sm:px-8 sm:py-[18px]">
        <Link
          href="/portal/coach"
          className="inline-flex h-11 items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Spørsmål
        </Link>
        <span className="font-mono text-[13px] font-bold tracking-[0.02em] text-primary">
          AK GOLF · PlayerHQ
        </span>
        <span className="ml-auto hidden font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground sm:inline">
          /portal / coach / spørsmål /{" "}
          <span className="font-semibold text-foreground">{id}</span>
        </span>
      </nav>

      <main className="mx-auto max-w-[760px] space-y-6 px-4 py-6 sm:px-6 sm:py-10">
        <div className="space-y-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.10em] text-muted-foreground">
            Svar fra coach · besvart 18.05.26
          </span>
          <h1 className="font-display text-2xl font-semibold leading-[1.05] -tracking-[0.02em] sm:text-3xl md:text-[38px]">
            Spørsmål til{" "}
            <em className="font-display italic font-normal text-primary">coach</em>
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
            {id} · stilt 17.05 · 21 t svartid · 380 ord
          </p>
        </div>

        {/* Question card */}
        <article className="grid grid-cols-[44px_minmax(0,1fr)] gap-4 rounded-2xl border border-border bg-card p-5">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground">
            MR
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-2 text-[12px]">
              <span className="font-semibold text-foreground">Markus Røinås Pedersen</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                Teknikk
              </span>
              <span className="font-mono text-[10.5px] text-muted-foreground">17.05 · 18:22</span>
            </div>
            <h2 className="font-display text-[19px] font-semibold leading-tight -tracking-[0.01em]">
              Hvordan vet jeg om jeg har riktig grep-trykk når jeg driver?
            </h2>
          </div>
        </article>

        {/* Answer card */}
        <article className="rounded-2xl border border-primary/30 bg-card p-4 shadow-[0_0_0_4px_rgba(0,88,64,0.04)] md:p-6">
          <header className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground">
              HB
            </div>
            <div className="min-w-0">
              <div className="text-[13.5px] font-semibold text-foreground">Hans Brennum</div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
                Hovedcoach · GFGK Performance
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-primary">
              <Check className="h-3 w-3" strokeWidth={2.5} />
              Verifisert
            </span>
            <span className="ml-auto font-mono text-[10.5px] text-muted-foreground">
              18.05 · 09:14
            </span>
          </header>

          <div className="space-y-4 pt-5 text-[14.5px] leading-relaxed text-foreground">
            <p>
              Et godt utgangspunkt er <strong className="font-semibold">4 av 10</strong> — fast
              nok til kontroll, løst nok til at håndleddene kan jobbe. Hvis du må klemme mer for
              å ikke miste klubben, er enten grep slitt eller hånden i feil posisjon.
            </p>

            <blockquote className="border-l-[3px] border-accent bg-accent/10 px-4 py-3 font-display italic text-[15px] text-foreground/90">
              &quot;Hvis tommelen din blir hvit etter swing, er trykket for hardt. Hvis klubben
              ruller i hånden ved kontakt, er det for løst.&quot;
            </blockquote>

            <p>Tre konkrete sjekkpunkter du kan kjøre på neste range-økt:</p>

            <ol className="list-decimal space-y-2 pl-5 text-[14px]">
              <li>
                Hold klubben i venstre hånd alene (for høyrehendt) — om du klarer å gjøre en
                halv backswing uten å miste den, har du nok grep.
              </li>
              <li>
                Etter swing: kjenn etter spenning i underarmene.{" "}
                <em className="italic">Mer spenning enn skuldrene</em> = for hardt grep.
              </li>
              <li>
                Filmes fra DTL — se på pekefinger og tommel. Hvis du ser bleke knuter, er
                trykket for høyt.
              </li>
            </ol>

            <p>
              For deg spesifikt: I videoen fra <strong>14. mai</strong> så jeg at høyre hånd
              griper for langt opp på shaftet ved adresse. Dropp den 1 cm ned — du vil kjenne at
              trykket reduserer seg av seg selv. Vi tester dette på fredagens økt.
            </p>

            {/* Attachments */}
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
              <div className="flex gap-3 rounded-lg border border-border bg-background p-3">
                <div className="h-14 w-20 shrink-0 rounded-md bg-gradient-to-br from-secondary to-muted" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-semibold">
                    grep-trykk-illustrasjon.jpg
                  </div>
                  <div className="font-mono text-[10.5px] text-muted-foreground">
                    2,1 MB · 1600×1200
                  </div>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg border border-border bg-background p-3">
                <div className="relative h-14 w-20 shrink-0 rounded-md bg-gradient-to-br from-foreground to-primary">
                  <Play className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 fill-accent text-accent" />
                  <span className="absolute bottom-1 right-1 rounded bg-foreground/80 px-1 font-mono text-[9px] text-accent">
                    0:48
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12.5px] font-semibold">
                    demo-grep-passiv-handledd.mp4
                  </div>
                  <div className="font-mono text-[10.5px] text-muted-foreground">
                    12,4 MB · 1080p
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 border-t border-border pt-3 font-mono text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3 w-3" strokeWidth={1.75} />
                Svartid 14 t 52 min
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileText className="h-3 w-3" strokeWidth={1.75} />
                380 ord
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare className="h-3 w-3" strokeWidth={1.75} />
                Lest 17.05 kl 22:14
              </span>
            </div>
          </div>
        </article>

        {/* Reaction */}
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-semibold">Hjalp dette deg?</div>
            <div className="text-[12px] text-muted-foreground">
              Reaksjonen din hjelper Hans med å forstå hva som funker.
            </div>
          </div>
          <div className="flex gap-2" role="group" aria-label="Reaksjon">
            <button
              type="button"
              aria-pressed="true"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary/10 px-3 py-1.5 text-[12px] font-semibold text-primary"
            >
              <ThumbsUp className="h-3.5 w-3.5" strokeWidth={1.75} />
              Hjalp <span className="font-mono text-[10px] text-muted-foreground">· markert</span>
            </button>
            <button
              type="button"
              aria-pressed="false"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-transparent px-3 py-1.5 text-[12px] font-semibold text-muted-foreground hover:border-destructive hover:text-destructive"
            >
              <ThumbsDown className="h-3.5 w-3.5" strokeWidth={1.75} />
              Trenger mer
            </button>
          </div>
        </div>

        {/* Follow-up */}
        <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-4 rounded-xl border border-border bg-card px-5 py-4">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-primary">
            <MessageSquare className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-[14px] font-semibold">Trenger du å grave dypere?</div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
              Still oppfølgings-spørsmål · mottaker: Hans Brennum
            </div>
          </div>
          <Link
            href="/portal/coach/melding/ny"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-[13px] font-bold text-primary-foreground hover:opacity-90"
          >
            <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
            Still oppfølging
          </Link>
        </div>

        {/* Related */}
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-display text-[18px] font-semibold -tracking-[0.01em]">
              Liknende spørsmål andre har stilt
            </h3>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.10em] text-muted-foreground">
              3 relaterte · teknikk
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              "Hvor mye skal venstre håndledd flektes ved topp?",
              "Hvordan beholde balanse gjennom finish?",
              "Bør tempo være likt på iron og driver?",
            ].map((q, i) => (
              <button
                key={i}
                type="button"
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left hover:-translate-y-px hover:border-muted-foreground"
              >
                <span className="w-max rounded-full bg-primary/10 px-2 py-0.5 font-display italic text-[12px] text-primary">
                  Teknikk
                </span>
                <div className="font-display text-[13.5px] font-semibold leading-tight">{q}</div>
                <div className="mt-auto flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-foreground">
                    <Check className="h-2.5 w-2.5" strokeWidth={2.5} />
                  </span>
                  <span>Besvart</span>
                  <span>·</span>
                  <span>{[14, 22, 9][i]} fant nyttig</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
