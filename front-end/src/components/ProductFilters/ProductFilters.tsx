"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaFilter, FaTimes } from "react-icons/fa";

const ProductFilters = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [priceMin, setPriceMin] = useState(searchParams.get("minPrice") || "");
    const [priceMax, setPriceMax] = useState(searchParams.get("maxPrice") || "");
    const [ratings, setRatings] = useState(searchParams.get("minRating") || "");
    const [sort, setSort] = useState(searchParams.get("sort") || "-createdAt");
    const [limit, setLimit] = useState(searchParams.get("limit") || "12");

    const handleFilter = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (priceMin) params.set("minPrice", priceMin);
        else params.delete("minPrice");

        if (priceMax) params.set("maxPrice", priceMax);
        else params.delete("maxPrice");

        if (ratings) params.set("minRating", ratings);
        else params.delete("minRating");

        if (sort) params.set("sort", sort);
        else params.delete("sort");

        if (limit) params.set("limit", limit);
        else params.delete("limit");

        // Reset to page 1 when filtering
        params.set("page", "1");

        router.push(`/products?${params.toString()}`);
    };

    const clearFilters = () => {
        setPriceMin("");
        setPriceMax("");
        setRatings("");
        setSort("-createdAt");
        setLimit("12");
        router.push("/products");
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <FaFilter className="text-[var(--primary-color)]" />
                    <h3 className="text-xl font-bold text-gray-800">تصفية المنتجات</h3>
                </div>
                <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                    <FaTimes />
                    <span>مسح التصفية</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Price Range */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">السعر</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="number"
                            placeholder="من"
                            value={priceMin}
                            onChange={(e) => setPriceMin(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                        />
                        <span className="text-gray-400">إلى</span>
                        <input
                            type="number"
                            placeholder="إلى"
                            value={priceMax}
                            onChange={(e) => setPriceMax(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                        />
                    </div>
                </div>

                {/* Rating */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">التقييم (على الأقل)</label>
                    <select
                        value={ratings}
                        onChange={(e) => setRatings(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                    >
                        <option value="">الكل</option>
                        {[4, 3, 2, 1].map((r) => (
                            <option key={r} value={r}>
                                {r} نجوم وأعلى
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort By */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">ترتيب حسب</label>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                    >
                        <option value="-createdAt">الأحدث</option>
                        <option value="price">السعر: من الأقل</option>
                        <option value="-price">السعر: من الأعلى</option>
                        <option value="-sold">الأكثر مبيعاً</option>
                        <option value="-ratingsAverage">الأعلى تقييماً</option>
                    </select>
                </div>

                {/* Limit */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">المنتجات في الصفحة</label>
                    <select
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)]"
                    >
                        <option value="12">12</option>
                        <option value="18">18</option>
                        <option value="24">24</option>
                    </select>
                </div>

                {/* Apply Button */}
                <div className="flex items-end">
                    <button
                        onClick={handleFilter}
                        className="w-full bg-[var(--primary-color)] text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm cursor-pointer"
                    >
                        تطبيق الفلتر
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductFilters;
