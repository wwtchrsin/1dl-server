import { limits, hashSizes } from "./limits"

const regions = limits.message.region.values.map(r => `'${r}'`).join(", ")
const colors = limits.message.color.values.map(r => `'${r}'`).join(", ")
const states = limits.user.state.values.map(r => `'${r}'`).join(", ")

const sqlAddConstraints = `
  ALTER TABLE messages ADD CONSTRAINT region_check
    CHECK (region IN (${regions}));
  ALTER TABLE messages ADD CONSTRAINT tag_check
    CHECK (tag ~ '${limits.message.tag.pattern}');
  ALTER TABLE messages ADD CONSTRAINT index_check
    CHECK (index BETWEEN ${limits.message.index.min} AND ${limits.message.index.max});
  ALTER TABLE messages ALTER COLUMN text TYPE VARCHAR(${limits.message.text.maxLen}),
    ALTER COLUMN text SET NOT NULL;
  ALTER TABLE messages ADD CONSTRAINT text_check
    CHECK (text ~ '${limits.message.text.pattern}');
  ALTER TABLE messages ADD CONSTRAINT color_check
    CHECK (color IN (${colors}));
  ALTER TABLE users ALTER COLUMN login TYPE VARCHAR(${limits.user.login.maxLen}),
    ALTER COLUMN login SET NOT NULL;
  ALTER TABLE users ADD CONSTRAINT login_check
    CHECK (login ~ '${limits.user.login.pattern}');
  ALTER TABLE users ALTER COLUMN name TYPE VARCHAR(${limits.user.name.maxLen}),
    ALTER COLUMN name SET NOT NULL;
  ALTER TABLE users ADD CONSTRAINT name_check
    CHECK (name ~ '${limits.user.name.pattern}');
  ALTER TABLE users ADD CONSTRAINT message_color_check
    CHECK (color IN (${colors}));
  ALTER TABLE users ADD CONSTRAINT state_check
    CHECK (state IN (${states}));
`

const sqlDeleteConstraints = `
  ALTER TABLE messages DROP CONSTRAINT IF EXISTS region_check;
  ALTER TABLE messages DROP CONSTRAINT IF EXISTS tag_check;
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
    tag VARCHAR(${limits.message.tag.maxLen}) NOT NULL,
    index INTEGER NOT NULL,
    text VARCHAR(${limits.message.text.maxLen}) NOT NULL,
    color VARCHAR(12) NOT NULL,
    userid UUID,
    timestamp BIGINT NOT NULL,
    PRIMARY KEY(region, tag, index),
    UNIQUE(region, tag, index)
  );
  CREATE TABLE IF NOT EXISTS users (
    userid UUID NOT NULL PRIMARY KEY,
    region VARCHAR NOT NULL,
    login VARCHAR(${limits.user.login.maxLen}) NOT NULL,
    password CHAR(${hashSizes.password * 2}) NOT NULL,
    name VARCHAR(${limits.user.name.maxLen}) NOT NULL,
    color VARCHAR(12),
    state VARCHAR(16) NOT NULL,
    puid UUID NOT NULL,
    timestamp BIGINT NOT NULL,
    UNIQUE(userid),
    UNIQUE(puid),
    UNIQUE(login)
  );
  CREATE TABLE IF NOT EXISTS sessions (
    userid UUID NOT NULL,
    sessionid CHAR(${hashSizes.sessionid * 2}) NOT NULL,
    deviceid CHAR(${hashSizes.sessionid * 2}) NOT NULL,
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


