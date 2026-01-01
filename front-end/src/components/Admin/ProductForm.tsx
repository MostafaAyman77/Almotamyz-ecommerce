"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchBrands } from "@/store/slices/brandSlice";
import { fetchCategories, fetchSubCategories } from "@/store/slices/categorySlice";
import { AppDispatch, RootState } from "@/store/store";
import toast from "react-hot-toast";
import { FaPlus, FaTimes } from "react-icons/fa";

interface ProductFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    isEdit?: boolean;
}

export default function ProductForm({ initialData, onSubmit, isEdit = false }: ProductFormProps) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const { brands } = useSelector((state: RootState) => state.brand);
    const { categories, subcategories } = useSelector((state: RootState) => state.category);
    const { loading } = useSelector((state: RootState) => state.product);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        quantity: 0,
        price: 0,
        priceAfterDiscount: 0,
        imageCover: "",
        category: "",
        subcategory: "",
        brand: "",
        images: [] as string[]
    });

    const [newImage, setNewImage] = useState("");

    useEffect(() => {
        dispatch(fetchBrands());
        dispatch(fetchCategories());
    }, [dispatch]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || "",
                description: initialData.description || "",
                quantity: initialData.quantity || 0,
                price: initialData.price || 0,
                priceAfterDiscount: initialData.priceAfterDiscount || 0,
                imageCover: initialData.imageCover || "",
                // Handle varying populate structures (object or string id)
                category: initialData.category?._id || initialData.category || "",
                subcategory: initialData.subcategory?._id || initialData.subcategory || "",
                brand: initialData.brand?._id || initialData.brand || "",
                images: initialData.images || []
            });

            // If category is present, fetch subcategories
            const catId = initialData.category?._id || initialData.category;
            if (catId) {
                dispatch(fetchSubCategories(catId));
            }
        }
    }, [initialData, dispatch]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const catId = e.target.value;
        setFormData(prev => ({ ...prev, category: catId, subcategory: "" }));
        if (catId) {
            dispatch(fetchSubCategories(catId));
        }
    };

    const addImage = () => {
        if (newImage && !formData.images.includes(newImage)) {
            setFormData(prev => ({ ...prev, images: [...prev.images, newImage] }));
            setNewImage("");
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.subcategory) {
            toast.error("يرجى اختيار القسم الفرعي");
            return;
        }
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-sm w-full" style={{ fontFamily: "var(--font-cairo)" }}>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-1">اسم المنتج <span className="text-red-500">*</span></label>
                    <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md"
                        required
                        minLength={3}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">الماركة <span className="text-red-500">*</span></label>
                    <select
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md"
                        required
                    >
                        <option value="">اختر الماركة</option>
                        {brands.map(b => (
                            <option key={b._id} value={b._id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">القسم الرئيسي <span className="text-red-500">*</span></label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleCategoryChange}
                        className="w-full px-4 py-2 border rounded-md"
                        required
                    >
                        <option value="">اختر القسم الرئيسي</option>
                        {categories.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">القسم الفرعي <span className="text-red-500">*</span></label>
                    <select
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md"
                        required
                        disabled={!formData.category}
                    >
                        <option value="">اختر القسم الفرعي</option>
                        {subcategories.map(s => (
                            <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">السعر <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md"
                        required
                        min={0}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">السعر بعد الخصم</label>
                    <input
                        type="number"
                        name="priceAfterDiscount"
                        value={formData.priceAfterDiscount}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md"
                        min={0}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">الكمية <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md"
                        required
                        min={0}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">صورة الغلاف (رابط) <span className="text-red-500">*</span></label>
                    <input
                        type="url"
                        name="imageCover"
                        value={formData.imageCover}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">الوصف <span className="text-red-500">*</span></label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border rounded-md"
                    required
                    minLength={20}
                />
            </div>

            {/* Images Array */}
            <div>
                <label className="block text-sm font-medium mb-1">صور إضافية</label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="url"
                        value={newImage}
                        onChange={(e) => setNewImage(e.target.value)}
                        placeholder="رابط الصورة"
                        className="flex-1 px-4 py-2 border rounded-md"
                    />
                    <button type="button" onClick={addImage} className="bg-gray-200 px-4 rounded-md"><FaPlus /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                            <img src={img} alt="preview" className="h-20 w-20 object-cover rounded-md border" />
                            <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-4 pt-4 border-t mt-6">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 text-white font-medium py-2 px-4 rounded-md transition-opacity disabled:opacity-70"
                    style={{ backgroundColor: "var(--primary-color)" }}
                >
                    {loading ? "جاري الحفظ..." : (isEdit ? "حفظ التعديلات" : "إضافة المنتج")}
                </button>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-200 transition-colors border"
                >
                    إلغاء
                </button>
            </div>

        </form>
    );
}
