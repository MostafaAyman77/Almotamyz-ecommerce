import React, { Children, createContext, useEffect, useState } from "react";

export const CartContext = createContext();

export default function CartProvider({ children }) {
  // Favorites
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem("favoritesItems");
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });

  const addToFavorite = (item) => {
    setFavorites((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  useEffect(() => {
    localStorage.setItem("favoritesItems", JSON.stringify(favorites));
  }, [favorites]);

  const [cartItems, setCartItem] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Increase Quantity
  const increaseQuantity = (id) => {
    setCartItem((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };
  // Decrease Quantity
  const decreaseQuantity = (id) => {
    setCartItem((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const addToCart = (item) => {
    setCartItem((prevItems) => [...prevItems, { ...item, quantity: 1 }]);
  };

  const removeFromCart = (id) => {
    setCartItem((prevItems) => prevItems.filter((item) => item.id !== id));
  };
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const removeFromFavorites = (id) => {
    setFavorites((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        addToFavorite,
        favorites,
        removeFromFavorites,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
