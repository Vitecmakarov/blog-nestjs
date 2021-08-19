require('dotenv').config({ path: `./env/.env.${process.env.NODE_ENV}` });

const LOGGING = process.env.DB_LOGGING === 'true';
const SYNCHRONIZE = process.env.DB_SYNCHRONIZE === 'true';
const MIGRATIONS_RUN = process.env.DB_MIGRATIONS_RUN === 'true';

module.exports = Object.freeze({
  "type": process.env.DB_TYPE,
  "host": process.env.DB_HOST,
  "port": Number(process.env.DB_PORT),
  "username": process.env.DB_USER,
  "password": process.env.DB_PASSWORD,
  "database": process.env.DB_NAME,
  "charset": process.env.DB_CHARSET,
  "logging": LOGGING,
  "entities": [process.env.DB_ENTITIES],
  "migrations": [process.env.DB_MIGRATIONS],
  "cli": {
    "migrationsDir": process.env.DB_MIGRATIONS_DIR
  },
  "migrationsRun": SYNCHRONIZE,
  "synchronize": MIGRATIONS_RUN,
});
