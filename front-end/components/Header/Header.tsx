
import Link from 'next/link'
import React from 'react'
import SearchBar from '../SearchBar'
import { Bell, Home, ShoppingCart } from 'lucide-react'

const Header = () => {
  return (
    <>
        <nav className="w-full flex items-center justify-between border-b-2 border-gray-200 pb-4">
          {/* RIGHT */}
          <Link className='flex items-center' href="/">المتميز للمعدات</Link>
          {/* <Link href="/" className="flex items-center"> 
            <Image src="./logo.png" alt="logo" width={120} height={40} className="w-6 h-6 md:w-9 md:h-9"/>
          </Link> */}

          {/* LEFT */}
          <div className='flex items-center gap-6'>
            <SearchBar />
            <Link href="/">
              <Home className='w-4 h-4 text-gray-600'/>
            </Link>
            <Link href="/notifications">
              <Bell className='w-4 h-4 text-gray-600' />
            </Link>
            <Link href="cart">
              <ShoppingCart className='w-4 h-4 text-gray-600' />
            </Link>
            <Link href="/login">تسجيل الدخول</Link>
          </div>
          <div className="flex item-center space-x-4"></div>
        </nav>
    </>
  )
}

export default Header
