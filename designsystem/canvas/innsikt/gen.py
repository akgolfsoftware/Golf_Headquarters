#!/usr/bin/env python3
"""Genererer artboards for Innsikt-canvasen.

Verdiene under er hentet fra `src/styles/train-lock-tokens.css` (lys på :root,
mørk under html[data-v2-tema="dark"]) — ikke fra hukommelsen. Endres tokens,
endres denne fila og canvasen seedes på nytt.

Skjermtekst er ekte norsk. Tall er merket:
  MÅLT    — verifisert i produksjonsbasen (kilde oppgitt i panelet)
  EKSEMPEL — plausibelt, ikke målt. Merket i UI, jf. TruthLayer.
"""
from pathlib import Path

MORK = dict(
    scene="#000000", elev="#161616", dock="#1C1C1E", hair="#FFFFFF14",
    dim="#2C2C2E", text="#F5F5F5", mute="#8E8E93", fill="#FFFFFF",
    on_fill="#000000", warm="#B85C3D", warn="#FFD60A", warn_hair="#FFD60A5C",
    ok="#30D158", danger="#FF453A", spor="#FFFFFF14",
)
LYS = dict(
    scene="#FFFFFF", elev="#F2F2F2", dock="#E9E9EB", hair="#00000014",
    dim="#DDDDDE", text="#111111", mute="#6E6E73", fill="#000000",
    on_fill="#FFFFFF", warm="#B85C3D", warn="#FFD60A", warn_hair="#FFD60A5C",
    ok="#34C759", danger="#FF3B30", spor="#00000014",
)

# ---------------------------------------------------------------- innhold

# Spørsmål 1 — hvor taper han slag, mot seg selv (PRODUKTRETNING pkt. 1 + 2).
# EKSEMPEL: SG-fordeling finnes kun for egne spillere (TrackMan + registrerte
# runder), aldri fra en GolfBox-runde.
SLAGTAP = [
    dict(navn="Innspill",  delta="-0,7", vond=True,  bredde=76, note="100-175 m"),
    dict(navn="Utslag",    delta="+0,1", vond=False, bredde=11, note="driver"),
    dict(navn="Nærspill",  delta="+0,2", vond=False, bredde=22, note="innenfor 30 m"),
    dict(navn="Putting",   delta="+0,4", vond=False, bredde=44, note="alle lengder"),
]

# Spørsmål 2 — utvikler han seg raskt nok. Feltstyrke-justert score:
# spillerens til-par mot feltsnittet i samme turnering. EKSEMPEL.
SESONGER = [
    dict(aar="2023", verdi="+4,8", h=82, n="9 turneringer"),
    dict(aar="2024", verdi="+3,1", h=58, n="12 turneringer"),
    dict(aar="2025", verdi="+2,2", h=44, n="14 turneringer"),
    dict(aar="2026", verdi="+1,4", h=30, n="11 så langt"),
]

# Spørsmål 4 — riktig turneringsprogram. Feltstyrke per nivå er MÅLT
# (MASTERPLAN STEG 16, snitt til-par per nivå). Antall runder er EKSEMPEL.
NIVAAER = [
    dict(navn="Norgescup",     felt="6,32",  runder="2",  status="For tynt grunnlag", ton="mute"),
    dict(navn="Srixon Tour",   felt="8,76",  runder="4",  status="Presterer over eget snitt", ton="ok"),
    dict(navn="Olyo Tour",     felt="10,41", runder="9",  status="Hovedarenaen hans", ton="text"),
    dict(navn="Østlandstour",  felt="10,55", runder="3",  status="Vokst fra nivået", ton="mute"),
    dict(navn="Regiontour",    felt="13,64", runder="0",  status="Ikke spilt siden 2024", ton="mute"),
]

