import { defineTool } from "eve/tools";
import { z } from "zod";
import { fetchUsage } from "../lib/api-client.ts";

export default defineTool({
  description: "Get Claude usage filtered by a date range. Returns summary, time series, model breakdown, tool breakdown, and recent sessions.",
  inputSchema: z.object({
    dateFrom: z.string().describe("Start date in YYYY-MM-DD format"),
    dateTo: z.string().describe("End date in YYYY-MM-DD format"),
  }),
  async execute({ dateFrom, dateTo }) {
    return fetchUsage({ dateFrom, dateTo });
  },
});
