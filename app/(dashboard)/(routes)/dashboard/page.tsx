import prismadb from "@/lib/prismadb";
import { Categories } from "@/components/categories";
import { Games } from "@/components/games";

interface DashboardPageProps {
  searchParams: {
    categoryId: string;
  };
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const data = await prismadb.game.findMany({
    where: {
      categoryId: searchParams.categoryId,
    },
    orderBy: {
      name: "desc",
    },
    include: {
      _count: {
        select: {
          scores: true,
        },
      },
    },
  });

  const categories = await prismadb.category.findMany();
  return (
    <div className="h-full p-4 space-y-2 ">
      <Categories data={categories} />
      <Games data={data} />
    </div>
  );
};

export default DashboardPage;
