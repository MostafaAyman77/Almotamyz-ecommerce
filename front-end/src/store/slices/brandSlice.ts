import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

interface Brand {
    _id: string;
    name: string;
    slug: string;
    image?: string;
    createdAt: string;
    updatedAt: string;
}

interface BrandState {
    brands: Brand[];
    loading: boolean;
    error: string | null;
    selectedBrand: Brand | null;
}

const initialState: BrandState = {
    brands: [],
    loading: false,
    error: null,
    selectedBrand: null,
};



// Async Thunks
export const fetchBrands = createAsyncThunk(
    "brand/fetchBrands",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/api/v1/brands`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to fetch brands");
            return data.data; // Assuming response structure { data: [...] }
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

export const createBrand = createAsyncThunk(
    "brand/createBrand",
    async (brandData: { name: string; image?: string }, { rejectWithValue, getState }) => {
        try {
            const authHeader = getAuthHeader(getState);
            const response = await fetch(`${BASE_URL}/api/v1/brands`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authHeader,
                },
                body: JSON.stringify(brandData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to create brand");
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateBrand = createAsyncThunk(
    "brand/updateBrand",
    async ({ id, data }: { id: string; data: { name?: string; image?: string } }, { rejectWithValue, getState }) => {
        try {
            const authHeader = getAuthHeader(getState);
            const response = await fetch(`${BASE_URL}/api/v1/brands/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authHeader,
                },
                body: JSON.stringify(data),
            });
            const resData = await response.json();
            if (!response.ok) throw new Error(resData.message || "Failed to update brand");
            return resData.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteBrand = createAsyncThunk(
    "brand/deleteBrand",
    async (id: string, { rejectWithValue, getState }) => {
        try {
            const authHeader = getAuthHeader(getState);
            const response = await fetch(`${BASE_URL}/api/v1/brands/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: authHeader,
                },
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to delete brand");
            }
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const brandSlice = createSlice({
    name: "brand",
    initialState,
    reducers: {
        setSelectedBrand: (state, action: PayloadAction<Brand | null>) => {
            state.selectedBrand = action.payload;
        },
        clearBrandError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch Brands
        builder
            .addCase(fetchBrands.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBrands.fulfilled, (state, action) => {
                state.loading = false;
                state.brands = action.payload;
            })
            .addCase(fetchBrands.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Create Brand
        builder
            .addCase(createBrand.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createBrand.fulfilled, (state, action) => {
                state.loading = false;
                state.brands.push(action.payload);
            })
            .addCase(createBrand.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Update Brand
        builder
            .addCase(updateBrand.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBrand.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.brands.findIndex((b) => b._id === action.payload._id);
                if (index !== -1) {
                    state.brands[index] = action.payload;
                }
            })
            .addCase(updateBrand.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Delete Brand
        builder
            .addCase(deleteBrand.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBrand.fulfilled, (state, action) => {
                state.loading = false;
                state.brands = state.brands.filter((b) => b._id !== action.payload);
            })
            .addCase(deleteBrand.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setSelectedBrand, clearBrandError } = brandSlice.actions;
export default brandSlice.reducer;
