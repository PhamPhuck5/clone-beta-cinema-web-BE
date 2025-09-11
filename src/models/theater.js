// models/user.js
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Theater extends Model {
    static associate(models) {
      this.hasMany(models.Screening, {
        foreignKey: "theater_id",
      });
    }
  }

  Theater.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Theater",
      tableName: "theaters",
    }
  );

  return Theater;
};
