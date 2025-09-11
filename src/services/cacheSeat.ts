// status: 0 free 00, 1: choosing 01, 3: busy 11
//ex: 150 seat take 150/4 = 38 byte for cache seat screening
//todo: update redis to version 5. dont know how to do now
import orderServices from "./baseService/orderServices.js";
import redisInstance from "../config/connectRedis.js";
import { setRemoveSelectedSeats } from "./removeCacheService.js";
import roomServices from "./baseService/roomService.js";
import newGetBuffer from "./getBuffer.js";
//todo create totalBytes
export interface ReturnFrame {
  ok: boolean;
  message: string;
}
export interface bookingFrame {
  endtime: Date;
  seatArray: Array<number>;
}

async function mapScreeningStatusToBites(
  screeningId: number
): Promise<Uint8Array> {
  let maxSeat: number = await roomServices.getRoomMaxSeat(screeningId);
  let totalBytes: number = Math.floor(maxSeat + 1 / 4) + 1;
  let mem: Uint8Array = new Uint8Array(totalBytes);
  const busySeats: Array<number> =
    await orderServices.findBusySeatByScreeningID(screeningId);

  for (const seat of busySeats) {
    let byteIndex: number = Math.floor(seat / 4); // seat*2/8
    let bitPos: number = (seat * 2) % 8;
    mem[byteIndex]! |= 3 << bitPos;
  }
  return mem;
}

async function createNewCache(screeningId: number): Promise<Uint8Array> {
  let bytesStatus: Uint8Array = await mapScreeningStatusToBites(screeningId);
  await redisInstance.set(
    `screeningSeat${screeningId}`,
    Buffer.from(bytesStatus),
    { EX: 3 * 60 * 60 }
  ); //3 hours
  return bytesStatus;
}

async function getScreeningStatus(screeningId: number): Promise<Uint8Array> {
  const str = await newGetBuffer(screeningId);
  if (str) {
    // let status: Uint8Array = new Uint8Array(Buffer.from(str, "binary"));
    return str;
  }
  return await createNewCache(screeningId); //create and return
}

async function chooseSeat(
  screeningId: number,
  seatNumber: number,
  userID: number
): Promise<boolean> {
  // let status: Uint8Array = await getScreeningStatus(screeningId);
  // let byteIndex: number = Math.floor(seatNumber / 4); // seat*2/8
  // let bitPos: number = (seatNumber * 2) % 8;
  // let seatStatus: number = (status[byteIndex]! >> bitPos) & 3;
  let maxSeat: number = await roomServices.getRoomMaxSeat(screeningId);
  console.log("start choose seat number: " + seatNumber);
  if (seatNumber > maxSeat) return false;

  let seatIndex = Math.floor(seatNumber / 4) * 8 + 6 - ((seatNumber * 2) % 8);
  let seatStatus: number = await redisInstance.getBit(
    `screeningSeat${screeningId}`,
    seatIndex + 1
  ); //*1 -> busy or selected, *0 -> free
  let seatBoughted: number = await redisInstance.getBit(
    `screeningSeat${screeningId}`,
    seatIndex
  ); //1* or 0*

  //busy
  if (seatBoughted == 1) return false;
  //free to choose
  if (seatStatus == 0) {
    let ok = await redisInstance.set(
      `screening${screeningId}seat${seatNumber}`,
      userID.toString(),
      { NX: true }
    );

    if (!ok) {
      return false;
    }
    await redisInstance.setBit(`screeningSeat${screeningId}`, seatIndex + 1, 1); // 00->01
    await redisInstance.expire(`screeningSeat${screeningId}`, 3 * 60 * 60);

    const key = `screening${screeningId}user${userID}`;
    const redisData = (await redisInstance.hGet!(key, "seatArray")) as any;
    //in case req come late
    if (!redisData) {
      console.log("cant find seat array in key: " + key);
      await redisInstance.setBit(
        `screeningSeat${screeningId}`,
        seatIndex + 1,
        0
      ); // 01->00
      await redisInstance.del(`screening${screeningId}seat${seatNumber}`);
      return false;
    }

    let newSeats: Array<number> = JSON.parse(redisData);
    newSeats.push(seatNumber);
    await redisInstance.hSet!(key, "seatArray", JSON.stringify(newSeats));

    return true;
  }
  //someone choose this * can be the current user
  else {
    const choosingUserID = await redisInstance.get(
      `screening${screeningId}seat${seatNumber}`
    );
    // right user
    if (choosingUserID == userID.toString()) {
      const key = `screening${screeningId}user${userID}`;
      const redisData = (await redisInstance.hGet!(key, "seatArray")) as any;
      //in case this seat is not in controled (req come late)
      if (!redisData) {
        console.log("cant find seat array in key: " + key);
        await redisInstance.setBit(
          `screeningSeat${screeningId}`,
          seatIndex + 1,
          0
        ); // 01->00
        await redisInstance.del(`screening${screeningId}seat${seatNumber}`);
        return false;
      }
      return true;
    }
    //wrong user
    return false;
  }
}

