import Link from "next/link";
import { Caps, Tittel, Kort, TomTilstand, T } from "@/components/v2";
import { Icon } from "@/components/v2/icon";

/**
 * AgencyOS — Tildelt meg (Min uke · Tildelt meg), v2-port 16. juli 2026.
 * Erstatter AgPage/AgPageHead med v2-primitiver. Samme aggregering av ekte
 * ventende handlinger (PlanAction/SessionRequest/TrainingPlan DRAFT/Notion-
 * oppgaver) uendret — kun presentasjonslaget er nytt.
 */

export interface TildeltMegItem {
  icon: string;
  tittel: string;
  meta: string;
  href: string;
}
export interface AdminTildeltMegV2Data {
  items: TildeltMegItem[];
  antallOrd: string;
}

export function AdminTildeltMegV2({ data }: { data: AdminTildeltMegV2Data }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div>
        <Caps>Min uke · Tildelt meg</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="til deg.">{`${data.antallOrd} ting`}</Tittel>
        </div>
        <p style={{ fontFamily: T.ui, fontSize: 13, lineHeight: 1.55, color: T.mut, margin: "10px 0 0", maxWidth: 560 }}>
          Alt som venter på en handling fra deg, samlet ett sted.
        </p>
      </div>

      {data.items.length === 0 ? (
        <Kort>
          <TomTilstand icon="check-circle" title="Ingenting venter på deg" sub="Godt jobbet." />
        </Kort>
      ) : (
        <Kort pad="4px 18px">
          {data.items.map((it, i) => (
            <Link
              key={`${it.href}-${i}`}
              href={it.href}
              style={{
                display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 2px",
                borderTop: i ? `1px solid ${T.border}` : "none", textDecoration: "none",
              }}
            >
              <span style={{ display: "inline-flex", flex: "none", paddingTop: 2 }}>
                <Icon name={it.icon} size={18} style={{ color: T.fg }} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{it.tittel}</span>
                <span style={{ display: "block", marginTop: 2, fontFamily: T.mono, fontSize: 10, color: T.mut }}>{it.meta}</span>
              </span>
              <Icon name="chevron-right" size={18} style={{ color: T.mut, alignSelf: "center", flex: "none" }} />
            </Link>
          ))}
        </Kort>
      )}
    </div>
  );
}
