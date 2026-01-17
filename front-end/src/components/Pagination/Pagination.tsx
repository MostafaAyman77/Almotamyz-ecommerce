"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PaginationProps {
    metadata: {
        currentPage: number;
        numberOfPages: number;
        nextPage?: number;
        prevPage?: number;
    };
}

const Pagination = ({ metadata }: PaginationProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    if (!metadata) return null;

    const { currentPage, numberOfPages } = metadata;

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`/products?${params.toString()}`);
    };

    if (numberOfPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-12 py-6">
            <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="flex items-center justify-center w-10 h-10 rounded-full border bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
                <FaChevronRight className="text-gray-600" />
            </button>

            <div className="flex items-center gap-1">
                {Array.from({ length: numberOfPages }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`
                            w-10 h-10 rounded-full font-bold transition-all duration-300
                            ${currentPage === page
                                ? "bg-[var(--primary-color)] text-white shadow-md scale-110"
                                : "bg-white text-gray-700 border hover:bg-gray-50"}
                        `}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                disabled={currentPage === numberOfPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="flex items-center justify-center w-10 h-10 rounded-full border bg-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
                <FaChevronLeft className="text-gray-600" />
            </button>
        </div>
    );
};

export default Pagination;
