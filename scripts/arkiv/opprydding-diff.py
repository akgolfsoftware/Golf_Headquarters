# Sammenligner baseline-skjermbilder (Fase 0) mot etter-Fase-1-skjermbilder.
# Produserer per-skjerm diff-prosent + side-ved-side-komposit (før | etter).
# Kjør: python3 scripts/opprydding-diff.py test-results/baseline test-results/etter-fase1 test-results/diff-fase1
import sys, os, json
from PIL import Image, ImageDraw, ImageFont
import numpy as np

base_dir, after_dir, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out_dir, exist_ok=True)
report = []

for theme in ["lys", "mork"]:
    bdir, adir = os.path.join(base_dir, theme), os.path.join(after_dir, theme)
    if not os.path.isdir(bdir):
        continue
    for f in sorted(os.listdir(bdir)):
        if not f.endswith(".png"):
            continue
        bpath, apath = os.path.join(bdir, f), os.path.join(adir, f)
        name = f"{theme}/{f[:-4]}"
        if not os.path.exists(apath):
            report.append({"skjerm": name, "status": "MANGLER etter-bilde"})
            continue
        b = Image.open(bpath).convert("RGB")
        a = Image.open(apath).convert("RGB")
        # Full-page-høyder kan variere litt — crop til felles størrelse for diff-tall
        w, h = min(b.width, a.width), min(b.height, a.height)
        nb = np.asarray(b.crop((0, 0, w, h)), dtype=np.int16)
        na = np.asarray(a.crop((0, 0, w, h)), dtype=np.int16)
        delta = np.abs(nb - na).max(axis=2)
        changed = float((delta > 5).mean() * 100)  # % piksler med synlig endring
        hdiff = abs(b.height - a.height)
        # Komposit: nedskalert før | etter
        target_w = 640
        def scale(img):
            r = target_w / img.width
            return img.resize((target_w, int(img.height * r)), Image.LANCZOS)
        sb, sa = scale(b), scale(a)
        ch = max(sb.height, sa.height) + 36
        comp = Image.new("RGB", (target_w * 2 + 24, ch), (24, 24, 24))
        comp.paste(sb, (0, 36))
        comp.paste(sa, (target_w + 24, 36))
        d = ImageDraw.Draw(comp)
        d.text((8, 8), f"FØR — {name}", fill=(255, 255, 255))
        d.text((target_w + 32, 8), f"ETTER — {changed:.1f}% endret", fill=(209, 248, 67))
        comp.save(os.path.join(out_dir, f"{theme}-{f[:-4]}.jpg"), quality=72)
        report.append({"skjerm": name, "endret_pst": round(changed, 1), "hoydediff_px": hdiff})

report.sort(key=lambda r: -(r.get("endret_pst") or 0))
print(json.dumps(report, indent=2, ensure_ascii=False))
with open(os.path.join(out_dir, "rapport.json"), "w") as fh:
    json.dump(report, fh, indent=2, ensure_ascii=False)
