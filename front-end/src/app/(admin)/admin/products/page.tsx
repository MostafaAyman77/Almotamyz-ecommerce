"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { FaPlus, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { fetchProducts, deleteProduct } from "@/store/slices/productSlice";
import { AppDispatch, RootState } from "@/store/store";
import toast from "react-hot-toast";

export default function ProductsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { products, loading, error, paginationResult } = useSelector((state: RootState) => state.product);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState("");

    useEffect(() => {
        // Build query string
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "10");
        if (keyword) params.append("keyword", keyword); // Backend might use 'keyword' or 'title' for search?
        // Based on validator: query('title') matches title.
        if (keyword) params.append("title", keyword);

        dispatch(fetchProducts(params.toString()));
    }, [dispatch, page, keyword]);

    const handleDelete = async (id: string) => {
        if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
            try {
                await dispatch(deleteProduct(id)).unwrap();
                toast.success("تم حذف المنتج بنجاح");
            } catch (err: any) {
                toast.error(err || "حدث خطأ أثناء الحذف");
            }
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 on new search
        // Effect will trigger fetch
    };

    return (
        <div style={{ fontFamily: "var(--font-cairo)" }}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold" style={{ color: "var(--black-color)" }}>إدارة المنتجات</h1>

                <div className="flex gap-4 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="بحث عن منتج..."
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            style={{ borderColor: "var(--border-color)" }}
                        />
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    </form>

                    <Link
                        href="/admin/products/add"
                        className="flex items-center gap-2 text-white px-4 py-2 rounded-md transition-colors hover:opacity-90 whitespace-nowrap"
                        style={{ backgroundColor: "var(--primary-color)" }}
                    >
                        <FaPlus />
                        <span>إضافة منتج</span>
                    </Link>
                </div>
            </div>

            {loading && products.length === 0 ? (
                <div className="text-center py-10">جاري التحميل...</div>
            ) : error ? (
                <div className="text-red-500 text-center py-10">{error}</div>
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow overflow-x-auto border" style={{ borderColor: "var(--border-color)" }}>
                        <table className="w-full text-sm text-right whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-700 font-bold">
                                <tr>
                                    <th className="px-6 py-3 border-b">المنتج</th>
                                    <th className="px-6 py-3 border-b">السعر</th>
                                    <th className="px-6 py-3 border-b">الكمية</th>
                                    <th className="px-6 py-3 border-b">الماركة</th>
                                    <th className="px-6 py-3 border-b">القسم الفرعي</th>
                                    <th className="px-6 py-3 border-b">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50 border-b last:border-0" style={{ borderColor: "var(--border-color)" }}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {product.imageCover ? (
                                                    <img src={product.imageCover} alt={product.title} className="h-12 w-12 object-cover rounded-md border" />
                                                ) : (
                                                    <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">لا توجد صورة</div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="font-medium truncate max-w-[200px]" style={{ color: "var(--black-color)" }}>{product.title}</span>
                                                    {product.ratingsAverage && (
                                                        <span className="text-xs text-yellow-500">★ {product.ratingsAverage} ({product.ratingsQuantity})</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {product.priceAfterDiscount ? (
                                                <div className="flex flex-col">
                                                    <span className="text-red-500 font-bold">{product.priceAfterDiscount} جنية</span>
                                                    <span className="text-gray-400 line-through text-xs">{product.price} جنية</span>
                                                </div>
                                            ) : (
                                                <span>{product.price} جنية</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {product.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {typeof product.brand === 'object' ? product.brand?.name : 'غير محدد'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {typeof product.subcategory === 'object' ? product.subcategory?.name : 'غير محدد'}
                                        </td>
                                        <td className="px-6 py-4 flex gap-3 items-center mt-2">
                                            <Link
                                                href={`/admin/products/${product._id}`}
                                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                                title="تعديل"
                                            >
                                                <FaEdit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                                title="حذف"
                                            >
                                                <FaTrash size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-500">لا توجد منتجات مضافة حالياً</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {paginationResult && paginationResult.numberOfPages > 1 && (
                        <div className="flex justify-center mt-6 gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 bg-white border rounded disabled:opacity-50"
                            >
                                السابق
                            </button>
                            <span className="px-3 py-1 bg-gray-100 border rounded">
                                صفحة {page} من {paginationResult.numberOfPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(paginationResult.numberOfPages, p + 1))}
                                disabled={page === paginationResult.numberOfPages}
                                className="px-3 py-1 bg-white border rounded disabled:opacity-50"
                            >
                                التالي
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
