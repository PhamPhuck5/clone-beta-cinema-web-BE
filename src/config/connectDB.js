import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize("test_db", "root", process.env.DB_PASSWORD, {
  host: "host.docker.internal",
  dialect: "mysql",
});

export const checkConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("connect to myssql success!");
  } catch (error) {
    console.error("can't connect to myssql:", error);
    process.exit(1);
  }
};

export default sequelize;
