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
      <Categories data={categories} />
      <Games data={games} />
    </div>
  );
};

export default DashboardPage;
