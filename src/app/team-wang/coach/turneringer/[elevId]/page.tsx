import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { medWangElevData } from "@/app/team-wang/_data/wang-tilgang";
import { hentTurneringshistorikk } from "@/lib/portal/turneringshistorikk-data";
import { formaterFortegn } from "@/lib/format-tall";
import { kanSeDataGolf } from "@/lib/auth/datagolf-regel";
import { resultatKilde, resultatStatus } from "@/lib/domain/turneringsresultat";
import { WangUnderside } from "@/components/wang/WangUnderside";
import { WangElevTopp } from "@/components/wang/WangElevTopp";
import { WangTilParGraf, type WangTilParPunkt } from "@/components/wang/WangTilParGraf";

/**
 * Turneringsresultater for én WANG-elev (beslutninger.md §PIPELINES ER ENESTE
 * KILDE, punkt 7). Samme datamodul som PlayerHQ og AgencyOS —
 * `hentTurneringshistorikk()` — bare en ny visning. Ingen nytt datalag.
 *
 * Samme tilgangsgrense som IUP: eleven må være aktiv spiller i WANG
 * Toppidrett. Treneren trenger aktuell navngitt deling; eleven selv og
 * godkjent forelder beholder eget innsyn. Skjermen
 * er lesevisning — ingen skriving her.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Turneringer — WANG Toppidrett",
  robots: { index: false, follow: false },
};

const MND_KORT = [
  "jan", "feb", "mar", "apr", "mai", "jun",
  "jul", "aug", "sep", "okt", "nov", "des",
];

function fmtDato(d: Date): string {
  const iso = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(d);
  const [, m, dag] = iso.split("-").map(Number);
  return `${dag}. ${MND_KORT[(m ?? 1) - 1]}`;
}

function motPar(n: number | null): string {
  if (n == null) return "—";
  return n > 0 ? `+${n}` : String(n);
}

export default async function WangTurneringerPage({
  params,
  searchParams,
}: {
  params: Promise<{ elevId: string }>;
  searchParams?: Promise<{ aar?: string }>;
}) {
  const { elevId } = await params;
  const valgtAar = (searchParams ? await searchParams : {}).aar ?? "alle";

  const bruker = await requirePortalUser({
    tillatDemo: true,
    allow: ["ADMIN", "COACH", "PLAYER", "PARENT"],
    redirectTo: `/team-wang/logg-inn?next=${encodeURIComponent(`/team-wang/coach/turneringer/${encodeURIComponent(elevId)}`)}`,
    kreverTilgang: "INGEN",
  });

  const visning = await medWangElevData(bruker, elevId, async (tx) => {

    const elev = await tx.user.findUnique({
      where: { id: elevId },
      select: { id: true, name: true, email: true },
    });
    if (!elev) return null;

    const historikk = await hentTurneringshistorikk(elevId, tx, { medDataGolf: kanSeDataGolf(bruker) });
    const elevNavn = elev.name?.trim() || elev.email;
    const enc = encodeURIComponent(elevId);
    const iAar = Number(new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "Europe/Oslo" }).format(new Date()));
    const aaret = historikk.aar.find((a) => a.aar === iAar)?.turneringer ?? [];
    const fullfortIAar = aaret.filter((t) => t.status === "FINISHED" && t.motPar != null);
    const snitt = fullfortIAar.length
      ? fullfortIAar.reduce((sum, t) => sum + (t.motPar ?? 0), 0) / fullfortIAar.length
      : null;
    const punkter: WangTilParPunkt[] = [...fullfortIAar].reverse().map((t) => ({
      id: t.turneringId,
      dato: fmtDato(t.startDato),
      navn: t.navn,
      motPar: t.motPar ?? 0,
      tekst: `${fmtDato(t.startDato)} · ${t.navn}: ${t.brutto ?? "—"} slag (${motPar(t.motPar)}), plass ${t.plasseringTekst ?? t.plassering ?? "—"}`,
    }));
    const aarSomVises = valgtAar === "alle" ? historikk.aar : historikk.aar.filter((a) => String(a.aar) === valgtAar);
    const valg = [...historikk.aar.slice(0, 2).map((a) => String(a.aar)), "alle"];

    return (
      <>
        <WangElevTopp
          tilbake={{ href: `/team-wang/coach/profil/${enc}`, tekst: elevNavn }}
          navn={elevNavn}
          overtittel={elevNavn}
          tittel="Turneringer"
          tall={[
            { verdi: String(historikk.antall), tekst: "turneringsstarter" },
            { verdi: historikk.bestePlassering != null ? `${historikk.bestePlassering}.` : "—", tekst: "beste plass" },
            { verdi: formaterFortegn(snitt, 1), tekst: `snitt til par i ${iAar}` },
          ]}
        />

        {!historikk.harHistorikk ? (
          <div className="wg-kort" style={{ padding: "18px 20px" }}>
            <p className="wg-forklar">{historikk.tomGrunn}</p>
          </div>
        ) : (
          <div className="wg-turn-grid">
            <div className="wg-turn-graf">
              <WangTilParGraf aar={iAar} punkter={punkter} />
              <p className="wg-kilde">Kilde: offisielle resultater, hentet hver mandag. Plassering er plass i feltet, aldri prosent. Netto score er ikke med.</p>
            </div>
            <div className="wg-turn-liste">
              <nav className="wg-turn-valg" aria-label="Vis sesong">
                {valg.map((a) => (
                  <Link
                    key={a}
                    href={a === "alle" ? `/team-wang/coach/turneringer/${enc}` : `/team-wang/coach/turneringer/${enc}?aar=${a}`}
                    aria-current={valgtAar === a ? "page" : undefined}
                    className="wg-turn-valg-knapp"
                  >
                    {a === "alle" ? "Alle" : a}
                  </Link>
                ))}
              </nav>
              {aarSomVises.map((aar) => (
                <section key={aar.aar} className="wg-seksjon" aria-label={`Turneringer ${aar.aar}`}>
                  <div className="wg-sek-topp">
                    <h2>{aar.aar}</h2>
                    <span className="wg-kilde">
                      {aar.turneringer.length} {aar.turneringer.length === 1 ? "turnering" : "turneringer"}
                    </span>
                  </div>
                  <div className="wg-kort">
                    {aar.turneringer.map((t) => {
                      const [dag, mnd] = fmtDato(t.startDato).split(". ");
                      return (
                        <div key={t.turneringId} className="wg-turn-rad">
                          <span className="wg-turn-dato" aria-hidden="true"><b>{dag}</b><span>{mnd}</span></span>
                          <span className="wg-turn-hva">
                            <b>{t.navn}</b>
                            <span className="wg-kilde">
                              {[
                                fmtDato(t.startDato),
                                resultatKilde(t.kilde),
                                resultatStatus(t.status),
                                t.brutto != null ? `${t.brutto} slag (${motPar(t.motPar)})` : null,
                              ].filter(Boolean).join(" · ")}
                            </span>
                          </span>
                          <span className="wg-turn-plass">
                            <strong>
                              {t.plassering != null && t.status === "FINISHED" ? t.plasseringTekst ?? `${t.plassering}.` : "—"}
                            </strong>
                            <span>plass</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}
      </>
    );
  });
  if (visning === null) notFound();
  return (
    <WangUnderside bruker={bruker} omraade="elever">
      {visning}
    </WangUnderside>
  );
}
