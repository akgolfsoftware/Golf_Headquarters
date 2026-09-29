"use client";

/**
 * AG-05 fane «Stall-dag» i Precision (29.09.2026). Samme data som StallDagV2
 * (`loadStallDag`: coachens stall, én dags WorkbenchSession-rader, utkast
 * synlig for coach) — bare visningen er byttet. «Åpne uke» sender til den
 * ekte Workbench-uka. Aksestripe fra pyramiden: farge betyr akse.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, TriangleAlert, Users } from "lucide-react";
import { FeilTilstand, Knapp, KnappLenke, Meta, StatusPille, TomTilstand } from "@/components/precision/pa";
import { addDays, mondayOf } from "@/lib/domain/workbench/operations";
import { formatTime } from "@/lib/domain/workbench/labels";
import type { StallDagViewModel } from "@/lib/domain/workbench/stall-dag";
import { akseFraPyramide } from "@/lib/domain/kalender-lag";

const STATUS: Record<string, string> = {
  DRAFT: "Utkast",
  SCHEDULED: "Planlagt",
  PUBLISHED: "Publisert",
  IN_PROGRESS: "Pågår",
  COMPLETED: "Fullført",
  CANCELLED: "Avlyst",
  SKIPPED: "Hoppet over",
};

function datoTekst(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const href = (dato: string | null) => (dato === null ? "/admin/kalender?fane=stall" : `/admin/kalender?fane=stall&dato=${dato}`);
const workbench = (playerId: string, dato: string) => `/admin/workbench/${playerId}?uke=${mondayOf(dato)}`;

export function AG05StallDag({ dato, data, erIdag }: { dato: string; data: StallDagViewModel; erIdag: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, minWidth: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: "1 1 200px", minWidth: 0 }}>
          <span style={{ font: "600 15px/1.3 var(--font-sans)" }}>Stall · {datoTekst(dato)}</span>
          <Meta>{data.spillere.length} {data.spillere.length === 1 ? "SPILLER" : "SPILLERE"} · HVA HVER SPILLER HAR I PLANEN</Meta>
        </div>
        <div className="a4-periode" role="group" aria-label="Dag">
          <KnappLenke href={href(addDays(dato, -1))} variant="ghost" size="sm" icon={ChevronLeft} iconName="chevron-left">Forrige dag</KnappLenke>
          {!erIdag && <KnappLenke href={href(null)} variant="secondary" size="sm">I dag</KnappLenke>}
          <KnappLenke href={href(addDays(dato, 1))} variant="ghost" size="sm" iconRight={ChevronRight}>Neste dag</KnappLenke>
        </div>
      </div>
      {data.spillere.length === 0 ? (
        <TomTilstand icon={Users} title="Ingen spillere i stallen" text="Legg til en spiller for å se dagen her." />
      ) : (
        <div className="a4-stall">
          {data.spillere.map((s) => (
            <section key={s.id} className="pa-card a4-stall__kort" aria-label={s.navn}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ font: "600 14px/1.3 var(--font-sans)", flex: "1 1 120px", minWidth: 0, overflowWrap: "anywhere" }}>{s.navn}</span>
                {s.okter.length === 0 ? <StatusPille tone="warn">Ingen økt i dag</StatusPille> : <Meta>{s.okter.length} {s.okter.length === 1 ? "ØKT" : "ØKTER"}</Meta>}
              </div>
              {s.okter.map((o) => {
                const akse = akseFraPyramide(o.pyramid);
                return (
                  <Link
                    key={o.id}
                    href={workbench(s.id, dato)}
                    className="a4-stall__okt"
                    data-utkast={o.erUtkast ? "" : undefined}
                    data-akse={akse}
                    style={akse ? ({ "--a4-akse": `var(--axis-${akse})` } as React.CSSProperties) : undefined}
                  >
                    <span style={{ font: "500 12px/1 var(--font-mono)", color: "var(--text-secondary)" }}>{formatTime(o.startMinute)}–{formatTime(o.startMinute + o.durationMinutes)}</span>
                    <span style={{ font: "500 14px/1.3 var(--font-sans)", minWidth: 0, overflowWrap: "anywhere" }}>{o.tittel}</span>
                    <Meta>{(STATUS[o.status] ?? o.status).toUpperCase()}</Meta>
                  </Link>
                );
              })}
              <div><KnappLenke href={workbench(s.id, dato)} variant="secondary" size="sm" iconRight={ChevronRight}>Åpne uke</KnappLenke></div>
            </section>
          ))}
        </div>
      )}
      <Meta>STIPLET = UTKAST, SPILLEREN SER DET IKKE · FARGE PÅ KANTEN = AKSE</Meta>
    </div>
  );
}

export function AG05StallFeil({ melding }: { melding: string }) {
  const router = useRouter();
  return <FeilTilstand icon={TriangleAlert} title="Kunne ikke hente dagen" text={melding} retry={<Knapp variant="secondary" onClick={() => router.refresh()}>Prøv igjen</Knapp>} />;
}
