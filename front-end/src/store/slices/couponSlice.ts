import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

export interface Coupon {
    _id: string;
    name: string;
    expire: string;
    discount: number;
}

interface CouponState {
    coupons: Coupon[];
    loading: boolean;
    error: string | null;
}

const initialState: CouponState = {
    coupons: [],
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

export const fetchCoupons = createAsyncThunk(
    "coupon/fetchCoupons",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/api/v1/coupons`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const createCoupon = createAsyncThunk(
    "coupon/createCoupon",
    async (couponData: any, { rejectWithValue, getState }) => {
        try {
            const authHeader = getAuthHeader(getState);
            const response = await fetch(`${BASE_URL}/api/v1/coupons`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authHeader,
                },
                body: JSON.stringify(couponData),
            });
            const data = await response.json();
            if (!response.ok) {
                const errors = data.errors ? data.errors.map((e: any) => e.msg).join(", ") : null;
                throw new Error(errors || data.message || "Failed to create coupon");
            }
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateCoupon = createAsyncThunk(
    "coupon/updateCoupon",
    async ({ id, data }: { id: string; data: any }, { rejectWithValue, getState }) => {
        try {
            const authHeader = getAuthHeader(getState);
            const response = await fetch(`${BASE_URL}/api/v1/coupons/${id}`, {
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
                throw new Error(errors || resData.message || "Failed to update coupon");
            }
            return resData.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteCoupon = createAsyncThunk(
    "coupon/deleteCoupon",
    async (id: string, { rejectWithValue, getState }) => {
        try {
            const authHeader = getAuthHeader(getState);
            const response = await fetch(`${BASE_URL}/api/v1/coupons/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: authHeader,
                },
            });

            if (response.status === 204) {
                return id;
            }

            if (!response.ok) {
                const data = await response.json().catch(() => ({ message: "Failed to delete coupon" }));
                throw new Error(data.message || "Failed to delete coupon");
            }
            await response.json();
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const couponSlice = createSlice({
    name: "coupon",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch
        builder
            .addCase(fetchCoupons.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCoupons.fulfilled, (state, action) => {
                state.loading = false;
                state.coupons = action.payload;
            })
            .addCase(fetchCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Create
        builder
            .addCase(createCoupon.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCoupon.fulfilled, (state, action) => {
                state.loading = false;
                state.coupons.push(action.payload);
            })
            .addCase(createCoupon.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Update
        builder
            .addCase(updateCoupon.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCoupon.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.coupons.findIndex(c => c._id === action.payload._id);
                if (index !== -1) {
                    state.coupons[index] = action.payload;
                }
            })
            .addCase(updateCoupon.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Delete
        builder
            .addCase(deleteCoupon.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCoupon.fulfilled, (state, action) => {
                state.loading = false;
                state.coupons = state.coupons.filter(c => c._id !== action.payload);
            })
            .addCase(deleteCoupon.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default couponSlice.reducer;
