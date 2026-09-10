"use client";

/**
 * PlayerHQ DataGolf-stasjon — alle slag.
 *
 * Fasit: designsystem/train-lock/DG-14 Stasjon.dc.html
 *   (DG-14a Stasjon 390 · DG-14b Stasjon 1280)
 *   + designsystem/train-lock/DG-14L Stasjon lys.dc.html
 *   + designsystem/train-lock/DG-15 Okt ferdig.dc.html
 *   + designsystem/train-lock/DG-13 Innspill-band.dc.html
 *
 * Avvik:
 *   - Slagvelger for 14 slag (fasiten viser kun INNSPILL_100).
 *   - Carry-felt når stasjonen trenger lengde (fasiten antar 50 m).
 *   - Putting/tee/chip bruker annen regel enn sirkel — merket i copy.
 *   - Lys via --tl-* (DG-14L ikke pikselportet som egen fil).
 *   - «Ferdig» er tilstand på samme rute, ikke egen URL.
 *   - Fasiten farger «Tak:» og sirkel-radius med viz-target som tekst;
 *     koden bruker TL.mute (kontrast-gaten). Target er kant på sirkelen.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition, type CSSProperties } from "react";
import { lagreDataGolfUtfordring } from "@/app/portal/analysere/datagolf/actions";
import { TilbakeLenke } from "@/components/v2";
import { bandEtikett } from "@/lib/datagolf/player-tool";
import { TAK_BAND } from "@/lib/datagolf/tak";
import { TL } from "@/lib/v2/train-lock";
import {
  STASJON_SLAG,
  ferdigSetning,
  fmtLengde,
  type Stasjon,
} from "@/lib/datagolf/stasjon";

export type StasjonTakKort = { dgPlayerId: number; name: string };

export type StasjonTrainLockProps = {
  stasjon: Stasjon | null;
  taker: StasjonTakKort[];
  valgtTakId: number | null;
  carryMeter: number | null;
  lie: "fairway" | "rough";
  andreSirkler: { name: string; sirkelMeter: number | null }[];
};

type Ball = "tom" | "inne" | "ute";

const PRESS =
  "motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]";

const GRUPPER: { id: Stasjon["slag"]["gruppe"]; label: string }[] = [
  { id: "tee", label: "Tee" },
  { id: "innspill", label: "Innspill" },
  { id: "kortspill", label: "Kortspill" },
  { id: "putting", label: "Putting" },
];

function stasjonHref(opts: {
  takId: number | null;
  slag: string;
  carry: number | null;
  lie: "fairway" | "rough";
}): string {
  const p = new URLSearchParams();
  if (opts.takId != null) p.set("tak", String(opts.takId));
  p.set("slag", opts.slag);
  if (opts.carry != null && opts.carry > 0) p.set("carry", String(opts.carry));
  if (opts.lie === "rough") p.set("lie", "rough");
  const q = p.toString();
  return q ? `/portal/analysere/datagolf/stasjon?${q}` : "/portal/analysere/datagolf/stasjon";
}

export function StasjonTrainLock({
  stasjon,
  taker,
  valgtTakId,
  carryMeter,
  lie,
  andreSirkler,
}: StasjonTrainLockProps) {
  const router = useRouter();
  const [baller, setBaller] = useState<Ball[]>(() => Array.from({ length: 10 }, () => "tom"));
  const [ferdig, setFerdig] = useState(false);
  const [lagrer, startLagring] = useTransition();
  const [lagreFeil, setLagreFeil] = useState<string | null>(null);
  const attempt = useRef<{ id: string; start: string } | null>(null);
  const [carryFelt, setCarryFelt] = useState(carryMeter != null ? String(carryMeter).replace(".", ",") : "");

  const inne = baller.filter((b) => b === "inne").length;
  const slagId = stasjon?.slag.id ?? "innspill100";

  const hrefBase = useMemo(
    () => ({
      takId: valgtTakId,
      carry: carryMeter,
      lie,
    }),
    [valgtTakId, carryMeter, lie],
  );

  function settBall(i: number) {
    if (!attempt.current) attempt.current = { id: crypto.randomUUID(), start: new Date().toISOString() };
    setBaller((forrige) => {
      const neste = [...forrige];
      neste[i] = forrige[i] === "tom" ? "inne" : forrige[i] === "inne" ? "ute" : "tom";
      return neste;
    });
  }

  function fullfor() {
    if (!stasjon || !valgtTakId || !attempt.current || baller.some(b => b === "tom")) return;
    const forsok = attempt.current;
    setLagreFeil(null);
    startLagring(async () => {
      try {
        const result = await lagreDataGolfUtfordring({ attemptId: forsok.id, startedAt: forsok.start,
          tak: valgtTakId, slag: slagId, carry: carryMeter, lie, baller, target: stasjon.maalVerdi });
        if (result.ok) setFerdig(true);
        else setLagreFeil(result.message);
      } catch { setLagreFeil("Kunne ikke lagre. Ballene er beholdt her. Prøv igjen."); }
    });
  }

  function lagreCarry() {
    const n = Number(carryFelt.replace(",", "."));
    const carry = Number.isFinite(n) && n > 0 && n <= 400 ? n : null;
    router.replace(stasjonHref({ ...hrefBase, slag: slagId, carry }));
  }

  if (!stasjon) {
    return (
      <div>
        <TilbakeLenke href="/portal/analysere/datagolf">DataGolf</TilbakeLenke>
        <p style={{ marginTop: 16, fontSize: 15, color: TL.mute }}>
          Proffreferansene er ikke tilgjengelige ennå. Prøv igjen senere.
        </p>
      </div>
    );
  }

  if (ferdig) {
    return (
      <div>
        <TilbakeLenke href="/portal/analysere/datagolf">DataGolf</TilbakeLenke>
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              boxShadow: `inset 0 0 0 2px ${TL.warm}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: TL.warmText,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            ✓
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: TL.vekt.caps,
              letterSpacing: TL.track.caps,
              textTransform: "uppercase",
              color: TL.mute,
            }}
          >
            {stasjon.slag.omraade} · fullført
          </span>
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 0.95,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {inne}
          <span style={{ color: TL.mute }}>/10</span>
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            fontWeight: TL.vekt.caps,
            letterSpacing: TL.track.caps,
            textTransform: "uppercase",
            color: TL.mute,
          }}
        >
          Inne
        </div>
        <p style={{ marginTop: 18, fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.25 }}>
          {ferdigSetning(inne, 10, stasjon.takNavn, stasjon.kilde === "datagolf")}
        </p>
        <p role="status" style={{ marginTop: 12, color: TL.mute }}>Resultatet er lagret i din treningshistorikk. Utfordringen måler treff på treningsmålet, ikke om du er bedre enn proffen.</p>
        <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
          {baller.map((b, i) => (
            <div
              key={i}
              style={{
                height: 40,
                borderRadius: 8,
                background: b === "inne" ? TL.viz.dot : TL.dim,
              }}
            />
          ))}
        </div>
        <button
          type="button"
          className={PRESS}
          onClick={() => {
            setFerdig(false);
            setBaller(Array.from({ length: 10 }, () => "tom"));
            attempt.current = null;
          }}
          style={{
            marginTop: 24,
            width: "100%",
            height: 48,
            borderRadius: TL.radius.pill,
            background: TL.fill,
            color: TL.onFill,
            fontSize: 16,
            fontWeight: 700,
            border: 0,
            cursor: "pointer",
          }}
        >
          Ny økt
        </button>
      </div>
    );
  }

  return (
    <div>
      <TilbakeLenke href="/portal/analysere/datagolf">DataGolf</TilbakeLenke>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: TL.vekt.caps,
            letterSpacing: TL.track.caps,
            textTransform: "uppercase",
            color: TL.mute,
          }}
        >
          {stasjon.slag.omraade}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: TL.vekt.caps,
            letterSpacing: TL.track.caps,
            textTransform: "uppercase",
            color: TL.mute,
          }}
        >
          Proff: {stasjon.takNavn}
        </span>
      </div>

      <label style={{ display: "grid", gap: 8, marginTop: 14 }}>
        <span>Velg proff</span>
        <select aria-label="Velg proff" value={valgtTakId ?? ""}
          onChange={e => router.push(stasjonHref({ ...hrefBase, takId: Number(e.target.value), slag: slagId }))}
          style={{ minHeight: 48, width: "100%", background: TL.elev, color: TL.text,
            border: `1px solid ${TL.hair}`, borderRadius: TL.radius.field, padding: "0 12px" }}>
          {taker.map(t => <option key={t.dgPlayerId} value={t.dgPlayerId}>{t.name}</option>)}
        </select>
      </label>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {GRUPPER.map((g) => (
          <div key={g.id}>
            <div
              style={{
                fontSize: 11,
                fontWeight: TL.vekt.caps,
                letterSpacing: TL.track.caps,
                textTransform: "uppercase",
                color: TL.mute,
                marginBottom: 6,
              }}
            >
              {g.label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {STASJON_SLAG.filter((s) => s.gruppe === g.id && (s.gruppe !== "innspill" || TAK_BAND.some(b => b.kode === s.innspillBand && b.lie === lie))).map((s) => {
                const aktiv = s.id === slagId;
                return (
                  <Link
                    key={s.id}
                    href={stasjonHref({ ...hrefBase, slag: s.id })}
                    className={PRESS}
                    style={{
                      height: 44,
                      padding: "0 14px",
                      borderRadius: TL.radius.pill,
                      background: aktiv ? TL.fill : TL.dock,
                      color: aktiv ? TL.onFill : TL.text,
                      display: "flex",
                      alignItems: "center",
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    {s.gruppe === "innspill" && s.innspillBand ? bandEtikett({ band: s.innspillBand, lie }) : s.etikett}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {stasjon.slag.gruppe === "innspill" ? (
        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          <Link
            href={stasjonHref({ ...hrefBase, slag: slagId, lie: "fairway" })}
            className={PRESS}
            style={pilleStil(lie === "fairway")}
          >
            Fairway
          </Link>
          <Link
            href={stasjonHref({ ...hrefBase, slag: slagId === "innspill50" ? "innspill100" : slagId === "innspill200" ? "innspill150" : slagId, lie: "rough" })}
            className={PRESS}
            style={pilleStil(lie === "rough")}
          >
            Rough
          </Link>
        </div>
      ) : null}

      {stasjon.slag.trengerCarry ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            lagreCarry();
          }}
          style={{ marginTop: 16, display: "flex", gap: 8 }}
        >
          <label style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: TL.vekt.caps,
                letterSpacing: TL.track.caps,
                textTransform: "uppercase",
                color: TL.mute,
              }}
            >
              Din carry (meter)
            </span>
            <input
              inputMode="decimal"
              value={carryFelt}
              onChange={(e) => setCarryFelt(e.target.value)}
              placeholder="50"
              aria-label="Din carry i meter"
              style={{
                height: 48,
                borderRadius: TL.radius.field,
                border: `1px solid ${TL.hair}`,
                background: TL.elev,
                color: TL.text,
                padding: "0 16px",
                fontSize: 16,
                fontWeight: 600,
                fontVariantNumeric: "tabular-nums",
              }}
            />
          </label>
          <button
            type="submit"
            className={PRESS}
            style={{
              alignSelf: "flex-end",
              height: 48,
              padding: "0 18px",
              borderRadius: TL.radius.pill,
              background: TL.dock,
              color: TL.text,
              fontSize: 15,
              fontWeight: 600,
              border: 0,
              cursor: "pointer",
            }}
          >
            Sett
          </button>
        </form>
      ) : null}

      <div style={{ marginTop: 20, display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
        <div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 0.92,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {fmtLengde(stasjon.stasjonVerdi, stasjon.stasjonEnhet)}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 11,
              fontWeight: TL.vekt.caps,
              letterSpacing: TL.track.caps,
              textTransform: "uppercase",
              color: TL.mute,
            }}
          >
            Du står her
          </div>
        </div>
        <div style={{ width: 1, height: 72, background: TL.hair }} />
        <div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 0.92,
              fontVariantNumeric: "tabular-nums",
              color: TL.viz.dot,
            }}
          >
            {stasjon.maalVerdi != null
              ? fmtLengde(stasjon.maalVerdi, stasjon.maalEnhet)
                : stasjon.kind === "sirkel" ? "Mangler"
                : stasjon.kind === "korridor"
                ? "Stripe"
                : stasjon.kind === "i_hull"
                  ? "I hull"
                  : "På green"}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 11,
              fontWeight: TL.vekt.caps,
              letterSpacing: TL.track.caps,
              textTransform: "uppercase",
              color: TL.mute,
            }}
          >
            {stasjon.kind === "sirkel" ? "Treningsmål · radius" : "Regel"}
          </div>
        </div>
      </div>

      <p style={{ marginTop: 14, fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}>{stasjon.regel}</p>
      {stasjon.lekkasje ? (
        <p
          style={{
            marginTop: 8,
            fontSize: 11,
            fontWeight: TL.vekt.caps,
            letterSpacing: TL.track.caps,
            textTransform: "uppercase",
            color: TL.mute,
          }}
        >
          Proffens SG er under referansen i dette intervallet
        </p>
      ) : null}

      <div style={{ marginTop: 16, background: TL.elev, borderRadius: TL.radius.card, padding: "18px 18px 14px" }}>
        <Skisse stasjon={stasjon} />
        <div
          style={{
            marginTop: 4,
            paddingTop: 14,
            borderTop: `1px solid ${TL.hair}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: TL.vekt.caps,
              letterSpacing: TL.track.caps,
              textTransform: "uppercase",
              color: TL.mute,
            }}
          >
            Inne / ute
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{inne}/10</span>
        </div>
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
          {baller.map((b, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ball ${i + 1}: ${b}`}
              className={PRESS}
              onClick={() => settBall(i)}
              disabled={lagrer || stasjon.manglerCarry || stasjon.kilde === "mangler"}
              style={{
                height: 44,
                borderRadius: 8,
                border: 0,
                cursor: "pointer",
                background: b === "inne" ? TL.viz.dot : b === "ute" ? TL.dock : TL.dim,
              }}
            />
          ))}
        </div>
        <p style={{ marginTop: 10, fontSize: 13, color: TL.mute }}>Trykk en ball: inne, ute, tom.</p>
      </div>

      {andreSirkler.length > 0 && stasjon.kind === "sirkel" && !stasjon.manglerCarry ? (
        <div style={{ marginTop: 16, background: TL.elev, borderRadius: TL.radius.card, padding: 18 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: TL.vekt.caps,
              letterSpacing: TL.track.caps,
              textTransform: "uppercase",
              color: TL.mute,
            }}
          >
            Treningsmål med andre proffreferanser
          </div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {andreSirkler.map((r) => (
              <div key={r.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: TL.mute }}>{r.name}</span>
                <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {fmtLengde(r.sirkelMeter, "m")}
                </span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: TL.mute, lineHeight: 1.45 }}>
            Stasjonen står. Bare sirkelen byttes.
          </p>
        </div>
      ) : null}

      <p style={{ marginTop: 16, fontSize: 13, color: TL.mute }}>{stasjon.kildeTekst}</p>
      {lagreFeil ? <p role="alert" style={{ marginTop: 12 }}>{lagreFeil}</p> : null}
      <p role="status" style={{ marginTop: 8, color: TL.mute }}>{baller.filter(b => b !== "tom").length} av 10 baller registrert.</p>

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <button
          type="button"
          className={PRESS}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            height: 48,
            padding: "0 20px",
            borderRadius: TL.radius.pill,
            border: `1px solid ${TL.hair}`,
            color: TL.mute,
            fontSize: 15,
            fontWeight: 600,
            background: "transparent",
            cursor: "pointer",
          }}
        >
          Bytt proff
        </button>
        <button
          type="button"
          className={PRESS}
          onClick={fullfor}
          disabled={lagrer || baller.some(b => b === "tom") || stasjon.manglerCarry || stasjon.kilde === "mangler"}
          style={{
            flex: 1,
            height: 48,
            borderRadius: TL.radius.pill,
            background: TL.fill,
            color: TL.onFill,
            fontSize: 16,
            fontWeight: 700,
            border: 0,
            cursor: "pointer",
          }}
        >
          {lagrer ? "Lagrer …" : "Lagre resultat"}
        </button>
      </div>
    </div>
  );
}

function pilleStil(aktiv: boolean): CSSProperties {
  return {
    height: 44,
    padding: "0 18px",
    borderRadius: TL.radius.pill,
    background: aktiv ? TL.fill : TL.dock,
    color: aktiv ? TL.onFill : TL.text,
    display: "flex",
    alignItems: "center",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
  };
}

function Skisse({ stasjon }: { stasjon: Stasjon }) {
  if (stasjon.kind === "korridor") {
    return (
      <div style={{ position: "relative", height: 180 }}>
        <div
          style={{
            position: "absolute",
            left: "28%",
            right: "28%",
            top: 24,
            bottom: 36,
            border: `2px dashed ${TL.viz.target}`,
            borderRadius: 8,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 28,
            transform: "translateX(-50%)",
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: TL.viz.dot,
          }}
        />
        <span
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            fontSize: 11,
            fontWeight: TL.vekt.caps,
            letterSpacing: TL.track.caps,
            textTransform: "uppercase",
            color: TL.mute,
          }}
        >
          Stripe · ovenfra
        </span>
      </div>
    );
  }

  if (stasjon.kind !== "sirkel") {
    return (
      <div style={{ position: "relative", height: 120 }}>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 40,
            transform: "translate(-50%, -50%)",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: TL.text,
          }}
        />
        <span
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            fontSize: 11,
            fontWeight: TL.vekt.caps,
            letterSpacing: TL.track.caps,
            textTransform: "uppercase",
            color: TL.mute,
          }}
        >
          Pinne
        </span>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: 250 }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 78,
          bottom: 26,
          width: 0,
          borderLeft: `1px dashed ${TL.hair}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 78,
          transform: "translate(-50%, -50%)",
          width: 132,
          height: 132,
          borderRadius: "50%",
          boxShadow: `inset 0 0 0 2px ${TL.viz.target}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 78,
          transform: "translate(-50%, -50%)",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: TL.text,
        }}
      />
      <span
        style={{
          position: "absolute",
          left: "calc(50% + 74px)",
          top: 78,
          transform: "translateY(-50%)",
          fontSize: 13,
          fontWeight: 600,
          color: TL.mute,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {fmtLengde(stasjon.maalVerdi, stasjon.maalEnhet)}
      </span>
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 20,
          transform: "translateX(-50%)",
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: TL.viz.dot,
        }}
      />
      <span
        style={{
          position: "absolute",
          left: "calc(50% + 16px)",
          bottom: 14,
          fontSize: 13,
          fontWeight: 600,
          color: TL.mute,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {fmtLengde(stasjon.stasjonVerdi, stasjon.stasjonEnhet)} carry
      </span>
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          fontSize: 11,
          fontWeight: TL.vekt.caps,
          letterSpacing: TL.track.caps,
          textTransform: "uppercase",
          color: TL.mute,
        }}
      >
        Pinne
      </span>
    </div>
  );
}
