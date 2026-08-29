"use client";

/**
 * AO-05 Projects gruppert på Area. Tom = hel setning, ingen oppdiktede tall.
 * Fasit: designsystem/train-lock/AO-05 Projects og Tasks.dc.html (listen —
 * AO-06 Project-ark og AO-07 Task-ark, klikk-gjennom detaljark i samme fil,
 * er IKKE bygget: radene har verken href eller onClick ennå. Dokumentert
 * avvik, ikke løst i PX-6 — se PR-beskrivelsen.)
 */

import { TL } from "@/lib/v2/train-lock";
import type { AgenticosProjectsData } from "@/lib/agencyos/last-agenticos";
import { AoCaps, AoKnapp, AoRad, AoTom } from "./tl-agenticos";

export function AdminAgenticosProjects({ data }: { data: AgenticosProjectsData }) {
  const n = data.grupper.reduce((s, g) => s + g.rader.length, 0);

  return (
    <div data-screen-label="AO-05 Projects" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          paddingBottom: 16,
          borderBottom: `1px solid ${TL.hair}`,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 700, color: TL.text }}>Projects</span>
        <span style={{ fontSize: 11, color: TL.mute }}>
          {n === 0 ? "7 areas" : `7 areas · ${n} ${n === 1 ? "prosjekt" : "prosjekter"}`}
        </span>
        <div style={{ flex: 1 }} />
        <AoKnapp variant="primaer" href="/admin/workspace">
          Nytt prosjekt
        </AoKnapp>
      </div>

      {n === 0 ? (
        <AoTom
          tittel="Ingen prosjekter ennå"
          tekst="Projects grupperes på AKADEMI · PRODUKT · AGENTICOS · ØKONOMI · INNHOLD · PERSONLIG · DRIFT når de lander fra workspace."
          cta={<AoKnapp variant="primaer" href="/admin/workspace">Åpne workspace</AoKnapp>}
        />
      ) : (
        <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: 14 }}>
          {data.grupper.map((g) => (
            <div key={g.area}>
              <div style={{ marginBottom: 4 }}>
                <AoCaps color={TL.warm}>{g.label}</AoCaps>
              </div>
              {g.rader.map((r, i) => (
                <AoRad key={r.id} last={i === g.rader.length - 1}>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: TL.text }}>{r.tittel}</span>
                  <span style={{ fontSize: 11, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{r.meta}</span>
                </AoRad>
              ))}
            </div>
          ))}
          {data.tomme ? <p style={{ margin: 0, fontSize: 12, color: TL.mute }}>{data.tomme}</p> : null}
        </div>
      )}
    </div>
  );
}


