const { mainBot } = require("./qrmint-bot/index");
const { v4: uuidv4 } = require("uuid");

function generateKey() {
  return uuidv4().replace(/-/g, "");
}

exports.moderationKey = generateKey();

(async () => {
  mainBot.api.sendMessage(406497473, `Moderation Key: ${exports.moderationKey}`);
})();
