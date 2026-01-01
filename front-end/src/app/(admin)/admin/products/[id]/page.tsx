"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { fetchProducts, updateProduct } from "@/store/slices/productSlice";
import { AppDispatch, RootState } from "@/store/store";
import toast from "react-hot-toast";
import ProductForm from "@/components/Admin/ProductForm";

export default function EditProductPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const { products } = useSelector((state: RootState) => state.product);

    // Find product from store or fetch (simplified for now to rely on list being loaded or fetching list)
    // In a real large app, would fetch single product details.
    const product = products.find(p => p._id === id);

    useEffect(() => {
        if (!product && products.length === 0) {
            dispatch(fetchProducts());
        }
    }, [product, products, dispatch]);

    const handleSubmit = async (data: any) => {
        try {
            await dispatch(updateProduct({ id, data })).unwrap();
            toast.success("تم تعديل المنتج بنجاح");
            router.push("/admin/products");
        } catch (err: any) {
            toast.error(err || "فشل تعديل المنتج");
        }
    };

    if (!product && products.length === 0) return <div>جاري التحميل...</div>;
    if (!product && products.length > 0) return <div>المنتج غير موجود</div>;

    return (
        <div className="max-w-4xl mx-auto" style={{ fontFamily: "var(--font-cairo)" }}>
            <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--black-color)" }}>تعديل المنتج</h1>
            {product && <ProductForm initialData={product} onSubmit={handleSubmit} isEdit={true} />}
        </div>
    );
}
