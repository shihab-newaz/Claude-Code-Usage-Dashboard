import { defineTool } from "eve/tools";
import { z } from "zod";
import { fetchUsage } from "../lib/api-client.ts";

export default defineTool({
  description: "Get per-model breakdown of Claude usage: input/output tokens, message count, and estimated cost for each model.",
  inputSchema: z.object({
    dateFrom: z.string().optional().describe("Optional start date in YYYY-MM-DD format"),
    dateTo: z.string().optional().describe("Optional end date in YYYY-MM-DD format"),
  }),
  async execute(params) {
    const data = await fetchUsage(params);
    return data.modelBreakdown;
  },
});
