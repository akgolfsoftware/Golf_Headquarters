"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Copy,
  Download,
  KeyRound,
  ShieldCheck,
  Smartphone,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/components/shared/toast-provider";

type Steg = 1 | 2 | 3;
type Metode = "authenticator" | "sms";

// Placeholder-secret + backup-koder. Reell flyt kobles mot Supabase MFA.
function genererBackupKoder(): string[] {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const lag = () =>
    Array.from(
      { length: 10 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  return Array.from({ length: 10 }, () => `${lag().slice(0, 5)}-${lag().slice(5)}`);
}

function placeholderSecret(): string {
  return "JBSWY3DPEHPK3PXP";
}

export function TwoFaClient() {
  const router = useRouter();
  const toast = useToast();

  const [steg, setSteg] = useState<Steg>(1);
  const [metode, setMetode] = useState<Metode>("authenticator");
  const [kode, setKode] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [lagret, setLagret] = useState(false);

  const secret = useMemo(() => placeholderSecret(), []);
  const backupKoder = useMemo(() => genererBackupKoder(), []);

  function tilSteg2() {
    setFeil(null);
    if (metode === "sms") {
      // SMS-flyt — placeholder. I produksjon: be om telefonnummer, send kode.
      setSteg(2);
    } else {
      setSteg(2);
    }
  }

  function bekreftKode() {
    setFeil(null);
    if (kode.length !== 6) {
      setFeil("Skriv inn alle 6 sifrene.");
      return;
    }
    setPending(true);
    // Placeholder for ekte verifikasjon mot Supabase MFA.
    setTimeout(() => {
      setPending(false);
      setSteg(3);
    }, 400);
  }

  async function kopierBackup() {
    try {
      await navigator.clipboard.writeText(backupKoder.join("\n"));
      toast.success("Backup-koder kopiert");
    } catch {
      toast.error("Kunne ikke kopiere — last ned i stedet");
    }
  }

  function lastNedBackup() {
    const blob = new Blob([backupKoder.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ak-golf-backup-koder.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.info("Backup-koder lastet ned");
  }

  function fullfor() {
    if (!lagret) {
      setFeil("Bekreft at du har lagret backup-kodene.");
      return;
    }
    toast.success("2FA aktivert");
    router.push("/portal/meg/sikkerhet");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <StegIndikator steg={steg} />

      {steg === 1 && (
        <Kort tittel="Velg metode" aux="Steg 1 av 3">
          <fieldset className="space-y-3">
            <legend className="sr-only">Velg 2FA-metode</legend>
            <MetodeKort
              valgt={metode === "authenticator"}
              onClick={() => setMetode("authenticator")}
              ikon={Smartphone}
              tittel="Autenticator-app"
              beskrivelse="Anbefalt. Bruk Google Authenticator, Authy, 1Password eller lignende."
              badge="Anbefalt"
            />
            <MetodeKort
              valgt={metode === "sms"}
              onClick={() => setMetode("sms")}
              ikon={MessageSquare}
              tittel="SMS"
              beskrivelse="Kode sendes til telefonnummeret ditt ved innlogging."
            />
          </fieldset>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={tilSteg2}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Fortsett
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </Kort>
      )}

      {steg === 2 && (
        <Kort
          tittel={metode === "authenticator" ? "Skann QR-kode" : "Bekreft SMS-kode"}
          aux="Steg 2 av 3"
        >
          {metode === "authenticator" ? (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Åpne autenticator-appen din og skann QR-koden under. Eller skriv
                inn secret-koden manuelt.
              </p>
              <div className="flex flex-col items-center gap-4">
                <QrPlaceholder data={`otpauth://totp/AK%20Golf?secret=${secret}`} />
                <div className="text-center">
                  <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Manuell secret
                  </div>
                  <code className="mt-1 inline-block break-all rounded-md border border-border bg-muted px-4 py-2 font-mono text-sm tabular-nums text-foreground">
                    {secret}
                  </code>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Vi har sendt en 6-sifret kode til telefonen din. Skriv den inn under.
            </p>
          )}

          <label className="mt-6 block">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              6-sifret kode
            </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={kode}
              onChange={(e) => setKode(e.target.value.replace(/[^0-9]/g, ""))}
              autoFocus
              className="w-full rounded-md border border-input bg-card px-4 py-4 text-center font-mono text-lg tabular-nums tracking-[0.5em] outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
              placeholder="000000"
            />
          </label>

          {feil && (
            <div
              role="alert"
              className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
            >
              {feil}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setSteg(1)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-input bg-card px-4 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
            >
              Tilbake
            </button>
            <button
              type="button"
              onClick={bekreftKode}
              disabled={pending || kode.length !== 6}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Bekrefter …" : "Bekreft"}
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </Kort>
      )}

      {steg === 3 && (
        <Kort tittel="Backup-koder" aux="Steg 3 av 3">
          <div className="flex items-start gap-3 rounded-md border border-accent/40 bg-accent/10 px-4 py-3">
            <KeyRound
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-foreground"
              strokeWidth={1.75}
            />
            <p className="text-sm text-foreground">
              Hver kode kan brukes <strong>én gang</strong> hvis du mister tilgang
              til autenticator-appen. Lagre dem trygt — du får ikke se dem igjen.
            </p>
          </div>

          <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {backupKoder.map((k, i) => (
              <li
                key={k}
                className="flex items-center gap-3 rounded-md border border-border bg-muted px-4 py-3 font-mono text-sm tabular-nums text-foreground"
              >
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {k}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={lastNedBackup}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-input bg-card px-4 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
              Last ned
            </button>
            <button
              type="button"
              onClick={kopierBackup}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-input bg-card px-4 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
            >
              <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
              Kopier alle
            </button>
          </div>

          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card px-4 py-3">
            <input
              type="checkbox"
              checked={lagret}
              onChange={(e) => {
                setLagret(e.target.checked);
                setFeil(null);
              }}
              className="mt-1 h-4 w-4 cursor-pointer rounded-sm border-input accent-primary"
            />
            <span className="text-sm text-foreground">
              Jeg har lagret backup-kodene på et trygt sted.
            </span>
          </label>

          {feil && (
            <div
              role="alert"
              className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive"
            >
              {feil}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={fullfor}
              disabled={!lagret}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
              Fullfør og aktiver
            </button>
          </div>
        </Kort>
      )}
    </div>
  );
}

function Kort({
  tittel,
  aux,
  children,
}: {
  tittel: string;
  aux?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <header className="flex items-baseline justify-between gap-4 border-b border-border px-6 py-4">
        <h2 className="font-display text-base font-semibold text-foreground">
          {tittel}
        </h2>
        {aux && (
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {aux}
          </span>
        )}
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}

function StegIndikator({ steg }: { steg: Steg }) {
  const stegene: { id: Steg; label: string }[] = [
    { id: 1, label: "Metode" },
    { id: 2, label: "Verifiser" },
    { id: 3, label: "Backup" },
  ];
  return (
    <ol className="flex items-center gap-2" aria-label="Fremdrift">
      {stegene.map((s, i) => {
        const ferdig = steg > s.id;
        const aktiv = steg === s.id;
        return (
          <li key={s.id} className="flex items-center gap-2">
            <span
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border font-mono text-xs tabular-nums ${
                aktiv
                  ? "border-primary bg-primary text-primary-foreground"
                  : ferdig
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground"
              }`}
            >
              {ferdig ? (
                <Check className="h-3.5 w-3.5" strokeWidth={2.25} />
              ) : (
                s.id
              )}
            </span>
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.10em] ${
                aktiv ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            {i < stegene.length - 1 && (
              <span
                aria-hidden
                className={`mx-2 h-px w-8 ${
                  ferdig ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function MetodeKort({
  valgt,
  onClick,
  ikon: Ikon,
  tittel,
  beskrivelse,
  badge,
}: {
  valgt: boolean;
  onClick: () => void;
  ikon: typeof Smartphone;
  tittel: string;
  beskrivelse: string;
  badge?: string;
}) {
  return (
    <label
      onClick={onClick}
      className={`flex cursor-pointer items-start gap-4 rounded-lg border bg-card p-4 transition-colors ${
        valgt
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/40"
      }`}
    >
      <input
        type="radio"
        name="2fa-metode"
        checked={valgt}
        onChange={onClick}
        className="mt-1 h-4 w-4 cursor-pointer accent-primary"
      />
      <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
        <Ikon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-sm font-semibold text-foreground">
            {tittel}
          </span>
          {badge && (
            <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-accent-foreground">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{beskrivelse}</p>
      </div>
    </label>
  );
}

// SVG-placeholder for QR-kode. Erstattes med ekte QR fra Supabase MFA.
function QrPlaceholder({ data }: { data: string }) {
  // Liten deterministisk pattern basert på data-strengen.
  const sz = 21;
  const cells: boolean[] = [];
  let seed = 0;
  for (let i = 0; i < data.length; i++) seed = (seed * 31 + data.charCodeAt(i)) >>> 0;
  for (let i = 0; i < sz * sz; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    cells.push((seed & 1) === 1);
  }
  // Hardkode finder-mønstre i hjørnene.
  const erFinder = (x: number, y: number) => {
    const inBox = (xs: number, ys: number) =>
      x >= xs && x < xs + 7 && y >= ys && y < ys + 7;
    return inBox(0, 0) || inBox(sz - 7, 0) || inBox(0, sz - 7);
  };
  const finderSort = (x: number, y: number) => {
    const test = (xs: number, ys: number) => {
      const lx = x - xs;
      const ly = y - ys;
      if (lx < 0 || lx > 6 || ly < 0 || ly > 6) return null;
      const ytre = lx === 0 || lx === 6 || ly === 0 || ly === 6;
      const indre = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
      return ytre || indre;
    };
    return (
      test(0, 0) === true || test(sz - 7, 0) === true || test(0, sz - 7) === true
    );
  };
  return (
    <div
      role="img"
      aria-label="QR-kode for 2FA-oppsett (placeholder)"
      className="rounded-md border border-border bg-card p-3"
    >
      <svg
        viewBox={`0 0 ${sz} ${sz}`}
        width={200}
        height={200}
        shapeRendering="crispEdges"
        className="block"
      >
        <rect width={sz} height={sz} fill="white" />
        {cells.map((on, i) => {
          const x = i % sz;
          const y = Math.floor(i / sz);
          if (erFinder(x, y)) return null;
          if (!on) return null;
          return <rect key={i} x={x} y={y} width={1} height={1} fill="#0A1F17" />;
        })}
        {Array.from({ length: sz * sz }).map((_, i) => {
          const x = i % sz;
          const y = Math.floor(i / sz);
          if (!erFinder(x, y)) return null;
          if (!finderSort(x, y)) return null;
          return (
            <rect key={`f-${i}`} x={x} y={y} width={1} height={1} fill="#0A1F17" />
          );
        })}
      </svg>
    </div>
  );
}
