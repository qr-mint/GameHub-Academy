const { Router } = require("express");
const jwt = require("jsonwebtoken");

const Response = require("../utils/ApiResponse");
const { generateInviteCode } = require("../utils/random");
const passport = require("../config/passport");

const prisma = require("../prisma");
const { gameBot } = require("../game-bot");

const router = Router();

function getTokenFromReq(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.split(' ')[1];
  // если используешь cookie:
  // return req.cookies?.token;
  return null;
}

const partners = [
  {
    referrals: 1,
    tickets: 5
  },
    {
    referrals: 3,
    tickets: 10
  },
  {
    referrals: 5,
    tickets: 20
  },
  {
    referrals: 10,
    tickets: 50
  },
  {
    referrals: 25,
    tickets: 150
  },
  {
    referrals: 50,
    tickets: 500
  }
];

const achievements = {
  1: "first_follower",
  3: "small_group",
  5: "growing_crowd",
  10: "leader",
  25: "influence_master",
  50: "king_of_the_crowd"
}

router
  .use('/leadboard', passport.authenticate("game-jwt", { session: false }), require("./leadboard"))
  .use('/partners', passport.authenticate("game-jwt", { session: false }), require("./partners"))
  .use('/payments', passport.authenticate("game-jwt", { session: false }), require("./payments"))
  .use('/tournaments', require("./tournaments"))
  .use('/achievements', require('./achievements'))
  .use('/webhook', require('./webhook'))
  .get('/telegram', async (req, res) => {
    try {
      const rawJwtToken = getTokenFromReq(req);
      if (!rawJwtToken) {
        return res
          .status(401)
          .send(new Response().error("Unauthorized"));
      }
      const decodedToken = jwt.decode(rawJwtToken);
      try {
        jwt.verify(rawJwtToken, process.env.GAME_PRIVATE_KEY);
      } catch (err) {
        return res
          .status(401)
          .send(new Response().error("Authorization failed"));
      }

      let authProvider = await prisma.auth_providers.findFirst({
        where: { telegram_id: decodedToken.telegram_id }
      });
      if (!authProvider) {
        const inviteCode = req.query.invite_code;
        const code = generateInviteCode();
        const gameUser = await prisma.game_users.create({
          data: { code, username: decodedToken.username }
        });
        authProvider = await prisma.auth_providers.create({
          data: {
            game_user_id: gameUser.id,
            ...(decodedToken.wallet_id
              ? { wallet_id: decodedToken.wallet_id }
              : { telegram_id: decodedToken.telegram_id })
            }
        });
        if (inviteCode) {
          const inviter = await prisma.game_users.findFirst({
            where: { code: inviteCode }
          });
          if (inviter) {
            let referralCount = await prisma.game_referrals.count({
              where: { invited_id: inviter.id }
            });
            referralCount = referralCount + 1;
            const partnerFound = partners.find((partner) => partner.referrals === referralCount);
            if (partnerFound) {
              await prisma.game_users.update({
                data: { tickets: { increment: partnerFound.tickets } },
                where: { id: inviter.id }
              });
              const achKey = achievements[referralCount];
              if (achKey) {
                const achievement = await prisma.achievements.findFirst({
                  where: { key: achKey }
                });
                await prisma.user_achievements.create({
                  data: {
                    user_id: gameUser.id,
                    achievement_id: achievement.id
                  }
                });
              }
            }
            await prisma.game_referrals.create({
              data: {
                user_id: gameUser.id,
                invited_id: inviter.id
              }
            });
          }
        }
      }
      const gameUser = await prisma.game_users.findFirst({
        where: { id: authProvider.game_user_id }
      });
      return res.json(new Response().data(gameUser));
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .post('/wallet', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
    try {
      const rawJwtToken = req.body.token;
      if (!rawJwtToken) {
        return res
          .status(401)
          .send(new Response().error("Token invalid"));
      }
      const decodedToken = jwt.decode(rawJwtToken);
      try {
        jwt.verify(rawJwtToken, process.env.GAME_PRIVATE_KEY);
      } catch (err) {
        return res
          .status(401)
          .send(new Response().error("Token invalid"));
      }

      let wallet = await prisma.game_wallets.findFirst({
        where: { address: decodedToken.address, network: decodedToken.network }
      });
      if (!wallet) {
        wallet = await prisma.game_wallets.create({
          data: {
            address: decodedToken.address,
            network: decodedToken.network
          }
        });
      }
      const gameUserWallet = await prisma.game_user_wallets.findFirst({
        where: { wallet_id: wallet.id, user_id: req.user.id }
      });
      if (!gameUserWallet) {
        await prisma.game_user_wallets.create({
          data: { wallet_id: wallet.id, user_id: req.user.id }
        });
      }
      return res.json(new Response().data(wallet));
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  });

module.exports = router;