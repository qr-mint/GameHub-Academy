const { Router } = require("express");
const { default: BigNumber } = require("bignumber.js");
const axios = require('axios');

const Response = require("../utils/ApiResponse");
const prisma = require("../prisma");
const passport = require("../config/passport");

const { gameBot } = require("../game-bot");
const tournamentModule = require("../modules/tournaments");
const networks = require("../config/network.json");

const router = Router();

const poolAddress = process.env.MODE === "dev"
  ? "EQC9GX5Mp2_ztS0pMzSqZPwx2sTasYkCzCItpJrsHJTZ1F1z"
  : "EQB5ihCTH7a9GPGAIv2pW-Z0PK7C2jMkpwLGIebmzMafYYMp";

router
  .get('/', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
    try {
      const tournaments = await prisma.tournaments.findMany({
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          prizes: true,
          entry_amount: true,
          entry_tickets: true,
          start_at: true,
          end_at: true,
          players_count: true,
          icon: true,
          color: true,
          network: true,
          currency_token: true,
          address: true,
          token: true,
          status: true
        },
        where: { completed: false, status: { in: ["ongoing", "upcoming"] } },
        orderBy: { id: "desc" }
      });
      return res.json(new Response().data(tournaments)); 
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/tournaments/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .get('/by', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
     try {
      const { type } = req.query;
      if (!type) {
        return res.status(400).json(new Response().error("Type is not set"));
      }
      const gameUser = await prisma.game_users.findFirst({
        where: { username: 'dao0dev' }
      });
      const tournament = await prisma.tournaments.findFirst({
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          prizes: true,
          entry_amount: true,
          entry_tickets: true,
          start_at: true,
          end_at: true,
          players_count: true,
          icon: true,
          color: true,
          network: true,
          currency_token: true,
          address: true,
          token: true,
          entry_mode:  true,
          status: true,
          levels: {
            select: {
              level_id: true,
              order: true
            }
          }
        },
        where: { schedule: type, entry_mode: "per_attempt", user_id: gameUser.id, address: poolAddress, status: "ongoing"  },
        orderBy: { start_at: 'desc' }
      });
      return res.json(new Response().data(tournament)); 
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/tournaments/by/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .get('/my', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
    try {
      const tournaments = await prisma.tournaments.findMany({
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          entry_amount: true,
          entry_tickets: true,
          start_at: true,
          end_at: true,
          players_count: true,
          player_limit: true,
          winners_count: true,
          icon: true,
          color: true,
          network: true,
          currency_token: true,
          address: true,
          token: true,
          status: true,
          levels: {
            select: {
              level_id: true,
              order: true
            }
          }
        },
        where: { user_id: req.user.id }
      });
      return res.json(new Response().data(tournaments));
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/tournaments/my/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .get('/:tournament_id/participant', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
    const tournament_id = parseInt(req.params.tournament_id, 10);
    if (isNaN(tournament_id)) {
      return res.status(400).json(new Response().error("Tournament id is not set"));
    }
    try {
      const tournament = await prisma.tournaments.findFirst({
        select: {
          id: true,
          type: true,
          entry_mode: true
        },
        where: { id: tournament_id }
      });
      if (!tournament) {
        return res.status(404).json(new Response().error("Tourname does not found"))
      }
      const tournamentParticipant = await prisma.tournament_participants.findFirst({
        select: {
          id: true,
          best_time: true,
          deaths: true,
          scores: true,
          status: true,
          completed: true,
          created_at: true,
          update_at: true,
          user: {
            select: {
              id: true,
              username: true
            }
          }
        },
        where: { tournament_id, user_id: req.user.id }
      });
      let rank = 0;
      if (tournamentParticipant) {
        if (tournament.type === "survival") {
          const betterCount = await prisma.tournament_participants.count({
            where: {
              tournament_id,
              score: {
                gt: tournamentParticipant.scores
              }
            }
          });

          rank = betterCount + 1;
        } else {
          const betterCount = await prisma.tournament_participants.count({
            where: {
              tournament_id,
              best_time: {
                lt: tournamentParticipant.best_time
              }
            }
          });
          rank = betterCount + 1;
        }
        tournamentParticipant.rank = rank;

        if (tournament.entry_mode === "per_attempt") {
          const charges = await prisma.attempts.count({
            where: {
              user_id: req.user.id,
              tournament_id,
              success: false
            },
            orderBy: {
              id: 'desc'
            },
          });
          const gameTransactions = await prisma.game_transactions.count({
            where: {
              status: "confirmed",
              user_id: req.user.id,
              data: {
                path: ["tournament_id"],
                equals: tournament_id
              }
            }
          });
          tournamentParticipant.allow = gameTransactions > charges;
        } else {
          tournamentParticipant.allow = false;
        }
      }
      return res.json(new Response().data(tournamentParticipant));
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/tournaments/my-stats/${err.message}`);
		  return res.status(400).json(new Response().error(err.message));
	  }
  })
  .get('/:tournament_id/levels', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
    try {
      const tournament_id = parseInt(req.params.tournament_id);
      if (isNaN(tournament_id)) {
        return res.status(400).json(new Response().error("Tournament id is not set"));
      }
      const tournamentLevels = await prisma.tournament_levels.findMany({
        select: {
          order: true,
          level: {
            select: {
              id: true,
              name: true,
              difficulty: true,
              difficulty_label: true
            }
          }
        },
        where: { tournament_id }
      });
      const attempts = await prisma.attempts.findMany({
        select: {
          user_id: true,
          level_id: true,
          time: true,
          deaths: true,
          success: true,
          ticket_cost: true,
        },
        where: { tournament_id, success: true, user_id: req.user.id }
      });
      levels = tournamentLevels.map((tlevel) => {
        const foundAttemt = attempts.find((attempt) => attempt.level_id === tlevel.level.id);
        if (foundAttemt) {
          return {
            ...tlevel,
            attempt: foundAttemt
          };
        }
        return tlevel;
      });
      return res.json(new Response().data(levels));
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/tournaments/levels/${err.message}`);
		  return res.status(400).json(new Response().error(err.message));
    }
  })
  .get('/:tournament_id/participants', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
    try {
      const tournament_id = parseInt(req.params.tournament_id);
      if (isNaN(tournament_id)) {
        return res.status(400).json(new Response().error("Tournament id is not set"));
      }
      const tournaments = await prisma.tournament_participants.findMany({
        select: {
          id: true,
          best_time: true,
          deaths: true,
          status: true,
          completed: true,
          created_at: true,
          update_at: true,
          user: {
            select: {
              id: true,
              username: true
            }
          }
        },
        where: { tournament_id }
      });
      return res.json(new Response().data(tournaments));
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/tournaments/participants/${err.message}`);
		  return res.status(400).json(new Response().error(err.message));
    }
  })
  .get('/:tournament_id/verify-nft', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
    const tournament_id = parseInt(req.params.tournament_id, 10);
    if (isNaN(tournament_id)) {
      return res.status(400).json(new Response().error("Tournament id is not set"));
    }
    try {
      const tournament = await prisma.tournaments.findFirst({
        select: {
          id: true,
          collection_address: true,
          network: true
        },
        where: { id: tournament_id }
      });
      if (!tournament) {
        return res.status(404).json(new Response().error("Tourname does not found"))
      }

      if (!["ton", "botchain"].includes(tournament.network)) {
        return res.status(400).json(new Response().error(`${tournament.network} does not support!`));
      }
      // const result = await axios.get(`${API_BASE_HOST}/collections/${tournament.collection_key}/verify/${req.query.address}`, {
      //   headers: { 'Authorization': `Bearer ${accessToken}` }
      // });
		  // const is_nft = await connector.checkNft(tournament.collection_address, req.query.address);
      // if (!is_nft) {
      //   return res.json(new Response().ok(0));
      // }
      return res.json(new Response().ok(1));
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/tournaments/social-verify/${err.message}`);
		  return res.status(400).json(new Response().error(err.message));
    }
  })
  .get('/:tournament_id/social-verify', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
    const tournament_id = parseInt(req.params.tournament_id, 10);
    if (isNaN(tournament_id)) {
      return res.status(400).json(new Response().error("Tournament id is not set"));
    }
    try {
      const tasks = await prisma.tournament_tasks.findMany({
			  select: { id: true, social: true, username: true, action: true, social_id: true },
			  where: { tournament_id }
		  });
      if (Array.isArray(tasks)) {
		    const authProvider = await prisma.auth_providers.findFirst({
          where: { game_user_id: req.user.id }
        });
		    for (const task of tasks) {
			    if (task.social === 'telegram') {
				    try {
			        const chatMember = await gameBot.api.getChatMember(`@${task.username}`, authProvider.telegram_id);
			        if (!["member", "administrator", "creator"].includes(chatMember.status)) {
				        return res.json(new Response().error('errors.AcountNotFoundInTelegramBot'));
			        }
            } catch (err) {
              return res.json(new Response().error('errors.AcountNotFoundInTelegramBot'));
            }
			    }
		    }
      }
			
		  return res.json(new Response().ok(1));
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/tournaments/social-verify/${err.message}`);
		  return res.status(400).json(new Response().error(err.message));
    }
  })
  .get('/:tournament_id/result-level/:level_id', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
    try {
      const tournament_id = parseInt(req.params.tournament_id);
      if (isNaN(tournament_id)) {
        return res.status(400).json(new Response().error("Tournament id is not set"));
      }
      const tournament = await prisma.tournaments.findFirst({
        select: {
          id: true,
          type: true,
          status: true,
          entry_mode: true,
          schedule: true,
        },
        where: { id: tournament_id }
      });
      if (!tournament) {
        return res.status(404).json(new Response().error("Tourname does not found"))
      }
      const level_id = parseInt(req.params.level_id);
      if (isNaN(level_id)) {
        return res.status(400).json(new Response().error("Tournament id is not set"));
      }
      const level = await prisma.tournament_levels.findFirst({
        where: { level_id, tournament_id },
      });
      const nextLevel = await prisma.tournament_levels.findFirst({
        select: {
          id: true,
          order: true,
          level: {
            select: {
              id: true
            }
          }
        },
        where: { id: level.id + 1, tournament_id }
      });
      const data = {};
      if (nextLevel) {
        data.next_level_id = nextLevel;
      }
      const participant = await prisma.tournament_participants.findFirst({
        where: { tournament_id, user_id: req.user.id }
      });
      let betterResult;
      if (tournament.type === "survival") {
        betterResult = await prisma.attempts.findFirst({
          where: { tournament_id, level_id, success: true },
          orderBy: { scores: "desc" }
        });
        const betterCount = await prisma.tournament_participants.count({
          where: {
            tournament_id,
            score: {
              gt: participant.scores
            }
          }
        });

        const rank = betterCount + 1;
        data.rank = rank;
      } else {
        const betterCount = await prisma.tournament_participants.count({
          where: {
            tournament_id,
            best_time: {
              lt: participant.best_time
            }
          }
        });

        const rank = betterCount + 1;
        data.rank = rank;
        betterResult = await prisma.attempts.findFirst({
          where: { tournament_id, level_id, success: true },
          orderBy: { time: "asc" }
        });
      }
      data.better_result = betterResult;
      data.tournament = tournament;
      return res.json(new Response().data(data));
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/tournaments/result-level/${err.message}`);
		  return res.status(400).json(new Response().error(err.message));
    }
  })
  .get('/:tournament_id/attempts', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
    try {
      const tournament_id = parseInt(req.params.tournament_id);
      if (isNaN(tournament_id)) {
        return res.status(400).json(new Response().error("Tournament id is not set"));
      }
      const attempts = await prisma.attempts.findMany({
        where: { user_id: req.user.id, tournament_id },
        orderBy: { id: 'desc' }
      });
      return res.json(new Response().data(attempts));
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/tournaments/attempts/${err.message}`);
		  return res.status(400).json(new Response().error(err.message));
    }
  })
  .get('/my/:tournament_id', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
     try {
      const tournament_id = parseInt(req.params.tournament_id);
      if (isNaN(tournament_id)) {
        return res.status(400).json(new Response().error("Tournament id is not set"));
      }
      const tournament = await prisma.tournaments.findFirst({
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          prizes: true,
          entry_amount: true,
          entry_tickets: true,
          start_at: true,
          end_at: true,
          players_count: true,
          collection_address: true,
          schedule: true,
          icon: true,
          color: true,
          network: true,
          currency_token: true,
          address: true,
          token: true,
          player_limit: true,
          status: true,
          winners_count: true,
          entry_mode: true,
          reward_source: true,
          dex_id: true,
	        prize_network: true,
          prize_token: true,
          prizes: {
            select: {
              nft: true,
              network: true,
              percent: true,
              amount: true,
              place_from: true,
              place_to: true,
            }
          },
          levels: {
            select: {
              level_id: true,
              order: true
            }
          },
        },
        where: { id: tournament_id, user_id: req.user.id }
      });
      if (!tournament) {
        return res.status(404).json(new Response().error("Tourname does not found"))
      }
      if (!["ton", "botchain"].includes(tournament.network)) {
        return res.status(400).json(new Response().error(`${tournament.network} does not support!`));
      }
      let balance;
      const result = await axios.get(`${API_BASE_HOST}/wallets/balance/${tournament.network}/${tournament.address}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (result.data.ok) {
        balance = result.data.data.balance.human;
      } else {
        balance = '0';
      }
      const balances = {
        [tournament.currency_token]: {
          balance: balance,
          is: ["ton", "bot"].includes(tournament.currency_token) ? 'enter' : ["ton", "bot"].includes(tournament.prize_token) ? 'prize' : 'balance in nattive coin',
        },
      }
      if (["ton", "botchain"].includes(tournament.network) && !["ton", "bot"].includes(tournament.currency_token)) {
        try {
          const result = await axios.get(`${API_BASE_HOST}/wallets/balance/${tournament.network}/${tournament.address}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          if (result.data.ok) {
            balance = result.data.data.balance.human;
          } else {
            balance = 0;
          }
        } catch (err) {
          balance = 0;
        }
        balances[tournament.currency_token] = {
          balance: new BigNumber(balance).div(10 ** networks[tournament.network].decimals).toNumber(),
          is: 'enter',
        }
      }
      if (["ton", "botchain"].includes(tournament.prize_network) && !["ton", "bot"].includes(tournament.prize_token) && tournament.prize_token != tournament.token) {
        try {
          const result = await axios.get(`${API_BASE_HOST}/wallets/balance/${tournament.prize_network}/${tournament.address}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          if (result.data.ok) {
            balance = result.data.data.balance.human;
          } else {
            balance = '0';
          }
        } catch (err) {
          balance = 0;
        }
        balances[tournament.prize_token] = {
          balance,
          is: 'prize',
        }
      }
      tournament.accounts = balances;
      if (tournament.collection_address) {
        const collection = {};
        tournament.collection = collection;
      }
      return res.json(new Response().data(tournament)); 
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/tournaments/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .get('/:tournament_id', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
     try {
      const tournament_id = parseInt(req.params.tournament_id);
      if (isNaN(tournament_id)) {
        return res.status(400).json(new Response().error("Tournament id is not set"));
      }
      const tournament = await prisma.tournaments.findFirst({
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          prizes: true,
          entry_amount: true,
          entry_tickets: true,
          start_at: true,
          end_at: true,
          players_count: true,
          collection_address: true,
          schedule: true,
          icon: true,
          color: true,
          network: true,
          currency_token: true,
          address: true,
          token: true,
          player_limit: true,
          status: true,
          winners_count: true,
          entry_mode: true,
          reward_source: true,
          dex_id: true,
	        prize_network: true,
          prize_token: true,
          prizes: {
            select: {
              nft: true,
              network: true,
              percent: true,
              amount: true,
              place_from: true,
              place_to: true,
            }
          },
          levels: {
            select: {
              level_id: true,
              order: true
            }
          },
          tasks: {
            select: {
              id: true,
              url: true,
              action: true,
              social: true,
              username: true,
            }
          }
        },
        where: { id: tournament_id }
      });
      if (!tournament) {
        return res.status(404).json(new Response().error("Tourname does not found"))
      }
      if (!["ton", "botchain"].includes(tournament.network)) {
        return res.status(400).json(new Response().error(`${tournament.network} does not support!`));
      }
      let entry_balance;
      try {
        if (["ton", "botchain"].includes(tournament.network) && !["ton", "bot"].includes(tournament.currency_token)) {
          const result = await axios.get(`${API_BASE_HOST}/wallets/balance/${tournament.network}/${tournament.address}/${tournament.currency_token}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          if (result.data.ok) {
            entry_balance = result.data.data.balance.human;
          } else {
            entry_balance = '0';
          }
        } else {
          const result = await axios.get(`${API_BASE_HOST}/wallets/balance/${tournament.network}/${tournament.address}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          if (result.data.ok) {
            entry_balance = result.data.data.balance.human;
          } else {
            entry_balance = '0';
          }
        }
      } catch (err) {
        entry_balance = 0;
      }
      tournament.entry_balance = entry_balance;

      let prize_balance;
      try {
        if (tournament.network === tournament.prize_network && tournament.currency_token === tournament.prize_token) {
          prize_balance = tournament.entry_balance;
        } else if (["ton", "botchain"].includes(tournament.prize_network) && !["ton", "bot"].includes(tournament.prize_token)) {
          const result = await axios.get(`${API_BASE_HOST}/wallets/balance/${tournament.prize_network}/${tournament.address}/${tournament.prize_token}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          if (result.data.ok) {
            prize_balance = result.data.data.balance.human;
          } else {
            prize_balance = '0';
          }
        } else {
          const result = await axios.get(`${API_BASE_HOST}/wallets/balance/${tournament.prize_network}/${tournament.address}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          if (result.data.ok) {
            prize_balance = result.data.data.balance.human;
          } else {
            prize_balance = '0';
          }
        }
      } catch (err) {
        prize_balance = 0;
      }
      tournament.prize_balance = prize_balance;
      if (tournament.collection_address) {
        const collection = {};
        tournament.collection = collection;
      }
      return res.json(new Response().data(tournament)); 
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/tournaments/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .post('/', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
    try {
      const result = await tournamentModule.createTournament(req.body, req.user, req.headers['access-token']);
      if (result?.error && result?.code !== 200) {
      return res.json(new Response().error(result.error));
      }
      return res.json(new Response().data(result));
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/tournaments/create/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .post('/:tournament_id/public', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
  try {
    const tournament_id = parseInt(req.params.tournament_id);
    if (isNaN(tournament_id)) {
      return res.status(400).json(new Response().error("Tournament id is not set"));
    }
    const tournament = await prisma.tournaments.findFirst({
      select: {
        id: true,
        address: true,
        start_at: true,
        end_at: true,
        schedule: true
      },
      where: { id: tournament_id }
    });
    if (!tournament) {
      return res.status(404).json(new Response().error("Tourname does not found"))
    }
    if (["special", "season"].includes(tournament.schedule)) {
      const startedAt = new Date(tournament.start_at).getTime();
      if (new Date(tournament.end_at) <= Date.now()) {
        return res.status(400).json(new Response().error("The current date is already past the set date for the tournament."));
      } else if (startedAt <= Date.now()) {
        await prisma.tournaments.update({
          data: { status: "ongoing" },
          where: { id: tournament.id }
        });
      } else if (startedAt > Date.now()) {
        await prisma.tournaments.update({
          data: { status: "upcoming" },
          where: { id: tournament.id }
        });
      }
    } else if (tournament.schedule === "daily") {
      const now = new Date();
      const end_at = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      await prisma.tournaments.update({
        data: { start_at: now, end_at: end_at, status: "ongoing" },
        where: { id: tournament.id }
      });
    } else if (tournament.schedule === "weekly") {
      const now = new Date();
      const end_at = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      await prisma.tournaments.update({
        data: { start_at: now, end_at: end_at, status: "ongoing" },
        where: { id: tournament.id }
      });
    }
    return res.json(new Response().ok(1));
  } catch (err) {
    await gameBot.api.sendMessage(406497473, `game/tournaments/public/${err.message}`);
    return res.status(400).json(new Response().error(err.message));
  }
})
.post('/:tournament_id/run', async (req, res) => {
  try {
    const tournament_id = parseInt(req.params.tournament_id);
    if (isNaN(tournament_id)) {
      return res.status(400).json(new Response().error("Tournament id is not set"));
    }
    await prisma.tournaments.update({
      data: { status: "ongoing" },
      where: { id: tournament_id, status: "upcoming" }
    });
    return res.json(new Response().ok(1));
  } catch (err) {
    await gameBot.api.sendMessage(406497473, `game/tournaments/run/${err.message}`);
    return res.status(400).json(new Response().error(err.message));
  }
})
.post('/:tournament_id/reward', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
  try {
    const tournament_id = parseInt(req.params.tournament_id);
    if (isNaN(tournament_id)) {
      return res.status(400).json(new Response().error("Tournament id is not set"));
    }
    const result = await tournamentModule.giveAwayFromTournamentPool({ tournament_id, order_id:req.body.order_id }, req.headers['access-token']);
    if (result?.error) {
      return res.status(400).json(new Response().error(result.error));
    }
    return res.json(new Response().ok(1));
  } catch (err) {
    console.error(err);
    await gameBot.api.sendMessage(406497473, `game/tournaments/reward/${err.message}`);
    return res.status(400).json(new Response().error(err.message));
  }
})
.post('/:tournament_id/swap', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
  try {
    const tournament_id = parseInt(req.params.tournament_id);
    if (isNaN(tournament_id)) {
      return res.status(400).json(new Response().error("Tournament id is not set"));
    }
    const result = await tournamentModule.swap({ tournament_id, ...req.body }, req.headers['access-token']);
    if (result?.error) {
      return res.status(400).json(new Response().error(result.error));
    }
    return res.json(new Response().ok(1));
  } catch (err) {
    console.error(err);
    await gameBot.api.sendMessage(406497473, `game/tournaments/reward/${err.message}`);
    return res.status(400).json(new Response().error(err.message));
  }
})
.post('/:tournament_id/burn_lp', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
  try {
    const tournament_id = parseInt(req.params.tournament_id);
    if (isNaN(tournament_id)) {
      return res.status(400).json(new Response().error("Tournament id is not set"));
    }
    const result = await tournamentModule.burnLP({ tournament_id, amount: req.body.amount, order_id: req.body.order_id }, req.headers['access-token']);
    if (result?.error) {
      return res.status(400).json(new Response().error(result.error));
    }
    return res.json(new Response().ok(1));
  } catch (err) {
    console.error(err);
    await gameBot.api.sendMessage(406497473, `game/tournaments/reward/${err.message}`);
    return res.status(400).json(new Response().error(err.message));
  }
})
.post('/:tournament_id/add-liquidity', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
  try {
    const tournament_id = parseInt(req.params.tournament_id);
    if (isNaN(tournament_id)) {
      return res.status(400).json(new Response().error("Tournament id is not set"));
    }
    const result = await tournamentModule.addLuquidity({ tournament_id, order_id:req.body.order_id }, req.headers['access-token']);
    if (result?.error) {
      return res.status(400).json(new Response().error(result.error));
    }
    return res.json(new Response().data(result));
  } catch (err) {
    console.error(err);
    await gameBot.api.sendMessage(406497473, `game/tournaments/reward/${err.message}`);
    return res.status(400).json(new Response().error(err.message));
  }
})
.post('/:tournament_id/direct-add-liquidity', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
  try {
    const tournament_id = parseInt(req.params.tournament_id);
    if (isNaN(tournament_id)) {
      return res.status(400).json(new Response().error("Tournament id is not set"));
    }
    const result = await tournamentModule.addDirectLiquidity({ tournament_id, ...req.body }, req.headers['access-token']);
    if (result?.error) {
      return res.status(400).json(new Response().error(result.error));
    }
    return res.json(new Response().ok(1));
  } catch (err) {
    console.error(err);
    await gameBot.api.sendMessage(406497473, `game/tournaments/reward/${err.message}`);
    return res.status(400).json(new Response().error(err.message));
  }
})
.post('/:tournament_id/refund', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
  try {
    const tournament_id = parseInt(req.params.tournament_id);
    if (isNaN(tournament_id)) {
      return res.status(400).json(new Response().error("Tournament id is not set"));
    }
    const result = await tournamentModule.refund({ tournament_id, order_id: req.body.order_id }, req.headers['access-token']);
    if (result?.error) {
      return res.status(400).json(new Response().error(result.error));
    }
    return res.json(new Response().ok(1));
  } catch (err) {
    console.error(err);
    await gameBot.api.sendMessage(406497473, `game/tournaments/reward/${err.message}`);
    return res.status(400).json(new Response().error(err.message));
  }
})
.get('/:tournament_id/pool', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
  try {
    const tournament_id = parseInt(req.params.tournament_id);
    if (isNaN(tournament_id)) {
      return res.status(400).json(new Response().error("Tournament id is not set"));
    }
    const result = await tournamentModule.getPool({ tournament_id }, req.headers['access-token']);
    if (result?.error) {
      return res.status(400).json(new Response().error(result.error));
    }
    return res.json(new Response().data(result));
  } catch (err) {
    console.error(err);
    await gameBot.api.sendMessage(406497473, `game/tournaments/reward/${err.message}`);
    return res.status(400).json(new Response().error(err.message));
  }
})
.post('/:tournament_id/register', passport.authenticate("game-jwt", { session: false }), async (req, res) => {
	const tournament_id = parseInt(req.params.tournament_id, 10);
  if (isNaN(tournament_id)) {
    return res.status(400).json(new Response().error("Tournament id is not set"));
  }
	try {
    const address = req.query.address;
    if (!address) {
      return res.status(400).json(new Response().error("Address incorrect"));
    }
    const wallet = await prisma.game_wallets.findFirst({
      where: { address }
    });
    if (!wallet) {
      return res.status(400).json(new Response().error("Wallet does not found."));
    }
    const user_id = req.user.id;
    const tournamentParticipant = await prisma.tournament_participants.findFirst({
      where: { tournament_id, user_id }
    });
    if (tournamentParticipant) {
      return res.json(new Response().error("Tournament participant already signed"));
    }
    const tournament = await prisma.tournaments.findFirst({
      select: {
        id: true,
        address: true,
        network: true,
        entry_tickets: true,
        collection_address: true,
        entry_amount: true,
        token: true,
        winners_count: true,
        players_count: true
      },
      where: { id: tournament_id }
    });
    if (!tournament) {
      return res.status(404).json(new Response().error("Tourname does not found"))
    }
    if (tournament.players_count === tournament.player_limit) {
      return res.status(400).json(new Response().error("Tournament does not found!"));
    }
		const tasks = await prisma.tournament_tasks.findMany({
			select: { id: true, social: true, username: true, action: true, social_id: true },
			where: { tournament_id }
		});
    if (Array.isArray(tasks)) {
		  const authProvider = await prisma.auth_providers.findFirst({
        where: { game_user_id: req.user.id }
      });
		  for (const task of tasks) {
			  if (task.social === 'telegram') {
				  try {
			      const chatMember = await gameBot.api.getChatMember(`@${task.username}`, authProvider.telegram_id);
			      if (!["member", "administrator", "creator"].includes(chatMember.status)) {
				      return res.json(new Response().error('errors.AcountNotFoundInTelegramBot'));
			      }
          } catch (err) {
            return res.json(new Response().error('errors.AcountNotFoundInTelegramBot'));
          }
			  }
		  }
    }
    if (tournament.collection_address) {
      if (!req.query.address) {
        return res.json(new Response().json("Onwer address incorrect"));
      }
      
      if (!["ton", "botchain"].includes(tournament.network)) {
        return res.status(400).json(new Response().error(`${tournament.network} does not support!`));
      }
		  // const is_nft = await connector.checkNft(tournament.collection_address, req.query.address);
      // if (!is_nft) {
      //   return res.json(new Response().error("errors.notNFT"));
      // }
    }
    if (tournament.entry_tickets) {
      if (tournament.entry_tickets > req.user.tickets) {
        return res.json(new Response().error("errors.notEnouthTicktes"));
      }
      await prisma.$transaction(async (tx) => {
        await tx.game_users.update({
          where: { id: req.user.id },
          data: { tickets: { decrement:  tournament.entry_tickets } }
        });
        await tx.tournament_participants.create({
          data: {
            tournament_id,
            user_id: req.user.id,
            wallet_id: wallet.id
          }
        });
        await tx.tournaments.update({
          data: {
            players_count: { increment: 1 }
          },
          where: { id: tournament_id }
        });
      });
    }
		return res.json(new Response().ok(1));
	} catch (err) {
    await gameBot.api.sendMessage(406497473, `game/tournaments/register/${err.message}`);
		return res.status(400).json(new Response().error(err.message));
	}
});

module.exports = router;