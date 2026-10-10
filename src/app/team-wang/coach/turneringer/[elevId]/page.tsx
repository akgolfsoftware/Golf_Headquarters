import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { medWangElevData } from "@/app/team-wang/_data/wang-tilgang";
import { hentTurneringshistorikk } from "@/lib/portal/turneringshistorikk-data";
import { kanSeDataGolf } from "@/lib/auth/datagolf-regel";
import { resultatKilde, resultatStatus } from "@/lib/domain/turneringsresultat";
import { IconChip } from "@/app/team-wang/_components/primitiver";

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
      <div
        className="wang-tp"
        style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 48px", display: "grid", gap: 18 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <IconChip icon="trophy" color="navy" size={44} />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-brand)",
                fontWeight: 800,
                fontSize: 19,
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {elevNavn}
            </div>
            <div className="t-label" style={{ color: "var(--text-secondary)", marginTop: 2 }}>
              Turneringer
            </div>
          </div>
        </div>

        {!historikk.harHistorikk ? (
          <div
            className="wang-card"
            style={{
              padding: "22px 20px",
              fontFamily: "var(--font-body)",
              fontSize: 13.5,
              color: "var(--text-secondary)",
              textAlign: "center",
            }}
          >
            {historikk.tomGrunn}
          </div>
        ) : (
          <>
            <div className="wang-card" style={{ padding: "16px 18px", display: "flex", gap: 28, flexWrap: "wrap" }}>
              <div>
                <div
                  className="wang-num"
                  style={{ fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 24, color: "var(--text-primary)" }}
                >
                  {historikk.antall}
                </div>
                <div className="t-label" style={{ color: "var(--text-secondary)" }}>turneringsstarter</div>
              </div>
              <div>
                <div
                  className="wang-num"
                  style={{ fontFamily: "var(--font-brand)", fontWeight: 800, fontSize: 24, color: "var(--text-primary)" }}
                >
                  {historikk.bestePlassering != null ? `${historikk.bestePlassering}.` : "—"}
                </div>
                <div className="t-label" style={{ color: "var(--text-secondary)" }}>beste plassering</div>
              </div>
            </div>

            {historikk.aar.map((aar) => (
              <section key={aar.aar}>
                <div
                  style={{
                    fontFamily: "var(--font-brand)",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "var(--text-primary)",
                    margin: "2px 2px 10px",
                  }}
                >
                  {aar.aar}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {aar.turneringer.map((t) => (
                    <div
                      key={t.turneringId}
                      className="wang-card"
                      style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 4 }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div
                          style={{
                            fontFamily: "var(--font-brand)",
                            fontWeight: 700,
                            fontSize: 14,
                            color: "var(--text-primary)",
                            minWidth: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t.navn}
                        </div>
                        <span
                          className="wang-num"
                          style={{
                            flexShrink: 0,
                            fontFamily: "var(--font-brand)",
                            fontWeight: 700,
                            fontSize: 12.5,
                            color: "var(--text-secondary)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmtDato(t.startDato)}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          fontFamily: "var(--font-body)",
                          fontSize: 12.5,
                          color: "var(--text-secondary)",
                          flexWrap: "wrap",
                        }}
                      >
                        <span>{resultatKilde(t.kilde)}</span>
                        <span>·</span>
                        <span>{resultatStatus(t.status)}</span>
                        {t.brutto != null ? (
                          <>
                            <span>·</span>
                            <span className="wang-num">{t.brutto} slag ({motPar(t.motPar)})</span>
                          </>
                        ) : null}
                        {t.plassering != null && t.status === "FINISHED" ? (
                          <>
                            <span>·</span>
                            <span className="wang-num">Plass {t.plasseringTekst ?? t.plassering}</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </div>
    );
  });
  if (visning === null) notFound();
  return visning;
}
