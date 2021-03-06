DROP TABLE IF EXISTS threads CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS threadsaccess CASCADE;

CREATE TABLE threads (
    id SERIAL PRIMARY KEY,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    isAnnouncement BOOLEAN NOT NULL,
    isLogistics BOOLEAN NOT NULL,
    created TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    senderID VARCHAR(50) NOT NULL REFERENCES users(username),
    creatorID VARCHAR(50) NOT NULL REFERENCES users(username)
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    threadID INTEGER NOT NULL REFERENCES threads(id),
    contents TEXT NOT NULL,
    contentType VARCHAR(64),
    senderID VARCHAR(50) NOT NULL REFERENCES users(username),
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

CREATE OR REPLACE function threadsaccess_auto_timestamp()
RETURNS TRIGGER AS $$
BEGIN
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

CREATE OR REPLACE function threads_auto_status()
RETURNS TRIGGER AS $$
DECLARE
userrole   VARCHAR(20);
BEGIN
    SELECT role INTO userrole
    FROM users INNER JOIN usergroups USING(groupname)
    WHERE username = NEW.senderID;

    IF NEW.isExternal = FALSE THEN
        RETURN NEW;
    END IF;

    IF userrole = 'CONTESTANT' THEN
        UPDATE threads SET status = 'Awaiting Answer' WHERE threads.id = NEW.threadID;
    ELSE
        UPDATE threads SET status = NEW.contents WHERE threads.id = NEW.threadID;
    END IF;
    RETURN NEW;
END; $$
LANGUAGE plpgsql;


CREATE TRIGGER messages_timestamp
BEFORE UPDATE OR INSERT ON messages
FOR EACH ROW
EXECUTE PROCEDURE messages_auto_timestamp();

CREATE TRIGGER threads_timestamp
BEFORE UPDATE OR INSERT ON threads
FOR EACH ROW
EXECUTE PROCEDURE threads_auto_timestamp();

CREATE TRIGGER threads_status
BEFORE UPDATE OR INSERT ON messages
FOR EACH ROW
EXECUTE PROCEDURE threads_auto_status();


CREATE TABLE threadsaccess (
    threadID INTEGER NOT NULL REFERENCES threads(id),
    groupname VARCHAR(50) NOT NULL REFERENCES usergroups(groupname),
    PRIMARY KEY (threadID, groupname)
);


CREATE TRIGGER threadsaccess_timestamp
BEFORE UPDATE OR INSERT ON threadsaccess
FOR EACH ROW
EXECUTE PROCEDURE threadsaccess_auto_timestamp();