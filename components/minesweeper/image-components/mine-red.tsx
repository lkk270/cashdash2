'use client';

import Image from 'next/image';

export const MineRed = () => {
  return (
    <Image
      draggable={false}
      alt="Logo"
      height={32}
      width={32}
      src="/minesweeper/mineRed.svg"
    />
  );
};
