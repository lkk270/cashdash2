import prismadb from '@/lib/prismadb';
import { Categories } from '@/components/categories';
import { Games } from '@/components/games';

interface DashboardPageProps {
  searchParams: {
    categoryId: string;
  };
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const games = await prismadb.game.findMany({
    where: {
      categoryId: searchParams.categoryId,
    },
    orderBy: {
      name: 'asc',
    },
  });

  const categories = await prismadb.category.findMany({
    orderBy: {
      createdAt: 'asc',
    },
  });
  return (
    <div className="h-full p-4 space-y-2 ">
      {/* <Categories data={categories} /> */}
      <div className="flex flex-col items-center pb-6 text-4xl font-bold text-primary/50">
        <h1>Games</h1>
      </div>
      <div className="md:pl-20">
        <Games data={games} />
      </div>
    </div>
  );
};

export default DashboardPage;
