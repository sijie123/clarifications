DROP TABLE IF EXISTS threads;
DROP TABLE IF EXISTS threadgroups;

CREATE TABLE threads (
    id SERIAL PRIMARY KEY,
    rootMessage INTEGER NOT NULL REFERENCES messages(id),
    contestantID VARCHAR(50) REFERENCES users(username),
    creatorID VARCHAR(50) REFERENCES users(username),
    UNIQUE (rootMessage)
)

CREATE TABLE threadgroups (
    threadid INTEGER NOT NULL REFERENCES threads(id),
    role VARCHAR(20) NOT NULL,
    PRIMARY KEY(threadid, role),
    CHECK (role IN ('CONTESTANT', 'COMMITTEE', 'SUPPORT')) 
)