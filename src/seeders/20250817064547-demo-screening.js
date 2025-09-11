"use strict";
//only run to demo

export default {
  async up(queryInterface, Sequelize) {
    const typeRooms = ["A", "A", "A", "B", "B", "B", "B", "C", "C", "C", "C"];
    const rooms = Array.from({ length: 10 }, (_, i) => `R${i + 1}`);

    const now = new Date();
    function getFilmTime(i) {
      let filmTime = new Date(now);
      filmTime.setMinutes(
        filmTime.getMinutes() + 180 * Math.floor(i / rooms.length)
      );
      return filmTime;
    }

    const screenings = Array.from({ length: 80 }).map((_, i) => ({
      movies_id: Math.floor(Math.random() * 7) + 1,
      theater_id: 1,
      room: rooms[i % rooms.length],
      type_of_room: typeRooms[i % rooms.length],
      date: getFilmTime(i),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert("Screenings", screenings, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Screenings", null, {});
  },
};
