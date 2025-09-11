// models/user.js
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Movie extends Model {
    static associate(models) {
      // define association here
      this.hasMany(models.Screening, {
        foreignKey: "movies_id",
      });
    }
  }

  Movie.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name_en: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      content_en: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      //cause we dont have search function so dont need another table for genre,...
      director: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cast: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      genre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      genre_en: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      running_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Release_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("screening", "speical", "upcoming", "stoped"),
        allowNull: false,
      },
      triler_link: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Movie",
      tableName: "movies",
    }
  );

  return Movie;
};
