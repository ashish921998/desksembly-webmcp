const SESSION_COOKIE = "__deskbuilder_shopify";

function readCookie(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const encoded = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);

  if (!encoded) return new Map<string, unknown>();

  try {
    const parsed = JSON.parse(decodeURIComponent(encoded)) as Record<string, unknown>;
    return new Map(Object.entries(parsed));
  } catch {
    return new Map<string, unknown>();
  }
}

export function createRouteSessionManager(request: Request) {
  const values = readCookie(request);
  let dirty = false;

  return {
    getSessionOrigin: () => new URL(request.url).origin,
    getSessionItem: (key: string) => values.get(key),
    setSessionItem: (key: string, value: unknown) => {
      values.set(key, value);
      dirty = true;
    },
    removeSessionItem: (key: string) => {
      values.delete(key);
      dirty = true;
    },
    commit: () => {
      if (!dirty) return;

      const headers = new Headers();
      const value = encodeURIComponent(JSON.stringify(Object.fromEntries(values)));
      const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
      headers.append(
        "Set-Cookie",
        `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure}`,
      );
      return headers;
    },
  };
}
