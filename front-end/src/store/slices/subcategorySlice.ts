import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

export interface SubCategory {
    _id: string;
    name: string;
    slug?: string;
    category: string | { _id: string; name: string; slug?: string }; // Can be ID or populated object
}

interface SubCategoryState {
    subcategories: SubCategory[];
    loading: boolean;
    error: string | null;
}

const initialState: SubCategoryState = {
    subcategories: [],
    loading: false,
    error: null,
};

// Helper to get auth header
const getAuthHeader = (getState: any) => {
    const { auth } = getState();
    const token = auth.token;
    const role = auth.user?.role || 'user';
    return `${role} ${token}`;
};

export const fetchSubCategories = createAsyncThunk(
    "subcategory/fetchSubCategories",
    async (categoryId: string | null = null, { rejectWithValue }) => {
        try {
            const url = categoryId
                ? `${BASE_URL}/api/v1/categories/${categoryId}/subcategories`
                : `${BASE_URL}/api/v1/subcategories`;

            const response = await fetch(url);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const createSubCategory = createAsyncThunk(
    "subcategory/createSubCategory",
    async (subCategoryData: any, { rejectWithValue, getState }) => {
        try {
            const authHeader = getAuthHeader(getState);
            // Typically POST to /api/v1/subcategories or /api/v1/categories/:id/subcategories
            // Let's assume /api/v1/subcategories and body has category ID
            const response = await fetch(`${BASE_URL}/api/v1/subcategories`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authHeader,
                },
                body: JSON.stringify(subCategoryData),
            });
            const data = await response.json();
            if (!response.ok) {
                const errors = data.errors ? data.errors.map((e: any) => e.msg).join(", ") : null;
                throw new Error(errors || data.message || "Failed to create subcategory");
            }
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateSubCategory = createAsyncThunk(
    "subcategory/updateSubCategory",
    async ({ id, data }: { id: string; data: any }, { rejectWithValue, getState }) => {
        try {
            const authHeader = getAuthHeader(getState);
            const response = await fetch(`${BASE_URL}/api/v1/subcategories/${id}`, {
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
                throw new Error(errors || resData.message || "Failed to update subcategory");
            }
            return resData.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteSubCategory = createAsyncThunk(
    "subcategory/deleteSubCategory",
    async (id: string, { rejectWithValue, getState }) => {
        try {
            const authHeader = getAuthHeader(getState);
            const response = await fetch(`${BASE_URL}/api/v1/subcategories/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: authHeader,
                },
            });

            if (response.status === 204) {
                return id;
            }

            if (!response.ok) {
                const data = await response.json().catch(() => ({ message: "Failed to delete subcategory" }));
                throw new Error(data.message || "Failed to delete subcategory");
            }
            await response.json();
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const subcategorySlice = createSlice({
    name: "subcategory",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch
        builder
            .addCase(fetchSubCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSubCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.subcategories = action.payload;
            })
            .addCase(fetchSubCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Create
        builder
            .addCase(createSubCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createSubCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.subcategories.push(action.payload);
            })
            .addCase(createSubCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Update
        builder
            .addCase(updateSubCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateSubCategory.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.subcategories.findIndex(s => s._id === action.payload._id);
                if (index !== -1) {
                    state.subcategories[index] = action.payload;
                }
            })
            .addCase(updateSubCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Delete
        builder
            .addCase(deleteSubCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteSubCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.subcategories = state.subcategories.filter(s => s._id !== action.payload);
            })
            .addCase(deleteSubCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default subcategorySlice.reducer;
