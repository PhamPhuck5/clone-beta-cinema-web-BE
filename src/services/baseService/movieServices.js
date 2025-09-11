import db from "../../models/index.js";
import theaterServices from "./theaterServices.js";

async function createNewMovie(newMovieData) {
  const newMovie = await db.Movie.create({
    name: newMovieData.name,
    name_en: newMovieData.name_en,
    content: newMovieData.content,
    content_en: newMovieData.content_en,
    director: newMovieData.director,
    cast: newMovieData.cast,
    genre: newMovieData.genre,
    genre_en: newMovieData.genre_en,
    running_time: newMovieData.running_time,
    Release_date: newMovieData.Release_date,
    status: newMovieData.status,
  });
  return newMovie;
}

async function removeMovieByID(id) {
  await db.Movie.destroy({ where: { id: id } });
}
async function removeMovieByInstance(instance) {
  if (instance) {
    await instance.destroy();
  }
}

async function findMovieByID(id) {
  const movie = await db.Movie.findOne({
    where: { id: id },
    attributes: [
      "name",
      "name_en",
      "id",
      "genre",
      "genre_en",
      "running_time",
      "triler_link",
      "content",
      "content_en",
      "director",
      "cast",
      "Release_date",
    ],
  });
  return movie;
}
async function findMovieByName(movieName) {
  const movie = await db.Movie.findOne({
    where: { name_en: movieName },
  });
  return movie;
}

async function findScreeningMovies() {
  const movies = await db.Movie.findAll({
    where: { status: "screening" },
    attributes: [
      "name",
      "name_en",
      "id",
      "genre",
      "genre_en",
      "running_time",
      "triler_link",
    ],
  });
  return movies;
}
async function isHavingScreening(theater_id, movie_id) {
  const movie = await db.Movie.findOne({
    attributes: ["id"],
    where: { id: movie_id }, // lọc theo Movie.id
    include: [
      {
        model: db.Screening,
        where: { theater_id: theater_id },
        attributes: [],
      },
    ],
  });
  return !!movie;
}

async function setMovieTriler(name, link) {
  let id = (await findMovieByName(name)).id;
  await db.Movie.update({ triler_link: link }, { where: { id } });
}

const movieServices = {
  createNewMovie: createNewMovie,
  removeMovieByID: removeMovieByID,
  removeMovieByInstance: removeMovieByInstance,
  findMovieByID: findMovieByID,
  findMovieByName: findMovieByName,
  findScreeningMovies: findScreeningMovies,
  isHavingScreening: isHavingScreening,
  setMovieTriler: setMovieTriler,
};
export default movieServices;
