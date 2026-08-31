# -*- coding: utf-8 -*-
"""Genererer IA-artboards for STEG 15-konsolideringen.
Verdier hentet fra src/styles/train-lock-tokens.css (mørk variant) og
AX-01 Skall rail og tabbar.dc.html — ikke fra hukommelsen."""
import json, pathlib

TL = dict(scene="#000000", elev="#161616", dock="#1C1C1E", hair="#FFFFFF14",
          dim="#2C2C2E", text="#F5F5F5", mute="#8E8E93", fill="#FFFFFF",
          onFill="#000000", avatar="#B08968", warm="#B85C3D", warn="#FFD60A",
          warnHair="#FFD60A5C", danger="#FF453A")

HELMET = """<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap">
  <style>
    body {{ margin: 0; font-family: Poppins, Arial, system-ui, sans-serif; background: {scene}; color: {text}; -webkit-font-smoothing: antialiased; }}
    * {{ box-sizing: border-box; }}
    a {{ color: {text}; text-decoration: none; }} a:hover {{ color: #FFFFFF; }}
    .caps {{ font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: {mute}; }}
    .num {{ font-variant-numeric: tabular-nums; }}
    .scroll::-webkit-scrollbar {{ width: 0; height: 0; }}
    .kort {{ background: {elev}; border-radius: 20px; padding: 18px 20px; }}
    .rad {{ display: flex; align-items: center; gap: 12px; padding: 13px 0; }}
    .pille {{ display: inline-flex; align-items: center; gap: 8px; height: 40px; padding: 0 16px; border-radius: 999px; font-size: 13px; font-weight: 600; white-space: nowrap; }}
    .cta {{ display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 20px; border-radius: 999px; font-size: 15px; }}
  </style>
</helmet>""".format(**TL)

RAIL_PUNKTER = ["Stall", "Workbench", "Kø", "Jarvis", "Meg"]

def rail(aktiv):
    ut = ['<div style="width: 232px; flex: none; background: {dock}; border-right: 1px solid {hair}; padding: 18px 12px; display: flex; flex-direction: column; gap: 4px;">'.format(**TL)]
    ut.append('<div style="display: flex; align-items: center; gap: 9px; padding: 0 10px 14px;"><div style="width: 8px; height: 8px; border-radius: 50%; background: {warm};"></div><span style="font-size: 13px; font-weight: 700;">AK Golf Academy</span></div>'.format(**TL))
    for p in RAIL_PUNKTER:
        er = p == aktiv
        flate = "background: %s; " % TL["dim"] if er else ""
        f = TL["text"] if er else TL["mute"]
        badge = ''
        if p == "Kø":
            badge = '<span class="num" style="min-width: 18px; height: 18px; border-radius: 999px; background: %s; color: #FFFFFF; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 5px;">17</span>' % TL["danger"]
        flex = 'flex: 1; ' if badge else ''
        radius = "999px" if p == "Meg" else "4px"
        ut.append('<div style="height: 40px; border-radius: 10px; %sdisplay: flex; align-items: center; gap: 10px; padding: 0 12px;"><div style="width: 16px; height: 16px; border-radius: %s; background: %s;"></div><span style="%sfont-size: 14px; font-weight: 600; color: %s;">%s</span>%s</div>' % (flate, radius, f, flex, f, p, badge))
    ut.append('<div style="margin: 14px 10px 8px; height: 1px; background: {hair};"></div>'.format(**TL))
    ut.append('<div style="padding: 0 10px 6px;" class="caps">Under Meg</div>')
    for u in ["Konsoll", "Økonomi", "Kalender"]:
        ut.append('<div style="height: 34px; border-radius: 10px; display: flex; align-items: center; padding: 0 12px; font-size: 13px; color: {mute};">{u}</div>'.format(u=u, **TL))
    ut.append('<div style="flex: 1;"></div></div>')
    return "".join(ut)

def faner(liste, aktiv_idx=0):
    ut = ['<nav style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 18px;">']
    for i, (navn, n) in enumerate(liste):
        er = i == aktiv_idx
        bg = TL["fill"] if er else TL["dim"]
        fg = TL["onFill"] if er else TL["text"]
        teller = '<span class="num" style="opacity: 0.75;">%s</span>' % n if n else ""
        ut.append('<span class="pille" style="background: %s; color: %s;"><span>%s</span>%s</span>' % (bg, fg, navn, teller))
    ut.append("</nav>")
    return "".join(ut)

