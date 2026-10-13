"use client";

/** Eksisterende coachfunksjon med uendrede serverhandlinger. Precision avgrenses av CoachContent; navnet er en beholdt importkontrakt. */

import { Ark } from "@/components/precision/pa-a4";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/v2/icon";
import { CoachLabel as TlCaps } from "@/components/admin/precision/agency-completion/CoachLabel";
import { TL } from "@/lib/v2/train-lock";
import { createApiKey, revokeApiKey } from "@/app/admin/(legacy)/settings/api/actions";
import { TlBadge, TlKnapp, TlKort, TlRad, TlTittel, TlTomTilstand, TL_PRESS } from "./tl-kit";

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
  if (scopes.length === 0) return "Ingen valgte tilganger";
  return scopes.length === 1 ? "1 tilgang" : `${scopes.length} tilganger`;
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
        <TlCaps size={13}>{label}</TlCaps>
      </div>
      <input
        type="text"
        aria-label={label}
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
  return <label style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 44, cursor: "pointer" }}><input type="checkbox" checked={checked} onChange={onChange} style={{ width: 20, height: 20, minHeight: 20, accentColor: "var(--primary)" }} /><span>{label}</span></label>;
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
        width: 44,
        height: 44,
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
      setFeil("Velg minst én verktøytilgang.");
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
    <Ark open title={secret ? "Lagre nøkkelen nå" : "Ny API-nøkkel"} onClose={() => { if (!pending) onClose(); }}>
        {secret ? (
          <>
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
                  fontSize: 13,
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
                  width: 44,
                  height: 44,
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
            <p style={{ fontSize: 13, color: TL.mute, lineHeight: 1.55, margin: "6px 0 16px" }}>
              For tredjeparts-integrasjoner mot AgencyOS.
            </p>

            <TlInndata label="Navn" value={navn} onChange={setNavn} placeholder="f.eks. GolfBox-sync" />

            <div style={{ marginTop: 16 }}>
              <TlCaps size={13}>Verktøytilganger</TlCaps>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {SCOPE_VALG.map((s) => (
                  <TlAvkryssing key={s.value} label={s.label} checked={valgteScopes.includes(s.value)} onChange={() => toggleScope(s.value)} />
                ))}
              </div>
            </div>

            {feil && (
              <p role="alert" style={{ marginTop: 14, fontSize: 13, color: TL.text }}>
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
    </Ark>
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
  const [feil, setFeil] = useState<string | null>(null);

  function lukkModal() {
    setVisModal(false);
    router.refresh();
  }

  function revoker(id: string) {
    if (!confirm("Sikker på at du vil revokere denne nøkkelen?")) return;
    startTransition(async () => {
      setFeil(null);
      try { await revokeApiKey(id); router.refresh(); }
      catch { setFeil("Nøkkelen kunne ikke deaktiveres. Prøv igjen."); }
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
        <TlKort eyebrow="API-nøkler" action={<TlCaps size={13}>Brukes av eksterne verktøy</TlCaps>} pad="6px 20px 8px">
          {data.nokler.map((n, i) => (
            <NokkelRad key={n.id} n={n} last={i === data.nokler.length - 1} onRevoke={revoker} pending={pending} />
          ))}
        </TlKort>
      )}

      <p style={{ fontSize: 13, color: TL.mute, lineHeight: 1.6, margin: 0 }}>
        En nøkkel gir de valgte verktøytilgangene. Deaktiver nøkler som ikke skal brukes lenger.
      </p>

      {feil && <p role="alert">{feil}</p>}
      {visModal && <NyNokkelModal onClose={lukkModal} />}
    </div>
  );
}
