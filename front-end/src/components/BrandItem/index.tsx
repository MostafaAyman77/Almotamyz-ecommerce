"use client";

import { BrandType } from "@/utils/types";
import Image from "next/image";
import Link from "next/link";

interface BrandProps {
  brand: BrandType;
}

const BrandItem = ({ brand }: BrandProps) => {
  return (
    <Link href={`brands/${brand.slug}`}>
      <div
        style={brand.id % 2 == 1 ? { backgroundColor: "var(--primary-color)" } : { backgroundColor: "var(--secondary-color)" }}
        className="flex flex-col items-center p-3 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200"
      >
        <div className="relative w-full h-20 mb-4">
          <Image
            src={brand.image}
            alt={brand.name}
            fill
            className="object-contain p-4"
            sizes="(max-width: 256px) 100vw, 256px"
          />
        </div>
        {/* style={{color: "var(--primary-color)"}} */}
        <h2
          style={brand.id % 2 !== 1 ? { color: "var(--primary-color)" } : { color: "text-gray-800" }}
          className="text-xl font-bold text-center">
          {brand.name}
        </h2>
      </div>
    </Link>
  );
};

export default BrandItem;