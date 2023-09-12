'use client';

import Image from 'next/image';

export const MineRed = () => {
  return (
    <Image
      className="no-pointer-events"
      draggable={false}
      alt=""
      height={32}
      width={32}
      src="/minesweeper/mineRed.svg"
    />
  );
};
