"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Product {
  id: number;
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
      state.cartItems.push({ ...action.payload, quantity: 1 });
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    removeFromCart(state, action: PayloadAction<number>) {
      state.cartItems = state.cartItems.filter((i) => i.id !== action.payload);
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    increaseQuantity(state, action: PayloadAction<number>) {
      state.cartItems = state.cartItems.map((item) =>
        item.id === action.payload
          ? { ...item, quantity: item.quantity! + 1 }
          : item
      );

      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },

    decreaseQuantity(state, action: PayloadAction<number>) {
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

    removeFromFavorites(state, action: PayloadAction<number>) {
      state.favorites = state.favorites.filter((i) => i.id !== action.payload);
      localStorage.setItem(
        "favoritesItems",
        JSON.stringify(state.favorites)
      );
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  addToFavorite,
  removeFromFavorites,
} = cartSlice.actions;

export default cartSlice.reducer;
