const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const http = require("http");
const fileUpload = require("express-fileupload");
const { rateLimit } = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const passport = require("./config/passport");

require("dotenv").config();

require("./game-bot");

const app = express();

const server = http.createServer(app);

// parse application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cors({ origin: true, credentials: true }));

app.set("trust proxy", true);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5000, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
});

// Apply the rate limiting middleware to all requests.
app.use(limiter);
app.use(cookieParser());
app.use(passport.initialize());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

app
  .use("/game", require("./routes"))
  .use("/images", express.static("public/images"))

  .get("/*", async (_, res) => {
    return res.status(404).json({ message: "not found", data: null });
  });

server.listen(process.env.CORE_PORT, (error) => {
  if (error) {
    console.error(error.message);
  } else {
    const addr = server.address();
    const bind =
      typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
    console.log(`Listening on ${bind}`);
  }
});
