type QueryValue = string | number | boolean | null | undefined;

function buildQueryString(params?: Record<string, QueryValue>): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    searchParams.set(key, String(value));
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export async function apiFetch<T>(path: string, params?: Record<string, QueryValue>): Promise<T> {
  const url = `${path}${buildQueryString(params)}`;
  let response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok && response.status === 404 && !path.endsWith(".php")) {
    const fallbackUrl = `${path}.php${buildQueryString(params)}`;
    response = await fetch(fallbackUrl, {
      headers: {
        Accept: "application/json",
      },
    });
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText} - ${text}`);
  }

  return (await response.json()) as T;
}
