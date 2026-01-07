const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const indexRouter = require("./src/routes/index");
const usersRouter = require("./src/routes/users");
const { connect } = require("http2");
const { connectDB } = require("./src/config/connect.db");
const redisClient = require("./src/config/redis");
const hotelRouter = require("./src/routes/hotel.routes");
const bookingRouter = require("./src/routes/booking.routes");
const rateLimit = require("express-rate-limit");
const Redis = require("redis");
// Note: we implement a small Redis-backed limiter below using the existing redis client
const storeRouter = require("./src/routes/store.routes");

const app = express();
app.use(
  cors({
    origin: "*", // your frontend URL
    credentials: true,
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Redis-backed rate limiter (global). Uses existing redisClient. Configurable via env:
// RATE_LIMIT_WINDOW (seconds), RATE_LIMIT_MAX (requests per window)
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 60; // seconds
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX, 10) || 60; // requests per window

app.use(async (req, res, next) => {
  try {
    if (!redisClient || typeof redisClient.incr !== "function") return next();
    const ip =
      req.ip ||
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      "anon";
    const route = req.path || "all";
    const key = `rl:${ip}:${route}`;
    const counter = await redisClient.incr(key);
    if (counter === 1) {
      try {
        await redisClient.expire(key, RATE_LIMIT_WINDOW);
      } catch (e) {}
    }
    if (counter > RATE_LIMIT_MAX) {
      let ttl = 60;
      try {
        ttl = await redisClient.ttl(key);
      } catch (e) {}
      res.set("Retry-After", String(ttl || RATE_LIMIT_WINDOW));
      return res
        .status(429)
        .json({ message: `Too many requests. Try again in ${ttl} seconds` });
    }
    return next();
  } catch (err) {
    console.error("rate limiter error", err);
    return next();
  }
});

app.use("/", indexRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/hotels", hotelRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/stores", storeRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404, "Not Found"));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// db connection
connectDB();
(async () => {
  await redisClient.set("foo", "bar");
  const value = await redisClient.get("foo");
  console.log(value);
})();

module.exports = app;
