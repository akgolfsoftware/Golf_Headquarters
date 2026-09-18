function applyDemoCopy(html: string): string {
  return html
    .replaceAll("../../assets/logo/team-norway-golf.png", "/tn/team-norway-golf.png")
    .replaceAll("../assets/logo/team-norway-golf.png", "/tn/team-norway-golf.png")
    .replaceAll("Emma Hovden", "Øyvind Royan")
    .replaceAll("Emmas", "Øyvinds")
    .replaceAll("Emma (16)", "Øyvind (17)")
    .replaceAll("Marit Hovden", "Kari Royan")
    .replaceAll("Ingrid Vestby", "Øyvind Royan")
    .replaceAll("Amalie Vik", "Nora Fjeld")
    .replaceAll(">Elev<", ">Spiller<")
    .replaceAll(" elev", " spiller")
    .replaceAll("Elev ", "Spiller ")
    .replaceAll("session", "økt")
    .replaceAll("Session", "Økt")
    .replaceAll("kortspill", "nærspill")
    .replaceAll("Kortspill", "Nærspill");
}

function get(data: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".").map((p) => p.trim()).filter(Boolean);
  let cur: unknown = data;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as object)) {
      cur = (cur as Record<string, unknown>)[p];
    } else return undefined;
  }
  return cur;
}

function interpolate(tpl: string, ctx: Record<string, unknown>): string {
  return tpl.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, raw: string) => {
    const path = String(raw).trim();
    if (path.endsWith("Ref") || path.startsWith("on")) return "";
    const v = get(ctx, path);
    if (v == null || typeof v === "function" || typeof v === "boolean") {
      if (typeof v === "boolean") return v ? "true" : "";
      return "";
    }
    if (Array.isArray(v)) return "";
    return String(v);
  });
}

function truthy(v: unknown): boolean {
  return v === true || v === "true" || v === 1 || v === "1";
}

function matchDiv(html: string, start: number): number {
  let depth = 0;
  let pos = start;
  while (pos < html.length) {
    const open = html.indexOf("<div", pos);
    const close = html.indexOf("</div>", pos);
    if (close === -1) return html.length;
    if (open !== -1 && open < close) {
      depth += 1;
      pos = open + 4;
    } else {
      depth -= 1;
      pos = close + 6;
      if (depth === 0) return pos;
    }
  }
  return html.length;
}

export function stripChrome(html: string): string {
  const cut = (source: string, pattern: RegExp): string => {
    const rail = source.search(pattern);
    if (rail < 0) return source;
    return source.slice(0, rail) + source.slice(matchDiv(source, rail));
  };
  html = cut(html, /<div style="width:(232|252)px;/);
  html = cut(html, /<div style="height:44px;flex-shrink:0;background:var\(--surface-card\);display:flex;align-items:flex-end;/);
  html = cut(html, /<div style="height:76px;flex-shrink:0;background:var\(--surface-card\);border-top:/);
  html = html.replace(
    /style="width:(1440|390)px;height:\d+px;background:var\(--surface-page\);border:1px solid var\(--border-subtle\);border-radius:var\(--radius-lg\);(?:box-shadow:var\(--shadow-lg\);)?overflow:hidden;display:flex(?:;flex-direction:column)?;/,
    'style="width:100%;min-height:100%;background:var(--surface-page);display:flex;flex-direction:column;',
  );
  html = html.replace(
    /style="width:390px;background:var\(--white\);border:1px solid var\(--border-subtle\);border-radius:var\(--radius-lg\);box-shadow:var\(--shadow-lg\);overflow:hidden;display:flex;flex-direction:column"/,
    'style="width:100%;min-height:100%;background:var(--surface-page);display:flex;flex-direction:column"',
  );
  return html;
}

const FALLBACK: Record<string, unknown> = {
  label: "—",
  title: "—",
  tittel: "—",
  navn: "Øyvind Royan",
  meta: "TNG junior",
  tall: "—",
  badge: "",
  dag: "12",
  mnd: "OKT",
  lest: "—",
  andel: "—",
  tekst: "—",
  action: "Åpne",
  nr: "01",
  init: "ØR",
  skole: "WANG Toppidrett Fredrikstad",
  isHeading: false,
  isItem: true,
};

function resolveIf(html: string, ctx: Record<string, unknown>): string {
  let h = html;
  let guard = 0;
  while (guard++ < 12) {
    const next = h.replace(
      /<sc-if value="\{\{\s*([^}]+)\s*\}\}"[^>]*>([\s\S]*?)<\/sc-if>/,
      (_, path: string, inner: string) => (truthy(get(ctx, path.trim())) ? inner : ""),
    );
    if (next === h) break;
    h = next;
  }
  return h;
}

function findScFor(html: string): { start: number; end: number; path: string; as: string; inner: string } | null {
  const open = /<sc-for list="\{\{\s*([^}"\s]+)\s*\}\}" as="(\w)"[^>]*>/.exec(html);
  if (!open || open.index == null) return null;
  let depth = 1;
  let pos = open.index + open[0].length;
  const innerStart = pos;
  while (pos < html.length && depth > 0) {
    const nextOpen = html.indexOf("<sc-for", pos);
    const nextClose = html.indexOf("</sc-for>", pos);
    if (nextClose === -1) return null;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      pos = nextOpen + 7;
    } else {
      depth -= 1;
      if (depth === 0) {
        return {
          start: open.index,
          end: nextClose + 9,
          path: open[1] ?? "",
          as: open[2] ?? "x",
          inner: html.slice(innerStart, nextClose),
        };
      }
      pos = nextClose + 9;
    }
  }
  return null;
}

function expandFors(html: string, ctx: Record<string, unknown>): string {
  let h = html;
  let guard = 0;
  while (guard++ < 80) {
    const found = findScFor(h);
    if (!found) break;
    const list = get(ctx, found.path) as unknown[] | undefined;
    const items = Array.isArray(list) && list.length > 0 ? list : [FALLBACK, FALLBACK, FALLBACK];
    const rendered = items
      .map((item) => {
        const rec = (item && typeof item === "object" ? item : FALLBACK) as Record<string, unknown>;
        const child: Record<string, unknown> = { ...ctx, [found.as]: rec, ...rec };
        let chunk = expandFors(found.inner, child);
        chunk = resolveIf(chunk, child);
        return interpolate(chunk, child);
      })
      .join("");
    h = h.slice(0, found.start) + rendered + h.slice(found.end);
  }
  return h;
}

export function hydrate(html: string, data: Record<string, unknown> = {}): string {
  let h = stripChrome(html);
  h = expandFors(h, data);
  h = resolveIf(h, data);
  h = interpolate(h, data);
  h = h.replace(/<sc-if[^>]*value=""[^>]*>[\s\S]*?<\/sc-if>/g, "");
  h = h.replace(/<sc-if[^>]*>/g, "").replace(/<\/sc-if>/g, "");
  h = h.replace(/\sref="[^"]*"/g, "");
  h = applyDemoCopy(h);
  return h;
}