# TruthLayer — hver påstand skal kunne spores til en måling med dato og kilde.
GRUNNLAG = [
    dict(p="Slagtap per område", k="TrackMan + 11 registrerte runder", d="sist 28.08.2026"),
    dict(p="Feltstyrke-justert score", k="mv_topar_grunnlag", d="123 257 rader, 2014–2026"),
    dict(p="Feltstyrke per nivå", k="Målt i basen", d="30.08.2026"),
    dict(p="SG-stigen", k="Nordic League-broen", d="under bygging — STEG 16.10"),
]

GRENSER = [
    "Norsk turneringsdata har score, aldri SG-fordeling. Vi kan si hvor han står, ikke hvorfor — fordelingen over kommer fra hans egne økter.",
    "Aldersstigen gjelder fra 16 år. Under det er den ikke monoton, fordi juniorene spiller kortere tee.",
    "Proffreferansen finnes bare for gutter. Alle 26 tourer i lageret er herretourer.",
]

# ---------------------------------------------------------------- byggeklosser

def hode(t, bredde, hoyde):
    return f'''<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap">
  <style>
    body {{ margin: 0; font-family: Poppins, Arial, system-ui, sans-serif; background: {t["scene"]}; color: {t["text"]}; -webkit-font-smoothing: antialiased; }}
    * {{ box-sizing: border-box; }}
    a {{ color: {t["text"]}; text-decoration: none; }} a:hover {{ color: {t["text"]}; }}
    .caps {{ font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: {t["mute"]}; }}
    .num {{ font-variant-numeric: tabular-nums; }}
    .mono {{ font-family: 'IBM Plex Mono', ui-monospace, monospace; font-variant-numeric: tabular-nums; }}
    .scroll::-webkit-scrollbar {{ width: 0; height: 0; }}
  </style>
</helmet>
'''

FOT = '''</x-dc>
</body>
</html>
'''

def rail(t):
    def punkt(navn, aktiv, rund=False):
        farge = t["text"] if aktiv else t["mute"]
        bg = f'background: {t["dim"]}; ' if aktiv else ""
        r = "999px" if rund else "4px"
        return (f'<div style="height: 40px; border-radius: 10px; {bg}display: flex; align-items: center; gap: 10px; padding: 0 12px;">'
                f'<div style="width: 16px; height: 16px; border-radius: {r}; background: {farge};"></div>'
                f'<span style="font-size: 14px; font-weight: 600; color: {farge};">{navn}</span></div>')
    under = "".join(
        f'<div style="height: 34px; border-radius: 10px; display: flex; align-items: center; padding: 0 12px; font-size: 13px; color: {t["mute"]};">{n}</div>'
        for n in ("Konsoll", "Økonomi", "Kalender"))
    return f'''  <div style="width: 232px; flex: none; background: {t["dock"]}; border-right: 1px solid {t["hair"]}; padding: 18px 12px; display: flex; flex-direction: column; gap: 4px;">
    <div style="display: flex; align-items: center; gap: 9px; padding: 0 10px 14px;">
      <div style="width: 8px; height: 8px; border-radius: 50%; background: {t["warm"]};"></div>
      <span style="font-size: 13px; font-weight: 700;">AK Golf Academy</span>
    </div>
    {punkt("Stall", True)}
    {punkt("Workbench", False)}
    {punkt("Kø", False)}
    {punkt("Jarvis", False)}
    {punkt("Meg", False, rund=True)}
    <div style="margin: 14px 10px 8px; height: 1px; background: {t["hair"]};"></div>
    <div style="padding: 0 10px 6px;" class="caps">Under Meg</div>
    {under}
    <div style="flex: 1;"></div>
  </div>
'''

def eksempelpille(t):
    return (f'<span style="display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: 999px; '
            f'font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: {t["warn"]}; '
            f'box-shadow: inset 0 0 0 1px {t["warn_hair"]};">Eksempeltall</span>')

def coachpille(t):
    return (f'<span style="display: inline-flex; align-items: center; height: 22px; padding: 0 9px; border-radius: 999px; '
            f'font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: {t["mute"]}; '
            f'box-shadow: inset 0 0 0 1px {t["hair"]};">Kun coach</span>')

