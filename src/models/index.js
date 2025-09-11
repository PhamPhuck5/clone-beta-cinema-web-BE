import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { fileURLToPath } from "url";
import Sequelize from "sequelize";
import process from "process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";

//  Nếu config.js là ES Module:
import configObj from "../config.js";
const config = configObj[env];

const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

//  Import tất cả models bằng dynamic import và URL
const files = fs
  .readdirSync(__dirname)
  .filter((file) => file !== basename && file.endsWith(".js"));

for (const file of files) {
  const fullPath = path.join(__dirname, file);
  const fileUrl = pathToFileURL(fullPath).href;

  const { default: modelFunc } = await import(fileUrl);
  const model = modelFunc(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
