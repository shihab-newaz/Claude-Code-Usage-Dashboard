-- Speed up time-series GROUP BY and project-path filtering
CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_project_path ON sessions(project_path);
