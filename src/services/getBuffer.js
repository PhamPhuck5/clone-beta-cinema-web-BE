import redisInstance from "../config/connectRedis.js";
import { commandOptions } from "redis";
async function getScreeningStatus(screeningId) {
  const str = await redisInstance.getEx(
    commandOptions({ returnBuffers: true }),
    `screeningSeat${screeningId}`,
    { EX: 3 * 60 * 60 }
  );
  return str;
}
export default getScreeningStatus;
