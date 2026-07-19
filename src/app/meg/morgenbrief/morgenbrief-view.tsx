"use client";

import { useState } from "react";
import Link from "next/link";
import { Kort, Caps, KpiFlis, PillTabs, PillVelger, Rad, StatusPill } from "@/components/v2/core";
import { Icon } from "@/components/v2/icon";
import { T } from "@/lib/v2/tokens";
import type { Morgenbrief, KategoriKey } from "@/lib/meg/dispatch-data";
import { MeldingRad, KildePill, SegTekst, MegToastProvider } from "@/components/meg/dispatch-ui";

const KATEGORI_NAVN: Record<KategoriKey, string> = {
  kjoring: "Kjøring",
  wang: "WANG Toppidrett",
  moete: "Møte",
  akademi: "AK Golf Academy",
  familie: "Familie",
};

const KAT_TONE: Record<KategoriKey, string> = {
  kjoring: T.info,
  wang: T.up,
  moete: T.mut,
  akademi: T.warn,
  familie: T.down,
};

function SeksjonMeldinger({ meldinger, vakt }: { meldinger: Morgenbrief["meldinger"]; vakt: { sist: string } }) {
  const [alle, setAlle] = useState(false);
  const synlige = alle ? meldinger : meldinger.slice(0, 3);
  const skjult = meldinger.length - 3;

  return (
    <Kort eyebrow="Meldinger" pad="4px 16px 8px" action={<Link href="/meg/dispatch" style={{ fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: T.fg2, textDecoration: "none" }}>Åpne Dispatch →</Link>}>
      {meldinger.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", padding: "20px 16px" }}>
          <Icon name="check" size={19} style={{ color: T.mut }} />
          <div style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2 }}>Ingen ubesvarte — alt er besvart.</div>
        </div>
      ) : (
        <>
          {synlige.map((m) => <MeldingRad key={m.id} m={m} vakt={vakt} mobile />)}
          {skjult > 0 && (
            <button onClick={() => setAlle((v) => !v)} style={{ appearance: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%", minHeight: 42, border: "none", background: "transparent", cursor: "pointer", fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg2 }}>
              {alle ? "Vis færre" : `Vis alle (${meldinger.length})`}
              <Icon name={alle ? "chevron-up" : "chevron-down"} size={13} style={{ color: T.mut }} />
            </button>
          )}
        </>
      )}
    </Kort>
  );
}

function SeksjonOppgaver({ oppgaver }: { oppgaver: Morgenbrief["oppgaver"] }) {
  const [bucket, setBucket] = useState<"forfalt" | "idag" | "uka">(oppgaver.forfalt.length ? "forfalt" : "idag");
  const nF = oppgaver.forfalt.length, nI = oppgaver.idag.length, nU = oppgaver.uka.length;
  const liste = oppgaver[bucket];

  return (
    <Kort eyebrow="Oppgaver">
      <div className="grid grid-cols-3" style={{ gap: 10 }}>
        <KpiFlis label="Forfalt" value={nF} dir={nF > 0 ? "down" : undefined} varsle={nF > 0} />
        <KpiFlis label="I dag" value={nI} />
        <KpiFlis label="Denne uka" value={nU} />
      </div>
      <div style={{ marginTop: 14 }}>
        <PillTabs
          tabs={[
            { id: "forfalt", l: `Forfalt (${nF})` },
            { id: "idag", l: `I dag (${nI})` },
            { id: "uka", l: `Uka (${nU})` },
          ]}
          value={bucket}
          onChange={(id) => setBucket(id as "forfalt" | "idag" | "uka")}
        />
      </div>
      <div style={{ marginTop: 10 }}>
        {liste.length === 0 ? (
          <div style={{ padding: "10px 2px", fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Ingen oppgaver her.</div>
        ) : (
          liste.map((o, i) => (
            <Rad
              key={o.id}
              last={i === liste.length - 1}
              title={o.t}
              sub={o.virk}
              meta={bucket === "forfalt" ? <StatusPill tone="down">{o.frist}</StatusPill> : <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>{o.frist}</span>}
              trailing={null}
            />
          ))
        )}
      </div>
    </Kort>
  );
}

function SeksjonKalender({ kalender }: { kalender: Morgenbrief["kalender"] }) {
  const [dag, setDag] = useState<"idag" | "imorgen">("idag");
  const events = kalender[dag];

  return (
    <Kort eyebrow="Kalender" action={<PillVelger options={[{ v: "idag", l: "I dag" }, { v: "imorgen", l: "I morgen" }]} value={dag} onChange={(v) => setDag(v as "idag" | "imorgen")} />}>
      {events.length === 0 ? (
        <div style={{ padding: "10px 2px", fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Ingen hendelser.</div>
      ) : (
        events.map((e, i) => (
          <div key={e.id}>
            <Rad
              last={i === events.length - 1 && !e.konflikt}
              leading={
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, width: 40, flex: "none" }}>
                  <span style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, color: T.fg2 }}>{e.kl}</span>
                  <span style={{ width: 8, height: 8, borderRadius: 9999, background: KAT_TONE[e.kat], flex: "none" }} />
                </div>
              }
              title={e.tittel}
              sub={`${KATEGORI_NAVN[e.kat]}${e.sted ? " · " + e.sted : ""}`}
              meta={<span style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut }}>{e.varighet}</span>}
              trailing={null}
            />
            {e.konflikt && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "0 0 11px 52px", borderBottom: i === events.length - 1 ? "none" : `1px solid ${T.border}` }}>
                <StatusPill tone="down">KONFLIKT</StatusPill>
                <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.down }}>{e.konflikt}</span>
              </div>
            )}
          </div>
        ))
      )}
    </Kort>
  );
}

