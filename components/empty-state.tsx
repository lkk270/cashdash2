"use client";
import Image from "next/image";

import { Heading } from "@/components/heading";

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Uh Oh",
  subtitle = "Something went wrong!",
}) => {
  return (
    <div
      className="
        h-[60vh]
        flex 
        flex-col 
        gap-2 
        justify-center 
        items-center 
      "
    >
      <Heading center title={title} subtitle={subtitle} />
      <div className="relative w-60 h-60">
        <Image
          draggable={false}
          height={600}
          width={600}
          src="/images/empty.png"
          alt="Empty"
        />
      </div>
    </div>
  );
};

export default EmptyState;
