import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { medWangElevData } from "@/app/team-wang/_data/wang-tilgang";
import { hentTurneringshistorikk } from "@/lib/portal/turneringshistorikk-data";
import { kanSeDataGolf } from "@/lib/auth/datagolf-regel";
import { resultatKilde, resultatStatus } from "@/lib/domain/turneringsresultat";
import { WangUnderside } from "@/components/wang/WangUnderside";
import { WangSmaaTall, WangTilbake, WangTopp, wangHref } from "@/components/wang/wang-felles";

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
}: {
  params: Promise<{ elevId: string }>;
}) {
  const { elevId } = await params;

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

    return (
      <>
        <WangTilbake href={wangHref("elever", "elev", elevId)} tekst={elevNavn} />
        <WangTopp dato={elevNavn} tittel="Turneringer" />

        {!historikk.harHistorikk ? (
          <div className="wg-kort" style={{ padding: "18px 20px" }}>
            <p className="wg-forklar">{historikk.tomGrunn}</p>
          </div>
        ) : (
          <>
            <WangSmaaTall
              tall={[
                { verdi: String(historikk.antall), tekst: "turneringsstarter" },
                {
                  verdi: historikk.bestePlassering != null ? `${historikk.bestePlassering}.` : "—",
                  tekst: "beste plassering",
                },
              ]}
            />

            {historikk.aar.map((aar) => (
              <section key={aar.aar} className="wg-seksjon" aria-label={`Turneringer ${aar.aar}`}>
                <div className="wg-sek-topp">
                  <h2>{aar.aar}</h2>
                  <span className="wg-kilde">
                    {aar.turneringer.length} {aar.turneringer.length === 1 ? "turnering" : "turneringer"}
                  </span>
                </div>
                <div className="wg-kort wg-rader">
                  {aar.turneringer.map((t) => (
                    <div key={t.turneringId} className="wg-rad wg-resultat-rad">
                      <b>{t.navn}</b>
                      <span className="wg-tall">
                        {t.plassering != null && t.status === "FINISHED"
                          ? t.plasseringTekst ?? `${t.plassering}.`
                          : "—"}
                      </span>
                      <span className="wg-kilde">
                        {[
                          fmtDato(t.startDato),
                          resultatKilde(t.kilde),
                          resultatStatus(t.status),
                          t.brutto != null ? `${t.brutto} slag (${motPar(t.motPar)})` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </>
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
