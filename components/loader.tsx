'use client';

import { PuffLoader, PacmanLoader } from 'react-spinners';

const Loader = () => {
  return (
    <div
      className="
      h-[70vh]
      flex 
      flex-col 
      justify-center 
      items-center 
    "
    >
      <PacmanLoader size={25} color="yellow" />
    </div>
  );
};

export default Loader;
