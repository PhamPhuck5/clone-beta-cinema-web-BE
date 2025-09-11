import db from "../../models/index.js";
import { where } from "sequelize";

async function findScreeningByID(id) {
  const screening = await db.Screening.findOne({
    include: [
      {
        model: db.Movie,
        attributes: [
          "id",
          "name",
          "name_en",
          "genre",
          "genre_en",
          "running_time",
        ],
      },
    ],
    where: { id: id },
    attributes: ["room", "type_of_room", "date"],
  });
  return screening.toJSON();
}

const typeA = {
  totalSeat: 191,
  seatNumber: [71, 120, 0],
  price: [40, 65, 90],
};
const typeB = {
  totalSeat: 155,
  seatNumber: [55, 93, 5],
  price: [40, 65, 90],
};
const typeC = {
  totalSeat: 155,
  seatNumber: [55, 93, 5],
  price: [60, 85, 130],
};
export const roomByType = {
  A: typeA,
  B: typeB,
  C: typeC,
};
const getRoomMaxSeat = async (id) => {
  const screeningInfo = await findScreeningByID(id);
  const typeOfRoom = screeningInfo.type_of_room;
  const roomInfo = roomByType[typeOfRoom];
  return roomInfo.totalSeat - 1;
};

const getPrice = async (id, seatArray) => {
  const screeningInfo = await findScreeningByID(id);
  const typeOfRoom = screeningInfo.type_of_room;
  const roomInfo = roomByType[typeOfRoom];
  let roomPrice = roomInfo.price;
  let seatType = roomInfo.seatNumber;
  let price = 0;

  seatArray.forEach((element) => {
    if (element < seatType[0]) {
      price += roomPrice[0];
    } else if (element < seatType[0] + seatType[1]) {
      price += roomPrice[1];
    } else {
      price += roomPrice[2];
    }
  });
  return price;
};
const roomServices = {
  getRoomMaxSeat: getRoomMaxSeat,
  getPrice: getPrice,
};
export default roomServices;
