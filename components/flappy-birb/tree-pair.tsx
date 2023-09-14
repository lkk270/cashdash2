'use client';

import Image from 'next/image';

interface TreePairProps {
  pairNumber: number; // e.g., 1 for tree1 & tree2, 2 for tree3 & tree4, etc.
}

export const TreePair = ({ pairNumber }: TreePairProps) => {
  const topTreeSrc = `/flappy-birb/tree${2 * pairNumber - 1}.svg`;
  const bottomTreeSrc = `/flappy-birb/tree${2 * pairNumber}.svg`;

  return (
    <>
      <Image
        draggable={false}
        alt="Top Tree"
        height={250}
        width={250}
        className="absolute right-0 treeAnimation"
        src={topTreeSrc}
      />
      <Image
        draggable={false}
        alt="Bottom Tree"
        height={250}
        width={250}
        className="absolute bottom-0 right-0 treeAnimation"
        src={bottomTreeSrc}
      />
    </>
  );
};
