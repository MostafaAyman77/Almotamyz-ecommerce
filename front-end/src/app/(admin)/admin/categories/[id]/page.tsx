"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { fetchCategories, updateCategory } from "@/store/slices/categorySlice";
import { AppDispatch, RootState } from "@/store/store";
import toast from "react-hot-toast";

export default function EditCategoryPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const { categories, loading } = useSelector((state: RootState) => state.category);
    const [name, setName] = useState("");
    const [image, setImage] = useState("");

    useEffect(() => {
        if (categories.length === 0) {
            dispatch(fetchCategories());
        } else {
            const category = categories.find(c => c._id === id);
            if (category) {
                setName(category.name);
                setImage(category.image || "");
            } else {
                if (!loading) toast.error("تصنيف غير موجود");
            }
        }
    }, [dispatch, categories, id, loading]);

    useEffect(() => {
        const category = categories.find(c => c._id === id);
        if (category) {
            setName(category.name);
            setImage(category.image || "");
        }
    }, [categories, id]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("اسم التصنيف مطلوب");
            return;
        }

        try {
            await dispatch(updateCategory({ id, data: { name, image } })).unwrap();
            toast.success("تم تعديل التصنيف بنجاح");
            router.push("/admin/categories");
        } catch (err: any) {
            toast.error(err || "فشل تعديل التصنيف");
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100" style={{ fontFamily: "var(--font-cairo)" }}>
            <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--black-color)" }}>تعديل التصنيف</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--black-color)" }}>
                        اسم التصنيف <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        style={{ borderColor: "var(--border-color)" }}
                        required
                        minLength={3}
                        maxLength={32}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--black-color)" }}>
                        رابط الصورة
                    </label>
                    <input
                        type="url"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        style={{ borderColor: "var(--border-color)" }}
                    />
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
