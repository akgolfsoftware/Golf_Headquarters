"use client";

/**
 * PlayerHQ · Meg · Profil (PH-24) — Precision Athletics.
 * Kilde: AK Golf Precision Athletics PH-24 (Meg / Profil).
 *
 * Egenskaper:
 * - Redigering av personopplysninger: Navn, Mobil, Fødselsdato, Hjemmeklubb, Mål/ambisjon.
 * - Lesefelt (eies av forbund / system): Forbunds-HCP, NGF Golf-ID, E-post (Supabase Auth), Stall, Runder i år.
 * - Kompletthetsmåler basert på beregnProfilKompletthet.
 * - Null hardkodede farger, kun semantiske CSS-variabler.
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { User, Phone, Calendar, MapPin, ShieldCheck, Save, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { type LagreProfilInput } from "@/app/portal/meg/profil/actions";
import { beregnProfilKompletthet } from "@/lib/portal/ph24-data";
import { formaterTall } from "@/lib/format-tall";

export type PH24ProfilData = {
  navn: string;
  avatarUrl: string | null;
  epost: string;
  mobil: string | null;
  hcp: number | null;
  homeClub: string | null;
  fodselsdatoISO: string | null;
  ambition: string | null;
  spillerSiden: string;
  stallNavn: string | null;
  runderIAar: number;
  ngfId: string | null;
  hcpMaalTekst: string | null;
};

export type PH24ProfilProps = {
  data: PH24ProfilData;
  onLagre: (input: LagreProfilInput) => Promise<{ ok: true } | { ok: false; feil: string }>;
};

export function PH24Profil({ data, onLagre }: PH24ProfilProps) {
  const [navn, setNavn] = useState(data.navn);
  const [mobil, setMobil] = useState(data.mobil ?? "");
  const [fodselsdato, setFodselsdato] = useState(data.fodselsdatoISO ?? "");
  const [hjemmeklubb, setHjemmeklubb] = useState(data.homeClub ?? "");
  const [maalTekst, setMaalTekst] = useState(data.ambition ?? "");

  const [feil, setFeil] = useState<string | null>(null);
  const [suksess, setSuksess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const komplett = beregnProfilKompletthet({
    navn,
    epost: data.epost,
    mobil,
    fodselsdatoISO: fodselsdato,
    homeClub: hjemmeklubb,
    ambition: maalTekst,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeil(null);
    setSuksess(false);

    startTransition(async () => {
      const res = await onLagre({
        navn: navn.trim(),
        mobil: mobil.trim() || null,
        fodselsdato: fodselsdato ? fodselsdato : null,
        hjemmeklubb: hjemmeklubb.trim() || null,
        maalTekst: maalTekst.trim() || null,
      });

      if (res.ok) {
        setSuksess(true);
        setTimeout(() => setSuksess(false), 4000);
      } else {
        setFeil(res.feil);
      }
    });
  };

  return (
    <div style={{ maxWidth: 840, margin: "0 auto", padding: "16px 20px 48px", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Toppseksjon med brødsmule og tittel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Link
          href="/portal/meg"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            minHeight: 44,
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-secondary)",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={14} />
          Tilbake til Meg
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              Profil og opplysninger
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--text-secondary)" }}>
              Personlige opplysninger, forbundsstatus og kontaktinformasjon.
            </p>
          </div>
          <div
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-pill)",
              background: komplett.prosent === 100 ? "var(--ok-tint)" : "var(--surface-sunken)",
              border: "1px solid var(--border-hairline)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 600,
              color: komplett.prosent === 100 ? "var(--ok)" : "var(--text-secondary)",
            }}
          >
            {komplett.prosent === 100 ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{komplett.prosent}% komplett profil</span>
          </div>
        </div>
      </div>

      {komplett.mangler.length > 0 && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius)",
            background: "var(--surface-sunken)",
            border: "1px solid var(--border-hairline)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
            fontSize: 13,
            color: "var(--text-secondary)",
          }}
        >
          <span>
            Tips: Fyll ut <strong>{komplett.mangler.join(", ")}</strong> for at treneren din har fullstendig grunnlag.
          </span>
        </div>
      )}

      {/* Skjema for redigerbare felter */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Personalia */}
        <section
          style={{
            padding: 20,
            borderRadius: "var(--radius)",
            background: "var(--surface-card)",
            border: "1px solid var(--border-hairline)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <User size={18} style={{ color: "var(--text-secondary)" }} />
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Personalia</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>
                Fullt navn
              </label>
              <input
                type="text"
                value={navn}
                onChange={(e) => setNavn(e.target.value)}
                required
                style={{
                  width: "100%",
                  minHeight: 44,
                  padding: "10px 12px",
                  borderRadius: "var(--radius)",
                  background: "var(--surface-card)",
                  border: "1px solid var(--border-hairline)",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>
                Mobilnummer
              </label>
              <div style={{ position: "relative" }}>
                <Phone size={14} style={{ position: "absolute", left: 12, top: 15, color: "var(--text-muted)" }} />
                <input
                  type="tel"
                  value={mobil}
                  onChange={(e) => setMobil(e.target.value)}
                  placeholder="+47 000 00 000"
                  style={{
                    width: "100%",
                    minHeight: 44,
                    padding: "10px 12px 10px 34px",
                    borderRadius: "var(--radius)",
                    background: "var(--surface-card)",
                    border: "1px solid var(--border-hairline)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>
                Fødselsdato
              </label>
              <div style={{ position: "relative" }}>
                <Calendar size={14} style={{ position: "absolute", left: 12, top: 15, color: "var(--text-muted)" }} />
                <input
                  type="date"
                  value={fodselsdato}
                  readOnly={Boolean(data.fodselsdatoISO)}
                  aria-describedby={data.fodselsdatoISO ? "ph24-fodselsdato-hjelp" : undefined}
                  onChange={(e) => setFodselsdato(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 44,
                    padding: "10px 12px 10px 34px",
                    borderRadius: "var(--radius)",
                    background: "var(--surface-card)",
                    border: "1px solid var(--border-hairline)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              {data.fodselsdatoISO ? (
                <p id="ph24-fodselsdato-hjelp" style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>
                  Fødselsdatoen kan ikke endres her. Be coachen din om å rette den.
                </p>
              ) : null}
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>
                Hjemmeklubb
              </label>
              <div style={{ position: "relative" }}>
                <MapPin size={14} style={{ position: "absolute", left: 12, top: 15, color: "var(--text-muted)" }} />
                <input
                  type="text"
                  value={hjemmeklubb}
                  onChange={(e) => setHjemmeklubb(e.target.value)}
                  placeholder="f.eks. Losby Golfklubb"
                  style={{
                    width: "100%",
                    minHeight: 44,
                    padding: "10px 12px 10px 34px",
                    borderRadius: "var(--radius)",
                    background: "var(--surface-card)",
                    border: "1px solid var(--border-hairline)",
                    color: "var(--text-primary)",
                    fontSize: 14,
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>
              Ambisjon og målsetning
            </label>
            <textarea
              value={maalTekst}
              onChange={(e) => setMaalTekst(e.target.value)}
              rows={3}
              placeholder="Beskriv kort din sportslige ambisjon for sesongen..."
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "var(--radius)",
                background: "var(--surface-card)",
                border: "1px solid var(--border-hairline)",
                color: "var(--text-primary)",
                fontSize: 14,
                fontFamily: "inherit",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>
        </section>

        {/* Forbund og systemdata (lesefelt) */}
        <section
          style={{
            padding: 20,
            borderRadius: "var(--radius)",
            background: "var(--surface-card)",
            border: "1px solid var(--border-hairline)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={18} style={{ color: "var(--text-secondary)" }} />
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
              Forbundsdata og status (lesefelt)
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
            Disse verdiene administreres av Norges Golfforbund, GolfBox eller klubben din. E-post styres via sikker innlogging.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div style={{ padding: "12px 14px", borderRadius: "var(--radius)", background: "var(--surface-sunken)" }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                Forbunds-handicap
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                {data.hcp != null ? formaterTall(data.hcp, 1) : "—"}
              </span>
            </div>

            <div style={{ padding: "12px 14px", borderRadius: "var(--radius)", background: "var(--surface-sunken)" }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                NGF Medlems-ID / GolfBox
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                {data.ngfId || "Ikke koblet"}
              </span>
            </div>

            <div style={{ padding: "12px 14px", borderRadius: "var(--radius)", background: "var(--surface-sunken)" }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                E-post (innlogging)
              </span>
              <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", wordBreak: "break-all" }}>
                {data.epost}
              </span>
            </div>

            <div style={{ padding: "12px 14px", borderRadius: "var(--radius)", background: "var(--surface-sunken)" }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                Stall / Gruppe
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                {data.stallNavn || "Individuell spiller"}
              </span>
            </div>

            <div style={{ padding: "12px 14px", borderRadius: "var(--radius)", background: "var(--surface-sunken)" }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                Runder i år
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                {data.runderIAar}
              </span>
            </div>

            {data.hcpMaalTekst && (
              <div style={{ padding: "12px 14px", borderRadius: "var(--radius)", background: "var(--surface-sunken)" }}>
                <span style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Aktivt HCP-mål
                </span>
                <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
                  {data.hcpMaalTekst}
                </span>
              </div>
            )}
          </div>
        </section>

        {feil && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius)",
              background: "var(--signal-tint)",
              color: "var(--signal-ink)",
              border: "1px solid var(--signal)",
              fontSize: 14,
            }}
          >
            {feil}
          </div>
        )}

        {suksess && (
          <div
            style={{
              padding: "12px 16px",
              borderRadius: "var(--radius)",
              background: "var(--ok-tint)",
              color: "var(--ok)",
              border: "1px solid var(--ok)",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <CheckCircle2 size={16} />
            <span>Profilen ble lagret og oppdatert!</span>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Link
            href="/portal/meg"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 44,
              minWidth: 80,
              padding: "10px 16px",
              borderRadius: "var(--radius)",
              background: "transparent",
              border: "1px solid var(--border-hairline)",
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
              boxSizing: "border-box",
            }}
          >
            Avbryt
          </Link>

          <button
            type="submit"
            disabled={isPending}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 44,
              minWidth: 150,
              padding: "10px 20px",
              borderRadius: "var(--radius)",
              background: "var(--primary)",
              color: "var(--text-on-primary)",
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              cursor: isPending ? "not-allowed" : "pointer",
              gap: 8,
              opacity: isPending ? 0.7 : 1,
              boxSizing: "border-box",
            }}
          >
            <Save size={16} />
            <span>{isPending ? "Lagrer..." : "Lagre profilen"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