def kort(t, innhold, pad="20px 22px"):
    return f'<section style="background: {t["elev"]}; border-radius: 20px; padding: {pad};">{innhold}</section>'

def seksjonstittel(t, kicker, tittel, hale=""):
    h = f'<div style="margin-left: auto;">{hale}</div>' if hale else ""
    return (f'<div style="display: flex; align-items: center; gap: 10px;">'
            f'<div><div class="caps" style="font-size: 10px;">{kicker}</div>'
            f'<h2 style="margin: 4px 0 0; font-size: 17px; font-weight: 700; letter-spacing: -0.01em; color: {t["text"]};">{tittel}</h2></div>{h}</div>')

def slagtap_blokk(t, bredde_px):
    rader = []
    for s in SLAGTAP:
        farge = t["warm"] if s["vond"] else t["mute"]
        w = int(bredde_px * s["bredde"] / 100)
        rader.append(f'''<div style="display: flex; align-items: center; gap: 12px;">
          <span style="width: 78px; flex: none; font-size: 13px; font-weight: 600; color: {t["text"]};">{s["navn"]}</span>
          <div style="flex: 1; min-width: 0; height: 8px; border-radius: 999px; background: {t["spor"]};">
            <div style="width: {s["bredde"]}%; height: 8px; border-radius: 999px; background: {farge};"></div>
          </div>
          <span class="mono" style="width: 44px; flex: none; text-align: right; font-size: 13px; font-weight: 600; color: {t["text"]};">{s["delta"]}</span>
          <span style="width: 84px; flex: none; font-size: 11px; color: {t["mute"]};">{s["note"]}</span>
        </div>''')
    return '<div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">' + "".join(rader) + '</div>'

def sesong_blokk(t):
    soyler = []
    for s in SESONGER:
        soyler.append(f'''<div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <span class="mono" style="font-size: 13px; font-weight: 600; color: {t["text"]};">{s["verdi"]}</span>
          <div style="width: 100%; height: 88px; display: flex; align-items: flex-end;">
            <div style="width: 100%; height: {s["h"]}px; border-radius: 12px 12px 0 0; background: {t["dim"]};"></div>
          </div>
          <span style="font-size: 12px; font-weight: 600; color: {t["text"]};">{s["aar"]}</span>
          <span style="font-size: 10px; color: {t["mute"]};">{s["n"]}</span>
        </div>''')
    return '<div style="display: flex; gap: 10px; align-items: flex-end; margin-top: 16px;">' + "".join(soyler) + '</div>'

def nivaa_blokk(t):
    rader = []
    for n in NIVAAER:
        f = {"ok": t["ok"], "text": t["text"], "mute": t["mute"]}[n["ton"]]
        rader.append(f'''<div style="display: flex; align-items: center; gap: 12px; padding: 11px 0; border-top: 1px solid {t["hair"]};">
          <span style="flex: 1; min-width: 0; font-size: 13px; font-weight: 600; color: {t["text"]};">{n["navn"]}</span>
          <span class="mono" style="width: 52px; text-align: right; font-size: 12px; color: {t["mute"]};">{n["felt"]}</span>
          <span class="mono" style="width: 34px; text-align: right; font-size: 12px; color: {t["mute"]};">{n["runder"]}</span>
          <span style="width: 200px; font-size: 12px; color: {f};">{n["status"]}</span>
        </div>''')
    hode_rad = (f'<div style="display: flex; gap: 12px; padding-bottom: 6px;">'
                f'<span class="caps" style="flex: 1; font-size: 9px;">Nivå</span>'
                f'<span class="caps" style="width: 52px; text-align: right; font-size: 9px;">Felt</span>'
                f'<span class="caps" style="width: 34px; text-align: right; font-size: 9px;">Runder</span>'
                f'<span class="caps" style="width: 200px; font-size: 9px;">Vurdering</span></div>')
    return '<div style="margin-top: 14px;">' + hode_rad + "".join(rader) + '</div>'

