"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { fetchUsers, updateUser } from "@/store/slices/userSlice";
import { AppDispatch, RootState } from "@/store/store";
import toast from "react-hot-toast";

export default function EditUserPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const { users, loading } = useSelector((state: RootState) => state.user);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("user");
    const [active, setActive] = useState(true);

    useEffect(() => {
        if (users.length === 0) {
            dispatch(fetchUsers());
        } else {
            const user = users.find(u => u._id === id);
            if (user) {
                setName(user.name);
                setEmail(user.email);
                setRole(user.role);
                setActive(user.active !== false);
            } else {
                if (!loading) toast.error("مستخدم غير موجود");
            }
        }
    }, [dispatch, users, id, loading]);

    useEffect(() => {
        const user = users.find(u => u._id === id);
        if (user) {
            setName(user.name);
            setEmail(user.email);
            setRole(user.role);
            setActive(user.active !== false);
        }
    }, [users, id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !email.trim()) {
            toast.error("الاسم والبريد الإلكتروني مطلوبان");
            return;
        }

        try {
            await dispatch(updateUser({ id, data: { name, email, role, active } })).unwrap();
            toast.success("تم تعديل المستخدم بنجاح");
            router.push("/admin/users");
        } catch (err: any) {
            toast.error(err || "فشل تعديل المستخدم");
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-gray-100" style={{ fontFamily: "var(--font-cairo)" }}>
            <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--black-color)" }}>تعديل المستخدم</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--black-color)" }}>
                        الاسم <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        style={{ borderColor: "var(--border-color)" }}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--black-color)" }}>
                        البريد الإلكتروني <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        style={{ borderColor: "var(--border-color)" }}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--black-color)" }}>
                        الدور <span className="text-red-500">*</span>
                    </label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        style={{ borderColor: "var(--border-color)" }}
                        required
                    >
                        <option value="user">User</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="active"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <label htmlFor="active" className="text-sm font-medium" style={{ color: "var(--black-color)" }}>
                        المستخدم نشط
                    </label>
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
