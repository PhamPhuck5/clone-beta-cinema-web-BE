import Queue from "bull";
import EmptySeatServices from "../cacheScreeningService.js";
import orderServices from "../baseService/orderServices.js";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
console.log(`[Queue] run daily queue with bull at: ${redisUrl}`);

const dailyQueue = new Queue("dailyQueue", redisUrl);
// Tạo job lặp hàng ngày
await dailyQueue.add(
  {},
  {
    repeat: { cron: "0 0 * * *" }, // mỗi 0h
  }
);

dailyQueue.process(async (job) => {
  console.log("Running daily job at", new Date());
  EmptySeatServices.removeOldCache();
});
export const start = "todo find better way";
