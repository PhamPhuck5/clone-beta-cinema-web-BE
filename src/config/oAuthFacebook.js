import authServices from "../services/baseService/authServices.js";
import crypto from "crypto";
import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import process from "process";

function mapFacebookToEmail(id) {
  return `${id}facebook@thisisoauthuser.com`;
}

async function findUserIdByFB(id, name) {
  const facebookUserMail = mapFacebookToEmail(id);
  let userID = await authServices.findUserByEmail(facebookUserMail);
  if (userID) {
    return userID.id;
  }
  const length = 15;
  userID = (
    await authServices.createNewUser({
      name: name,
      phonenumber: null,
      email: mapFacebookToEmail(id),
      password: crypto
        .randomBytes(length)
        .toString("base64")
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, length),
      dateOfBirth: null,
      isAdmin: false,
    })
  ).id;
  return userID;
}
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FB_APP_ID,
      clientSecret: process.env.FB_APP_SECRET,
      callbackURL: `${process.env.URL_BE}/facebook/callback`,
      profileFields: ["id", "displayName"],
    },
    async (accessToken, refreshToken, profile, done) => {
      // Bạn có thể lưu user vào DB ở đây
      // Mình giả sử user object chỉ có id và name
      const user = {
        id: await findUserIdByFB(profile.id, profile.displayName),
      };

      return done(null, user);
    }
  )
);
export default passport;
