import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import configViewEngine from "./config/viewEngine.js";
import initWebRouter from "./route/web.js";
import connectDB from "./config/connectDB.js";
import db from "./models/index.js";
import cors from "cors";
import passport from "./config/oAuthFacebook.js";

dotenv.config();

let app = express();
app.use(
  cors({
    origin: process.env.URL_FE,
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  })
);

//config app
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

configViewEngine(app);
initWebRouter(app);

connectDB();
db.sequelize.authenticate();
// await db.sequelize.sync({ alter: true });
await db.sequelize.sync();

app.use(passport.initialize());

let port = process.env.PORT || 6999;

app.listen(port, () => {
  console.log(port);
});

/*
user for test 
{
  "name": "Phúc Phạm",
  "phonenumber": "0987654321",
  "email": "phucpham@example.com",
  "password": "yourSecurePassword123",
  "dateOfBirth": "1998-05-21",
  "gender": "male"
}
*/