def grunnlag_panel(t):
    rader = "".join(
        f'''<div style="padding: 12px 0; border-top: 1px solid {t["hair"]};">
          <div style="font-size: 13px; font-weight: 600; color: {t["text"]};">{g["p"]}</div>
          <div style="margin-top: 3px; font-size: 12px; color: {t["mute"]};">{g["k"]}</div>
          <div class="mono" style="margin-top: 2px; font-size: 11px; color: {t["mute"]};">{g["d"]}</div>
        </div>''' for g in GRUNNLAG)
    grenser = "".join(
        f'<p style="margin: 10px 0 0; font-size: 12px; line-height: 1.5; color: {t["mute"]};">{g}</p>' for g in GRENSER)
    return f'''  <div class="scroll" style="width: 380px; flex: none; overflow-y: auto; border-left: 1px solid {t["hair"]}; padding: 22px 22px 32px;">
    <div class="caps" style="font-size: 10px;">Grunnlaget</div>
    <h2 style="margin: 4px 0 0; font-size: 17px; font-weight: 700; letter-spacing: -0.01em;">Hvor tallene kommer fra</h2>
    <p style="margin: 8px 0 14px; font-size: 12px; line-height: 1.5; color: {t["mute"]};">Alt appen påstår om en spiller skal kunne spores til en måling med dato og kilde.</p>
    {rader}
    <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid {t["hair"]};">
      <div class="caps" style="font-size: 10px;">Dette kan vi ikke si</div>
      {grenser}
    </div>
  </div>
'''

# ---------------------------------------------------------------- Mac

