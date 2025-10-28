export interface VideoItem {
  id: string;
  title: string;
  thumbnailUrl?: string;
  publishedAt?: string;
  channelTitle?: string;
  url: string;
}

export async function fetchHighlights(query = "Formula 1 Highlights", maxResults = 6): Promise<VideoItem[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return [];
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("order", "date");
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("q", query);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString(), { next: { revalidate: 15 * 60 } });
  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const items = Array.isArray(data.items) ? data.items : [];
  return items
    .map((item: any) => {
      const videoId = item.id?.videoId;
      if (!videoId) {
        return null;
      }
      return {
        id: videoId,
        title: item.snippet?.title ?? "",
        thumbnailUrl: item.snippet?.thumbnails?.high?.url ?? item.snippet?.thumbnails?.default?.url,
        publishedAt: item.snippet?.publishedAt ?? undefined,
        channelTitle: item.snippet?.channelTitle ?? undefined,
        url: `https://www.youtube.com/watch?v=${videoId}`
      };
    })
    .filter(Boolean) as VideoItem[];
}
