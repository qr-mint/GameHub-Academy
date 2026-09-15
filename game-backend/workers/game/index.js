const prisma = require("../../prisma");
const { gameBot } = require('../../hardest-game-bot/index');
const { randomIntFromInterval } = require("../../utils/random");

require("./checkTournaments");
require("./runTournament");

const poolAddress = process.env.MODE === "dev"
  ? "EQC9GX5Mp2_ztS0pMzSqZPwx2sTasYkCzCItpJrsHJTZ1F1z"
  : "EQB5ihCTH7a9GPGAIv2pW-Z0PK7C2jMkpwLGIebmzMafYYMp";

const entryAmount = process.env.MODE === "dev" ? 0.05 : 1;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getTodayMidnightUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function getTomorrowMidnightUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}

async function createPrizes(tournament) {
  await prisma.tournament_prizes.createMany({
    data: [
      {
        tournament_id: tournament.id,
        nft: {},
        network: "ton",
        percent: 50,
        place_from: 1,
        place_to: 1,
      },
      {
        tournament_id: tournament.id,
        nft: {},
        network: "ton",
        percent: 25,
        place_from: 2,
        place_to: 2,
      },
      {
        tournament_id: tournament.id,
        nft: {},
        network: "ton",
        percent: 15,
        place_from: 3,
        place_to: 3,
      },
      {
        tournament_id: tournament.id,
        nft: {},
        network: "ton",
        percent: 2.5,
        place_from: 4,
        place_to: 4
      },
      {
        tournament_id: tournament.id,
        nft: {},
        network: "ton",
        percent: 2.5,
        place_from: 5,
        place_to: 5,
      },
      {
        tournament_id: tournament.id,
        nft: {},
        network: "ton",
        percent: 1,
        place_from: 6,
        place_to: 10,
      }
    ]
  });
}

async function dailyReset() {
  const now = new Date();
  console.log(`[${now.toISOString()}] Выполняем daily reset...`);

  try {
    await prisma.tournaments.updateMany({
      where: { schedule: 'daily', end_at: { lte: now } },
      data: { status: 'completed' }
    });

    // 2. Определяем, какой день сейчас
    const todayStart = getTodayMidnightUTC();
    const tomorrowStart = getTomorrowMidnightUTC();

    // Проверяем, есть ли активный турнир на сегодня
    const gameUser = await prisma.game_users.findFirst({
      where: { username: 'dao0dev' }
    });
    const todayTournament = await prisma.tournaments.findFirst({
      where: {
        user_id: gameUser.id,
        schedule: 'daily',
        start_at: { gte: todayStart },
        end_at: { lte: tomorrowStart },
        address: poolAddress, // потом заполнишь
      }
    });

    if (!todayTournament) {
      console.log('Турнир на сегодня не найден → создаём новый');
      const tournament = await prisma.tournaments.create({
        data: {
          name: `Daily #${todayStart.toISOString().slice(0,10)}`,
          schedule: "daily",
          type: "leaderboard",
          start_at: todayStart,
          end_at: tomorrowStart,
          description: "Daily Tournament - Best 24-Hour Score",
          prizes: {},
          entry_amount: entryAmount,
          icon: "⚡",
          color: 0,
          address: poolAddress, // потом заполнишь
          token: "ton",
          status: "ongoing",
          network: "ton",
          currency_token: "ton",
          entry_mode: "per_attempt",
          user_id: gameUser.id,
          winners_count: 10,
          player_limit: 10000
        }
      });
      const levels = await prisma.levels.findMany({
        select: { id: true },
      });
      const levelIndex = randomIntFromInterval(0, levels.length - 1);
      await prisma.$transaction(async (prisma) => {
        await prisma.tournament_levels.create({
          data: { tournament_id: tournament.id, level_id: levels[levelIndex].id }
        });
        await createPrizes(tournament);
      });
    }
    const updated = await prisma.game_users.updateMany({
      where: { tickets: { lt: 10 } },
      data: { tickets: 10 }
    });
    console.log(`Билеты розданы: ${updated.count} игрокам`);

    console.log(`[${new Date().toISOString()}] Daily reset завершён успешно`);
  } catch (err) {
    console.error('ОШИБКА в daily reset:', err);
  }
}

async function startLoop() {
  console.log('Daily reset loop запущен');

  // Ключевая фича: при старте — сразу проверяем, не пропустили ли мы сброс
  const now = new Date();
  const lastMidnight = getTodayMidnightUTC();

  // Если с последнего 00:00 прошло больше 1 минуты — значит, могли пропустить
  if (now - lastMidnight > 60_000) {
    console.log('Обнаружен возможный пропуск сброса → запускаем немедленно');
    await dailyReset();
  } else {
    console.log('Сброс уже был сегодня — ждём следующего');
  }

  // Основной цикл — ждём до следующего 00:00
  while (true) {
    const nextMidnight = getTomorrowMidnightUTC();
    const delay = nextMidnight.getTime() - new Date().getTime();

    console.log(`Следующий сброс через ${Math.round(delay / 1000 / 60)} минут`);

    await sleep(delay + 1000); // +1 сек, чтобы точно попасть после 00:00
    await dailyReset();
  }
}

startLoop().catch(async (err) => {
  await gameBot.api.sendMessage(
    406497473,
    `game-worker:\n<code>${err.message}</code>`,
    { parse_mode: "HTML" }
  );
  console.error(err);
  await prisma.$queryRaw`UPDATE nfts SET confirmed=false WHERE status IN ('deploying', 'to_qrart', 'editing_content', 'prepare_metadata')`;
  process.exit(1);
});
//EQC9GX5Mp2_ztS0pMzSqZPwx2sTasYkCzCItpJrsHJTZ1F1z