def mac(t):
    k_slagtap = kort(t,
        seksjonstittel(t, "Siste 90 dager mot egen basislinje", "Hvor taper han slag")
        + slagtap_blokk(t, 420)
        + '<p style="margin: 16px 0 0; font-size: 12px; color: ' + t["mute"] + ';">Fordelingen finnes fordi han fører runder og har TrackMan-økter hos oss. Fra en GolfBox-runde alene ville vi bare sett totalen.</p>')

    k_sesong = kort(t,
        seksjonstittel(t, "Feltstyrke-justert score, slag mot feltsnittet", "Utvikler han seg raskt nok")
        + sesong_blokk(t)
        + '<p style="margin: 16px 0 0; font-size: 12px; color: ' + t["mute"] + ';">Lavere er bedre. Sammenlignbart på tvers av bane, tee og klasse — plassering brukes aldri.</p>')

    stige = (
        '<div style="display: flex; align-items: baseline; gap: 12px; margin-top: 16px;">'
        '<span class="mono" style="font-size: 34px; font-weight: 600; color: ' + t["text"] + ';">-4,3</span>'
        '<span class="mono" style="font-size: 15px; color: ' + t["mute"] + ';">\u00b1 0,9</span>'
        '<span class="caps" style="font-size: 10px;">SG per runde mot PGA-snitt</span></div>'
        '<div style="position: relative; height: 8px; border-radius: 999px; background: ' + t["spor"] + '; margin-top: 18px;">'
        '<div style="position: absolute; left: 34%; width: 13%; height: 8px; border-radius: 999px; background: ' + t["warm"] + ';"></div></div>'
        '<div style="display: flex; justify-content: space-between; margin-top: 8px;">'
        '<span style="font-size: 11px; color: ' + t["mute"] + ';">Klubbnivå</span>'
        '<span style="font-size: 11px; color: ' + t["mute"] + ';">Nordic League</span>'
        '<span style="font-size: 11px; color: ' + t["mute"] + ';">PGA Tour</span></div>'
        '<p style="margin: 16px 0 0; font-size: 12px; line-height: 1.5; color: ' + t["mute"] + ';">Kalibrert gjennom spillere som har spilt både norske turneringer og Nordic League. Spennet står fordi det er et estimat — det skal aldri vises som ett tall.</p>')
    k_stige = kort(t, seksjonstittel(t, "SG-stigen — kalibrert mot DataGolf", "Hvor på skalaen han står", coachpille(t)) + stige)

    gap = (
        '<div style="display: flex; align-items: baseline; gap: 10px; margin-top: 16px;">'
        '<span class="mono" style="font-size: 34px; font-weight: 600;">+2,1</span>'
        '<span class="caps" style="font-size: 10px;">slag dårligere i turnering</span></div>'
        '<p style="margin: 12px 0 0; font-size: 12px; line-height: 1.5; color: ' + t["mute"] + ';">Gapet var +3,4 i fjor. Det minker — han flytter treningsnivået sitt inn i konkurranse.</p>')
    k_gap = kort(t, seksjonstittel(t, "Turnering mot trening", "Tåler han konkurranse") + gap)

    steg = (
        '<p style="margin: 14px 0 0; font-size: 13px; line-height: 1.55; color: ' + t["text"] + ';">Innspill fra 100–175 m er det eneste området som har gått feil vei. Legg to økter i uka der, og meld ham på Srixon Tour framfor Østlandstour.</p>'
        '<div style="display: flex; gap: 8px; margin-top: 16px;">'
        '<span style="display: inline-flex; align-items: center; height: 44px; padding: 0 20px; border-radius: 999px; background: '
        + t["fill"] + '; color: ' + t["on_fill"] + '; font-size: 15px; font-weight: 600;">Planlegg i Workbench</span></div>')
    k_steg = kort(t, seksjonstittel(t, "Neste steg", "Dette foreslår jeg") + steg)

    k_nivaa = kort(t, seksjonstittel(t, "Feltstyrke er målt snitt til-par per nivå", "Riktig turneringsprogram") + nivaa_blokk(t))

    hoved = f'''  <div style="flex: 1; min-width: 0; display: flex; flex-direction: column;">

    <div style="height: 56px; flex: none; display: flex; align-items: center; gap: 10px; padding: 0 22px; border-bottom: 1px solid {t["hair"]};">
      <span style="font-size: 13px; color: {t["mute"]};">Stall</span>
      <span style="font-size: 13px; color: {t["mute"]};">/</span>
      <span style="font-size: 15px; font-weight: 700;">Øyvind Rohjan</span>
      <span style="font-size: 13px; color: {t["mute"]};">/</span>
      <span style="font-size: 13px; color: {t["mute"]};">Innsikt</span>
      <div style="margin-left: auto; display: flex; align-items: center; gap: 10px;">{eksempelpille(t)}</div>
    </div>

    <div style="flex: 1; min-height: 0; display: flex;">

      <div class="scroll" style="flex: 1; min-width: 0; overflow-y: auto; padding: 22px 22px 36px; display: flex; flex-direction: column; gap: 14px;">

        <div>
          <div class="caps">Innsikt</div>
          <h1 style="margin: 6px 0 0; font-size: 26px; font-weight: 700; letter-spacing: -0.01em;">Han taper mest på innspill</h1>
          <p style="margin: 8px 0 0; max-width: 62ch; font-size: 13px; line-height: 1.55; color: {t["mute"]};">Målt mot ham selv de siste tre månedene, ikke mot proffnivå og ikke mot jevnaldrende.</p>
        </div>

        {k_slagtap}

        {k_sesong}

        {k_stige}

        <div style="display: flex; gap: 14px;">
          <div style="flex: 1; min-width: 0;">{k_gap}</div>
          <div style="flex: 1; min-width: 0;">{k_steg}</div>
        </div>

        {k_nivaa}

      </div>

{grunnlag_panel(t)}
    </div>
  </div>
'''
    return (hode(t, 1440, 900)
            + f'<div style="width: 1440px; height: 900px; background: {t["scene"]}; display: flex; overflow: hidden;">\n'
            + rail(t) + hoved + "</div>\n" + FOT)

# ---------------------------------------------------------------- iPhone

