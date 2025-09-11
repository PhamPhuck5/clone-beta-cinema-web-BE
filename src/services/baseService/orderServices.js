import order from "../../models/order.js";
import db from "../../models/index.js";
import cacheScreeningService from "../cacheScreeningService.js";
import seatServices from "../cacheSeat.js";
import { Op } from "sequelize";

async function createNewOrder(newOrderData) {
  const newOrder = await db.Order.create({
    screening_id: newOrderData.screening_id,
    user_id: newOrderData.user_id,
    seat_number: newOrderData.seat_number,
    date: newOrderData.date || null,
  });
  return newOrder;
}
async function createNewFoodOrder(newOrderData) {
  const newOrder = await db.Order.create({
    screening_id: newOrderData.screening_id,
    user_id: newOrderData.user_id,
    quantity: newOrderData.quantity,
    type_combo: newOrderData.type_combo,
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
async function findOldOrderByID(id) {
  const Order = await db.FinishedOrder.findOne({
    where: { id: id },
  });
  return Order;
}
//*in error
async function rawRefreshNewOrder() {
  const t = await db.transaction();
  try {
    await sequelize.query(
      `
      SET @now := NOW();
      INSERT IGNORE INTO finished_orders
      SELECT *
      FROM orders o
      WHERE EXISTS(
        SELECT 1 FROM screenings s
        WHERE s.id = o.screening_id
          AND s.date < @now
      );

      DELETE o
      FROM orders o
      JOIN screenings s ON s.id = o.screening_id
      WHERE s.date < @now;
    `,
      { transaction: t }
    );

    await t.commit();
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

async function refreshNewOrder() {
  const current = new Date();
  const Order = await db.Order.findAll({
    include: [
      {
        model: db.Screening,
        required: false,
        where: {
          date: {
            [Op.gt]: current,
          },
        },
      },
    ],
  });
  Order.map(async (finishedOrder) => {
    db.FinishedOrder.create({
      screening_id: finishedOrder.screening_id,
      user_id: finishedOrder.user_id,
      seat_number: finishedOrder.seat_number,
      date: finishedOrder.date || null,
    });
  });
  return;
}

async function findNumberBusySeatByScreeningID(screeningId) {
  const count = await db.Order.count({
    where: { screening_id: screeningId },
  });
  return count;
}
async function findBusySeatByScreeningID(screeningId) {
  const seats = await db.Order.findAll({
    attributes: ["seat_number"],
    where: { screening_id: screeningId },
    order: [["seat_number", "ASC"]],
    raw: true,
  });

  return seats;
}

async function makeOrders(userId, screeningId, combos) {
  const seats = await seatServices.getUserBookingStatus(screeningId, userId);
  await seatServices.buySeats(screeningId, userId);
  console.log("working to buy seat:" + seats);
  seats.forEach((seatNumber) => {
    createNewOrder({
      screening_id: screeningId,
      user_id: userId,
      seat_number: seatNumber,
      date: new Date(),
    });
  });

  combos.forEach((combo) => {
    if (combo.quantity != 0) {
      createNewFoodOrder({
        screening_id: screeningId,
        user_id: userId,
        type_combo: combo.type_combo,
        quantity: combo.quantity,
        date: new Date(),
      });
    }
  });
  cacheScreeningService.cacheBeWrong(screeningId);
}

const orderServices = {
  createNewOrder: createNewOrder,
  removeOrderByID: removeOrderByID,
  removeMovieByInstance: removeMovieByInstance,
  findNewOrderByID: findNewOrderByID,
  findOldOrderByID: findOldOrderByID,
  refreshNewOrder: rawRefreshNewOrder,
  findNumberBusySeatByScreeningID: findNumberBusySeatByScreeningID,
  findBusySeatByScreeningID: findBusySeatByScreeningID,
  makeOrders: makeOrders,
};
export default orderServices;
