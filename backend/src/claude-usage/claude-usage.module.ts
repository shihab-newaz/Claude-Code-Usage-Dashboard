import { Module } from "@nestjs/common";
import { ClaudeUsageController } from "./claude-usage.controller";
import { ClaudeUsageService } from "./claude-usage.service";
import { DbModule } from "../db/db.module";
import { SyncModule } from "../sync/sync.module";

@Module({
  imports: [DbModule, SyncModule],
  controllers: [ClaudeUsageController],
  providers: [ClaudeUsageService],
})
export class ClaudeUsageModule {}
