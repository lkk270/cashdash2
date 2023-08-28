'use client';

import Image from 'next/image';

export const MineBlank = () => {
  return <Image draggable={false} alt="" height={32} width={32} src="/minesweeper/mineBlank.svg" />;
};
