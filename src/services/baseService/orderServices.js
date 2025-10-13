import order from "../../models/order.js";
import db from "../../models/index.js";
import cacheScreeningService from "../cacheScreeningService.js";
import seatServices from "../cacheSeat.js";
import { Op } from "sequelize";

async function createNewOrder(newOrderData) {
  const newOrder = await db.Order.create({
    screening_id: newOrderData.screening_id,
    user_id: newOrderData.user_id,
    date: newOrderData.date || null,
  });
  return newOrder;
}

async function removeOrderByID(id) {
  await db.Order.destroy({ where: { id: id } });
}
async function removeMovieByInstance(instance) {
  if (instance) {
    await instance.destroy();
  }
}

async function findNewOrderByID(id) {
  const Order = await db.Order.findOne({
    where: { id: id },
  });
  return Order;
}
// async function findOldOrderByID(id) {
//   const Order = await db.FinishedOrder.findOne({
//     where: { id: id },
//   });
//   return Order;
// }

//*in error
// async function rawRefreshNewOrder() {
//   const t = await db.sequelize.transaction();
//   try {
//     await sequelize.query(
//       `
//       SET @now := NOW();
//       INSERT IGNORE INTO finished_orders
//       SELECT *
//       FROM orders o
//       WHERE EXISTS(
//         SELECT 1 FROM screenings s
//         WHERE s.id = o.screening_id
//           AND s.date < @now
//       );

//       DELETE o
//       FROM orders o
//       JOIN screenings s ON s.id = o.screening_id
//       WHERE s.date < @now;
//     `,
//       { transaction: t }
//     );

//     await t.commit();
//   } catch (err) {
//     await t.rollback();
//     throw err;
//   }
// }

// async function refreshNewOrder() {
//   const current = new Date();
//   const Order = await db.Order.findAll({
//     include: [
//       {
//         model: db.Screening,
//         required: false,
//         where: {
//           date: {
//             [Op.gt]: current,
//           },
//         },
//       },
//     ],
//   });
//   Order.map(async (finishedOrder) => {
//     db.FinishedOrder.create({
//       screening_id: finishedOrder.screening_id,
//       user_id: finishedOrder.user_id,
//       seat_number: finishedOrder.seat_number,
//       date: finishedOrder.date || null,
//     });
//   });
//   return;
// }

async function findNumberBusySeatByScreeningID(screeningId) {
  const count = await db.Seat.count({
    include: [
      {
        model: db.Order,
        attributes: ["id", "screening_id"],
        where: { screening_id: screeningId },
      },
    ],
  });
  return count;
}
async function findBusySeatByScreeningID(screeningId) {
  const seats = await db.Seat.findAll({
    include: [
      {
        model: db.Order,
        where: { screening_id: screeningId },
      },
    ],
    attributes: ["seat_number"],
  });
  return seats;
}

async function makeOrders(userId, screeningId, combos) {
  const seats = await seatServices.getUserBookingStatus(screeningId, userId);
  console.log("working to buy seat:" + seats);
  await seatServices.buySeats(screeningId, userId);

  const order = await createNewOrder({
    screening_id: screeningId,
    user_id: userId,
    date: new Date(),
  });
  const t = await db.sequelize.transaction(); // Bắt đầu một transaction

  try {
    const seatOrderData = seats.map((seatNumber) => ({
      order_id: order.id,
      seat_number: seatNumber,
    }));
    console.log(seatOrderData);
    const foodOrderData = combos
      .filter((combo) => combo.quantity > 0)
      .map((combo) => ({
        order_id: order.id,
        type_combo: combo.type_combo,
        quantity: combo.quantity,
      }));

    if (seatOrderData.length > 0) {
      await db.Seat.bulkCreate(seatOrderData, { transaction: t });
    }
    if (foodOrderData.length > 0) {
      await db.Food.bulkCreate(foodOrderData, { transaction: t });
    }
    await t.commit();
  } catch (error) {
    await t.rollback();
    console.error("can't bulk insert, rollback:", error);
    throw new Error("can't done the order.");
  }
  cacheScreeningService.cacheBeWrong(screeningId);
}

const orderServices = {
  removeOrderByID: removeOrderByID,
  removeMovieByInstance: removeMovieByInstance,
  findNewOrderByID: findNewOrderByID,
  // findOldOrderByID: findOldOrderByID,
  // refreshNewOrder: refreshNewOrder,
  findNumberBusySeatByScreeningID: findNumberBusySeatByScreeningID,
  findBusySeatByScreeningID: findBusySeatByScreeningID,
  makeOrders: makeOrders,
};
export default orderServices;
