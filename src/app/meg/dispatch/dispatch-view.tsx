"use client";

// Klient-visning for Dispatch. Enkelt-kolonne, tilpasser seg /meg sitt
// eksisterende, bevisst minimale layout (ingen full sidenav — /meg er en
// personlig snarvei for Anders, ikke del av AgencyOS-menyen).
import { useState } from "react";
import Link from "next/link";
import { Kort, Caps, TallHero } from "@/components/v2/core";
import { Icon } from "@/components/v2/icon";
import { T } from "@/lib/v2/tokens";
import type { PauseKort } from "@/lib/meg/dispatch-data";
import { MeldingRad, KanVente, VaktStripe, MegToastProvider } from "@/components/meg/dispatch-ui";

function TierSub({ meldinger }: { meldinger: PauseKort["meldinger"] }) {
  const c = { brudd: 0, haster: 0, ok: 0 };
  meldinger.forEach((m) => c[m.tier]++);
  const deler: [string, number, string, string][] = [
    ["brudd", c.brudd, "BRUDD", T.down],
    ["haster", c.haster, "HASTER", T.warn],
    ["ok", c.ok, "OK", T.up],
  ].filter(([, n]) => (n as number) > 0) as [string, number, string, string][];
  if (deler.length === 0) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      {deler.map(([key, n, label, color]) => (
        <span key={key} style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color }}>{n} {label}</span>
      ))}
    </span>
  );
}

function AjourHero({ neste }: { neste: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ width: 40, height: 40, borderRadius: 9999, background: `color-mix(in srgb,${T.up} 16%,transparent)`, border: `1px solid ${T.up}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
        <Icon name="check" size={19} style={{ color: T.up }} />
      </span>
      <div>
        <div style={{ fontFamily: T.disp, fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: T.fg, lineHeight: 1.1 }}>Ajour.</div>
        <Caps size={9} style={{ marginTop: 5 }}>Neste sjekk {neste}</Caps>
      </div>
    </div>
  );
}

function DispatchContent({ data }: { data: PauseKort }) {
  const [handtert, setHandtert] = useState<Record<string, true>>({});
  const synlige = data.meldinger.filter((m) => !handtert[m.id]);
  const nesteId = synlige[0]?.id;
  const ajour = synlige.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Kort tint pad="18px 18px 16px" action={<Caps size={9}>{data.vakt.neste}</Caps>}>
        {ajour ? (
          <AjourHero neste={data.vakt.neste} />
        ) : (
          <TallHero label="Ubesvarte" value={synlige.length} accent size={48} sub={<TierSub meldinger={synlige} />} />
        )}
        <div style={{ marginTop: 14 }}>
          <VaktStripe vakt={data.vakt} kilder={data.kilder} notis={data.notis} mobile />
        </div>
      </Kort>

      {ajour ? (
        <Kort>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", padding: "10px 16px" }}>
            <Icon name="check" size={19} style={{ color: T.mut }} />
            <div>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Alt besvart</div>
              <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.6, margin: "6px 0 0" }}>
                Neste sjekk {data.vakt.neste}. Vakten sjekker Gmail, iMessage og Beeper hver time.
              </p>
            </div>
          </div>
        </Kort>
      ) : (
        <Kort eyebrow="Meldinger" pad="4px 16px 6px">
          {synlige.map((m) => (
            <MeldingRad
              key={m.id}
              m={m}
              vakt={data.vakt}
              neste={m.id === nesteId}
              mobile
              onHandtert={(id) => setHandtert((p) => ({ ...p, [id]: true }))}
            />
          ))}
        </Kort>
      )}

      <KanVente items={data.kanVente} mobile />
    </div>
  );
}

export function DispatchView({ data }: { data: PauseKort | null }) {
  return (
    <div style={{ position: "relative" }}>
      <MegToastProvider>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <Caps size={9}>AgencyOS · Meg</Caps>
            <h1 style={{ fontFamily: T.disp, fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: T.fg, margin: "6px 0 0" }}>Dispatch</h1>
          </div>
          <Link href="/meg/morgenbrief" style={{ fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg2, textDecoration: "none" }}>
            Morgenbrief →
          </Link>
        </div>

        {data ? (
          <DispatchContent data={data} />
        ) : (
          <Kort>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", padding: "26px 16px" }}>
              <Icon name="inbox" size={19} style={{ color: T.mut }} />
              <div>
                <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Ingen data ennå</div>
                <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.6, margin: "6px 0 0", maxWidth: 320 }}>
                  Vakten på Mac Mini har ikke skrevet et pause-kort ennå, eller denne appen kjører et sted uten
                  tilgang til Mac Mini-filsystemet. Kjør «sla-vakt-pause» én gang, eller sjekk fra Mac Mini.
                </p>
              </div>
            </div>
          </Kort>
        )}
      </MegToastProvider>
    </div>
  );
}
