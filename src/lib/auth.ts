export const COOKIE_NAME = "admin_session";

export async function getSessionToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD || "";
  const encoder = new TextEncoder();
  const data = encoder.encode("captain-purunchi-auth:" + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifySession(cookieValue: string): Promise<boolean> {
  return cookieValue === (await getSessionToken());
}
