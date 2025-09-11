// models/user.js
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class FinishedOrder extends Model {
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

  FinishedOrder.init(
    {
      screening_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      seat_number: {
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
      modelName: "FinishedOrder",
      tableName: "finished_orders",
    }
  );

  return FinishedOrder;
};
