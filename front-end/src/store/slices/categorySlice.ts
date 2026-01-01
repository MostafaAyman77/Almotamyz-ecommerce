import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

interface Category {
    _id: string;
    name: string;
}

interface SubCategory {
    _id: string;
    name: string;
    category: string;
}

interface CategoryState {
    categories: Category[];
    subcategories: SubCategory[];
    loading: boolean;
    error: string | null;
}

const initialState: CategoryState = {
    categories: [],
    subcategories: [],
    loading: false,
    error: null,
};

export const fetchCategories = createAsyncThunk(
    "category/fetchCategories",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/api/v1/categories`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchSubCategories = createAsyncThunk(
    "category/fetchSubCategories",
    async (categoryId: string | null = null, { rejectWithValue }) => {
        try {
            // If categoryId is provided, fetch subcategories for that category
            // Endpoint might vary based on backend. Usually /api/v1/categories/:id/subcategories or /api/v1/subcategories?category=:id
            // Based on typical structure:
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

const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
            })
            .addCase(fetchSubCategories.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSubCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.subcategories = action.payload;
            });
    },
});

export default categorySlice.reducer;
