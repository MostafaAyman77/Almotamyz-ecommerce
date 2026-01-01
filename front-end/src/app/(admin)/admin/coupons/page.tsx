"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { fetchCoupons, deleteCoupon } from "@/store/slices/couponSlice";
import { AppDispatch, RootState } from "@/store/store";
import toast from "react-hot-toast";

export default function CouponsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { coupons, loading, error } = useSelector((state: RootState) => state.coupon);

    useEffect(() => {
        dispatch(fetchCoupons());
    }, [dispatch]);

    const handleDelete = async (id: string) => {
        if (confirm("هل أنت متأكد من حذف هذا الكوبون؟")) {
            try {
                await dispatch(deleteCoupon(id)).unwrap();
                toast.success("تم حذف الكوبون بنجاح");
            } catch (err: any) {
                toast.error(err || "حدث خطأ أثناء الحذف");
            }
        }
    };

    const isExpired = (expireDate: string) => {
        return new Date(expireDate) < new Date();
    };

    return (
        <div style={{ fontFamily: "var(--font-cairo)" }}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold" style={{ color: "var(--black-color)" }}>إدارة الكوبونات</h1>
                <Link
                    href="/admin/coupons/add"
                    className="flex items-center gap-2 text-white px-4 py-2 rounded-md transition-colors hover:opacity-90"
                    style={{ backgroundColor: "var(--primary-color)" }}
                >
                    <FaPlus />
                    <span>إضافة كوبون</span>
                </Link>
            </div>

            {loading && coupons.length === 0 ? (
                <div className="text-center py-10">جاري التحميل...</div>
            ) : error ? (
                <div className="text-red-500 text-center py-10">{error}</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden border" style={{ borderColor: "var(--border-color)" }}>
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 text-gray-700 font-bold">
                            <tr>
                                <th className="px-6 py-3 border-b">الاسم</th>
                                <th className="px-6 py-3 border-b">الخصم</th>
                                <th className="px-6 py-3 border-b">تاريخ الانتهاء</th>
                                <th className="px-6 py-3 border-b">الحالة</th>
                                <th className="px-6 py-3 border-b">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((coupon) => (
                                <tr key={coupon._id} className="hover:bg-gray-50 border-b last:border-0" style={{ borderColor: "var(--border-color)" }}>
                                    <td className="px-6 py-4 font-medium" style={{ color: "var(--black-color)" }}>{coupon.name}</td>
                                    <td className="px-6 py-4">{coupon.discount}%</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {new Date(coupon.expire).toLocaleDateString('ar-EG')}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isExpired(coupon.expire) ? (
                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">منتهي</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">نشط</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <Link
                                            href={`/admin/coupons/${coupon._id}`}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="تعديل"
                                        >
                                            <FaEdit size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(coupon._id)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                            title="حذف"
                                        >
                                            <FaTrash size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {coupons.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">لا توجد كوبونات مضافة حالياً</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
