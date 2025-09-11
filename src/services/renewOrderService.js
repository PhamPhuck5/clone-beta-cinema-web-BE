//this file dont used
import Queue from "bull";
import screeningServices from "./baseService/screeningServices.js";
import orderServices from "./baseService/orderServices.js";

// Tạo 1 queue
const myQueue = new Queue("myQueue");
let nextTime = new Date();

// Thêm job
export async function addJob(delay) {
  await myQueue.add({}, { delay }); // delay tính bằng ms
}
async function addNewJob(newScreenStart) {
  if (newScreenStart > nextTime) {
    return false;
  } else {
    const now = new Date();
    let delay = newScreenStart.getTime() - now.getTime();
    if (delay <= 0) {
      //if time pass screening time when run this
      delay = 0;
    }
    nextTime = newScreenStart;

    addJob(delay);
  }
}
myQueue.process(async () => {
  console.log("renew order data", new Date());

  //job, dont need await
  orderServices.refreshNewOrder();

  //set next time
  const now = new Date();
  let nextScreening = new Date(await screeningServices.findNextScreening());
  if (!nextScreening) {
    console.log("next screening not found");
    return;
  }
  let delay = nextScreening.getTime() - now.getTime();

  if (delay <= 0) {
    // nextScreening > now or null
    console.warn(" screening database issue");
    orderServices.refreshNewOrder();
    return;
  }
  nextTime = nextScreening;

  await addJob(delay);
});
