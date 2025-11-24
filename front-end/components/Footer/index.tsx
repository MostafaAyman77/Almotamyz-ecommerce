import Image from "next/image";
import Link from "next/link";

const Footer = () => {
    return (
        <div className="mt-16 flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between md:gap-0 bg-gray-800 p-8 rounded-lg">
            <div className="flex flex-col gap-4 items-center md:items-start">
                <Link href="/" >
                    <p className='flex items-center text-white font-bold'>المتميز للمعدات</p>
                    {/* <Link href="/" className="flex items-center"> 
                        <Image src="./logo.png" alt="logo" width={120} height={40} className="w-6 h-6 md:w-9 md:h-9"/>
                    </Link> */}
                </Link>
                <p className="text-sm text-gray-400">المتميز للمعدات 2026</p>
                <p className="text-sm text-gray-400">كل الحقوق محفوظة.</p>
            </div>
            <div className="flex flex-col gap-4 text-sm text-gray-400 items-center md:items-start">
                <p className="text-sm text-amber-50 font-bold">من نحن</p>
                <Link href="/">الصفحة الرئيسية</Link>
                <Link href="/contact">تواصل معنا</Link>
                <Link href="/about">من نحن</Link>
                {/* <Link href="/"></Link> */}
            </div>
            <div className="flex flex-col gap-4 text-sm text-gray-400 items-center md:items-start">
                <p className="text-sm text-amber-50 font-bold">منتجاتنا</p>
                <Link href="/products">منتجاتنا</Link>
                <Link href="/newest">أحدث النتجات</Link>
                <Link href="/bestsales">أفضل المنتجات مبيعًا</Link>
                <Link href="/offers">العروض</Link>
            </div>
            <div className="flex flex-col gap-4 text-sm text-gray-400 items-center md:items-start">
                <p className="text-sm text-amber-50 font-bold">Links</p>
                <Link href="/">الصفحة الرئيسية</Link>
                <Link href="/contact">تواصل معنا</Link>
                <Link href="/about">من نحن</Link>
                {/* <Link href="/"></Link> */}
            </div>
        </div>
    )
}

export default Footer;