import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    user: any | null;
}

const initialState: AuthState = {
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
    user: typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action: PayloadAction<{ token: string; refreshToken?: string; user?: any }>) => {
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken || null;
            state.user = action.payload.user || null;
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', action.payload.token);
                if (action.payload.refreshToken) {
                    localStorage.setItem('refreshToken', action.payload.refreshToken);
                }
                if (action.payload.user) {
                    localStorage.setItem('user', JSON.stringify(action.payload.user));
                }
            }
        },
        logout: (state) => {
            state.token = null;
            state.refreshToken = null;
            state.user = null;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
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
