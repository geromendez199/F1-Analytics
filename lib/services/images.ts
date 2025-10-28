export interface MediaImage {
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
}

const WIKIPEDIA_ENDPOINT = "https://en.wikipedia.org/w/api.php";

export async function fetchCommonsImage(title: string): Promise<MediaImage | null> {
  const url = new URL(WIKIPEDIA_ENDPOINT);
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("prop", "pageimages|description");
  url.searchParams.set("piprop", "original|thumbnail");
  url.searchParams.set("pithumbsize", "640");
  url.searchParams.set("titles", title);
  url.searchParams.set("origin", "*");

  const response = await fetch(url.toString(), { next: { revalidate: 24 * 60 * 60 } });
  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const pages = data.query?.pages ?? {};
  const page = Object.values(pages)[0] as any;
  if (!page) {
    return null;
  }

  const original = page.original?.source as string | undefined;
  const thumbnail = page.thumbnail?.source as string | undefined;
  const description = page.description as string | undefined;

  return {
    title,
    description,
    url: original ?? thumbnail ?? "",
    thumbnailUrl: thumbnail ?? original
  };
}

export async function fetchCommonsImages(titles: string[]): Promise<MediaImage[]> {
  const results = await Promise.allSettled(titles.map((title) => fetchCommonsImage(title)));
  return results
    .map((result) => (result.status === "fulfilled" ? result.value : null))
    .filter((item): item is MediaImage => Boolean(item?.url));
}
