"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { fetchBrands, updateBrand } from "@/store/slices/brandSlice";
import { AppDispatch, RootState } from "@/store/store";
import toast from "react-hot-toast";

export default function EditBrandPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const { brands, loading } = useSelector((state: RootState) => state.brand);
    const [name, setName] = useState("");
    const [image, setImage] = useState("");

    useEffect(() => {
        // If brands are not loaded, fetch them (or fetch single if supported by API/Slice optimization, here we just use what we have or fetch all)
        // Ideally we should have a getBrandDetails thunk, but filtering from list is okay for small datasets.
        if (brands.length === 0) {
            dispatch(fetchBrands());
        } else {
            const brand = brands.find(b => b._id === id);
            if (brand) {
                setName(brand.name);
                setImage(brand.image || "");
            } else {
                // If fetching finished and still not found
                if (!loading) toast.error("ماركة غير موجودة");
            }
        }
    }, [dispatch, brands, id, loading]);

    // Effect to sync state once brands are loaded
    useEffect(() => {
        const brand = brands.find(b => b._id === id);
        if (brand) {
            setName(brand.name);
            setImage(brand.image || "");
        }
    }, [brands, id]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("اسم الماركة مطلوب");
            return;
        }

        try {
            await dispatch(updateBrand({ id, data: { name, image } })).unwrap();
            toast.success("تم تعديل الماركة بنجاح");
            router.push("/admin/brands");
        } catch (err: any) {
            toast.error(err || "فشل تعديل الماركة");
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100" style={{ fontFamily: "var(--font-cairo)" }}>
            <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--black-color)" }}>تعديل الماركة</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--black-color)" }}>
                        اسم الماركة <span className="text-red-500">*</span>
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
