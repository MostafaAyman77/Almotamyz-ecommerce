"use client";

import { useState, useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ProductCard from "@/components/ProductCard";

interface Product {
    _id: string;
    title: string;
    slug: string;
    description: string;
    quantity: number;
    price: number;
    priceAfterDiscount?: number;
    imageCover?: string;
    images?: string[];
    category?: { _id: string; name: string };
    subcategory?: { _id: string; name: string } | string;
    brand?: { _id: string; name: string } | string;
    ratingsAverage?: number;
    ratingsQuantity?: number;
    createdAt: string;
}

interface ProductCarouselProps {
    products: Product[];
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateScrollButtons = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth;
            const newScrollLeft =
                direction === "left"
                    ? scrollContainerRef.current.scrollLeft - scrollAmount
                    : scrollContainerRef.current.scrollLeft + scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: "smooth",
            });

            setTimeout(updateScrollButtons, 300);
        }
    };

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full">
            {/* Left Arrow */}
            {canScrollLeft && (
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 shadow-lg rounded-full p-3 transition-all duration-200"
                    style={{ cursor: "pointer" }}
                    aria-label="Previous products"
                >
                    <FaChevronLeft className="text-gray-700" size={20} />
                </button>
            )}

            {/* Products Container */}
            <div
                ref={scrollContainerRef}
                onScroll={updateScrollButtons}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-2"
                style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                }}
            >
                {products.map((product) => (
                    <div
                        key={product._id}
                        className="flex-shrink-0"
                        style={{
                            width: "calc(25% - 12px)",
                            minWidth: "250px",
                        }}
                    >
                        <ProductCard
                            item={{
                                id: product._id,
                                title: product.title,
                                description: product.description,
                                price: product.price,
                                images: product.images || [product.imageCover || ""],
                                thumbnail: product.imageCover,
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Right Arrow */}
            {canScrollRight && (
                <button
                    onClick={() => scroll("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 shadow-lg rounded-full p-3 transition-all duration-200"
                    style={{ cursor: "pointer" }}
                    aria-label="Next products"
                >
                    <FaChevronRight className="text-gray-700" size={20} />
                </button>
            )}

            <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </div>
    );
}
