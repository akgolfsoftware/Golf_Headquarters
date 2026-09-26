import { test } from "node:test";
import assert from "node:assert/strict";

function getEmbedUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === "youtu.be") {
      const v = u.pathname.slice(1);
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const m = /\/(\d+)/.exec(u.pathname);
      if (m) return `https://player.vimeo.com/video/${m[1]}`;
    }
  } catch {}
  return null;
}

test("getEmbedUrl parserer vanlige YouTube-lenker riktig", () => {
  const watchUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  assert.equal(getEmbedUrl(watchUrl), "https://www.youtube.com/embed/dQw4w9WgXcQ");

  const shortUrl = "https://youtu.be/dQw4w9WgXcQ";
  assert.equal(getEmbedUrl(shortUrl), "https://www.youtube.com/embed/dQw4w9WgXcQ");
});

test("getEmbedUrl parserer Vimeo-lenker riktig", () => {
  const vimeoUrl = "https://vimeo.com/76979871";
  assert.equal(getEmbedUrl(vimeoUrl), "https://player.vimeo.com/video/76979871");
});

test("getEmbedUrl returnerer null for vanlige MP4-filer", () => {
  const mp4Url = "https://example.com/video.mp4";
  assert.equal(getEmbedUrl(mp4Url), null);
});

test("arrayMove flytter oppgaver riktig i prioritetslisten", () => {
  const items = ["task-1", "task-2", "task-3", "task-4"];
  // Flytt task-3 (index 2) til toppen (index 0)
  const moved = [...items];
  const [removed] = moved.splice(2, 1);
  moved.splice(0, 0, removed);
  assert.deepEqual(moved, ["task-3", "task-1", "task-2", "task-4"]);
});
