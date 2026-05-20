import { Injectable, Logger } from "@nestjs/common";
import * as path from "path";
import { DbService } from "../db/db.service";
import { ParserService } from "./parser.service";

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private lastSync = 0;
  private readonly syncInterval = 60_000;

  constructor(
    private readonly db: DbService,
    private readonly parser: ParserService,
  ) {}

  ensureSynced(): void {
    const now = Date.now();
    if (now - this.lastSync > this.syncInterval) {
      this.syncAllSessions();
      this.lastSync = now;
    }
  }

  syncAllSessions(): void {
    const projectsDir = path.join(process.env.HOME ?? process.env.USERPROFILE ?? "", ".claude", "projects");
    this.logger.log(`Syncing all sessions from ${projectsDir}`);
    this.syncDirectory(projectsDir);
  }

  syncFromDirectory(dirPath: string): void {
    this.logger.log(`Syncing sessions from uploaded directory ${dirPath}`);
    this.syncDirectory(dirPath);
  }

  private syncDirectory(dirPath: string): void {
    const jsonlFiles = this.parser.getJsonlFiles(dirPath);
    const db = this.db.dbInstance;
    const lastParsedAt = new Date().toISOString();

    const upsertSession = db.prepare(`
      INSERT INTO sessions (id, project_path, start_time, end_time, duration_minutes,
        input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens,
        user_message_count, assistant_message_count, tool_count,
        uses_task_agent, uses_mcp, lines_added, lines_removed, files_modified, last_parsed_at)
      VALUES (@id, @projectPath, @startTime, @endTime, @durationMinutes,
        @inputTokens, @outputTokens, @cacheReadInputTokens, @cacheCreationInputTokens,
        @userMessageCount, @assistantMessageCount, @toolCount,
        @usesTaskAgent, @usesMcp, 0, 0, 0, @lastParsedAt)
      ON CONFLICT(id) DO UPDATE SET
        project_path = excluded.project_path,
        start_time = excluded.start_time,
        end_time = excluded.end_time,
        duration_minutes = excluded.duration_minutes,
        input_tokens = excluded.input_tokens,
        output_tokens = excluded.output_tokens,
        cache_read_input_tokens = excluded.cache_read_input_tokens,
        cache_creation_input_tokens = excluded.cache_creation_input_tokens,
        user_message_count = excluded.user_message_count,
        assistant_message_count = excluded.assistant_message_count,
        tool_count = excluded.tool_count,
        uses_task_agent = excluded.uses_task_agent,
        uses_mcp = excluded.uses_mcp,
        last_parsed_at = excluded.last_parsed_at
    `);

    const upsertTool = db.prepare(`
      INSERT INTO session_tools (session_id, tool_name, call_count)
      VALUES (@sessionId, @toolName, @callCount)
      ON CONFLICT(session_id, tool_name) DO UPDATE SET call_count = excluded.call_count
    `);

    const upsertLang = db.prepare(`
      INSERT INTO session_languages (session_id, language, file_count)
      VALUES (@sessionId, @language, @fileCount)
      ON CONFLICT(session_id, language) DO UPDATE SET file_count = excluded.file_count
    `);

    const upsertModel = db.prepare(`
      INSERT INTO session_models (session_id, model, input_tokens, output_tokens, message_count)
      VALUES (@sessionId, @model, @inputTokens, @outputTokens, @messageCount)
      ON CONFLICT(session_id, model) DO UPDATE SET
        input_tokens = excluded.input_tokens,
        output_tokens = excluded.output_tokens,
        message_count = excluded.message_count
    `);

    const deleteTools = db.prepare(`DELETE FROM session_tools WHERE session_id = ?`);
    const deleteLangs = db.prepare(`DELETE FROM session_languages WHERE session_id = ?`);
    const deleteModels = db.prepare(`DELETE FROM session_models WHERE session_id = ?`);

    let synced = 0;
    let skipped = 0;

    for (const file of jsonlFiles) {
      const parsed = this.parser.parseJsonlFile(file);
      if (!parsed) {
        this.logger.warn(`Skipping unparseable file: ${file}`);
        skipped++;
        continue;
      }

      const toolCount = Object.values(parsed.toolCounts).reduce((a, b) => a + b, 0);

      db.transaction(() => {
        upsertSession.run({
          id: parsed.id,
          projectPath: parsed.projectPath,
          startTime: parsed.startTime,
          endTime: parsed.endTime,
          durationMinutes: parsed.durationMinutes,
          inputTokens: parsed.inputTokens,
          outputTokens: parsed.outputTokens,
          cacheReadInputTokens: parsed.cacheReadInputTokens,
          cacheCreationInputTokens: parsed.cacheCreationInputTokens,
          userMessageCount: parsed.userMessageCount,
          assistantMessageCount: parsed.assistantMessageCount,
          toolCount,
          usesTaskAgent: parsed.usesTaskAgent ? 1 : 0,
          usesMcp: parsed.usesMcp ? 1 : 0,
          lastParsedAt,
        });
        deleteTools.run(parsed.id);
        deleteLangs.run(parsed.id);
        deleteModels.run(parsed.id);
        for (const [toolName, callCount] of Object.entries(parsed.toolCounts)) {
          upsertTool.run({ sessionId: parsed.id, toolName, callCount });
        }
        for (const [language, fileCount] of Object.entries(parsed.languageCounts)) {
          upsertLang.run({ sessionId: parsed.id, language, fileCount });
        }
        for (const [model, stats] of Object.entries(parsed.modelCounts)) {
          upsertModel.run({
            sessionId: parsed.id,
            model,
            inputTokens: stats.inputTokens,
            outputTokens: stats.outputTokens,
            messageCount: stats.messageCount,
          });
        }
      })();
      synced++;
    }

    this.logger.log(`Sync complete: ${synced} upserted, ${skipped} skipped`);
  }
}
