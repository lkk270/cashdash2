"use client";

import Image from "next/image";
const Logo = () => {
  return (
    <Image
      draggable={false}
      alt="Logo"
      className="cursor-pointer"
      height={150}
      width={150}
      src="/images/logo2.svg"
    />
  );
};
export default Logo;
