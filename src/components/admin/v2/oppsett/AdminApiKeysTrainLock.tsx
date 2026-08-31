"use client";

/**
 * AgencyOS Innstillinger · API-nøkler — Train-lock (T13, 27.08.2026).
 *
 * Designport av `AdminApiKeysV2` (Paper) — ingen egen fasit tegner API-
 * nøkkel-skjermen, så layouten er en mønster-port til tl-kit (kort/rad/
 * knapp), ikke pixel. Mutasjonene (opprett/revoker) er UENDRET — samme
 * server actions fra legacy-mappen (createApiKey/revokeApiKey).
 *
 * Sikkerhetskritisk UX bevart 1:1: den fulle nøkkelen («secret») vises KUN
 * i det ene øyeblikket den opprettes.
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/v2/icon";
import { TL } from "@/lib/v2/train-lock";
import { createApiKey, revokeApiKey } from "@/app/admin/(legacy)/settings/api/actions";
import { TlBadge, TlCaps, TlKnapp, TlKort, TlRad, TlTittel, TlTomTilstand, TL_PRESS } from "./tl-kit";

// ── Datakontrakt (mappes fra Prisma i ruten) ───────────────────
export interface AdminApiKeysV2Nokkel {
  id: string;
  navn: string;
  prefix: string;
  scopes: string[];
  eier: string;
  opprettet: string;
  sistBrukt: string;
  utloper: string | null;
  revokert: boolean;
}
export interface AdminApiKeysV2Data {
  nokler: AdminApiKeysV2Nokkel[];
  aktiveCount: number;
  totalCount: number;
}

const SCOPE_VALG = [
  { value: "read:players", label: "Les spillerdata" },
  { value: "read:bookings", label: "Les bookinger" },
  { value: "write:rounds", label: "Skriv runder" },
  { value: "admin", label: "Full admin (kun ADMIN)" },
];

function scopeOppsummering(scopes: string[]) {
  if (scopes.length === 0) return "Ingen scopes";
  return scopes.length === 1 ? "1 scope" : `${scopes.length} scopes`;
}

function TlInndata({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <TlCaps size={10}>{label}</TlCaps>
      </div>
      <input
        type="text"
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
    </div>
  );
}

function TlAvkryssing({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <span
        aria-hidden
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          flex: "none",
          background: checked ? TL.fill : TL.dock,
          boxShadow: checked ? "none" : `inset 0 0 0 1px ${TL.hair}`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked && <Icon name="check" size={13} style={{ color: TL.onFill }} />}
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: "none" }} />
      <span style={{ fontSize: 14, color: TL.text }}>{label}</span>
    </label>
  );
}

/* ── KopierPrefixKnapp ────────────────────────────────────────── */
function KopierPrefixKnapp({ prefix }: { prefix: string }) {
  const [kopiert, setKopiert] = useState(false);

  async function kopier() {
    try {
      await navigator.clipboard.writeText(prefix);
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2000);
    } catch (err) {
      console.error("[AdminApiKeysTrainLock] kopiering av prefix feilet", err);
    }
  }

  return (
    <button
      type="button"
      onClick={kopier}
      aria-label="Kopier prefix"
      title={kopiert ? "Kopiert" : "Kopier prefix"}
      className={TL_PRESS}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: 8,
        background: TL.dock,
        boxShadow: `inset 0 0 0 1px ${TL.hair}`,
        border: "none",
        cursor: "pointer",
        flex: "none",
      }}
    >
      <Icon name={kopiert ? "check" : "copy"} size={13} style={{ color: TL.mute }} />
    </button>
  );
}

/* ── NokkelRad ─────────────────────────────────────────────────── */
function NokkelRad({
  n,
  last,
  onRevoke,
  pending,
}: {
  n: AdminApiKeysV2Nokkel;
  last: boolean;
  onRevoke: (id: string) => void;
  pending: boolean;
}) {
  return (
    <div style={{ opacity: n.revokert ? 0.55 : 1 }}>
      <TlRad
        title={n.navn}
        sub={`${n.prefix}… · ${scopeOppsummering(n.scopes)} · ${n.eier} · Opprettet ${n.opprettet}`}
        meta={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <TlBadge tone={n.revokert ? "fare" : "nøytral"}>{n.revokert ? "Revokert" : n.sistBrukt}</TlBadge>
            <KopierPrefixKnapp prefix={n.prefix} />
          </span>
        }
        trailing={
          n.revokert ? null : (
            <TlKnapp variant="fare" icon="trash-2" disabled={pending} onClick={() => onRevoke(n.id)}>
              Revoker
            </TlKnapp>
          )
        }
        chevron={false}
        last={last}
      />
    </div>
  );
}