def dock(t):
    def p(navn, aktiv, rund=False):
        farge = t["text"] if aktiv else t["mute"]
        r = "999px" if rund else "5px"
        return (f'<div style="flex: 1; height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;">'
                f'<div style="width: 20px; height: 20px; border-radius: {r}; background: {farge};"></div>'
                f'<span style="font-size: 10px; font-weight: 600; color: {farge};">{navn}</span></div>')
    return (f'<div style="position: absolute; left: 16px; right: 16px; bottom: 12px; height: 64px; background: {t["dock"]}; '
            f'border-radius: 999px; box-shadow: inset 0 0 0 1px {t["hair"]}; display: flex; align-items: center; padding: 8px 10px;">'
            + p("Stall", True) + p("Workbench", False) + p("Kø", False) + p("Jarvis", False) + p("Meg", False, rund=True)
            + "</div>")

def mobil(t):
    m_slagtap = kort(t, seksjonstittel(t, "Siste 90 dager", "Hvor taper han slag") + slagtap_blokk(t, 120), pad="18px")
    m_sesong = kort(t, seksjonstittel(t, "Slag mot feltsnittet", "Utvikler han seg raskt nok") + sesong_blokk(t), pad="18px")

    stige = (
        '<div style="display: flex; align-items: baseline; gap: 10px; margin-top: 14px;">'
        '<span class="mono" style="font-size: 30px; font-weight: 600;">-4,3</span>'
        '<span class="mono" style="font-size: 14px; color: ' + t["mute"] + ';">\u00b1 0,9</span></div>'
        '<div class="caps" style="font-size: 10px; margin-top: 4px;">SG per runde mot PGA-snitt</div>'
        '<div style="position: relative; height: 8px; border-radius: 999px; background: ' + t["spor"] + '; margin-top: 16px;">'
        '<div style="position: absolute; left: 34%; width: 13%; height: 8px; border-radius: 999px; background: ' + t["warm"] + ';"></div></div>'
        '<div style="display: flex; justify-content: space-between; margin-top: 8px;">'
        '<span style="font-size: 10px; color: ' + t["mute"] + ';">Klubb</span>'
        '<span style="font-size: 10px; color: ' + t["mute"] + ';">Nordic</span>'
        '<span style="font-size: 10px; color: ' + t["mute"] + ';">PGA</span></div>')
    m_stige = kort(t, seksjonstittel(t, "SG-stigen", "Hvor på skalaen", coachpille(t)) + stige, pad="18px")

    gap = ('<div style="display: flex; align-items: baseline; gap: 10px; margin-top: 14px;">'
           '<span class="mono" style="font-size: 30px; font-weight: 600;">+2,1</span>'
           '<span class="caps" style="font-size: 10px;">slag dårligere</span></div>'
           '<p style="margin: 10px 0 0; font-size: 12px; line-height: 1.5; color: ' + t["mute"] + ';">Gapet var +3,4 i fjor. Det minker.</p>')
    m_gap = kort(t, seksjonstittel(t, "Turnering mot trening", "Tåler han konkurranse") + gap, pad="18px")

    steg = ('<p style="margin: 12px 0 0; font-size: 13px; line-height: 1.55;">Innspill fra 100–175 m er det eneste området som har gått feil vei. To økter i uka der, og Srixon framfor Østlandstour.</p>'
            '<div style="display: flex; margin-top: 14px;">'
            '<span style="display: inline-flex; align-items: center; justify-content: center; height: 48px; padding: 0 22px; border-radius: 999px; background: '
            + t["fill"] + '; color: ' + t["on_fill"] + '; font-size: 15px; font-weight: 600;">Planlegg i Workbench</span></div>')
    m_steg = kort(t, seksjonstittel(t, "Neste steg", "Dette foreslår jeg") + steg, pad="18px")

    innhold = f'''  <div class="scroll" style="flex: 1; min-height: 0; overflow-y: auto; padding: 24px 16px 104px; display: flex; flex-direction: column; gap: 12px;">

    <div>
      <span class="caps" style="font-size: 10px;">Øyvind Rohjan · Innsikt</span>
      <h1 style="margin: 8px 0 0; font-size: 26px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.2;">Han taper mest på innspill</h1>
      <p style="margin: 8px 0 0; font-size: 13px; line-height: 1.55; color: {t["mute"]};">Målt mot ham selv de siste tre månedene.</p>
      <div style="margin-top: 12px;">{eksempelpille(t)}</div>
    </div>

    {m_slagtap}

    {m_sesong}

    {m_stige}

    {m_gap}

    {m_steg}

    <div style="padding: 4px 2px 0;">
      <div class="caps" style="font-size: 10px;">Grunnlaget</div>
      <p style="margin: 8px 0 0; font-size: 12px; line-height: 1.5; color: {t["mute"]};">Slagtap: TrackMan + 11 førte runder, sist 28.08.2026. Feltstyrke: mv_topar_grunnlag, 2014–2026. SG-stigen er et estimat med spenn.</p>
    </div>
  </div>
'''
    return (hode(t, 390, 844)
            + f'<div style="width: 390px; height: 844px; background: {t["scene"]}; display: flex; flex-direction: column; overflow: hidden; position: relative;">\n'
            + innhold + dock(t) + "\n</div>\n" + FOT)

