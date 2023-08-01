const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

async function main() {
  try {
    await db.game.deleteMany();
    await db.category.deleteMany();

    const triviaCategory = await db.category.create({
      data: { name: "Trivia" },
    });

    await db.category.createMany({
      data: [
        { name: "Mostly Skill" },
        { name: "Some Skill" },
        { name: "Pure Luck" },
      ],
    });

    await db.game.create({
      data: {
        name: "Minesweeper",
        description: "Classic minesweeper game. Win as fast as you can!",
        imageSrc:
          "https://res.cloudinary.com/ddr7l73bu/image/upload/v1690849407/games/minesweeper/minesweeperThumnail_h0ug24.jpg",
        categoryId: triviaCategory.id,
      },
    });
  } catch (error) {
    console.error("Error seeding default categories:", error);
  } finally {
    await db.$disconnect();
  }
}

main();
