import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

export interface Review {
    _id: string;
    title: string;
    ratings: number;
    user: { _id: string; name: string } | string;
    product: { _id: string; title: string } | string;
}

interface ReviewState {
    reviews: Review[];
    loading: boolean;
    error: string | null;
}

const initialState: ReviewState = {
    reviews: [],
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

export const fetchReviews = createAsyncThunk(
    "review/fetchReviews",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/api/v1/reviews`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteReview = createAsyncThunk(
    "review/deleteReview",
    async (id: string, { rejectWithValue, getState }) => {
        try {
            const authHeader = getAuthHeader(getState);
            const response = await fetch(`${BASE_URL}/api/v1/reviews/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: authHeader,
                },
            });

            if (response.status === 204) {
                return id;
            }

            if (!response.ok) {
                const data = await response.json().catch(() => ({ message: "Failed to delete review" }));
                throw new Error(data.message || "Failed to delete review");
            }
            await response.json();
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const reviewSlice = createSlice({
    name: "review",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch
        builder
            .addCase(fetchReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload;
            })
            .addCase(fetchReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Delete
        builder
            .addCase(deleteReview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = state.reviews.filter(r => r._id !== action.payload);
            })
            .addCase(deleteReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default reviewSlice.reducer;
