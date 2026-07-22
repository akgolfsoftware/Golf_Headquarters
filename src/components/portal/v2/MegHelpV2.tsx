"use client";

/**
 * PlayerHQ Meg · Hjelpesenter — v2 Presis + B-pakke (søk, tom = én grønn vei).
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Rad,
  CTAPill,
  Trekkspill,
  TomTilstand,
  Icon,
  PalettSok,
} from "@/components/v2";

/* ── Datakontrakt ──────────────────────────────────────────────────── */

export type HjelpFaq = { q: string; a: string };
export type HjelpKategori = {
  slug: string;
  tittel: string;
  beskrivelse: string;
  ikon: string;
  antall: number;
};
export type HjelpArtikkel = {
  slug: string;
  tittel: string;
  kategori: string;
  lesetid: number;
};

export type MegHelpData = {
  faq: HjelpFaq[];
  kategorier: HjelpKategori[];
  artikler: HjelpArtikkel[];
};

/* ── Lokal byggekloss (samme idiom som InnstillingerV2.SeksjonIkon) ─── */

/** Rundt ikon-emblem foran/over en rad eller flis. */
function Emblem({ name, size = 34 }: { name: string; size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 11,
        background: T.panel3,
        border: `1px solid ${T.border}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
      }}
    >
      <Icon name={name} size={Math.round(size * 0.45)} style={{ color: T.fg2 }} />
    </span>
  );
}

/* ── Hjelpere ──────────────────────────────────────────────────────── */

/** true på klient etter mount når viewport < 768px (styrer kun tittelstørrelse). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function MegHelpV2({ data }: { data: MegHelpData }) {
  const mobile = useMobile();
  const { faq, kategorier, artikler } = data;
  const [sok, setSok] = useState("");

  const q = sok.trim().toLowerCase();
  const treffKat = useMemo(
    () =>
      q
        ? kategorier.filter(
            (k) =>
              k.tittel.toLowerCase().includes(q) ||
              k.beskrivelse.toLowerCase().includes(q),
          )
        : [],
    [q, kategorier],
  );
  const treffArt = useMemo(
    () =>
      q
        ? artikler.filter(
            (a) =>
              a.tittel.toLowerCase().includes(q) ||
              a.kategori.toLowerCase().includes(q),
          )
        : [],
    [q, artikler],
  );
  const ingenTreff = q.length > 0 && treffKat.length === 0 && treffArt.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hode */}
      <div>
        <Caps>Meg · Hjelp</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel mobile={mobile} em="support.">
            Hjelp &amp;
          </Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 520 }}>
          Svar på vanlige spørsmål, søk i veiledningene, eller ta direkte kontakt.
        </p>
      </div>

      {/* Søk */}
      <PalettSok value={sok} onChange={setSok} placeholder="Søk i hjelpesenteret …" />

      {q ? (
        /* ── Søkeresultat ─────────────────────────────────────────── */
        ingenTreff ? (
          <>
            <Kort>
              <TomTilstand
                icon="search"
                title="Ingen treff"
                sub="Prøv et annet søkeord, eller ta kontakt med support."
              />
            </Kort>
            <Link href="/portal/meg/help/kontakt" style={{ textDecoration: "none", display: "block" }}>
              <CTAPill icon="message-circle" full>
                Kontakt support
              </CTAPill>
            </Link>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
            {treffKat.length > 0 && (
              <Kort eyebrow={`Kategorier · ${treffKat.length}`}>
                {treffKat.map((k, i) => (
                  <Link
                    key={k.slug}
                    href={`/portal/meg/help/kategori/${k.slug}`}
                    style={{ textDecoration: "none", color: "inherit", display: "block" }}
                  >
                    <Rad
                      leading={<Emblem name={k.ikon} />}
                      title={k.tittel}
                      sub={k.beskrivelse}
                      meta={<Caps size={9}>{k.antall} art.</Caps>}
                      last={i === treffKat.length - 1}
                    />
                  </Link>
                ))}
              </Kort>
            )}
            {treffArt.length > 0 && (
              <Kort eyebrow={`Artikler · ${treffArt.length}`}>
                {treffArt.map((a, i) => (
                  <Link
                    key={a.slug}
                    href={`/portal/meg/help/artikkel/${a.slug}`}
                    style={{ textDecoration: "none", color: "inherit", display: "block" }}
                  >
                    <Rad
                      leading={<Emblem name="file-text" />}
                      title={a.tittel}
                      sub={`${a.kategori} · ${a.lesetid} min lesetid`}
                      last={i === treffArt.length - 1}
                    />
                  </Link>
                ))}
              </Kort>
            )}
          </div>
        )
      ) : (
        /* ── Standard hub ─────────────────────────────────────────── */
        <>
          {/* Kategori-grid */}
          <div>
            <Caps size={9} style={{ margin: "0 2px 10px" }}>Kategorier</Caps>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: T.gap }}>
              {kategorier.map((k) => (
                <Link
                  key={k.slug}
                  href={`/portal/meg/help/kategori/${k.slug}`}
                  style={{ textDecoration: "none", color: "inherit", display: "block" }}
                >
                  <Kort hover style={{ height: "100%", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Emblem name={k.ikon} size={38} />
                      <Icon name="arrow-up-right" size={15} style={{ color: T.mut }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15.5, color: T.fg, letterSpacing: "-0.01em" }}>
                        {k.tittel}
                      </div>
                      <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.55, margin: "6px 0 0" }}>
                        {k.beskrivelse}
                      </p>
                    </div>
                    <Caps size={9} style={{ marginTop: "auto", paddingTop: 4 }}>
                      {k.antall} artikler
                    </Caps>
                  </Kort>
                </Link>
              ))}
            </div>
          </div>

          {/* Ofte stilte spørsmål */}
          <div>
            <Caps size={9} style={{ margin: "0 2px 10px" }}>Ofte stilte spørsmål</Caps>
            <Trekkspill items={faq.map((f) => ({ t: f.q, c: f.a }))} />
          </div>

          {/* Ta kontakt */}
          <Kort eyebrow="Ta kontakt">
            <Link href="/portal/meg/help/kontakt" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <Rad
                leading={<Emblem name="message-circle" />}
                title="Chat med support"
                sub="Svarer vanligvis innen 1 t"
              />
            </Link>
            <a href="mailto:support@akgolf.no" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <Rad
                leading={<Emblem name="mail" />}
                title="support@akgolf.no"
                sub="E-post til teamet"
              />
            </a>
            <Link href="/portal/meg/help/kategori/komme-i-gang" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
              <Rad
                leading={<Emblem name="file-text" />}
                title="Veiledninger"
                sub="Kom-i-gang-guider"
                trailing={<Icon name="external-link" size={14} style={{ color: T.mut }} />}
                last
              />
            </Link>
          </Kort>

          <Link href="/portal/meg/help/kontakt" style={{ textDecoration: "none", display: "block" }}>
            <CTAPill icon="message-circle" full>
              Kontakt support
            </CTAPill>
          </Link>
          <Link
            href="/portal/meg/feedback"
            style={{
              textDecoration: "none",
              display: "block",
              textAlign: "center",
              fontFamily: T.ui,
              fontSize: 12,
              fontWeight: 600,
              color: T.mut,
              padding: "2px 0 4px",
            }}
          >
            Send forslag eller meld feil →
          </Link>
        </>
      )}
    </div>
  );
}
