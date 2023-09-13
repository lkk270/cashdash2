'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export const FlappyBirb = () => {
  const [birdFlap, setBirdFlap] = useState<boolean>(true);
  const [gapSize, setGapSize] = useState(4 + Math.floor(Math.random() * 5));

  const baseGap = 10; // this is the base gap in vertical height (vh) units
  const gapVH = baseGap + gapSize * 5; // Adjusting the gap size by multiplying by 5. You can adjust this multiplier to increase or decrease the gap increment.
  const randomGapPosition = 25 + Math.random() * 50; // Randomizes the center point of the gap between 25% and 75% of the game's height
  const [gapCenter, setGapCenter] = useState(25 + Math.random() * 50);

  useEffect(() => {
    const flapInterval = setInterval(() => {
      setBirdFlap((prevFlap) => !prevFlap);
    }, 300);

    return () => clearInterval(flapInterval); // Cleanup on component unmount
  }, []);

  useEffect(() => {
    const treeInterval = setInterval(() => {
      // Calculate a new gap center every few seconds (e.g., every 3 seconds here)
      setGapCenter(25 + Math.random() * 50);
    }, 3000);

    return () => clearInterval(treeInterval); // Cleanup on component unmount
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-blue-400 xs:w-5/6 md:w-4/5 xl:w-1/2 md:h-128">
      <img
        draggable={false}
        src={birdFlap ? '/flappy-birb/birdup.svg' : '/flappy-birb/birddown.svg'}
        alt="bird"
        className="absolute w-16 h-16 transform -translate-x-1/2 -translate-y-1/2 bottom-[50%] left-[50%]"
      />

      {/* Top Tree */}
      <Image
        draggable={false}
        alt="Top Tree"
        height={250}
        width={250}
        className="absolute right-0 treeAnimation"
        style={{ top: `calc(${gapCenter}% - ${gapVH / 2}vh - 125px)` }}
        src="/flappy-birb/treedown.svg"
      />

      {/* Gap. This can just be empty space, so no need to render anything specific */}

      {/* Bottom Tree */}
      <Image
        draggable={false}
        alt="Bottom Tree"
        height={250}
        width={250}
        className="absolute bottom-0 right-0 treeAnimation"
        style={{ bottom: `calc(100% - ${gapCenter}% - ${gapVH / 2}vh - 125px)` }}
        src="/flappy-birb/treeup.svg"
      />
    </div>
  );
};
