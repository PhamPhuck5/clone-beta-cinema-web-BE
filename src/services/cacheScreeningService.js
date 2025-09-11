import screeningServices from "./baseService/screeningServices.js";
export default new (class EmptySeatServices {
  constructor() {
    this.emptySeatNumber = {};
    this.promisePool = {};
  }

  async getEmptySeat(screeningID) {
    let cached = this.emptySeatNumber[screeningID];
    if (cached) {
      // Nếu cache là instance đã có
      cached.old = false;
      if (cached.wrong) {
        //nếu cached đã sai
        cached = this.addSeat(screeningID);
      }
      return await cached.numberEmptySeat;
    } else {
      // Lần đầu chưa có gì
      let newInstance = this.addSeat(screeningID);
      return await newInstance.numberEmptySeat;
    }
  }

  addSeat(screeningID) {
    const newInstance = {
      old: false,
      wrong: false,
      numberEmptySeat: screeningServices.findNumberEmptySeat(screeningID), // stay promist
    };
    this.emptySeatNumber[screeningID] = newInstance;
    return newInstance;
  }
  cacheBeWrong(screeningID) {
    if (this.emptySeatNumber[screeningID]) {
      this.emptySeatNumber[screeningID].wrong = true;
    }
  }
  //run in daily services
  removeOldCache() {
    for (const key in this.emptySeatNumber) {
      const item = this.emptySeatNumber[key];

      if (item.old) {
        // Nếu old = true, xóa key khỏi object
        delete this.emptySeatNumber[key];
      } else {
        // Nếu old = false, đổi thành true
        item.old = true;
      }
    }
  }
})();
