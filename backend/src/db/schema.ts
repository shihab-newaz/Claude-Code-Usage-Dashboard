import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";

export const DB_PATH = path.join(process.cwd(), ".data", "claude-usage.db");

export function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id               TEXT PRIMARY KEY,
      project_path     TEXT NOT NULL,
      start_time       TEXT NOT NULL,
      end_time         TEXT,
      duration_minutes REAL DEFAULT 0,
      input_tokens           INTEGER DEFAULT 0,
      output_tokens          INTEGER DEFAULT 0,
      cache_read_input_tokens  INTEGER DEFAULT 0,
      cache_creation_input_tokens INTEGER DEFAULT 0,
      user_message_count     INTEGER DEFAULT 0,
      assistant_message_count INTEGER DEFAULT 0,
      tool_count             INTEGER DEFAULT 0,
      uses_task_agent       INTEGER DEFAULT 0,
      uses_mcp              INTEGER DEFAULT 0,
      lines_added           INTEGER DEFAULT 0,
      lines_removed         INTEGER DEFAULT 0,
      files_modified        INTEGER DEFAULT 0,
      last_parsed_at        TEXT NOT NULL,
      UNIQUE(id)
    );

    CREATE TABLE IF NOT EXISTS session_tools (
      session_id  TEXT NOT NULL,
      tool_name   TEXT NOT NULL,
      call_count  INTEGER DEFAULT 1,
      PRIMARY KEY (session_id, tool_name),
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS session_languages (
      session_id TEXT NOT NULL,
      language   TEXT NOT NULL,
      file_count INTEGER DEFAULT 1,
      PRIMARY KEY (session_id, language),
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS session_models (
      session_id TEXT NOT NULL,
      model      TEXT NOT NULL,
      input_tokens INTEGER DEFAULT 0,
      output_tokens INTEGER DEFAULT 0,
      message_count INTEGER DEFAULT 1,
      PRIMARY KEY (session_id, model),
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
    CREATE INDEX IF NOT EXISTS idx_sessions_project_path ON sessions(project_path);
  `);
}
