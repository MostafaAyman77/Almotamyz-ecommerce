import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import authReducer from "./slices/authSlice";
import brandReducer from "./slices/brandSlice";
import productReducer from "./slices/productSlice";
import categoryReducer from "./slices/categorySlice";
import subcategoryReducer from "./slices/subcategorySlice";
import couponReducer from "./slices/couponSlice";
import reviewReducer from "./slices/reviewSlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    brand: brandReducer,
    product: productReducer,
    category: categoryReducer,
    subcategory: subcategoryReducer,
    coupon: couponReducer,
    review: reviewReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
