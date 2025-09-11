import Queue from "bull";
import EmptySeatServices from "../cacheScreeningService.js";
import orderServices from "../baseService/orderServices.js";

const dailyQueue = new Queue("dailyQueue", "redis://127.0.0.1:6379");

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
  orderServices.refreshNewOrder();
});
export const start = "todo find better way";
