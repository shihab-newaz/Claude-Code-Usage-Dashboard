import { Module } from "@nestjs/common";
import { SyncService } from "./sync.service";
import { SyncController } from "./sync.controller";
import { ParserService } from "./parser.service";
import { DbModule } from "../db/db.module";

@Module({
  imports: [DbModule],
  controllers: [SyncController],
  providers: [SyncService, ParserService],
})
export class SyncModule {}
