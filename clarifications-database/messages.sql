DROP TABLE IF EXISTS messages;

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    contents TEXT NOT NULL,
    contentType VARCHAR(64),
    creatorID VARCHAR(50) REFERENCES users(username),
    CHECK (contentType IN 'image/jpeg', 'image/png', 'text')
)

CREATE TABLE threads (
    id SERIAL PRIMARY KEY,
    rootMessage INTEGER NOT NULL REFERENCES messages(id),
    contestantID VARCHAR(50) REFERENCES users(username),
    UNIQUE (rootMessage)
)