def rader(items, hoyre_caps=False):
    ut = ['<div class="kort" style="padding: 4px 20px;">']
    for i, it in enumerate(items):
        topp = "" if i == 0 else "border-top: 1px solid %s;" % TL["hair"]
        h = it.get("hoyre", "")
        hstil = 'class="caps" style="font-size: 10px;"' if hoyre_caps else 'class="num" style="font-size: 13px; color: %s;"' % TL["mute"]
        under = '<div style="font-size: 12.5px; color: %s; margin-top: 3px; line-height: 1.45;">%s</div>' % (TL["mute"], it["under"]) if it.get("under") else ""
        merke = ""
        if it.get("merke"):
            farge, mtekst = it["merke"]
            ring = TL["warnHair"] if farge == "warn" else TL["hair"]
            mf = TL["warn"] if farge == "warn" else TL["mute"]
            merke = '<span style="flex: none; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: %s; box-shadow: inset 0 0 0 1px %s; border-radius: 999px; padding: 3px 8px;">%s</span>' % (mf, ring, mtekst)
        ut.append('<div class="rad" style="%s align-items: flex-start;"><div style="flex: 1; min-width: 0;"><div style="font-size: 15px; font-weight: 600;">%s</div>%s</div>%s<span %s>%s</span></div>' % (topp, it["tittel"], under, merke, hstil, h))
    ut.append("</div>")
    return "".join(ut)

def mac(navn, rail_aktiv, caps, tittel, ingress, kropp, header_hoyre=None, faner_html=""):
    hh = ''
    if header_hoyre:
        hh = '<div style="flex: 1;"></div><div class="cta" style="background: %s; color: %s; font-weight: 600; height: 32px; font-size: 13px;">%s</div>' % (TL["fill"], TL["onFill"], header_hoyre)
    return """<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
{helmet}
<div style="width: 1440px; height: 900px; background: {scene}; display: flex; overflow: hidden;">
{rail}
  <div style="flex: 1; min-width: 0; display: flex; flex-direction: column;">
    <div style="height: 56px; flex: none; display: flex; align-items: center; gap: 14px; padding: 0 22px; border-bottom: 1px solid {hair};">
      <span style="font-size: 15px; font-weight: 700;">{navn}</span>{hh}
    </div>
    <div class="scroll" style="flex: 1; min-height: 0; overflow-y: auto; padding: 22px 22px 32px;">
      <div class="caps">{caps}</div>
      <h1 style="margin: 6px 0 0; font-size: 26px; font-weight: 700; letter-spacing: -0.01em;">{tittel}</h1>
      <p style="margin: 8px 0 0; max-width: 62ch; font-size: 13px; line-height: 1.55; color: {mute};">{ingress}</p>
      {faner_html}
      <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 20px;">{kropp}</div>
    </div>
  </div>
</div>
</x-dc>
</body>
</html>
""".format(helmet=HELMET, rail=rail(rail_aktiv), navn=navn, hh=hh, caps=caps,
           tittel=tittel, ingress=ingress, faner_html=faner_html, kropp=kropp, **TL)

def mobil(tittel, ingress, kropp, tab_aktiv, faner_html=""):
    tabs = []
    for p in RAIL_PUNKTER:
        er = p == tab_aktiv
        f = TL["text"] if er else TL["mute"]
        r = "999px" if p == "Meg" else "5px"
        tabs.append('<div style="flex: 1; height: 52px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px;"><div style="width: 20px; height: 20px; border-radius: %s; background: %s;"></div><span style="font-size: 10px; font-weight: 600; color: %s;">%s</span></div>' % (r, f, f, p))
    return """<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
{helmet}
<div style="width: 390px; height: 844px; background: {scene}; display: flex; flex-direction: column; overflow: hidden; position: relative;">
  <div class="scroll" style="flex: 1; min-height: 0; overflow-y: auto; padding: 24px 16px 104px;">
    <div class="caps">Academy</div>
    <h1 style="margin: 6px 0 0; font-size: 26px; font-weight: 700; letter-spacing: -0.01em;">{tittel}</h1>
    <p style="margin: 8px 0 0; font-size: 13px; line-height: 1.55; color: {mute};">{ingress}</p>
    {faner_html}
    <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 18px;">{kropp}</div>
  </div>
  <div style="position: absolute; left: 16px; right: 16px; bottom: 12px; height: 64px; background: {dock}; border-radius: 999px; box-shadow: inset 0 0 0 1px {hair}; display: flex; align-items: center; padding: 8px 10px;">{tabs}</div>
</div>
</x-dc>
</body>
</html>
""".format(helmet=HELMET, tittel=tittel, ingress=ingress, faner_html=faner_html,
           kropp=kropp, tabs="".join(tabs), **TL)
