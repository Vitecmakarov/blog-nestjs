module.exports = {
  "type": "mysql",
  "host": process.env.DB_HOST || "localhost",
  "port": process.env.DB_PORT || 3306,
  "username": process.env.DB_USER || "root",
  "password": process.env.DB_PASSWORD || "root",
  "database": process.env.DB_NAME || "nestjs_blog",
  "entities": ["dist/**/*.entity{.ts,.js}"],
  "synchronize": true
};
