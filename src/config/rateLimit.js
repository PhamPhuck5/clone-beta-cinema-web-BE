import rateLimit from "express-rate-limit";
export const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "too many request in 10 minute",
});
