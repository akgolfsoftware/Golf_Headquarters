"use client";

/**
 * Profil-rediger modal — implementering av "Profil rediger-modal.html"
 * og "Profil - rediger.html" (modal-versjon).
 *
 * Brukes på /portal/meg/innstillinger og andre steder hvor "Rediger profil"
 * kan trigges. Skriver til oppdaterProfil-server-action.
 */

import { useState, useTransition, type FormEvent } from "react";
import { X, Check, Camera, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { oppdaterProfil } from "@/app/portal/meg/actions";

export interface ProfilRedigerModalProps {
  open: boolean;
  onClose: () => void;
  initial: {
    name: string;
    email: string;
    phone: string | null;
    homeClub: string | null;
    hcp: number | null;
    aListe?: string | null;
    avatarUrl?: string | null;
    initials: string;
    dominantHand?: "RIGHT" | "LEFT";
  };
}

const KLUBBER = [
  "Søgne & Mandal Golfklubb",
  "Kristiansand Golfklubb",
  "Mandal Golfklubb",
  "Bjaavann Golfklubb",
  "Gamle Fredrikstad Golfklubb",
  "Bossum Golfklubb",
  "Annen klubb",
];

const A_LISTE_OPTIONS = [
  { v: "A1", label: "A1 — Toppidrett" },
  { v: "A2", label: "A2 — Talent" },
  { v: "B", label: "B — Aktiv" },
  { v: "INGEN", label: "Ingen" },
];

export function ProfilRedigerModal({ open, onClose, initial }: ProfilRedigerModalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Felter
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [homeClub, setHomeClub] = useState(initial.homeClub ?? KLUBBER[0]);
  const [aListe, setAListe] = useState(initial.aListe ?? "A1");
  const [dominantHand, setDominantHand] = useState<"RIGHT" | "LEFT">(initial.dominantHand ?? "RIGHT");
  const [error, setError] = useState<string | null>(null);

  // Dirty-tracking
  const dirty =
    name !== initial.name ||
    (phone || "") !== (initial.phone ?? "") ||
    (homeClub || "") !== (initial.homeClub ?? KLUBBER[0]) ||
    aListe !== (initial.aListe ?? "A1") ||
    dominantHand !== (initial.dominantHand ?? "RIGHT");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Navn er påkrevd");
      return;
    }
    startTransition(async () => {
      try {
        await oppdaterProfil({
          name: name.trim(),
          phone: phone.trim() || null,
          homeClub: homeClub || null,
        });
        router.refresh();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Kunne ikke lagre");
      }
    });
  }

  if (!open) return null;

  const fornavn = name.split(" ")[0] ?? "";
  const etternavn = name.split(" ").slice(1).join(" ");

  return (
    <div
      className="meg-modal-back"
      role="dialog"
      aria-modal="true"
      aria-labelledby="meg-profil-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onClose();
      }}
    >
      <form className="meg-modal" onSubmit={handleSubmit}>
        <header className="meg-mh">
          <div>
            <div className="meg-mh-eyebrow">PROFIL · OPPDATER</div>
            <h2 className="meg-mh-title" id="meg-profil-title">
              Rediger <em>profil</em>
            </h2>
            <p className="meg-mh-sub">
              Endringer lagres når du trykker «Lagre endringer». HCP synkes automatisk fra GolfBox.
            </p>
          </div>
          <button
            type="button"
            className="meg-mh-close"
            onClick={onClose}
            aria-label="Lukk"
            disabled={pending}
          >
            <X size={16} aria-hidden />
          </button>
        </header>

        <div className="meg-mb">
          {/* Profilbilde */}
          <div className="meg-photo-row">
            <div className="meg-photo">
              {initial.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={initial.avatarUrl} alt={initial.name} />
              ) : (
                initial.initials
              )}
              <button type="button" className="cam" aria-label="Bytt profilbilde" title="Last opp nytt bilde">
                <Camera size={13} aria-hidden />
              </button>
            </div>
            <div className="meg-photo-cta">
              <span className="meg-lbl" style={{ marginBottom: 2 }}>Profilbilde</span>
              <div className="actions">
                <button type="button">Last opp nytt</button>
                <button type="button" className="danger">Fjern</button>
              </div>
              <span className="helper">JPG eller PNG · maks 5 MB · kvadratisk anbefales</span>
            </div>
          </div>

          {/* Personalia */}
          <section className="meg-group">
            <span className="meg-group-h">Personalia</span>
            <div className="meg-grid-2">
              <div className="meg-field">
                <label className="meg-lbl" htmlFor="meg-fornavn">
                  Fornavn <span className="req">*</span>
                </label>
                <input
                  id="meg-fornavn"
                  className="meg-inp"
                  type="text"
                  value={fornavn}
                  onChange={(e) => setName(`${e.target.value} ${etternavn}`.trim())}
                />
              </div>
              <div className="meg-field">
                <label className="meg-lbl" htmlFor="meg-etternavn">
                  Etternavn <span className="req">*</span>
                </label>
                <input
                  id="meg-etternavn"
                  className="meg-inp"
                  type="text"
                  value={etternavn}
                  onChange={(e) => setName(`${fornavn} ${e.target.value}`.trim())}
                />
              </div>
            </div>
          </section>

          {/* Kontakt */}
          <section className="meg-group">
            <span className="meg-group-h">Kontakt</span>
            <div className="meg-field">
              <label className="meg-lbl" htmlFor="meg-epost">
                E-post <span className="req">*</span>
                <span className="meg-verified-tag">
                  <Check size={9} aria-hidden />Verifisert
                </span>
              </label>
              <input
                id="meg-epost"
                className="meg-inp disabled"
                type="email"
                value={initial.email}
                disabled
                style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}
              />
            </div>
            <div className="meg-grid-2">
              <div className="meg-field">
                <label className="meg-lbl" htmlFor="meg-tlf">Telefon</label>
                <div className="meg-inp-prefix">
                  <span className="pfx">+47</span>
                  <input
                    id="meg-tlf"
                    className="meg-inp"
                    type="tel"
                    value={phone.startsWith("+47") ? phone.slice(3).trim() : phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="92 14 60 81"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  />
                </div>
              </div>
              <div className="meg-field">
                <label className="meg-lbl" htmlFor="meg-adr">Adresse</label>
                <input
                  id="meg-adr"
                  className="meg-inp"
                  type="text"
                  placeholder="Gateadresse"
                  defaultValue=""
                />
              </div>
            </div>
          </section>

          {/* Golf */}
          <section className="meg-group">
            <span className="meg-group-h">Golf</span>
            <div className="meg-grid-3">
              <div className="meg-field">
                <label className="meg-lbl" htmlFor="meg-klubb">
                  Klubb-tilknytning <span className="req">*</span>
                </label>
                <select
                  id="meg-klubb"
                  className="meg-sel"
                  value={homeClub}
                  onChange={(e) => setHomeClub(e.target.value)}
                >
                  {KLUBBER.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </div>
              <div className="meg-field">
                <label className="meg-lbl">
                  HCP
                  <span className="meg-lbl" style={{ marginLeft: 0 }} title="Synket fra GolfBox – ikke redigerbar her">
                    <Info size={11} aria-hidden />
                  </span>
                </label>
                <input
                  className="meg-inp disabled"
                  type="text"
                  value={formatHcp(initial.hcp)}
                  disabled
                  style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 600 }}
                />
                <span className="meg-help-text synced">
                  <Check size={11} aria-hidden /> Synket fra GolfBox · 18. mai
                </span>
              </div>
              <div className="meg-field">
                <label className="meg-lbl" htmlFor="meg-aliste">A-liste</label>
                <select
                  id="meg-aliste"
                  className="meg-sel"
                  value={aListe}
                  onChange={(e) => setAListe(e.target.value)}
                >
                  {A_LISTE_OPTIONS.map((a) => (
                    <option key={a.v} value={a.v}>{a.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="meg-field">
              <span className="meg-lbl">Dominant hånd</span>
              <div className="meg-hand-toggle">
                <button
                  type="button"
                  className={dominantHand === "RIGHT" ? "active" : ""}
                  onClick={() => setDominantHand("RIGHT")}
                >
                  Høyrehendt
                </button>
                <button
                  type="button"
                  className={dominantHand === "LEFT" ? "active" : ""}
                  onClick={() => setDominantHand("LEFT")}
                >
                  Venstrehendt
                </button>
              </div>
            </div>
          </section>

          {error ? (
            <div style={{ color: "var(--meg-danger)", fontSize: 13 }}>{error}</div>
          ) : null}
        </div>

        <footer className="meg-mf">
          {dirty ? (
            <span className="dirty">
              <span className="blip" />Endringer ikke lagret
            </span>
          ) : null}
          <span className="spacer" />
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={pending}>
            Avbryt
          </button>
          <button type="submit" className="btn btn-primary" disabled={pending || !dirty}>
            {pending ? "Lagrer…" : "Lagre endringer"}
            <Check size={13} aria-hidden />
          </button>
        </footer>
      </form>
    </div>
  );
}

function formatHcp(hcp: number | null): string {
  if (hcp === null || hcp === undefined) return "—";
  if (hcp < 0) return `+${Math.abs(hcp).toFixed(1).replace(".", ",")}`;
  return hcp.toFixed(1).replace(".", ",");
}
