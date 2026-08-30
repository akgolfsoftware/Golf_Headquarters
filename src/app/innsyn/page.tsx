/**
 * /innsyn — oversikt for ekstern leser (plan T8): gruppene leseren har
 * tilgang til + spillerne som har samtykket, per gruppe. KUN navn/årgang —
 * detaljer ligger på /innsyn/[spillerId].
 *
 * ALL datalasting går via ekstern-leser-scopet: navnelisten hentes
 * utelukkende for id-er scopet har godkjent. Guard: layouten (capability),
 * scopet (samtykke + medlemskap).
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserRaw } from "@/lib/auth/getCurrentUser";
import { effectiveCapabilities } from "@/lib/auth/effective-capabilities";
import { Capability } from "@/lib/auth/cbac";
import {
  eksternLeserGrupper,
  eksternLeserSpillerIderPerGruppe,
} from "@/lib/auth/ekstern-leser-scope";
import { prisma } from "@/lib/prisma";
import { TL } from "@/lib/v2/train-lock";


export const dynamic = "force-dynamic";

export default async function InnsynPage() {
  const user = await getCurrentUserRaw();
  if (!user) redirect("/auth/login");

  const caps = await effectiveCapabilities(user);
  const harTester = caps.has(Capability.VIEW_SHARED_TEST_RESULTS);
  const harStats = caps.has(Capability.VIEW_SHARED_STATS);

  const [grupper, testerPerGruppe, statsPerGruppe] = await Promise.all([
    eksternLeserGrupper(user.id),
    harTester
      ? eksternLeserSpillerIderPerGruppe(user.id, "TEST_RESULTATER")
      : Promise.resolve(new Map<string, string[]>()),
    harStats
      ? eksternLeserSpillerIderPerGruppe(user.id, "STATS")
      : Promise.resolve(new Map<string, string[]>()),
  ]);

  // Navn/årgang KUN for spillere scopet har godkjent — aldri hele gruppen.
  const alleIder = new Set<string>();
  for (const kart of [testerPerGruppe, statsPerGruppe]) {
    for (const ider of kart.values()) for (const id of ider) alleIder.add(id);
  }
  const spillere =
    alleIder.size === 0
      ? []
      : await prisma.user.findMany({
          where: { id: { in: [...alleIder] } },
          select: { id: true, name: true, dateOfBirth: true },
        });
  const spillerKart = new Map(spillere.map((s) => [s.id, s]));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1
          style={{
            fontFamily: TL.font.sans,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Delte spillerdata
        </h1>
        <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: "6px 0 0", lineHeight: 1.5 }}>
          Du ser kun spillere som selv (eller foresatt) har samtykket til deling
          — og kun {[harTester && "testresultater", harStats && "statistikk"].filter(Boolean).join(" og ")}.
        </p>
      </div>

      {grupper.length === 0 && (
        <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: 0 }}>
          Du har ingen aktive gruppetilganger. Kontakt AK Golf hvis dette er feil.
        </p>
      )}

      {grupper.map((gruppe) => {
        const ider = new Set<string>([
          ...(testerPerGruppe.get(gruppe.id) ?? []),
          ...(statsPerGruppe.get(gruppe.id) ?? []),
        ]);
        const rader = [...ider]
          .map((id) => spillerKart.get(id))
          .filter((s): s is NonNullable<typeof s> => s != null)
          .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "nb"));
        const testerIder = new Set(testerPerGruppe.get(gruppe.id) ?? []);
        const statsIder = new Set(statsPerGruppe.get(gruppe.id) ?? []);

        return (
          <section
            key={gruppe.id}
            style={{
              background: TL.elev,
              border: `1px solid ${TL.hair}`,
              borderRadius: 14,
              padding: "16px 18px",
            }}
          >
            <h2
              style={{
                fontFamily: TL.font.sans,
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              {gruppe.name}
            </h2>
            {rader.length === 0 ? (
              <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: "10px 0 0" }}>
                Ingen spillere i gruppen har samtykket til deling ennå.
              </p>
            ) : (
              <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none" }}>
                {rader.map((spiller) => (
                  <li
                    key={spiller.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "10px 0",
                      borderTop: `1px solid ${TL.hair}`,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <Link
                        href={`/innsyn/${spiller.id}`}
                        style={{
                          fontFamily: TL.font.sans,
                          fontSize: 14,
                          fontWeight: 600,
                          color: TL.text,
                          textDecoration: "none",
                        }}
                      >
                        {spiller.name}
                      </Link>
                      <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, marginLeft: 8 }}>
                        {spiller.dateOfBirth
                          ? `Årgang ${spiller.dateOfBirth.getFullYear()}`
                          : "Årgang ukjent"}
                      </span>
                    </div>
                    <span style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, flex: "none" }}>
                      {[
                        testerIder.has(spiller.id) && "Tester",
                        statsIder.has(spiller.id) && "Stats",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
