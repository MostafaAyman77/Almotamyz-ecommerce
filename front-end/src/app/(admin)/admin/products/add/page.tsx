"use client";

import React from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { createProduct } from "@/store/slices/productSlice";
import { AppDispatch } from "@/store/store";
import toast from "react-hot-toast";
import ProductForm from "@/components/Admin/ProductForm";

export default function AddProductPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        try {
            await dispatch(createProduct(data)).unwrap();
            toast.success("تم إضافة المنتج بنجاح");
            router.push("/admin/products");
        } catch (err: any) {
            toast.error(err || "فشل إضافة المنتج");
        }
    };

    return (
        <div className="max-w-4xl mx-auto" style={{ fontFamily: "var(--font-cairo)" }}>
            <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--black-color)" }}>إضافة منتج جديد</h1>
            <ProductForm onSubmit={handleSubmit} />
        </div>
    );
}
