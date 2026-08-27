"use client";

/**
 * Coachens per-økt live-visning (T9, 27.08.2026 — Train-lock).
 * «UNDER-flata mens økta pågår», søsterflate til FangstSheet.
 *
 * Ingen egen fasit-ID finnes for denne detaljskjermen (§5T klasse
 * A-mønster: detalj under en hub med fasit, se AG-09). Kortidiomet
 * (TlKort/TlCaps/TL.warm-hake) er hentet fra AG-09/TM-11-fasitene som
 * allerede er portet i denne bølgen — ikke en ny stil.
 *
 * Fjernet i denne porten: de utgåtte M0–M5-miljø-etikettene (CLAUDE.md
 * §Låste beslutninger 18.08 — formelen er pensjonert). `practiceType`
 * (Blokk/Random/Konkurranse/Spill·test) er reell og vises i stedet.
 *
 * «Start opptak» sender coachen til opptaksverktøyet med økta i URL-en
 * (/admin/recording?okt=<id>). Opptaket knyttes da til økta, og transkript
 * + analyse dukker opp på denne flata når det er ferdig behandlet.
 */

import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { TlCaps, TlKnapp, TlKort, TlTomTilstand } from "@/components/admin/v2/oppsett/tl-kit";
import type { LiveOktData } from "@/lib/agencyos/live-okt-data";

const PRACTICE_TYPE_LABEL: Record<string, string> = {
  BLOKK: "Blokk",
  RANDOM: "Random",
  KONKURRANSE: "Konkurranse",
  SPILL_TEST: "Spill/test",
};

const STATUS_LABEL: Record<string, string> = {
  PLANNED: "Planlagt",
  IN_PROGRESS: "Pågår",
  COMPLETED: "Fullført",
  CANCELLED: "Avlyst",
  SKIPPED: "Hoppet over",
};

function Linje({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: `1px solid ${TL.hair}` }}>
      <span style={{ fontSize: 12.5, color: TL.mute }}>{k}</span>
      <span style={{ fontFamily: TL.font.mono, fontSize: 13, fontWeight: 700, color: TL.text }}>{v}</span>
    </div>
  );
}

function fmtVarighet(sec: number | null): string {
  if (sec == null) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function LiveOktCoachV2({ data }: { data: LiveOktData }) {
  const startDato = new Date(data.startTime).toLocaleDateString("nb-NO", { weekday: "short", day: "numeric", month: "short" });
  const startTid = new Date(data.startTime).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  const praksisLabel = PRACTICE_TYPE_LABEL[data.type] ?? data.type;
  const statusLabel = STATUS_LABEL[data.status] ?? data.status;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, width: "100%", maxWidth: 1080 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: TL.text }}>{data.tittel}</h1>
        <span style={{ display: "block", fontSize: 13, color: TL.mute, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
          {startDato} · {startTid} · {praksisLabel}
        </span>
      </div>

      {!data.opptak && (
        <div
          style={{
            background: TL.elev,
            borderRadius: TL.radius.card,
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <TlCaps size={10}>Én ting nå</TlCaps>
          <div style={{ fontSize: 18, fontWeight: 700, color: TL.text }}>Start opptaket før du sier noe</div>
          <p style={{ margin: 0, fontSize: 13, color: TL.mute, lineHeight: 1.5 }}>
            Alt du sier fra du trykker og til du stopper blir til transkript, analyse og hjemmelekse. Starter du sent,
            mister spilleren begynnelsen av det du forklarte.
          </p>
          <div>
            <TlKnapp href={`/admin/recording?okt=${data.id}`} variant="primaer" icon="mic">
              Start opptak
            </TlKnapp>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr]" style={{ gap: 18, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <TlKort eyebrow="Økta">
            <Linje k="Spiller" v={data.spillerNavn ?? "ikke satt"} />
            <Linje k="Coach" v={data.coachNavn ?? "—"} />
            <Linje k="Sted" v={data.sted ?? "ikke satt"} />
            <Linje k="Praksistype" v={praksisLabel} />
            <Linje k="Status" v={statusLabel} />
            {data.malsetning && (
              <p style={{ margin: "12px 0 0", fontSize: 12.5, color: TL.mute, lineHeight: 1.5 }}>{data.malsetning}</p>
            )}
          </TlKort>

          <TlKort eyebrow="Løpet">
            {data.driller.length === 0 ? (
              <TlTomTilstand icon="list" title="Ingen driller på denne økta" sub="Driller dukker opp her når de er lagt inn på økta." />
            ) : (
              data.driller.map((d, i) => (
                <div
                  key={d.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: i === data.driller.length - 1 ? "none" : `1px solid ${TL.hair}`,
                  }}
                >
                  <span style={{ fontSize: 13, color: TL.text }}>{d.navn}</span>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 12, color: TL.mute }}>
                    {d.pyramide} · {d.varighetMin} min
                  </span>
                </div>
              ))
            )}
          </TlKort>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <TlKort eyebrow="Opptak">
            <div style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>Lyd fra økta</div>
            {data.opptak ? (
              <>
                <p style={{ margin: "8px 0 0", fontFamily: TL.font.mono, fontSize: 24, fontWeight: 600, color: TL.text }}>
                  {fmtVarighet(data.opptak.durationSec)}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: TL.mute }}>status: {data.opptak.status.toLowerCase()}</p>
              </>
            ) : (
              <p style={{ margin: "10px 0 0", fontSize: 12.5, color: TL.mute, lineHeight: 1.5 }}>
                Ingen opptak på denne økta ennå. Opptaket startes fra Én ting nå øverst.
              </p>
            )}
          </TlKort>

          <TlKort eyebrow="Siste analyse">
            {data.opptak?.coachAnalyse ? (
              <p style={{ margin: 0, fontSize: 12.5, color: TL.mute, lineHeight: 1.5 }}>{data.opptak.coachAnalyse}</p>
            ) : (
              <>
                <div style={{ fontSize: 14, fontWeight: 600, color: TL.text }}>Ingen analyse for denne økta</div>
                <p style={{ margin: "6px 0 0", fontSize: 12.5, color: TL.mute, lineHeight: 1.5 }}>
                  {data.opptak
                    ? "Analysen lages av opptaket. Kjøres når opptaket er ferdig transkribert."
                    : "Analysen lages av opptaket. Start opptaket øverst, så kommer analysen hit når den er ferdig."}
                </p>
              </>
            )}
          </TlKort>

          <TlKort eyebrow="Transkript">
            {data.opptak?.transcript ? (
              <p style={{ margin: 0, fontSize: 12.5, color: TL.mute, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                {data.opptak.transcript}
              </p>
            ) : (
              <TlTomTilstand icon="file-text" title="Ingen transkript ennå" sub="Kommer når opptaket er ferdig behandlet." />
            )}
          </TlKort>
        </div>
      </div>

      <Link href="/admin/agencyos/live" style={{ alignSelf: "flex-start" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: TL.mute }}>
          <Icon name="arrow-left" size={14} />
          Tilbake til Tavla
        </span>
      </Link>
    </div>
  );
}
