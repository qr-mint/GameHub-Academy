const { Router } = require("express");
const axios = require('axios');

const Response = require("../utils/ApiResponse");
const prisma = require("../prisma");
const { gameBot } = require("../hardest-game-bot");

const router = Router();

const GET_GAME_ADDRESS = (network) => {
  if (network === "ton") {
    return process.env.GAME_TON_ADDRESS;
  } else if (["botchain"].includes(network)) {
    return process.env.GAME_EVM_ADDRESS;
  }
  return '';
}

const nftPrices = {
  dev: {
    referral: 0.01,
    achieve: 0.01,
    map: 0.01
  },
  prod: {
    referral: 50,
    achieve: 0.1,
    map: 0.1
  }
};

const tickets = [
  {
    id: 1,
    tickets: 20,
    price: 0.5
  },
  {
    id: 2,
    tickets: 70,
    price: 1.5
  },
  {
    id: 2,
    tickets: 300,
    price: 5
  }
];

router
  .get('/tickets', async (req, res) => {
    const userDiscount = await prisma.user_discounts.findFirst({
      select: {
        discount: {
          select: {
            value: true
          }
        }
      },
      where: { user_id: req.user.id },
      orderBy: { expires_at: "desc" }
    });
    if (userDiscount) {
      tickets = tickets.map((ticket) => ({
        priceWithDiscount: ticket.price - (ticket.discount.value * ticket.price / ticket.discount.value),
        discount: ticket.discount.value,
        ...ticket
      }));
      return res.json(new Response().data(tickets)); 
    }
    return res.json(new Response().data(tickets)); 
  })
  .get('/transactions', async (req, res) => {
    try {
      const { limit } = req.query;
      const game_transactions = await prisma.game_transactions.findMany({
        where: { user_id: req.user.id },
        take: limit
      });
      return res.json(new Response().data(game_transactions)); 
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/payments/transactions/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .get('/:id', async (req, res) => {
    try {
      const gameTransactionId = parseInt(req.params.id);
      if (isNaN(gameTransactionId)) {
        return res.status(400).json(new Response().error("Game transaction id inccorect"));
      }
      const game_transaction = await prisma.game_transactions.findFirst({
        where: { id: gameTransactionId},
      });
      return res.json(new Response().data(game_transaction)); 
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/payments/transactions/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  })
  .post("/", async (req, res) => {
    try {
      let { amount, name, token, address_from, network = 'ton', type, tournament_id, ticket_id, nft_type = "referral" } = req.body;
      if (!network) {
        return res.status(400).json(new Response().error("Network incorrect"))
      }
      if (!address_from) {
        return res.status(400).json(new Response().error("Address from incorrect"))
      }
      let paymentBody, data;
      if (!['join_jackpot', 'buy_ticket', 'mint_nft', 'create_tournament', 'burn_lp', 'provide_lp', 'refund', 'swap'].includes(type)) {
        return res.status(400).json(new Response().error("Type incorrect"))
      }
      const partner = await prisma.game_referrals.findFirst({
        where: { user_id: req.user.id }
      });
      let gameReferralAddress;
      if (partner) {
        gameReferralAddress = await prisma.game_referral_nfts.findFirst({
          where: { game_user_id: partner.invited_id, chain: network  }
        });
      }
      if (type === "join_jackpot") {
        if (!tournament_id) {
          return res.status(400).json(new Response().error("Tourname id incorrect"));
        }
        const tourname = await prisma.tournaments.findFirst({
          where: {
            id: tournament_id,
          },
          orderBy: { id: 'desc' }
        });

        if (tourname.players_count === tourname.player_limit) {
          return res.status(400).json(new Response().error("Tournament does not found!"));
        }
          // winners_count: true,
          // players_count: true
        const tournamentParticipant = await prisma.tournament_participants.findFirst({
          where: { tournament_id, user_id: req.user.id }
        });
        if (tourname.entry_mode==="one_time" && tournamentParticipant) {
          return res.json(new Response().error("Tournament participant already signed"));
        }
        const tournamentCreatedParterNFT = await prisma.game_referral_nfts.findFirst({
          where: { game_user_id: tourname.user_id, chain: tourname.network  }
        });
        // const tournamentLevel = await prisma.tournament_levels.findFirst({
        //   select: {
        //     level: {
        //       select: {
        //         nft: {
        //           select: {
        //             address: true
        //           }
        //         }
        //       }
        //     }
        //   },
        //   where: { tournament_id },
        //   orderBy: { id: "desc" }
        // });
        const GAME_ADDRESS = GET_GAME_ADDRESS(tourname.network);

        amount = tourname.entry_amount,
        paymentBody = {
          address_to: tourname.address,
          name: tourname.name,
          amount: tourname.entry_amount,
          address_from,
          network: tourname.network,
          currency_token: tourname.currency_token.toLowerCase(),
          nft: false,
          ...(tournamentCreatedParterNFT ? {
            extra_percent: 5,
            extra_address: tournamentCreatedParterNFT.address
          } : {
            extra_percent: 5,
            extra_address: GAME_ADDRESS
          }),
			    ...(gameReferralAddress
              ? {referral_address: gameReferralAddress.address }
              : { referral_address: GAME_ADDRESS })
        }
        token = tourname.currency_token;
        data = { tournament_id };
      } else if (type === "buy_ticket") {
        if (!token) {
          return res.status(400).json(new Response().error("Token incorrect"))
        }
        const ticket = tickets.find((ticket) => ticket.id === ticket_id);
        if (!ticket) {
          return res.status(400).json(new Response().error(`Ticket ${ticket_id} incorrect`));
        }
        amount = ticket.price,
        paymentBody = {
          name: `Ticket ${ticket.tickets}`,
          amount: ticket.price,
          address_from,
          network,
          currency_token: 'ton',
          nft: false,
          ...(gameReferralAddress ? {
            referral_address: gameReferralAddress.address,
            referal_fee_percent: 20,
          } : {})
        }
        data = ticket;
      } else if (type === "create_tournament") {
        amount = 0.0001;
        paymentBody = {
          name: `Create tournament ${name}`,
          amount,
          address_from,
          network,
          currency_token: token,
          pool: true,
          type: "deploy"
        }
      } else if (type === "mint_nft") {
        if (!['referral', 'achieve', 'map'].includes(nft_type)) {
          return res.status(400).json(new Response().error("NFT type"));
        }
        if (!name) {
          return res.status(400).json(new Response().error("Name incorrect"))
        }
        if (!token) {
          return res.status(400).json(new Response().error("Token incorrect"))
        }
        const amount = req.user.username === "dao0dev" ? 0.001 :process.env.MODE === "dev" ? nftPrices.dev[nft_type] : nftPrices.prod[nft_type];
        paymentBody = {
          name,
          amount,
          address_from,
          network,
          currency_token: token,
          nft: true,
          ...(gameReferralAddress ? {
            referral_address: gameReferralAddress.address,
            referal_fee_percent: 50,
          } : {})
        };
        data = { name, nft: true };
        
      } else if (type === "burn_lp") {
        amount = 0.0001;
        paymentBody = {
          name: `Burn lp`,
          amount,
          address_from,
          network,
          currency_token: 'ton',
          pool: true,
          type: "burn_lp"
        }
      } else if (type === "provide_lp") {
        amount = 0.0001;
        paymentBody = {
          name: `Provide lp`,
          amount,
          address_from,
          network,
          currency_token: 'ton',
          pool: true,
          type: "provide_lp"
        }
      } else if (type === "refund") {
        amount = 0.0001;
        paymentBody = {
          name: `Refund`,
          amount,
          address_from,
          network,
          currency_token: 'ton',
          pool: true,
          type: "refund"
        }
      } else if (type === "swap") {
        amount = 0.0001;
        paymentBody = {
          name: `Swap`,
          amount,
          address_from,
          network,
          currency_token: 'ton',
          pool: true,
          type: "swap"
        }
      }
      const wallet = await prisma.game_wallets.findFirst({
        where: { address: address_from }
      });
      if (!wallet) {
        return res.status(400).json(new Response().error("Wallet does not found!"));
      }
      const customPaymentResponsed = await axios.post(`${process.env.API_BASE_HOST}/payments/qrmint/create`, paymentBody, {
        headers: {
          'Authorization': `Bearer ${req.headers['access-token']}`
        }
      });
      
      const gameTransaction = await prisma.game_transactions.create({
        data: {
          user_id: req.user.id,
          amount,
          type,
          token,
          network,
          status: 'pending',
          order_id: customPaymentResponsed.data.data.order_id,
          data,
          wallet_id: wallet.id
        }
      });
      return res.json(new Response().data({ gameTransaction, data: customPaymentResponsed.data.data })); 
    } catch (err) {
      await gameBot.api.sendMessage(406497473, `game/payments/${err.message}`);
      return res.status(400).json(new Response().error(err.message));
    }
  });

module.exports = router;