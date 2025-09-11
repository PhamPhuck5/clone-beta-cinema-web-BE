import authServices from "../services/baseService/authServices.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../services/authServices/jwtServices.js";
let requestIsLegit = (email, password) => {
  return email.length >= 8 && email[0] != " " && password.length >= 8;
};

let handleLoggin = async (req, res) => {
  try {
    let email = req.body.email;
    let password = req.body.password;

    if (!requestIsLegit(email, password)) {
      // await noteDangerIP
      return res.status(400).json({
        status: 400,
        message: "bad request",
      });
    }
    let userData = await authServices.handleLogin(email, password);
    return res.status(userData.code).json({
      status: userData.code,
      message: userData.message,
      data: userData.code === 200 ? userData : null,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};

let handleRegister = async (req, res) => {
  try {
    let newUserData = {
      name: req.body.name,
      phonenumber: req.body.phonenumber,
      email: req.body.email,
      password: req.body.password,
      dateOfBirth: new Date(req.body.dateOfBirth),
      gender: req.body.gender ?? null,
    };
    console.log(newUserData);

    if (
      // missing properties (avoid FE check)
      !newUserData.name ||
      !newUserData.phonenumber ||
      !newUserData.email ||
      !newUserData.password ||
      !newUserData.dateOfBirth ||
      // wrong type (avoid FE check)
      !requestIsLegit(newUserData.email, newUserData.password)
    ) {
      //todo: await note Danger IP
      return res.status(400).json({
        status: 400,
        message: "bad request",
      });
    }
    let result = await authServices.handleRegister(newUserData);
    return res.status(result.code).json({
      status: result.code,
      message: result.message,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};
let hendleGetInfo = async (req, res) => {
  try {
    let id = req.user.id;
    let userData = await authServices.findUserByID(id);
    return res.status(200).json({
      status: userData.code,
      message: userData.message,
      data: {
        name: userData.name,
        phoneNumber: userData.phonenumber,
        email: userData.email,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
};
// let handleRefreshToken = async (req, res) => {
//   try {
//     const { refreshToken } = req.body;
//     if (!refreshToken)
//       return res.sendStatus(401).json({
//         status: 401,
//         message: "missing refresh token",
//         errCode: "login",
//       });
//     if (!refreshTokens.includes(refreshToken))
//       //todo to do this is a func to verified the token,
//       return res.sendStatus(403).json({
//         status: 403,
//         message: "cant find your refresh token",
//       });
//     jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
//       if (err)
//         return res.sendStatus(403).json({
//           status: 403,
//           message: "refresh token issue",
//         });

//       const accessToken = generateAccessToken({
//         id: user.id,
//       });
//       res.sendStatus(200).json({
//         status: 200,
//         message: "refresh accesstoken success",
//         data: accessToken,
//       });
//     });
//   } catch (e) {
//     console.error(e);
//     return res.status(500).json({
//       status: 500,
//       message: "Server error",
//     });
//   }
// };

//todo to do logout=> delete refresh token

const authControler = {
  handleLoggin: handleLoggin,
  handleRegister: handleRegister,
  hendleGetInfo: hendleGetInfo,
};
export default authControler;
