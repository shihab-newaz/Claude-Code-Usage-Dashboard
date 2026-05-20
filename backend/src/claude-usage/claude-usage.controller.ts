import { Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { ClaudeUsageService } from "./claude-usage.service";
import { DateRangeFilterDto } from "./dto/date-range-filter.dto";

@Controller("api")
export class ClaudeUsageController {
  constructor(private readonly service: ClaudeUsageService) {}

  @Get("claude-usage")
  getUsage(@Query() query: DateRangeFilterDto) {
    return this.service.getFullResponse(query);
  }

  @Get("sessions/:id")
  getSession(@Param("id") id: string) {
    const session = this.service.getSessionById(id);
    if (!session) throw new NotFoundException("Session not found");
    return session;
  }
}