async function unchooseSeat(
  screeningId: number,
  seatNumber: number,
  userID: number
): Promise<boolean> {
  let maxSeat: number = await roomServices.getRoomMaxSeat(screeningId);
  if (seatNumber > maxSeat) return false;

  let seatIndex = Math.floor(seatNumber / 4) * 8 + 6 - ((seatNumber * 2) % 8);

  let seatStatus: number = await redisInstance.getBit(
    `screeningSeat${screeningId}`,
    seatIndex + 1
  );
  let seatBoughted: number = await redisInstance.getBit(
    `screeningSeat${screeningId}`,
    seatIndex
  );
  //free or some one bought
  if (seatStatus == 0 || seatBoughted == 1) {
    console.log("cant unselect seat cause it free or boughted");
    return false;
  }
  //someone choose this * can be the current user
  else {
    const choosingUserID = await redisInstance.get(
      `screening${screeningId}seat${seatNumber}`
    );
    // right user
    if (choosingUserID == userID.toString()) {
      await redisInstance.setBit(
        `screeningSeat${screeningId}`,
        seatIndex + 1,
        0
      ); // 01->00
      await redisInstance.del(`screening${screeningId}seat${seatNumber}`);

      const key = `screening${screeningId}user${userID}`;
      const redisData = (await redisInstance.hGet!(key, "seatArray")) as any;

      if (redisData) {
        let newSeats: Array<number> = JSON.parse(redisData);
        newSeats = newSeats.filter((seat) => seat !== seatNumber);
        await redisInstance.hSet!(key, "seatArray", JSON.stringify(newSeats));
      }
      return true;
    }
    //wrong user
    console.log("cant unselect seat cause wrong user");
    return false;
  }
}

async function chooseSeats(
  screeningID: number,
  seatNumbers: Array<number>,
  userID: number
): Promise<ReturnFrame> {
  let data: ReturnFrame = {
    message: "",
    ok: true,
  };
  for (const seat of seatNumbers) {
    if (!(await chooseSeat(screeningID, seat, userID))) {
      data.message = data.message + "seatNumbers" + " ";
      data.ok = false;
    }
  }
  return data;
}

async function unchooseSeats(
  screeningID: number,
  seatNumbers: Array<number>,
  userID: number
): Promise<ReturnFrame> {
  let data: ReturnFrame = {
    message: "",
    ok: true,
  };
  for (const seat of seatNumbers) {
    if (!(await unchooseSeat(screeningID, seat, userID))) {
      data.message = data.message + "seatNumbers" + " ";
      data.ok = false;
    }
  }
  return data;
}

async function buySeat(
  screeningId: number,
  seatNumber: number,
  userID: number
): Promise<boolean> {
  let seatIndex = Math.floor(seatNumber / 4) * 8 + 6 - ((seatNumber * 2) % 8);
  console.log("start buy seat number: " + seatNumber + " at: " + seatIndex);

  let seatStatus: number = await redisInstance.getBit(
    `screeningSeat${screeningId}`,
    seatIndex + 1
  );
  let seatBoughted: number = await redisInstance.getBit(
    `screeningSeat${screeningId}`,
    seatIndex
  );
  await redisInstance.setBit(`screeningSeat${screeningId}`, seatIndex, 1);
  await redisInstance.setBit(`screeningSeat${screeningId}`, seatIndex + 1, 1);

  //some one bought
  if (seatBoughted == 1) {
    console.log("cant unselect seat cause it free or boughted");
    return false;
  } else {
    await redisInstance.del(`screening${screeningId}seat${seatNumber}`);

    return true;
  }
  // else {
  //   const choosingUserID = await redisInstance.get(
  //     `screening${screeningId}seat${seatNumber}`
  //   );
  //   console.log(choosingUserID + " vs " + userID.toString());
  //   // right user
  //   if (choosingUserID == userID.toString()) {
  //     await redisInstance.setBit(`screeningSeat${screeningId}`, seatIndex, 1); // 01->11
  //     await redisInstance.del(`screening${screeningId}seat${seatNumber}`);

  //     return true;
  //   }
  //   //wrong user
  //   console.log("cant unselect seat cause wrong user");
  //   return false;
  // }
}

