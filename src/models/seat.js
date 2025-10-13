// models/user.js
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Seat extends Model {
    static associate(models) {
      // define association here
      this.belongsTo(models.Order, {
        foreignKey: "order_id",
      });
    }
  }

  Seat.init(
    {
      order_id: {
        type: DataTypes.INTEGER,
        index: true,
      },
      seat_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Seat",
      tableName: "seats",
    }
  );

  return Seat;
};
