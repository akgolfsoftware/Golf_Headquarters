#!/usr/bin/env python3
"""
inventory_audio.py — Kartlegg hvilke videofiler som har tale/lyd.

Output (under MORAD_DATA/01_inventory/):
  audio_inventory.csv     — alle skannede filer med har_lyd, varighet, prioritet
  audio_priority_queue.csv — bare P1–P3 med lyd, sortert for transkripsjon
  audio_inventory_summary.md — menneskelig sammendrag
  audio_inventory_state.json — resume-state (path → row)

Kjøring:
  # Prioritet først (anbefalt start):
  python3 inventory_audio.py --profile priority

  # Full skann (timer–dager på USB):
  python3 inventory_audio.py --profile full

  # Én mappe:
  python3 inventory_audio.py --folders "07 - SKYPE SESSIONS" "05 - REFERENCE MATERIAL"

  # Hopp over ffprobe (kun filmetadata + heuristikk):
  python3 inventory_audio.py --profile priority --no-probe

Krever: ffmpeg (bundlet i scripts/venv imageio_ffmpeg, eller PATH).
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import re
import subprocess
import sys
import tarfile
import time
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable, Optional

# ---------------------------------------------------------------------------
# Paths — fungerer både fra Toshiba MORAD_DATA/scripts/ og fra akgolf-hq-repo
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_SOURCE = Path("/Volumes/TOSHIBA EXT/MORAD_AI_GOLF_COACH")


def resolve_source_root() -> Path:
    """SOURCE_DIR env, ellers Toshiba default, ellers parent hvis script ligger i MORAD_DATA/scripts."""
    env = os.environ.get("SOURCE_DIR") or os.environ.get("MORAD_SOURCE")
    if env:
        return Path(env).expanduser().resolve()
    # Script speilet til .../MORAD_AI_GOLF_COACH/MORAD_DATA/scripts/
    if SCRIPT_DIR.name == "scripts" and SCRIPT_DIR.parent.name == "MORAD_DATA":
        return SCRIPT_DIR.parent.parent
    if DEFAULT_SOURCE.is_dir():
        return DEFAULT_SOURCE
    raise SystemExit(
        "SOURCE ikke funnet. Monter Toshiba eller sett SOURCE_DIR=/path/to/MORAD_AI_GOLF_COACH"
    )


SOURCE_ROOT = resolve_source_root()
MORAD_DATA = SOURCE_ROOT / "MORAD_DATA"
INVENTORY_DIR = MORAD_DATA / "01_inventory"
TRANSCRIPTS_DIRS = [
    MORAD_DATA / "03_transcripts" / "reference_lectures",
    MORAD_DATA / "03_transcripts" / "batch_output",
]
KB_TRANSCRIPTIONS = SOURCE_ROOT / "10 - KNOWLEDGE BASE" / "05 - TRANSCRIPTIONS"

OUT_CSV = INVENTORY_DIR / "audio_inventory.csv"
OUT_QUEUE = INVENTORY_DIR / "audio_priority_queue.csv"
OUT_SUMMARY = INVENTORY_DIR / "audio_inventory_summary.md"
OUT_STATE = INVENTORY_DIR / "audio_inventory_state.json"
OUT_LOG = MORAD_DATA / "10_logs" / "inventory_audio.log"

VIDEO_EXTS = {
    ".mp4",
    ".mov",
    ".m4v",
    ".avi",
    ".mkv",
    ".vob",
    ".wmv",
    ".flv",
    ".mpeg",
    ".mpg",
    ".m2ts",
    ".mts",
    ".audionote",  # Skype export (tar) — sjekkes spesielt
}

# Mapper som aldri er verdt full probe i priority-profile
SKIP_DIR_NAMES = {
    "venv",
    ".git",
    "node_modules",
    "08 - MODEL FRAMES",
    "MODEL FRAMES",
}

CSV_FIELDS = [
    "path_rel",
    "filename",
    "extension",
    "top_folder",
    "size_mb",
    "duration_sec",
    "has_audio",
    "audio_codec",
    "audio_channels",
    "audio_sample_rate",
    "video_codec",
    "probe_ok",
    "probe_error",
    "already_transcribed",
    "transcript_id",
    "content_guess",
    "priority",
    "priority_reason",
    "skip_transcribe",
    "file_id",
    "probed_at",
]

# ---------------------------------------------------------------------------
# FFmpeg
# ---------------------------------------------------------------------------


def find_ffmpeg() -> str:
    env = os.environ.get("FFMPEG_PATH")
    if env and Path(env).exists():
        return env
    which = shutil_which("ffmpeg")
    if which:
        return which
    # Bundlet i Toshiba MORAD_DATA/scripts/venv (imageio_ffmpeg)
    candidates = [
        SCRIPT_DIR
        / "venv/lib/python3.9/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1",
        MORAD_DATA
        / "scripts/venv/lib/python3.9/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1",
    ]
    for bundled in candidates:
        if bundled.exists():
            return str(bundled)
    for binaries in (
        SCRIPT_DIR / "venv/lib/python3.9/site-packages/imageio_ffmpeg/binaries",
        MORAD_DATA
        / "scripts/venv/lib/python3.9/site-packages/imageio_ffmpeg/binaries",
    ):
        if binaries.is_dir():
            for p in binaries.iterdir():
                if p.name.startswith("ffmpeg") and p.is_file():
                    return str(p)
    raise SystemExit(
        "ffmpeg ikke funnet. Sett FFMPEG_PATH eller installer: brew install ffmpeg"
    )


def shutil_which(cmd: str) -> Optional[str]:
    from shutil import which

    return which(cmd)


def file_id(path: Path) -> str:
    """Samme ID-mønster som check_transcription_status.py (md5 av absolutt path)."""
    return hashlib.md5(str(path).encode()).hexdigest()[:16]


def load_transcript_ids() -> set[str]:
    ids: set[str] = set()
    for d in TRANSCRIPTS_DIRS:
        if not d.is_dir():
            continue
        for f in d.glob("*.json"):
            ids.add(f.stem)
    return ids


def load_kb_transcript_basenames() -> set[str]:
    names: set[str] = set()
    if not KB_TRANSCRIPTIONS.is_dir():
        return names
    for f in KB_TRANSCRIPTIONS.glob("*.md"):
        names.add(f.stem.lower().strip())
    return names


# ---------------------------------------------------------------------------
# Classification
# ---------------------------------------------------------------------------

SWING_HINTS = re.compile(
    r"(face[\s_-]?on|d\.?t\.?l|down[\s_-]?the[\s_-]?line|cimg|swing|impact|"
    r"7[\s_-]?iron|6[\s_-]?iron|driver|wedge|putter|slow[\s_-]?mo|model)",
    re.I,
)
SPEECH_HINTS = re.compile(
    r"(lecture|practice|classroom|school|short[\s_-]?game|shot[\s_-]?game|"
    r"skype|room|disc|dvd|mac[\s_-]?school)",
    re.I,
)


def content_guess(path_rel: str, filename: str, top: str) -> str:
    blob = f"{path_rel} {filename}".lower()
    if top.startswith("07") or "skype" in blob or filename.lower().endswith(".audionote"):
        return "skype_or_audio_note"
    if SPEECH_HINTS.search(blob):
        return "likely_speech"
    if SWING_HINTS.search(blob) and not SPEECH_HINTS.search(blob):
        return "likely_swing_clip"
    if top.startswith("03"):
        return "anders_personal"
    if top.startswith("04") or top.startswith("08"):
        return "model_swing"
    if top.startswith("09"):
        return "archive"
    return "unknown"


def assign_priority(
    *,
    top: str,
    content: str,
    has_audio: Optional[bool],
    already: bool,
    size_mb: float,
    duration_sec: Optional[float],
) -> tuple[str, str, bool]:
    """
    Returns (priority, reason, skip_transcribe).
    P1 = do first, P2 = soon, P3 = later, P4 = low, SKIP = don't transcribe.
    """
    if already:
        return "SKIP", "allerede_transkribert", True

    if has_audio is False:
        return "SKIP", "ingen_lydspor", True

    if content == "model_swing":
        return "SKIP", "modell_sving_ikke_prosa", True
    if content == "archive" and top.startswith("09"):
        return "P4", "arkiv_lav_prioritet", False

    # No probe yet or unknown audio
    if has_audio is None:
        # Heuristic before probe
        if content == "skype_or_audio_note":
            return "P2", "skype_heuristikk_venter_probe", False
        if content == "likely_speech":
            return "P1", "sannsynlig_tale_venter_probe", False
        if content == "likely_swing_clip":
            return "P4", "sannsynlig_sving_venter_probe", False
        if content == "anders_personal":
            return "P3", "personlig_venter_probe", False
        return "P3", "ukjent_venter_probe", False

    # has_audio True
    if content == "skype_or_audio_note":
        return "P2", "skype_med_lyd", False
    if content == "likely_speech":
        # Prefer longer speech content
        if duration_sec and duration_sec >= 300:
            return "P1", "forelesning_practice_lang", False
        if duration_sec and duration_sec >= 60:
            return "P1", "forelesning_practice", False
        return "P2", "kort_taleklipp", False
    if content == "anders_personal":
        return "P3", "anders_personlig_med_lyd", False
    if content == "likely_swing_clip":
        # Short clips with audio might still be silent ambient
        if duration_sec is not None and duration_sec < 30:
            return "SKIP", "kort_svingklipp_med_lyd_sannsynlig_irrelevant", True
        return "P4", "sving_med_lyd_lav", False
    if top.startswith("05") or top.startswith("00"):
        return "P1", "reference_or_dvd_med_lyd", False
    if duration_sec and duration_sec >= 600:
        return "P2", "lang_fil_med_lyd", False
    if size_mb >= 200:
        return "P2", "stor_fil_med_lyd", False
    return "P3", "med_lyd_ukjent_innhold", False


# ---------------------------------------------------------------------------
# Probe
# ---------------------------------------------------------------------------


def probe_media(ffmpeg: str, path: Path, timeout: int = 45) -> dict[str, Any]:
    """
    Parse ffmpeg -i stderr for streams and duration.
    Returns dict with has_audio, codecs, duration_sec, probe_ok, probe_error.
    """
    result: dict[str, Any] = {
        "has_audio": None,
        "audio_codec": "",
        "audio_channels": "",
        "audio_sample_rate": "",
        "video_codec": "",
        "duration_sec": None,
        "probe_ok": False,
        "probe_error": "",
    }

    # .audionote is often a tar of audio — handle separately
    if path.suffix.lower() == ".audionote":
        return probe_audionote(path)

    try:
        proc = subprocess.run(
            [ffmpeg, "-hide_banner", "-i", str(path)],
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        # ffmpeg -i always exits non-zero without output file; info is on stderr
        text = (proc.stderr or "") + (proc.stdout or "")
    except subprocess.TimeoutExpired:
        result["probe_error"] = "timeout"
        return result
    except Exception as e:
        result["probe_error"] = str(e)[:200]
        return result

    if "Invalid data found" in text or "Error opening input" in text:
        result["probe_error"] = "invalid_or_unreadable"
        result["has_audio"] = False
        return result

    # Duration: Duration: 01:33:28.76
    m = re.search(r"Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)", text)
    if m:
        h, mi, s = int(m.group(1)), int(m.group(2)), float(m.group(3))
        result["duration_sec"] = round(h * 3600 + mi * 60 + s, 2)

    has_audio = False
    audio_codec = ""
    channels = ""
    sample_rate = ""
    video_codec = ""

    for line in text.splitlines():
        line = line.strip()
        if "Audio:" in line and "Stream #" in line:
            has_audio = True
            am = re.search(r"Audio:\s*([a-zA-Z0-9_]+)", line)
            if am:
                audio_codec = am.group(1)
            sm = re.search(r"(\d+)\s*Hz", line)
            if sm:
                sample_rate = sm.group(1)
            if "stereo" in line:
                channels = "2"
            elif "mono" in line:
                channels = "1"
            else:
                cm = re.search(r"(\d)\s*channels", line)
                if cm:
                    channels = cm.group(1)
        if "Video:" in line and "Stream #" in line:
            vm = re.search(r"Video:\s*([a-zA-Z0-9_]+)", line)
            if vm:
                video_codec = vm.group(1)

    result["has_audio"] = has_audio
    result["audio_codec"] = audio_codec
    result["audio_channels"] = channels
    result["audio_sample_rate"] = sample_rate
    result["video_codec"] = video_codec
    result["probe_ok"] = True
    return result


def probe_audionote(path: Path) -> dict[str, Any]:
    """Skype .audionote = tar archive; presence of audio files ⇒ has_audio."""
    result: dict[str, Any] = {
        "has_audio": False,
        "audio_codec": "",
        "audio_channels": "",
        "audio_sample_rate": "",
        "video_codec": "",
        "duration_sec": None,
        "probe_ok": False,
        "probe_error": "",
    }
    try:
        if not tarfile.is_tarfile(path):
            result["probe_error"] = "audionote_not_tar"
            return result
        with tarfile.open(path, "r:*") as tar:
            names = [m.name.lower() for m in tar.getmembers() if m.isfile()]
        audio_exts = (".m4a", ".mp3", ".aac", ".wav", ".caf", ".mp4", ".mov", ".aiff")
        hits = [n for n in names if n.endswith(audio_exts)]
        result["has_audio"] = len(hits) > 0
        result["audio_codec"] = "audionote_tar"
        result["probe_ok"] = True
        if hits:
            result["audio_codec"] = f"tar:{Path(hits[0]).suffix}"
        return result
    except Exception as e:
        result["probe_error"] = f"audionote:{str(e)[:120]}"
        return result


# ---------------------------------------------------------------------------
# Walk
# ---------------------------------------------------------------------------

PROFILES = {
    "priority": [
        "07 - SKYPE SESSIONS",
        "05 - REFERENCE MATERIAL",
        "00 - DVD_RIPS",
        "10 - KNOWLEDGE BASE",  # unlikely video; cheap
    ],
    "speech": [
        "07 - SKYPE SESSIONS",
        "05 - REFERENCE MATERIAL",
        "00 - DVD_RIPS",
        "01 - MAC OGRADY SCHOOL",
        # 02 MORAD Main is huge — include only year folders not Main if possible
        "02 - MORAD/2011",
        "02 - MORAD/2012",
        "02 - MORAD/2013",
        "02 - MORAD/2014",
        "02 - MORAD/2015",
        "02 - MORAD/2016",
    ],
    "full": [
        "00 - DVD_RIPS",
        "01 - MAC OGRADY SCHOOL",
        "02 - MORAD",
        "03 - ANDERS SWING ANALYSIS",
        "04 - MAC OGRADY SWINGS",
        "05 - REFERENCE MATERIAL",
        "07 - SKYPE SESSIONS",
        "08 - MODEL SWINGS",
        # 09 ARCHIVE optional — often duplicates
    ],
}


def iter_media_files(roots: Iterable[Path]) -> Iterable[Path]:
    for root in roots:
        if not root.exists():
            continue
        if root.is_file():
            if root.suffix.lower() in VIDEO_EXTS:
                yield root
            continue
        for dirpath, dirnames, filenames in os.walk(root):
            # prune
            dirnames[:] = [
                d
                for d in dirnames
                if d not in SKIP_DIR_NAMES and not d.startswith(".")
            ]
            for name in filenames:
                if name.startswith("."):
                    continue
                ext = Path(name).suffix.lower()
                if ext in VIDEO_EXTS:
                    yield Path(dirpath) / name


def top_folder_of(path_rel: str) -> str:
    parts = Path(path_rel).parts
    return parts[0] if parts else ""


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def log(msg: str) -> None:
    line = f"{datetime.now().isoformat(timespec='seconds')} {msg}"
    print(line, flush=True)
    try:
        OUT_LOG.parent.mkdir(parents=True, exist_ok=True)
        with open(OUT_LOG, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except OSError:
        pass


def load_state() -> dict[str, dict]:
    if OUT_STATE.exists():
        try:
            return json.loads(OUT_STATE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return {}
    return {}


def save_state(state: dict[str, dict]) -> None:
    OUT_STATE.write_text(
        json.dumps(state, ensure_ascii=False, indent=0), encoding="utf-8"
    )


def write_outputs(rows: list[dict]) -> None:
    INVENTORY_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow(r)

    queue = [
        r
        for r in rows
        if r.get("priority") in ("P1", "P2", "P3")
        and r.get("has_audio") in (True, "True", "true", "1")
        and not r.get("skip_transcribe") in (True, "True", "true", "1")
        and not r.get("already_transcribed") in (True, "True", "true", "1")
    ]
    # sort P1, P2, P3 then duration desc
    order = {"P1": 0, "P2": 1, "P3": 2}

    def qkey(r: dict):
        d = r.get("duration_sec") or 0
        try:
            d = float(d)
        except (TypeError, ValueError):
            d = 0
        return (order.get(r.get("priority", "P3"), 9), -d)

    queue.sort(key=qkey)
    with open(OUT_QUEUE, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=CSV_FIELDS, extrasaction="ignore")
        w.writeheader()
        for r in queue:
            w.writerow(r)

    # Summary
    by_pri = Counter(r.get("priority") for r in rows)
    by_audio = Counter(str(r.get("has_audio")) for r in rows)
    by_top = Counter(r.get("top_folder") for r in rows)
    with_audio = sum(1 for r in rows if r.get("has_audio") in (True, "True", "true"))
    already = sum(
        1 for r in rows if r.get("already_transcribed") in (True, "True", "true")
    )
    p1 = [r for r in queue if r.get("priority") == "P1"]
    hours_p1 = 0.0
    for r in p1:
        try:
            hours_p1 += float(r.get("duration_sec") or 0) / 3600
        except ValueError:
            pass

    lines = [
        f"# Audio inventory summary",
        f"",
        f"**Generated:** {datetime.now(timezone.utc).isoformat()}",
        f"**SOURCE:** `{SOURCE_ROOT}`",
        f"**Files scanned:** {len(rows)}",
        f"**With audio:** {with_audio}",
        f"**Already transcribed (file_id match):** {already}",
        f"**Queue (P1–P3 with audio, not done):** {len(queue)}",
        f"**P1 estimated hours (duration sum):** {hours_p1:.1f}",
        f"",
        f"## By priority",
        f"",
    ]
    for k in ("P1", "P2", "P3", "P4", "SKIP"):
        lines.append(f"- **{k}:** {by_pri.get(k, 0)}")
    lines += ["", "## has_audio", ""]
    for k, v in by_audio.most_common():
        lines.append(f"- `{k}`: {v}")
    lines += ["", "## Top folders (count)", ""]
    for k, v in by_top.most_common(20):
        lines.append(f"- `{k}`: {v}")
    lines += [
        "",
        "## Next steps",
        "",
        "1. Åpne `audio_priority_queue.csv` — start øverst (P1).",
        "2. Transkriber med eksisterende Whisper-pipeline (`transcribe_*.py`).",
        "3. Destiller til dokumenter / UTKAST — aldri auto-merge til drills.json.",
        "4. Kjør `--profile speech` eller `full` for dypere dekning.",
        "",
        f"## Output files",
        f"",
        f"- `{OUT_CSV}`",
        f"- `{OUT_QUEUE}`",
        f"- `{OUT_STATE}`",
        "",
    ]
    # Sample top 15 queue paths
    lines += ["## Top 15 i køen", ""]
    for r in queue[:15]:
        dur = r.get("duration_sec") or "?"
        lines.append(
            f"- [{r.get('priority')}] {r.get('path_rel')} "
            f"({dur}s, {r.get('priority_reason')})"
        )
    OUT_SUMMARY.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Inventory video files for audio/speech")
    parser.add_argument(
        "--profile",
        choices=list(PROFILES.keys()),
        default="priority",
        help="Hvilke mapper som skannes (default: priority)",
    )
    parser.add_argument(
        "--folders",
        nargs="*",
        help="Relative mapper under SOURCE (overstyrer profile)",
    )
    parser.add_argument(
        "--no-probe",
        action="store_true",
        help="Ikke kjør ffmpeg — bare filstørrelse + heuristikk",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Probe på nytt selv om path finnes i state",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=0,
        help="Maks antall nye filer å proce (0 = unlimited)",
    )
    parser.add_argument(
        "--min-size-mb",
        type=float,
        default=0.05,
        help="Hopp over filer mindre enn dette (default 0.05 MB)",
    )
    args = parser.parse_args()

    if not SOURCE_ROOT.is_dir():
        print(f"SOURCE ikke lesbar: {SOURCE_ROOT}", file=sys.stderr)
        return 1

    rel_folders = args.folders if args.folders else PROFILES[args.profile]
    roots = [SOURCE_ROOT / f for f in rel_folders]

    ffmpeg = None
    if not args.no_probe:
        ffmpeg = find_ffmpeg()
        log(f"ffmpeg: {ffmpeg}")

    transcript_ids = load_transcript_ids()
    kb_names = load_kb_transcript_basenames()
    log(f"transcript file_ids: {len(transcript_ids)} | kb md names: {len(kb_names)}")
    log(f"profile={args.profile} folders={rel_folders}")

    state = load_state() if not args.force else {}
    rows_by_path: dict[str, dict] = dict(state)

    # Collect candidates
    media: list[Path] = []
    for p in iter_media_files(roots):
        media.append(p)
    log(f"fant {len(media)} mediafiler under valgte mapper")

    probed_new = 0
    t0 = time.time()

    for i, path in enumerate(media, 1):
        try:
            path_rel = str(path.relative_to(SOURCE_ROOT))
        except ValueError:
            path_rel = str(path)

        if path_rel in rows_by_path and not args.force:
            # keep existing unless force
            continue

        try:
            size_b = path.stat().st_size
        except OSError as e:
            rows_by_path[path_rel] = {
                "path_rel": path_rel,
                "filename": path.name,
                "extension": path.suffix.lower(),
                "top_folder": top_folder_of(path_rel),
                "size_mb": 0,
                "probe_ok": False,
                "probe_error": f"stat:{e}",
                "has_audio": None,
                "priority": "SKIP",
                "priority_reason": "stat_failed",
                "skip_transcribe": True,
                "already_transcribed": False,
                "file_id": file_id(path),
                "probed_at": datetime.now(timezone.utc).isoformat(),
            }
            continue

        size_mb = round(size_b / (1024 * 1024), 3)
        if size_mb < args.min_size_mb:
            continue

        fid = file_id(path)
        already = fid in transcript_ids
        # also soft-match kb transcription basename
        if not already and path.stem.lower().strip() in kb_names:
            already = True

        top = top_folder_of(path_rel)
        content = content_guess(path_rel, path.name, top)

        probe: dict[str, Any] = {
            "has_audio": None,
            "audio_codec": "",
            "audio_channels": "",
            "audio_sample_rate": "",
            "video_codec": "",
            "duration_sec": None,
            "probe_ok": False,
            "probe_error": "skipped_no_probe" if args.no_probe else "",
        }

        if not args.no_probe and ffmpeg:
            # Skip probe for already transcribed to save time (optional)
            if already and not args.force:
                probe["has_audio"] = True  # assume had audio if transcribed
                probe["probe_ok"] = True
                probe["probe_error"] = "skipped_already_transcribed"
            else:
                probe = probe_media(ffmpeg, path)
                probed_new += 1
                if probed_new % 25 == 0:
                    elapsed = time.time() - t0
                    log(
                        f"probed {probed_new} new | {i}/{len(media)} walk | "
                        f"{elapsed:.0f}s | last={path.name[:50]}"
                    )
                    # periodic save
                    save_state(rows_by_path)

        pri, reason, skip = assign_priority(
            top=top,
            content=content,
            has_audio=probe.get("has_audio"),
            already=already,
            size_mb=size_mb,
            duration_sec=probe.get("duration_sec"),
        )

        row = {
            "path_rel": path_rel,
            "filename": path.name,
            "extension": path.suffix.lower(),
            "top_folder": top,
            "size_mb": size_mb,
            "duration_sec": probe.get("duration_sec") or "",
            "has_audio": probe.get("has_audio"),
            "audio_codec": probe.get("audio_codec") or "",
            "audio_channels": probe.get("audio_channels") or "",
            "audio_sample_rate": probe.get("audio_sample_rate") or "",
            "video_codec": probe.get("video_codec") or "",
            "probe_ok": probe.get("probe_ok"),
            "probe_error": probe.get("probe_error") or "",
            "already_transcribed": already,
            "transcript_id": fid if already else "",
            "content_guess": content,
            "priority": pri,
            "priority_reason": reason,
            "skip_transcribe": skip,
            "file_id": fid,
            "probed_at": datetime.now(timezone.utc).isoformat(),
        }
        rows_by_path[path_rel] = row

        if args.limit and probed_new >= args.limit:
            log(f"limit {args.limit} nådd — stopper nye probes")
            break

    save_state(rows_by_path)
    rows = list(rows_by_path.values())
    # stable sort
    rows.sort(key=lambda r: (r.get("priority", "Z"), r.get("path_rel", "")))
    write_outputs(rows)

    log(f"ferdig. scanned_rows={len(rows)} new_probes={probed_new}")
    log(f"CSV: {OUT_CSV}")
    log(f"QUEUE: {OUT_QUEUE}")
    log(f"SUMMARY: {OUT_SUMMARY}")
    print(f"\nÅpne: {OUT_SUMMARY}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
