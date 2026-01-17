"use client";

import Link from "next/link"
import { usePathname } from "next/navigation";

const Navbar = () => {
    const pathname = usePathname();

    const navLinks = [
        { name: "الصفحة الرئيسية", href: "/" },
        { name: "المنتجات", href: "/products" },
        { name: "العروض", href: "/offers" },
        { name: "تواصل معنا", href: "/contact" },
    ];

    return (
        <nav className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => {
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
                    >
                        {link.name}
                    </Link>
                );
            })}
        </nav>
    )
}

export default Navbar

