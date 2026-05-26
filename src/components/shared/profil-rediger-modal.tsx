"use client";

/**
 * Profil-rediger-modal — kompakt modal-variant av /portal/meg/profil/rediger.
 *
 * 11-felts form (samme felter som full-page-versjonen):
 *   1. Navn (fornavn + etternavn, splittet ved lagring)
 *   2. Fødselsdato (display-only inntil schema utvides)
 *   3. Kjønn (display-only inntil schema utvides)
 *   4. E-post (kun visning — endres via /portal/meg/sikkerhet)
 *   5. Telefon
 *   6. Adresse (display-only inntil schema utvides)
 *   7. Hjemmeklubb
 *   8. HCP (LÅST — synkes fra GolfBox)
 *   9. Playing years (spiller-erfaring)
 *  10. Dominant hånd (display-only inntil schema utvides)
 *  11. Ambisjon
 *
 * Dirty-tracking på alle felter. Lagre kaller `updateProfile`.
 * Modalen brukes fra flere trigger-punkter (PlayerHQ Hjem,
 * /portal/meg/profil, og coach-view i /admin/spillere/[id]).
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, RefreshCw, X } from "lucide-react";
import { updateProfile } from "@/app/portal/meg/profil/rediger/actions";

export type ProfilRedigerInitial = {
  name: string;
  email: string;
  phone: string;
  hcp: number | null;
  playingYears: number | null;
  homeClub: string;
  ambition: string;
  fodselsdato: string;
  adresse: string;
  kjonn: "Mann" | "Kvinne" | "Annet" | "Vil ikke oppgi";
  dominantHand: "Høyrehendt" | "Venstrehendt";
};

const KLUBBER = [
  "Søgne & Mandal Golfklubb",
  "Kristiansand Golfklubb",
  "Mandal Golfklubb",
  "Bjaavann Golfklubb",
  "Gamle Fredrikstad GK",
  "Oslo Golfklubb",
  "Asker Golfklubb",
  "Sarpsborg Golfklubb",
];

export function ProfilRedigerModal({
  initial,
  onClose,
  title = "Rediger profil",
  targetUserId,
}: {
  initial: ProfilRedigerInitial;
  onClose: () => void;
  title?: string;
  /** Sett når en coach/admin redigerer en annen spiller. */
  targetUserId?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const parts = useMemo(() => initial.name.split(" "), [initial.name]);
  const [fornavn, setFornavn] = useState(parts[0] ?? "");
  const [etternavn, setEtternavn] = useState(parts.slice(1).join(" "));
  const [fodselsdato, setFodselsdato] = useState(initial.fodselsdato);
  const [kjonn, setKjonn] = useState<ProfilRedigerInitial["kjonn"]>(
    initial.kjonn,
  );
  const [telefon, setTelefon] = useState(
    initial.phone.replace(/^\+47\s*/, ""),
  );
  const [adresse, setAdresse] = useState(initial.adresse);
  const [homeClub, setHomeClub] = useState(initial.homeClub);
  const [playingYears, setPlayingYears] = useState<string>(
    initial.playingYears != null ? String(initial.playingYears) : "",
  );
  const [dominant, setDominant] = useState<
    ProfilRedigerInitial["dominantHand"]
  >(initial.dominantHand);
  const [ambition, setAmbition] = useState(initial.ambition);

  const dirty =
    fornavn !== (parts[0] ?? "") ||
    etternavn !== parts.slice(1).join(" ") ||
    fodselsdato !== initial.fodselsdato ||
    kjonn !== initial.kjonn ||
    telefon !== initial.phone.replace(/^\+47\s*/, "") ||
    adresse !== initial.adresse ||
    homeClub !== initial.homeClub ||
    playingYears !==
      (initial.playingYears != null ? String(initial.playingYears) : "") ||
    dominant !== initial.dominantHand ||
    ambition !== initial.ambition;

  function lagre() {
    setError(null);
    startTransition(async () => {
      try {
        const fullName = [fornavn.trim(), etternavn.trim()]
          .filter(Boolean)
          .join(" ");
        await updateProfile({
          targetUserId,
          name: fullName,
          phone: telefon ? `+47 ${telefon}` : null,
          homeClub,
          ambition: ambition || null,
        });
        router.refresh();
        onClose();
      } catch {
        setError("Kunne ikke lagre. Prøv igjen.");
      }
    });
  }

  const initialer = ((fornavn[0] ?? "") + (etternavn[0] ?? "")).toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-foreground/40 backdrop-blur-sm sm:items-start sm:px-6 sm:py-12"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profil-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-h-[95vh] flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:max-h-none sm:max-w-[640px] sm:rounded-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-6">
          <div>
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              PlayerHQ · Meg
            </span>
            <h2
              id="profil-modal-title"
              className="mt-1 font-display text-[22px] font-semibold leading-tight tracking-tight"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Lukk"
            onClick={onClose}
            className="-mr-2 -mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:h-9 sm:w-9"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </header>

        <div className="flex max-h-[70vh] flex-col gap-6 overflow-y-auto px-6 py-6">
          {/* Avatar */}
          <div className="grid grid-cols-[96px_1fr] items-center gap-4">
            <div className="relative h-24 w-24">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-primary font-display text-[32px] font-bold text-accent">
                {initialer || "?"}
              </div>
              <button
                type="button"
                aria-label="Bytt profilbilde"
                className="absolute -bottom-0.5 -right-0.5 grid h-8 w-8 place-items-center rounded-full border-2 border-card bg-accent text-foreground"
              >
                <Camera className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>
            <div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Last opp nytt
                </button>
                <button
                  type="button"
                  className="text-sm font-semibold text-destructive hover:underline"
                >
                  Fjern
                </button>
              </div>
              <div className="mt-1 font-mono text-[10.5px] text-muted-foreground/70">
                JPG eller PNG · maks 5 MB · kvadrat anbefales
              </div>
            </div>
          </div>

          {/* Personalia */}
          <Sec title="Personalia">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <ModalField label="Fornavn" required>
                <input
                  className={modalInputCss}
                  value={fornavn}
                  onChange={(e) => setFornavn(e.target.value)}
                />
              </ModalField>
              <ModalField label="Etternavn" required>
                <input
                  className={modalInputCss}
                  value={etternavn}
                  onChange={(e) => setEtternavn(e.target.value)}
                />
              </ModalField>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <ModalField label="Fødselsdato" required>
                <input
                  className={`${modalInputCss} font-mono`}
                  value={fodselsdato}
                  onChange={(e) => setFodselsdato(e.target.value)}
                  placeholder="DD.MM.ÅÅÅÅ"
                />
              </ModalField>
              <ModalField label="Kjønn">
                <select
                  className={modalInputCss}
                  value={kjonn}
                  onChange={(e) =>
                    setKjonn(
                      e.target.value as ProfilRedigerInitial["kjonn"],
                    )
                  }
                >
                  <option>Mann</option>
                  <option>Kvinne</option>
                  <option>Annet</option>
                  <option>Vil ikke oppgi</option>
                </select>
              </ModalField>
            </div>
          </Sec>

          {/* Kontakt */}
          <Sec title="Kontakt">
            <ModalField
              label="E-post"
              badge="endres i sikkerhet"
            >
              <input
                type="email"
                disabled
                className={`${modalInputCss} cursor-not-allowed bg-muted text-muted-foreground`}
                value={initial.email}
              />
            </ModalField>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <ModalField label="Telefon" required>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[12px] text-muted-foreground">
                    +47
                  </span>
                  <input
                    type="tel"
                    inputMode="tel"
                    className={`${modalInputCss} pl-12 font-mono`}
                    value={telefon}
                    onChange={(e) => setTelefon(e.target.value)}
                  />
                </div>
              </ModalField>
              <ModalField label="Adresse">
                <input
                  className={modalInputCss}
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Gateadresse, postnr by"
                />
              </ModalField>
            </div>
          </Sec>

          {/* Golf */}
          <Sec title="Golf">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1.4fr_0.8fr_0.8fr]">
              <ModalField label="Hjemmeklubb" required>
                <select
                  className={modalInputCss}
                  value={homeClub}
                  onChange={(e) => setHomeClub(e.target.value)}
                >
                  {KLUBBER.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </ModalField>
              <ModalField label="Handicap" badge="låst">
                <div className="flex items-baseline gap-2 rounded-md border border-border bg-muted px-4 py-2.5">
                  <span className="font-mono text-base font-bold text-foreground">
                    {initial.hcp != null
                      ? String(initial.hcp).replace(".", ",")
                      : "—"}
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    <RefreshCw className="h-2.5 w-2.5" strokeWidth={2} />
                    GolfBox
                  </span>
                </div>
              </ModalField>
              <ModalField label="Erfaring">
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={80}
                    className={`${modalInputCss} pr-10 font-mono`}
                    value={playingYears}
                    onChange={(e) => setPlayingYears(e.target.value)}
                    placeholder="0"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    år
                  </span>
                </div>
              </ModalField>
            </div>

            <ModalField label="Dominant hånd">
              <div className="grid grid-cols-2 gap-2 rounded-md border border-border bg-muted p-1">
                {(["Høyrehendt", "Venstrehendt"] as const).map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setDominant(h)}
                    className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                      dominant === h
                        ? "bg-card text-foreground shadow-sm"
                        : "bg-transparent text-muted-foreground"
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </ModalField>

            <ModalField label="Ambisjon" hint="Maks 280 tegn">
              <textarea
                className={modalInputCss}
                rows={3}
                value={ambition}
                onChange={(e) => setAmbition(e.target.value.slice(0, 280))}
                placeholder="Hva er du på vei mot?"
              />
              <span className="mt-1 block text-right font-mono text-[10px] text-muted-foreground">
                {ambition.length} / 280
              </span>
            </ModalField>
          </Sec>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-border bg-card px-6 py-4">
          {dirty && (
            <span className="mr-auto inline-flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-[color:rgb(217_119_6)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:rgb(217_119_6)]" />
              Ulagrede endringer
            </span>
          )}
          {error && (
            <span className="mr-auto text-xs text-destructive">{error}</span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Avbryt
          </button>
          <button
            type="button"
            disabled={!dirty || pending}
            onClick={lagre}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={2} />
            {pending ? "Lagrer …" : "Lagre endringer"}
          </button>
        </footer>
      </div>
    </div>
  );
}

const modalInputCss =
  "w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30";

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="border-b border-border/60 pb-1.5 font-display text-[12px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function ModalField({
  label,
  required = false,
  badge,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  badge?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
        {badge && (
          <span className="ml-auto rounded-sm border border-border bg-muted px-1.5 py-0.5 font-mono text-[9.5px] font-semibold normal-case tracking-[0.04em] text-muted-foreground/80">
            {badge}
          </span>
        )}
      </label>
      {children}
      {hint && (
        <span className="font-mono text-[10px] text-muted-foreground/70">
          {hint}
        </span>
      )}
    </div>
  );
}
