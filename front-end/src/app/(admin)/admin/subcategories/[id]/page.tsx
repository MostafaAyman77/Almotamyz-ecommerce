"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { fetchSubCategories, updateSubCategory } from "@/store/slices/subcategorySlice";
import { fetchCategories } from "@/store/slices/categorySlice";
import { AppDispatch, RootState } from "@/store/store";
import toast from "react-hot-toast";

export default function EditSubCategoryPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const { subcategories, loading } = useSelector((state: RootState) => state.subcategory);
    const { categories } = useSelector((state: RootState) => state.category);
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");

    useEffect(() => {
        dispatch(fetchCategories());
        if (subcategories.length === 0) {
            dispatch(fetchSubCategories(null));
        } else {
            const subcategory = subcategories.find(s => s._id === id);
            if (subcategory) {
                setName(subcategory.name);
                // Handle both populated object and string ID
                const categoryId = typeof subcategory.category === 'object'
                    ? subcategory.category._id
                    : subcategory.category;
                setCategory(categoryId);
            } else {
                if (!loading) toast.error("تصنيف فرعي غير موجود");
            }
        }
    }, [dispatch, subcategories, id, loading]);

    useEffect(() => {
        const subcategory = subcategories.find(s => s._id === id);
        if (subcategory) {
            setName(subcategory.name);
            // Handle both populated object and string ID
            const categoryId = typeof subcategory.category === 'object'
                ? subcategory.category._id
                : subcategory.category;
            setCategory(categoryId);
        }
    }, [subcategories, id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("اسم التصنيف الفرعي مطلوب");
            return;
        }

        if (!category) {
            toast.error("التصنيف الرئيسي مطلوب");
            return;
        }

        try {
            await dispatch(updateSubCategory({ id, data: { name, category } })).unwrap();
            toast.success("تم تعديل التصنيف الفرعي بنجاح");
            router.push("/admin/subcategories");
        } catch (err: any) {
            toast.error(err || "فشل تعديل التصنيف الفرعي");
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100" style={{ fontFamily: "var(--font-cairo)" }}>
            <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--black-color)" }}>تعديل التصنيف الفرعي</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--black-color)" }}>
                        اسم التصنيف الفرعي <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        style={{ borderColor: "var(--border-color)" }}
                        required
                        minLength={2}
                        maxLength={32}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--black-color)" }}>
                        التصنيف الرئيسي <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        style={{ borderColor: "var(--border-color)" }}
                        required
                    >
                        <option value="">اختر التصنيف الرئيسي</option>
                        {categories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 text-white font-medium py-2 px-4 rounded-md transition-opacity disabled:opacity-70"
                        style={{ backgroundColor: "var(--primary-color)" }}
                    >
                        {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-200 transition-colors border"
                        style={{ borderColor: "var(--border-color)" }}
                    >
                        إلغاء
                    </button>
                </div>
            </form>
        </div>
    );
}
