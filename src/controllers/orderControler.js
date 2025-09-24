import orderServices from "../services/baseService/orderServices.js";

let handleBuy = async (req, res) => {
  try {
    console.log("start make order for user");

    await orderServices.makeOrders(
      req.user.id,
      req.body.screeningID,
      req.body.combos
    );

    return res.status(200).json({
      status: 200,
      message: "order maked",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};

const orderControler = {
  handleBuy: handleBuy,
};
export default orderControler;
