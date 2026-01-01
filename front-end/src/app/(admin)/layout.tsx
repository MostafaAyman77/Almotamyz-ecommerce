"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Admin/Sidebar";
import { RootState } from "@/store/store";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, token } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        // Basic Client-side protection
        if (!token) {
            router.push("/login");
            return;
        }

        // If we have a token but no user data (e.g. state lost and not rehydrated correctly), force re-login
        if (!user) {
            router.push("/login");
            return;
        }

        // Checking strictly for 'admin' role
        if (user.role !== "admin") {
            router.push("/"); // Redirect non-admins to home
            return;
        }

        setAuthorized(true);
    }, [user, token, router]);

    if (!authorized) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <p className="text-lg" style={{ fontFamily: "var(--font-cairo)" }}>جاري التحقق من الصلاحيات...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex" dir="rtl">
            <Sidebar />
            <main className="flex-1 mr-64 p-8 transition-all duration-300">
                <div className="container mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
