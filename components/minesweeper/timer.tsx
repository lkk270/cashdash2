// 'use client';

// import React, { useState, useEffect } from 'react';

// interface TimerProps {
//   timeElapsed: number;
//   setTimeElapsed: React.Dispatch<React.SetStateAction<number>>;
//   gameOver: boolean;
// }

// export const Timer = ({ setTimeElapsed, gameOver }: TimerProps) => {
//   useEffect(() => {
//     let timer: NodeJS.Timeout;

//     if (!gameOver) {
//       timer = setInterval(() => {
//         setTimeElapsed((prevTime) => prevTime + 1);
//       }, 1000);
//     }

//     return () => {
//       if (timer) clearInterval(timer);
//     };
//   }, [gameOver, setTimeElapsed]);

//   return null; // Timer component doesn't return any JSX anymore
// };
