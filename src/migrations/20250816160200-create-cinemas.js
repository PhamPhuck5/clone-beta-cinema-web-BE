"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert("Theaters", [
      { name: "Beta Thanh Xuan Ha Noi", createdAt: now, updatedAt: now },
      { name: "Beta My Dinh Ha Noi", createdAt: now, updatedAt: now },
      { name: "Beta Dan Phuong Ha Noi", createdAt: now, updatedAt: now },
      { name: "Beta Giai Phong Ha Noi", createdAt: now, updatedAt: now },
      { name: "Beta Xuan Thuy Ha Noi", createdAt: now, updatedAt: now },
      { name: "Beta Tay Son Ha Noi", createdAt: now, updatedAt: now },
      { name: "Beta Quang Trung Ho Chi Minh", createdAt: now, updatedAt: now },
      {
        name: "Beta Ung Van Khiem Ho Chi Minh",
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Beta Tran Quang Khai Ho Chi Minh",
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Beta Empire Binh Duong Ho Chi Minh",
        createdAt: now,
        updatedAt: now,
      },
      { name: "Beta Tan Uyen Ho Chi Minh", createdAt: now, updatedAt: now },
      { name: "Beta Ho Tram Ho Chi Minh", createdAt: now, updatedAt: now },
      { name: "Beta TRMall Phu Quoc An Giang", createdAt: now, updatedAt: now },
      { name: "Beta Bien Hoa Dong Nai", createdAt: now, updatedAt: now },
      { name: "Beta Long Khanh Dong Nai", createdAt: now, updatedAt: now },
      { name: "Beta Khanh Hoa Khanh Hoa", createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Theaters", {
      name: [
        "Beta Thanh Xuan Ha Noi",
        "Beta My Dinh Ha Noi",
        "Beta Dan Phuong Ha Noi",
        "Beta Giai Phong Ha Noi",
        "Beta Xuan Thuy Ha Noi",
        "Beta Tay Son Ha Noi",
        "Beta Quang Trung Ho Chi Minh",
        "Beta Ung Van Khiem Ho Chi Minh",
        "Beta Tran Quang Khai Ho Chi Minh",
        "Beta Empire Binh Duong Ho Chi Minh",
        "Beta Tan Uyen Ho Chi Minh",
        "Beta Ho Tram Ho Chi Minh",
        "Beta TRMall Phu Quoc An Giang",
        "Beta Bien Hoa Dong Nai",
        "Beta Long Khanh Dong Nai",
        "Beta Khanh Hoa Khanh Hoa",
      ],
    });
  },
};
