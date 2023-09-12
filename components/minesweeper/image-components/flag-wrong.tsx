'use client';

import Image from 'next/image';

export const FlagWrong = () => {
  return (
    <Image
      className="no-pointer-events"
      draggable={false}
      alt=""
      height={32}
      width={32}
      src="/minesweeper/flagWrong.svg"
    />
  );
};
