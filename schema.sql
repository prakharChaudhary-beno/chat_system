-- postgres=# CREATE DATABASE chat_backend postgres-# psql -l postgres-# CREATE DATABASE chat_backend; ERROR: syntax error at or near "l" LINE 3: psql -l ^ postgres=# 
-- CREATE DATABASE chat_backend; CREATE DATABASE postgres=# 
-- INSERT INTO users (id, name, email) 
-- VALUES ('test-user-a', 'Test User A', 'test-user-a@example.com'), ('test-user-b', 'Test User B', 'test-user-b@example.com') 
-- ON CONFLICT (id) DO NOTHING; ERROR: relation "users" does not exist LINE 1: 
-- INSERT INTO users (id, name, email) ^ postgres=#


CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CREATE TABLE IF NOT EXISTS chats (
--     id UUID PRIMARY KEY,
--     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--     CONSTRAINT chats_distinct_users CHECK (user_a_id COLLATE "C" < user_b_id COLLATE "C"),
--     CONSTRAINT chats_unique_user_pair UNIQUE (user_a_id, user_b_id)
-- );

CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY,
    user_a_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_b_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chats_distinct_users CHECK (user_a_id COLLATE "C" < user_b_id COLLATE "C"),
    CONSTRAINT chats_unique_user_pair UNIQUE (user_a_id, user_b_id)
);

CREATE TABLE IF NOT EXISTS chat_members (
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (chat_id, user_id)
);


CREATE INDEX IF NOT EXISTS chat_members_user_id_idx ON chat_members(user_id);
CREATE INDEX IF NOT EXISTS chats_created_at_idx ON chats(created_at DESC);

