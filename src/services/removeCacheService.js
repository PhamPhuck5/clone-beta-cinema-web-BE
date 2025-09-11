import Queue from "bull";
import seatServices from "./cacheSeat.js";
const myQueue = new Queue("my-queue", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
    // password: "yourpassword" // nếu có
  },
});

myQueue.process(async (job) => {
  seatServices.endSession(job.data.screeningID, job.data.userID);
});

export const setRemoveSelectedSeats = async (screeningID, userID) => {
  const jobData = { userID: userID, screeningID: screeningID };
  await myQueue.add(jobData, {
    delay: 11 * 60 * 1000 + 5 * 1000, // 11 minutes + 5s offset
    attempts: 3, // retry max 3 time when error
  });
};
