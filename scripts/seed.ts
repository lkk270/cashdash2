const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function main() {
  try {
    // await db.lobby.deleteMany();
    // await db.game.deleteMany();
    // await db.category.deleteMany();
    // const mostlySkillCategory = await db.category.create({
    //   data: { name: "Mostly Skill" },
    // });
    // const someSkillCategory = await db.category.create({
    //   data: { name: "Some Skill" },
    // });
    // const pureLuckCategory = await db.category.create({
    //   data: { name: "Pure Luck" },
    // });
    // const triviaCategory = await db.category.create({
    //   data: { name: "Trivia" },
    // });
    // const minesweeper = await db.game.create({
    //   data: {
    //     name: "Minesweeper",
    //     description: "Classic minesweeper game. Win as fast as you can!",
    //     scoreType: "time",
    //     imageSrc:
    //       "https://res.cloudinary.com/ddr7l73bu/image/upload/v1690849407/games/minesweeper/minesweeperThumnail_h0ug24.jpg",
    //     categoryId: mostlySkillCategory.id,
    //   },
    // });
    // await db.lobby.createMany({
    //   data: [
    //     {
    //       name: "Novice",
    //       description:
    //         "Novice is open to new players or to anyone with an average completion time of greater than 10 minutes.",
    //       scoreRestriction: 600000,
    //       gameId: minesweeper.id,
    //     },
    //     {
    //       name: "Pro",
    //       description:
    //         "Pro is open to new players or to anyone with an average completion of greater than 5 minutes.",
    //       scoreRestriction: 300000,
    //       gameId: minesweeper.id,
    //     },
    //     {
    //       name: "Expert",
    //       description: "Expert is open to everyone.",
    //       scoreRestriction: 0,
    //       gameId: minesweeper.id,
    //     },
    //   ],
    // });
    // let data = [];
    // for (let i = 120; i < 160; i++) {
    //   let obj = {
    //     userId: 'user_' + i.toString(),
    //     username: 'user_' + i.toString(),
    //     lobbySessionId: 'f8ab962c-60b9-41d9-a689-be731f8a8ce5',
    //     score: 120000 + (i / 10) * 1000,
    //   };
    //   data.push(obj);
    // }
    // console.log('data.length', data.length);
    // await db.score.createMany({
    //   data: data,
    // });
    await db.score.deleteMany({
      where: {
        lobbySessionId: '611f5cb1-e380-4261-a2bc-718c2b246294',
      },
    });
    // await db.gameSession.deleteMany({});
  } catch (error) {
    console.error('Error seeding default categories:', error);
  } finally {
    await db.$disconnect();
  }
}

main();
