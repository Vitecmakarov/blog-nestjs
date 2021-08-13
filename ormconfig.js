const logging = process.env.DB_LOGGING === 'true';
const synchronize = process.env.DB_SYNCHRONIZE === 'true';
const migrationsRun = process.env.DB_MIGRATIONS_RUN === 'true';

module.exports = {
  "type": process.env.DB_TYPE || "mysql",
  "host": process.env.DB_HOST || "localhost",
  "port": Number(process.env.DB_PORT) || 3306,
  "username": process.env.DB_USER || "root",
  "password": process.env.DB_PASSWORD || "root",
  "database": process.env.DB_NAME || "nestjs_blog",
  "charset": process.env.DB_CHARSET || "utf8",
  "logging": logging || true,
  "entities": [process.env.DB_ENTITIES] || ["dist/**/*.entity{.ts,.js}"],
  "migrations": [process.env.DB_MIGRATIONS] || ["dist/migrations/*{.ts,.js}"],
  "cli": {
    "migrationsDir": process.env.DB_MIGRATIONS_DIR || "migrations"
  },
  "migrationsRun": synchronize || false,
  "synchronize": migrationsRun || true,
};