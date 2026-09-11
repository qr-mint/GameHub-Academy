import axios from "axios";

import { gameBot } from "../game-bot";

const prisma = require("../prisma");
const Validator = require("../utils/validator");
const networks = require("../config/network.json");

import BigNumber from "bignumber.js";

const API_BASE_HOST = process.env.API_BASE_HOST;

export const createTournament = async ({
  name, description,
  entry_amount, entry_tickets,
  start_at, end_at, players_count,
  icon, color, network, currency_token, token,
  player_limit, prizes,
  winners_count, collection_address,
  schedule, type, telegram_tasks,
  entry_mode, order_id, owner_address,
  reward_source, dex_pair_id,
	prize_network, prize_token,
}, user: any, accessToken: string) => {
    entry_amount = parseFloat(entry_amount);
    entry_tickets = parseInt(entry_tickets);
    if (!name) {
      return { error: "Name incorrect" };
    }
    if (isNaN(order_id)) {
      return { error: "Order id incorrect" };
    }
    if (!["leaderboard", "single_attempt", "survival", "race"].includes(type)) {
      return { error: "Type incorrect" };
    }
    if (!["daily", "weekly", "special", "season"].includes(schedule)) {
      return { error: "Schedule incorrect" };
    }
    if (!description) {
      return { error: "Description incorrect" };
    }
    if ((!entry_amount && isNaN(entry_tickets)) || (!entry_tickets && isNaN(entry_amount))) {
      return { error: "Entry fee or tickets incorrect" };
    }
    if (!player_limit) {
      return { error: "Player limit incorrect" };
    }
    if (isNaN(winners_count)) {
      return { error: "Winners count incorrect" };
    }
    if (!icon) {
      return { error: "Icon incorrect" };
    }
    if (isNaN(color)) {
      return { error: "Color incorrect" };
    }
    if (!["one_time", "per_attempt"].includes(entry_mode)) {
      return { error: "Entry mode incorrect" };
    }
    if (["season", "special"].includes(schedule)) {
      if (end_at && start_at) {
        if (!Validator.date(end_at)) {
          return { error: "Incorrect ended_at" };
        } 
        if (!Validator.date(start_at)) {
          return { error: "Incorrect started_at" };
        } 
        const now = Date.now();
        start_at = new Date(start_at);
        end_at = new Date(end_at);
        if (end_at.getTime() <= now) {
          return { error: "Incorrect end_at" };
        }
        if (start_at.getTime() <= now) {
          return { error: "Incorrect start_at" };
        } 
        if (end_at.getTime() <= start_at.getTime()) {
          return { error: "Incorrect end_at" };
        }
      }
    }
    if (!prizes || !Array.isArray(prizes)) {
      return { error: "Prizes incorrect!" };
    }
    const prizePercentTotal = prizes.reduce((acc, curr) => acc + curr.percent, 0);
    if (prizePercentTotal > 100) {
      return { error: "Prizes percent total more then 100!" };
    }
  
    if (!["ton", "botchain"].includes(network)) {
      return { error: `${network} does not support!` };
    }
    if (collection_address) {
      // if (!connector.isValid(collection_address)) {
      //   return { error: 'Collection address' };
      // }
    }
    if (owner_address) {
      // if (!connector.isValid(owner_address)) {
      //   return { error: 'Owner address incorrect' };
      // }
    }
    const wallet = await prisma.game_wallets.findFirst({
      where: { address: owner_address }
    });
    if (!wallet) {
      return { error: 'Owner address incorrect' }; 
    }
    let address: string;
    try {
      const poolResponse = await axios.post(`${API_BASE_HOST}/pools/${network}/deploy`,
        { network, order_id, ...(dex_pair_id ? { dex_pair_id } : {}) }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      address = poolResponse.data.data.address;
    } catch (err) {
      console.log(err);
      return { error: "Tournament pool error" };
    }
    
    const tournament = await prisma.tournaments.create({
      data: {
        name, type, description, wallet_id: wallet.id,
        ...(entry_amount ? { entry_amount } : {}),
        ...(entry_tickets ? { entry_tickets } : {}),
        ...(start_at ? { start_at } : {}),
        ...(end_at ? { end_at } : {}),
        players_count, icon, color,
        network, address, currency_token: currency_token.toLowerCase(),
        token: token.toLowerCase(), collection_address,
        player_limit, winners_count,
        user_id: user.id, schedule,
        entry_mode, reward_source,
        ...(dex_pair_id ? { dex_id: dex_pair_id } : {}),
	      prize_network, prize_token,
      }
    });

    const social_tasks = [];
    for (const telegram of telegram_tasks) {
      const username = telegram.value.replace('https://t.me/', '');
      try {
        const chatMember = await gameBot.api.getChatMember(`@${username}`, gameBot.botInfo.id);
        if (chatMember.status !== "administrator") {
          return { error: 'errors.AcountNotFoundInTelegramBot', code: 200 };
        }
      } catch (err) {
        return { error: 'errors.AcountNotFoundInTelegramBot', code: 200 };
      }
      social_tasks.push({
        username,
        link: telegram.value,
        action: 'join',
        social: 'telegram',
        ...(telegram.id ? { id: telegram.id } : {})
      });
    }

    await prisma.$transaction(async (prisma: any) => {
      if (Array.isArray(social_tasks) && social_tasks.length > 0) {
        await prisma.tournament_tasks.createMany({
          data: social_tasks.map((social) => ({
            url: social.link,
            action: social.action,
            social: social.social,
            social_id: social.social_id,
            username: social.username,
            tournament_id: tournament.id,
          }))
        });
      }
      await prisma.tournament_prizes.createMany({
        data: prizes.map((prize) => ({
          tournament_id: tournament.id,
          nft:          prize.nft,
          network:      network,
          ...(prize.percent ? { percent: prize.percent } : {}),
          ...(prize.amount ? { percent: prize.amount } : {}),
          place_from: prize.place_from,
          place_to: prize.place_to
        }))
      });
    });
    return tournament;
};

export const giveAwayFromTournamentPool = async ({ tournament_id }, accessToken: string) => {
  const tournament = await prisma.tournaments.findFirst({
    select: {
      id: true, address: true,
      prize_network: true,
      type: true, token: true,
      prize_token: true
    },
    where: { id: tournament_id }
  });
  if (!tournament) {
    return { error: "Tourname does not found" };
  }
  const tournamentPrizes = await prisma.tournament_prizes.findMany({
    select: {
      percent: true,
      amount: true,
      place_from: true,
      place_to: true,
    },
    where: { tournament_id: tournament.id }
  });
  
  const orderBy  = tournament.type === "survival" ? { scores: "desc" } : { best_time: "asc" };
  const winners = await prisma.tournament_participants.findMany({
    select: {
      wallet: {
        select: {
          address: true
        }
      }
    },
    where: { tournament_id: tournament.id, status: "winner" },
    orderBy: orderBy
  });
  let balance: any;
  if (["bot", "ton"].includes(tournament.prize_token)) {
    try {
      const result = await axios.get(`${API_BASE_HOST}/wallets/balance/${tournament.prize_network}/${tournament.address}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (result.data.ok) {
        balance = new BigNumber(result.data.data).div(10 ** networks[tournament.network].decimals).toNumber();
      } else {
        return { error: "Balance error" };
      }
    } catch (err) {
      return { error: "Prize pool is empty" };
    }
  } else {
    try {
      const result = await axios.get(`${API_BASE_HOST}/wallets/balance/${tournament.prize_network}/${tournament.address}/${tournament.prize_token}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (result.data.ok) {
        balance = result.data.data.balance.human;
      } else {
        return { error: "Balance error" };
      }
    } catch (err) {
      return { error: "Prize pool is empty" };
    }
  }
  const preparedSendAddresses = [];
  for (let winnerIndex = 0; winnerIndex < winners.length; winnerIndex++) {
    const winner = winners[winnerIndex];
    const place = winnerIndex+1;
    const tournamentPrize = tournamentPrizes.find((tp: any) => tp.place_from <= place && tp.place_to >= place);
    let reward: any;
    if (tournamentPrize.percent) {
      reward = balance * (tournamentPrize.percent / 100);
    } else if (tournamentPrize.amount) {
      reward = tournamentPrize.amount;
    }
    preparedSendAddresses.push({
      to: winner.wallet.address,
      amount: reward
    });
  }
  if (preparedSendAddresses.length == 0) {
    return { error: "preparedSendAddresses is empty" }
  }
  try {
    await axios.post(`${process.env.API_BASE_HOST}/pools/give-away/${tournament.prize_network}/${tournament.address}`, { currency: tournament.token, data: preparedSendAddresses }, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    await prisma.tournament_actions.create({
      data: {
        tournament_id: tournament.id,
        amount: balance, type: "give_away_prizes",
        data: {
          currency: tournament.token, data: preparedSendAddresses
        }
      }
    });
  } catch (err) {
    console.log(err);
    return { error: "Tournament pool error" };
  }
};

export const burnLP = async ({ tournament_id, amount, order_id }, accessToken: string) => {
  if (isNaN(order_id)) {
    return { error: "Order id incorrect" };
  }
  const tournament = await prisma.tournaments.findFirst({
    select: {
      id: true, address: true,
      prize_network: true,
    },
    where: { id: tournament_id }
  });
  if (!tournament) {
    return { error: "Tourname does not found" };
  }
  if (!amount) {
    return { error: "Amount incorrect" };
  }
  try {
    await axios.post(`${process.env.API_BASE_HOST}/pools/dex/burn/${tournament.prize_network}/${tournament.address}`, { amount, order_id }, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    await prisma.tournament_actions.create({
      data: { tournament_id: tournament.id, amount, type: "burn_lp" }
    });
  } catch (err) {
    console.log(err);
    return { error: "Tournament pool error" };
  }
}

export const swap = async ({ tournament_id, amount, to, from, order_id }, accessToken: string) => {
  if (isNaN(order_id)) {
    return { error: "Order id incorrect" };
  }
  const tournament = await prisma.tournaments.findFirst({
    select: {
      id: true, address: true,
      prize_network: true,
    },
    where: { id: tournament_id }
  });
  if (!tournament) {
    return { error: "Tourname does not found" };
  }
  if (!amount) {
    return { error: "Amount incorrect" };
  }
  if (!to) {
    return { error: "To incorrect" };
  }
  if (!from) {
    return { error: "From incorrect" };
  }
  try {
    await axios.post(`${process.env.API_BASE_HOST}/pools/dex/swap/${tournament.prize_network}/${tournament.address}`, { amount, to, from, order_id }, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
   
    await prisma.tournament_actions.create({
      data: { tournament_id: tournament.id, amount, type: "swap", data: { from, to } }
    });
  } catch (err) {
    console.log(err);
    return { error: "Tournament pool error" };
  }
}

export const addLuquidity = async ({ tournament_id, order_id }, accessToken: string) => {
  if (isNaN(order_id)) {
    return { error: "Order id incorrect" };
  }
  const tournament = await prisma.tournaments.findFirst({
    select: {
      id: true, address: true,
      prize_network: true,
    },
    where: { id: tournament_id }
  });
  if (!tournament) {
    return { error: "Tourname does not found" };
  }
  let balance: any;
  try {
    const result = await axios.get(`${API_BASE_HOST}/wallets/balance/${tournament.prize_network}/${tournament.address}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (result.data.ok) {
      balance = new BigNumber(result.data.data).div(10 ** networks[tournament.network].decimals).toNumber();
    } else {
      return { error: "Balance error" };
    }
  } catch (err) {
    return { error: "Prize pool is empty" };
  }
  try {
    const result = await axios.post(`${process.env.API_BASE_HOST}/pools/dex/add-liquidity/${tournament.prize_network}/${tournament.address}`, { order_id }, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const action = await prisma.tournament_actions.create({
      data: {
        tournament_id: tournament.id, amount: balance,
        type: "add_liquidity", data: result.data.data
      }
    });
    const data = result.data.data;
    data.action = action;
    return data;
  } catch (err) {
    console.log(err);
    return { error: "Tournament pool error" };
  }
}

export const refund = async ({ tournament_id, order_id }, accessToken: string) => {
  if (isNaN(order_id)) {
    return { error: "Order id incorrect" };
  }
  const tournament = await prisma.tournaments.findFirst({
    select: {
      id: true, address: true,
      prize_network: true,
    },
    where: { id: tournament_id }
  });
  if (!tournament) {
    return { error: "Tourname does not found" };
  }
  try {
    await axios.post(`${process.env.API_BASE_HOST}/pools/dex/refund/${tournament.prize_network}/${tournament.address}`, { order_id }, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    await prisma.tournament_actions.create({
      data: { tournament_id: tournament.id, type: "refund" }
    });
  } catch (err) {
    return { error: "Tournament pool error" };
  }  
};

export const addDirectLiquidity = async ({ tournament_id, order_id }, accessToken: string) => {
  if (isNaN(order_id)) {
    return { error: "Order id incorrect" };
  }
  const tournament = await prisma.tournaments.findFirst({
    select: {
      id: true, address: true,
      prize_network: true,
    },
    where: { id: tournament_id }
  });
  if (!tournament) {
    return { error: "Tourname does not found" };
  }
  try {
    await axios.post(`${process.env.API_BASE_HOST}/pools/dex/add-direct-liquidity/${tournament.prize_network}/${tournament.address}`, {}, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    await prisma.tournament_actions.create({
      data: { tournament_id: tournament.id, type: "direct_add_luquidity" }
    });
  } catch (err) {
    console.log(err);
    return { error: "Tournament pool error" };
  }
};

export const getPool = async ({ tournament_id }, accessToken: string) => {
  const tournament = await prisma.tournaments.findFirst({
    select: {
      id: true, address: true,
      prize_network: true,
    },
    where: { id: tournament_id }
  });
  if (!tournament) {
    return { error: "Tourname does not found" };
  }
  
  try {
    const res = await axios.get(`${process.env.API_BASE_HOST}/pools/dex/${tournament.prize_network}/${tournament.address}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (res.data.ok) {
      const pool = res.data.data;
      try {
        const result = await axios.get(`${API_BASE_HOST}/wallets/balance/${tournament.prize_network}/${tournament.address}/${pool.dex.token1_name}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
       
        pool.token = result.data.data;
      } catch {
        pool.token = {};
      }
      
      const add_liquidity = await prisma.tournament_actions.findFirst({
        where: { tournament_id: tournament.id, type: { in: ["add_liquidity"] } },
        orderBy: { created_at: "desc" }
      });
      pool.add_liquidity = add_liquidity;
      return pool;
    }
    return { error: "Tournament pool error" };
  } catch (err) {
    console.log(err);
    return { error: "Tournament pool error" };
  }
}