const { Router } = require("express");

const Response = require("../utils/ApiResponse");
const { gameBot } = require("../game-bot");
const prisma = require("../prisma");

const game = require("../../modules/game");

const router = Router();

router
  .get('/', async (req, res) => {
    try {
      const referrals = await prisma.game_referrals.count({
        where: { invited_id: req.user.id }
      });
      return res.json(new Response().data(referrals));
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/partners/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .get('/nfts', async (req, res) => {
    try {
      const gameReferrals = await prisma.game_referral_nfts.findMany({
        where: { game_user_id: req.user.id }
      });
      return res.json(new Response().data(gameReferrals));
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/partners/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .post('/mint', async (req, res) => {
    try {
      const data = await game.partnerMint(req.user, req.body, req.headers['access-token']);
      if (data.error) {
        return res.status(400).json(new Response().error(data.error));
      }
      return res.json(new Response().ok(1));
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/partners/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  });

module.exports = router;