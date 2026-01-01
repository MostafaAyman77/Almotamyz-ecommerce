"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaTrash, FaStar } from "react-icons/fa";
import { fetchReviews, deleteReview } from "@/store/slices/reviewSlice";
import { fetchProducts } from "@/store/slices/productSlice";
import { AppDispatch, RootState } from "@/store/store";
import toast from "react-hot-toast";

export default function ReviewsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { reviews, loading, error } = useSelector((state: RootState) => state.review);
    const { products } = useSelector((state: RootState) => state.product);

    useEffect(() => {
        dispatch(fetchReviews());
        dispatch(fetchProducts());
    }, [dispatch]);

    const handleDelete = async (id: string) => {
        if (confirm("هل أنت متأكد من حذف هذا التقييم؟")) {
            try {
                await dispatch(deleteReview(id)).unwrap();
                toast.success("تم حذف التقييم بنجاح");
            } catch (err: any) {
                toast.error(err || "حدث خطأ أثناء الحذف");
            }
        }
    };

    const getUserName = (user: any) => {
        return typeof user === 'object' && user !== null ? user.name : user;
    };

    const getProductTitle = (product: any) => {
        // If product is already a populated object, return its title
        if (typeof product === 'object' && product !== null) {
            return product.title;
        }
        // Otherwise, it's a product ID, so look it up in products
        const foundProduct = products.find(p => p._id === product);
        return foundProduct ? foundProduct.title : product;
    };

    return (
        <div style={{ fontFamily: "var(--font-cairo)" }}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold" style={{ color: "var(--black-color)" }}>إدارة التقييمات</h1>
            </div>

            {loading && reviews.length === 0 ? (
                <div className="text-center py-10">جاري التحميل...</div>
            ) : error ? (
                <div className="text-red-500 text-center py-10">{error}</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden border" style={{ borderColor: "var(--border-color)" }}>
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 text-gray-700 font-bold">
                            <tr>
                                <th className="px-6 py-3 border-b">العنوان</th>
                                <th className="px-6 py-3 border-b">التقييم</th>
                                <th className="px-6 py-3 border-b">المستخدم</th>
                                <th className="px-6 py-3 border-b">المنتج</th>
                                <th className="px-6 py-3 border-b">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map((review) => (
                                <tr key={review._id} className="hover:bg-gray-50 border-b last:border-0" style={{ borderColor: "var(--border-color)" }}>
                                    <td className="px-6 py-4 font-medium" style={{ color: "var(--black-color)" }}>{review.title}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar
                                                    key={i}
                                                    className={i < review.ratings ? "text-yellow-400" : "text-gray-300"}
                                                    size={14}
                                                />
                                            ))}
                                            <span className="mr-2 text-gray-600">{review.ratings}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{getUserName(review.user)}</td>
                                    <td className="px-6 py-4 text-gray-600">{getProductTitle(review.product)}</td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <button
                                            onClick={() => handleDelete(review._id)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                            title="حذف"
                                        >
                                            <FaTrash size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {reviews.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">لا توجد تقييمات حالياً</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
