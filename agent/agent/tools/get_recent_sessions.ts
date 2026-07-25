import { defineTool } from "eve/tools";
import { z } from "zod";
import { fetchUsage } from "../lib/api-client.ts";

export default defineTool({
  description: "Get recent Claude Code sessions with per-session stats: duration, tokens, cost, files modified, and top tools used.",
  inputSchema: z.object({
    dateFrom: z.string().optional().describe("Optional start date in YYYY-MM-DD format"),
    dateTo: z.string().optional().describe("Optional end date in YYYY-MM-DD format"),
  }),
  async execute(params) {
    const data = await fetchUsage(params);
    return data.recentSessions;
  },
});
