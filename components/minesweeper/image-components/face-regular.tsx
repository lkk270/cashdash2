'use client';

import Image from 'next/image';

export const FaceRegular = () => {
  return (
    <Image draggable={false} alt="Logo" height={32} width={32} src="/minesweeper/faceUnpressed.svg" />
  );
};