def tom(t):
    spor = "".join(
        '<div style="height: 92px; border-radius: 20px; background: ' + t["elev"] + '; opacity: ' + o + ';"></div>'
        for o in ("1", "0.6", "0.35", "0.18"))
    innhold = f'''  <div class="scroll" style="flex: 1; min-height: 0; overflow-y: auto; padding: 24px 16px 104px;">
    <div class="caps" style="font-size: 10px;">Mathea Lund · Innsikt</div>
    <h1 style="margin: 8px 0 0; font-size: 26px; font-weight: 700; letter-spacing: -0.01em;">Ikke nok å måle ennå</h1>

    <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">{spor}</div>

    <p style="margin: 22px 0 0; font-size: 15px; font-weight: 600; line-height: 1.5;">Hun har spilt to turneringsrunder. Innsikt trenger fem.</p>
    <p style="margin: 8px 0 0; font-size: 13px; line-height: 1.55; color: {t["mute"]};">Da får utviklingskurven nok punkter til å si noe som holder. Slagtap per område krever i tillegg førte runder eller TrackMan-økter — hun har ingen ennå.</p>
    <p style="margin: 12px 0 0; font-size: 13px; line-height: 1.55; color: {t["mute"]};">Et tall vi ikke kan stå inne for, er verre enn ingen skjerm.</p>

    <div style="display: flex; gap: 8px; margin-top: 20px;">
      <span style="display: inline-flex; align-items: center; justify-content: center; height: 48px; padding: 0 22px; border-radius: 999px; background: {t["fill"]}; color: {t["on_fill"]}; font-size: 15px; font-weight: 600;">Meld på turnering</span>
      <span style="display: inline-flex; align-items: center; justify-content: center; height: 48px; padding: 0 22px; border-radius: 999px; background: {t["dim"]}; color: {t["text"]}; font-size: 15px; font-weight: 600;">Før en runde</span>
    </div>
  </div>
'''
    return (hode(t, 390, 844)
            + f'<div style="width: 390px; height: 844px; background: {t["scene"]}; display: flex; flex-direction: column; overflow: hidden; position: relative;">\n'
            + innhold + dock(t) + "\n</div>\n" + FOT)

# ---------------------------------------------------------------- skriv

her = Path(__file__).parent
(her / "Main.dc.html").write_text(mac(MORK), encoding="utf-8")
(her / "InnsiktLys.dc.html").write_text(mac(LYS), encoding="utf-8")
(her / "InnsiktMobil.dc.html").write_text(mobil(MORK), encoding="utf-8")
(her / "InnsiktMobilLys.dc.html").write_text(mobil(LYS), encoding="utf-8")
(her / "InnsiktTom.dc.html").write_text(tom(MORK), encoding="utf-8")
print("skrev 5 artboards")
