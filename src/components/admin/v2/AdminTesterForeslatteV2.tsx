"use client";

/**
 * AgencyOS v2 — Tester · Foreslåtte tester (`/admin/tester/foreslatte`,
 * AgencyOS Bølge 3.26, 2026-07-14). Port fra `(legacy)/tester/foreslatte/
 * page.tsx` + `test-kort.tsx` — samme `TestDefinition`-datamodell
 * (isCustom + visibility=COACH + isCoachApproved=false), samme
 * `godkjennForslag`/`avvisForslag`-server-action-kontrakt.
 */

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/toast-provider";
import { Caps, Tittel, Kort, Knapp, StatusPill, Icon, T } from "@/components/v2";
import { avvisForslag, godkjennForslag } from "@/app/admin/(legacy)/tester/foreslatte/actions";

export interface ForeslattTestV2 {
  id: string;
  name: string;
  description: string | null;
  pyramidArea: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  scoringRule: string;
  protocol: unknown;
  createdAt: string;
  forfatter: string;
}

function protokollSteg(protocol: unknown): string[] {
  if (protocol && typeof protocol === "object" && !Array.isArray(protocol) && "steg" in protocol && Array.isArray((protocol as { steg: unknown }).steg)) {
    return ((protocol as { steg: unknown[] }).steg).filter((s): s is string => typeof s === "string");
  }
  return [];
}

function malverdier(protocol: unknown): Record<string, string> {
  if (protocol && typeof protocol === "object" && !Array.isArray(protocol) && "malverdi" in protocol) {
    const m = (protocol as { malverdi: unknown }).malverdi;
    if (m && typeof m === "object" && !Array.isArray(m) && "nivaaer" in m && typeof (m as { nivaaer: unknown }).nivaaer === "object") {
      const obj = (m as { nivaaer: Record<string, unknown> }).nivaaer;
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(obj)) if (typeof v === "string") out[k] = v;
      return out;
    }
  }
  return {};
}

function ForeslattTestKortV2({ test }: { test: ForeslattTestV2 }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  function godkjenn() {
    startTransition(async () => {
      try {
        await godkjennForslag({ id: test.id });
        toast.success(`«${test.name}» er godkjent og synlig for akademi.`);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Kunne ikke godkjenne testen.");
      }
    });
  }

  function avvis() {
    if (!confirm(`Avvis og slett «${test.name}»?`)) return;
    startTransition(async () => {
      try {
        await avvisForslag({ id: test.id });
        toast.success(`«${test.name}» ble avvist.`);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Kunne ikke avvise testen.");
      }
    });
  }

  const steg = protokollSteg(test.protocol);
  const nivaaer = malverdier(test.protocol);
  const opprettet = new Date(test.createdAt).toLocaleDateString("nb-NO", { day: "2-digit", month: "short" });

  return (
    <Kort style={{ height: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>{test.name}</div>
          <div style={{ marginTop: 4, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: T.mut }}>
            <Icon name="user" size={12} />{test.forfatter} · {opprettet}
          </div>
        </div>
        <StatusPill tone="info">{test.pyramidArea}</StatusPill>
      </div>

      {test.description && <p style={{ marginTop: 8, fontFamily: T.ui, fontSize: 13, color: T.mut }}>{test.description}</p>}

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10, fontFamily: T.ui, fontSize: 13 }}>
        <div>
          <Caps size={9}>Scoring</Caps>
          <div style={{ marginTop: 4, color: T.fg }}>{test.scoringRule}</div>
        </div>

        {steg.length > 0 && (
          <div>
            <Caps size={9}>Protokoll</Caps>
            <ol style={{ marginTop: 4, display: "flex", flexDirection: "column", gap: 3 }}>
              {steg.map((s, i) => (
                <li key={i} style={{ display: "flex", gap: 6, fontSize: 12 }}>
                  <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.lime }}>{i + 1}.</span>
                  <span style={{ color: T.fg }}>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {Object.keys(nivaaer).length > 0 && (
          <div>
            <Caps size={9}>Mål-verdier per nivå</Caps>
            <div style={{ marginTop: 4, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, fontSize: 12 }}>
              {Object.entries(nivaaer).map(([nivaa, verdi]) => (
                <div key={nivaa}>
                  <div style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", color: T.mut }}>{nivaa}</div>
                  <div style={{ marginTop: 2, fontFamily: T.mono, color: T.fg }}>{verdi}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: "auto", paddingTop: 14, borderTop: `1px solid ${T.border}`, display: "flex", gap: 8 }}>
        <Knapp full icon="check" onClick={godkjenn} disabled={pending}>Godkjenn</Knapp>
        <Knapp ghost icon="trash" onClick={avvis} disabled={pending}>Avvis</Knapp>
      </div>
    </Kort>
  );
}

export function AdminTesterForeslatteV2({ foreslaatte }: { foreslaatte: ForeslattTestV2[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Link href="/admin/tester" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", color: T.mut, fontFamily: T.mono, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          <Icon name="chevron-left" size={13} />Tilbake til stall
        </Link>
        <div style={{ marginTop: 8 }}>
          <Caps size={9}>AgencyOS · Tester · Foreslåtte</Caps>
          <Tittel em="tester">Foreslåtte</Tittel>
          <p style={{ marginTop: 6, fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Spillere har sendt inn egne tester for godkjenning. Godkjente tester blir tilgjengelige for hele akademi.</p>
        </div>
      </div>

      {foreslaatte.length === 0 ? (
        <Kort>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "36px 16px", textAlign: "center" }}>
            <Icon name="sparkles" size={22} style={{ color: T.mut }} />
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>Ingen forslag i køen</div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>Når en spiller foreslår en ny test til deg, dukker den opp her.</p>
          </div>
        </Kort>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: T.gap }}>
          {foreslaatte.map((t) => <ForeslattTestKortV2 key={t.id} test={t} />)}
        </div>
      )}
    </div>
  );
}
