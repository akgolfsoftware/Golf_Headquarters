import { useEffect, useMemo, useState } from "react";
import { dataFor } from "@/lib/tn/demo";
import type { Role, TnScreen } from "@/lib/tn/access";
import { frameCandidates, type Tilstand } from "./frame-key";
import { hydrate } from "./hydrate";

const rawFrames = import.meta.glob("./frames/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function lookup(file: string): string | null {
  const hit = Object.entries(rawFrames).find(([path]) => path.endsWith(`/${file}`));
  return hit ? hit[1] : null;
}

export function FasitCanvas({
  screen,
  role,
  tilstand = "suksess",
  data,
}: {
  screen: TnScreen;
  role: Role;
  tilstand?: Tilstand;
  data?: Record<string, unknown>;
}) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const html = useMemo(() => {
    const src = frameCandidates(screen, { mobile, tilstand })
      .map(lookup)
      .find((x): x is string => Boolean(x));
    if (!src) return null;
    return hydrate(src, { ...dataFor(screen), ...(data ?? {}) });
  }, [screen, role, tilstand, mobile, data]);

  if (!html) {
    return (
      <p style={{ fontFamily: "var(--font-body)", color: "var(--text-secondary)", fontSize: "var(--text-sm)", padding: 28 }}>
        Fasit-HTML for {screen} ({tilstand}) ligger ikke i puljen ennå.
      </p>
    );
  }

  return (
    <div
      className="tn-fasit"
      data-tn-screen={screen}
      data-tn-tilstand={tilstand}
      style={{ flex: 1, minWidth: 0, minHeight: 0, width: "100%", overflow: "auto" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function hasFasit(screen: TnScreen): boolean {
  return frameCandidates(screen, { mobile: false, tilstand: "suksess" }).some((k) => lookup(k));
}
