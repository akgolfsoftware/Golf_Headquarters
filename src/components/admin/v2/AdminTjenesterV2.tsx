"use client";

/**
 * AgencyOS v2 — Tjenester (`/admin/services`, AgencyOS Bølge 2.1, 2026-07-14).
 * Port fra `(legacy)/services/page.tsx` + `service-form.tsx` — samme
 * `createService`/`updateService`/`deleteService`-kontrakt (ekte `ServiceType`,
 * priceOre/durationMin). Ny/rediger er samme `BunnArk`-skjema (swap-content,
 * ingen modal-i-modal) — matcher idiomet fra `NyOvelseArk`/`DrillSkjemaFelter`.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Caps, Tittel, Kort, Rad, Knapp, StatusPill, BunnArk, T } from "@/components/v2";
import { Inndata, TekstOmraade, Avkryssing } from "@/components/v2/skjema";
import { createService, updateService, deleteService, type ServiceInput } from "@/app/admin/(legacy)/services/actions";

export interface AdminTjenesteV2Row {
  id: string;
  name: string;
  description: string | null;
  priceOre: number;
  durationMin: number;
  active: boolean;
}

function prisLabel(priceOre: number): string {
  const kr = priceOre / 100;
  return `${kr.toLocaleString("nb-NO", { maximumFractionDigits: priceOre % 100 === 0 ? 0 : 2 })} kr`;
}

function tallordTittel(n: number): { tittel: string; italic: string } {
  const TALLORD = ["Null", "Én", "To", "Tre", "Fire", "Fem", "Seks", "Sju", "Åtte", "Ni", "Ti", "Elleve", "Tolv"];
  return { tittel: n < TALLORD.length ? TALLORD[n] : String(n), italic: n === 1 ? "tjeneste." : "tjenester." };
}

function TjenesteSkjemaFelter({ initial, onLagret, onSlett, onAvbryt }: {
  initial?: AdminTjenesteV2Row;
  onLagret: () => void;
  onSlett?: () => void;
  onAvbryt: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priceKr, setPriceKr] = useState(initial ? String(initial.priceOre / 100) : "");
  const [durationMin, setDurationMin] = useState(initial ? String(initial.durationMin) : "60");
  const [active, setActive] = useState(initial?.active ?? true);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const lagre = () => {
    if (!name.trim()) { setFeil("Navn er påkrevd."); return; }
    const pris = Number(priceKr);
    const varighet = Number(durationMin);
    if (Number.isNaN(pris) || pris < 0) { setFeil("Pris må være et tall."); return; }
    if (Number.isNaN(varighet) || varighet < 5) { setFeil("Varighet må være minst 5 min."); return; }
    setFeil(null);
    const input: ServiceInput = { name, description, priceOre: Math.round(pris * 100), durationMin: varighet, active };
    startTransition(async () => {
      try {
        if (initial) await updateService(initial.id, input);
        else await createService(input);
        onLagret();
      } catch {
        setFeil("Kunne ikke lagre.");
      }
    });
  };

  const slett = () => {
    if (!initial || !onSlett) return;
    if (!confirm(`Slett tjenesten «${initial.name}»?`)) return;
    startTransition(async () => {
      try {
        await deleteService(initial.id);
        onSlett();
      } catch {
        setFeil("Kunne ikke slette.");
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
      <Inndata label="Navn" value={name} onChange={setName} placeholder="f.eks. Coaching 60 min" />
      <TekstOmraade label="Beskrivelse (valgfritt)" value={description} onChange={(v) => setDescription(v.slice(0, 300))} rows={2} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Inndata label="Pris (kr)" type="number" mono value={priceKr} onChange={setPriceKr} />
        <Inndata label="Varighet (min)" type="number" mono value={durationMin} onChange={setDurationMin} />
      </div>
      <Avkryssing label="Aktiv (kan bookes)" checked={active} onChange={setActive} />

      {feil && <div role="alert" style={{ fontFamily: T.ui, fontSize: 12.5, color: T.down }}>{feil}</div>}

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 4 }}>
        {initial && <Knapp ghost icon="trash" onClick={slett} disabled={pending}>Slett</Knapp>}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Knapp ghost onClick={onAvbryt} disabled={pending}>Avbryt</Knapp>
          <Knapp icon="check" onClick={lagre} disabled={pending}>{pending ? "Lagrer…" : "Lagre"}</Knapp>
        </div>
      </div>
    </div>
  );
}

export function AdminTjenesterV2({ tjenester }: { tjenester: AdminTjenesteV2Row[] }) {
  const router = useRouter();
  const [visSkjema, setVisSkjema] = useState<"ingen" | "ny" | AdminTjenesteV2Row>("ingen");
  const { tittel, italic } = tallordTittel(tjenester.length);

  const lukkAlt = () => {
    setVisSkjema("ingen");
    router.refresh();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <Caps size={9}>Gjennomføre · Tjenester</Caps>
          <Tittel em={italic}>{tittel}</Tittel>
          <div style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, marginTop: 4, maxWidth: 460 }}>
            Det spillere kan booke. Pris og varighet styrer booking-flyten og faktureringen.
          </div>
        </div>
        <Knapp icon="plus" onClick={() => setVisSkjema("ny")}>Ny tjeneste</Knapp>
      </div>

      <Kort pad="6px 14px">
        {tjenester.length === 0 ? (
          <div style={{ padding: "34px 10px", textAlign: "center", fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
            Ingen tjenester ennå — opprett den første.
          </div>
        ) : (
          tjenester.map((s, i) => (
            <Rad
              key={s.id}
              last={i === tjenester.length - 1}
              title={s.name}
              sub={`${s.durationMin} min · ${prisLabel(s.priceOre)}`}
              meta={<StatusPill tone={s.active ? "up" : "info"}>{s.active ? "Aktiv" : "Skjult"}</StatusPill>}
              trailing={<Knapp ghost onClick={() => setVisSkjema(s)}>Rediger</Knapp>}
            />
          ))
        )}
      </Kort>

      {visSkjema !== "ingen" && (
        <BunnArk tittel={visSkjema === "ny" ? "Ny tjeneste" : "Endre tjeneste"} onLukk={() => setVisSkjema("ingen")}>
          <TjenesteSkjemaFelter
            initial={visSkjema === "ny" ? undefined : visSkjema}
            onLagret={lukkAlt}
            onSlett={lukkAlt}
            onAvbryt={() => setVisSkjema("ingen")}
          />
        </BunnArk>
      )}
    </div>
  );
}
