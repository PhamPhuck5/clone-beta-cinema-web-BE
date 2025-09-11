import db from "../../models/index.js";

async function getTheaterID(theaterName) {
  const ID = await db.Theater.findOne({
    where: { name: theaterName },
  });
  console.log(ID);
  return ID.id;
}

const theaterServices = {
  getTheaterID: getTheaterID,
};
export default theaterServices;
