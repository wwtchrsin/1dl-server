const sqlCreateTables = `
  CREATE TABLE IF NOT EXISTS messages (
    region VARCHAR NOT NULL,
    district INTEGER NOT NULL,
    room INTEGER NOT NULL,
    index INTEGER NOT NULL,
    text VARCHAR NOT NULL,
    userid UUID,
    timestamp BIGINT NOT NULL,
    PRIMARY KEY(region, district, room, index)
  );
  CREATE TABLE IF NOT EXISTS users (
    userid UUID NOT NULL PRIMARY KEY,
    login VARCHAR NOT NULL,
    password CHAR(128) NOT NULL,
    name VARCHAR NOT NULL,
    timestamp BIGINT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    userid UUID NOT NULL,
    sessionid UUID NOT NULL,
    timestamp BIGINT NOT NULL,
    PRIMARY KEY(userid, sessionid)
  );
  CREATE INDEX IF NOT EXISTS idx_messages_timestamp 
    ON messages(timestamp);
  CREATE INDEX IF NOT EXISTS idx_users_timestamp
    ON users(timestamp);
  CREATE INDEX IF NOT EXISTS idx_sessions_timestamp
    ON sessions(timestamp);
`

const sqlDeleteTables = `
  DROP TABLE IF EXISTS messages;
  DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS sessions;
  DROP INDEX IF EXISTS idx_messages_timestamp;
  DROP INDEX IF EXISTS idx_users_timestamp;
  DROP INDEX IF EXISTS idx_sessions_timestamp;
`

const sqlResetTables = `
  ${sqlDeleteTables}
  ${sqlCreateTables}
`

export const sql = {
  createTables: sqlCreateTables,
  resetTables: sqlResetTables,
  deleteTables: sqlDeleteTables,
}


