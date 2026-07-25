import { defineTool } from "eve/tools";
import { z } from "zod";
import { fetchUsage } from "../lib/api-client.ts";

export default defineTool({
  description: "Get overall Claude usage summary: total cost, tokens, session count, and productivity metrics.",
  inputSchema: z.object({}),
  async execute() {
    const data = await fetchUsage();
    return data.summary;
  },
});
