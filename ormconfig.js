module.exports = {
  "type": process.env.DB_TYPE || "mysql",
  "host": process.env.DB_HOST || "localhost",
  "port": process.env.DB_PORT || 3306,
  "username": process.env.DB_USER || "root",
  "password": process.env.DB_PASSWORD || "root",
  "database": process.env.DB_NAME || "nestjs_blog",
  "entities": [process.env.ENTITIES] || ["dist/**/*.entity{.ts,.js}"],
  "synchronize": process.env.SYNCHRONIZE || true,
  "charset": "utf8"
};
