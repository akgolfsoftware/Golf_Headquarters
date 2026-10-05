/**
 * PH14Detalj — testens detaljside i PlayerHQSkall.
 * Samme tilgang, protokoll, historikk, gate-tall og startlenke.
 * Gjennomføring og Team Norway-scorekort er ikke med.
 * Tegningen ui_kits/playerhq/screens/PH-14.jsx ligger ikke i git.
 */

import Link from "next/link";
import { tnFromDefinitionId } from "@/lib/portal-tester/tn-integration";
import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { prisma } from "@/lib/prisma";
import { testTilgangWhere } from "@/lib/portal-tester/test-tilgang";
import { FEATURES } from "@/lib/features";
import { parseProtocol, type ScorekortForsok } from "@/lib/portal-tester/protocol";
import { parseForScoring, lavereErBedre, ScoringDetailsSchema } from "@/lib/portal-tester/test-scoring";
import { formaterTestVerdi, formaterTestDelta } from "@/lib/portal-tester/format-verdi";
import { gateMaalFraProtokoll } from "@/lib/domain/tester-live";
import { hentGodkjenteOvelsesbankElementer } from "@/lib/masterbrain/drill-bank";
import { foreslaGodkjenteOvelser, ovelsesNavn, sammenlignMedForrige } from "@/lib/portal-tester/test-anbefaling";
import { ResultatKontekst } from "@/components/tester/ResultatKontekst";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { StatusPille, TomTilstand } from "@/components/precision/pa";
import { ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

const NGF_URL = "https://www.golfforbundet.no/spiller/toppidrett/skjemaer";

function grupperSteg(
  forsok: ScorekortForsok[],
): { label: string; antall: number; target: string | null }[] {
  const m = new Map<string, { label: string; antall: number; target: string | null }>();
  for (const f of forsok) {
    const ex = m.get(f.label);
    if (ex) ex.antall += 1;
    else m.set(f.label, { label: f.label, antall: 1, target: f.target ?? null });
  }
  return [...m.values()];
}

function fmtNum(n: number): string {
  return (Math.round(n * 100) / 100).toLocaleString("nb-NO", { maximumFractionDigits: 2 });
}

function fmtDatoKort(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "Europe/Oslo" });
}

function fmtDatoLang(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "short", timeZone: "Europe/Oslo" });
}

