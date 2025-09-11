"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "isAdmin", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // 👈 mặc định là false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "isAdmin");
  },
};
