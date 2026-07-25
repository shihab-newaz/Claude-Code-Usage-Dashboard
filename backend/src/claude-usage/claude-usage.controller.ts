import { Controller, Get, NotFoundException, Param, Query, UseGuards } from "@nestjs/common";
import { ClaudeUsageService } from "./claude-usage.service";
import { DateRangeFilterDto } from "./dto/date-range-filter.dto";
import { ApiKeyGuard } from "../common/api-key.guard";
import { SyncService } from "../sync/sync.service";

@Controller("api")
@UseGuards(ApiKeyGuard)
export class ClaudeUsageController {
  constructor(
    private readonly service: ClaudeUsageService,
    private readonly sync: SyncService,
  ) {}

  @Get("claude-usage")
  getUsage(@Query() query: DateRangeFilterDto) {
    this.sync.ensureSynced();
    return this.service.getFullResponse(query);
  }

  @Get("sessions/:id")
  getSession(@Param("id") id: string) {
    this.sync.ensureSynced();
    const session = this.service.getSessionById(id);
    if (!session) throw new NotFoundException("Session not found");
    return session;
  }
}
