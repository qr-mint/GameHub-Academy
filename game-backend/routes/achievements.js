const { Router } = require("express");

const Response = require("../utils/ApiResponse");
const { moderationKey } = require("../moderationKey");
const { gameBot } = require("../game-bot");
const prisma = require("../prisma");
const passport = require("../config/passport");

const router = Router();

router
  .get('/', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
    try {
      const achievements = await prisma.achievements.findMany({
        select: {
          id: true,
          key: true,
          name_en: true,
          name_ru: true,
          description_en: true,
          description_ru: true,
          image_url: true,
          reward: true,
          user_achs: {
            where: { user_id: req.user.id }
          }
        }
      });
      return res.json(new Response().data(achievements));
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/achievements/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .post('/', async (req, res) => {
    if (req.query.moderationKey !== moderationKey) {
      return res
        .status(401)
        .json(new Response().error("Moderation key does not right!"));
    }
    try {
      const {
        key,
        name,
        description,
        reward,
      } = req.body;
      if (!key) {
        return res.status(400).json(new Response().error("Key incorrect"));
      }
      if (!name) {
        return res.status(400).json(new Response().error("Name incorrect"));
      }
      if (!description) {
        return res.status(400).json(new Response().error("Description incorrect"));
      }
      if (!reward) {
        return res.status(400).json(new Response().error("Reward incorrect"));
      }
      if (!req.files.image) {
        return res
          .status(400)
          .json(new Response().error(`No image were uploaded.`));
      }
      const image = await saveFile("achievements", "ach_", req.files.image);
      const achievements = await prisma.achievements.create({
        data: {
          key,
          name,
          description,
          image_url: image.image_url,
          reward,
        }
      });
      return res.json(new Response().data(achievements));
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/achievements/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  });

module.exports = router;