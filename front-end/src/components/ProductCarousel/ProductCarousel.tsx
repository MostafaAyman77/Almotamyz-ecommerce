"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import ProductCard from "@/components/ProductCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    imageCover?: string;
    images?: string[];
    ratingsAverage?: number;
    ratingsQuantity?: number;
}

interface ProductCarouselProps {
    title: string;
    apiEndpoint: string;
}

export default function ProductCarousel({ title, apiEndpoint }: ProductCarouselProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";
                const response = await fetch(`${baseUrl}${apiEndpoint}`);
                const result = await response.json();
                if (result.data) {
                    setProducts(result.data);
                }
            } catch (error) {
                console.error("Error fetching products for carousel:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [apiEndpoint]);

    if (loading) {
        return (
            <div className="py-10 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className="py-12 px-4 container mx-auto overflow-hidden">
            <div className="flex justify-between items-center mb-8">
                {/* <h2 className="text-2xl md:text-3xl font-bold [color:var(--primary-color)] border-b border-primary border-b-2 pb-2">{title}</h2>
                 */}
                <h2
                    className="
                        relative inline-block
                        text-2xl md:text-3xl font-bold
                        [color:var(--primary-color)]
                        pb-2
                        after:content-['']
                        after:absolute
                        after:left-1/2
                        after:bottom-0
                        after:h-[3px]
                        after:w-1/2
                        after:-translate-x-1/2
                        after:bg-[var(--primary-color)]
                        after:transition-all
                        after:duration-500 after:ease-out
                        hover:after:w-full
                      "
                >
                    {title}
                </h2>

                <div className="flex gap-2">
                    <button
                        className={`carousel-prev-${title.replace(/\s+/g, '-').toLowerCase()} bg-white p-3 rounded-full border shadow-sm hover:bg-gray-50 transition-colors cursor-pointer group`}
                    >
                        <FaChevronLeft className="text-gray-600 group-hover:text-primary transition-colors" />
                    </button>
                    <button
                        className={`carousel-next-${title.replace(/\s+/g, '-').toLowerCase()} bg-white p-3 rounded-full border shadow-sm hover:bg-gray-50 transition-colors cursor-pointer group`}
                    >
                        <FaChevronRight className="text-gray-600 group-hover:text-primary transition-colors" />
                    </button>
                </div>
            </div>

            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={1}
                navigation={{
                    prevEl: `.carousel-prev-${title.replace(/\s+/g, '-').toLowerCase()}`,
                    nextEl: `.carousel-next-${title.replace(/\s+/g, '-').toLowerCase()}`,
                }}
                breakpoints={{
                    640: { slidesPerView: 2 },
                    768: { slidesPerView: 3 },
                    1024: { slidesPerView: 4 },
                    1280: { slidesPerView: 5 },
                }}
                className="w-full !px-1 !py-4"
            >
                {products.map((product) => (
                    <SwiperSlide key={product._id} className="h-auto">
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
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}

