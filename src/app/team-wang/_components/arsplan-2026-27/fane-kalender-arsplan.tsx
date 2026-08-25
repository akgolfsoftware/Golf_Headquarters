"use client";

// Kalender-fanen: Tidslinje/Uke/Måned/År. Fasit:
// designsystem/wang/fasit/arsplan-2026-27/WANG Arsplan 2026-27.dc.html,
// seksjon #kalender.
//
// Tre regler MÅ bevares (README «Viktige regler … MÅ bevares»):
// 1. Hendelseschips brytes ALDRI av (white-space:normal, overflow-wrap:anywhere).
// 2. Rutenett har min-width:0 overalt — ingen sidescroll. Måned/År beholder
//    fasitens strenge repeat(7, minmax(0,1fr)) (kun tall + små chips i hver
//    celle). Uke bruker repeat(auto-fill, minmax(130px,1fr)) i stedet — syv
//    like brede kolonner på 375px ga ord brutt til ett tegn per linje, som
//    er teknisk "ikke klippet" men ikke lesbart. Samme prinsipp, bredere
//    kolonner der cellene har mer tekst.
// 3. Hver golføkt merkes med pyramideaksen, aldri generisk "golføkt" (kommer
//    ferdig fra byggEvents() i datamodulen — denne fila viser bare label).

import { useMemo, useState, type CSSProperties } from "react";

import { ARSPLAN_EVENTS, PERIODER, FASER, faseForPeriode, type HendelseType } from "../../_data/arsplan-fasit-2026-27";
import { d, WD_SHORT } from "../../_data/wang-plan";
import { Chip, PillGruppe, Seksjon, SeksjonHode, WangKort, leggTilDager, mandagAv } from "./primitiver";

const TYPE_INFO: Record<HendelseType, { navn: string; farge: string; tint: string }> = {
  okt: { navn: "Trening og samling", farge: "var(--wang-teal-text)", tint: "var(--tint-teal)" },
  prove: { navn: "Test og konkurranse", farge: "var(--cat-purple)", tint: "var(--tint-purple)" },
  skole: { navn: "Skole og ferie", farge: "var(--cat-blue)", tint: "var(--tint-blue)" },
  hendelse: { navn: "Merkedag", farge: "var(--cat-orange)", tint: "var(--tint-orange)" },
};

const MND_NAVN = ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"];

function EventChip({ label, type, time }: { label: string; type: HendelseType; time?: string }) {
  const info = TYPE_INFO[type];
  return (
    <Chip
      farge={info.farge}
      tint={info.tint}
      style={{ display: "block", width: "100%", height: "auto", padding: "3px 8px", boxSizing: "border-box" }}
    >
      {time ? time + " · " : ""}
      {label}
    </Chip>
  );
}

function ValgtDagKort({ valgtDag, onGaaTilTrening }: { valgtDag: string; onGaaTilTrening: () => void }) {
  const hendelser = ARSPLAN_EVENTS[valgtDag] ?? [];
  const dt = d(valgtDag);
  return (
    <WangKort style={{ marginTop: 16 }}>
      <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
        {WD_SHORT[dt.getUTCDay()]}. {dt.getUTCDate()}. {MND_NAVN[dt.getUTCMonth()].toLowerCase()} — valgt dag
      </div>
      {hendelser.length === 0 ? (
        <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Ingen hendelser denne dagen.</div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {hendelser.map((h, i) => {
            const info = TYPE_INFO[h.type];
            return (
              <button
                key={i}
                type="button"
                onClick={onGaaTilTrening}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--border-subtle)",
                  background: "var(--surface-card)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <Chip farge={info.farge} tint={info.tint}>
                    {info.navn}
                  </Chip>
                  <span style={{ fontSize: 13, color: "var(--text-primary)", overflowWrap: "anywhere" }}>
                    {h.time ? h.time + " · " : ""}
                    {h.label}
                  </span>
                </div>
                <span style={{ color: "var(--text-secondary)" }}>→</span>
              </button>
            );
          })}
        </div>
      )}
    </WangKort>
  );
}

