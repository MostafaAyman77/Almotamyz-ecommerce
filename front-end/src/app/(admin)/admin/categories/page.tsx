"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { fetchCategories, deleteCategory } from "@/store/slices/categorySlice";
import { AppDispatch, RootState } from "@/store/store";
import toast from "react-hot-toast";

export default function CategoriesPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { categories, loading, error } = useSelector((state: RootState) => state.category);

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    const handleDelete = async (id: string) => {
        if (confirm("هل أنت متأكد من حذف هذا التصنيف؟")) {
            try {
                await dispatch(deleteCategory(id)).unwrap();
                toast.success("تم حذف التصنيف بنجاح");
            } catch (err: any) {
                toast.error(err || "حدث خطأ أثناء الحذف");
            }
        }
    };

    return (
        <div style={{ fontFamily: "var(--font-cairo)" }}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold" style={{ color: "var(--black-color)" }}>إدارة التصنيفات</h1>
                <Link
                    href="/admin/categories/add"
                    className="flex items-center gap-2 text-white px-4 py-2 rounded-md transition-colors hover:opacity-90"
                    style={{ backgroundColor: "var(--primary-color)" }}
                >
                    <FaPlus />
                    <span>إضافة تصنيف</span>
                </Link>
            </div>

            {loading && categories.length === 0 ? (
                <div className="text-center py-10">جاري التحميل...</div>
            ) : error ? (
                <div className="text-red-500 text-center py-10">{error}</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden border" style={{ borderColor: "var(--border-color)" }}>
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 text-gray-700 font-bold">
                            <tr>
                                <th className="px-6 py-3 border-b">الاسم</th>
                                <th className="px-6 py-3 border-b">الصورة</th>
                                <th className="px-6 py-3 border-b">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((category) => (
                                <tr key={category._id} className="hover:bg-gray-50 border-b last:border-0" style={{ borderColor: "var(--border-color)" }}>
                                    <td className="px-6 py-4 font-medium" style={{ color: "var(--black-color)" }}>{category.name}</td>
                                    <td className="px-6 py-4">
                                        {category.image ? (
                                            <img src={category.image} alt={category.name} className="h-10 w-10 object-cover rounded-full" />
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <Link
                                            href={`/admin/categories/${category._id}`}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="تعديل"
                                        >
                                            <FaEdit size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(category._id)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                            title="حذف"
                                        >
                                            <FaTrash size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="text-center py-8 text-gray-500">لا توجد تصنيفات مضافة حالياً</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
