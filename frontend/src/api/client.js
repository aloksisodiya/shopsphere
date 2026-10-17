const BASE = import.meta.env.VITE_API_URL || "";

/**
 * Small fetch wrapper for the ShopSphere API.
 * - Adds the JWT from localStorage when `auth` is true (default).
 * - Throws an Error whose message is the server's message.
 * - Fires an "auth:expired" event if the server rejects a stored token.
 */
export async function api(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const token = localStorage.getItem("token");
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && auth && token) {
      window.dispatchEvent(new Event("auth:expired"));
    }
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}
