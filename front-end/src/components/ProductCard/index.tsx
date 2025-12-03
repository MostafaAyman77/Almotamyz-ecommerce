"use client";

import {
  addToCart,
  addToFavorite,
  removeFromFavorites,
} from "@/store/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { FaRegHeart, FaHeart, FaShoppingCart } from "react-icons/fa";
import Link from "next/link";

export default function ProductCard({ item }: any) {
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.cart.favorites);

  const isFavorite = favorites.some((i) => i.id === item.id);

  return (
    <Link href={`/`}>
        <div
            className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col"
        >
            {/* Image */}
            <div className="relative h-40 bg-gray-100 flex items-center justify-center">
                <img
                src={item.images?.[0]}
                alt=""
                className="w-full h-full object-cover"
                />

                {/* Favorite Icon */}
                <button
                    onClick={() =>
                        isFavorite
                        ? dispatch(removeFromFavorites(item.id))
                        : dispatch(addToFavorite(item))
                    }
                    className="absolute top-3 right-3 text-gray-700 bg-white p-2 rounded-full shadow"
                >
                    {isFavorite ? (
                        <FaHeart className="" style={{color: "var(--primary-color)"}} />
                    ) : (
                        <FaRegHeart className="text-gray-600" />
                    )}
                </button>

                {/* Category Badge */}
                {/* <span className="absolute top-3 left-3 bg-green-600 text-white text-xs px-3 py-1 rounded-lg">
                الكترونيات
                </span> */}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-2 flex-grow">

                {/* Title */}
                <h3 className="text-sm font-medium text-gray-800">{item.title}</h3>

                {/* Details (one line under title) */}
                <p className="text-xs text-gray-500 truncate">
                    {item.description || "تفاصيل المنتج"}
                </p>

                {/* Price */}
                <p className="text-green-600 font-bold text-lg">{item.price} ج م</p>

                {/* Add to Cart Button */}
                <button
                    onClick={() => dispatch(addToCart(item))}
                    className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer"
                >
                    <span>أضف للسلة</span>
                    <FaShoppingCart size={16} />
                </button>
            </div>
        </div>
    </Link>
  );
}
