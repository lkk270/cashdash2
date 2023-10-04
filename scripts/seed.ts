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
    // await db.score.deleteMany({
    //   where: {
    //     lobbySessionId: '611f5cb1-e380-4261-a2bc-718c2b246294',
    //   },
    // });
    // await db.gameSession.deleteMany({});
    // await db.notification.deleteMany({});
    // let data = [];
    // for (let i = 0; i < 17; i++) {
    //   let obj = {
    //     userId: 'user_2TKskwGmolB1V1OQ7FvEZvjkzh2',
    //     text: `${i}Flappy Birb${i} session ended. You ended up with a score of 1200. Your score ranked 2323/2552`,
    //     createdAt: new Date(1696281956735 - i * 86400000),
    //     read: i < 3 ? false : true,
    //   };
    //   data.push(obj);
    // }
    // await db.notification.createMany({
    //   data: data,
    // });
    // const thirtyMinutesFromNow = new Date(new Date().getTime() + 30 * 60 * 1000);
    //  await db.score.deleteMany({
    //   where: {
    //     gameId: '95342055-5033-49a9-8231-c0b1841a8238',
    //   },
    // });
    // await db.gameSession.deleteMany({
    //   where: {
    //     gameId: '95342055-5033-49a9-8231-c0b1841a8238',
    //   },
    // });
    // await db.lobbySession.deleteMany({
    //   where: {
    //     lobbyId: '6ac5594a-794a-4352-b051-4ae2f31d3340',
    //   },
    // });
    // const lobbies = await db.lobby.findMany({
    //   select: {
    //     id: true,
    //     sessions: true,
    //   },
    // });
    // if (!lobbies) {
    //   console.log('Lobby with the given ID does not exist');
    // } else {
    //   console.log(lobbies);
    //   console.log(lobbies.length);
    // }
    // await db.score.deleteMany({});
    // await db.gameSession.deleteMany({});
    // await db.lobbySession.deleteMany({});
    // const game = await db.game.findUnique({
    //   where: {
    //     id: '01ee9a4a-0d74-4a55-9752-875477b50099',
    //   },
    // });
    // const createdAt = game.createdAt;
    // const localCreatedAt = new Date(createdAt);
    // const createdAtIsoString = createdAt.toISOString();
    // const localCreatedAtIsoString = localCreatedAt.toISOString();
    // console.log('createdAt', createdAt);
    // console.log('localCreatedAt', localCreatedAt);
    // console.log('createdAtIsoString', createdAtIsoString);
    // console.log('localCreatedAtIsoString', localCreatedAtIsoString);
    // const localCreatedAt2 = localCreatedAt.toString();
    // const localCreatedAt3 = localCreatedAt.toLocaleString();
    // console.log('localCreatedAt2', localCreatedAt2); // This will show the local representation
    // console.log('localCreatedAt3', localCreatedAt3); // This will show the local representation with user's locale
    // console.log(createdAt.toLocaleString());
    // console.log(createdAt.toString());
  } catch (error) {
    console.error('Error seeding default categories:', error);
  } finally {
    await db.$disconnect();
  }
}

main();
