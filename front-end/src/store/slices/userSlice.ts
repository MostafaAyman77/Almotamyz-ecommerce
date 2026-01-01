import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    active?: boolean;
}

interface UserState {
    users: User[];
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    users: [],
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

export const fetchUsers = createAsyncThunk(
    "user/fetchUsers",
    async (_, { rejectWithValue, getState }) => {
        try {
            const authHeader = getAuthHeader(getState);
            const response = await fetch(`${BASE_URL}/api/v1/users`, {
                headers: {
                    Authorization: authHeader,
                },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const createUser = createAsyncThunk(
    "user/createUser",
    async (userData: any, { rejectWithValue, getState }) => {
        try {
            const authHeader = getAuthHeader(getState);
            const response = await fetch(`${BASE_URL}/api/v1/users`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authHeader,
                },
                body: JSON.stringify(userData),
            });
            const data = await response.json();
            if (!response.ok) {
                const errors = data.errors ? data.errors.map((e: any) => e.msg).join(", ") : null;
                throw new Error(errors || data.message || "Failed to create user");
            }
            return data.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateUser = createAsyncThunk(
    "user/updateUser",
    async ({ id, data }: { id: string; data: any }, { rejectWithValue, getState }) => {
        try {
            const authHeader = getAuthHeader(getState);
            const response = await fetch(`${BASE_URL}/api/v1/users/${id}`, {
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
                throw new Error(errors || resData.message || "Failed to update user");
            }
            return resData.data;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteUser = createAsyncThunk(
    "user/deleteUser",
    async (id: string, { rejectWithValue, getState }) => {
        try {
            const authHeader = getAuthHeader(getState);
            const response = await fetch(`${BASE_URL}/api/v1/users/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: authHeader,
                },
            });

            if (response.status === 204) {
                return id;
            }

            if (!response.ok) {
                const data = await response.json().catch(() => ({ message: "Failed to delete user" }));
                throw new Error(data.message || "Failed to delete user");
            }
            await response.json();
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // Fetch
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Create
        builder
            .addCase(createUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users.push(action.payload);
            })
            .addCase(createUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Update
        builder
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.users.findIndex(u => u._id === action.payload._id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Delete
        builder
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
                state.users = state.users.filter(u => u._id !== action.payload);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default userSlice.reducer;
