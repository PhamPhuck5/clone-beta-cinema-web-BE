import screeningServices from "../services/baseService/screeningServices.js";
import emptySeatCacheService from "../services/cacheScreeningService.js";
import seatServices from "../services/cacheSeat.js";
let handleImportScreening = async (req, res) => {
  try {
    // Todo add admin rights to add movies
    let newScreeningData = {
      movie: req.body.name,
      theater: req.body.theater,
      room: req.body.room,
      type_of_room: req.body.type_of_room, // just A,B,C
      date: new Date(req.body.date), //vd 2025-08-12T14:30:00+07:00
    };
    newScreeningData = await screeningServices.existMovieAndTheater(
      newScreeningData
    );
    if (!newScreeningData) {
      return res.status(400).json({
        status: 400,
        message: "wrong movie or theater name",
      });
    }
    if (
      await screeningServices.isBusy(
        newScreeningData.date,
        newScreeningData.movie_id,
        newScreeningData.theater_id,
        newScreeningData.room
      )
    ) {
      return res.status(400).json({
        status: 400,
        message: "the room used in this time",
      });
    }
    console.log("input oke");

    let newMovie = await screeningServices.createNewScreening(newScreeningData);
    return res.status(200).json({
      status: 200,
      message: "new screening created",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};

let handleFindScreening = async (req, res) => {
  try {
    let nextScreening = await screeningServices.findScreeningByMovie(
      req.query.movieID,
      req.query.theater
    );

    let returnData = await Promise.all(
      nextScreening.map(async (m) => ({
        room: m.room,
        typeOfRoom: m.type_of_room,
        date: m.date,
        screeningID: m.id,
        freeSeat: await emptySeatCacheService.getEmptySeat(m.id),
      }))
    );
    console.log("tim thay " + returnData.length);

    return res.status(200).json({
      status: 200,
      message: "screening found",
      totalItems: returnData.length,
      data: returnData,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};

let handleFindScreeningById = async (req, res) => {
  try {
    let nextScreening = await screeningServices.findScreeningByID(req.query.id);

    return res.status(200).json({
      status: 200,
      message: "screening found",
      data: nextScreening,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};

let handleFindScreeningStatus = async (req, res) => {
  try {
    let screeningStatus = await seatServices.getScreeningStatus(req.query.id);
    let choosedSeats = await seatServices.getUserBookingStatus(
      req.query.id,
      req.user.id
    );
    let price = await seatServices.getPrice(req.query.id, req.user.id);
    return res.status(200).json({
      status: 200,
      message: "screening found",
      data: {
        status: Array.from(screeningStatus),
        selectedSeat: JSON.stringify(choosedSeats),
        price: price,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};

let handleSelectSeat = async (req, res) => {
  try {
    console.log("start select seat number: " + req.body.seatNumber);
    let chooseSeatStatus = await seatServices.chooseSeat(
      req.body.screeningID,
      req.body.seatNumber,
      req.user.id
    );
    let screeningStatus = await seatServices.getScreeningStatus(
      req.body.screeningID
    );
    let price = await seatServices.getPrice(req.body.screeningID, req.user.id);

    return res.status(200).json({
      status: 200,
      message: "choose seat process:" + chooseSeatStatus,
      data: {
        choosed: chooseSeatStatus,
        newStatus: Array.from(screeningStatus),
        price: price,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};
let handleUnselectSeat = async (req, res) => {
  try {
    let unchooseSeatStatus = await seatServices.unchooseSeat(
      req.body.screeningID,
      req.body.seatNumber,
      req.user.id
    );
    let screeningStatus = await seatServices.getScreeningStatus(
      req.body.screeningID
    );
    let price = await seatServices.getPrice(req.body.screeningID, req.user.id);

    return res.status(200).json({
      status: 200,
      message: "unchoose seat process:" + unchooseSeatStatus,
      data: {
        unchoosed: unchooseSeatStatus,
        newStatus: Array.from(screeningStatus),
        price: price,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};

const screnningControler = {
  handleImportScreening: handleImportScreening,
  handleFindScreening: handleFindScreening,
  handleFindScreeningById: handleFindScreeningById,
  handleFindScreeningStatus: handleFindScreeningStatus,
  handleSelectSeat: handleSelectSeat,
  handleUnselectSeat: handleUnselectSeat,
};
export default screnningControler;
