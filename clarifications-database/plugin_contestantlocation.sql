DROP TABLE IF EXISTS plugin_seat CASCADE;
DROP TABLE IF EXISTS plugin_userlocation CASCADE;

CREATE TABLE plugin_seat (
    seatname VARCHAR(50) PRIMARY KEY NOT NULL,
    locationText VARCHAR(100),
    map VARCHAR(100) NOT NULL,
    x1 INTEGER NOT NULL,
    y1 INTEGER NOT NULL,
    x2 INTEGER NOT NULL,
    y2 INTEGER NOT NULL
);

CREATE TABLE plugin_userlocation (
    username VARCHAR(50) PRIMARY KEY REFERENCES users(username),
    seatname VARCHAR(50) NOT NULL REFERENCES plugin_seat(seatname)
);
