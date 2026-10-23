"use client";

/**
 * Brutto score over tid for én spiller, på /admin/runder.
 * Spørsmålet diagrammet svarer på: går scoren ned? Lavere er bedre. Teksten over diagrammet gir
 * de samme tallene uten hover. Ingen animasjon: kurven forklarer ingen endring i grensesnittet.
 */
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { tilPar } from "@/lib/admin-spiller/spiller360-visning";
import type { Utvikling } from "@/lib/admin/runde-utvikling";

const AKSE_TEKST = { fontFamily: "var(--mono)", fontSize: 11, fill: "var(--graphite-600)" } as const;

function Verktoy({ active, payload }: { active?: boolean; payload?: { payload: { dato: string; brutto: number } }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rd-tips">
      <b>{p.brutto}</b>
      <span>{p.dato}</span>
    </div>
  );
}

export function RundeUtvikling({ u, spiller }: { u: Utvikling; spiller: string }) {
  const lav = Math.min(...u.punkter.map((p) => p.brutto)) - 2;
  const hoy = Math.max(...u.punkter.map((p) => p.brutto)) + 2;
  const sammendrag = `Brutto score, ${u.punkter.length} runder. Første ${u.forste}, siste ${u.siste}, ${
    u.endring === 0 ? "uendret" : `${tilPar(u.endring)} slag`
  }. Beste ${u.beste}.`;

  return (
    <div className="kort rd-utvikling">
      <b className="undertittel">Brutto score · {spiller}</b>
      <p className="forklar">
        Første <b>{u.forste}</b> · siste <b>{u.siste}</b> · endring <b>{u.endring === 0 ? "0" : tilPar(u.endring)}</b> slag · beste <b>{u.beste}</b>
      </p>
      <div className="rd-flate" role="img" aria-label={sammendrag}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={u.punkter} margin={{ top: 8, right: 24, bottom: 0, left: -12 }}>
            <CartesianGrid stroke="var(--sand-300)" vertical={false} />
            <XAxis dataKey="kort" tick={AKSE_TEKST} tickLine={false} axisLine={{ stroke: "var(--sand-300)" }} interval="preserveStartEnd" minTickGap={24} />
            <YAxis domain={[lav, hoy]} allowDecimals={false} tick={AKSE_TEKST} tickLine={false} axisLine={false} width={40} />
            <Tooltip content={<Verktoy />} cursor={{ stroke: "var(--graphite-600)", strokeDasharray: "3 3" }} />
            <Line type="linear" dataKey="brutto" stroke="var(--graphite-900)" strokeWidth={2} dot={{ r: 3, fill: "var(--graphite-900)", strokeWidth: 0 }} activeDot={{ r: 5 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="kilde">
        Eldste til nyeste, slag brutto.{u.utelatt > 0 ? ` ${u.utelatt} ${u.utelatt === 1 ? "ni-hullsrunde" : "ni-hullsrunder"} er ikke med.` : ""}
      </p>
    </div>
  );
}
