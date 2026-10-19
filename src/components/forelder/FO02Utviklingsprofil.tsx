/**
 * FO-02 Utviklingsprofil (/forelder/barn/[childId]) — Precision Athletics, i ForelderSkall.
 * Fasit: docs/design-system/utkast-flater/forelder.html, mal «barnet».
 * Stil: src/styles/flater-ny-forelder-profil.css (lastes av siden).
 *
 * Samme datakontrakt som før. Samtykke-sperren er uendret: uten bekreftet
 * foreldresamtykke vises ingen treningsdata. Fanene (?tab=) er lenker, så
 * siden er serverrendret og trenger ingen klientkode.
 *
 * Avvik:
 *   - Utkastets faner Utvikling · Plan · Tester er Oversikt · Uke · Mål · Økonomi, fordi det er
 *     dataene siden har. Snittscore-kurve, Strokes Gained og siste tester finnes ikke i loaderen.
 *   - Fanelinja til søstersidene (Plan, Økonomi, Varsler, Samtykke) er tatt ut; de nås fra
 *     skallets meny.
 *   - Avatar viser forbokstaven, som på Barn-siden. Toppbildet i utkastet er ikke tatt med.
 */
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import type { PaymentStatus, PyramidArea } from "@/generated/prisma/client";
import { StatusPille } from "@/components/precision/pa";
import { formaterFortegn, formaterProsent, formaterTall } from "@/lib/format-tall";
import { FoAvatar, FoTom } from "@/components/forelder/fo-presisjon";

/* ── Datakontrakt (1:1 med page.tsx-loaderen) ──────────────────────── */

export type BarnDetaljTab = "oversikt" | "uke" | "mal" | "okonomi";

export type ForelderBarnDetaljData = {
  barn: {
    id: string;
    navn: string;
    avatarUrl: string | null;
    hcp: number | null;
    homeClub: string | null;
    /** Fra dateOfBirth — kun vist når fødselsdato er kjent. */
    alder: number | null;
  };
  /** Ekte GuardianConsent-felt (User.guardianConsentGivenAt != null). */
  samtykkeGitt: boolean;
  /** Denne uka, Ma–Sø — time=null betyr ingen økt planlagt den dagen. */
  ukeGrid: { dato: Date; time: Date | null }[];
  nesteOkt: {
    title: string;
    scheduledAt: Date;
    durationMin: number;
    location: string | null;
  } | null;
  /** Siste coach-melding (Notification type="melding") — samme kilde som FO06Coach. */
  coachMelding: { forfatter: string; tekst: string; sendtAt: Date } | null;
  nesteTurnering: { navn: string; dato: Date; status: string } | null;
  tab: BarnDetaljTab;
  antallRunder: number;
  /** Snitt SG over runder med sgTotal, eller null når ingen. */
  avgSg: number | null;
  /** Pyramide-fordeling i % av øktene i aktiv plan (apex→base). */
  pyramide: { akse: PyramidArea; pct: number }[];
  aktivPlan: {
    name: string;
    sessions: {
      id: string;
      title: string;
      scheduledAt: Date;
      pyramidArea: PyramidArea;
      status: string;
      rating: number | null;
    }[];
  } | null;
  goals: {
    id: string;
    title: string;
    type: string;
    targetValue: number | null;
    targetDate: Date | null;
    /** Ekte HCP-fremdrift (kun HCP_TARGET), ellers null → ingen bar. */
    fremdriftPct: number | null;
  }[];
  rounds: { id: string; playedAt: Date; score: number; sgTotal: number | null }[];
  uke: {
    antall: number;
    totalMinutter: number;
    snittRating: number | null;
    logg: { dato: Date | null; minutter: number; rating: number | null }[];
  };
  payments: {
    id: string;
    tekst: string;
    amountOre: number;
    status: PaymentStatus;
    createdAt: Date;
  }[];
};

/* ── Rene hjelpere ─────────────────────────────────────────────────── */

const NB_DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "short", year: "numeric" });
const NB_KORT = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "short" });
const NB_UKEDAG_KORT = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "short" });
const NB_KL = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" });

function ore(n: number): string {
  return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(n / 100);
}

