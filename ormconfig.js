// @ts-check

require('dotenv').config();

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

if (!DB_HOST || !DB_PORT || !DB_USERNAME || !DB_PASSWORD || !DB_NAME) {
  throw new Error('Missing required env variables for database')
}

/** @type {import('typeorm').ConnectionOptions} */
const ormConfig = {
  type: 'postgres',
  host: DB_HOST,
  port: +DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  entities: ["dist/**/*.entity.js"],
  migrationsTableName: "migrations",
  migrations: ["dist/migrations/*.js"],
  cli: {
    migrationsDir: "src/migrations"
  },
  logging: process.env.NODE_ENV === 'development'
};

module.exports = ormConfig;
