import { limits } from "./limits"

const regions = limits.messages.regions.map(r => `'${r}'`).join(", ")
const colors = limits.messages.colors.map(r => `'${r}'`).join(", ")
const states = limits.users.states.map(r => `'${r}'`).join(", ")

const sqlAddConstraints = `
  ALTER TABLE messages ADD CONSTRAINT region_check
    CHECK (region IN (${regions}));
  ALTER TABLE messages ADD CONSTRAINT district_check
    CHECK (district BETWEEN ${limits.messages.districtMin} AND ${limits.messages.districtMax});
  ALTER TABLE messages ADD CONSTRAINT room_check
    CHECK (room BETWEEN ${limits.messages.roomMin} AND ${limits.messages.roomMax});
  ALTER TABLE messages ADD CONSTRAINT index_check
    CHECK (index BETWEEN ${limits.messages.indexMin} AND ${limits.messages.indexMax});
  ALTER TABLE messages ALTER COLUMN text TYPE VARCHAR(${limits.messages.textLenMax}),
    ALTER COLUMN text SET NOT NULL;
  ALTER TABLE messages ADD CONSTRAINT text_check
    CHECK (LENGTH(text) >= ${limits.messages.textLenMin});
  ALTER TABLE messages ADD CONSTRAINT color_check
    CHECK (color IN (${colors}));
  ALTER TABLE users ALTER COLUMN login TYPE VARCHAR(${limits.users.loginLenMax}),
    ALTER COLUMN login SET NOT NULL;
  ALTER TABLE users ADD CONSTRAINT login_check
    CHECK (LENGTH(login) >= ${limits.users.loginLenMin} AND 
    login ~ '${limits.users.loginPattern}');
  ALTER TABLE users ALTER COLUMN name TYPE VARCHAR(${limits.users.nameLenMax}),
    ALTER COLUMN name SET NOT NULL;
  ALTER TABLE users ADD CONSTRAINT name_check
    CHECK (LENGTH(name) >= ${limits.users.nameLenMin});
  ALTER TABLE users ADD CONSTRAINT state_check
    CHECK (state IN (${states}));
`

const sqlDeleteConstraints = `
  ALTER TABLE messages DROP CONSTRAINT IF EXISTS region_check;
  ALTER TABLE messages DROP CONSTRAINT IF EXISTS district_check;
  ALTER TABLE messages DROP CONSTRAINT IF EXISTS room_check;
  ALTER TABLE messages DROP CONSTRAINT IF EXISTS index_check;
  ALTER TABLE messages DROP CONSTRAINT IF EXISTS text_check;
  ALTER TABLE messages DROP CONSTRAINT IF EXISTS color_check;
  ALTER TABLE users DROP CONSTRAINT IF EXISTS login_check;
  ALTER TABLE users DROP CONSTRAINT IF EXISTS name_check;
  ALTER TABLE users DROP CONSTRAINT IF EXISTS state_check;
`

const sqlCreateTables = `
  CREATE TABLE IF NOT EXISTS messages (
    region VARCHAR NOT NULL,
    district INTEGER NOT NULL,
    room INTEGER NOT NULL,
    index INTEGER NOT NULL,
    text VARCHAR(${limits.messages.textLenMax}) NOT NULL,
    color VARCHAR NOT NULL,
    userid UUID,
    timestamp BIGINT NOT NULL,
    PRIMARY KEY(region, district, room, index),
    UNIQUE(region, district, room, index)
  );
  CREATE TABLE IF NOT EXISTS users (
    userid UUID NOT NULL PRIMARY KEY,
    region VARCHAR NOT NULL,
    login VARCHAR(${limits.users.loginLenMax}) NOT NULL,
    password CHAR(${limits.users.passwordHashSize}) NOT NULL,
    name VARCHAR(${limits.users.nameLenMax}) NOT NULL,
    state VARCHAR NOT NULL,
    puid UUID NOT NULL,
    timestamp BIGINT NOT NULL,
    UNIQUE(userid),
    UNIQUE(puid),
    UNIQUE(login)
  );
  CREATE TABLE IF NOT EXISTS sessions (
    userid UUID NOT NULL,
    sessionid CHAR(${limits.sessions.sessionidHashSize}) NOT NULL,
    timestamp BIGINT NOT NULL,
    PRIMARY KEY(userid),
    UNIQUE(userid),
    UNIQUE(sessionid)
  );
  CREATE INDEX IF NOT EXISTS idx_messages_timestamp 
    ON messages(timestamp);
  CREATE INDEX IF NOT EXISTS idx_users_timestamp
    ON users(timestamp);
  CREATE INDEX IF NOT EXISTS idx_sessions_timestamp
    ON sessions(timestamp);
  ${sqlDeleteConstraints}
  ${sqlAddConstraints}
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

const sqlResetConstraints = `
  ${sqlDeleteConstraints}
  ${sqlAddConstraints}
`

export const sql = {
  createTables: sqlCreateTables,
  resetTables: sqlResetTables,
  deleteTables: sqlDeleteTables,
  resetConstraints: sqlResetConstraints,
}


