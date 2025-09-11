"use strict";
//this one because of beta let user see movie screening in other theater not the watching one
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Movies", "status", {
      type: Sequelize.ENUM("screening", "speical", "upcoming", "stoped"),
      allowNull: false,
      defaultValue: "screening",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Movies", "status");
  },
};