function ukedagKort(d: Date): string {
  const s = NB_UKEDAG_KORT.format(d).replace(".", "");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const TURNERING_STATUS: Record<string, string> = {
  PLANNED: "På planen",
  CLAIMED_REGISTERED: "Meldt på",
  CONFIRMED: "Påmeldt",
  WITHDRAWN: "Trukket",
  COMPLETED: "Gjennomført",
  DNF: "Ikke fullført",
};

const TABS: { key: BarnDetaljTab; label: string }[] = [
  { key: "oversikt", label: "Oversikt" },
  { key: "uke", label: "Uke" },
  { key: "mal", label: "Mål" },
  { key: "okonomi", label: "Økonomi" },
];

const GOAL_TYPE_LABELS: Record<string, string> = {
  HCP_TARGET: "HCP-mål",
  ROUNDS_PER_MONTH: "Runder per måned",
  SG_AREA: "SG-område",
  FREE_TEXT: "Fritekst",
};

const SESJON_STATUS: Record<string, string> = {
  PLANNED: "Planlagt",
  ACTIVE: "Aktiv",
  COMPLETED: "Fullført",
  CANCELLED: "Avlyst",
  SKIPPED: "Hoppet over",
};

const AKSE: Record<PyramidArea, { navn: string; farge: string }> = {
  FYS: { navn: "FYS", farge: "var(--axis-fys)" },
  TEK: { navn: "TEK", farge: "var(--axis-tek)" },
  SLAG: { navn: "SLAG", farge: "var(--axis-slag)" },
  SPILL: { navn: "SPILL", farge: "var(--axis-spill)" },
  TURN: { navn: "TURN", farge: "var(--axis-turn)" },
};

function betalingsStatus(s: PaymentStatus): { tekst: string; tone: "ok" | "neutral" | "warn" | "signal" } {
  if (s === "SUCCEEDED") return { tekst: "Betalt", tone: "ok" };
  if (s === "REFUNDED" || s === "PARTIALLY_REFUNDED") return { tekst: "Refundert", tone: "neutral" };
  if (s === "FAILED") return { tekst: "Feilet", tone: "signal" };
  return { tekst: "Ubetalt", tone: "warn" };
}

function Rad({ tittel, sub, verdi }: { tittel: React.ReactNode; sub?: React.ReactNode; verdi?: React.ReactNode }) {
  return (
    <div className="fop-rad">
      <div>
        <strong>{tittel}</strong>
        {sub ? <small>{sub}</small> : null}
      </div>
      {verdi != null ? <span className="fop-verdi">{verdi}</span> : null}
    </div>
  );
}

function UtenSamtykke({ fornavn }: { fornavn: string }) {
  return (
    <>
      <section className="fop-kort">
        <FoTom
          tittel="Vi mangler samtykket ditt"
          sub={`${fornavn} har laget konto, men den åpnes ikke før foreldresamtykket er bekreftet. Sjekk e-posten din for lenken, eller les hva vi lagrer.`}
        />
        <div className="fop-knapper">
          <Link href="/forelder/samtykke" className="pa-btn pa-btn--primary">Gå til samtykke</Link>
          <Link href="/personvern" className="pa-btn pa-btn--secondary">Les hva vi lagrer</Link>
        </div>
      </section>
      <section className="fop-seksjon">
        <h2>Dette ser du når samtykket er på plass</h2>
        <p className="fop-note">
          Oppmøte og treningstider, ukerapport fra coachen, plan for perioden, turneringer {fornavn} er påmeldt, og alt som gjelder betaling.
        </p>
      </section>
    </>
  );
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function FO02Utviklingsprofil({ data }: { data: ForelderBarnDetaljData }) {
  const { barn, tab } = data;
  const fornavn = barn.navn.split(" ")[0];
  const hcpStr = formaterTall(barn.hcp, 1, true);
  const timer = formaterTall(data.uke.totalMinutter / 60, 1);
  const planlagt = data.ukeGrid.filter((d) => d.time != null).length;

  return (
    <div className="fop" data-fo-skjerm="utviklingsprofil">
      <Link href="/forelder/barn" className="fop-tilbake">
        <ChevronLeft size={16} aria-hidden /> Mine barn
      </Link>

      <header className="fop-hode">
        <FoAvatar navn={barn.navn} />
        <div>
          <p className="fop-kicker">Utviklingsprofil</p>
          <h1>{barn.navn}</h1>
          <p className="fop-meta">
            {barn.alder != null ? `${barn.alder} år · ` : ""}HCP {hcpStr} · {barn.homeClub ?? "Ingen hjemmeklubb"}
          </p>
        </div>
      </header>

      {!data.samtykkeGitt ? (
        <UtenSamtykke fornavn={fornavn} />
      ) : (
        <>
          <p className="fop-personvern">
            <ShieldCheck size={16} aria-hidden />
            <span>Du ser oppmøte, plan og økonomi. {fornavn}s egne notater, meldinger til coachen og velværelogg vises ikke her.</span>
          </p>

          <div className="fop-tre">
            <div className="fop-tall"><p className="fop-kicker">Økter · 4 uker</p><b>{data.uke.antall}</b></div>
            <div className="fop-tall"><p className="fop-kicker">Timer trent</p><b>{timer}</b><small>siste 7 dager</small></div>
            <div className="fop-tall"><p className="fop-kicker">Runder</p><b>{data.antallRunder}</b><small>siste 30 dager</small></div>
          </div>

          <section className="fop-seksjon">
            <h2>Denne uka</h2>
            <div className="fop-kort">
              <div className="fop-uke">
                {data.ukeGrid.map((d) => (
                  <span key={d.dato.toISOString()} data-okt={d.time ? "true" : undefined}>
                    {ukedagKort(d.dato)}
                    <b style={{ fontWeight: 600 }}>{d.time ? NB_KL.format(d.time) : " "}</b>
                  </span>
                ))}
              </div>
              <p className="fop-note">{planlagt} {planlagt === 1 ? "økt" : "økter"} planlagt denne uka.</p>
            </div>
          </section>

          <section className="fop-seksjon">
            <h2>Ukerapport fra coach</h2>
            <div className="fop-kort">
              {data.coachMelding ? (
                <>
                  <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-primary)", lineHeight: 1.6 }}>
                    {data.coachMelding.tekst || data.coachMelding.forfatter}
                  </p>
                  <p className="fop-note">Sendt {NB_KORT.format(data.coachMelding.sendtAt)}</p>
                </>
              ) : (
                <FoTom tittel="Ingen ukerapport ennå" sub="Coachen har ikke sendt en melding ennå." />
              )}
            </div>
          </section>

          {data.nesteOkt && (
            <Link href={`/forelder/barn/${barn.id}?tab=uke`} className="fop-lenkekort">
              <div>
                <strong>Neste økt · {data.nesteOkt.title}</strong>
                <small>
                  {NB_KORT.format(data.nesteOkt.scheduledAt)} · {NB_KL.format(data.nesteOkt.scheduledAt)}
                  {data.nesteOkt.location ? ` · ${data.nesteOkt.location}` : ""}
                </small>
              </div>
              <ChevronRight size={16} aria-hidden />
            </Link>
          )}

          {data.nesteTurnering && (
            <Link href="/forelder/ukerapport" className="fop-lenkekort">
              <div>
                <strong>{data.nesteTurnering.navn}</strong>
                <small>
                  {NB_KORT.format(data.nesteTurnering.dato)} · {TURNERING_STATUS[data.nesteTurnering.status] ?? data.nesteTurnering.status}
                </small>
              </div>
              <ChevronRight size={16} aria-hidden />
            </Link>
          )}

          <Link href="/forelder/coach" className="pa-btn pa-btn--primary pa-btn--full">Send melding til coach</Link>

          <section className="fop-seksjon">
            <h2>Hva det trenes på</h2>
            <div className="fop-kort">
              {data.aktivPlan ? (
                <>
                  <div className="fop-akser">
                    {data.pyramide.map((p) => (
                      <div key={p.akse} className="fop-akse">
                        <span><i style={{ background: AKSE[p.akse].farge }} />{AKSE[p.akse].navn}</span>
                        <div className="fop-stolpe"><span style={{ width: `${Math.max(0, Math.min(100, p.pct))}%`, background: AKSE[p.akse].farge }} /></div>
                        <span>{formaterProsent(p.pct)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="fop-note">Andel av øktene i planen, i prosent.</p>
                </>
              ) : (
                <FoTom tittel="Ingen aktiv plan ennå" sub="Når coachen aktiverer en plan, ser du fordelingen her." />
              )}
            </div>
          </section>

          {data.goals.length > 0 && (
            <section className="fop-seksjon">
              <h2>Målsetninger</h2>
              <div className="fop-kort">
                {data.goals.slice(0, 5).map((g) => {
                  const frist = g.targetDate ? NB_DATO.format(g.targetDate) : null;
                  return (
                    <div key={g.id} className="fop-rad" style={{ flexDirection: "column", alignItems: "stretch" }}>
                      <div>
                        <strong>{g.title}</strong>
                        <small>
                          {GOAL_TYPE_LABELS[g.type] ?? g.type}
                          {g.targetValue != null ? ` · mål ${g.targetValue}` : ""}
                          {frist ? ` · frist ${frist}` : ""}
                        </small>
                      </div>
                      {g.fremdriftPct != null && (
                        <div className="fop-fremdrift" role="progressbar" aria-valuenow={g.fremdriftPct} aria-valuemin={0} aria-valuemax={100} aria-label={`Fremdrift ${g.title}`}>
                          <span style={{ width: `${g.fremdriftPct}%` }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <nav className="fop-faner" aria-label="Profilseksjoner">
            {TABS.map((t) => (
              <Link key={t.key} href={`/forelder/barn/${barn.id}?tab=${t.key}`} aria-current={t.key === tab ? "page" : undefined}>
                {t.label}
              </Link>
            ))}
          </nav>

          {tab === "oversikt" && (
            <>
              <section className="fop-seksjon">
                <h2>Aktiv plan</h2>
                <div className="fop-kort">
                  {!data.aktivPlan ? (
                    <FoTom tittel="Ingen aktiv plan" sub="Coachen har ikke satt i gang en plan ennå. Spør gjerne." />
                  ) : (
                    <>
                      <strong style={{ font: "600 16px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{data.aktivPlan.name}</strong>
                      {data.aktivPlan.sessions.map((s) => (
                        <Rad
                          key={s.id}
                          tittel={s.title}
                          sub={`${NB_DATO.format(s.scheduledAt)} · ${AKSE[s.pyramidArea]?.navn ?? s.pyramidArea} · ${SESJON_STATUS[s.status] ?? s.status}`}
                          verdi={s.rating != null ? `${s.rating}/5` : undefined}
                        />
                      ))}
                    </>
                  )}
                </div>
              </section>

              <section className="fop-seksjon">
                <h2>Siste runder</h2>
                <div className="fop-kort">
                  {data.rounds.length === 0 ? (
                    <FoTom tittel="Ingen runder registrert" sub="Runder dukker opp her når spilleren logger dem." />
                  ) : (
                    data.rounds.map((r) => (
                      <Rad
                        key={r.id}
                        tittel={NB_DATO.format(r.playedAt)}
                        verdi={`Score ${r.score}${r.sgTotal != null ? ` · SG ${formaterFortegn(r.sgTotal, 1)}` : ""}`}
                      />
                    ))
                  )}
                </div>
              </section>
            </>
          )}

          {tab === "uke" && (
            <>
              <div className="fop-tre">
                <div className="fop-tall"><p className="fop-kicker">Økter · 28 dager</p><b>{data.uke.antall}</b></div>
                <div className="fop-tall"><p className="fop-kicker">Treningstid</p><b>{Math.round(data.uke.totalMinutter / 60)} t</b></div>
                <div className="fop-tall">
                  <p className="fop-kicker">Snitt-rating</p>
                  <b>{data.uke.snittRating != null ? `${String(data.uke.snittRating).replace(".", ",")}/5` : "—"}</b>
                </div>
              </div>
              <section className="fop-seksjon">
                <h2>Logg · siste 4 uker</h2>
                <div className="fop-kort">
                  {data.uke.logg.length === 0 ? (
                    <FoTom tittel="Ingen registrerte økter siste 4 uker" sub="Fullførte økter dukker opp her fortløpende." />
                  ) : (
                    data.uke.logg.slice(0, 12).map((l, i) => (
                      <Rad
                        key={i}
                        tittel={l.dato ? NB_KORT.format(l.dato) : "—"}
                        verdi={`${l.minutter} min${l.rating != null ? ` · ${l.rating}/5` : ""}`}
                      />
                    ))
                  )}
                </div>
              </section>
            </>
          )}

          {tab === "mal" && (
            <section className="fop-seksjon">
              <h2>Aktive mål</h2>
              <div className="fop-kort">
                {data.goals.length === 0 ? (
                  <FoTom tittel="Ingen mål satt" sub="Mål settes av spilleren og coachen i Workbench." />
                ) : (
                  data.goals.map((g) => (
                    <Rad
                      key={g.id}
                      tittel={g.title}
                      sub={`${GOAL_TYPE_LABELS[g.type] ?? g.type}${g.targetValue != null ? ` · mål ${g.targetValue}` : ""}`}
                    />
                  ))
                )}
              </div>
            </section>
          )}

          {tab === "okonomi" && (
            <section className="fop-seksjon">
              <div className="fop-sek-topp">
                <h2>Betalinger</h2>
                <span className="fop-note">{data.payments.length} totalt</span>
              </div>
              <div className="fop-kort">
                {data.payments.length === 0 ? (
                  <FoTom tittel="Ingen betalinger registrert" sub="Betalinger dukker opp her." />
                ) : (
                  data.payments.map((p) => {
                    const st = betalingsStatus(p.status);
                    return (
                      <Rad
                        key={p.id}
                        tittel={p.tekst}
                        sub={NB_KORT.format(p.createdAt)}
                        verdi={<>{ore(p.amountOre)} <StatusPille tone={st.tone}>{st.tekst}</StatusPille></>}
                      />
                    );
                  })
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
