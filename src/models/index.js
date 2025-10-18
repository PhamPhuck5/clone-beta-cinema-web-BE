"use strict";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sequelize from "../config/connectDB.js";
import { DataTypes } from "sequelize";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = {};

const files = fs.readdirSync(__dirname).filter((file) => {
  const basename = path.basename(__filename);
  return (
    file.indexOf(".") !== 0 &&
    file !== basename &&
    file.slice(-3) === ".js" &&
    file.indexOf(".test.js") === -1
  );
});

for (const file of files) {
  const modelModule = await import(path.join("file://", __dirname, file));
  const model = modelModule.default(sequelize, DataTypes);
  db[model.name] = model;
}

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

export default db;
