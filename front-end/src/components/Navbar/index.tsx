import Link from "next/link"

const Navbar = () => {
    return (
        <>
            <nav className="hidden md:flex items-center space-x-8">
                <Link className="text-gray-700 hover:text-blue-600 transition-colors capitalize" href={"/about"}>الصفحة الرئيسية</Link>
                <Link className="text-gray-700 hover:text-blue-600 transition-colors capitalize" href={"/products"}>المنتجات</Link>
                <Link className="text-gray-700 hover:text-blue-600 transition-colors capitalize" href={"/offers"}>العروض</Link>
                <Link className="text-gray-700 hover:text-blue-600 transition-colors capitalize" href={"/contact"}>تواصل معنا</Link>
            </nav>
        </>
    )
}

export default Navbar
