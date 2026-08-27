"use client";

/**
 * AgencyOS — Eksterne lesere, Train-lock (T13-detaljer, 27.08.2026).
 *
 * Port av `AdminEksternLeserV2` (Paper/T.*) til Train-lock (TL.*) — CLAUDE.md
 * invariant 2. Samme datakontrakt og SAMME server actions (opprettEksternLeser,
 * trekkEksternLeser) uendret — designport, ikke funksjonsendring.
 *
 * Ingen egen fasit tegner denne skjermen; layout/felt-mønster følger
 * `AdminProfilTrainLock.tsx` (skjema-kort + rad-liste i eget kort).
 */

import { useState, useTransition } from "react";
import { TL } from "@/lib/v2/train-lock";
import {
  DELING_SCOPES,
  type DelingScope,
} from "@/lib/deling/samtykke-regler";
import {
  opprettEksternLeser,
  trekkEksternLeser,
} from "@/app/admin/(legacy)/team/ekstern-leser-actions";
import { TlCaps, TlKnapp, TlKort, TlRad, TlRadGruppe, TlTittel, TlTomTilstand } from "./tl-kit";

const SCOPE_LABEL: Record<DelingScope, string> = {
  TEST_RESULTATER: "Testresultater",
  STATS: "Statistikk",
};

export type EksternLeserRad = {
  id: string;
  navn: string;
  epost: string;
  grupper: string[];
};

function TlFelt({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  feil,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  feil?: string;
}) {
  return (
    <div>
      <div style={{ marginBottom: 8 }}><TlCaps size={10}>{label}</TlCaps></div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          height: 44,
          padding: "0 14px",
          borderRadius: TL.radius.field,
          background: TL.dock,
          boxShadow: `inset 0 0 0 1px ${TL.hair}`,
          color: TL.text,
          fontSize: 14,
          fontFamily: TL.font.sans,
          border: "none",
        }}
      />
      {feil && <p style={{ margin: "6px 0 0", fontSize: 11, color: TL.danger }}>{feil}</p>}
    </div>
  );
}

function TlAvkryssing({ label, checked, onChange }: { label: string; checked: boolean; onChange: (on: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, color: TL.text }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 18, height: 18, accentColor: TL.fill }} />
      {label}
    </label>
  );
}

export function AdminEksternLeserTrainLock({
  grupper,
  lesere,
}: {
  grupper: { id: string; name: string }[];
  lesere: EksternLeserRad[];
}) {
  const [pending, startTransition] = useTransition();
  const [navn, setNavn] = useState("");
  const [epost, setEpost] = useState("");
  const [valgteGrupper, setValgteGrupper] = useState<string[]>([]);
  const [valgteScopes, setValgteScopes] = useState<DelingScope[]>([
    "TEST_RESULTATER",
    "STATS",
  ]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string | null>(null);

  function toggle<Type extends string>(
    liste: Type[],
    sett: (v: Type[]) => void,
    verdi: Type,
    on: boolean,
  ) {
    sett(on ? [...new Set([...liste, verdi])] : liste.filter((v) => v !== verdi));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setFieldErrors({});
    setSuccess(null);

    startTransition(async () => {
      const res = await opprettEksternLeser(
        epost.trim(),
        navn.trim(),
        valgteGrupper,
        valgteScopes,
      );
      if (!res.ok) {
        setError(res.error);
        setFieldErrors(res.fieldErrors ?? {});
        return;
      }
      setSuccess(
        res.epostSendt
          ? "Ekstern leser opprettet. Invitasjons-e-post er sendt."
          : "Ekstern leser opprettet. E-post ble ikke sendt (Resend ikke konfigurert).",
      );
      setNavn("");
      setEpost("");
      setValgteGrupper([]);
    });
  }

  function handleTrekk(userId: string) {
    if (pending) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await trekkEksternLeser(userId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess("Tilgangen er trukket.");
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 640, margin: "0 auto", width: "100%" }}>
      <TlTittel sub="Team">
        Eksterne lesere
      </TlTittel>
      <p style={{ margin: 0, fontSize: 13, color: TL.mute, lineHeight: 1.55, maxWidth: 480 }}>
        Team Norway-/WANG-ansvarlige med egen innlogging. De ser KUN
        testresultater og statistikk for spillere som har samtykket til
        deling — aldri treningsplaner. Uten samtykke ser de ingenting.
      </p>

      <TlKort eyebrow="Ny ekstern leser" pad="18px 20px" style={{ gap: 14 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <TlFelt label="Navn" value={navn} onChange={setNavn} placeholder="Fornavn Etternavn" feil={fieldErrors.name} />
          <TlFelt label="E-post" type="email" value={epost} onChange={setEpost} placeholder="ansvarlig@forbund.no" feil={fieldErrors.email} />

          <div>
            <TlCaps size={10}>Grupper</TlCaps>
            {fieldErrors.groupIds && (
              <div style={{ fontSize: 12, color: TL.danger, marginTop: 4 }}>{fieldErrors.groupIds}</div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {grupper.map((gruppe) => (
                <TlAvkryssing
                  key={gruppe.id}
                  label={gruppe.name}
                  checked={valgteGrupper.includes(gruppe.id)}
                  onChange={(on) => toggle(valgteGrupper, setValgteGrupper, gruppe.id, on)}
                />
              ))}
            </div>
          </div>

          <div>
            <TlCaps size={10}>Innsyn</TlCaps>
            {fieldErrors.scopes && (
              <div style={{ fontSize: 12, color: TL.danger, marginTop: 4 }}>{fieldErrors.scopes}</div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {DELING_SCOPES.map((scope) => (
                <TlAvkryssing
                  key={scope}
                  label={SCOPE_LABEL[scope]}
                  checked={valgteScopes.includes(scope)}
                  onChange={(on) => toggle(valgteScopes, setValgteScopes, scope, on)}
                />
              ))}
            </div>
          </div>

          {error && <p role="alert" style={{ margin: 0, fontSize: 12, color: TL.danger }}>{error}</p>}
          {success && <p role="status" style={{ margin: 0, fontSize: 12, color: TL.ok }}>{success}</p>}

          <TlKnapp type="submit" variant="primaer" disabled={pending} full>
            {pending ? "Oppretter …" : "Opprett ekstern leser"}
          </TlKnapp>
        </form>
      </TlKort>

      <div>
        <div style={{ marginBottom: 10 }}><TlCaps size={10}>Aktive eksterne lesere</TlCaps></div>
        {lesere.length === 0 ? (
          <TlKort>
            <TlTomTilstand icon="users" title="Ingen aktive eksterne lesere" />
          </TlKort>
        ) : (
          <TlRadGruppe>
            {lesere.map((leser, i) => (
              <TlRad
                key={leser.id}
                title={leser.navn}
                sub={`${leser.epost} · ${leser.grupper.join(", ")}`}
                chevron={false}
                last={i === lesere.length - 1}
                trailing={
                  <TlKnapp variant="tertiaer" disabled={pending} onClick={() => handleTrekk(leser.id)}>
                    Trekk tilgang
                  </TlKnapp>
                }
              />
            ))}
          </TlRadGruppe>
        )}
      </div>
    </div>
  );
}