async function buySeats(
  screeningID: number,
  userID: number
): Promise<ReturnFrame> {
  let data: ReturnFrame = {
    message: "",
    ok: true,
  };

  const seatNumbers = await getUserBookingStatus(screeningID, userID);
  for (const seat of seatNumbers) {
    console.log(await getScreeningStatus(screeningID));

    if (!(await buySeat(screeningID, seat, userID))) {
      data.ok = false;
    }
    console.log(await getScreeningStatus(screeningID));
  }
  const key = `screening${screeningID}user${userID}`;
  await redisInstance.del(key);
  // const redisData = (await redisInstance.hGetAll!(key)) as any;
  // console.log("data in key" + key + ": ");
  // console.log(redisData);

  // console.log(await getScreeningStatus(screeningID));
  // await redisInstance.setBit(`screeningSeat${screeningID}`, 0, 0);
  // await redisInstance.setBit(`screeningSeat${screeningID}`, 1, 0);
  // await redisInstance.setBit(`screeningSeat${screeningID}`, 2, 0);
  // await redisInstance.setBit(`screeningSeat${screeningID}`, 3, 0);
  // await redisInstance.setBit(`screeningSeat${screeningID}`, 4, 0);
  // await redisInstance.setBit(`screeningSeat${screeningID}`, 5, 0);
  // await redisInstance.setBit(`screeningSeat${screeningID}`, 6, 0);
  // console.log(await getScreeningStatus(screeningID));
  // await redisInstance.setBit(`screeningSeat${screeningID}`, 0, 1);
  // console.log(await getScreeningStatus(screeningID));
  // console.log(await newGetBuffer(screeningID));
  return data;
}

// async function getStatus(
//   screeningID: number
//   //  userID: number
// ): Promise<string> {
//   // todo: let user paid
//   let totalBytes: number = 38; //todo a service to this
//   let totalSeat: number = 150; // find by screenid
//   let data = "";
//   let status: Uint8Array = await getScreeningStatus(screeningID);
//   for (let i: number = 0; i < totalSeat; i++) {
//     let byteIndex: number = Math.floor(i / 4); // seat*2/8
//     let bitPos: number = (i * 2) % 8;
//     let seatStatus: number = (status[byteIndex]! >> bitPos) & 3;
//     //busy or free
//     if (seatStatus == 3 || seatStatus == 0) {
//       data += seatStatus;
//     } //someone choose this * can be the current user
//     // else {
//     //   const choosingUserID = await redisInstance.get(
//     //     `screening${screeningID}seat${i}`
//     //   );
//     //   // right user
//     //   if (choosingUserID == userID.toString()) {
//     //     await redisInstance.expire(`screening${screeningID}seat${i}`, 3 * 60);
//     //     data += "1";
//     //   }
//     //   //wrong user
//     //   else data += "2";
//     // }
//   }

//   return data;
// }

async function getUserBookingStatus(
  screeningID: number,
  userID: number
): Promise<Array<number>> {
  let startTime: Date = new Date();
  let data: bookingFrame = {
    endtime: startTime,
    seatArray: [],
  };
  data.endtime.setMinutes(data.endtime.getMinutes() + 11);
  const key = `screening${screeningID}user${userID}`;
  const redisData = (await redisInstance.hGetAll!(key)) as any;

  if (Object.keys(redisData).length > 0) {
    data.seatArray = JSON.parse(redisData.seatArray);
  }
  await redisInstance.hSet!(key, {
    endtime: data.endtime.toISOString(),
    seatArray: JSON.stringify(data.seatArray),
  });
  // await chooseSeats(screeningID, data.seatArray, userID);
  setRemoveSelectedSeats(screeningID, userID);
  return data.seatArray;
}

async function endSession(screeningID: number, userID: number): Promise<void> {
  const key = `screening${screeningID}user${userID}`;
  const endTime = (await redisInstance.hGet!(key, "endtime")) as string;
  if (!endTime || new Date() < new Date(endTime)) {
    return;
  } else {
    const redisData = await redisInstance.hGet!(key, "seatArray");

    let arraySeat: any[] = [];

    if (typeof redisData === "string") {
      arraySeat = JSON.parse(redisData);
    } else {
      arraySeat = []; // fallback nếu null hoặc không phải string
    }
    unchooseSeats(screeningID, arraySeat, userID);
    redisInstance.del(key);
  }
}

async function getPrice(screeningID: number, userID: number) {
  const bookingSeats: Array<number> = await getUserBookingStatus(
    screeningID,
    userID
  );
  const totalprice: number = await roomServices.getPrice(
    screeningID,
    bookingSeats
  );
  return totalprice;
}

let seatServices = {
  mapScreeningStatusToBites: mapScreeningStatusToBites,
  createNewCache: createNewCache,
  getScreeningStatus: getScreeningStatus,
  chooseSeat: chooseSeat,
  unchooseSeat: unchooseSeat,
  buySeats: buySeats,
  // getStatus: getStatus,
  getUserBookingStatus: getUserBookingStatus,
  endSession: endSession,
  getPrice: getPrice,
};
export default seatServices;

/*  
user-> fullRequest -> create bull set time out quest + user stage, 
user stage just check the key (`screening${screeningID}user${userID}`) to find old seat


the key to user booked seat and the key to the seats user booking not expired auto but by a quest
*/
