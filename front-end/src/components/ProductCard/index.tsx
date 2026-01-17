"use client";

import {
  addToFavorite,
  removeFromFavorites,
} from "@/store/slices/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import AddToCartButton from "@/components/AddToCartButton";

export default function ProductCard({ item }: any) {
  const dispatch = useDispatch();
  const router = useRouter();

  const productId = item._id || item.id;
  const productImage = item.imageCover || item.images?.[0];

  const favorites = useSelector((state: RootState) => state.cart.favorites);
  const isFavorite = favorites.some((i) => i.id === productId);


  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isFavorite) {
      dispatch(removeFromFavorites(productId));
      toast.error(`${item.title} removed from favorites`);
    } else {
      dispatch(addToFavorite({ ...item, id: productId, images: [productImage, ...(item.images || [])] }));
      toast.success(`${item.title} added to favorites`);
    }
  };

  return (
    <div
      onClick={() => router.push(`/products/${item._id}`)}
      className={"bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col cursor-pointer h-full transition-all hover:shadow-md"}
    >
      {/* Image */}
      <div className="relative h-48 bg-white flex items-center justify-center p-4">
        <img
          src={productImage}
          alt={item.title}
          className="w-full h-full object-contain"
        />

        {/* Favorite Icon */}
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 text-gray-700 bg-white p-2 rounded-full shadow hover:bg-gray-50 transition-colors"
          style={{ cursor: "pointer" }}
        >
          {isFavorite ? (
            <FaHeart style={{ color: "var(--primary-color)" }} />
          ) : (
            <FaRegHeart className="text-gray-600" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-grow">
        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 h-10 mb-1">
          {item.title}
        </h3>

        <p className="text-xs text-gray-500 line-clamp-1 h-4 mb-2">
          {item.description || "أجهزة ومعدات متميزة"}
        </p>

        <div className="mt-auto">
          <p className="text-green-600 font-bold text-lg mb-3">
            {item.price} ج م
          </p>

          <AddToCartButton
            product={{
              ...item,
              _id: productId,
              imageCover: productImage,
            }}
            variant="compact"
          />
        </div>
      </div>
    </div>
  );
}
