"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { fetchUsers, deleteUser } from "@/store/slices/userSlice";
import { AppDispatch, RootState } from "@/store/store";
import toast from "react-hot-toast";

export default function UsersPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { users, loading, error } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    const handleDelete = async (id: string) => {
        if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
            try {
                await dispatch(deleteUser(id)).unwrap();
                toast.success("تم حذف المستخدم بنجاح");
            } catch (err: any) {
                toast.error(err || "حدث خطأ أثناء الحذف");
            }
        }
    };

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            admin: "bg-red-100 text-red-700",
            manager: "bg-blue-100 text-blue-700",
            user: "bg-green-100 text-green-700",
        };
        return colors[role] || "bg-gray-100 text-gray-700";
    };

    return (
        <div style={{ fontFamily: "var(--font-cairo)" }}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold" style={{ color: "var(--black-color)" }}>إدارة المستخدمين</h1>
                <Link
                    href="/admin/users/add"
                    className="flex items-center gap-2 text-white px-4 py-2 rounded-md transition-colors hover:opacity-90"
                    style={{ backgroundColor: "var(--primary-color)" }}
                >
                    <FaPlus />
                    <span>إضافة مستخدم</span>
                </Link>
            </div>

            {loading && users.length === 0 ? (
                <div className="text-center py-10">جاري التحميل...</div>
            ) : error ? (
                <div className="text-red-500 text-center py-10">{error}</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden border" style={{ borderColor: "var(--border-color)" }}>
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 text-gray-700 font-bold">
                            <tr>
                                <th className="px-6 py-3 border-b">الاسم</th>
                                <th className="px-6 py-3 border-b">البريد الإلكتروني</th>
                                <th className="px-6 py-3 border-b">الدور</th>
                                <th className="px-6 py-3 border-b">الحالة</th>
                                <th className="px-6 py-3 border-b">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 border-b last:border-0" style={{ borderColor: "var(--border-color)" }}>
                                    <td className="px-6 py-4 font-medium" style={{ color: "var(--black-color)" }}>{user.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadge(user.role)}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.active !== false ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">نشط</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">غير نشط</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 flex gap-3">
                                        <Link
                                            href={`/admin/users/${user._id}`}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            title="تعديل"
                                        >
                                            <FaEdit size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(user._id)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                            title="حذف"
                                        >
                                            <FaTrash size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-8 text-gray-500">لا توجد مستخدمين حالياً</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
