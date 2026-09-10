"""Kjør de fire uavhengige komponentprøvene mot samme lokale server."""
from pathlib import Path
import subprocess
import sys

for name in ["tn-tilgang.py", "train-lock.py", "wang-login.py", "player-nav.py"]:
    subprocess.run([sys.executable, str(Path(__file__).with_name(name))], check=True)
