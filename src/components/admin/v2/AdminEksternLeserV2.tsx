"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * AgencyOS — Eksterne lesere (plan T8, funksjonelt — trenger fasit-runde for
 * endelig utseende). Opprett Team Norway-/WANG-ansvarlige med GUEST-innsyn
 * (/innsyn) og trekk tilgangen igjen. Mønster: AdminInviterCoachV2.
 */

import { useState, useTransition } from "react";
import { Kort, SkjemaFelt, Inndata, Knapp, Avkryssing } from "@/components/v2";
import { DELING_SCOPES, type DelingScope } from "@/lib/deling/samtykke-regler";
import { opprettEksternLeser, trekkEksternLeser } from "@/app/admin/(legacy)/team/ekstern-leser-actions";
const SCOPE_LABEL: Record<DelingScope, string> = {
  TEST_RESULTATER: "Testresultater",
  STATS: "Statistikk",
  KOMPLETT_PROFIL: "Komplett profil",
};

export type EksternLeserRad = {
  id: string;
  navn: string;
  epost: string;
  grupper: string[];
};

export function AdminEksternLeserV2({
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
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>
          Eksterne lesere
        </h1>
        <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.55, margin: "10px 0 0", maxWidth: 480 }}>
          Team Norway-/WANG-ansvarlige med egen innlogging. De ser KUN
          testresultater og statistikk for spillere som har samtykket til
          deling — aldri treningsplaner. Uten samtykke ser de ingenting.
        </p>
      </div>

      <Kort style={{ maxWidth: 520 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SkjemaFelt label="Navn" hjelp={undefined} feil={fieldErrors.name}>
            <Inndata label={null} value={navn} onChange={setNavn} placeholder="Fornavn Etternavn" />
          </SkjemaFelt>

          <SkjemaFelt label="E-post" hjelp={undefined} feil={fieldErrors.email}>
            <Inndata label={null} type="email" value={epost} onChange={setEpost} placeholder="ansvarlig@forbund.no" />
          </SkjemaFelt>

          <div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>
              Grupper
            </div>
            {fieldErrors.groupIds && (
              <div style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.danger, marginTop: 4 }}>
                {fieldErrors.groupIds}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {grupper.map((gruppe) => (
                <Avkryssing
                  key={gruppe.id}
                  label={gruppe.name}
                  checked={valgteGrupper.includes(gruppe.id)}
                  onChange={(on) => toggle(valgteGrupper, setValgteGrupper, gruppe.id, on)}
                />
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>
              Innsyn
            </div>
            {fieldErrors.scopes && (
              <div style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.danger, marginTop: 4 }}>
                {fieldErrors.scopes}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {DELING_SCOPES.map((scope) => (
                <Avkryssing
                  key={scope}
                  label={SCOPE_LABEL[scope]}
                  checked={valgteScopes.includes(scope)}
                  onChange={(on) => toggle(valgteScopes, setValgteScopes, scope, on)}
                />
              ))}
            </div>
          </div>

          {error && (
            <div style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.danger }}>{error}</div>
          )}
          {success && (
            <div style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.ok }}>{success}</div>
          )}

          <Knapp type="submit" disabled={pending}>
            {pending ? "Oppretter …" : "Opprett ekstern leser"}
          </Knapp>
        </form>
      </Kort>

      <Kort>
        <div style={{ fontFamily: TL.font.sans, fontSize: 14, fontWeight: 700, color: TL.text }}>
          Aktive eksterne lesere
        </div>
        {lesere.length === 0 ? (
          <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: "10px 0 0" }}>
            Ingen aktive eksterne lesere.
          </p>
        ) : (
          <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none" }}>
            {lesere.map((leser) => (
              <li
                key={leser.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "10px 0",
                  borderTop: `1px solid ${TL.hair}`,
                  minWidth: 0,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text }}>
                    {leser.navn}
                  </div>
                  <div style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {leser.epost} · {leser.grupper.join(", ")}
                  </div>
                </div>
                <Knapp ghost disabled={pending} onClick={() => handleTrekk(leser.id)}>
                  Trekk tilgang
                </Knapp>
              </li>
            ))}
          </ul>
        )}
      </Kort>
    </div>
  );
}
