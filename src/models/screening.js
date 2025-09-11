import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Screening extends Model {
    static associate(models) {
      // define association here
      this.belongsTo(models.Movie, {
        foreignKey: "movies_id",
      });
      this.belongsTo(models.Theater, {
        foreignKey: "theater_id",
      });

      this.hasMany(models.Order, {
        foreignKey: "screening_id",
      });
      this.hasMany(models.FinishedOrder, {
        foreignKey: "screening_id",
      });
    }
  }

  Screening.init(
    {
      movies_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      theater_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      room: {
        type: DataTypes.CHAR(5),
        allowNull: false,
      },
      //break 3nf
      //in case of each room have diffirent seat possitions can use another table
      type_of_room: {
        type: DataTypes.ENUM("A", "B", "C"),
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        // get() {
        //   const rawDate = this.getDataValue("date");
        //   if (!rawDate) return null;
        //   // Chuyển sang VN timezone (+07:00)
        //   const vnDate = new Date(rawDate.getTime() + 7 * 60 * 60 * 1000);
        //   return vnDate;
        // },
      },
    },
    {
      sequelize,
      modelName: "Screening",
      tableName: "screenings",
    }
  );

  return Screening;
};
