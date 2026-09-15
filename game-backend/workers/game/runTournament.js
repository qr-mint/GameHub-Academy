const { gameBot } = require("../../hardest-game-bot");
const prisma = require("../../prisma");

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  try {
    while (true) {
      const now = new Date();
      const tournamnets = await prisma.tournaments.findMany({
        select: {
          id: true,
          start_at: true,
          end_at: true
        },
        where: {
          status: "upcoming",
          start_at: { lte: now }
        }
      });
      for (const tournament of tournamnets) {
        await prisma.tournamnets.update({
          where: { id: tournament.id },
          data: { status: "ongoing" }
        });
      }
      await sleep(5000);
    } 
  } catch (err) {
    console.error(err);
    await gameBot.api.sendMessage(406497473, `pools/runTournament/${err.message}`);
  }
})();