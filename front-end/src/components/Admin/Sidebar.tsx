"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBox, FaTags, FaChartLine, FaSignOutAlt, FaList, FaStream } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";

const Sidebar = () => {
    const pathname = usePathname();
    const dispatch = useDispatch();
    const router = useRouter();

    const links = [
        { name: "لوحة التحكم", href: "/admin", icon: <FaChartLine /> },
        { name: "إدارة المنتجات", href: "/admin/products", icon: <FaBox /> },
        { name: "إدارة الماركات", href: "/admin/brands", icon: <FaTags /> },
        { name: "إدارة التصنيفات", href: "/admin/categories", icon: <FaList /> },
        { name: "إدارة التصنيفات الفرعية", href: "/admin/subcategories", icon: <FaStream /> },
    ];

    const handleLogout = () => {
        dispatch(logout());
        router.push("/login");
    };

    return (
        <div
            className="h-screen w-64 fixed right-0 top-0 z-10 p-4 shadow-lg flex flex-col"
            style={{
                backgroundColor: "white",
                borderLeft: "1px solid var(--border-color)",
                color: "var(--black-color)",
                fontFamily: "var(--font-cairo)"
            }}
        >
            <div className="mb-8 text-center pt-4">
                <h1 className="text-2xl font-bold" style={{ color: "var(--primary-color)" }}>المتميز</h1>
                <p className="text-sm text-gray-500">لوحة تحكم المسؤول</p>
            </div>

            <nav className="flex-1 flex flex-col gap-2">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors duration-200`}
                            style={{
                                backgroundColor: isActive ? "var(--primary-color)" : "transparent",
                                color: isActive ? "white" : "var(--black-color)",
                            }}
                        >
                            <span className="text-lg">{link.icon}</span>
                            <span className="font-medium">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <button
                onClick={handleLogout}
                className="mt-auto flex items-center gap-3 px-4 py-3 rounded-md transition-colors hover:bg-red-50 text-red-600"
            >
                <FaSignOutAlt />
                <span>تسجيل الخروج</span>
            </button>
        </div>
    );
};

export default Sidebar;
