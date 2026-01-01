"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { createCoupon } from "@/store/slices/couponSlice";
import { AppDispatch, RootState } from "@/store/store";
import toast from "react-hot-toast";

export default function AddCouponPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { loading } = useSelector((state: RootState) => state.coupon);

    const [name, setName] = useState("");
    const [discount, setDiscount] = useState(0);
    const [expire, setExpire] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("اسم الكوبون مطلوب");
            return;
        }

        if (discount <= 0 || discount > 100) {
            toast.error("الخصم يجب أن يكون بين 1 و 100");
            return;
        }

        if (!expire) {
            toast.error("تاريخ الانتهاء مطلوب");
            return;
        }

        try {
            await dispatch(createCoupon({ name, discount, expire })).unwrap();
            toast.success("تم إضافة الكوبون بنجاح");
            router.push("/admin/coupons");
        } catch (err: any) {
            toast.error(err || "فشل إضافة الكوبون");
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100" style={{ fontFamily: "var(--font-cairo)" }}>
            <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--black-color)" }}>إضافة كوبون جديد</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--black-color)" }}>
                        اسم الكوبون <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        style={{ borderColor: "var(--border-color)" }}
                        placeholder="أدخل اسم الكوبون"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--black-color)" }}>
                        نسبة الخصم (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        style={{ borderColor: "var(--border-color)" }}
                        placeholder="0"
                        required
                        min={1}
                        max={100}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--black-color)" }}>
                        تاريخ الانتهاء <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        value={expire}
                        onChange={(e) => setExpire(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        style={{ borderColor: "var(--border-color)" }}
                        required
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 text-white font-medium py-2 px-4 rounded-md transition-opacity disabled:opacity-70"
                        style={{ backgroundColor: "var(--primary-color)" }}
                    >
                        {loading ? "جاري الحفظ..." : "حفظ"}
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
