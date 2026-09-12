const { Router } = require("express");

const Response = require("../utils/ApiResponse");
const prisma = require("../prisma");
const { gameBot } = require("../game-bot");

const router = Router();

router
  .get('/referrals', async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      const users = await prisma.game_users.findMany({
        take: Number(limit),
        select: {
          username: true,
          _count: {
            select: {
              referrals: true, // подсчёт количества связанных записей в game_referrals
            },
          },
        },
      });
      return res.json(new Response().data(users));
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/referrals/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  });

module.exports = router;