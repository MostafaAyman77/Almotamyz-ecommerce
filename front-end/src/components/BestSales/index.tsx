"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import ProductCard from "@/components/ProductCard";
import Headings from "../Headings";

// 🔹 Dummy data (10 products)
const dummyProducts = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  title: `Best Sale Product ${i + 1}`,
  description: "وصف مختصر للمنتج",
  price: 100 + i * 10,
  images: ["https://www.very.ie/browse/technology-mobile-phones/navigation-colour--pink?srsltid=AfmBOorNNoBuLSk2sjVQjDLObd1ODgp8gxY8OHrsn0eFD_o0JlL4tX-f"],
}));

const BestSales = () => {
  const [products, setProducts] = useState<any[]>([]);

  // 🔹 Simulate API call
  useEffect(() => {
    setProducts(dummyProducts);
  }, []);

  return (
    <div className="w-full relative">
        <Headings title="افضل المنتجات مبيعًا" />
      <Swiper
        modules={[Navigation]}
        slidesPerView={5}        // ✅ show 5 products
        slidesPerGroup={1}       // ✅ move 1 step per click
        spaceBetween={16}
        navigation={{
          nextEl: "#slider-button-right",
          prevEl: "#slider-button-left",
        }}
        className="pb-20"
      >
        {products.map((item) => (
          <SwiperSlide key={item.id}>
            <ProductCard item={item} key={item.id}/>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 🔹 Custom Navigation Buttons */}
      <div className="absolute flex justify-center items-center m-auto left-0 right-0 w-fit bottom-4 z-10">
        <button
          id="slider-button-left"
          className="group p-2 flex justify-center items-center border border-indigo-600 w-12 h-12 rounded-full hover:bg-indigo-600 transition !-translate-x-16"
        >
          <svg
            className="h-5 w-5 text-indigo-600 group-hover:text-white"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M10 12L6 8L10 4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          id="slider-button-right"
          className="group p-2 flex justify-center items-center border border-indigo-600 w-12 h-12 rounded-full hover:bg-indigo-600 transition translate-x-16"
        >
          <svg
            className="h-5 w-5 text-indigo-600 group-hover:text-white"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M6 4L10 8L6 12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default BestSales;
