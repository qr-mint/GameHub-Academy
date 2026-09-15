const prisma = require("../../prisma");
const { gameBot } = require('../../hardest-game-bot/index');

const checkTournaments = async () => {
  try {
    const tournaments = await prisma.tournaments.findMany({
      select: {
        id: true,
        end_at: true,
        type: true,
        schedule: true,
        type: true,
      },
      where: { status: "ongoing" }
    });
    for (const tournament of tournaments) {
      const tournamentParticipants = await prisma.tournament_participants.findMany({
        select: {
          id: true,
          best_time: true,
          scores: true
        },
        where: { tournament_id: tournament.id, status: "participant", completed: true, }
      });
      const tournamentPrizesCount = await prisma.tournament_prizes.count({
        where: { tournament_id: tournament.id }
      });
      if (new Date(tournament.end_at).getTime() <= Date.now()) {
        if (tournament.type === "leaderboard") {
          const theBetterTimes = tournamentParticipants
            .sort((a, b) => a.best_time - b.best_time)
            .slice(0, tournamentPrizesCount);
          await prisma.$transaction(async (prisma) => {
            for (const participant of theBetterTimes) {
              await prisma.tournament_participants.update({
                data: { status: "winner" },
                where: { id: participant.id }
              });
              const achievement = await prisma.achievements.findFirst({
                where: { key: "arena_champion" }
              });
              if (achievement) {
                const exists = await prisma.user_achievements.findFirst({
                  where: {
                    user_id: participant.user_id,
                    achievement_id: achievement.id
                  }
                });
                if (!exists) {
                  await prisma.user_achievements.create({
                    data: {
                     user_id: participant.user_id,
                      achievement_id: achievement.id
                    }
                  });
                  if (achievement.reward.tickets) {
                    await prisma.game_users.update({
                      where: { id: participant.user_id },
                      data: { tickets: { increment: achievement.reward.tickets } }
                    });
                  }
                }
              }
            }
          });
        } else if (tournament.type === "survival") {
          const theBetterTimes = tournamentParticipants
            .sort((a, b) => a.scores - b.scores)
            .slice(0, tournamentPrizesCount);
          await prisma.$transaction(async (prisma) => {
            for (const participant of theBetterTimes) {
              await prisma.tournament_participants.update({
                data: { status: "winner" },
                where: { id: participant.id }
              });
              const achievement = await prisma.achievements.findFirst({
                where: { key: "arena_champion" }
              });
              if (achievement) {
                const exists = await prisma.user_achievements.findFirst({
                  where: {
                    user_id: participant.user_id,
                    achievement_id: achievement.id
                  }
                });
                if (!exists) {
                  await prisma.user_achievements.create({
                    data: {
                      user_id: participant.user_id,
                      achievement_id: achievement.id
                    }
                  });
                  if (achievement.reward.tickets) {
                    await prisma.game_users.update({
                      where: { id: participant.user_id },
                      data: { tickets: { increment: achievement.reward.tickets } }
                    });
                  }
                }
              }
            }
          });
        }
        await prisma.tournaments.update({
          where: { id: tournament.id },
          data: { completed: true, status: "completed" }
        });
      }
    }
  } catch (err) {
    await gameBot.api.sendMessage(
      406497473,
      `checkTournament:\n<code>${err.message}</code>`,
      { parse_mode: "HTML" }
    );
    console.error(err);
    await prisma.$queryRaw`UPDATE nfts SET confirmed=false WHERE status IN ('deploying', 'to_qrart', 'editing_content', 'prepare_metadata')`;
    process.exit(1);
  }
};

checkTournaments();
setInterval(checkTournaments, 1 * 60 * 1000);