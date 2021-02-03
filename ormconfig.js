module.exports = {
  name: process.env.PG_CON_NAME,
  type: process.env.PG_DB_TYPE,
  host: process.env.PG_DB_HOST,
  port: parseInt(process.env.PG_DB_PORT),
  username: process.env.PG_DB_USER,
  password: process.env.PG_DB_PASSWORD,
  database: process.env.PG_DB,
  synchronize: process.env.PG_DB_SYNC == 'true' ? true : false,
  logging: process.env.PG_DB_LOG == 'true' ? true : false,
  migrationsRun: process.env.PG_DB_MIG_RUN,
  entities: [process.env.PG_DB_ENTITIES],
  migrations: [process.env.PG_DB_MIG],
  cli: {
    migrationsDir: process.env.PG_DB_MIG_CLI_DIR,
  },
};
