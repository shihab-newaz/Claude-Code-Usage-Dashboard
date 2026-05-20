import { Module } from "@nestjs/common";
import { DbModule } from "./db/db.module";
import { SyncModule } from "./sync/sync.module";
import { ClaudeUsageModule } from "./claude-usage/claude-usage.module";

@Module({
  imports: [DbModule, SyncModule, ClaudeUsageModule],
})
export class AppModule {}
