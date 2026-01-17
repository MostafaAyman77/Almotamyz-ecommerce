"use client"

import Link from "next/link"
import Navbar from "../Navbar"
import { IoMenu } from "react-icons/io5"
import { useEffect, useState } from "react"
import { MdClose } from "react-icons/md"
import SearchBar from "../SearchBar"
import { BsCart3 } from "react-icons/bs"
import { FaRegHeart } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux"
import { RiLoginBoxFill, RiLogoutBoxFill } from "react-icons/ri"
import { logout } from "@/store/slices/authSlice"
import toast from "react-hot-toast"
import { useRouter, usePathname } from "next/navigation"

const Header = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const favoriteCount = useSelector((state: any) => state.cart.favorites.length);
    const cartCount = useSelector((state: any) => state.cart.cartItems.length);
    const { token } = useSelector((state: any) => state.auth);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const handleLogout = () => {
        dispatch(logout());
        toast.success("تم تسجيل الخروج بنجاح");
        router.push("/login");
    };

    return (
        <>
            <header className="fixed top-0 bg-white/95 w-full backdrop-blur-sm shadow-sm z-50">
                <div className="container mx-auto px-4 pb-2 pt-1">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/">
                            <span className="text-2xl font-bold text-gray-600"
                                style={{ color: "var(--primary-color)" }}
                            >
                                المتميز للمعدات
                            </span>
                        </Link>

                        {/* Navigation */}
                        <Navbar />

                        {/* Mobile Controls (Menu + Icons) */}
                        <div className="md:hidden flex items-center gap-3">
                            {/* Mobile Fav/Cart Icons */}
                            <div className="flex items-center gap-3">
                                <Link href={"/favorites"} className="relative group">
                                    <FaRegHeart className="w-6 h-6 group-hover:text-green-500" />
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                                        {favoriteCount}
                                    </span>
                                </Link>
                                <Link href={"/cart"} className="relative group">
                                    <BsCart3 className="w-6 h-6 group-hover:text-green-500" />
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                </Link>
                            </div>

                            {/* Menu Button */}
                            <button
                                onClick={() => setIsOpen((prev) => !prev)}
                                className="p-1"
                            >
                                {isOpen ? (
                                    <MdClose className="w-6 h-6" />
                                ) : (
                                    <IoMenu className="w-6 h-6" />
                                )}
                            </button>
                        </div>

                        {/* Desktop Icons Group */}
                        <div className="hidden md:flex items-center space-x-5 gap-5">
                            <div className="flex items-center justify-center gap-5">
                                <div className="relative group cursor-pointer">
                                    <Link href={"/favorites"}>
                                        <FaRegHeart className="w-6 h-6 group-hover:text-green-500" />
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {favoriteCount}
                                        </span>
                                    </Link>
                                </div>
                                <div className="relative group cursor-pointer">
                                    <Link href={"/cart"}>
                                        <BsCart3 className="w-6 h-6 group-hover:text-green-500" />
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {cartCount}
                                        </span>
                                    </Link>
                                </div>
                            </div>

                            {/* Auth Icon */}
                            {token ? (
                                <button
                                    onClick={handleLogout}
                                    title="تسجيل الخروج"
                                    className="hover:text-red-500 transition-colors"
                                >
                                    <RiLogoutBoxFill className="w-6 h-6" />
                                </button>
                            ) : (
                                <Link
                                    href="/login"
                                    title="تسجيل الدخول"
                                    className="hover:text-green-500 transition-colors"
                                >
                                    <RiLoginBoxFill className="w-6 h-6" />
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Search Bar - Center */}
                    <div className="flex items-center justify-center mt-3 mb-2">
                        <SearchBar />
                    </div>

                    {isOpen && (
                        <nav className="md:hidden flex items-center flex-col space-y-3 mt-4 pb-4 border-t pt-4">
                            {[
                                { name: "الصفحة الرئيسية", href: "/" },
                                { name: "المنتجات", href: "/products" },
                                { name: "العروض", href: "/offers" },
                                { name: "تواصل معنا", href: "/contact" },
                            ].map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`
                                            relative py-1 capitalize transition-colors duration-300
                                            ${isActive ? "text-[var(--primary-color)] font-bold" : "text-gray-700 hover:text-[var(--primary-color)]"}
                                            after:content-[''] after:absolute after:left-1/2 after:bottom-0 
                                            after:h-[2px] after:bg-[var(--primary-color)] 
                                            after:transition-all after:duration-300 after:ease-out after:-translate-x-1/2
                                            ${isActive ? "after:w-full" : "after:w-0 hover:after:w-full"}
                                        `}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}

                            {/* Mobile Auth Link (Since icon is hidden) */}
                            {token ? (
                                <button onClick={handleLogout} className="text-red-500 font-medium">تسجيل الخروج</button>
                            ) : (
                                <Link href="/login" className="text-green-600 font-medium" onClick={() => setIsOpen(false)}>تسجيل الدخول</Link>
                            )}
                        </nav>
                    )}
                </div>
            </header>
        </>
    )
}

export default Header
