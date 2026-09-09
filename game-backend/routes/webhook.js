const { Router } = require("express");

const Response = require("../utils/ApiResponse");
const { gameBot } = require("../game-bot");
const prisma = require("../prisma");
const { isNewDay } = require("../utils/date");

const router = Router();

router
  .post('/', async (req, res) => {
    try {
      const data = req.body;
      if (data.event === "order") {
        const gameTransaction = await prisma.game_transactions.findFirst({
          select: { user_id: true, amount: true, id: true, type: true, data: true, wallet_id: true },
          where: { order_id: data.data.id }
        });
        
        if (gameTransaction) {
          if (["paid", "confirmed"].includes(data.data.status)) {
            await prisma.game_transactions.update({
              data: { status: "confirmed" },
              where: { id: gameTransaction.id }
            });
            if (gameTransaction.type === "join_jackpot") {
              const tournamentParticipant = await prisma.tournament_participants.findFirst({
                where: {
                  tournament_id: gameTransaction.data.tournament_id,
                  user_id: gameTransaction.user_id,
                  wallet_id: gameTransaction.wallet_id
                }
              });
              if (!tournamentParticipant) {
                await prisma.$transaction(async (tx) => {
                  await tx.tournament_participants.create({
                    data: {
                      tournament_id: gameTransaction.data.tournament_id,
                      user_id: gameTransaction.user_id,
                      wallet_id: gameTransaction.wallet_id
                    }
                  });
                  await tx.tournaments.update({
                    data: {
                      players_count: { increment: 1 }
                    },
                    where: { id: gameTransaction.data.tournament_id }
                  });
                });
              }
            } else if (gameTransaction.type === "buy_ticket") {
              await prisma.game_users.update({
                data: { tickets: { increment: gameTransaction.data.tickets } },
                where: { id: gameTransaction.user_id  }
              });
              const totalAmount = await prisma.game_transactions.aggregate({
                _sum: { amount: true },
                where: { user_id: gameTransaction.user_id }
              });
              let achievement;
              const amount = totalAmount._sum.amount || 0;
              if (amount >= 100) {
                achievement = await prisma.achievements.findFirst({
                  where: { key: 'supporter' }
                });
              } else if (amount >= 10) {
                achievement = await prisma.achievements.findFirst({
                  where: { key: 'investor' }
                });
              } else if (amount >= 0.5) {
                achievement = await prisma.achievements.findFirst({
                  where: { key: 'magnate' }
                });
              }
              if (achievement) {
                const exists = await prisma.user_achievements.findFirst({
                  where: {
                    user_id: gameTransaction.user_id,
                    achievement_id: achievement.id
                  }
                });
                if (!exists) {
                  await prisma.user_achievements.create({
                    data: {
                      user_id: gameTransaction.user_id,
                      achievement_id: achievement.id
                    }
                  });
                  await prisma.user_discounts.create({
                    data: {
                      user_id: gameTransaction.user_id,
                      discount_id: achievement.reward.discount_id
                    }
                  });
                }
              }
            }
          } else if (data.data.status === "failed") {
            await prisma.game_transactions.update({
              data: { status: "failed" },
             where: { id: gameTransaction.id }
            });
          }
        }
      }
      return res.json(new Response().ok(1));
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `webhook/game/${err.message}`);
      res.status(400).json(new Response().error(err.message));
    }
  })
  .post("/bot", async (req, res) => {
    try {
      await gameBot.handleUpdate(req.body);
      res.status(200).json(new Response().ok(1));
    } catch (err) {
      res.status(400).json(new Response().error(err.message));
    }
  })
  .get('/adsgram', async (req, res) => {
     try {
      const telegram_id = req.query.telegram_id;
      const authProvider = await prisma.auth_providers.findFirst({
        where: { telegram_id  }
      });
      if (!authProvider) {
        res.json(new Response().ok(1));
      }
      const gameUser = await prisma.game_users.findFirst({
        where: { id: authProvider.game_user_id },
      });
      if (gameUser) {
        const ad_view = await prisma.ad_views.findFirst({
          where: { user_id: gameUser.id }
        });
        const now = new Date();
        if (ad_view) {
          const total_views = ad_view.total_views + 1;
          let daily_views = 0;
          if (isNewDay(ad_view.last_view_at, now)) {
            daily_views = 1;
          } else {
            daily_views = ad_view.daily_views + 1;
            await prisma.game_users.update({
              where: { id: gameUser.id },
              data: { tickets: { increment: 3 } }
            });
          }
          await prisma.ad_views.update({
            where: { id: gameUser.id },
            data: { total_views, last_view_at: now, daily_views }
          });
          let achievement;
          if (total_views === 1000) {
            achievement = await prisma.achievements.findFirst({
              where: { key: 'patient_one' }
            });
          } else if (total_views === 5000) {
            achievement = await prisma.achievements.findFirst({
              where: { key: 'iron_nerves' }
            });
          } else if (total_views === 10000) {
            achievement = await prisma.achievements.findFirst({
              where: { key: 'ad_overlord' }
            });
          }
          if (achievement) {
            await prisma.user_achievements.create({
              data: {
                user_id: gameUser.id,
                achievement_id: achievement.id
              }
            });
            if (achievement.reward.tickets) {
              await prisma.game_users.update({
                where: { id: gameUser.id },
                data: { tickets: { increment: achievement.reward.tickets } }
              });
            }
          }
        } else {
          await prisma.ad_views.create({
            data: { user_id: gameUser.id, total_views: 1, daily_views: 1, last_view_at: now  },
          });
        }
      }
      res.json(new Response().ok(1));
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `webhook/adsgram/${err.message}`);
      res.status(400).json(new Response().error(err.message));
    }
  });

module.exports = router;
