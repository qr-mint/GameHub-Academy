const jwt = require("jsonwebtoken");

const refreshTime = process.env.JWT_REFRESH_TOKEN_MAX_LIFETIME_IN_MINUTES;
const accessTime = process.env.JWT_ACCESS_TOKEN_MAX_LIFETIME_IN_MINUTES;

const maxAge = process.env.MODE === "prod" ? 30 * 60 * 1000 : 24 * 60 * 60 * 1000;

export function generateAccessToken(jwtAccessSecret, payload) {
  return jwt.sign(payload, jwtAccessSecret, { expiresIn: accessTime });
}

export function generateRefreshToken(jwtRefreshSecret, payload) {
  return jwt.sign(payload, jwtRefreshSecret, { expiresIn: refreshTime });
}

export function setRefreshTokenCookie(res, name, token) {
  res.cookie(name, token, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    maxAge,
  });
}
