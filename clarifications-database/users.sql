DROP TABLE IF EXISTS usergroups CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE usergroups (
    groupname VARCHAR(50) PRIMARY KEY,
    role VARCHAR(20) NOT NULL,
    CHECK (role IN ('CONTESTANT', 'COMMITTEE', 'SUPPORT'))
);

CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    displayname TEXT NOT NULL,
    password VARCHAR(100) NOT NULL,
    groupname VARCHAR(20) NOT NULL REFERENCES usergroups(groupname),
    token VARCHAR(64)
);

