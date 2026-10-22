export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

/** Where relais reads from, and how much it is willing to download. Never read from the environment. */
export interface Sources {
  fetch: FetchLike;
  timeoutMs: number;
  /** Any single response larger than this is refused, so a hostile server cannot exhaust memory or data. */
  maxBytes: number;
  npmRegistry: string;
  npmDownloads: string;
  osv: string;
}

export const DEFAULT_SOURCES: Sources = {
  fetch: (input, init) => globalThis.fetch(input, init),
  timeoutMs: 15_000,
  maxBytes: 10 * 1024 * 1024,
  npmRegistry: "https://registry.npmjs.org",
  npmDownloads: "https://api.npmjs.org/downloads/point/last-week",
  osv: "https://api.osv.dev/v1/query",
};

/** The primary source could not be reached or answered something unusable: nothing can be verified. */
export class RegistryError extends Error {
  override name = "RegistryError";
}

async function readCapped(res: Response, maxBytes: number): Promise<string> {
  const declared = Number(res.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) {
    await res.body?.cancel();
    throw new RegistryError(`response larger than ${maxBytes} bytes`);
  }
  if (!res.body) return "";
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new RegistryError(`response larger than ${maxBytes} bytes`);
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

export async function getJson(
  sources: Sources,
  url: string,
  init?: RequestInit,
): Promise<{ status: number; body: unknown }> {
  let res: Response;
  try {
    res = await sources.fetch(url, {
      ...init,
      redirect: "error",
      signal: AbortSignal.timeout(sources.timeoutMs),
    });
  } catch (error) {
    throw new RegistryError(`${url}: ${error instanceof Error ? error.message : String(error)}`);
  }
  const text = await readCapped(res, sources.maxBytes);
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    body = undefined;
  }
  return { status: res.status, body };
}

/** Like getJson, but any failure means "unknown" instead of an error. For secondary sources. */
export async function tryJson(sources: Sources, url: string, init?: RequestInit): Promise<unknown> {
  try {
    const { status, body } = await getJson(sources, url, init);
    return status === 200 ? body : undefined;
  } catch {
    return undefined;
  }
}
