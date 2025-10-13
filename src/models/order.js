// models/user.js
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Order extends Model {
    static associate(models) {
      // define association here
      this.belongsTo(models.Screening, {
        foreignKey: "screening_id",
      });
      this.belongsTo(models.User, {
        foreignKey: "user_id",
      });
      this.hasMany(models.Food, {
        foreignKey: "order_id",
      });
      this.hasMany(models.Seat, {
        foreignKey: "order_id",
      });
    }
  }

  Order.init(
    {
      screening_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
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
      modelName: "Order",
      tableName: "orders",
    }
  );

  return Order;
};
