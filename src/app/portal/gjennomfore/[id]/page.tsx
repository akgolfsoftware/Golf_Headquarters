/**
 * PlayerHQ · Økt-detalj (/portal/gjennomfore/[id]) — Paper-port W1 (fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-okt-detalj.html.
 *
 * DEN ENE økt-siden med to tilstander (planlagt / gjennomført) — vedtak
 * Anders 11.08.2026. Erstatter både gamle OktV2-lesesiden og
 * /portal/tren/[sessionId]/planlagt (nå redirect hit).
 *
 * Struktur (fasit): «Én ting nå» med clay-CTA «Start økta» (planlagt) →
 * metakort (Når/Sted/Varighet/Pyramide/Publisert av + «Fullført» i
 * gjennomført-modus) → målsetning + why-details → drill-liste med
 * reps·tid·AK-formel (haker i gjennomført-modus) → inviter-kompis
 * (gjenbrukt InviteFriendTrigger) → eier-fotnote. Gjennomført-modus:
 * resultatblokk + notat + clay-CTA «Åpne neste økt».
 * Alt fra ekte data — felter uten verdi utelates ærlig.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getOktDetaljData, type OktDrill } from "@/lib/portal-okt/okt-detalj-data";
import { loadNesteOkt } from "@/lib/portal/load-neste-okt";
import { nesteOktTekst } from "@/lib/portal/neste-okt-tekst";
import { InviteFriendTrigger } from "@/components/portal/workbench/invite-friend-trigger";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import { Caps, TilbakeLenke, StatusPill, Icon } from "@/components/v2";
import { Check } from "lucide-react";

export const dynamic = "force-dynamic";

function fmtMin(m: number): string {
  const t = Math.floor(m / 60);
  const r = m % 60;
  if (t === 0) return `${r} min`;
  return r === 0 ? `${t} t` : `${t} t ${r} min`;
}

const kortStil: React.CSSProperties = {
  background: T.panel,
  border: `1px solid ${T.border}`,
  borderRadius: T.rCard,
  padding: 16,
};

function MetaKort({
  rader,
  eyebrow,
}: {
  rader: [string, string][];
  eyebrow: string;
}) {
  return (
    <div style={kortStil}>
      <Caps>{eyebrow}</Caps>
      <div style={{ marginTop: 4 }}>
        {rader.map(([label, verdi], i) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              padding: "8px 0",
              borderBottom: i < rader.length - 1 ? `1px solid ${T.borderS}` : undefined,
              fontFamily: T.ui,
              fontSize: 13,
              color: T.fg,
            }}
          >
            <span style={{ minWidth: 0 }}>{label}</span>
            <span
              style={{
                marginLeft: "auto",
                fontFamily: T.mono,
                textAlign: "right",
                color: T.fg,
                minWidth: 0,
              }}
            >
              {verdi}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DrillListe({ drills, medHaker }: { drills: OktDrill[]; medHaker: boolean }) {
  const totalMin = drills.reduce((s, d) => s + (d.tidMin ?? 0), 0);
  return (
    <div>
      <Caps>
        drills · {drills.length}
        {totalMin > 0 ? ` · ${fmtMin(totalMin)}` : ""}
      </Caps>
      <div style={{ marginTop: 8 }}>
        {drills.length === 0 && (
          <p style={{ margin: 0, fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut }}>
            Økta har ingen drills — innholdet avtales på stedet.
          </p>
        )}
        {drills.map((d) => (
          <div
            key={d.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              background: T.panel,
              border: `1px solid ${T.border}`,
              borderRadius: T.rCard,
              padding: 12,
              marginBottom: 8,
            }}
          >
            {medHaker && (
              <span
                aria-label={d.gjort ? "Fullført" : "Ikke logget"}
                style={{
                  flex: "none",
                  width: 22,
                  height: 22,
                  borderRadius: T.rPill,
                  display: "grid",
                  placeItems: "center",
                  border: `1px solid ${T.border}`,
                  color: d.gjort ? T.up : T.mut,
                  background: d.gjort ? T.panel2 : "transparent",
                }}
              >
                {d.gjort ? (
                  <Check size={13} strokeWidth={2} aria-hidden />
                ) : (
                  <span
                    aria-hidden
                    style={{ width: 4, height: 4, borderRadius: T.rPill, background: "currentcolor" }}
                  />
                )}
              </span>
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: "block", fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>
                {d.navn}
              </span>
              {(d.volum || d.tidMin != null) && (
                <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
                  {[d.volum, d.tidMin != null ? `${d.tidMin} min` : null].filter(Boolean).join(" · ")}
                </span>
              )}
              {d.formel && (
                <span
                  style={{
                    display: "block",
                    fontFamily: T.mono,
                    fontSize: 9.5,
                    color: T.mut,
                    marginTop: 4,
                    wordBreak: "break-all",
                  }}
                >
                  {d.formel}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MaalKort({ maal, hvorfor }: { maal: string; hvorfor: string | null }) {
  return (
    <div style={kortStil}>
      <Caps>målsetning</Caps>
      <p style={{ margin: "8px 0 0", fontFamily: T.bodyFont, fontSize: 15, color: T.fg }}>{maal}</p>
      {hvorfor && (
        <details
          data-od-id="okt-why-maal"
          style={{ marginTop: 12, border: `1px solid ${T.border}`, borderRadius: T.rCard }}
        >
          <summary
            style={{
              display: "flex",
              alignItems: "center",
              minHeight: 44,
              padding: "0 16px",
              cursor: "pointer",
              listStyle: "none",
              fontFamily: T.ui,
              fontSize: 12.5,
              fontWeight: 500,
              color: T.mut,
            }}
          >
            Hvorfor dette tallet
          </summary>
          <p
            style={{
              margin: 0,
              padding: "12px 16px 16px",
              fontFamily: T.bodyFont,
              fontSize: 13,
              color: T.mut,
              borderTop: `1px solid ${T.border}`,
            }}
          >
            {hvorfor}
          </p>
        </details>
      )}
    </div>
  );
}

export default async function OktDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const { id } = await params;
  const data = await getOktDetaljData({ id: user.id, role: user.role }, id);

  // Tom tilstand — fasit: fant ikke økta → neste økt-info + «Åpne planen».
  if (!data.found) {
    const naa = new Date();
    const neste = await loadNesteOkt(user.id, naa);
    const nesteTekst = nesteOktTekst(neste.okt, neste.href, naa);
    return (
      <V2Shell bredde="kolonne" aktiv="plan" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
        <TilbakeLenke href="/portal/planlegge">Plan</TilbakeLenke>
        <div
          data-paper-slug="playerhq-okt-detalj"
          data-od-id="playerhq-okt-detalj-tom"
          style={{ maxWidth: 720, margin: "0 auto", width: "100%" }}
        >
          <div
            style={{
              padding: "24px 16px",
              background: T.panel2,
              border: `1px dashed ${T.border}`,
              borderRadius: T.rCard,
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
              Fant ikke økta
            </h3>
            <p style={{ margin: "0 0 12px", fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut }}>
              Den kan være slettet fra planen, eller lenken er gammel.
              {nesteTekst ? ` ${nesteTekst.tekst}` : ""}
            </p>
            {/* Kontrakt §3: i tom tilstand er planen veien videre — ett trykk. */}
            <Link
              href="/portal/planlegge"
              data-od-id="okt-tom-plan"
              data-paper-en-ting="true"
              className="v2-press v2-focus"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 56,
                width: "100%",
                borderRadius: T.rCard,
                background: T.handling,
                color: T.onHandling,
                fontFamily: T.ui,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Åpne planen
            </Link>
          </div>
        </div>
      </V2Shell>
    );
  }

  const erGjort = data.status === "done";

  const metaRader: [string, string][] = [
    ["Når", `${data.dagTekst} ${data.tidTekst}`],
    ["Sted", data.sted],
    ["Varighet", fmtMin(data.varighetMin)],
    ["Pyramide", data.pyramide],
  ];
  if (data.publisertAv) metaRader.push(["Publisert av", data.publisertAv]);
  if (erGjort && data.resultat?.fullfortKl) {
    metaRader.push(["Fullført", `${data.dagTekst} ${data.resultat.fullfortKl}`]);
  }

  // Neste økt-lenke (gjennomført-modus) — ekte oppslag, aldri fabrikkert.
  const naa = new Date();
  const neste = erGjort ? await loadNesteOkt(user.id, naa) : null;

  return (
    <V2Shell bredde="kolonne" aktiv="plan" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/planlegge">Plan</TilbakeLenke>
      <div
        data-paper-slug="playerhq-okt-detalj"
        data-od-id="playerhq-okt-detalj"
        style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720, margin: "0 auto", width: "100%" }}
      >
        {/* Topp — fasit: «Økt» + dag · uke */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, minWidth: 0 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>
              {data.emTittel}
            </h1>
            <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>
              {data.dagTekst} · uke {data.ukeNr}
            </span>
          </div>
        </div>

        {erGjort ? (
          <>
            {/* ── Gjennomført ── */}
            {/* Fasit-KPI «resultat» (X av Y + tag «Mål nådd»). Fasitens andre
                KPI «endring» (± vs forrige økt) utelates ærlig — forrige-økt-
                data finnes ikke i modellen ennå. */}
            {data.resultat && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                <div style={{ ...kortStil, padding: "12px 16px" }}>
                  <Caps>resultat</Caps>
                  <div style={{ fontFamily: T.mono, fontSize: 22, fontWeight: 600, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
                    {data.resultat.drillsFullfort} av {data.resultat.antallDrills}
                  </div>
                  {data.resultat.antallDrills > 0 &&
                    data.resultat.drillsFullfort === data.resultat.antallDrills && (
                      <div style={{ marginTop: 6 }}>
                        <StatusPill tone="up">Mål nådd</StatusPill>
                      </div>
                    )}
                </div>
              </div>
            )}

            {data.maal && <MaalKort maal={data.maal} hvorfor={data.hvorfor} />}

            {data.notat && (
              <div style={kortStil}>
                <Caps>din observasjon</Caps>
                <p style={{ margin: "8px 0 0", fontFamily: T.bodyFont, fontSize: 15, color: T.fg }}>
                  {data.notat}
                </p>
              </div>
            )}

            <MetaKort eyebrow={data.tittel} rader={metaRader} />
            <DrillListe drills={data.drills} medHaker />

            {/* Kontrakt §3: den ene aksenthandlingen peker på det neste som
                skjer — neste økt i planen. Oppsummering er lesing: vanlig knapp. */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link
                href={neste?.href ?? "/portal/planlegge"}
                data-od-id="okt-gjort-neste"
                data-paper-en-ting="true"
                className="v2-press v2-focus"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 56,
                  flex: 1,
                  minWidth: 0,
                  borderRadius: T.rCard,
                  background: T.handling,
                  color: T.onHandling,
                  fontFamily: T.ui,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {neste?.okt ? "Åpne neste økt" : "Åpne planen"}
              </Link>
              <Link
                href={`/portal/live/${data.id}/summary`}
                data-od-id="okt-gjort-summary"
                className="v2-press v2-focus"
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 56,
                  padding: "0 16px",
                  borderRadius: T.rCard,
                  border: `1px solid ${T.border}`,
                  color: T.fg,
                  fontFamily: T.ui,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                Se oppsummering
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* ── Planlagt ── */}
            {data.kanStarte && (
              <div
                style={{
                  background: T.handlingSoft,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.rCard,
                  padding: 16,
                }}
              >
                <Caps>Én ting nå</Caps>
                <h3 style={{ margin: "8px 0", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
                  {data.status === "now" ? (
                    "Økta pågår"
                  ) : (
                    <>
                      Økta starter kl.{" "}
                      <span style={{ fontFamily: T.mono }}>{data.tidTekst.split("–")[0]}</span>
                    </>
                  )}
                </h3>
                <p style={{ margin: "0 0 16px", fontFamily: T.bodyFont, fontSize: 14, color: T.mut, maxWidth: "52ch" }}>
                  {data.status === "now"
                    ? `${data.sted} · ${data.tidTekst}. Loggen ligger trygt i live-flyten — fortsett der du slapp.`
                    : `${data.sted} · ${data.tidTekst}. Alt du trenger står klart under — du trenger ikke gjøre noe før du er der.`}
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {/* Kontrakt §3: skjermens ene aksenthandling. Nedtelling er
                      informasjon, ikke sperre — å starte tidlig er helt greit. */}
                  <Link
                    href={data.startHref}
                    data-od-id="okt-start"
                    data-paper-en-ting="true"
                    className="v2-press v2-focus"
                    style={{
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 56,
                      flex: 1,
                      minWidth: 0,
                      borderRadius: T.rCard,
                      background: T.handling,
                      color: T.onHandling,
                      fontFamily: T.ui,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {data.startLabel}
                  </Link>
                  <Link
                    href="/portal/planlegge/workbench"
                    data-od-id="okt-flytt"
                    className="v2-press v2-focus"
                    style={{
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 48,
                      padding: "0 16px",
                      borderRadius: T.rCard,
                      border: `1px solid ${T.border}`,
                      color: T.fg,
                      fontFamily: T.ui,
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    Flytt økta
                  </Link>
                </div>
              </div>
            )}

            <MetaKort eyebrow={data.tittel} rader={metaRader} />
            {data.maal && <MaalKort maal={data.maal} hvorfor={data.hvorfor} />}
            {!data.maal && data.hvorfor && (
              <div style={kortStil}>
                <Caps>fra coach</Caps>
                <p style={{ margin: "8px 0 0", fontFamily: T.bodyFont, fontSize: 14, color: T.fg }}>
                  {data.hvorfor}
                </p>
              </div>
            )}
            <DrillListe drills={data.drills} medHaker={false} />

            {/* Tren sammen — inviter-kompis-funksjonen fra gamle planlagt-siden. */}
            {(data.invite || data.deltakere.length > 0) && (
              <div style={kortStil}>
                <Caps>tren sammen</Caps>
                {data.deltakere.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {data.deltakere.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 8,
                          padding: "6px 0",
                          fontFamily: T.ui,
                          fontSize: 13,
                          color: T.fg,
                          minWidth: 0,
                        }}
                      >
                        <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.navn}
                        </span>
                        <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 10.5, color: T.mut }}>
                          {p.statusLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {data.invite && (
                  <div style={{ marginTop: 12 }}>
                    <InviteFriendTrigger
                      sessionId={data.id}
                      hostId={user.id}
                      maxParticipants={data.invite.maxParticipants}
                      currentParticipants={data.invite.currentParticipants}
                      spillere={data.invite.spillere}
                      label="Inviter en kompis"
                      variant="ghost"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Eier-fotnote — eierskapsmodellen (Anders 01.08.2026). */}
            <div
              style={{
                display: "flex",
                gap: 12,
                padding: "12px 16px",
                borderRadius: T.rCard,
                background: T.panel2,
                border: `1px solid ${T.border}`,
                fontFamily: T.bodyFont,
                fontSize: 12.5,
                color: T.mut,
              }}
            >
              <Icon name="pencil" size={16} style={{ color: T.mut, flex: "none", marginTop: 2 }} />
              <span style={{ minWidth: 0 }}>
                Økta er din. Du kan endre målet, hoppe over drills eller droppe hele økta —
                ingenting sperrer. Anders får beskjed, så han vet hva som skjedde.
              </span>
            </div>
          </>
        )}
      </div>
    </V2Shell>
  );
}
