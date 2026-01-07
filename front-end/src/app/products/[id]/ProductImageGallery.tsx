"use client";

import { useState } from "react";

interface ProductImageGalleryProps {
    images: string[];
    title: string;
}

export default function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(images[0]);

    if (!images || images.length === 0) {
        return (
            <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center text-gray-400">
                لا توجد صورة
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden shadow-inner group">
                <img
                    src={selectedImage}
                    alt={title}
                    className="w-full h-full object-contain transition-all duration-300 group-hover:scale-105"
                />
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedImage(image)}
                            className={`relative h-20 aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all duration-200 outline-none
                ${selectedImage === image
                                    ? "border-green-500 ring-2 ring-green-100 shadow-md"
                                    : "border-gray-200 hover:border-green-300 hover:shadow-sm"}`}
                        >
                            <img
                                src={image}
                                alt={`${title} - ${index + 1}`}
                                className={`w-full h-full object-cover transition-opacity duration-200 ${selectedImage === image ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