export default async function TestDetaljSpillerPage({
  params,
  searchParams,
}: {
  params: Promise<{ testId: string }>;
  searchParams: Promise<{ lagret?: string }>;
}) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const [{ testId }, sp, ulest] = await Promise.all([
    params,
    searchParams,
    getUnreadNotifications(user.id, 1),
  ]);
  const tn = tnFromDefinitionId(testId);
  if (tn) redirect(`/portal/tren/tester/team-norway?test=${tn.id}${tn.variableCount ? `&count=${tn.rows.length}` : ""}`);
  const lagret = sp.lagret === "1";

  const test = await prisma.testDefinition.findFirst({
    where: { id: testId, AND: [testTilgangWhere(user.id)] },
  });
  if (!test) notFound();

  const resultater = await prisma.testResult.findMany({
    where: { userId: user.id, testId },
    orderBy: { takenAt: "asc" },
    select: { id: true, score: true, takenAt: true, details: true },
  });

  const spec = parseProtocol(test.protocol);
  const scoringSpec = parseForScoring(test.protocol);
  const steg = spec ? grupperSteg(spec.forsok) : [];
  const enhet = scoringSpec.unit;
  const lavere = scoringSpec.kind === "fallback" ? null : lavereErBedre(scoringSpec.kind);

  const hist = resultater.slice(-8);
  const maks = hist.length > 0 ? Math.max(...hist.map((r) => r.score), 0) : 0;
  const siste = resultater[resultater.length - 1] ?? null;
  const nestSiste = resultater[resultater.length - 2] ?? null;
  const fasiliteter = siste && test.omraade ? await prisma.playerFacility.findMany({
    where: { userId: user.id },
    select: { capabilities: true, maksPuttLengdeM: true, rangeLengdeM: true },
  }) : [];
  const forslag = siste ? foreslaGodkjenteOvelser({
    test: { id: test.id, omraade: test.omraade },
    bank: hentGodkjenteOvelsesbankElementer(),
    fasiliteter,
    spillerKategori: null,
  }) : [];

  const erGateType = scoringSpec.kind === "count_ok" || scoringSpec.kind === "hit_rate";
  const gateMal = erGateType ? gateMaalFraProtokoll(test.protocol) : null;
  const gateShotsCount = scoringSpec.shots.length;

  let sisteForsok: { nr: number; ok: boolean | null; side: "V" | "H" | null }[] = [];
  if (erGateType && siste) {
    const parsedDetails = ScoringDetailsSchema.safeParse((siste as { details?: unknown }).details);
    if (parsedDetails.success) {
      sisteForsok = parsedDetails.data.perSlag.map((s) => ({
        nr: s.nr,
        ok: typeof s.verdier.ok === "boolean" ? s.verdier.ok : typeof s.verdier.sunket === "boolean" ? s.verdier.sunket : null,
        side: s.verdier.miss_side === "V" || s.verdier.miss_side === "H" ? (s.verdier.miss_side as "V" | "H") : null,
      }));
    }
  }

  let trend: { text: string; tone: "pos" | "neg" | "flat" } | null = null;
  const sikkertSammenlignbar = siste && nestSiste && sammenlignMedForrige(
    { ...siste, testId: test.id },
    resultater.map((rad) => ({ ...rad, testId: test.id })),
  ) !== "IKKE_SAMMENLIGNBAR";
  if (siste && nestSiste && sikkertSammenlignbar) {
    const diff = siste.score - nestSiste.score;
    if (diff === 0) {
      trend = { text: "±0 vs forrige måling", tone: "flat" };
    } else {
      const bedre = lavere == null ? null : lavere ? diff < 0 : diff > 0;
      trend = {
        text: `${formaterTestDelta({ kind: scoringSpec.kind, delta: diff })} vs forrige måling`,
        tone: bedre == null ? "flat" : bedre ? "pos" : "neg",
      };
    }
  }

  const subBiter = [test.pyramidArea, enhet ? `måles i ${enhet}` : null].filter(Boolean);
  const omRader: [string, string][] = [
    ["Pyramide", test.pyramidArea],
    ...(enhet ? [["Enhet", enhet] as [string, string]] : []),
    ...(steg.length > 0 ? [["Øvelser", `${steg.length} steg`] as [string, string]] : []),
  ];

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side ph14d" data-od-id="playerhq-test-detalj">
        <Link href="/portal/tren/tester" className="ph14d-tilbake">Tester</Link>

        {lagret && (
          <section className="pa-card ph14d-kort ph14d-lagret">
            <header>
              <StatusPille tone="ok">Lagret</StatusPille>
              <Link href="/portal/coach/melding">Del med coach</Link>
            </header>
            <p>Resultatet er lagret og telles i historikken under. Coachen ser det i stallen.</p>
            {FEATURES.TALENT && <Link href="/portal/talent">Se utviklingen i talentprofilen</Link>}
          </section>
        )}

        <header className="ph14d-hode">
          <h1>{test.name}</h1>
          <p>{subBiter.join(" · ")}</p>
        </header>

        {erGateType && siste && (
          <section className="ph14d-hero">
            <p>
              <strong>{fmtNum(siste.score)}</strong>
              <span>OK av {gateShotsCount}{gateMal != null ? ` · mål ${gateMal}` : ""}</span>
            </p>
            <small>sist {fmtDatoLang(siste.takenAt)}</small>
            {sisteForsok.length > 0 && (
              <>
                <p className="ph14d-kicker">Siste forsøk · {fmtDatoLang(siste.takenAt)}</p>
                <div className="ph14d-forsok">
                  {sisteForsok.map((f) => (
                    <p key={f.nr} data-bom={f.ok === false ? "true" : undefined}>
                      <span>{f.nr}</span>
                      <span>{f.ok == null ? "—" : f.ok ? "OK" : f.side ? `BOM · ${f.side}` : "BOM"}</span>
                    </p>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {resultater.length === 0 && (
          <TomTilstand
            icon={ClipboardList}
            title="Du har ikke tatt denne testen ennå"
            text="Protokollen står under — første måling blir referansen din."
            actions={
              <Link href={`/portal/tren/tester/${test.id}/gjennomfor`} data-od-id="testd-tom-start" className="pa-btn pa-btn--primary pa-btn--full">
                Ta første måling
              </Link>
            }
          />
        )}

        <section className="pa-card ph14d-kort">
          <p className="ph14d-kicker">Om testen</p>
          <dl>
            {omRader.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {test.description && <p>{test.description}</p>}
        </section>

        <section className="pa-card ph14d-kort">
          <p className="ph14d-kicker">Protokoll</p>
          {steg.length > 0 ? (
            <ol>
              {steg.map((s, i) => (
                <li key={s.label}>
                  <span>{i + 1}</span>
                  <span>
                    {s.label}
                    <small> × {s.antall}{s.target != null ? ` · mål ${s.target}` : ""}</small>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p>
              Testen har ingen steg-protokoll i systemet ennå — scoringsregelen under gjelder.{" "}
              <a href={NGF_URL} target="_blank" rel="noreferrer">Protokoller hos NGF</a>
            </p>
          )}
          <p className="ph14d-scoring"><span>Scoring</span><span>{test.scoringRule}</span></p>
        </section>

        {resultater.length > 0 && (
          <section className="pa-card ph14d-kort">
            <p className="ph14d-kicker">Din historikk · {resultater.length} {resultater.length === 1 ? "måling" : "målinger"}</p>
            <div className="ph14d-stolper" aria-hidden>
              {hist.map((r, i) => (
                <div key={r.id} data-siste={i === hist.length - 1 ? "true" : undefined} style={{ height: maks > 0 ? `${Math.round((r.score / maks) * 100)}%` : "8px" }}>
                  <span>{formaterTestVerdi({ kind: scoringSpec.kind, verdi: r.score, shotsCount: gateShotsCount })}</span>
                </div>
              ))}
            </div>
            <div className="ph14d-datoer">
              {hist.map((r) => <span key={r.id}>{fmtDatoKort(r.takenAt)}</span>)}
            </div>
            {trend && (
              <StatusPille tone={trend.tone === "pos" ? "ok" : trend.tone === "neg" ? "signal" : "neutral"}>{trend.text}</StatusPille>
            )}
            <details data-od-id="testd-why">
              <summary>Hvorfor dette tallet</summary>
              <ul>
                <li>Kilde: dine {resultater.length === 1 ? "logg av" : `${resultater.length} loggede målinger av`} {test.name}, sist {fmtDatoLang((siste ?? resultater[0]).takenAt)}.</li>
                {siste && nestSiste && trend ? (
                  <li>Beregning: trenden er siste måling mot nest siste — {formaterTestVerdi({ kind: scoringSpec.kind, verdi: siste.score, shotsCount: gateShotsCount })} mot {formaterTestVerdi({ kind: scoringSpec.kind, verdi: nestSiste.score, shotsCount: gateShotsCount })}.</li>
                ) : (
                  <li>{resultater.length === 1 ? "Én måling gir ingen trend." : "Historikken vises, men protokoll og testforhold kan ikke verifiseres for sikker trend."}</li>
                )}
                <li>Forbehold: målingene er gyldige når protokollen følges likt hver gang.</li>
              </ul>
            </details>
          </section>
        )}

        {siste && <ResultatKontekst />}
        {siste && (
          <section className="pa-card ph14d-kort">
            <p className="ph14d-kicker">Øvelser å vurdere</p>
            <p>Dette er forslag etter et registrert resultat, ikke en diagnose eller automatisk planendring. Coachen velger eventuell videre trening.</p>
            {forslag.length ? (
              <ul className="ph14d-forslag">
                {forslag.map(({ ovelse, kanLeggesTil, begrunnelse }) => (
                  <li key={ovelse.id}>
                    <strong>{ovelsesNavn(ovelse.navn)}</strong> · {ovelse.beskrivelse}
                    <small>{kanLeggesTil ? "Fasilitet er bekreftet. " : ""}{begrunnelse}</small>
                  </li>
                ))}
              </ul>
            ) : <p>Ingen godkjent øvelse er koblet til dette testområdet ennå.</p>}
          </section>
        )}

        {resultater.length > 0 && (
          <Link href={`/portal/tren/tester/${test.id}/gjennomfor`} data-od-id="testd-start" className="pa-btn pa-btn--primary pa-btn--full">
            Start testen
          </Link>
        )}
      </div>
    </PlayerHQSkall>
  );
}
