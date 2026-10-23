/** Prøvefil for trenerens testøkt (utkast 3, «Ett slag om gangen» og «Import og kobling»). Syntetiske data. */
import { TnTestoktTest } from "@/components/team-norway/tn-testokt-test";
import { LokalDataEierProvider } from "@/lib/offline-queue/eier-context";
import { tnProtocol } from "@/lib/portal-tester/tn-catalog";

export const sti = "/team-norway/spiller/b/testokt";

const wedge = tnProtocol("wedge-variation")!;
const driver = tnProtocol("driver-220")!;
const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const slag = (n: number, club: string, carry: number, side: number, clubSpeed: number | null = null) => ({ id: `tm-${n}`, shotNumber: n, club, carryDistance: carry, side, clubSpeed });
const okt = {
  id: "okt-1", dato: "22. okt. 14:02", akse: "SLAG" as const,
  slag: [slag(1, "52°", 39.2, -1.1), slag(2, "PW", 67.8, 3.4), slag(3, "56°", 53.9, 2.9), slag(4, "Driver", 231.4, 0), slag(5, "PW", 44, 0.5), ...wedge.rows.slice(5).map((r, i) => slag(6 + i, "PW", (r.target ?? 50) - 1.5, 1.2))],
};
// Appen har Tailwinds grunnstil (border-box på alt); prøven har den ikke, så den legges til her.
const vis = (n: React.ReactNode) => <LokalDataEierProvider eierId="prove-trener"><style>{"*,::before,::after{box-sizing:border-box}"}</style>{n}</LokalDataEierProvider>;
const felles = { spillerId: "b", kontekst: "Testøkt · Jørn Johnsen · Test 1 av 3", pauseHref: "?steg=3", nesteHref: "?steg=1", nesteTekst: "Neste test" };

export const tilstander = {
  kobling: vis(<TnTestoktTest {...felles} protocol={wedge} sessionId={uuid(1)} initial={{ sessionId: uuid(1), revision: 1, values: { "1": { carry: 39.2, side: -1.1 } }, notes: "", status: "IN_PROGRESS" }} trackManOkter={[okt]} />),
  "uten-trackman": vis(<TnTestoktTest {...felles} protocol={driver} sessionId={uuid(2)} trackManOkter={[]} />),
};
