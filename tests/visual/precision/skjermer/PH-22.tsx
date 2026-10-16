/** Prøvefil for PH-22 Caddie i nytt design (pakke 7). Syntetisk samtale. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH22CaddieChat } from "@/components/portal/precision/PH22CaddieChat";
import type { PH22CaddieMelding } from "@/lib/portal-caddie/ph22-caddie-data";

export const sti = "/portal/coach/ai";

const MELDINGER: PH22CaddieMelding[] = [
  { id: "m1", role: "user", content: "Hva bør jeg trene mer på før sesongslutt?", timestamp: "14:12" },
  { id: "m2", role: "assistant", timestamp: "14:12", source: "Stats · Strokes Gained, siste 12 runder",
    content: "Innspill koster deg mest. Mot Kategori B taper du 0,9 slag per runde der, mest fra 100–150 m.\n\nJeg foreslår to innspillsøkter i uke 42, i stedet for én utslagsøkt.",
    draft: { id: "d1", kind: "økt", title: "innspill i uke 42", meta: "Tir 13. okt og tor 15. okt · 60 min hver · erstatter utslag onsdag", status: "utkast" } },
  { id: "m3", role: "user", content: "Finn en turnering jeg kan spille i oktober.", timestamp: "14:15" },
  { id: "m4", role: "assistant", timestamp: "14:15", content: "Jeg finner ingen turnering i kalenderen som passer før testuka. Påmeldingsfrist: —" },
];

const Vis = ({ tier = "PRO", state, meldinger = MELDINGER }: { tier?: string; state?: "data" | "tom" | "laster" | "feil"; meldinger?: PH22CaddieMelding[] }) => (
  <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
    <PH22CaddieChat tier={tier as never} fornavn="Øyvind" initialer="ØR" sessionId="s1" initialMessages={meldinger} stateOverride={state} />
  </PlayerHQSkall>
);

export const tilstander = {
  samtale: <Vis />,
  tom: <Vis state="tom" />,
  laster: <Vis state="laster" />,
  feil: <Vis state="feil" />,
  gratis: <Vis tier="GRATIS" />,
};
