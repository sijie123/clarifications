\i users.sql
\i messages.sql
\i plugins.sql

ALTER TABLE users OWNER TO clarificationdb;
ALTER TABLE messages OWNER TO clarificationdb;
ALTER TABLE threads OWNER TO clarificationdb;
ALTER TABLE usergroups OWNER TO clarificationdb;
ALTER TABLE threadsaccess OWNER TO clarificationdb;
