"use client"

import Link from "next/link"
import Navbar from "../Navbar"
import { IoMenu } from "react-icons/io5"
import { useEffect, useState } from "react"
import { MdClose } from "react-icons/md"
import SearchBar from "../SearchBar"
import { BsCart3 } from "react-icons/bs"
import { FaRegHeart } from "react-icons/fa"
import { useSelector } from "react-redux"

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const favoriteCount = useSelector((state: any) => state.cart.favorites.length);
    const cartCount = useSelector((state: any) => state.cart.cartItems.length);
    const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;

    return (
        <>
            <header className="fixed top-0 bg-white/95 w-full backdrop-blur-sm shadow-sm z-50">
                <div className="container mx-auto px-4 pb-2 pt-1">
                    <div className="flex items-center justify-between">
                        <Link href="/">
                            <span className="text-2xl font-bold text-gray-600"
                                style={{color: "var(--primary-color"}}
                            >
                                المتميز للمعدات
                            </span>
                        </Link>
                        <Navbar />
                        <button className="md:hidden"
                            onClick={() => setIsOpen((prev) => !prev)}
                        >
                            {isOpen ? (
                                <MdClose className="w-6 h-6" />
                            ) : (
                                <IoMenu className="w-6 h-6" />
                            )}
                        </button>

                        <div className="hidden md:flex items-center space-x-8">
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-800 text-white rounded-md"
                                style={{backgroundColor: "var(--primary-color"}}
                            >
                                <Link href={"/login"}>تسجيل الدخول</Link>
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-center mt-5">
                        <SearchBar />
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
                    </div>
                    {isOpen && (
                        <nav className="md:hidden flex items-center flex-col space-y-3 mt-4 pb-4">
                            <Link className="text-gray-700 hover:text-green-600 transition-colors capitalize" href={"/"}>الصفحة الرئيسية</Link>
                            <Link className="text-gray-700 hover:text-green-600 transition-colors capitalize" href={"/products"}>المنتجات</Link>
                            <Link className="text-gray-700 hover:text-green-600 transition-colors capitalize" href={"/offers"}>العروض</Link>
                            <Link className="text-gray-700 hover:text-green-600 transition-colors capitalize" href={"/contact"}>تواصل معنا</Link>
                        </nav>
                    )}
                </div>
            </header>
        </>
    )
}

export default Header
