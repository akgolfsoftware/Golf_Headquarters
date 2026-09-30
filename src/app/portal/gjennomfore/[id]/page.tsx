/**
 * PlayerHQ · Øktark (/portal/gjennomfore/[id]) — PH-03 i Precision Athletics
 * (Claude Design 7d7c2994). Tilgang, datalasting og øktvalg er uendret; visningen
 * er PH03Oktark. DEN ENE økt-siden med planlagt / pågår / gjennomført (Anders 11.08.2026).
 * Ingen økt funnet: tom tilstand med veien videre til planen.
 */

import { redirect } from "next/navigation";
import { CalendarRange, Play, RotateCw } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getOktDetaljData, type OktDrill, type OktUiStatus } from "@/lib/portal-okt/okt-detalj-data";
import { loadNesteOkt } from "@/lib/portal/load-neste-okt";
import { nesteOktTekst } from "@/lib/portal/neste-okt-tekst";
import { InviteFriendTrigger } from "@/components/portal/workbench/invite-friend-trigger";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { KnappLenke, Meta, TomTilstand, type Akse } from "@/components/precision/pa";
import { InlineVarsel } from "@/components/precision/pa-a5";
import { PH03Oktark, type PH03Ovelse, type PH03Status } from "@/components/portal/precision/PH03Oktark";

export const dynamic = "force-dynamic";
export const metadata = { title: "Øktark · PlayerHQ" };

function fmtMin(m: number): string {
  const t = Math.floor(m / 60);
  const r = m % 60;
  if (t === 0) return `${r} min`;
  return r === 0 ? `${t} t` : `${t} t ${r} min`;
}

const STATUS: Record<OktUiStatus, PH03Status> = {
  planned: "Planlagt", now: "Pågår", done: "Gjennomført", skipped: "Hoppet over", cancelled: "Avlyst",
};

function tilOvelse(d: OktDrill, medHaker: boolean): PH03Ovelse {
  return {
    id: d.id, akse: d.pyramide.toLowerCase() as Akse, navn: d.navn, kode: d.formel,
    mengde: d.volum, min: d.tidMin, gjort: medHaker ? d.gjort : null,
  };
}

const IKKE_FUNNET = "Den kan være slettet fra planen, eller lenken er gammel.";

export default async function OktDetaljPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const { id } = await params;
  const [data, uleste] = await Promise.all([
    getOktDetaljData({ id: user.id, role: user.role }, id),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  // Tom tilstand: fant ikke økta, med neste økt-info og veien til planen.
  if (!data.found) {
    const naa = new Date();
    const neste = await loadNesteOkt(user.id, naa);
    const nesteTekst = nesteOktTekst(neste.okt, neste.href, naa);
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
        <div className="pa-side">
          <TomTilstand icon={CalendarRange} title="Fant ikke økta"
            text={`${IKKE_FUNNET}${nesteTekst ? ` ${nesteTekst.tekst}` : ""}`}
            actions={<KnappLenke href="/portal/planlegge" icon={CalendarRange} iconName="calendar-range">Åpne planen</KnappLenke>} />
        </div>
      </PlayerHQSkall>
    );
  }

  const erGjort = data.status === "done";
  const naa = new Date();
  const neste = erGjort ? await loadNesteOkt(user.id, naa) : null;
  const status = STATUS[data.status];

  const nokler: [string, string | null][] = [
    ["Målsetning", data.maal],
    ["Når", `${data.dagTekst} ${data.tidTekst}`],
    ["Sted", data.sted || null],
    ["Varighet", fmtMin(data.varighetMin)],
    ["Pyramide", data.pyramide],
    ["Coach", data.publisertAv],
  ];
  if (erGjort && data.resultat?.fullfortKl) nokler.push(["Fullført", `${data.dagTekst} ${data.resultat.fullfortKl}`]);

  const statusMeta = erGjort && data.resultat
    ? `${data.resultat.drillsFullfort} AV ${data.resultat.antallDrills} ØVELSER`
    : data.status === "now" ? `${data.drills.length} ØVELSER` : null;

  const handlinger =
    data.status === "planned" ? <>
      {data.kanStarte && <KnappLenke href={data.startHref} icon={Play} iconName="play">{data.startLabel}</KnappLenke>}
      <KnappLenke href="/portal/planlegge/workbench" variant="ghost" icon={RotateCw} iconName="rotate-cw">Flytt økta</KnappLenke>
    </>
    : data.status === "now" ? <KnappLenke href={data.startHref} icon={Play} iconName="play">{data.startLabel}</KnappLenke>
    : erGjort ? <>
      <KnappLenke href={neste?.href ?? "/portal/planlegge"}>{neste?.okt ? "Åpne neste økt" : "Åpne planen"}</KnappLenke>
      <KnappLenke href={`/portal/live/${data.id}/summary`} variant="secondary">Se oppsummering</KnappLenke>
    </>
    : null;

  const ekstra = <>
    {erGjort && data.notat && <section aria-label="Din observasjon" className="pa-card" style={{ padding: 16, gap: 8 }}>
      <span className="kicker">Din observasjon</span>
      <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-body)", overflowWrap: "anywhere" }}>{data.notat}</p>
    </section>}
    {(data.invite || data.deltakere.length > 0) && <section aria-label="Tren sammen" className="pa-card" style={{ padding: 16, gap: 8, minWidth: 0 }}>
      <span className="kicker">Tren sammen</span>
      {data.deltakere.map((d) => <div key={d.id} style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
        <span style={{ font: "var(--type-body-s)", minWidth: 0, overflowWrap: "anywhere" }}>{d.navn}</span>
        <span style={{ marginLeft: "auto" }}><Meta>{d.statusLabel.toUpperCase()}</Meta></span>
      </div>)}
      {data.invite && <InviteFriendTrigger sessionId={data.id} hostId={user.id} maxParticipants={data.invite.maxParticipants}
        currentParticipants={data.invite.currentParticipants} spillere={data.invite.spillere} label="Inviter en kompis" variant="ghost" />}
    </section>}
    {!erGjort && <InlineVarsel tone="info" tittel="Økta er din.">
      Du kan endre målet, hoppe over øvelser eller droppe hele økta. Coachen din får beskjed, så coachen vet hva som skjedde.
    </InlineVarsel>}
  </>;

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH03Oktark
        tilstand="data" kicker={`${data.dagTekst} · uke ${data.ukeNr} · ${data.tidTekst}${data.sted ? ` · ${data.sted}` : ""}`}
        tittel={data.emTittel} status={status} statusMeta={statusMeta}
        ovelser={data.drills.map((d) => tilOvelse(d, erGjort))} nokler={nokler}
        notatTittel="Fra coach" notat={data.hvorfor ? { tekst: data.hvorfor, kilde: data.publisertAv ? `${data.publisertAv}`.toUpperCase() : "COACH" } : null}
        tilbake={{ href: "/portal/planlegge", label: "Plan" }} handlinger={handlinger} ekstra={ekstra}
        feilKode={`FEIL · ØKT · ${data.id.slice(0, 8).toUpperCase()}`}
      />
    </PlayerHQSkall>
  );
}
