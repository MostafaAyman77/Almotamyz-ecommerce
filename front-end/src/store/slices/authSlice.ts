import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    token: string | null;
    user: any | null; // Detailed user type should be added based on User model if available
}

const initialState: AuthState = {
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    user: null, // Could also persist user data in local storage if needed, but token is key
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action: PayloadAction<{ token: string; user?: any }>) => {
            state.token = action.payload.token;
            state.user = action.payload.user || null;
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', action.payload.token);
            }
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
            }
        },
        // Optional: hydrate user if we fetch profile separately
        setUser: (state, action: PayloadAction<any>) => {
            state.user = action.payload;
        }
    },
});

export const { loginSuccess, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