function UkeVisning({ mandagIso, valgtDag, onVelgDag }: { mandagIso: string; valgtDag: string; onVelgDag: (d: string) => void }) {
  const dager = Array.from({ length: 7 }, (_, i) => leggTilDager(mandagIso, i));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
      {dager.map((isoDato) => {
        const dt = d(isoDato);
        const hendelser = ARSPLAN_EVENTS[isoDato] ?? [];
        const valgt = isoDato === valgtDag;
        return (
          <button
            key={isoDato}
            type="button"
            onClick={() => onVelgDag(isoDato)}
            style={{
              minWidth: 0,
              textAlign: "left",
              border: valgt ? "1.5px solid var(--wang-navy)" : "1px solid var(--border-subtle)",
              borderRadius: 12,
              background: "var(--surface-card)",
              padding: 8,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              minHeight: 100,
            }}
          >
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
              {WD_SHORT[dt.getUTCDay()]}. {dt.getUTCDate()}.
            </div>
            {hendelser.map((h, i) => (
              <EventChip key={i} label={h.label} type={h.type} time={h.time} />
            ))}
          </button>
        );
      })}
    </div>
  );
}

function MaanedVisning({
  aar,
  maaned,
  valgtDag,
  onVelgDag,
}: {
  aar: number;
  maaned: number;
  valgtDag: string;
  onVelgDag: (d: string) => void;
}) {
  const forsteIso = aar + "-" + String(maaned + 1).padStart(2, "0") + "-01";
  const forste = d(forsteIso);
  const dagerIMnd = new Date(Date.UTC(aar, maaned + 1, 0)).getUTCDate();
  const forskyv = (forste.getUTCDay() + 6) % 7;
  const celler: (string | null)[] = [...Array(forskyv).fill(null)];
  for (let day = 1; day <= dagerIMnd; day++) {
    celler.push(aar + "-" + String(maaned + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0"));
  }
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0,1fr))", gap: 6, marginBottom: 6 }}>
        {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((d2) => (
          <div key={d2} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", textAlign: "center" }}>
            {d2}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0,1fr))", gap: 6 }}>
        {celler.map((isoDato, i) => {
          if (!isoDato) return <div key={"tom-" + i} />;
          const hendelser = ARSPLAN_EVENTS[isoDato] ?? [];
          const valgt = isoDato === valgtDag;
          const dagNr = Number(isoDato.slice(8, 10));
          return (
            <button
              key={isoDato}
              type="button"
              onClick={() => onVelgDag(isoDato)}
              style={{
                minWidth: 0,
                minHeight: 74,
                textAlign: "left",
                border: valgt ? "1.5px solid var(--wang-navy)" : "1px solid var(--border-subtle)",
                borderRadius: 10,
                background: "var(--surface-card)",
                padding: 6,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{dagNr}</div>
              {hendelser.length ? (
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  {hendelser.slice(0, 4).map((h, i2) => (
                    <span
                      key={i2}
                      title={h.label}
                      style={{ width: 7, height: 7, borderRadius: "50%", background: TYPE_INFO[h.type].farge, flexShrink: 0 }}
                    />
                  ))}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AarVisning({ aar, onApneManed }: { aar: number; onApneManed: (m: number) => void }) {
  const maaneder = useMemo(() => {
    return MND_NAVN.map((navn, mi) => {
      const dagerIMnd = new Date(Date.UTC(aar, mi + 1, 0)).getUTCDate();
      let antall = 0;
      let farge = "var(--border-subtle)";
      for (let day = 1; day <= dagerIMnd; day++) {
        const isoDato = aar + "-" + String(mi + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
        const evs = ARSPLAN_EVENTS[isoDato] ?? [];
        antall += evs.length;
        if (evs.length && farge === "var(--border-subtle)") {
          const pri = evs.find((e) => e.type === "prove") ?? evs.find((e) => e.type === "hendelse") ?? evs[0];
          farge = TYPE_INFO[pri.type].farge;
        }
      }
      return { navn, antall, farge };
    });
  }, [aar]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 12 }}>
      {maaneder.map((m, i) => (
        <button
          key={m.navn}
          type="button"
          onClick={() => onApneManed(i)}
          style={{
            minWidth: 0,
            textAlign: "left",
            border: "1px solid var(--border-subtle)",
            borderRadius: 12,
            padding: 12,
            background: "var(--surface-card)",
            cursor: "pointer",
            borderTop: "3px solid " + m.farge,
          }}
        >
          <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 13 }}>{m.navn}</div>
          <div style={{ fontSize: 12, color: m.antall ? m.farge : "var(--text-secondary)", marginTop: 4 }}>
            {m.antall} hendelser
          </div>
        </button>
      ))}
    </div>
  );
}

function TidslinjeVisning({ onApnePeriode }: { onApnePeriode: (uker: string) => void }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {PERIODER.map((p) => {
        const f = FASER[faseForPeriode(p.id)];
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onApnePeriode(p.uker)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              textAlign: "left",
              border: "1px solid var(--border-subtle)",
              borderRadius: 14,
              padding: 14,
              background: "var(--surface-card)",
              cursor: "pointer",
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: f.farge, flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <Chip farge={f.tekst} tint={f.tint}>
                {p.navn}
              </Chip>
              <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700, fontSize: 14, marginTop: 4 }}>
                {p.uker} · {p.datoer}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{p.fokus}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function FaneKalenderArsplan({ onGaaTilTrening }: { onGaaTilTrening: () => void }) {
  const [visning, setVisning] = useState<"Tidslinje" | "Uke" | "Måned" | "År">("Tidslinje");
  const [valgtDag, setValgtDag] = useState("2026-08-17");
  const [aar, setAar] = useState(2026);
  const [maaned, setMaaned] = useState(7); // august (0-indeksert)

  const mandag = useMemo(() => mandagAv(valgtDag), [valgtDag]);

  return (
    <Seksjon id="kalender">
      <SeksjonHode nr={1} label="Fire visninger" tittel="Kalender" ingress="Tidslinje, uke, måned eller år — trykk en dag for å se hendelsene og hoppe til planen." />
      <PillGruppe
        valg={(["Tidslinje", "Uke", "Måned", "År"] as const).map((v) => ({
          label: v,
          aktiv: v === visning,
          onVelg: () => setVisning(v),
        }))}
      />
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", margin: "14px 0" }}>
        {(Object.keys(TYPE_INFO) as HendelseType[]).map((t) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: TYPE_INFO[t].farge }} />
            {TYPE_INFO[t].navn}
          </div>
        ))}
      </div>

      {visning === "Tidslinje" ? (
        <TidslinjeVisning
          onApnePeriode={() => {
            setVisning("Uke");
          }}
        />
      ) : null}

      {visning === "Uke" ? (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button type="button" onClick={() => setValgtDag(leggTilDager(mandag, -7))} style={navBtn}>
              ← Forrige uke
            </button>
            <button type="button" onClick={() => setValgtDag("2026-08-17")} style={navBtn}>
              I dag
            </button>
            <button type="button" onClick={() => setValgtDag(leggTilDager(mandag, 7))} style={navBtn}>
              Neste uke →
            </button>
          </div>
          <UkeVisning mandagIso={mandag} valgtDag={valgtDag} onVelgDag={setValgtDag} />
        </div>
      ) : null}

      {visning === "Måned" ? (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
            <button
              type="button"
              onClick={() => {
                if (maaned === 0) {
                  setMaaned(11);
                  setAar((a) => a - 1);
                } else setMaaned((m) => m - 1);
              }}
              style={navBtn}
            >
              ←
            </button>
            <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700 }}>
              {MND_NAVN[maaned]} {aar}
            </div>
            <button
              type="button"
              onClick={() => {
                if (maaned === 11) {
                  setMaaned(0);
                  setAar((a) => a + 1);
                } else setMaaned((m) => m + 1);
              }}
              style={navBtn}
            >
              →
            </button>
          </div>
          <MaanedVisning aar={aar} maaned={maaned} valgtDag={valgtDag} onVelgDag={setValgtDag} />
        </div>
      ) : null}

      {visning === "År" ? (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
            <button type="button" onClick={() => setAar((a) => a - 1)} style={navBtn}>
              ← {aar - 1}
            </button>
            <div style={{ fontFamily: "var(--font-brand)", fontWeight: 700 }}>{aar}</div>
            <button type="button" onClick={() => setAar((a) => a + 1)} style={navBtn}>
              {aar + 1} →
            </button>
          </div>
          <AarVisning
            aar={aar}
            onApneManed={(m) => {
              setMaaned(m);
              setVisning("Måned");
            }}
          />
        </div>
      ) : null}

      <ValgtDagKort valgtDag={valgtDag} onGaaTilTrening={onGaaTilTrening} />
    </Seksjon>
  );
}

const navBtn: CSSProperties = {
  fontFamily: "var(--font-brand)",
  fontWeight: 700,
  fontSize: 12.5,
  padding: "8px 14px",
  minHeight: 40,
  borderRadius: 999,
  border: "1px solid var(--border-subtle)",
  background: "var(--surface-card)",
  color: "var(--text-primary)",
  cursor: "pointer",
};
