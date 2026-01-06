"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface Product {
  id: string;
  title: string;
  images: string[];
  price: number;
  quantity?: number;
}

interface CartState {
  cartItems: Product[];
  favorites: Product[];
}

const initialState: CartState = {
  cartItems:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("cartItems") || "[]")
      : [],
  favorites:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("favoritesItems") || "[]")
      : [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Product>) {

      const exist = state.cartItems.find(
        (item) => item.id === action.payload.id
      );

      if (!exist) {
        state.cartItems.push({ ...action.payload, quantity: 1 });
        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      }
    },

    removeFromCart(state, action: PayloadAction<string>) {
      state.cartItems = state.cartItems.filter((i) => i.id !== action.payload);
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    clearCart(state) {
      state.cartItems = [];
      localStorage.removeItem("cartItems");
    },

    increaseQuantity(state, action: PayloadAction<string>) {
      state.cartItems = state.cartItems.map((item) =>
        item.id === action.payload
          ? { ...item, quantity: item.quantity! + 1 }
          : item
      );

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    decreaseQuantity(state, action: PayloadAction<string>) {
      state.cartItems = state.cartItems.map((item) =>
        item.id === action.payload && item.quantity! > 1
          ? { ...item, quantity: item.quantity! - 1 }
          : item
      );

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    addToFavorite(state, action: PayloadAction<Product>) {
      if (!state.favorites.some((i) => i.id === action.payload.id)) {
        state.favorites.push(action.payload);
        localStorage.setItem(
          "favoritesItems",
          JSON.stringify(state.favorites)
        );
      }
    },

    removeFromFavorites(state, action: PayloadAction<string>) {
      state.favorites = state.favorites.filter((i) => i.id !== action.payload);
      localStorage.setItem(
        "favoritesItems",
        JSON.stringify(state.favorites)
      );
    },
  },
});
export const cartTotalPrice = (state: RootState) =>
  state.cart.cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity!,
    0
  );


export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  addToFavorite,
  removeFromFavorites,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