/* ── NyNokkelModal ─────────────────────────────────────────────── */
function NyNokkelModal({ onClose }: { onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  const [navn, setNavn] = useState("");
  const [valgteScopes, setValgteScopes] = useState<string[]>(["read:players"]);
  const [feil, setFeil] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [kopiert, setKopiert] = useState(false);

  function toggleScope(value: string) {
    setValgteScopes((curr) => (curr.includes(value) ? curr.filter((s) => s !== value) : [...curr, value]));
  }

  function opprett() {
    if (!navn.trim()) {
      setFeil("Skriv navn på nøkkelen.");
      return;
    }
    if (valgteScopes.length === 0) {
      setFeil("Velg minst én scope.");
      return;
    }
    setFeil(null);
    startTransition(async () => {
      try {
        const res = await createApiKey({ name: navn, scopes: valgteScopes });
        setSecret(res.secret);
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Kunne ikke opprette nøkkelen.");
      }
    });
  }

  async function kopierSecret() {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setKopiert(true);
      setTimeout(() => setKopiert(false), 2000);
    } catch (err) {
      console.error("[AdminApiKeysTrainLock] kopiering av nøkkel feilet", err);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ny-api-nokkel-tl-tittel"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
        background: TL.scrim,
      }}
      onClick={() => {
        if (!pending) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 440,
          borderRadius: TL.radius.sheet,
          background: TL.elev,
          boxShadow: `inset 0 0 0 1px ${TL.hair}`,
          padding: "20px 22px",
        }}
      >
        {secret ? (
          <>
            <h2 id="ny-api-nokkel-tl-tittel" style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>
              Lagre nøkkelen nå
            </h2>
            <p style={{ fontSize: 13, color: TL.mute, lineHeight: 1.55, margin: "10px 0 0" }}>
              Dette er den eneste gangen du kan se hele nøkkelen. Lagre den i passordforvalter —
              den vises aldri igjen.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
              <code
                style={{
                  flex: 1,
                  minWidth: 0,
                  wordBreak: "break-all",
                  borderRadius: TL.radius.field,
                  background: TL.dock,
                  boxShadow: `inset 0 0 0 1px ${TL.hair}`,
                  padding: "12px 14px",
                  fontFamily: TL.font.mono,
                  fontSize: 12,
                  color: TL.text,
                }}
              >
                {secret}
              </code>
              <button
                type="button"
                onClick={kopierSecret}
                aria-label="Kopier nøkkel"
                title={kopiert ? "Kopiert" : "Kopier nøkkel"}
                className={TL_PRESS}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: TL.radius.field,
                  background: TL.dock,
                  boxShadow: `inset 0 0 0 1px ${TL.hair}`,
                  border: "none",
                  cursor: "pointer",
                  flex: "none",
                }}
              >
                <Icon name={kopiert ? "check" : "copy"} size={15} style={{ color: TL.mute }} />
              </button>
            </div>
            <div style={{ marginTop: 20 }}>
              <TlKnapp variant="primaer" icon="check" onClick={onClose} full>
                Jeg har lagret den
              </TlKnapp>
            </div>
          </>
        ) : (
          <>
            <h2 id="ny-api-nokkel-tl-tittel" style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>
              Ny API-nøkkel
            </h2>
            <p style={{ fontSize: 13, color: TL.mute, lineHeight: 1.55, margin: "6px 0 16px" }}>
              For tredjeparts-integrasjoner mot AgencyOS.
            </p>

            <TlInndata label="Navn" value={navn} onChange={setNavn} placeholder="f.eks. GolfBox-sync" />

            <div style={{ marginTop: 16 }}>
              <TlCaps size={9}>Scopes</TlCaps>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {SCOPE_VALG.map((s) => (
                  <TlAvkryssing key={s.value} label={s.label} checked={valgteScopes.includes(s.value)} onChange={() => toggleScope(s.value)} />
                ))}
              </div>
            </div>

            {feil && (
              <p role="alert" style={{ marginTop: 14, fontSize: 13, color: TL.danger }}>
                {feil}
              </p>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <TlKnapp variant="tertiaer" disabled={pending} onClick={onClose} style={{ flex: 1 }}>
                Avbryt
              </TlKnapp>
              <TlKnapp variant="primaer" icon={pending ? "loader" : "plus"} disabled={pending} onClick={opprett} style={{ flex: 1 }}>
                {pending ? "Oppretter…" : "Opprett"}
              </TlKnapp>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── AdminApiKeysTrainLock ────────────────────────────────────── */
export function AdminApiKeysTrainLock({
  data,
  somFane = false,
}: {
  data: AdminApiKeysV2Data;
  /** True når komponenten står som «API»-fanen i /admin/oppsett (MASTERPLAN 15.3). */
  somFane?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [visModal, setVisModal] = useState(false);

  function lukkModal() {
    setVisModal(false);
    router.refresh();
  }

  function revoker(id: string) {
    if (!confirm("Sikker på at du vil revokere denne nøkkelen?")) return;
    startTransition(async () => {
      await revokeApiKey(id);
      router.refresh();
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        {somFane ? <span /> : <TlTittel sub="Integrasjoner">API-nøkler</TlTittel>}
        <TlKnapp variant="primaer" icon="plus" onClick={() => setVisModal(true)}>
          Ny API-nøkkel
        </TlKnapp>
      </div>

      {data.nokler.length === 0 ? (
        <TlKort>
          <TlTomTilstand
            icon="lock"
            title="Ingen API-nøkler ennå"
            sub="Generer en nøkkel for å la et eksternt verktøy lese eller skrive data fra AgencyOS."
          />
        </TlKort>
      ) : (
        <TlKort eyebrow="API-nøkler" action={<TlCaps size={9}>Brukes av eksterne verktøy</TlCaps>} pad="6px 20px 8px">
          {data.nokler.map((n, i) => (
            <NokkelRad key={n.id} n={n} last={i === data.nokler.length - 1} onRevoke={revoker} pending={pending} />
          ))}
        </TlKort>
      )}

      <p style={{ fontSize: 12, color: TL.mute, lineHeight: 1.6, margin: 0 }}>
        Trackman, FlightScope, Garmin, Zapier og NGF Golfbox kommer som egne integrasjoner senere.
        Inntil da brukes API-nøkler over.
      </p>

      {visModal && <NyNokkelModal onClose={lukkModal} />}
    </div>
  );
}
