'use client';

import React, { useState, useEffect } from 'react';

import { TreePair } from '@/components/flappy-birb/tree-pair';

type TreePair = {
  pairNumber: number; // e.g., 1 for tree1 & tree2, 2 for tree3 & tree4, etc.
  timestamp: number; // New field
};
export const FlappyBirb = () => {
  const [birdFlap, setBirdFlap] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState(false);
  const [screenWidth, setScreenWidth] = useState(1200); // Initial state

  useEffect(() => {
    setScreenWidth(window.innerWidth);
  }, []);

  const treeWidth = 250; // width of a tree in pixels
  const timeForFullScreen = 7; // seconds

  const timeForTreeWidth = (treeWidth / screenWidth) * timeForFullScreen;

  // this timeForTreeWidth will be your interval for generating a new tree pair
  const treePairDuration = timeForTreeWidth * 1000; // Convert to milliseconds
  const [treePairs, setTreePairs] = useState<TreePair[]>([
    {
      pairNumber: Math.floor(Math.random() * 5) + 1, // Will give you a number between 1 and 5 inclusive
      timestamp: Date.now(),
    },
  ]);

  const updateTreePairs = () => {
    const newTreePair: TreePair = {
      pairNumber: Math.floor(Math.random() * 5) + 1,
      timestamp: Date.now(), // Adding the current timestamp
    };
    setTreePairs((currentPairs) => {
      const newPairs = [...currentPairs, newTreePair];
      if (newPairs.length > 5) {
        return newPairs.slice(1);
      }
      return newPairs;
    });
  };

  useEffect(() => {
    const treeInterval = setInterval(updateTreePairs, treePairDuration);
    return () => clearInterval(treeInterval);
  }, []);

  useEffect(() => {
    const flapInterval = setInterval(() => {
      setBirdFlap((prevFlap) => !prevFlap);
    }, 300);

    return () => clearInterval(flapInterval); // Cleanup on component unmount
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-blue-400 xs:w-5/6 md:w-4/5 xl:w-1/2 md:h-128">
      <img
        draggable={false}
        src={birdFlap ? '/flappy-birb/birdup.svg' : '/flappy-birb/birddown.svg'}
        alt="bird"
        className="absolute w-16 h-16 transform -translate-x-1/2 -translate-y-1/2 bottom-[50%] left-[50%]"
      />
      {treePairs.map((pair) => (
        <TreePair key={pair.timestamp} pairNumber={1} />
        //<TreePair key={index} pairNumber={pair.pairNumber} />
      ))}
    </div>
  );
};
