"use client";

import Hero from "./Hero"
import WebPlans from "./Brands"
import ProductCarousel from "../ProductCarousel/ProductCarousel";

const HomePage = () => {
  return (
    <div className="flex flex-col gap-8">
      <Hero />
      <WebPlans />
      <ProductCarousel
        title="أحدث المنتجات"
        apiEndpoint="/api/v1/products?sort=-createdAt&limit=20"
      />
      <ProductCarousel
        title="الأكثر مبيعاً"
        apiEndpoint="/api/v1/products?sort=-sold&limit=20"
      />
      <ProductCarousel
        title="الأعلى تقييماً"
        apiEndpoint="/api/v1/products?sort=-ratingsAverage&limit=20"
      />
    </div>
  )
}

export default HomePage