"use client";

import { Search } from 'lucide-react';

const SearchBar = () => {
    return (
        <div className="relative sm:flex w-full md:w-3/4 lg:w-1/2 mx-auto">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-15 text-gray-500 z-10" />
            <input 
                id="search" 
                placeholder="ابحث عن..."  
                className="w-full rounded-md ring-1 ring-gray-200 px-8 py-1 shadow-md text-sm outline-0"
            />
        </div>
    )
}

export default SearchBar;