function SeksjonNesteSteg({ steg }: { steg: Morgenbrief["nesteSteg"] }) {
  const [gjort, setGjort] = useState<Record<string, true>>({});
  if (steg.length === 0) return null;

  return (
    <Kort eyebrow="Neste steg">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {steg.map((s, i) => {
          const done = !!gjort[s.id];
          return (
            <button
              key={s.id}
              onClick={() => setGjort((p) => ({ ...p, [s.id]: true }))}
              aria-pressed={done}
              style={{ appearance: "none", display: "flex", gap: 11, width: "100%", textAlign: "left", alignItems: "flex-start", padding: "11px 12px", minHeight: 46, borderRadius: 12, border: `1px solid ${T.border}`, background: T.panel2, cursor: "pointer", opacity: done ? 0.55 : 1, transition: `opacity ${T.dur}ms ${T.ease}` }}
            >
              <span style={{ width: 21, height: 21, flex: "none", borderRadius: 9999, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: 10, fontWeight: 700, background: done ? `color-mix(in srgb,${T.up} 18%,transparent)` : T.panel3, color: done ? T.up : T.fg2, border: `1px solid ${done ? T.up : T.borderS}` }}>
                {done ? <Icon name="check" size={11} /> : i + 1}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: T.ui, fontSize: 13, fontWeight: 500, color: done ? T.mut : T.fg, lineHeight: 1.45, textDecoration: done ? "line-through" : "none" }}>
                  <SegTekst seg={s.seg} strongColor={done ? T.mut : T.fg} />
                </span>
                <span style={{ display: "block", marginTop: 5, fontFamily: T.mono, fontSize: 8.5, color: T.mut, letterSpacing: "0.07em" }}>{s.kilde}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Kort>
  );
}

export function MorgenbriefView({ data }: { data: Morgenbrief | null }) {
  return (
    <div style={{ position: "relative" }}>
      <MegToastProvider>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          {data?.kilder.map((k) => <KildePill key={k.id} kilde={k} />)}
          <span style={{ flex: 1 }} />
          <Link href="/meg/dispatch" style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg2, textDecoration: "none" }}>
            Dispatch →
          </Link>
        </div>
        <Caps size={9}>AgencyOS · Meg</Caps>
        <h1 style={{ fontFamily: T.disp, fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: T.fg, margin: "6px 0 0" }}>Morgenbrief</h1>
        {data && (
          <Caps size={9.5} style={{ marginTop: 6 }}>Generert {data.vakt.generert} · Vakt sjekket {data.vakt.sist}</Caps>
        )}

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          {data ? (
            <>
              <SeksjonMeldinger meldinger={data.meldinger} vakt={data.vakt} />
              <SeksjonOppgaver oppgaver={data.oppgaver} />
              <SeksjonKalender kalender={data.kalender} />
              <SeksjonNesteSteg steg={data.nesteSteg} />
            </>
          ) : (
            <Kort>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", padding: "26px 16px" }}>
                <Icon name="inbox" size={19} style={{ color: T.mut }} />
                <div>
                  <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Ingen morgenbrief ennå</div>
                  <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.6, margin: "6px 0 0", maxWidth: 320 }}>
                    Vakten på Mac Mini skriver denne kl. 06:33 hver dag, eller denne appen kjører et sted uten
                    tilgang til Mac Mini-filsystemet.
                  </p>
                </div>
              </div>
            </Kort>
          )}
        </div>
      </MegToastProvider>
    </div>
  );
}
