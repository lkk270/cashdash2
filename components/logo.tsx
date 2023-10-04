'use client';

import Image from 'next/image';
const Logo = () => {
  return (
    <Image
      draggable={false}
      alt="Logo"
      className="cursor-pointer hover:translate-x-3"
      height={150}
      width={150}
      src="/images/logo2.svg"
    />
  );
};
export default Logo;
