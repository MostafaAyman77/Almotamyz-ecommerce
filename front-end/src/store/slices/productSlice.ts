import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

export interface Product {
    _id: string;
    title: string;
    slug: string;
    description: string;
    quantity: number;
    price: number;
    priceAfterDiscount?: number;
    imageCover?: string;
    images?: string[];
    category?: { _id: string; name: string };
    subcategory?: { _id: string; name: string } | string; // Populate handling varies
    brand?: { _id: string; name: string } | string;
    ratingsAverage?: number;
    ratingsQuantity?: number;
    createdAt: string;
}

interface ProductState {
    products: Product[];
    paginationResult: {
        currentPage: number;
        limit: number;
        numberOfPages: number;
    } | null;
    loading: boolean;
    error: string | null;
    selectedProduct: Product | null;
    deletedProducts: Product[];
}

const initialState: ProductState = {
    products: [],
    paginationResult: null,
    loading: false,
    error: null,
    selectedProduct: null,
    deletedProducts: []
};



// Async Thunks
export const fetchProducts = createAsyncThunk(
    "product/fetchProducts",
    async (queryParams: string | undefined = "", { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/api/v1/products?${queryParams}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to fetch products");
            return data; // Expected { data: [], paginationResult: {} }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

// Helper to get auth header
const getAuthHeader = (getState: any) => {
    const { auth } = getState();
    const token = auth.token;
    const role = auth.user?.role || 'user';
    return `${role} ${token}`;
};

export const createProduct = createAsyncThunk(
    "product/createProduct",
    async (productData: any, { rejectWithValue, getState }) => {
        try {
            const authHeader = getAuthHeader(getState);
            const response = await fetch(`${BASE_URL}/api/v1/products`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authHeader,
                },
                body: JSON.stringify(productData),
            });
            const data = await response.json();
            if (!response.ok) {
                const errors = data.errors ? data.errors.map((e: any) => e.msg).join(", ") : null;
                throw new Error(errors || data.message || "Failed to create product");
            }
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateProduct = createAsyncThunk(
    "product/updateProduct",
    async ({ id, data }: { id: string; data: any }, { rejectWithValue, getState }) => {
        try {
            const authHeader = getAuthHeader(getState);
            const response = await fetch(`${BASE_URL}/api/v1/products/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authHeader,
                },
                body: JSON.stringify(data),
            });
            const resData = await response.json();
            if (!response.ok) {
                const errors = resData.errors ? resData.errors.map((e: any) => e.msg).join(", ") : null;
                throw new Error(errors || resData.message || "Failed to update product");
            }
            return resData.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteProduct = createAsyncThunk(
    "product/deleteProduct",
    async (id: string, { rejectWithValue, getState }) => {
        try {
            const authHeader = getAuthHeader(getState);
            const response = await fetch(`${BASE_URL}/api/v1/products/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: authHeader,
                },
            });

            // 204 No Content means success with no body
            if (response.status === 204) {
                return id;
            }

            // Other success codes (if any) or error handling
            if (!response.ok) {
                const data = await response.json().catch(() => ({ message: "Failed to delete product (Network or Server Error)" }));
                throw new Error(data.message || "Failed to delete product");
            }

            // In case backend changes to return JSON for delete
            await response.json();
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
            state.selectedProduct = action.payload;
        },
        clearProductError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch Products
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.data;
                state.paginationResult = action.payload.paginationResult;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Create Product
        builder
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products.push(action.payload);
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Update Product
        builder
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.products.findIndex((p) => p._id === action.payload._id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Delete Product
        builder
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products = state.products.filter((p) => p._id !== action.payload);
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setSelectedProduct, clearProductError } = productSlice.actions;
export default productSlice.reducer;
