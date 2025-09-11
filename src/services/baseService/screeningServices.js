import db from "../../models/index.js";
import { Op, fn, where } from "sequelize";

import theaterServices from "./theaterServices.js";
import movieServices from "./movieServices.js";
import orderServices from "./orderServices.js";
import emptySeatCacheService from "../cacheScreeningService.js";

// import { addJob } from "../renewOrderService.js";
async function existMovieAndTheater(screeningData) {
  console.log("checking movie and theater input");
  let theaterID = await theaterServices.getTheaterID(screeningData.theater);
  let movie = await movieServices.findMovieByName(screeningData.movie);
  if (movie && theaterID) {
    screeningData.movie_id = movie.id;
    screeningData.theater_id = theaterID;
    return screeningData;
  }
  if (!movieID) console.log("dont found movie");
  if (!theaterID) console.log("dont found theater");
  return null;
}
async function isBusy(date, movieID, theaterID, room) {
  console.log("checking does the room busy");

  let nextScreening = await db.Screening.findOne({
    where: {
      theater_id: theaterID,
      room: room,
      date: {
        [Op.gt]: date,
      },
    },
    order: [["date", "ASC"]],
  });
  if (nextScreening) {
    let movie = await movieServices.findMovieByID(movieID);
    let movieTime = movie.running_time;
    let endDate = new Date(date);

    endDate.setMinutes(endDate.getMinutes() + movieTime);
    if (endDate > new Date(nextScreening.date)) {
      return true;
    }
  }

  let lastScreening = await db.Screening.findOne({
    where: {
      theater_id: theaterID,
      room: room,
      date: {
        [Op.lt]: date,
      },
    },
    order: [["date", "DESC"]],
  });
  if (lastScreening) {
    let movie = await movieServices.findMovieByID(lastScreening.movieID);
    let movieTime = movie.running_time;
    let endDate = new Date(lastScreening.date);
    endDate.setMinutes(endDate.getMinutes() + movieTime);
    if (endDate > date) {
      return true;
    }
  }
  return false;
}

async function createNewScreening(newScreeningData) {
  const newScreening = await db.Screening.create({
    movies_id: newScreeningData.movie_id,
    theater_id: newScreeningData.theater_id,
    room: newScreeningData.room,
    type_of_room: newScreeningData.type_of_room,
    date: newScreeningData.date,
  });
  // await addJob(newScreeningData.date);
  return newScreening;
}

async function removeScreeningByID(id) {
  await db.Screening.destroy({ where: { id: id } });
}
async function removeScreeningByInstance(instance) {
  if (instance) {
    await instance.destroy();
  }
}

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

async function findScreeningByMovie(movieID, theaterName) {
  let theaterID = await theaterServices.getTheaterID(theaterName);

  const screening = await db.Screening.findAll({
    where: {
      movies_id: movieID,
      theater_id: theaterID,
      date: {
        [Op.gt]: fn("NOW"),
      },
    },
  });
  return screening;
}
async function findScreeningsInDay(movieID, theaterID, day) {
  // dayString "YYYY-MM-DD"
  const [year, month, date] = day.split("-").map(Number);

  const startOfDayVN = new Date(Date.UTC(year, month - 1, date, -7, 0, 0));
  let start = new Date() > startOfDayVN ? new Date() : startOfDayVN;
  const endOfDayVN = new Date(Date.UTC(year, month - 1, date, 16, 59, 59));

  const screening = await db.Screening.findAll({
    where: {
      movies_id: movieID,
      theater_id: theaterID,
      date: {
        [Op.between]: [start, endOfDayVN],
      },
    },
  });
  return await Promise.all(
    screening.map(async (m) => ({
      room: m.room,
      typeOfRoom: m.type_of_room,
      date: m.date,
      screeningID: m.id,
      freeSeat: await emptySeatCacheService.getEmptySeat(m.id),
    }))
  );
}
async function findNextScreening() {
  const result = await Screening.findOne({
    where: {
      date: {
        [Op.gt]: fn("NOW"),
      },
    },
    order: [["date", "ASC"]],
    attributes: ["date"],
  });
  return result ? result.date : null;
}
async function findNumberEmptySeat(screeningID) {
  let numberBusySeat = await orderServices.findNumberBusySeatByScreeningID(
    screeningID
  );
  let typeOfRoom = (await findScreeningByID(screeningID)).type_of_room;
  let totalSeat = -1;
  switch (typeOfRoom) {
    case "A":
      totalSeat = 191;
      break;
    case "B":
      totalSeat = 158;
      break;
    case "C":
      totalSeat = 158;
      break;
    default:
      new Error("wrong type of room from db");
  }
  return totalSeat - numberBusySeat;
}

const screeningServices = {
  existMovieAndTheater: existMovieAndTheater,
  isBusy: isBusy,
  createNewScreening: createNewScreening,
  removeScreeningByID: removeScreeningByID,
  removeScreeningByInstance: removeScreeningByInstance,
  findScreeningByID: findScreeningByID,
  findScreeningByMovie: findScreeningByMovie,
  findNextScreening: findNextScreening,
  findNumberEmptySeat: findNumberEmptySeat,
  findScreeningsInDay: findScreeningsInDay,
};
export default screeningServices;
