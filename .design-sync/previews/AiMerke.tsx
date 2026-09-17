import { AiMerke, CTAPill, Kort, StatusPill } from "akgolf-hq-komponenter";

const boks = { maxWidth: 440 };

/** Identitetsmerke for AI-en: sparkle-skive med fill-prikk, navn i Poppins 700, undertekst i mono caps. */
export function Standard() {
  return (
    <div style={boks}>
      <AiMerke />
    </div>
  );
}

/** Caddie i PlayerHQ: underteksten sier hva den ser, ikke hva den er. */
export function Caddie() {
  return (
    <div style={boks}>
      <AiMerke navn="Caddie" sub="Ser planen din · uke 38" />
    </div>
  );
}

/** Samtalehode i et Kort: merket til venstre, status og «Ny samtale» til høyre. 520 px så underteksten står på én linje. */
export function Samtalehode() {
  return (
    <div style={{ maxWidth: 520 }}>
      <Kort pad="14px 16px">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <AiMerke navn="Jarvis" sub="Forbereder · sender ingenting" />
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
            <StatusPill tone="info">Utkast</StatusPill>
            <CTAPill ghost icon="plus">Ny samtale</CTAPill>
          </div>
        </div>
      </Kort>
    </div>
  );
}

/** Langt navn i smal beholder: navnet klippes med ellipse, underteksten står. */
export function LangtNavn() {
  return (
    <div style={{ maxWidth: 260 }}>
      <AiMerke navn="AI-coach for Øyvind Rohjan · WANG Toppidrett Fredrikstad" sub="Personlig kontekst" />
    </div>
  );
}
