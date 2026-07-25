const BASE_URL = process.env.CLAUDE_USAGE_API_URL ?? "http://localhost:3000";
const API_KEY = process.env.CLAUDE_USAGE_API_KEY ?? "";

export async function fetchUsage(params?: { dateFrom?: string; dateTo?: string }) {
  const url = new URL("/api/claude-usage", BASE_URL);
  if (params?.dateFrom) url.searchParams.set("dateFrom", params.dateFrom);
  if (params?.dateTo) url.searchParams.set("dateTo", params.dateTo);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (API_KEY) headers["x-api-key"] = API_KEY;

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}
