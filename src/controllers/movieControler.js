import movieServices from "../services/baseService/movieServices.js";
import storageServices from "../services/storageService.js";
import theaterServices from "../services/baseService/theaterServices.js";
import screeningServices from "../services/baseService/screeningServices.js";
// import { getScreeningMovies } from "../services/cacheStorage.js"; // todo remove cmt

let handleImportMovie = async (req, res) => {
  try {
    // Todo add admin rights to add movies
    let newMovieData = {
      name: req.body.name,
      name_en: req.body.name_en,
      content: req.body.content,
      content_en: req.body.content_en,
      director: req.body.director,
      cast: req.body.cast,
      genre: req.body.genre,
      genre_en: req.body.genre_en,
      running_time: req.body.running_time,
      Release_date: req.body.Release_date,
      status: req.body.status,
    };
    let newMovie = await movieServices.createNewMovie(newMovieData);
    return res.status(200).json({
      status: 200,
      message: "new movie created",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};
let handleGetScreeningMovies = async (req, res) => {
  try {
    let Movies = await movieServices.findScreeningMovies();
    let theaterID = await theaterServices.getTheaterID(req.query.theater);

    let returnData = await Promise.all(
      Movies.map(async (m) => ({
        id: m.id,
        name: {
          vi: m.name,
          en: m.name_en,
        },
        genre: {
          vi: m.genre,
          en: m.genre_en,
        },
        running_time: m.running_time,
        having_screening: await movieServices.isHavingScreening(
          theaterID,
          m.id
        ),
        trailer: m.triler_link,
      }))
    );

    return res.status(200).json({
      status: 200,
      message: "found screening movie",
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

let handleGetMoviesById = async (req, res) => {
  try {
    let movie = await movieServices.findMovieByID(req.query.id);
    if (!movie) {
      return res.status(200).json({
        status: 400,
        message: "the request movie id not found",
        data: returnData,
      });
    }
    let returnData = {
      id: movie.id,
      name: {
        vi: movie.name,
        en: movie.name_en,
      },
      genre: {
        vi: movie.genre,
        en: movie.genre_en,
      },
      runningTime: movie.running_time,
      trailer: movie.triler_link,
      content: {
        en: movie.content_en,
        vi: movie.content,
      },
      director: movie.director,
      cast: movie.cast,
      releaseDate: movie.Release_date,
      trailer: movie.triler_link,
    };

    return res.status(200).json({
      status: 200,
      message: "found screening movie",
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

let handleImportMoviePoster = async (req, res) => {
  try {
    const posterFile = req.files.poster[0];
    await storageServices.changePosterName(
      req.body.name,
      posterFile.destination,
      posterFile.originalname,
      posterFile.path
    );

    return res.status(200).json({
      status: 200,
      message: "upload succesfully",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};

let handleImportMovieTriler = async (req, res) => {
  try {
    await movieServices.setMovieTriler(req.body.name, req.body.link);

    return res.status(200).json({
      status: 200,
      message: "upload succesfully",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};

let handleGetScreeningInTheater = async (req, res) => {
  try {
    let Movies = await movieServices.findScreeningMovies();
    let theaterID = await theaterServices.getTheaterID(req.query.theater);

    let returnData = await Promise.all(
      Movies.map(async (movie) => {
        return {
          id: movie.id,
          name: {
            vi: movie.name,
            en: movie.name_en,
          },
          genre: {
            vi: movie.genre,
            en: movie.genre_en,
          },
          runningTime: movie.running_time,
          trailerLink: movie.triler_link,
          screenings: await screeningServices.findScreeningsInDay(
            movie.id,
            theaterID,
            req.query.date
          ),
        };
      })
    );
    returnData = returnData.filter((value) => value.screenings.length != 0);

    return res.status(200).json({
      status: 200,
      message: "found screening movie",
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
const movieControler = {
  handleImportMovie: handleImportMovie,
  handleGetScreeningMovies: handleGetScreeningMovies,
  handleImportMoviePoster: handleImportMoviePoster,
  handleImportMovieTriler: handleImportMovieTriler,
  handleGetMoviesById: handleGetMoviesById,
  handleGetScreeningInTheater: handleGetScreeningInTheater,
};
export default movieControler;
