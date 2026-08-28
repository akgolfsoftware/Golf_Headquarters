"use client";

/**
 * Kveldsjournal-artefaktet — dagens fasit. Fasit: jarvis/meg-kveldsjournal.html
 * (3-talls-rutenett, «Lukket i dag», «Restanse til i morgen», «Fanget i dag»).
 *
 * Bygget nesten utelukkende på ekte, allerede tilgjengelig data — ingen av
 * de tre listene trenger AI-brief-en fra me_brief: «Lukket i dag» er
 * dagens logg-rader (hentLogg()), «Restanse» er ventende Sak-rader,
 * «Fanget i dag» er Sak-rader med kanal TASK opprettet i dag (Fangsten,
 * skjerm 12). Har Meg-databasen en lagret kveldsjournal-tekst, vises den
 * som et tillegg øverst. «I morgen begynner med»/refleksjons-notatet til
 * ak-brain er utelatt — ak-brain er en lokal filstruktur på Mac Minien,
 * ikke noe Vercel kan skrive til.
 */
import { TL } from "@/lib/v2/train-lock";

import type { Sak } from "@/generated/prisma/client";
import { SakKanal, SakStatus } from "@/generated/prisma/enums";
import { sammeDag } from "@/lib/uke-helpers";
import type { BriefSnapshot, LoggRad } from "@/lib/jarvis/types";
import { FANGST_TYPE_LABEL, type FangstType } from "@/lib/jarvis/types";

function klokke(iso: string): string {
  return new Date(iso).toLocaleTimeString("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" });
}

function StatKort({ tall, label }: { tall: number; label: string }) {
  return (
    <div style={{ flex: 1, background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row, padding: 12 }}>
      <div style={{ fontFamily: TL.font.mono, fontSize: 24, fontWeight: 600, lineHeight: 1.1, color: TL.text }}>{tall}</div>
      <div style={{ fontFamily: TL.font.mono, fontSize: 9.5, letterSpacing: "0.07em", textTransform: "uppercase", color: TL.mute, marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

export function KveldsjournalArtefakt({
  saker,
  logg,
  brief,
  na,
  onVelgSak,
}: {
  saker: Sak[];
  logg: LoggRad[];
  brief: BriefSnapshot;
  na: Date;
  onVelgSak: (id: string) => void;
}) {
  const lukketIDag = logg.filter((l) => sammeDag(new Date(l.tidspunkt), na));
  const restanse = saker.filter((s) => s.status === SakStatus.VENTER);
  const fangetIDag = saker.filter((s) => s.kanal === SakKanal.TASK && sammeDag(s.opprettet, na));

  return (
    <div data-od-id="panel-kveldsjournal" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {brief.innhold && (
        <p style={{ fontFamily: TL.font.sans, fontSize: 14, lineHeight: 1.62, color: TL.text, maxWidth: "56ch", marginBottom: 16 }}>
          {brief.innhold}
        </p>
      )}

      <div data-od-id="panel-dagens-fasit" style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <StatKort tall={lukketIDag.length} label={`sak${lukketIDag.length === 1 ? "" : "er"} lukket i dag`} />
        <StatKort tall={restanse.length} label="restanse til i morgen" />
        <StatKort tall={fangetIDag.length} label="fanget i dag" />
      </div>

      <h2 style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>Lukket i dag</h2>
      {lukketIDag.length === 0 ? (
        <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, marginBottom: 16 }}>Ingenting lukket i dag ennå.</p>
      ) : (
        <ul style={{ listStyle: "none", margin: "0 0 16px", padding: 0 }}>
          {lukketIDag.map((l) => (
            <li key={l.id} style={{ display: "flex", gap: 8, alignItems: "baseline", padding: "3px 0", fontSize: 13, fontFamily: TL.font.sans, color: TL.text }}>
              <span style={{ color: TL.ok, fontFamily: TL.font.mono, flex: "none" }}>✓</span>
              <button
                type="button"
                onClick={() => l.sakId && onVelgSak(l.sakId)}
                disabled={!l.sakId}
                data-od-id={`cta-journal-lukket-${l.id}`}
                style={{ background: "none", border: 0, padding: 0, color: TL.text, cursor: l.sakId ? "pointer" : "default", fontFamily: TL.font.sans, fontSize: 13, textAlign: "left" }}
              >
                {l.handling}
              </button>
              <span style={{ marginLeft: "auto", flex: "none", fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>{klokke(l.tidspunkt)}</span>
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>Restanse til i morgen</h2>
      {restanse.length === 0 ? (
        <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, marginBottom: 16 }}>Ingen restanse — køen er tom.</p>
      ) : (
        <ul style={{ listStyle: "none", margin: "0 0 16px", padding: 0 }}>
          {restanse.map((s) => (
            <li key={s.id} style={{ display: "flex", gap: 8, padding: "3px 0", fontSize: 13, fontFamily: TL.font.sans, color: TL.text }}>
              <span style={{ color: TL.mute, flex: "none" }}>→</span>
              <button
                type="button"
                onClick={() => onVelgSak(s.id)}
                data-od-id={`cta-journal-restanse-${s.id}`}
                style={{ background: "none", border: 0, padding: 0, color: TL.text, textDecoration: "underline", cursor: "pointer", fontFamily: TL.font.sans, fontSize: 13 }}
              >
                {s.avsender ?? "Ukjent avsender"} · {s.emne ?? "—"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>Fanget i dag</h2>
      {fangetIDag.length === 0 ? (
        <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute }}>Ingenting fanget i dag.</p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {fangetIDag.map((s) => {
            const provType = (s.provenance as { type?: string } | null)?.type as FangstType | undefined;
            return (
              <li key={s.id} style={{ display: "flex", gap: 8, padding: "3px 0", fontSize: 13, fontFamily: TL.font.sans, color: TL.text }}>
                <span style={{ color: TL.mute, flex: "none" }}>→</span>
                <span>
                  {provType ? FANGST_TYPE_LABEL[provType] : s.emne}: {s.innhold}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <div style={{ fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 16 }}>
        {brief.generert ? `Generert ${klokke(brief.generert)}` : "Ingen kveldsjournal-tekst generert ennå"}
      </div>
    </div>
  );
}
