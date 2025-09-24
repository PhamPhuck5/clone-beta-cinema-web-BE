import express from "express";

import multer from "../config/configMulter.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import passport from "../config/oAuthFacebook.js";

import auth from "../controllers/AuthController.js";
import movie from "../controllers/movieControler.js";
import screnning from "../controllers/screeningControler.js";
import order from "../controllers/orderControler.js";
import authControler from "../controllers/AuthController.js";
let router = express.Router();

let initWebRouter = (app) => {
  router.get("/api/movie/screening", movie.handleGetScreeningMovies);
  router.get("/api/movie/infomation", movie.handleGetMoviesById);
  router.get("/api/movie/screeningByDay", movie.handleGetScreeningInTheater);

  router.get("/api/screening/schedule", screnning.handleFindScreening);
  router.get("/api/screening/info", screnning.handleFindScreeningById);
  router.get(
    "/api/screening/status",
    authMiddleware,
    screnning.handleFindScreeningStatus
  );

  router.get("/api/user/info", authMiddleware, auth.hendleGetInfo);
  router.get(
    "/facebook/auth",
    passport.authenticate("facebook", { scope: [""] })
  );
  router.get(
    "/facebook/callback",
    passport.authenticate("facebook", {
      session: false,
      failureRedirect: "/login",
    }),
    authControler.handleFacebookLoggin
  );

  router.post("/api/login", auth.handleLoggin);
  router.post("/api/register", auth.handleRegister);

  router.post("/api/movie/add", authMiddleware, movie.handleImportMovie);
  router.post(
    "/api/movie/poster",
    authMiddleware,
    multer.fields([{ name: "poster", maxCount: 1 }]),
    movie.handleImportMoviePoster
  );
  router.post(
    "/api/movie/triler",
    authMiddleware,
    movie.handleImportMovieTriler
  );
  router.post(
    "/api/screening/add",
    authMiddleware,
    screnning.handleImportScreening
  );
  router.post(
    "/api/screening/select",
    authMiddleware,
    screnning.handleSelectSeat
  );
  router.post(
    "/api/screening/unselect",
    authMiddleware,
    screnning.handleUnselectSeat
  );

  router.post("/api/order/buy", authMiddleware, order.handleBuy);

  return app.use("/", router);
};

export default initWebRouter;
