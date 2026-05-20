import { Controller, Get, Query } from "@nestjs/common";
import { ClaudeUsageService } from "./claude-usage.service";
import { DateRangeFilterDto } from "./dto/date-range-filter.dto";

@Controller("api/claude-usage")
export class ClaudeUsageController {
  constructor(private readonly service: ClaudeUsageService) {}

  @Get()
  getUsage(@Query() query: DateRangeFilterDto) {
    return this.service.getFullResponse(query);
  }
}
