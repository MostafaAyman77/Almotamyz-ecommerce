import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    token: string | null;
    user: any | null; // Detailed user type should be added based on User model if available
}

const initialState: AuthState = {
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    user: typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
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
                if (action.payload.user) {
                    localStorage.setItem('user', JSON.stringify(action.payload.user));
                }
            }
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
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
