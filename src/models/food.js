// models/user.js
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Food extends Model {
    static associate(models) {
      // define association here
      this.belongsTo(models.Screening, {
        foreignKey: "screening_id",
        as: "Screening",
      });
      this.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "User",
      });
    }
  }

  Food.init(
    {
      screening_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type_combo: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Food",
      tableName: "foods",
    }
  );

  return Food;
};
