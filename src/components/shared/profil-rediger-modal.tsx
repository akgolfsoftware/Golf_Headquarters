"use client";

/**
 * Profil-rediger-modal — kompakt modal-variant av /portal/meg/profil/rediger.
 * Brukes når modal-formfaktor er ønsket (f.eks. fra hjem-side).
 * Eksporteres for gjenbruk fra andre klient-komponenter.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, RefreshCw, X } from "lucide-react";
import { updateProfile } from "@/app/portal/meg/profil/rediger/actions";

type ModalInitial = {
  name: string;
  email: string;
  phone: string;
  hcp: number | null;
  homeClub: string;
  fodselsdato: string;
};

export function ProfilRedigerModal({
  initial,
  onClose,
}: {
  initial: ModalInitial;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(initial.name);
  const [fodselsdato, setFodselsdato] = useState(initial.fodselsdato);
  const [email, setEmail] = useState(initial.email);
  const [telefon, setTelefon] = useState(initial.phone);
  const [homeClub, setHomeClub] = useState(initial.homeClub);

  const dirty =
    name !== initial.name ||
    fodselsdato !== initial.fodselsdato ||
    email !== initial.email ||
    telefon !== initial.phone ||
    homeClub !== initial.homeClub;

  function lagre() {
    startTransition(async () => {
      await updateProfile({
        name,
        phone: telefon || null,
        homeClub,
      });
      router.refresh();
      onClose();
    });
  }

  const initialer = name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 px-6 py-20 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profil-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
          <div>
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              PlayerHQ · Meg
            </span>
            <h2
              id="profil-modal-title"
              className="mt-1 font-display text-[22px] font-semibold leading-tight tracking-tight"
            >
              Rediger <em className="font-normal italic text-primary">profil</em>
            </h2>
          </div>
          <button
            type="button"
            aria-label="Lukk"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </header>

        <div className="flex max-h-[60vh] flex-col gap-6 overflow-y-auto px-6 py-5">
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
            <ModalField label="Fullt navn" required>
              <input
                className={modalInputCss}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </ModalField>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ModalField label="Fødselsdato" required>
                <input
                  className={`${modalInputCss} font-mono`}
                  value={fodselsdato}
                  onChange={(e) => setFodselsdato(e.target.value)}
                  placeholder="DD.MM.ÅÅÅÅ"
                />
              </ModalField>
              <ModalField label="Handicap" badge="låst">
                <div className="flex items-baseline gap-2 rounded-md border border-border bg-muted px-3 py-2.5">
                  <span className="font-mono text-base font-bold text-foreground">
                    {initial.hcp != null ? String(initial.hcp).replace(".", ",") : "—"}
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    <RefreshCw className="h-2.5 w-2.5" strokeWidth={2} />
                    GolfBox
                  </span>
                </div>
              </ModalField>
            </div>
          </Sec>

          {/* Kontakt */}
          <Sec title="Kontakt">
            <ModalField label="E-post" required>
              <input
                type="email"
                className={modalInputCss}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </ModalField>
            <ModalField label="Telefon" required>
              <input
                type="tel"
                className={modalInputCss}
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
              />
            </ModalField>
          </Sec>

          {/* Klubb */}
          <Sec title="Klubb-tilknytning">
            <ModalField label="Hjemmeklubb" required>
              <select
                className={modalInputCss}
                value={homeClub}
                onChange={(e) => setHomeClub(e.target.value)}
              >
                <option>Søgne &amp; Mandal Golfklubb</option>
                <option>Gamle Fredrikstad GK</option>
                <option>Oslo Golfklubb</option>
                <option>Asker Golfklubb</option>
                <option>Sarpsborg Golfklubb</option>
              </select>
            </ModalField>
          </Sec>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-border bg-card px-6 py-4">
          {dirty && (
            <span className="mr-auto inline-flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-[color:rgb(217_119_6)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:rgb(217_119_6)]" />
              Ulagrede endringer
            </span>
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
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
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
  "w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30";

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
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
  children,
}: {
  label: string;
  required?: boolean;
  badge?: string;
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
    </div>
  );
}
