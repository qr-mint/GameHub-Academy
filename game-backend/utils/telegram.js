const crypto = require("node:crypto");

const whitelistParams = [
  "id",
  "first_name",
  "last_name",
  "username",
  "photo_url",
  "auth_date",
];

exports.generateTelegramWebHex = (data, botToken) => {
  const secret = crypto.createHash("sha256").update(botToken).digest();
  const sorted = Object.keys(data).sort();
  const mapped = sorted
    .filter((d) => whitelistParams.includes(d))
    .map((key) => `${key}=${data[key]}`);

  const hashString = mapped.join("\n");

  return crypto.createHmac("sha256", secret).update(hashString).digest("hex");
};

exports.generateTelegramHex = async (data, botToken) => {
  const encoder = new TextEncoder();
  const checkString = Object.keys(data)
    .filter((key) => key !== "hash")
    .map((key) => `${key}=${data[key]}`)
    .sort()
    .join("\n");
  const secretKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode("WebAppData"),
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign"]
  );
  const secret = await crypto.subtle.sign(
    "HMAC",
    secretKey,
    encoder.encode(botToken)
  );
  const signatureKey = await crypto.subtle.importKey(
    "raw",
    secret,
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    signatureKey,
    encoder.encode(checkString)
  );

  const hex = [...new Uint8Array(signature)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hex;
};
