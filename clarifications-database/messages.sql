DROP TABLE IF EXISTS threads CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS threadsaccess CASCADE;

CREATE TABLE threads (
    id SERIAL PRIMARY KEY,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    created TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    contestantID VARCHAR(50) NOT NULL REFERENCES users(username)
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    threadID INTEGER NOT NULL REFERENCES threads(id),
    contents TEXT NOT NULL,
    contentType VARCHAR(64),
    creatorID VARCHAR(50) NOT NULL REFERENCES users(username),
    isExternal BOOLEAN NOT NULL DEFAULT TRUE,
    created TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (contentType IN ('image/jpeg', 'image/png', 'text'))
);

CREATE OR REPLACE function messages_auto_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated = NOW();
    UPDATE threads SET updated = NOW() WHERE threads.id = NEW.threadID;
    RETURN NEW;
END; $$
LANGUAGE plpgsql;

CREATE OR REPLACE function threads_auto_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated = NOW();
    RETURN NEW;
END; $$
LANGUAGE plpgsql;

CREATE TRIGGER messages_timestamp
AFTER UPDATE OR INSERT ON messages
FOR EACH ROW
EXECUTE PROCEDURE messages_auto_timestamp();

CREATE TRIGGER threads_timestamp
AFTER UPDATE OR INSERT ON threads
FOR EACH ROW
EXECUTE PROCEDURE threads_auto_timestamp();


CREATE TABLE threadsaccess (
    threadID INTEGER NOT NULL REFERENCES threads(id),
    groupname VARCHAR(50) NOT NULL REFERENCES usergroups(groupname),
    PRIMARY KEY (threadID, groupname)
);
