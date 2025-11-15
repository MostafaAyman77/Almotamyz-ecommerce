
import Link from 'next/link'
import React from 'react'

const Header = () => {
  return (
    <>
      <header>
        <nav className='stiicky top-0 z-50 bg-white shadow'>
          <div className='container mx-auto flex justify-between item-center px-4 py-4'>
          <Link className='hover:text-blue-600' href="/">المتميز للمعدات</Link>
          <div className='hidden md:flex space-x-6'>
            <Link href="/">الرئيسية</Link>
            <Link href="/products">المنتجات</Link>
            <Link href="/offers" className='hover:text-blue-600'>العروض</Link>
            <Link href="/about-us" className='hover:text-blue-600'>من نحن</Link>
            <Link href="/contact-us" className='hover:text-blue-600'>الاتصال بنا</Link>
          </div>
          <div className="flex item-center space-x-4"></div>
          </div>
        </nav>
      </header>
    </>
  )
}

export default Header
