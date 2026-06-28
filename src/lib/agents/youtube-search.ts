// YouTube Data API v3-søk for drill-forslag-agenten. Best-effort: uten
// YOUTUBE_API_KEY (eller ved feil/timeout) returneres tom liste, og agenten
// faller tilbake til Claude-genererte driller uten video.
//
// Sett nøkkelen i .env.local:  YOUTUBE_API_KEY=...
// Gratis fra Google Cloud (YouTube Data API v3). search.list koster 100
// kvote-enheter; gratis-kvoten er 10 000/dag — langt mer enn agenten bruker.

import "server-only";

export type YoutubeVideo = {
  videoId: string;
  url: string;
  title: string;
  channel: string;
  description: string;
};

export function isYoutubeEnabled(): boolean {
  return Boolean(process.env.YOUTUBE_API_KEY);
}

export async function searchYoutube(
  query: string,
  maxResults = 6,
): Promise<YoutubeVideo[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("q", query);
  url.searchParams.set("relevanceLanguage", "en");
  url.searchParams.set("videoEmbeddable", "true");
  url.searchParams.set("safeSearch", "strict");
  url.searchParams.set("key", key);

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      console.error(`[youtube] søk feilet: HTTP ${res.status}`);
      return [];
    }
    const data: unknown = await res.json();
    return parseVideos(data);
  } catch (err) {
    console.error("[youtube] søk feilet:", err);
    return [];
  }
}

// Defensiv parsing av YouTube-responsen — hopper over treff uten id/tittel.
function parseVideos(data: unknown): YoutubeVideo[] {
  if (data === null || typeof data !== "object") return [];
  const items = (data as { items?: unknown }).items;
  if (!Array.isArray(items)) return [];

  const videoer: YoutubeVideo[] = [];
  for (const item of items) {
    if (item === null || typeof item !== "object") continue;
    const o = item as { id?: unknown; snippet?: unknown };
    const idObj = o.id as { videoId?: unknown } | undefined;
    const snip = o.snippet as
      | { title?: unknown; channelTitle?: unknown; description?: unknown }
      | undefined;
    const videoId = typeof idObj?.videoId === "string" ? idObj.videoId : "";
    const title = typeof snip?.title === "string" ? snip.title : "";
    if (!videoId || !title) continue;
    videoer.push({
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      title,
      channel: typeof snip?.channelTitle === "string" ? snip.channelTitle : "",
      description:
        typeof snip?.description === "string"
          ? snip.description.slice(0, 300)
          : "",
    });
  }
  return videoer;
}
