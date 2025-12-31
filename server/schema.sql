-- Database Schema for Shadow Board

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1,
    last_login_at DATETIME
);

-- Login Attempts table
CREATE TABLE IF NOT EXISTS login_attempts (
    attempt_id TEXT PRIMARY KEY,
    user_id TEXT,
    attempt_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    auth_method TEXT,
    failure_reason TEXT,
    geolocation TEXT,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

-- User Sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    session_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    login_attempt_id TEXT,
    session_token TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    last_activity_at DATETIME,
    logout_at DATETIME,
    logout_type TEXT, -- user_initiated, expired, forced
    ip_address TEXT,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(login_attempt_id) REFERENCES login_attempts(attempt_id)
);

-- Onboarding Flows table
CREATE TABLE IF NOT EXISTS onboarding_flows (
    flow_id TEXT PRIMARY KEY,
    flow_name TEXT NOT NULL,
    flow_type TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Onboarding Steps table
CREATE TABLE IF NOT EXISTS onboarding_steps (
    step_id TEXT PRIMARY KEY,
    flow_id TEXT NOT NULL,
    step_name TEXT NOT NULL,
    step_order INTEGER,
    step_description TEXT,
    is_required BOOLEAN DEFAULT 1,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY(flow_id) REFERENCES onboarding_flows(flow_id)
);

-- User Onboarding Progress table
CREATE TABLE IF NOT EXISTS user_onboarding_progress (
    progress_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    flow_id TEXT NOT NULL,
    status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed, skipped
    started_at DATETIME,
    completed_at DATETIME,
    current_step_id TEXT,
    FOREIGN KEY(user_id) REFERENCES users(user_id),
    FOREIGN KEY(flow_id) REFERENCES onboarding_flows(flow_id),
    FOREIGN KEY(current_step_id) REFERENCES onboarding_steps(step_id)
);

-- User Onboarding Step Completion table
CREATE TABLE IF NOT EXISTS user_onboarding_step_completion (
    completion_id TEXT PRIMARY KEY,
    progress_id TEXT NOT NULL,
    step_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, completed, skipped
    started_at DATETIME,
    completed_at DATETIME,
    time_spent_seconds INTEGER,
    data TEXT, -- JSON string
    FOREIGN KEY(progress_id) REFERENCES user_onboarding_progress(progress_id),
    FOREIGN KEY(step_id) REFERENCES onboarding_steps(step_id),
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
