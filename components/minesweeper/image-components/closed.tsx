'use client';

import Image from 'next/image';

export const Closed = () => {
  return (
    <Image draggable={false} alt="Logo" height={32} width={32} src="/minesweeper/closed.svg" />
  );
};