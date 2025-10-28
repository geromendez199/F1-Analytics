export interface NewsArticle {
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  source: string;
  publishedAt?: string;
}

const NEWS_ENDPOINT = "https://newsapi.org/v2/everything";

export async function fetchNews(query = "Formula 1", language: string = "en", pageSize = 6): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return [];
  }

  const url = new URL(NEWS_ENDPOINT);
  url.searchParams.set("q", query);
  url.searchParams.set("language", language);
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("sortBy", "publishedAt");

  const response = await fetch(url.toString(), {
    headers: {
      "X-Api-Key": apiKey
    },
    next: { revalidate: 15 * 60 }
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const articles = Array.isArray(data.articles) ? data.articles : [];
  return articles.map((article: any) => ({
    title: article.title ?? "",
    description: article.description ?? undefined,
    url: article.url ?? "",
    imageUrl: article.urlToImage ?? undefined,
    source: article.source?.name ?? "",
    publishedAt: article.publishedAt ?? undefined
  }));
}
